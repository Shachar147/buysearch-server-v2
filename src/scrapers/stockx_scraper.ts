import { fetchPageWithBrowser } from './base/browser-helpers';
import * as cheerio from 'cheerio';
import { BaseScraper } from './base/base-scraper';
import { Category as CategoryType } from './base/base-scraper';
import { Category } from '../category.constants';
import { Product, normalizeBrandName } from './base/scraper_utils';
import * as dotenv from 'dotenv';
import { extractColorsWithHebrew } from 'src/color.constants';
dotenv.config();

// todo: fix images
// todo: check sale price
// todo: add more categories


const CATEGORIES: CategoryType[] = [
  {
    id: 'stockx-shoes',
    name: Category.SHOES,
    gender: 'Men',
    url: 'https://stockx.com/category/shoes?gender=men',
  },
];

const BASE_URL = 'https://stockx.com';

class StockXScraper extends BaseScraper {
  protected readonly scraperName = 'StockX';
  protected readonly source = 'StockX';

  protected getCategories(): CategoryType[] {
    return CATEGORIES;
  }

  protected async scrapeCategory(category: CategoryType): Promise<Product[]> {
    return this.scrapeStockXCategory(category);
  }

  private async fetchStockXPage(url: string, userAgent?: string, viewport?: { width: number, height: number }): Promise<string> {
    try {
      return fetchPageWithBrowser(url, {
        userAgent: userAgent || 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
        waitUntil: 'domcontentloaded',
        timeout: 60000,
        extraHeaders: {
          'Accept-Language': 'en-US,en;q=0.9',
          'Connection': 'keep-alive',
        },
        onPageReady: async (page) => {
          if (viewport) {
            await page.setViewport(viewport);
          }
          // Wait for images to load (StockX loads real images after a short delay)
          await new Promise(res => setTimeout(res, 3000));
        }
      });
    } catch {
      return "";
    }
  }

  private parseStockXProducts(html: string, category: CategoryType): Product[] {
    const $ = cheerio.load(html);
    const productCards = $('[data-testid="productTile"]');
    const products: Product[] = [];
    productCards.each((_, el) => {
      const elem = $(el);
      const title = elem.find('[data-testid="product-tile-title"]').text().trim();
      let url = elem.find('[data-testid="productTile-ProductSwitcherLink"]').attr('href') || '';
      if (url && !url.startsWith('http')) url = BASE_URL + url;
      // Improved image extraction: skip placeholder images, prefer real product images
      let image = `https://images.stockx.com/images/${title.replace(/\s+/g,'-')}-Product.jpg?w=150`;
      elem.find('img.chakra-image').each((_, img) => {
        const src = $(img).attr('src');
        console.log("hereee", src);
        if (src &&
            !src.includes('Product-Placeholder-Default')) {
          image = src.split('?')[0];
          return false; // break loop
        }
      });

      // StockX shows price as "Lowest Ask"
      const priceStr = elem.find('[data-testid="product-tile-lowest-ask-amount"]').text().replace(/[^\d.]/g, '');
      const price = priceStr ? parseFloat(priceStr) : null;
      // Brand is often in the title, but StockX does not have a separate brand field
      const brand = normalizeBrandName(title.split(' ')[0] || 'StockX');
      const colors: string[] = extractColorsWithHebrew(title, [], 'stockx_scraper');
      const categories = [category.name];
      const gender = category.gender;
      if (!title || !url || price == null) return;
      products.push(this.createProduct({
        title,
        url,
        images: [image].filter(Boolean),
        colors,
        isSellingFast: false,
        price,
        oldPrice: null,
        salePercent: null,
        currency: 'USD',
        brand,
        categories,
        gender,
      }));
    });
    return products;
  }

  private async scrapeStockXCategory(category: CategoryType): Promise<Product[]> {
    let pageNum = 1;
    let allProducts: Product[] = [];
    let hasMore = true;
    const MAX_PAGES = 2; // todo: change to 20
    // User agents and viewports for randomization
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_4_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5.1 Safari/605.1.15',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0',
    ];
    const viewports = [
      { width: 1280, height: 800 },
      { width: 1440, height: 900 },
      { width: 1920, height: 1080 },
      { width: 1366, height: 768 },
    ];
    while (hasMore && pageNum <= MAX_PAGES) {
      // Randomize user agent and viewport for each page
      const randomUA = userAgents[Math.floor(Math.random() * userAgents.length)];
      const randomViewport = viewports[Math.floor(Math.random() * viewports.length)];
      const url = `${category.url}&page=${pageNum}`;
      this.logProgress(`Fetching ${url}`);
      // Pass randomUA and randomViewport to fetchStockXPage
      const html = await this.fetchStockXPage(url, randomUA, randomViewport);
      const products = this.parseStockXProducts(html, category);
      this.logProgress(`Found ${products.length} products in ${category.name} (page ${pageNum})`);
      if (!products.length) break;
      allProducts.push(...products);
      hasMore = products.length > 0;
      pageNum++;
      if (hasMore) {
        // Sleep 2-5 seconds randomly between pages
        const sleepMs = 2000 + Math.floor(Math.random() * 3000);
        await new Promise(res => setTimeout(res, sleepMs));
      }
    }
    return allProducts;
  }
}

// Main function
async function main() {
  const scraper = new StockXScraper();
  await scraper.run();
}

// CLI entry point
if (require.main === module) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

export { main, StockXScraper }; 