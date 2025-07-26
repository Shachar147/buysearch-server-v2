import puppeteer from 'puppeteer-extra';
import * as cheerio from 'cheerio';
import { BaseScraper, Category as CategoryType } from './base/base-scraper';
import { Category } from '../category.constants';
import { Product, calcSalePercent, normalizeBrandName, extractColorsWithHebrew, extractCategory, normalizeCategories } from './base/scraper_utils';
import * as dotenv from 'dotenv';
dotenv.config();

export class NewEraScraper extends BaseScraper {
  protected readonly scraperName = 'New Era';
  protected readonly source = 'New Era';

  // Define categories for New Era
  private readonly CATEGORIES: CategoryType[] = [
    {
      id: 'men-clothing',
      name: Category.CLOTHING,
      gender: 'Men',
      url: 'https://neweracap.co.il/product-category/%d7%91%d7%92%d7%93%d7%99%d7%9d-%d7%95%d7%90%d7%a7%d7%a1%d7%a1%d7%95%d7%a8%d7%99%d7%96/%d7%91%d7%92%d7%93%d7%99%d7%9d/%d7%97%d7%95%d7%9c%d7%a6%d7%95%d7%aa-%d7%a7%d7%a6%d7%a8%d7%95%d7%aa-%d7%95%d7%92%d7%95%d7%a4%d7%99%d7%95%d7%aa/'
    },
    {
      id: 'men-headwear',
      name: Category.HATS,
      gender: 'Men',
      url: 'https://neweracap.co.il/product-category/headwear/'
    },
    {
      id: 'women-clothing',
      name: Category.CLOTHING,
      gender: 'Women',
      url: 'https://neweracap.co.il/product-category/women/%d7%91%d7%99%d7%92%d7%95%d7%93-%d7%95%d7%90%d7%a7%d7%a1%d7%a1%d7%95%d7%a8%d7%99%d7%96-women/'
    },
    {
      id: 'men-sweaters',
      name: Category.SWEATERS,
      gender: 'Men',
      url: 'https://neweracap.co.il/product-category/%d7%91%d7%92%d7%93%d7%99%d7%9d-%d7%95%d7%90%d7%a7%d7%a1%d7%a1%d7%95%d7%a8%d7%99%d7%96/%d7%91%d7%92%d7%93%d7%99%d7%9d/%d7%a1%d7%95%d7%95%d7%98%d7%a9%d7%99%d7%a8%d7%98%d7%99%d7%9d-%d7%95%d7%a7%d7%a4%d7%95%d7%a6%d7%95%d7%a0%d7%99%d7%9d/'
    },
    {
      id: 'men-jackets',
      name: Category.JACKETS_COATS,
      gender: 'Men',
      url: 'https://neweracap.co.il/product-category/%d7%91%d7%92%d7%93%d7%99%d7%9d-%d7%95%d7%90%d7%a7%d7%a1%d7%a1%d7%95%d7%a8%d7%99%d7%96/%d7%91%d7%92%d7%93%d7%99%d7%9d/%d7%92%d7%a7%d7%98%d7%99%d7%9d-%d7%95%d7%9e%d7%a2%d7%99%d7%9c%d7%99%d7%9d/'
    },
    {
      id: 'men-long-pants',
      name: Category.PANTS,
      gender: 'Men',
      url: 'https://neweracap.co.il/product-category/%d7%91%d7%92%d7%93%d7%99%d7%9d-%d7%95%d7%90%d7%a7%d7%a1%d7%a1%d7%95%d7%a8%d7%99%d7%96/%d7%91%d7%92%d7%93%d7%99%d7%9d/%d7%9e%d7%9b%d7%a0%d7%a1%d7%99%d7%99%d7%9d-%d7%90%d7%a8%d7%95%d7%9b%d7%99%d7%9d-%d7%91%d7%92%d7%93%d7%99%d7%9d/'
    },
    {
      id: 'men-shorts',
      name: Category.SHORTS,
      gender: 'Men',
      url: 'https://neweracap.co.il/product-category/%d7%91%d7%92%d7%93%d7%99%d7%9d-%d7%95%d7%90%d7%a7%d7%a1%d7%a1%d7%95%d7%a8%d7%99%d7%96/%d7%91%d7%92%d7%93%d7%99%d7%9d/%d7%9e%d7%9b%d7%a0%d7%a1%d7%99%d7%99%d7%9d-%d7%a7%d7%a6%d7%a8%d7%99%d7%9d-%d7%91%d7%92%d7%93%d7%99%d7%9d/'
    },
    {
      id: 'accessories',
      name: Category.ACCESSORIES,
      gender: 'Unisex',
      url: 'https://neweracap.co.il/product-category/%d7%91%d7%92%d7%93%d7%99%d7%9d-%d7%95%d7%90%d7%a7%d7%a1%d7%a1%d7%95%d7%a8%d7%99%d7%96/%d7%90%d7%a7%d7%a1%d7%a1%d7%95%d7%a8%d7%99%d7%96/%d7%aa%d7%99%d7%a7%d7%99%d7%9d/'
    },
    {
      id: 'sale',
      name: 'Sale',
      gender: 'Men',
      url: 'https://neweracap.co.il/product-category/sale/'
    }
  ];

  protected getCategories(): CategoryType[] {
    return this.CATEGORIES;
  }

  protected async scrapeCategory(category: CategoryType): Promise<Product[]> {
    return await this.scrapeNewEraCategory(category);
  }

