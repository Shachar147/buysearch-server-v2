import { fetchPageWithBrowser } from './base/browser-helpers';
import * as cheerio from 'cheerio';
import { BaseScraper } from './base/base-scraper';
import { Category as CategoryType } from './base/base-scraper';
import { Category } from '../category.constants';
import { Product, calcSalePercent, normalizeBrandName, extractCategory } from './base/scraper_utils';
import * as dotenv from 'dotenv';
import { extractColorsWithHebrew } from '../color.constants';
dotenv.config();



const CATEGORIES: CategoryType[] = [
  {
    id: 'men-shoes',
    name: Category.SHOES,
    gender: 'Men',
    url: 'https://www.newbalance.co.il/he/shop/men/shoes?sz=1000',
  },
  {
    id: 'women-shoes',
    name: Category.SHOES,
    gender: 'Women',
    url: 'https://www.newbalance.co.il/he/shop/women/shoes?sz=1000',
  },
  {
    id: 'men-clothing',
    name: Category.CLOTHING,
    gender: 'Men',
    url: 'https://www.newbalance.co.il/he/shop/men/clothing?sz=1000',
  },
  {
    id: 'women-clothing',
    name: Category.CLOTHING,
    gender: 'Women',
    url: 'https://www.newbalance.co.il/he/shop/women/clothing?sz=1000',
  },
  {
    id: 'men-accessories',
    name: Category.ACCESSORIES,
    gender: 'Men',
    url: 'https://www.newbalance.co.il/he/shop/men/accessories?sz=1000',
  },
  {
    id: 'women-accessories',
    name: Category.ACCESSORIES,
    gender: 'Women',
    url: 'https://www.newbalance.co.il/he/shop/women/accessories?sz=1000',
  },
  {
    id: 'kids-shoes',
    name: Category.SHOES,
    gender: 'Kids',
    url: 'https://www.newbalance.co.il/he/shop/kids/shoes?sz=1000',
  },
  {
    id: 'men-outlet',
    name: Category.CLOTHING,
    gender: 'Men',
    url: 'https://www.newbalance.co.il/he/shop/outlet/sale-men/sale-men-clothing?sz=1000',
  },
  {
    id: 'women-outlet',
    name: Category.CLOTHING,
    gender: 'Women',
    url: 'https://www.newbalance.co.il/he/shop/outlet/sale-women/sale-women-clothing?sz=1000',
  },
  {
    id: 'men-outlet',
    name: Category.SHOES,
    gender: 'Men',
    url: 'https://www.newbalance.co.il/he/shop/outlet/sale-men/sale-men-shoes?sz=1000',
  },
  {
    id: 'women-outlet',
    name: Category.SHOES,
    gender: 'Women',
    url: 'https://www.newbalance.co.il/he/shop/outlet/sale-women/sale-women-shoes?sz=1000',
  }
];

const BASE_URL = 'https://www.newbalance.co.il';

class NewBalanceScraper extends BaseScraper {
  protected readonly scraperName = 'New Balance';
  protected readonly source = 'New Balance';

  protected getCategories(): CategoryType[] {
    return CATEGORIES;
  }

  protected async scrapeCategory(category: CategoryType): Promise<Product[]> {
    return this.scrapeNewBalanceCategory(category);
  }

    private async fetchNewBalancePage(url: string): Promise<string> {
    return fetchPageWithBrowser(url, {
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
      waitUntil: 'domcontentloaded',
      timeout: 60000,
      onPageReady: async (page) => {
        // Custom page logic can be added here
      }
    });
  }

  private parseNewBalanceProduct(productCard: cheerio.Cheerio<any>, category: CategoryType, $: cheerio.CheerioAPI): Product | undefined {
    try {
      // Extract title from the pdp-link
      let title = productCard.find('.pdp-link .link').first().text().trim();
      if (!title) {
        title = productCard.find('.tile-image').attr('alt') || '';
      }
      if (!title) {
        console.error("Product with no title", productCard.html());
        return undefined;
      }

      // Extract URL from the pdp-link
      const url = productCard.find('.pdp-link .link').attr('href');
      if (!url) {
        console.error("Product with no URL", title);
        return undefined;
      }
      const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;

      // Extract images from tile-image
      const images: string[] = [];
      productCard.find('.tile-image').each((_, img) => {
        const src = $(img).attr('src');
        if (src) {
          const imageUrl = src.startsWith('//') ? `https:${src}` : src;
          if (!images.includes(imageUrl)) {
            images.push(imageUrl);
          }
        }
      });

      // Extract price from the price section
      let price: number | null = null;
      let oldPrice: number | null = null;

      // Look for sale price (current price) in the sales span
      const salePriceText = productCard.find('.price .sales .value').first().text().trim();
      if (salePriceText) {
        const match = salePriceText.replace(/[₪,]/g, '').match(/[\d.]+/);
        price = match ? parseFloat(match[0]) : null;
      }

      // Look for original price in the strike-through del element
      const originalPriceText = productCard.find('.price del .strike-through .value').first().text().trim();
      if (originalPriceText) {
        const match = originalPriceText.replace(/[₪,]/g, '').match(/[\d.]+/);
        oldPrice = match ? parseFloat(match[0]) : null;
      }

      // If no sale price found, look for regular price (no sale)
      if (!price) {
        const regularPriceText = productCard.find('.price .value').first().text().trim();
        if (regularPriceText) {
          const match = regularPriceText.replace(/[₪,]/g, '').match(/[\d.]+/);
          price = match ? parseFloat(match[0]) : null;
        }
      }

      // Extract colors from title and images
      const colors = extractColorsWithHebrew(title, [], 'newbalance_scraper');

      // Determine brand (New Balance is the main brand)
      const brand = normalizeBrandName('New Balance');

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



  private async scrapeNewBalanceCategory(category: CategoryType): Promise<Product[]> {
    this.logProgress(`Fetching ${category.url}`);
    
    try {
      const html = await this.fetchNewBalancePage(category.url);
      const $ = cheerio.load(html);
      
      // Find all product cards - use the correct selector for New Balance
      let productCards = $('.product-tile-item');
      
      if (productCards.length === 0) {
        // Try alternative selectors
        productCards = $('.product-tile');
      }

      if (productCards.length === 0) {
        this.logProgress(`No products found for category ${category.name}`);
        return [];
      }

      this.logProgress(`Found ${productCards.length} products in ${category.name}`);

      const products: Product[] = [];
      productCards.each((_, card) => {
        const product = this.parseNewBalanceProduct($(card), category, $);
        if (product) {
          products.push(this.createProduct(product));
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
  const scraper = new NewBalanceScraper();
  await scraper.run();
}

// CLI entry point
if (require.main === module) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

export { main, NewBalanceScraper }; 