import puppeteer from 'puppeteer-extra';
import * as cheerio from 'cheerio';
import { BaseScraper, Category as CategoryType } from './base/base-scraper';
import { Category } from '../category.constants';
import { Product, calcSalePercent, normalizeBrandName, extractColorsWithHebrew, extractCategory } from './base/scraper_utils';
import * as dotenv from 'dotenv';
dotenv.config();

export class FootlockerScraper extends BaseScraper {
  protected readonly scraperName = 'Footlocker';
  protected readonly source = 'Foot Locker';

  // Define categories for Foot Locker
  private readonly CATEGORIES: CategoryType[] = [
    {
      id: 'men-shoes',
      name: Category.SHOES,
      gender: 'Men',
      url: 'https://footlocker.co.il/collections/men-shoes'
    },
    {
      id: 'women-shoes',
      name: Category.SHOES,
      gender: 'Women',
      url: 'https://footlocker.co.il/collections/women-shoes'
    },
    {
      id: 'kids-shoes',
      name: Category.SHOES,
      gender: 'Kids',
      url: 'https://footlocker.co.il/collections/kids-shoes'
    },
    {
      id: 'men-tshirts',
      name: Category.T_SHIRTS,
      gender: 'Men',
      url: 'https://footlocker.co.il/collections/t-shirts-men'
    },
    {
        id: 'men-pants',
        name: Category.PANTS,
        gender: 'Men',
        url: 'https://footlocker.co.il/collections/pants-men'
    },
    {
        id: 'men-sweatshirts',
        name: Category.SWEATERS,
        gender: 'Men',
        url: 'https://footlocker.co.il/collections/sweatshirts-men'
    },
    {
        id: 'men-tanks',
        name: Category.TANKS,
        gender: 'Men',
        url: 'https://footlocker.co.il/collections/tanks-sleeveless-shirts-men'
    },
    {
        id: 'men-shorts',
        name: Category.SHORTS,
        gender: 'Men',
        url: 'https://footlocker.co.il/collections/shorts-men'
    },
    {
        id: 'men-jackets',
        name: Category.JACKETS_COATS,
        gender: 'Men',
        url: 'https://footlocker.co.il/collections/jackets-and-coats-men'
    },
    {
        id: 'men-swimwear',
        name: Category.SWIMWEAR,
        gender: 'Men',
        url: 'https://footlocker.co.il/collections/swimwear'
    },  
    {
      id: 'women-t-shirts',
      name: Category.T_SHIRTS,
      gender: 'Women',
      url: 'https://footlocker.co.il/collections/t-shirts-women'
    },
    {
      id: 'women-pants',
      name: Category.PANTS,
      gender: 'Women',
      url: 'https://footlocker.co.il/collections/pants-women'
    },
    {
      id: 'women-tights',
      name: Category.TIGHTS,
      gender: 'Women',
      url: 'https://footlocker.co.il/collections/tights'
    },
    {
      id: 'women-sweatshirts',
      name: Category.SWEATERS,
      gender: 'Women',
      url: 'https://footlocker.co.il/collections/sweatshirts-women'
    },
    {
      id: 'women-tanks',
      name: Category.TANKS,
      gender: 'Women',
      url: 'https://footlocker.co.il/collections/tanks-sleeveless-shirts-women'
    },
    {
      id: 'women-shorts',
      name: Category.SHORTS,
      gender: 'Women',
      url: 'https://footlocker.co.il/collections/shorts-women'
    },
    {
      id: 'women-jackets',
      name: Category.JACKETS_COATS,
      gender: 'Women',
      url: 'https://footlocker.co.il/collections/jackets-and-coats-women'
    },
    {
      id: 'accessories',
      name: Category.ACCESSORIES,
      gender: 'Unisex',
      url: 'https://footlocker.co.il/collections/accessories'
    },
    {
      id: 'men-sale',
      name: 'Sale',
      gender: 'Men',
      url: 'https://footlocker.co.il/collections/sale?filter.p.m.custom.prep3=%D7%92%D7%91%D7%A8%D7%99%D7%9D'
    },
    {
      id: 'women-sale',
      name: 'Sale',
      gender: 'Women',
      url: 'https://footlocker.co.il/collections/sale?filter.p.m.custom.prep3=%D7%A0%D7%A9%D7%99%D7%9D'
    },
    {
      id: 'kids-sale',
      name: 'Sale',
      gender: 'Kids',
      url: 'https://footlocker.co.il/collections/sale?filter.p.m.custom.prep3=%D7%99%D7%9C%D7%93%D7%99%D7%9D&filter.p.m.custom.prep3=%D7%A0%D7%95%D7%A2%D7%A8&filter.v.price.gte=&filter.v.price.lte='
    },
    // unisex
    {
      id: 'unisex-sale',
      name: 'Sale',
      gender: 'Unisex',
      url: 'https://footlocker.co.il/collections/sale?filter.p.m.custom.prep3=%D7%99%D7%95%D7%A0%D7%99%D7%A1%D7%A7%D7%A1&filter.v.price.gte=&filter.v.price.lte='
    },
  ];

