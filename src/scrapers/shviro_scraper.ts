import { fetchPageWithBrowser } from './base/browser-helpers';
import * as cheerio from 'cheerio';
import { BaseScraper, Category as CategoryType } from './base/base-scraper';
import { Category } from '../category.constants';
import { Product, calcSalePercent, normalizeBrandName, normalizeCategories } from './base/scraper_utils';
import * as dotenv from 'dotenv';
import { extractColorsWithHebrew } from '../color.constants';
dotenv.config();

// Define categories for Shviro based on their website structure
const CATEGORIES: CategoryType[] = [
  {
    id: 'sitting-areas',
    name: Category.HOME_OUTDOOR_SEATING_AREAS,
    gender: 'Unisex',
    url: 'https://www.shviro.net/collections/sitting-areas'
  },
  {
    id: 'dining-areas',
    name: Category.HOME_OUTDOOR_FURNITURE,
    gender: 'Unisex',
    url: 'https://www.shviro.net/collections/dining-areas'
  },
  {
    id: 'sale',
    name: Category.HOME_OUTDOOR_FURNITURE,
    gender: 'Unisex',
    url: 'https://www.shviro.net/collections/discounts'
  },
  {
    id: 'balcony',
    name: Category.HOME_OUTDOOR_FURNITURE,
    gender: 'Unisex',
    url: 'https://www.shviro.net/collections/garden-balcony'
  },
  {
    id: 'accessories',
    name: Category.HOME_OUTDOOR_ACCESSORIES,
    gender: 'Unisex',
    url: 'https://www.shviro.net/collections/complementary-furniture'
  }
];

export class ShviroScraper extends BaseScraper {
  protected readonly scraperName = 'Shviro';
  protected readonly source = 'Shviro';

  protected getCategories(): CategoryType[] {
    return CATEGORIES;
  }

  protected async scrapeCategory(category: CategoryType): Promise<Product[]> {
    return await this.scrapeShviroCategory(category);
  }

  protected async initialize(): Promise<void> {
    this.logProgress('Initializing Shviro scraper...');
    this.totalCategories = CATEGORIES.length;
  }

