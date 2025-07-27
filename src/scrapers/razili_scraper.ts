import puppeteer from 'puppeteer-extra';
import * as cheerio from 'cheerio';
import { BaseScraper, Category as CategoryType } from './base/base-scraper';
import { Category } from '../category.constants';
import { Product, calcSalePercent, normalizeBrandName, extractColorsWithHebrew, extractCategory, normalizeCategories } from './base/scraper_utils';
import * as dotenv from 'dotenv';
dotenv.config();

export class RaziliScraper extends BaseScraper {
  protected readonly scraperName = 'Razili';
  protected readonly source = 'Razili';

  // Define categories for Razili
  private readonly CATEGORIES: CategoryType[] = [
    // Sale Categories
    {
      id: 'sale-clothing',
      name: Category.CLOTHING,
      gender: 'Women',
      url: 'https://www.razili.co.il/collections/sale-%D7%91%D7%92%D7%93%D7%99%D7%9D'
    },
    {
      id: 'sale-shoes',
      name: Category.SHOES,
      gender: 'Women',
      url: 'https://www.razili.co.il/collections/new-in-shoes'
    },
    {
      id: 'sale-accessories',
      name: Category.ACCESSORIES,
      gender: 'Women',
      url: 'https://www.razili.co.il/collections/accessories-new-in'
    },
    // New In Categories
    {
      id: 'new-clothing',
      name: Category.CLOTHING,
      gender: 'Women',
      url: 'https://www.razili.co.il/collections/%D7%91%D7%99%D7%92%D7%95%D7%93-%D7%97%D7%93%D7%A9-%D7%91%D7%90%D7%AA%D7%A8'
    },
    {
      id: 'new-shoes',
      name: Category.SHOES,
      gender: 'Women',
      url: 'https://www.razili.co.il/collections/%D7%A0%D7%A2%D7%9C%D7%99%D7%99%D7%9D-%D7%97%D7%93%D7%A9-%D7%91%D7%90%D7%AA%D7%A8'
    },
    {
      id: 'new-accessories',
      name: Category.ACCESSORIES,
      gender: 'Women',
      url: 'https://www.razili.co.il/collections/accessories'
    },
    // Clothing Categories
    {
      id: 'pants',
      name: Category.PANTS,
      gender: 'Women',
      url: 'https://www.razili.co.il/collections/%D7%9E%D7%9B%D7%A0%D7%a1%D7%99%D7%99%D7%9D'
    },
    {
      id: 'dresses',
      name: Category.DRESSES,
      gender: 'Women',
      url: 'https://www.razili.co.il/collections/%D7%A9%D7%9E%D7%9C%D7%95%D7%AA'
    },
    {
      id: 'skirts',
      name: Category.SKIRTS,
      gender: 'Women',
      url: 'https://www.razili.co.il/collections/%D7%97%D7%A6%D7%90%D7%99%D7%95%D7%AA'
    },
    {
      id: 'sets',
      name: Category.SETS,
      gender: 'Women',
      url: 'https://www.razili.co.il/collections/%D7%97%D7%9C%D7%99%D7%A4%D7%95%D7%AA-1'
    },
    {
      id: 'overalls',
      name: Category.OVERALLS,
      gender: 'Women',
      url: 'https://www.razili.co.il/collections/%D7%90%D7%95%D7%91%D7%A8%D7%95%D7%9C%D7%99%D7%9D'
    },
    {
      id: 'swimwear',
      name: Category.SWIMWEAR,
      gender: 'Women',
      url: 'https://www.razili.co.il/collections/%D7%91%D7%92%D7%93%D7%99-%D7%99%D7%9D-1'
    },
    {
      id: 'jeans',
      name: Category.JEANS,
      gender: 'Women',
      url: 'https://www.razili.co.il/collections/%D7%92%D7%99%D7%A0%D7%A1%D7%99%D7%9D-1'
    },
    {
      id: 'basic',
      name: 'New',
      gender: 'Women',
      url: 'https://www.razili.co.il/collections/%D7%91%D7%99%D7%99%D7%A1%D7%99%D7%A7'
    },
    {
      id: 'sport',
      name: Category.SPORT,
      gender: 'Women',
      url: 'https://www.razili.co.il/collections/active'
    },
    {
      id: 'sweaters',
      name: Category.SWEATERS,
      gender: 'Women',
      url: 'https://www.razili.co.il/collections/%D7%A1%D7%A8%D7%99%D7%92%D7%99%D7%9D-2'
    },
    {
      id: 'sweatshirts',
      name: Category.SWEATERS,
      gender: 'Women',
      url: 'https://www.razili.co.il/collections/%D7%A1%D7%95%D7%95%D7%98%D7%A9%D7%99%D7%A8%D7%98%D7%99%D7%9D-%D7%95%D7%A7%D7%A4%D7%95%D7%A6-%D7%95%D7%A0%D7%99%D7%9D'
    },
    {
      id: 'jackets-coats',
      name: Category.JACKETS_COATS,
      gender: 'Women',
      url: 'https://www.razili.co.il/collections/razili-studio-jackets'
    },
    // Shoes Categories
    {
      id: 'sneakers',
      name: Category.SNEAKERS,
      gender: 'Women',
      url: 'https://www.razili.co.il/collections/sneakers'
    },
    {
      id: 'sandals',
      name: Category.SANDALS,
      gender: 'Women',
      url: 'https://www.razili.co.il/collections/%D7%A1%D7%A0%D7%93%D7%9C%D7%99%D7%9D-%D7%95%D7%9B%D7%A4%D7%9B%D7%A4%D7%99%D7%9D'
    },
    {
      id: 'boots',
      name: Category.BOOTS,
      gender: 'Women',
      url: 'https://www.razili.co.il/collections/%D7%9E%D7%92%D7%A4%D7%99%D7%99%D7%9D-1'
    },
    {
      id: 'heels',
      name: Category.HEELS,
      gender: 'Women',
      url: 'https://www.razili.co.il/collections/%D7%A0%D7%A2%D7%9C%D7%99-%D7%A2%D7%A7%D7%91'
    },
    {
      id: 'sale',
      name: 'Sale',
      gender: 'Women',
      url: 'https://www.razili.co.il/collections/razili-outlet'
    }
  ];