  protected getCategories(): CategoryType[] {
    return this.CATEGORIES;
  }

  protected async scrapeCategory(category: CategoryType): Promise<Product[]> {
    return await this.scrapeFootlockerCategory(category);
  }

  protected async initialize(): Promise<void> {
    this.logProgress('Initializing Footlocker scraper...');
    this.totalCategories = this.CATEGORIES.length;
  }

  private async scrapeFootlockerCategory(category: CategoryType): Promise<Product[]> {
    this.logProgress(`Fetching ${category.url}`);
    
    try {
      const html = await this.fetchFootlockerPage(category.url);
      const $ = cheerio.load(html);
      
      // Find all product items
      const productItems = $('.product-item');
      
      if (productItems.length === 0) {
        this.logProgress(`No products found for category ${category.name}`);
        return [];
      }

      this.logProgress(`Found ${productItems.length} products in ${category.name}`);

      const products: Product[] = [];
      productItems.each((_, item) => {
        const product = this.parseFootlockerProduct($(item), category, $);
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

  private async fetchFootlockerPage(url: string): Promise<string> {
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
      await page.waitForSelector('.product-item', { timeout: 15000 });
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

  private parseFootlockerProduct(productItem: cheerio.Cheerio<any>, category: CategoryType, $: cheerio.CheerioAPI): Product | null {
    try {
      // Extract title
      const titleElement = productItem.find('.product-item-meta__title').first();
      const title = titleElement.text().trim();
      
      if (!title) {
        return null;
      }

      // Extract brand
      const brandElement = productItem.find('.product-item-meta__vendor');
      const brand = brandElement.text().trim() || 'Foot Locker';

      // Extract URL
      const urlElement = productItem.find('.product-item-meta__title').first();
      const relativeUrl = urlElement.attr('href');
      const url = relativeUrl ? `https://footlocker.co.il${relativeUrl}` : null;

      // Extract images
      const images: string[] = [];
      const primaryImage = productItem.find('.product-item__primary-image').attr('src');
      const secondaryImage = productItem.find('.product-item__secondary-image').attr('src');
      
      if (primaryImage) {
        images.push(primaryImage.startsWith('//') ? `https:${primaryImage}` : primaryImage);
      }
      if (secondaryImage) {
        images.push(secondaryImage.startsWith('//') ? `https:${secondaryImage}` : secondaryImage);
      }

      // Extract prices - Foot Locker has different price structures for regular vs sale items
      let price: number | null = null;
      let oldPrice: number | null = null;

      // Check if this is a sale item (has price--highlight and price--compare)
      const salePriceElement = productItem.find('.price--highlight');
      const comparePriceElement = productItem.find('.price--compare');
      
      if (salePriceElement.length > 0 && comparePriceElement.length > 0) {
        // This is a sale item
        const salePriceText = salePriceElement.text().trim();
        const comparePriceText = comparePriceElement.text().trim();
        
        if (salePriceText) {
          const saleMatch = salePriceText.replace(/[₪,]/g, '').match(/[\d.]+/);
          if (saleMatch) {
            price = parseFloat(saleMatch[0]);
          }
        }
        
        if (comparePriceText) {
          const compareMatch = comparePriceText.replace(/[₪,]/g, '').match(/[\d.]+/);
          if (compareMatch) {
            oldPrice = parseFloat(compareMatch[0]);
          }
        }
      } else {
        // Regular item - single price
        const priceElement = productItem.find('.price-list .price');
        const priceText = priceElement.text().trim();
        
        if (priceText) {
          const priceMatch = priceText.replace(/[₪,]/g, '').match(/[\d.]+/);
          if (priceMatch) {
            price = parseFloat(priceMatch[0]);
          }
        }
      }

      // Extract product ID
      const productId = productItem.attr('data-infinator-id') || '';

      // Extract sale label (like "30%OFF")
      const saleLabelElement = productItem.find('.label--highlight');
      const saleLabel = saleLabelElement.text().trim();

      // Determine if on sale
      const isOnSale = oldPrice !== null && price !== null && oldPrice > price;
      const salePercent = isOnSale && oldPrice && price ? calcSalePercent(oldPrice, price) : null;

      // Extract category information
      const categoryElement = productItem.find('.collection-type');
      const productCategory = categoryElement.text().trim();

      // Normalize brand name
      const normalizedBrand = normalizeBrandName(brand);

      // Extract colors from Hebrew text if available
      const extractedColors = extractColorsWithHebrew(title + ' ' + (productCategory || ''), [], this.source);

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
        categories: [category.name],
        gender: category.gender,
        isSellingFast: false, // Foot Locker doesn't seem to have this indicator
      };

      return product;

    } catch (error) {
      this.logError('Error parsing Footlocker product:', error);
      return null;
    }
  }
}

// Run the scraper if this file is executed directly
if (require.main === module) {
  const scraper = new FootlockerScraper();
  scraper.run().catch(console.error);
} 