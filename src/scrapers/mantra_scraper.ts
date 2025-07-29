import * as cheerio from 'cheerio';
import { BaseScraper } from './base/base-scraper';
import { Category as CategoryType } from './base/base-scraper';
import { Category } from '../category.constants';
import { Product, calcSalePercent, normalizeBrandName, extractCategory } from './base/scraper_utils';
import { fetchPageWithBrowser } from './base/browser-helpers';
import { extractColorsWithHebrew } from 'src/color.constants';
import * as dotenv from 'dotenv';
dotenv.config();

const CATEGORIES: CategoryType[] = [
  {
    id: 'all-store',
    name: Category.CLOTHING,
    gender: 'Men',
    url: 'https://our-mantra.com/collections/all-store',
  },
  {
    id: 'new-drop',
    name: Category.CLOTHING,
    gender: 'Men',
    url: 'https://our-mantra.com/collections/new-drop',
  },
  {
    id: 'buttoned-shirt',
    name: Category.SHIRTS,
    gender: 'Men',
    url: 'https://our-mantra.com/collections/buttoned-shirt',
  },
  {
    id: 'bottoms',
    name: Category.BOTTOMS,
    gender: 'Men',
    url: 'https://our-mantra.com/collections/bottoms',
  },
  {
    id: 't-shirts',
    name: Category.T_SHIRTS,
    gender: 'Men',
    url: 'https://our-mantra.com/collections/%D7%98%D7%99%D7%A9%D7%A8%D7%98',
  },
  {
    id: 'daily',
    name: Category.CLOTHING,
    gender: 'Men',
    url: 'https://our-mantra.com/collections/daily',
  },
  {
    id: 'suits',
    name: Category.SUITS,
    gender: 'Men',
    url: 'https://our-mantra.com/pages/suits',
  },
  {
    id: 'events',
    name: Category.CLOTHING,
    gender: 'Men',
    url: 'https://our-mantra.com/collections/weddings',
  }
];

const BASE_URL = 'https://our-mantra.com';

class MantraScraper extends BaseScraper {
  protected readonly scraperName = 'Mantra';
  protected readonly source = 'Mantra';

  protected getCategories(): CategoryType[] {
    return CATEGORIES;
  }

  protected async scrapeCategory(category: CategoryType): Promise<Product[]> {
    return this.scrapeMantraCategory(category);
  }

  private async fetchMantraPage(url: string): Promise<string> {
    return fetchPageWithBrowser(url, {
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
      waitUntil: 'domcontentloaded',
      timeout: 60000,
      extraHeaders: {
        'Accept-Language': 'en-US,en;q=0.9',
      },
      onPageReady: async (page) => {
        // Wait for cookie popup and click accept if visible
        // await handleCookieConsent(page, [
        //   'button[data-testid="cookie-banner-accept"]',
        //   '.cookie-banner button',
        //   'button:contains("Accept")',
        //   'button:contains("OK")'
        // ]);
      }
    });
  }

  private parseMantraProduct(productCard: cheerio.Cheerio<any>, category: CategoryType, $: cheerio.CheerioAPI): Product | undefined {
    try {
      // Extract title from the product card title
      const titleElement = productCard.find('.product-card__title a');
      let title = titleElement.text().trim();
      if (!title) {
        title = productCard.find('.product-card__image').attr('alt') || '';
      }
      if (!title) {
        console.error("Product with no title", productCard.html());
        return undefined;
      }

      // Extract URL from the product card link
      const url = titleElement.attr('href');
      if (!url) {
        console.error("Product with no URL", title);
        return undefined;
      }
      const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;

      // Extract images from product card images
      const images: string[] = [];
      productCard.find('.product-card__image').each((_, img) => {
        const src = $(img).attr('src');
        if (src) {
          const imageUrl = src.startsWith('//') ? `https:${src}` : src;
          if (!images.includes(imageUrl)) {
            images.push(imageUrl);
          }
        }
      });

      // Extract price from the price list
      let price: number | null = null;
      let oldPrice: number | null = null;

      // Look for sale price (current price)
      const salePriceElement = productCard.find('sale-price');
      if (salePriceElement.length > 0) {
        const salePriceText = salePriceElement.text().trim();
        const match = salePriceText.replace(/[₪,]/g, '').match(/[\d.]+/);
        price = match ? parseFloat(match[0]) : null;
      }

      // Look for regular price (if not on sale)
      if (!price) {
        const regularPriceElement = productCard.find('price-list .money');
        if (regularPriceElement.length > 0) {
          const regularPriceText = regularPriceElement.text().trim();
          const match = regularPriceText.replace(/[₪,]/g, '').match(/[\d.]+/);
          price = match ? parseFloat(match[0]) : null;
        }
      }

      // Look for old price (strikethrough price)
      const oldPriceElement = productCard.find('price-list .money--old, price-list s');
      if (oldPriceElement.length > 0) {
        const oldPriceText = oldPriceElement.text().trim();
        const match = oldPriceText.replace(/[₪,]/g, '').match(/[\d.]+/);
        oldPrice = match ? parseFloat(match[0]) : null;
      }

      // Extract colors from title and images
      const colors = extractColorsWithHebrew(title, [], 'mantra_scraper');

      // Determine brand (Mantra is the main brand)
      const brand = normalizeBrandName('Mantra');

      // Extract categories
      const categories = Array.from(new Set([category.name, ...extractCategory(title), title.toLowerCase().includes("shirt") && Category.SHIRTS].filter(Boolean)));
      const gender = category.gender;

      if (!title || !fullUrl || !price){
        console.error("Product with no title, url, or price", {
            title, url, price
        });
        return;
      }

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

  private async scrapeMantraCategory(category: CategoryType): Promise<Product[]> {
    let page = 1;
    let allProducts: Product[] = [];
    let hasMore = true;
    let prevPageUrls: string[] = [];
    const MAX_PAGES = 50;

    while (hasMore && page <= MAX_PAGES) {
      const url = `${category.url}${page > 1 ? `?page=${page}` : ''}`;
      this.logProgress(`Fetching ${url}`);
      
      try {
        const html = await this.fetchMantraPage(url);
        const $ = cheerio.load(html);
        
        // Find all product cards
        let productCards = $('product-card');
        
        if (productCards.length === 0) {
          // Try alternative selectors
          productCards = $('.product-card');
        }

        if (productCards.length === 0) {
          this.logProgress(`No products found for category ${category.name} on page ${page}`);
          break;
        }

        this.logProgress(`Found ${productCards.length} products in ${category.name} on page ${page}`);

        const pageProducts: Product[] = [];
        productCards.each((_, card) => {
          const product = this.parseMantraProduct($(card), category, $);
          if (product) {
            pageProducts.push(product);
          }
        });

        const pageUrls = pageProducts.map(p => p.url);
        
        // If all URLs are the same as previous page, stop
        if (prevPageUrls.length && pageUrls.length && prevPageUrls.join(',') === pageUrls.join(',')) {
          hasMore = false;
          break;
        }

        allProducts.push(...pageProducts);
        prevPageUrls = pageUrls;
        
        // If less than expected products, it's likely the last page
        hasMore = productCards.length >= 12; // Assuming 12 products per page
        page++;
        
      } catch (error) {
        this.logError(`Error scraping category ${category.name} page ${page}:`, error);
        break;
      }
    }

    this.logProgress(`Successfully scraped ${allProducts.length} products from ${category.name}`);
    return allProducts;
  }
}

// Main function
async function main() {
  const scraper = new MantraScraper();
  await scraper.run();
}

// CLI entry point
if (require.main === module) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

export { main, MantraScraper }; 