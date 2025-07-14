// factory54_scraper.ts – v1
// =============================================================
// Features:
// - Extends BaseScraper for common functionality
// - Scans categories (configurable)
// - Extracts product info (title, url, images, colors, price, brand, categories, gender, source)
// - Uses HTML parsing (cheerio) to extract data from DOM and dataLayer
// - Saves to PostgreSQL via ProductService
//
// Usage: npm run scrape:factory54

import axios from 'axios';
import * as cheerio from 'cheerio';
import { BaseScraper, Category } from './base-scraper';
import { Product, extractColorsWithHebrew, calcSalePercent, normalizeBrandName } from './scraper_utils';
import * as dotenv from 'dotenv';
dotenv.config();

// --- Category config ---
const CATEGORIES: Category[] = [
  {
    id: 'men-clothes-tshirt',
    name: 'T-Shirts & Vests',
    gender: 'Men',
    baseUrl: 'https://www.factory54.co.il/%D7%97%D7%95%D7%9C%D7%A6%D7%AA-%D7%98%D7%99',
    url: 'https://www.factory54.co.il/men-clothes-tshirt',
  },
  {
    id: 'men-clothes-swimwear',
    name: 'Swimwear',
    gender: 'Men',
    baseUrl: 'https://www.factory54.co.il/%D7%9E%D7%9B%D7%A0%D7%A1%D7%99-%D7%91%D7%92%D7%93-%D7%99%D7%9D',
    url: 'https://www.factory54.co.il/men-clothes-swimwear'
  },
  {
    id: 'men-clothes-guinness',
    name: 'Jeans',
    gender: 'Men',
    baseUrl: 'https://www.factory54.co.il/%D7%9E%D7%9B%D7%A0%D7%A1%D7%99-%D7%92%27%D7%99%D7%A0%D7%A1',
    url: 'https://www.factory54.co.il/men-clothes-guinness'
  }
  // Add more categories as needed
];

const BASE_URL = 'https://www.factory54.co.il';

class Factory54Scraper extends BaseScraper {
  protected readonly scraperName = 'Factory54';
  protected readonly source = 'factory54.co.il';

  protected getCategories(): Category[] {
    return CATEGORIES;
  }

  protected async scrapeCategory(category: Category): Promise<Product[]> {
    return this.scrapeFactory54Category(category);
  }

  private async fetchFactory54Page(url: string): Promise<string> {
    const { data } = await axios.get(url, {
      headers: {
        'accept': 'text/html,application/xhtml+xml,application/xml',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
      },
    });
    return data;
  }

  private extractProductCards($: cheerio.CheerioAPI): any[] {
    const products: any[] = [];
    $('.present-product.product').each((_, el) => {
      const data = $(el).attr('data-gtm-product');
      if (data) {
        try {
          products.push(JSON.parse(data));
        } catch (e) {
          this.logWarning('Failed to parse data-gtm-product JSON');
        }
      }
    });
    return products;
  }

  private extractImages($, itemId: string): string[] {
    const images: string[] = [];
    const pidSelector = `#pid-${itemId}`;
    const $pid = $(pidSelector);
    if ($pid.length) {
      $pid.find('img').each((_, img) => {
        const src = $(img).attr('data-primary-image-url') || $(img).attr('src');
        if (src && !images.includes(src)) images.push(src.startsWith('http') ? src : BASE_URL + src);
      });
      // Also check for hover image
      $pid.find('[data-hover-image-url]').each((_, el) => {
        const hover = $(el).attr('data-hover-image-url');
        if (hover && !images.includes(hover)) images.push(hover.startsWith('http') ? hover : BASE_URL + hover);
      });
    }
    return images;
  }

  private extractProductUrl($: cheerio.CheerioAPI, itemId: string): string | null {
    // Find the product card by id
    const pidSelector = `#pid-${itemId}`;
    const $pid = $(pidSelector);
    if ($pid.length) {
      // Find the first <a> with href ending in .html
      const $a = $pid.find('a[href$=".html"]').first();
      if ($a.length) {
        let href = $a.attr('href');
        if (href && !href.startsWith('http')) {
          href = BASE_URL + href;
        }
        return href || null;
      }
    }
    return null;
  }

  private parseFactory54Product(item: any, category: Category, $: cheerio.CheerioAPI): Product {
    const title = item.item_name || '';
    const itemId = item.item_category5 || item.item_id;
    // Use DOM-based URL extraction
    let url = this.extractProductUrl($, itemId);
    if (!url) {
      url = `${category.baseUrl}/${itemId}.html`;
    }
    const images = this.extractImages($, itemId);
    const colors = extractColorsWithHebrew(title, [item.item_variant].filter(Boolean), 'factory54_scraper');
    // Fix: price = item.price, oldPrice = item.salePrice
    const price = typeof item.price === 'number' ? item.price : (typeof item.salePrice === 'number' ? item.salePrice : null);
    const oldPrice = typeof item.salePrice === 'number' ? item.salePrice : null;
    const salePercent = calcSalePercent(price, oldPrice) ?? 0;
    const currency = item.currency || 'ILS';
    const brand = normalizeBrandName(item.item_brand || 'Unknown');
    const categories = [category.name, item.item_category, item.item_category2, item.item_category3, item.item_category4].filter(Boolean);
    const gender = category.gender;

    const product = {
        title,
        url,
        images,
        colors,
        isSellingFast: false,
        price,
        oldPrice,
        salePercent,
        currency,
        brand,
        categories,
        gender,
      };
    return this.createProduct(product);
  }

  private async scrapeFactory54Category(category: Category): Promise<Product[]> {
    let page = 0;
    let allProducts: Product[] = [];
    let hasMore = true;
    const pageSize = 48; // Factory54 uses ?start=48, ?start=96, etc.

    while (hasMore) {
      const url = `${category.url}${page > 0 ? `?start=${page * pageSize}` : ''}`;
      this.logProgress(`Fetching ${url}`);
      const html = await this.fetchFactory54Page(url);
      const presentProductCount = (html.match(/<div class=\"present-product product/g) || []).length;
      this.logProgress(`present-product product divs found: ${presentProductCount}`);
      const $ = cheerio.load(html);
      const items = this.extractProductCards($);
      this.logProgress(`extractProductCards found: ${items.length} items`);
      if (!items.length) break;
      allProducts.push(...items.map((item: any) => this.parseFactory54Product(item, category, $)));
      // If less than pageSize items, it's the last page
      hasMore = items.length === pageSize;
      page++;
    }
    return allProducts;
  }
}

// Main function
async function main() {
  const scraper = new Factory54Scraper();
  await scraper.run();
}

// CLI entry point
if (require.main === module) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

export { main, Factory54Scraper }; 