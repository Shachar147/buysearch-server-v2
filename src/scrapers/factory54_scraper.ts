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
import { BaseScraper } from './base/base-scraper';
import { Category as CategoryType } from './base/base-scraper';
import { Product, extractColorsWithHebrew, calcSalePercent, normalizeBrandName, extractCategory } from './base/scraper_utils';
import * as dotenv from 'dotenv';
import { Category } from '../category.constants';
dotenv.config();

// --- Category config ---
const CATEGORIES: CategoryType[] = [
  {
    id: 'men-clothes-tshirt',
    name: Category.T_SHIRTS,
    gender: 'Men',
    baseUrl: 'https://www.factory54.co.il/%D7%97%D7%95%D7%9C%D7%A6%D7%AA-%D7%98%D7%99',
    url: 'https://www.factory54.co.il/men-clothes-tshirt',
  },
  {
    id: 'men-clothes-swimwear',
    name: Category.SWIMWEAR,
    gender: 'Men',
    baseUrl: 'https://www.factory54.co.il/%D7%9E%D7%9B%D7%A0%D7%A1%D7%99-%D7%91%D7%92%D7%93-%D7%99%D7%9D',
    url: 'https://www.factory54.co.il/men-clothes-swimwear'
  },
  {
    id: 'men-clothes-guinness',
    name: Category.JEANS,
    gender: 'Men',
    baseUrl: 'https://www.factory54.co.il/%D7%9E%D7%9B%D7%A0%D7%A1%D7%99-%D7%92%27%D7%99%D7%A0%D7%A1',
    url: 'https://www.factory54.co.il/men-clothes-guinness'
  },
  {
    id: 'men-shoes',
    name: Category.SHOES,
    gender: 'Men',
    baseUrl: 'https://www.factory54.co.il/%D7%A0%D7%A2%D7%9C%D7%99-%D7%A1%D7%A0%D7%99%D7%A7%D7%A8%D7%A1',
    url: 'https://www.factory54.co.il/men-shoes'
  },
  {
    id: 'men-accessories',
    name: Category.ACCESSORIES,
    gender: 'Men',
    url: 'https://www.factory54.co.il/men-accessories',
    baseUrl: 'https://www.factory54.co.il/%D7%AA%D7%99%D7%A7'
  },
  {
    id: 'men-clothes-poloshirts',
    name: Category.POLO_SHIRTS,
    gender: 'Men',
    url: 'https://www.factory54.co.il/men-clothes-poloshirts',
    baseUrl: 'https://www.factory54.co.il/%D7%97%D7%95%D7%9C%D7%A6%D7%94-%D7%A4%D7%95%D7%9C%D7%95'
  },
  {
    id: 'men-clothes-sweatshirts',
    name: Category.SWEATERS,
    gender: 'Men',
    url: 'https://www.factory54.co.il/men-clothes-sweatshirts',
    baseUrl: 'https://www.factory54.co.il/%D7%A1%D7%95%D7%95%D7%98%D7%A9%D7%99%D7%A8%D7%98'
  },
  {
    id: 'men-clothes-pants',
    name: Category.PANTS,
    gender: 'Men',
    url: 'https://www.factory54.co.il/men-clothes-pants',
    baseUrl: 'https://www.factory54.co.il/%D7%9E%D7%9B%D7%A0%D7%A1%D7%99%D7%99%D7%9D'
  },
  {
    id: 'men-lingerie-boxers',
    name: Category.LINGERIE,
    gender: 'Men',
    url: 'https://www.factory54.co.il/men/lingerie/boxers',
    baseUrl: 'https://www.factory54.co.il/%D7%91%D7%95%D7%A7%D7%A1%D7%A8%D7%99%D7%9D'
  },
  {
    id: 'men-lingerie-pajamas',
    name: Category.SLEEP_WEAR,
    gender: 'Men',
    url: 'https://www.factory54.co.il/men/lingerie/pajamas',
    baseUrl: 'https://www.factory54.co.il'
  },
  {
    id: 'men-gifts',
    name: Category.GIFTS,
    gender: 'Men',
    url: 'https://www.factory54.co.il/men-gifts',
    baseUrl: 'https://www.factory54.co.il'
  },
  {
    id: 'men-lifestyle',
    name: Category.HOME,
    gender: 'Men',
    url: 'https://www.factory54.co.il/men-lifestyle',
    baseUrl: 'https://www.factory54.co.il'
  },
  {
    id: 'women-designers-lululemon',
    name: 'Lulu Melon',
    gender: 'Women',
    url: 'https://www.factory54.co.il/women-designers-lululemon',
    baseUrl: 'https://www.factory54.co.il'
  },
  {
    id: 'women-designers-tommyhilfiger',
    name: 'Tommy Hilfiger',
    gender: 'Women',
    url: 'https://www.factory54.co.il/women-designers-tommyhilfiger',
    baseUrl: 'https://www.factory54.co.il'
  },
  {
    id: 'women-designers-poloralphlauren',
    name: 'Ralph Lauren',
    gender: 'Women',
    url: 'https://www.factory54.co.il/women-designers-poloralphlauren',
    baseUrl: 'https://www.factory54.co.il'
  },
  {
    id: 'women-designers-calvinklein',
    name: 'Calvin Klein',
    gender: 'Women',
    url: 'https://www.factory54.co.il/women-designers-calvinklein',
    baseUrl: 'https://www.factory54.co.il'
  },
  {
    id: 'women-clothes-swimwear',
    name: Category.SWIMWEAR,
    gender: 'Women',
    url: 'https://www.factory54.co.il/women-clothes-swimwear',
    baseUrl: 'https://www.factory54.co.il'
  },
  {
    id: 'women-shoes',
    name: Category.SHOES,
    gender: 'Women',
    url: 'https://www.factory54.co.il/women-shoes',
    baseUrl: 'https://www.factory54.co.il'
  },
  {
    id: 'women-bags',
    name: Category.BAGS,
    gender: 'Women',
    url: 'https://www.factory54.co.il/women-bags',
    baseUrl: 'https://www.factory54.co.il'
  },
  {
    id: 'women-accessories',
    name: Category.ACCESSORIES,
    gender: 'Women',
    url: 'https://www.factory54.co.il/women-accessories',
    baseUrl: 'https://www.factory54.co.il'
  },
  {
    id: 'women-lingerie',
    name: Category.LINGERIE,
    gender: 'Women',
    url: 'https://www.factory54.co.il/women-lingerie',
    baseUrl: 'https://www.factory54.co.il'
  },
  {
    id: 'women-lifestyle',
    name: Category.HOME,
    gender: 'Women',
    url: 'https://www.factory54.co.il/women-lifestyle',
    baseUrl: 'https://www.factory54.co.il'
  },
  {
    id: 'women-gifts',
    name: Category.GIFTS,
    gender: 'Women',
    url: 'https://www.factory54.co.il/women-gifts',
    baseUrl: 'https://www.factory54.co.il'
  },
  {
    id: 'women-saless25',
    name: 'Sale',
    gender: 'Women',
    url: 'https://www.factory54.co.il/women-saless25',
    baseUrl: 'https://www.factory54.co.il'
  },
  {
    id: 'women-newin',
    name: 'New',
    gender: 'Women',
    url: 'https://www.factory54.co.il/women-newin',
    baseUrl: 'https://www.factory54.co.il'
  },
  {
    id: 'men-saless25',
    name: 'Sale',
    gender: 'Men',
    url: 'https://www.factory54.co.il/men-saless25',
    baseUrl: 'https://www.factory54.co.il'
  },
  {
    id: 'men-designers-poloralphlauren',
    name: 'Polo Ralph Lauren',
    gender: 'Men',
    url: 'https://www.factory54.co.il/men-designers-poloralphlauren',
    baseUrl: 'https://www.factory54.co.il'
  },
  {
    id: 'men-designers-tommyhilfiger',
    name: 'Tommy Hilfiger',
    gender: 'Men',
    url: 'https://www.factory54.co.il/men-designers-tommyhilfiger',
    baseUrl: 'https://www.factory54.co.il'
  },
  {
    id: 'men-designers-lacoste',
    name: 'Lacoste',
    gender: 'Men',
    url: 'https://www.factory54.co.il/men-designers-lacoste',
    baseUrl: 'https://www.factory54.co.il'
  },
  {
    id: 'men-designers-calvinklein',
    name: 'Calvin Klein',
    gender: 'Men',
    url: 'https://www.factory54.co.il/men-designers-calvinklein',
    baseUrl: 'https://www.factory54.co.il'
  }
  // Add more categories as needed
];

const BASE_URL = 'https://www.factory54.co.il';

class Factory54Scraper extends BaseScraper {
  protected readonly scraperName = 'Factory54';
  protected readonly source = 'Factory54';

  protected getCategories(): CategoryType[] {
    return CATEGORIES;
  }

  protected async scrapeCategory(category: CategoryType): Promise<Product[]> {
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

  private parseFactory54Product(item: any, category: CategoryType, $: cheerio.CheerioAPI): Product {
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

    const categories = [category.name, ...extractCategory(item.item_category), ...extractCategory(item.item_category2), ...extractCategory(item.item_category3), ...extractCategory(item.item_category4)].filter(Boolean);
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

  private async scrapeFactory54Category(category: CategoryType): Promise<Product[]> {
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