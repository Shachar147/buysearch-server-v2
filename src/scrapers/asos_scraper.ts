// asos_scraper.ts – v7 (using BaseScraper)
// =============================================================
// Features:
// - Extends BaseScraper for common functionality
// - Auto‑discovers every category/sub‑category via the navigation tree
// - Scans categories one by one with progress tracking
// - Uses both API info and keyword/alias enrichment
// - Saves to PostgreSQL database with upsert operations
//
// Usage: npm run scrape:asos

import axios, { AxiosInstance } from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';
import { BaseScraper } from './base/base-scraper';
import { Category as CategoryType } from './base/base-scraper';
import {
  Product,
  calcSalePercent,
  prefixHttp,
  normalizeBrandName,
} from './base/scraper_utils';
import * as dotenv from 'dotenv';
import { Category } from '../category.constants';
import { extractColors } from '../color.constants';
dotenv.config();

// --- Type definitions ---
interface CategoryWithPath extends CategoryType {
  path: string[];
}

interface RawProduct {
  name: string;
  url: string;
  imageUrl?: string;
  additionalImageUrls?: string[];
  colour?: string;
  isSellingFast?: boolean;
  price?: {
    current?: { value: number };
    previous?: { value: number };
    rrp?: { value: number };
    currency?: string;
  };
  brandName?: string;
}

interface ApiResponse {
  products?: RawProduct[];
}

// --- API endpoints ---
const CATEGORY_API_URL =
  'https://www.asos.com/api/product/search/v2/categories/';

// --- Default headers ---
const DEFAULT_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  Accept: 'application/json, text/plain, */*',
  Referer: 'https://www.asos.com/',
  Origin: 'https://www.asos.com',
  'Accept-Language': 'en-GB,en;q=0.9',
};

// --- Category detection keywords ---
const TITLE_CATEGORY_KEYWORDS: Record<string, string[]> = {
  Boxers: ['boxers', 'trunks'],
  'Polo Shirts': ['polo shirt'],
  'Jackets & Coats': ['jacket'],
  Joggers: ['joggers'],
  Accessories: ['backpack', ' cap ', 'gloves'],
  Bags: ['backpack'],
  Hats: [' cap '],
  Shoes: ['Slippers', 'Flip Flops', 'Sandals'],
  Slippers: ['slippers'],
};

// --- Static Categories ---
const MAIN_CATEGORIES: CategoryType[] = [
  { id: 4209, name: Category.CLOTHING, gender: 'Men' },
  { id: 4208, name: Category.SHOES, gender: 'Men' },
  { id: 1111, name: Category.BY_BRAND, gender: 'Men' },
  { id: 9999, name: Category.CLOTHING, gender: 'Women' },
  { id: 8888, name: Category.BY_BRAND, gender: 'Women' },
];

