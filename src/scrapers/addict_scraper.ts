import { fetchPageWithBrowser, handleCookieConsent } from './base/browser-helpers';
import * as cheerio from 'cheerio';
import { BaseScraper } from './base/base-scraper';
import { Category as CategoryType } from './base/base-scraper';
import { Category } from '../category.constants';
import { Product, calcSalePercent, normalizeBrandName, extractCategory } from './base/scraper_utils';
import * as dotenv from 'dotenv';
import { extractColorsWithHebrew } from 'src/color.constants';
dotenv.config();

const CATEGORIES: CategoryType[] = [
  // Clothing - Shirts
  {
    id: 't-shirts',
    name: Category.T_SHIRTS,
    gender: 'Women',
    url: 'https://addictonline.co.il/collections/%D7%98%D7%99%D7%A9%D7%A8%D7%98%D7%99%D7%9D',
  },
  {
    id: 'buttoned-shirts',
    name: Category.SHIRTS,
    gender: 'Women',
    url: 'https://addictonline.co.il/collections/%D7%9E%D7%9B%D7%95%D7%A4%D7%AA%D7%A8%D7%95%D7%AA',
  },
  {
    id: 'tank-tops',
    name: Category.TANKS,
    gender: 'Women',
    url: 'https://addictonline.co.il/collections/%D7%92%D7%95%D7%A4%D7%99%D7%95%D7%AA',
  },
  {
    id: 'bodysuits',
    name: Category.BODYSUITS,
    gender: 'Women',
    url: 'https://addictonline.co.il/collections/%D7%91%D7%92%D7%93%D7%99-%D7%92%D7%95%D7%A3',
  },
  
  // Clothing - Pants
  {
    id: 'jeans',
    name: Category.PANTS,
    gender: 'Women',
    url: 'https://addictonline.co.il/collections/%D7%92%D7%99%D7%A0%D7%A1%D7%99%D7%9D',
  },
  {
    id: 'tailored-pants',
    name: Category.PANTS,
    gender: 'Women',
    url: 'https://addictonline.co.il/collections/%D7%9E%D7%97%D7%95%D7%99%D7%98%D7%99%D7%9D-1',
  },
  {
    id: 'shorts',
    name: Category.SHORTS,
    gender: 'Women',
    url: 'https://addictonline.co.il/collections/%D7%A9%D7%95%D7%A8%D7%98%D7%99%D7%9D',
  },
  
  // Clothing - Other
  {
    id: 'suits',
    name: Category.SUITS,
    gender: 'Women',
    url: 'https://addictonline.co.il/collections/%D7%97%D7%9C%D7%99%D7%A4%D7%95%D7%AA',
  },
  {
    id: 'jackets',
    name: Category.JACKETS_COATS,
    gender: 'Women',
    url: 'https://addictonline.co.il/collections/%D7%92%D7%A7%D7%98%D7%99%D7%9D',
  },
  {
    id: 'dresses',
    name: Category.DRESSES,
    gender: 'Women',
    url: 'https://addictonline.co.il/collections/%D7%A9%D7%9E%D7%9C%D7%95%D7%AA-1',
  },
  {
    id: 'skirts',
    name: Category.SKIRTS,
    gender: 'Women',
    url: 'https://addictonline.co.il/collections/%D7%97%D7%A6%D7%90%D7%99%D7%95%D7%AA',
  },
  {
    id: 'overalls',
    name: Category.OVERALLS,
    gender: 'Women',
    url: 'https://addictonline.co.il/collections/%D7%90%D7%95%D7%91%D7%A8%D7%95%D7%9C%D7%99%D7%9D',
  },
  
  // Accessories
  {
    id: 'belts',
    name: Category.BELTS,
    gender: 'Women',
    url: 'https://addictonline.co.il/collections/%D7%97%D7%92%D7%95%D7%A8%D7%95%D7%AA',
  },
  {
    id: 'hats',
    name: Category.HATS,
    gender: 'Women',
    url: 'https://addictonline.co.il/collections/%D7%9B%D7%95%D7%91%D7%A2%D7%99%D7%9D',
  },
  {
    id: 'jewelry',
    name: Category.JEWELRY,
    gender: 'Women',
    url: 'https://addictonline.co.il/collections/%D7%AA%D7%9B%D7%A9%D7%99%D7%98%D7%99%D7%9D',
  },
  {
    id: 'bags',
    name: Category.BAGS,
    gender: 'Women',
    url: 'https://addictonline.co.il/collections/%D7%AA%D7%99%D7%A7%D7%99%D7%9D',
  },
  
  // Shoes
  {
    id: 'shoes',
    name: Category.SHOES,
    gender: 'Women',
    url: 'https://addictonline.co.il/collections/%D7%A0%D7%A2%D7%9C%D7%99%D7%99%D7%9D-2',
  },
  
  // Special Collections
  {
    id: 'new',
    name: 'New',
    gender: 'Women',
    url: 'https://addictonline.co.il/collections/%D7%97%D7%93%D7%A9-%D7%91%D7%90%D7%AA%D7%A8-1',
  },
  {
    id: 'swimwear-resort',
    name: Category.SWIMWEAR,
    gender: 'Women',
    url: 'https://addictonline.co.il/collections/swimwear-resort',
  },
  {
    id: 'back-in-stock',
    name: 'New',
    gender: 'Women',
    url: 'https://addictonline.co.il/collections/back-in-stock',
  },
  {
    id: 'sale',
    name: 'Sale',
    gender: 'Women',
    url: 'https://addictonline.co.il/collections/up-70',
  },
  {
    id: 'little-addict',
    name: Category.CLOTHING,
    gender: 'Kids',
    url: 'https://addictonline.co.il/?view=kids',
  }
];

