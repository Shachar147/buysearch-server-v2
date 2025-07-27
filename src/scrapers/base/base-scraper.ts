// Abstract base class for all scrapers
// =============================================================

import { SourceService } from 'src/source/source.service';
import { ProductService } from '../../product/product.service';
import { ScrapingHistoryService } from '../../scraping-history/scraping-history.service';
import { Product, createAppContext, createScrapingSession, extractCategory, finishScrapingSession, normalizeCategories, processProducts, updateSourceScraperPath } from './scraper_utils';
import { getBrowserManager, cleanupBrowserManager, setupEmergencyCleanup } from './browser-manager';

export interface Category {
  id: string | number;
  name: string;
  gender: string;
  additionalFilters?: object; // { department_level: { eq: MEN } }
  [key: string]: any; // Allow additional properties
}

export abstract class BaseScraper {
  protected abstract readonly scraperName: string;
  protected abstract readonly source: string;
  
  protected productsService!: ProductService;
  protected scrapingHistoryService!: ScrapingHistoryService;
  protected sourceService: SourceService;
  protected session: any;
  protected startTime!: Date;
  protected totalCategories: number = 0;
  protected browserManager = getBrowserManager();

  /**
   * Get the list of categories to scrape
   */
  protected abstract getCategories(): Category[];

  /**
   * Scrape a single category and return products
   */
  protected abstract scrapeCategory(category: Category): Promise<Product[]>;

  /**
   * Optional: Initialize any scraper-specific setup (cookies, etc.)
   */
  protected async initialize(): Promise<void> {
    // Override in subclasses if needed
  }

  /**
   * Optional: Clean up any scraper-specific resources
   */
  protected async cleanup(): Promise<void> {
    // Override in subclasses if needed
  }

  /**
   * Get browser manager for this scraper
   */
  protected getBrowserManager() {
    return this.browserManager;
  }

  /**
   * Main scraping orchestration method
   */
  async run(): Promise<void> {
    let totalNew = 0;
    let totalUpdated = 0;
    const allScrapedUrls: Set<string> = new Set();
    try {
      // Initialize NestJS context
      const { app, productsService, scrapingHistoryService, sourceService } = await createAppContext();
      this.productsService = productsService;
      this.scrapingHistoryService = scrapingHistoryService;
      this.sourceService = sourceService;

      // Create scraping session
      const { session, startTime } = await createScrapingSession(this.scraperName, scrapingHistoryService);
      this.session = session;
      this.startTime = startTime;

      // Initialize scraper-specific setup
      await this.initialize();

      // Get categories to scrape
      const categories = this.getCategories();
      // Shuffle categories
      for (let i = categories.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [categories[i], categories[j]] = [categories[j], categories[i]];
      }
      this.totalCategories = categories.length;
      console.log(`Found ${categories.length} categories to scan.`);

      let categoriesScanned = 0;

      // Process each category
      for (let i = 0; i < categories.length; i++) {
        const category = categories[i];
        console.log(`Scanning category ${category.name} – ${i + 1}/${categories.length}`);
        try {
          const products = await this.scrapeCategory(category);
          console.log(`Found ${products.length} products in ${category.name}`);

          // Collect scraped URLs
          products.forEach(p => allScrapedUrls.add(p.url));

          // Process and save products
          console.log(`Start adding these products to BuySearch...`);
          const result = await processProducts(products, this.productsService);

          totalNew += result.created;
          totalUpdated += result.updated;
          categoriesScanned = i + 1;

          // Calculate progress percentage
          const progressPercentage = Math.round((categoriesScanned / this.totalCategories) * 100);

          // Update scraping progress with percentage
          await this.scrapingHistoryService.updateScrapingProgress(
            this.session.id, 
            totalNew, 
            totalUpdated,
            progressPercentage
          );

          console.log(`${this.scraperName}: ${result.created} CREATED, ${result.updated} UPDATED for category ${category.name} (${categoriesScanned}/${this.totalCategories} categories completed - ${progressPercentage}%)`);

        } catch (error) {
          console.warn(`⚠️  Failed category ${category.name}: ${error.message}`);
          // Still increment progress even if category failed
          categoriesScanned = i + 1;
          const progressPercentage = Math.round((categoriesScanned / this.totalCategories) * 100);
          await this.scrapingHistoryService.updateScrapingProgress(
            this.session.id, 
            totalNew, 
            totalUpdated,
            progressPercentage
          );
        }
      }

      // Clean up scraper-specific resources
      await this.cleanup();

      // Clean up browser resources
      await this.browserManager.cleanup();

      // Fetch all DB URLs and IDs for this source
      const dbUrlIdPairs = await this.productsService.getAllUrlsAndIdsBySource(this.source);
      const missingIds = dbUrlIdPairs.filter(({ url }) => !allScrapedUrls.has(url)).map(({ id }) => id);
      const missingItems = missingIds.length;
      const totalItems = allScrapedUrls.size;

      if (missingIds.length > 0) {
        console.log(`Missing item DB IDs (not found in scrape):`, missingIds);
      }

      // Update source scraper path
      await updateSourceScraperPath(this.source, this.sourceService);

      // Finish scraping session
      if (totalNew + totalUpdated > 0) {
        await finishScrapingSession(
          this.session,
          totalNew,
          totalUpdated,
          this.startTime,
          this.scraperName,
          this.scrapingHistoryService,
          totalItems,
          missingItems
        );
      } else {
        
        // if we scraped nothing, mark session as failed
        await this.scrapingHistoryService.failScrapingSession(
          this.session.id,
          totalNew,
          totalUpdated
        );
      }

      await app.close();
      
    } catch (error) {
      console.error(`❌ ${this.scraperName} scraper failed:`, error);
      if (this.scrapingHistoryService && this.session) {
        await this.scrapingHistoryService.failScrapingSession(
          this.session.id,
          totalNew,
          totalUpdated
        );
      }

      // Update source scraper path
      await updateSourceScraperPath(this.source, this.sourceService);

      // Clean up browser resources on error
      await this.browserManager.cleanup();

      throw error;
    }
  }

