// Abstract base class for all scrapers
// =============================================================

import { ProductService } from '../product/product.service';
import { ScrapingHistoryService } from '../scraping-history/scraping-history.service';
import { Product, ScrapingResult, createAppContext, createScrapingSession, finishScrapingSession, processProducts } from './scraper_utils';

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
  protected session: any;
  protected startTime!: Date;
  protected totalCategories: number = 0;

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
   * Main scraping orchestration method
   */
  async run(): Promise<void> {
    try {
      // Initialize NestJS context
      const { app, productsService, scrapingHistoryService } = await createAppContext();
      this.productsService = productsService;
      this.scrapingHistoryService = scrapingHistoryService;

      // Create scraping session
      const { session, startTime } = await createScrapingSession(this.scraperName, scrapingHistoryService);
      this.session = session;
      this.startTime = startTime;

      // Initialize scraper-specific setup
      await this.initialize();

      // Get categories to scrape
      const categories = this.getCategories();
      this.totalCategories = categories.length;
      console.log(`Found ${categories.length} categories to scan.`);

      let totalNew = 0;
      let totalUpdated = 0;
      let categoriesScanned = 0;

      // Process each category
      for (let i = 0; i < categories.length; i++) {
        const category = categories[i];
        console.log(`Scanning category ${category.name} – ${i + 1}/${categories.length}`);
        
        try {
          const products = await this.scrapeCategory(category);
          console.log(`Found ${products.length} products in ${category.name}`);
          
          // Process and save products
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

      // Finish scraping session
      await finishScrapingSession(
        this.session,
        totalNew,
        totalUpdated,
        this.startTime,
        this.scraperName,
        this.scrapingHistoryService
      );

      await app.close();
      
    } catch (error) {
      console.error(`❌ ${this.scraperName} scraper failed:`, error);
      throw error;
    }
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
    return {
      ...data,
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