const BASE_URL = 'https://addictonline.co.il';

class AddictScraper extends BaseScraper {
  protected readonly scraperName = 'Addict';
  protected readonly source = 'Addict';

  protected getCategories(): CategoryType[] {
    return CATEGORIES;
  }

  protected async scrapeCategory(category: CategoryType): Promise<Product[]> {
    return this.scrapeAddictCategory(category);
  }

  private async fetchAddictPage(url: string): Promise<string> {
    return fetchPageWithBrowser(url, {
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
      waitUntil: 'domcontentloaded',
      timeout: 60000,
      onPageReady: async (page) => {
        // Handle cookie consent if needed
        await handleCookieConsent(page, [
          '.cookie-consent button',
          '#cookie-accept',
          '.accept-cookies'
        ]);
      }
    });
  }

  private parseAddictProduct(productItem: cheerio.Cheerio<any>, category: CategoryType, $: cheerio.CheerioAPI): Product | undefined {
    try {
      // Extract title from the product item
      let title = productItem.find('.product-item-meta__title').text().trim();
      if (!title) {
        title = productItem.find('h3').text().trim();
      }
      if (!title) {
        title = productItem.find('.product-item__name').text().trim();
      }
      if (!title) {
        console.error("Product with no title", productItem.html());
        return undefined;
      }

      // Extract URL from the product item
      let url = productItem.find('a').attr('href');
      if (!url) {
        url = productItem.find('.product-item__link').attr('href');
      }
      if (!url) {
        console.error("Product with no URL", title);
        return undefined;
      }
      const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;

      // Extract images from product-item__image-wrapper
      const images: string[] = [];
      productItem.find('.product-item__image-wrapper img').each((_, img) => {
        const src = $(img).attr('src');
        const dataSrc = $(img).attr('data-src');
        const srcset = $(img).attr('data-srcset');
        
        let imageUrl = src || dataSrc;
        if (imageUrl) {
          imageUrl = imageUrl.startsWith('//') ? `https:${imageUrl}` : imageUrl;
          if (!images.includes(imageUrl)) {
            images.push(imageUrl);
          }
        }
        
        // Handle srcset if no src found
        if (!imageUrl && srcset) {
          const srcsetUrls = srcset.split(',').map(s => s.trim().split(' ')[0]);
          if (srcsetUrls.length > 0) {
            const firstUrl = srcsetUrls[0];
            const imageUrlFromSrcset = firstUrl.startsWith('//') ? `https:${firstUrl}` : firstUrl;
            if (!images.includes(imageUrlFromSrcset)) {
              images.push(imageUrlFromSrcset);
            }
          }
        }
      });

      // Extract price information
      let price: number | null = null;
      let oldPrice: number | null = null;

      // Look for sale price (current price) - this is the price shown in the sale span
      const salePriceText = productItem.find('.price .price--highlight').text().trim();
      if (salePriceText) {
        const match = salePriceText.replace(/[₪,]/g, '').match(/[\d.]+/);
        price = match ? parseFloat(match[0]) : null;
      }

      // Look for original price in the compare price span
      const originalPriceText = productItem.find('.price .price--compare').text().trim();
      if (originalPriceText) {
        const match = originalPriceText.replace(/[₪,]/g, '').match(/[\d.]+/);
        oldPrice = match ? parseFloat(match[0]) : null;
      }

      // If no sale price found, look for regular price
      if (!price) {
        const regularPriceText = productItem.find('.price').text().trim();
        if (regularPriceText) {
          const match = regularPriceText.replace(/[₪,]/g, '').match(/[\d.]+/);
          price = match ? parseFloat(match[0]) : null;
        }
      }

      // Extract colors from title and images
      const colors = extractColorsWithHebrew(title, [], 'addict_scraper');

      // Determine brand (Addict is the main brand)
      const brand = normalizeBrandName('Addict');

      // Extract categories
      const categories = [category.name, ...extractCategory(title)];
      const gender = category.gender;

      const productJson = {
        title,
        url: fullUrl,
        images,
        colors,
        isSellingFast: false,
        price,
        oldPrice,
        salePercent: calcSalePercent(price, oldPrice) ?? 0,
        currency: 'ILS',
        brand,
        categories,
        gender,
      };

      return this.createProduct(productJson);
    } catch (error) {
      console.error('Error parsing product:', error);
      return undefined;
    }
  }

  private async scrapeAddictCategory(category: CategoryType): Promise<Product[]> {
    this.logProgress(`Fetching ${category.url}`);
    
    try {
      const html = await this.fetchAddictPage(category.url);
      const $ = cheerio.load(html);
      
      // Find all product items - use the correct selector for Addict
      let productItems = $('product-item');
      
      if (productItems.length === 0) {
        // Try alternative selectors
        productItems = $('.product-item');
      }

      if (productItems.length === 0) {
        this.logProgress(`No products found for category ${category.name}`);
        return [];
      }

      this.logProgress(`Found ${productItems.length} products in ${category.name}`);

      const products: Product[] = [];
      productItems.each((_, item) => {
        const product = this.parseAddictProduct($(item), category, $);
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
}

// Main function
async function main() {
  const scraper = new AddictScraper();
  await scraper.run();
}

// CLI entry point
if (require.main === module) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

export { main, AddictScraper }; 