  /**
   * Run the scraper with signal handling: marks session as failed if interrupted (SIGINT/SIGTERM)
   */
  public async runWithSignalHandling() {
    // Set up emergency cleanup for browser resources
    setupEmergencyCleanup();
    
    let interrupted = false;
    const handleInterrupt = async () => {
      if (interrupted) return;
      interrupted = true;
      console.error('\nScraper interrupted. Marking session as failed...');
      try {
        if (this.scrapingHistoryService && this.session) {
          await this.scrapingHistoryService.failScrapingSession(
            this.session.id,
            0, // created
            0  // updated
          );
          console.error('Session marked as failed.');
        }
        // Clean up browser resources
        await this.browserManager.cleanup();
      } catch (err) {
        console.error('Failed to mark session as failed:', err);
      } finally {
        process.exit(1);
      }
    };
    process.on('SIGINT', handleInterrupt);
    process.on('SIGTERM', handleInterrupt);
    await this.run();
  }

  /**
   * Helper method to create a product object with common fields
   */
  protected createProduct(data: {
    title: string;
    url: string;
    images: string[];
    colors: string[];
    price: number | null;
    oldPrice: number | null;
    salePercent: number | null;
    currency: string;
    brand: string;
    categories: string[];
    gender: string;
    isSellingFast?: boolean;
  }): Product {

     // Extract categories from both the raw categories and the product title
     const extractedFromTitle = extractCategory(data.title);
     const categories = normalizeCategories(Array.from(new Set([...data.categories, ...extractedFromTitle])));
    //  console.log("heree", {
    //      title: data.title,
    //      rawCategories: data.categories, extractedFromTitle, categories
    //  });

    return {
      ...data,
      categories,
      isSellingFast: data.isSellingFast ?? false,
      source: this.source,
    };
  }

  /**
   * Helper method to log progress
   */
  protected logProgress(message: string): void {
    console.log(`${this.scraperName}: ${message}`);
  }

  /**
   * Helper method to log warnings
   */
  protected logWarning(message: string): void {
    console.warn(`⚠️  ${this.scraperName}: ${message}`);
  }

  /**
   * Helper method to log errors
   */
  protected logError(message: string, error?: any): void {
    console.error(`❌ ${this.scraperName}: ${message}`, error || '');
  }
} 