const SUBCATEGORIES: Record<number, CategoryType[]> = {
  9999: [
    { id: 4169, name: Category.TOPS, gender: 'Women' },
    { id: 8799, name: Category.DRESSES, gender: 'Women' },
    { id: 2639, name: Category.SKIRTS, gender: 'Women' },
    { id: 9263, name: Category.SHORTS, gender: 'Women' },
    { id: 2238, name: Category.SWIMWEAR, gender: 'Women' },
    { id: 3630, name: Category.JEANS, gender: 'Women' },
    { id: 2641, name: Category.JACKETS_COATS, gender: 'Women' },
    { id: 6046, name: Category.LINGERIE, gender: 'Women' },
    { id: 21867, name: Category.SLEEP_WEAR, gender: 'Women' },
  ],
  8888: [
    { id: 12949, name: 'Abercrombie and Fitch', gender: 'Women' },
    { id: 20848, name: 'Polo Ralph Lauren', gender: 'Women' },
    { id: 2505, name: 'Calvin Klein', gender: 'Women' },
    { id: 19146, name: 'Calvin Klein Jeans', gender: 'Women' },
    { id: 7294, name: 'Lacoste', gender: 'Women' },
    { id: 21378, name: 'Tommy Hilfiger', gender: 'Women' },
    { id: 50579, name: 'Tommy Jeans', gender: 'Women' },
    { id: 26768, name: 'AllSaints', gender: 'Women' },
  ],
  4209: [
    // Clothing
    { id: 4208, name: Category.JEANS, gender: 'Men' }, // V
    { id: 3606, name: Category.JACKETS_COATS, gender: 'Men' }, // V
    { id: 3602, name: Category.SHIRTS, gender: 'Men' }, // V
    { id: 7616, name: Category.T_SHIRTS, gender: 'Men' }, // V
    { id: 14274, name: Category.JOGGERS, gender: 'Men' }, // V
    { id: 13210, name: Category.SWIMWEAR, gender: 'Men' }, // V
    { id: 5668, name: Category.SWEATERS, gender: 'Men' }, // V
    { id: 7617, name: Category.KNITWEAR, gender: 'Men' }, // V
    { id: 18797, name: Category.SLEEP_WEAR, gender: 'Men' }, // V
    { id: 4616, name: Category.POLO_SHIRTS, gender: 'Men' },
    { id: 16329, name: Category.SOCKS, gender: 'Men' },
    { id: 20317, name: Category.UNDERWEAR, gender: 'Men' },

    // { id: 7046, name: "Sale", gender: "Women"} <- 50k
    // { id: 8409, name: "Sale", gender: "Women"} <- 19k
  ],
  4208: [
    // Shoes
    { id: 5774, name: Category.BOOTS, gender: 'Men' }, // v
    { id: 5775, name: Category.TRAINERS, gender: 'Men' }, // V
    { id: 6593, name: Category.SANDALS, gender: 'Men' }, // v
    { id: 14328, name: Category.SLIPPERS, gender: 'Men' }, // v
    { id: 6455, name: Category.BOOTS, gender: 'Women' },
    { id: 6461, name: Category.HEELS, gender: 'Women' },
    { id: 6456, name: Category.TRAINERS, gender: 'Women' },
  ],
  1111: [
    // by brand
    { id: 4280, name: 'Polo Ralph Lauren', gender: 'Men' },
    { id: 2038, name: 'Calvin Klein', gender: 'Men' },
    { id: 50577, name: 'Calvin Klein Jeans', gender: 'Men' },
    { id: 7368, name: 'Lacoste', gender: 'Men' },
    { id: 5247, name: 'Tommy Hilfiger', gender: 'Men' },
    { id: 50580, name: 'Tommy Jeans', gender: 'Men' },
    { id: 19971, name: 'Abercrombie and Fitch', gender: 'Men' },
    { id: 11039, name: 'AllSaints', gender: 'Men' },
    { id: 20366, name: 'Champion', gender: 'Men' },
    { id: 28479, name: 'Collusion', gender: 'Men' },
    { id: 2084, name: 'Converse', gender: 'Men' },
    { id: 19763, name: 'Ellesse', gender: 'Men' },
    { id: 20855, name: 'Hollister', gender: 'Men' },
    { id: 19695, name: 'Jordan', gender: 'Men' },
    { id: 4564, name: "Levi's", gender: 'Men' },
    { id: 3792, name: 'New Balance', gender: 'Men' },
    { id: 7475, name: 'New Era', gender: 'Men' },
  ],
  // 4250: [ // Accessories
  //   { id: 42501, name: 'Bags', gender: 'Unisex' },
  //   { id: 42502, name: 'Hats & Caps', gender: 'Unisex' },
  //   { id: 42503, name: 'Jewellery', gender: 'Unisex' },
  //   { id: 42504, name: 'Sunglasses', gender: 'Unisex' },
  //   { id: 42505, name: 'Watches', gender: 'Unisex' },
  //   { id: 42506, name: 'Belts', gender: 'Unisex' },
  // ],
};

class ASOSScraper extends BaseScraper {
  protected readonly scraperName = 'ASOS';
  protected readonly source = 'Asos';

  private client: AxiosInstance;
  private jar: CookieJar;

  constructor() {
    super();
    // Initialize Axios client with Cloudflare‑ready cookie jar
    this.jar = new CookieJar();
    this.client = wrapper(
      axios.create({
        headers: DEFAULT_HEADERS,
        jar: this.jar,
        withCredentials: true,
        timeout: 30000,
      }),
    );
  }

  protected async initialize(): Promise<void> {
    await this.warmCookies();
  }