  protected getCategories(): CategoryType[] {
    return this.CATEGORIES;
  }

  protected async scrapeCategory(category: CategoryType): Promise<Product[]> {
    return await this.scrapeRaziliCategory(category);
  }

  protected async initialize(): Promise<void> {
    this.logProgress('Initializing Razili scraper...');
    this.totalCategories = this.CATEGORIES.length;
  }

  private async scrapeRaziliCategory(category: CategoryType): Promise<Product[]> {
    this.logProgress(`Fetching ${category.url}`);
    
    try {
      const html = await this.fetchRaziliPage(category.url);
      const $ = cheerio.load(html);
      
      // Find all product items
      const productItems = $('.grid__item.grid-product');
      
      if (productItems.length === 0) {
        this.logProgress(`No products found for category ${category.name}`);
        return [];
      }

      this.logProgress(`Found ${productItems.length} products in ${category.name}`);

      const products: Product[] = [];
      productItems.each((_, item) => {
        const product = this.parseRaziliProduct($(item), category, $);
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

  private async fetchRaziliPage(url: string): Promise<string> {
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
      await page.waitForSelector('.grid__item.grid-product', { timeout: 15000 });
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

  private parseRaziliProduct(productItem: cheerio.Cheerio<any>, category: CategoryType, $: cheerio.CheerioAPI): Product | null {
    try {
      // Extract title
      const titleElement = productItem.find('.grid-product__title');
      const title = titleElement.text().trim();
      
      if (!title) {
        return null;
      }

      // Extract brand from the link above title
      const brandElement = productItem.find('.grid-product__meta a');
      const brand = brandElement.text().trim() || 'Razili';

      // Extract URL
      const urlElement = productItem.find('.grid-product__link');
      const relativeUrl = urlElement.attr('href');
      const url = relativeUrl ? `https://www.razili.co.il${relativeUrl}` : '';

      // Extract images
      const images: string[] = [];
      const primaryImage = productItem.find('.grid-product__image').attr('src');
      const secondaryImage = productItem.find('.grid-product__secondary-image img').attr('src');
      
      if (primaryImage) {
        // Convert relative URLs to absolute
        const fullPrimaryUrl = primaryImage.startsWith('//') ? `https:${primaryImage}` : primaryImage;
        images.push(fullPrimaryUrl);
      }
      if (secondaryImage) {
        const fullSecondaryUrl = secondaryImage.startsWith('//') ? `https:${secondaryImage}` : secondaryImage;
        images.push(fullSecondaryUrl);
      }

      // Extract prices - Razili has different price structures
      let price: number | null = null;
      let oldPrice: number | null = null;

      // Check if this is a sale item (has original price)
      const priceNowElement = productItem.find('.price-now');
      const originalPriceElement = productItem.find('.grid-product__price--original');
      
      if (priceNowElement.length > 0) {
        const priceNowText = priceNowElement.text().trim();
        if (priceNowText) {
          const priceMatch = priceNowText.replace(/[₪,]/g, '').match(/[\d.]+/);
          if (priceMatch) {
            price = parseFloat(priceMatch[0]);
          }
        }
      }

      if (originalPriceElement.length > 0) {
        const originalPriceText = originalPriceElement.text().trim();
        if (originalPriceText) {
          const originalMatch = originalPriceText.replace(/[₪,]/g, '').match(/[\d.]+/);
          if (originalMatch) {
            oldPrice = parseFloat(originalMatch[0]);
          }
        }
      }

      // If no sale price structure, check for regular price
      if (!price) {
        const regularPriceElement = productItem.find('.grid-product__price .price-now');
        const regularPriceText = regularPriceElement.text().trim();
        if (regularPriceText) {
          const regularMatch = regularPriceText.replace(/[₪,]/g, '').match(/[\d.]+/);
          if (regularMatch) {
            price = parseFloat(regularMatch[0]);
          }
        }
      }

      // Skip products with no price
      if (!price) {
        return null;
      }

      // Extract product ID
      const productId = productItem.attr('data-product-id') || '';

      // Extract sale label (like "50% הנחה")
      const savingsElement = productItem.find('.grid-product__price--savings');
      const saleLabel = savingsElement.text().trim();

      // Determine if on sale
      const isOnSale = oldPrice !== null && price !== null && oldPrice > price;
      const salePercent = isOnSale && oldPrice && price ? calcSalePercent(oldPrice, price) : null;

      // Extract colors from color swatches
      const colors: string[] = [];
      const colorSwatches = productItem.find('.color-sw-round');
      colorSwatches.each((_, swatch) => {
        const colorButton = $(swatch);
        const colorTitle = colorButton.attr('data-product-title');
        if (colorTitle) {
          // Extract color from Hebrew title (e.g., "בצבע שחור" -> "שחור")
          const colorMatch = colorTitle.match(/בצבע\s+(\S+)/);
          if (colorMatch) {
            colors.push(colorMatch[1]);
          }
        }
      });

      // Normalize brand name
      const normalizedBrand = normalizeBrandName(brand);

      // Extract colors from Hebrew text if available
      const extractedColors = extractColorsWithHebrew(title + ' ' + colors.join(' '), colors, this.source);

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
        isSellingFast: false, // Razili doesn't seem to have this indicator
      };

      return product;

    } catch (error) {
      this.logError('Error parsing Razili product:', error);
      return null;
    }
  }
}

// Run the scraper if this file is executed directly
if (require.main === module) {
  const scraper = new RaziliScraper();
  scraper.run().catch(console.error);
} 