  private async scrapeShviroCategory(category: CategoryType): Promise<Product[]> {
    this.logProgress(`Fetching ${category.url}`);
    
    try {
      let allProducts: Product[] = [];
      let page = 1;
      let hasMore = true;
      const MAX_PAGES = 50; // Safety limit

      while (hasMore && page <= MAX_PAGES) {
        this.logProgress(`Fetching page ${page} for category ${category.name}`);
        
        const pageUrl = page === 1 ? category.url : `${category.url}?page=${page}`;
        const html = await this.fetchShviroPage(pageUrl);
        if (!html) {
          hasMore = false;
          continue;
        }
        const products = this.parseShviroProducts(html, category);

        if (products.length === 0) {
          hasMore = false;
        } else {
          allProducts = allProducts.concat(products);
          this.logProgress(`Found ${products.length} products on page ${page}, total: ${allProducts.length}`);
          page++;
        }

        // Add delay between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      this.logProgress(`Successfully scraped ${allProducts.length} products from ${category.name}`);
      return allProducts;
      
    } catch (error) {
      this.logError(`Error scraping category ${category.name}:`, error);
      return [];
    }
  }

  private async fetchShviroPage(url: string): Promise<string> {
    try {
        return fetchPageWithBrowser(url, {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
        waitUntil: 'networkidle2',
        timeout: 60000,
        onPageReady: async (page) => {
            // Wait for products to load
            await page.waitForSelector('product-card', { timeout: 10000 });
        }
        });
    } catch {
        return '';
    }
  }

  private parseShviroProducts(html: string, category: CategoryType): Product[] {
    const $ = cheerio.load(html);
    const products: Product[] = [];

    // Find all product cards
    const productCards = $('product-card');

    if (productCards.length === 0) {
      this.logProgress(`No products found for category ${category.name}`);
      return [];
    }

    this.logProgress(`Found ${productCards.length} products in ${category.name}`);

    productCards.each((_, item) => {
      const product = this.parseShviroProduct($(item), category, $);
      if (product) {
        products.push(this.createProduct(product));
      }
    });

    return products;
  }

  private parseShviroProduct(productCard: cheerio.Cheerio<any>, category: CategoryType, $: cheerio.CheerioAPI): Product | null {
    try {
      // Extract title
      const titleElement = productCard.find('.product-card__title a');
      const title = titleElement.text().trim();
      
      if (!title) {
        return null;
      }

      // Extract URL
      const url = titleElement.attr('href');
      if (!url) {
        return null;
      }

      // Make URL absolute
      const absoluteUrl = url.startsWith('http') ? url : `https://www.shviro.net${url}`;

      // Extract images
      const images: string[] = [];
      const imageElement = productCard.find('.product-card__image');
      if (imageElement.length > 0) {
        const src = imageElement.attr('src');
        if (src) {
          // Make image URL absolute
          const absoluteImageUrl = src.startsWith('http') ? src : `https:${src}`;
          images.push(absoluteImageUrl);
        }
        // Also get srcset for additional images
        const srcset = imageElement.attr('srcset');
        if (srcset) {
          const srcsetUrls = srcset.split(',').map(s => {
            const url = s.trim().split(' ')[0];
            return url.startsWith('http') ? url : `https:${url}`;
          });
          images.push(...srcsetUrls);
        }
      }

      // Extract prices
      let price: number | null = null;
      let oldPrice: number | null = null;

      const salePriceElement = productCard.find('sale-price');
      const comparePriceElement = productCard.find('compare-at-price');
      
      if (salePriceElement.length > 0) {
        const salePriceText = salePriceElement.text().trim();
        const salePriceMatch = salePriceText.replace(/[₪,]/g, '').match(/[\d.]+/);
        if (salePriceMatch) {
          price = parseFloat(salePriceMatch[0]);
        }
      }

      if (comparePriceElement.length > 0 && !comparePriceElement.attr('hidden')) {
        const comparePriceText = comparePriceElement.text().trim();
        const comparePriceMatch = comparePriceText.replace(/[₪,]/g, '').match(/[\d.]+/);
        if (comparePriceMatch) {
          oldPrice = parseFloat(comparePriceMatch[0]);
        }
      }

      // If no sale price found, check for regular price
      if (!price) {
        const regularPriceElement = productCard.find('.price-list .text-subdued:not(.line-through)');
        if (regularPriceElement.length > 0) {
          const regularPriceText = regularPriceElement.text().trim();
          const regularPriceMatch = regularPriceText.replace(/[₪,]/g, '').match(/[\d.]+/);
          if (regularPriceMatch) {
            price = parseFloat(regularPriceMatch[0]);
          }
        }
      }

      // Skip products with no price
      if (!price) {
        return null;
      }

      // Extract colors from color swatches
      const colors: string[] = [];
      const colorSwatches = productCard.find('.color-swatch');
      colorSwatches.each((_, swatch) => {
        const colorName = $(swatch).find('.sr-only').text().trim();
        if (colorName) {
          colors.push(colorName);
        }
      });

      // Extract product ID/handle
      const productHandle = productCard.attr('handle') || '';

      // Determine if on sale
      const isOnSale = oldPrice !== null && price !== null && oldPrice > price;
      const salePercent = isOnSale && oldPrice && price ? calcSalePercent(oldPrice, price) : null;

      // Extract brand (Shviro is the brand)
      const brand = 'Shviro';

      // Normalize brand name
      const normalizedBrand = normalizeBrandName(brand);

      // Extract colors from title and any additional text, plus the swatches
      const extractedColors = extractColorsWithHebrew(title + ' ' + colors.join(' '), colors, this.source);

      const product: Product = {
        title,
        brand: normalizedBrand,
        price,
        oldPrice,
        salePercent,
        currency: 'ILS',
        url: absoluteUrl,
        images,
        colors: extractedColors,
        source: this.source,
        categories: normalizeCategories([category.name]),
        gender: category.gender,
        isSellingFast: false, // Shviro doesn't seem to have this indicator
      };

      return product;

    } catch (error) {
      this.logError('Error parsing Shviro product:', error);
      return null;
    }
  }
}

// Run the scraper if this file is executed directly
if (require.main === module) {
  const scraper = new ShviroScraper();
  scraper.run().catch(console.error);
} 