  protected getCategories(): CategoryType[] {
    return this.getCategoriesWithPath();
  }

  protected async scrapeCategory(category: CategoryType): Promise<Product[]> {
    return this.scrapeSingleCategory(category as CategoryWithPath);
  }

  private async warmCookies(): Promise<void> {
    try {
      await this.client.get('https://www.asos.com/');
    } catch {
      this.logWarning('Could not warm Cloudflare cookies – continuing anyway.');
    }
  }

  private getCategoriesWithPath(): CategoryWithPath[] {
    const categories: CategoryWithPath[] = [];

    for (const mainCat of MAIN_CATEGORIES) {
      const subcats = SUBCATEGORIES[mainCat.id] || [];

      if (subcats.length === 0) {
        // Main category with no subcategories
        categories.push({
          ...mainCat,
          path: [mainCat.name],
        });
      } else {
        // Add subcategories with full path
        for (const subcat of subcats) {
          categories.push({
            ...subcat,
            path: [mainCat.name, subcat.name],
          });
        }
      }
    }

    return categories;
  }

  private async fetchPage(
    categoryId: number,
    offset: number,
    limit = 72,
    retries = 3,
  ): Promise<RawProduct[]> {
    const params = {
      channel: 'desktop-web',
      store: 'ROW',
      country: 'IL',
      lang: 'en-GB',
      currency: 'ILS',
      limit,
      offset,
      includeNonPurchasableTypes: 'restocking',
    };

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const url = `${CATEGORY_API_URL}${categoryId}?limit=${limit}&offset=${offset}`;
        const response = await this.client.get<ApiResponse>(url, { params });
        return response.data.products || [];
      } catch (error) {
        if (attempt === retries) throw error;
        this.logWarning(
          `Attempt ${attempt} failed for category ${categoryId}, retrying...`,
        );
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }
    return [];
  }

  private buildProductObj(
    raw: RawProduct,
    categoriesPath: string[],
    gender: string,
  ): Product {
    const lowerTitle = raw.name.toLowerCase();
    const colorsSet = new Set(
      extractColors(lowerTitle, raw.colour ? [raw.colour] : []),
    );

    // --- Category detection from title ---
    const detectedCategories = [...categoriesPath];
    for (const [category, keywords] of Object.entries(
      TITLE_CATEGORY_KEYWORDS,
    )) {
      if (keywords.some((keyword) => lowerTitle.includes(keyword))) {
        detectedCategories.push(category);
      }
    }

    const images: string[] = [];
    if (raw.imageUrl) {
      images.push(prefixHttp(raw.imageUrl));
    }
    if (raw.additionalImageUrls && Array.isArray(raw.additionalImageUrls)) {
      images.push(...raw.additionalImageUrls.map(prefixHttp));
    }

    const price = raw.price?.current?.value ?? null;
    const salePrice =
      raw.price?.previous?.value ?? raw.price?.rrp?.value ?? null;

    if (!raw.name || !raw.url || !price) {
      console.log('No name or url or price for product', raw);
      return;
    }

    return this.createProduct({
      title: raw.name,
      url: `https://www.asos.com/${raw.url.replace(/^\/+/, '')}`,
      images,
      colors: Array.from(colorsSet),
      isSellingFast: raw.isSellingFast ?? false,
      price,
      oldPrice: salePrice,
      salePercent: calcSalePercent(price, salePrice),
      currency: raw.price?.currency ?? 'ILS',
      brand: normalizeBrandName(raw.brandName ?? 'Unknown'),
      categories: detectedCategories,
      gender,
    });
  }

  private async scrapeSingleCategory(
    cat: CategoryWithPath,
  ): Promise<Product[]> {
    const { id, path, gender } = cat;
    let offset = 0;
    const limit = 200;
    const items: Product[] = [];

    while (true) {
      const page = await this.fetchPage(id as number, offset, limit);
      if (!page.length) break;

      items.push(...page.map((p) => this.buildProductObj(p, path, gender)));
      offset += page.length;
    }

    return items;
  }
}

// Main function
async function main(): Promise<void> {
  const scraper = new ASOSScraper();
  await scraper.run();
}

// CLI entry point
if (require.main === module) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

export { main, ASOSScraper };