  protected async initialize(): Promise<void> {
    this.logProgress('Initializing New Era scraper...');
    this.totalCategories = this.CATEGORIES.length;
  }

  private async scrapeNewEraCategory(category: CategoryType): Promise<Product[]> {
    this.logProgress(`Fetching ${category.url}`);
    
    try {
      const html = await this.fetchNewEraPage(category.url);
      const $ = cheerio.load(html);
      
      // Find all product items
      const productItems = $('.entry.product');
      
      if (productItems.length === 0) {
        this.logProgress(`No products found for category ${category.name}`);
        return [];
      }

      this.logProgress(`Found ${productItems.length} products in ${category.name}`);

      const products: Product[] = [];
      productItems.each((_, item) => {
        const product = this.parseNewEraProduct($(item), category, $);
        if (product) {
          products.push(product);
        }
      });

      this.logProgress(`Successfully parsed ${products.length} products from ${category.name}`);
      return products;
      
    } catch (error) {
      this.logError(`Error scraping category ${category.name}:`, error);
      return [];
    }
  }

  private async fetchNewEraPage(url: string): Promise<string> {
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-features=TranslateUI',
        '--disable-ipc-flooding-protection',
      ],
    });

    const page = await browser.newPage();

    // Set a realistic user agent
    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    // Set additional headers
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'he-IL,he;q=0.9,en;q=0.8',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Ch-Ua-Platform': '"macOS"',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Upgrade-Insecure-Requests': '1',
    });

    await page.setViewport({ width: 1920, height: 1080 });

    // Add a delay to simulate human behavior
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    // Wait a bit more for content to load
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Wait for products to load
    try {
      await page.waitForSelector('.entry.product', { timeout: 15000 });
    } catch (err) {
      console.log('❕ No product items found, continuing anyway');
    }

    // Scroll down to trigger lazy loading
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    const html = await page.content();
    await browser.close();
    return html;
  }

  private parseNewEraProduct(productItem: cheerio.Cheerio<any>, category: CategoryType, $: cheerio.CheerioAPI): Product | null {
    try {
      // Extract title
      const titleElement = productItem.find('.title h2 a');
      const title = titleElement.text().trim();
      
      if (!title) {
        return null;
      }

      // Extract brand (New Era is the brand)
      const brand = 'New Era';

      // Extract URL
      const url = titleElement.attr('href');

      // Extract images
      const images: string[] = [];
      const primaryImage = productItem.find('.woo-entry-image-main').attr('src');
      const secondaryImage = productItem.find('.woo-entry-image-secondary').attr('src');
      
      if (primaryImage) {
        images.push(primaryImage);
      }
      if (secondaryImage) {
        images.push(secondaryImage);
      }

      // Extract prices - New Era has different price structures
      let price: number | null = null;
      let oldPrice: number | null = null;

      // Check if this is a sale item (has del and ins tags)
      const delElement = productItem.find('.price del .woocommerce-Price-amount');
      const insElement = productItem.find('.price ins .woocommerce-Price-amount');
      
      if (delElement.length > 0 && insElement.length > 0) {
        // This is a sale item
        const delText = delElement.text().trim();
        const insText = insElement.text().trim();
        
        if (delText) {
          const delMatch = delText.replace(/[₪,]/g, '').match(/[\d.]+/);
          if (delMatch) {
            oldPrice = parseFloat(delMatch[0]);
          }
        }
        
        if (insText) {
          const insMatch = insText.replace(/[₪,]/g, '').match(/[\d.]+/);
          if (insMatch) {
            price = parseFloat(insMatch[0]);
          }
        }
      } else {
        // Regular item - single price
        const priceElement = productItem.find('.price .woocommerce-Price-amount');
        const priceText = priceElement.text().trim();
        
        if (priceText) {
          const priceMatch = priceText.replace(/[₪,]/g, '').match(/[\d.]+/);
          if (priceMatch) {
            price = parseFloat(priceMatch[0]);
          }
        }
      }

      // Skip products with no price
      if (!price) {
        return null;
      }

      // Extract product ID
      const productId = productItem.find('.additional-information').attr('data-id') || '';

      // Extract sale label (like "30%")
      const saleLabelElement = productItem.find('.br-labels-css');
      const saleLabel = saleLabelElement.text().trim();

      // Determine if on sale
      const isOnSale = oldPrice !== null && price !== null && oldPrice > price;
      const salePercent = isOnSale && oldPrice && price ? calcSalePercent(oldPrice, price) : null;

      // Extract category information
      const categoryElement = productItem.find('.additional-information');
      const productCategory = categoryElement.attr('data-category') || '';

      // Extract color from custom-color div
      const colorElement = productItem.find('.custom-color');
      const colorText = colorElement.text().trim();

      // Normalize brand name
      const normalizedBrand = normalizeBrandName(brand);

      // Extract colors from Hebrew text if available
      const extractedColors = extractColorsWithHebrew(title + ' ' + (productCategory || '') + ' ' + colorText, [], this.source);

      const product: Product = {
        title,
        brand: normalizedBrand,
        price,
        oldPrice,
        salePercent,
        currency: 'ILS',
        url,
        images,
        colors: extractedColors,
        source: this.source,
        categories: normalizeCategories([category.name]),
        gender: category.gender,
        isSellingFast: false, // New Era doesn't seem to have this indicator
      };

      return product;

    } catch (error) {
      this.logError('Error parsing New Era product:', error);
      return null;
    }
  }
}

// Run the scraper if this file is executed directly
if (require.main === module) {
  const scraper = new NewEraScraper();
  scraper.run().catch(console.error);
} 