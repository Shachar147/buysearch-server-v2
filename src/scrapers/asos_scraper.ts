// asos_category_scraper.ts – v6 (database integration)
// =============================================================
// What's new
// ----------
// 1. **Auto‑discovers every category/sub‑category** via the navigation tree
//    endpoint and scans them one by one – no CLI args needed.
// 2. `categories` is now **an array** of the full category path
//    (e.g. `["Shoes", "Boots"]`).
// 3. Adds `currency` and `salePercent` (rounded discount %) per item.
// 4. Streams progress logs like:
//       Scanning category Shoes > Boots – 12/137 …
// 5. Saves everything to **PostgreSQL database** instead of JSON file.
// 6. Uses upsert operations for brands, categories, colors, and sources.
//
// -------------------------------------------------------------
// Quick start
//   npm run scrape:asos
// -------------------------------------------------------------

import axios, { AxiosInstance } from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { ProductService } from '../product/product.service';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// --- Type definitions ----------------------------------------------------
interface Category {
  id: number;
  name: string;
  gender: string;
}

interface CategoryWithPath {
  id: number;
  path: string[];
  gender: string;
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

interface Product {
  title: string;
  url: string;
  images: string[];
  colors: string[];
  isSellingFast?: boolean;
  price: number | null;
  oldPrice: number | null;
  salePercent: number | null;
  currency: string;
  brand?: string;
  categories: string[];
  gender: string;
  source: string;
}

interface ApiResponse {
  products?: RawProduct[];
}

// --- API endpoints ----------------------------------------------------
const CATEGORY_API_URL = 'https://www.asos.com/api/product/search/v2/categories/';
const NAV_TREE_URL = 'https://www.asos.com/api/fashion/navigation/v2/tree?lang=en-GB&country=GB&store=ROW&channel=desktop-web';

// --- Default headers (look like a real browser) -----------------------
const DEFAULT_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  Accept: 'application/json, text/plain, */*',
  Referer: 'https://www.asos.com/',
  Origin: 'https://www.asos.com',
  'Accept-Language': 'en-GB,en;q=0.9',
};

// --- Color helpers ----------------------------------------------------
const COLOR_KEYWORDS = [
  'black', 'white', 'red', 'blue', 'green', 'yellow', 'pink', 'purple',
  'orange', 'brown', 'grey', 'beige', 'navy', 'cream', 'khaki', 'turquoise', 'indigo',
  'burgundy', 'silver', 'gold', 'multi', 'mauve', 'teal', 'coral', 'mint', 'lavender'
];

// New: Map of keyword/phrase to canonical color
const COLOR_ALIASES: Record<string, string> = {
  'charcoal marl': 'grey',
  'off white': 'white',
  'stone': 'beige',
  'ivory': 'white',
  'midnight': 'navy',
  'taupe': 'beige',
  'camel': 'brown',
  'ecru': 'beige',
  'cream': 'cream', // already in keywords, but for completeness
  'chocolate': 'brown',
  'denim': 'blue',
  'olive': 'green',
  'mustard': 'yellow',
  'peach': 'pink',
  'wine': 'burgundy',
  'lilac': 'purple',
  'charcoal': 'grey',
  'marl': 'grey', // often used as 'grey marl', 'charcoal marl', etc.
  'gray': 'grey',
  'light moss': 'green',
  'in sage': 'green',
  'in anthracite': 'grey',
  'in washed asphalt': 'grey',
  'in stone': 'beige',
  'in tan': 'beige',
  'indigo': 'purple',
  'in sand': 'beige',
  'in rust': 'red',
  'in lime': 'yellow'
};

// --- Category detection keywords ---
const TITLE_CATEGORY_KEYWORDS: Record<string, string[]> = {
  'Boxers': ['boxers', 'trunks'],
  'Polo Shirts': ['polo shirt'],
  'Jackets & Coats': ['jacket'],
  'Joggers': ['joggers'],
  'Accessories': ['backpack', ' cap ', 'gloves'],
  'Bags': ['backpack'],
  'Hats': [' cap '],
  'Shoes': ['Slippers', 'Flip Flops', 'Sandals'],
  'Slippers': ['slippers']
  // Add more as needed
};

// --- Axios client with Cloudflare‑ready cookie jar --------------------
const jar = new CookieJar();
const client: AxiosInstance = wrapper(
  axios.create({
    headers: DEFAULT_HEADERS,
    jar,
    withCredentials: true,
    timeout: 30000,
  })
);

async function warmCookies(): Promise<void> {
  try {
    await client.get('https://www.asos.com/');
  } catch {
    console.warn('⚠️  Could not warm Cloudflare cookies – continuing anyway.');
  }
}

// ------------------- Static Categories ---------------------------
const MAIN_CATEGORIES: Category[] = [
  { id: 4209, name: 'Clothing', gender: 'Men' }, // V
  { id: 4208, name: 'Shoes', gender: 'Men' }, // V
  { id: 1111, name: 'By Brand', gender: 'Men' }, // V
  { id: 9999, name: 'Clothing', gender: 'Women'},
  { id: 8888, name: 'By Brand', gender: 'Women' }, // V
];

const SUBCATEGORIES: Record<number, Category[]> = {
  9999: [
    { id: 4169, name: 'Tops', gender: 'Women'}, // V
    { id: 8799, name: 'Dresses', gender: 'Women'}, // V
    { id: 2639, name: 'Skirts', gender: 'Women'}, // V
    { id: 9263, name: 'Shorts', gender: 'Women'}, // V
    { id: 2238, name: 'Swimwear', gender: 'Women'}, // V
    { id: 3630, name: 'Jeans', gender: 'Women'}, // V
    { id: 2641, name: 'Jackets & Coats', gender: 'Women'}, // V
    { id: 6046, name: 'Lingerie & Nightwear', gender: 'Women'}, // V
  ],
  8888: [
    { id: 12949, name: 'Abercrombie and Fitch', gender: 'Women'}, // V
    { id: 20848, name: 'Polo Ralph Lauren', gender: 'Women' },
    { id: 2505, name: 'Calvin Klein', gender: 'Women' },
    { id: 19146, name: 'Calvin Klein Jeans', gender: 'Women' },
    { id: 7294, name: 'Lacoste', gender: 'Women' },
    { id: 21378, name: 'Tommy Hilfiger', gender: 'Women' },
    { id: 50579, name: 'Tommy Jeans', gender: 'Women' },
    { id: 26768, name: 'AllSaints', gender: 'Women' },
  ],
  4209: [ // Clothing
    { id: 4208, name: 'Jeans', gender: 'Men' }, // V
    { id: 3606, name: 'Jackets & Coats', gender: 'Men' }, // V
    { id: 3602, name: 'Shirts', gender: 'Men' }, // V
    { id: 7616, name: 'T-Shirts & Vests', gender: 'Men' }, // V
    { id: 14274, name: 'Joggers', gender: 'Men' }, // V
    { id: 20317, name: 'Underwear', gender: 'Men' }, // V
  ],
  4208: [ // Shoes
    { id: 5774, name: 'Boots', gender: 'Men' }, // v
    { id: 5775, name: 'Trainers', gender: 'Men' }, // V
    { id: 6593, name: 'Sandals', gender: 'Men' }, // v
    { id: 14328, name: 'Slippers', gender: 'Men' }, // v
  ],
  1111: [ // by brand
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
    { id: 4564, name: 'Levi\'s', gender: 'Men' },
    { id: 3792, name: 'New Balance', gender: 'Men' },
    { id: 7475, name: 'New Era', gender: 'Men' },
  ]
  // 4250: [ // Accessories
  //   { id: 42501, name: 'Bags', gender: 'Unisex' },
  //   { id: 42502, name: 'Hats & Caps', gender: 'Unisex' },
  //   { id: 42503, name: 'Jewellery', gender: 'Unisex' },
  //   { id: 42504, name: 'Sunglasses', gender: 'Unisex' },
  //   { id: 42505, name: 'Watches', gender: 'Unisex' },
  //   { id: 42506, name: 'Belts', gender: 'Unisex' },
  // ],
};

function getCategories(): CategoryWithPath[] {
  const categories: CategoryWithPath[] = [];
  
  // Add main categories that don't have subcategories
  const mainCategoriesWithoutSubs = MAIN_CATEGORIES.filter(cat => !SUBCATEGORIES[cat.id]);
  mainCategoriesWithoutSubs.forEach(cat => {
    categories.push({ id: cat.id, path: [cat.name], gender: cat.gender });
  });
  
  // Add subcategories with their parent category path
  Object.entries(SUBCATEGORIES).forEach(([parentId, subs]) => {
    const parentCategory = MAIN_CATEGORIES.find(cat => cat.id === parseInt(parentId));
    if (parentCategory) {
      subs.forEach(sub => {
        // Filter out 'By Brand' from the path
        const path = [parentCategory.name, sub.name].filter(name => name !== 'By Brand');
        categories.push({ id: sub.id, path, gender: sub.gender });
      });
    }
  });
  
  return categories;
}

// ------------------- Product scraping core ---------------------------
async function fetchPage(categoryId: number, offset: number, limit: number = 72, retries: number = 3): Promise<RawProduct[]> {
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
  
  try {
    const { data } = await client.get<ApiResponse>(`${CATEGORY_API_URL}${categoryId}`, {
      params,
    });
    return data.products ?? [];
  } catch (err: any) {
    console.warn(
      `Error offset ${offset} cid ${categoryId}: ${err.response?.status || err.code} – ${err.message}`
    );
    if (retries > 0) {
      await new Promise((r) => setTimeout(r, 1500));
      return fetchPage(categoryId, offset, limit, retries - 1);
    }
    throw err;
  }
}

function prefixHttp(url?: string): string {
  return url?.startsWith('http') ? url : `http://${url}`;
}

function slugToColor(slug?: string): string | null {
  if (!slug) return null;
  const cleaned = slug.replace(/[^a-z]/gi, '').toLowerCase();
  if (!cleaned) return null;
  // try camel split
  const camel = cleaned.replace(/([a-z])([A-Z])/g, '$1 $2');
  return camel;
}

function calcSalePercent(price: number | null, salePrice: number | null): number | null {
  if (!salePrice || !price || salePrice <= price) return null;
  return Math.round(((salePrice - price) / salePrice) * 100);
}

function buildProductObj(raw: RawProduct, categoriesPath: string[], gender: string): {
  title: string;
  url: string;
  images: string[];
  colors: string[];
  isSellingFast: boolean;
  price: number | null;
  oldPrice: number | null;
  salePercent: number | null;
  currency: string;
  brand: string;
  categories: string[];
  gender: string;
  source: string;
} {
  const lowerTitle = raw.name.toLowerCase();
  const colorsSet = new Set(
    COLOR_KEYWORDS.filter((c) => new RegExp(`\\b${c}\\b`).test(lowerTitle))
  );
  // Add alias-based color detection
  for (const [alias, color] of Object.entries(COLOR_ALIASES)) {
    if (new RegExp(`\\b${alias}\\b`).test(lowerTitle)) {
      colorsSet.add(color);
    }
  }
  if (raw.colour && raw.colour.trim()) colorsSet.add(raw.colour.toLowerCase());

  // --- Category detection from title ---
  const detectedCategories = [...categoriesPath];
  for (const [category, keywords] of Object.entries(TITLE_CATEGORY_KEYWORDS)) {
    if (keywords.some(keyword => lowerTitle.includes(keyword))) {
      detectedCategories.push(category);
    }
  }
  // Add more keyword-category mappings as needed

  // Safely extract color from image URL
  // if (raw.imageUrl) {
  //   const slugColor = slugToColor(raw.imageUrl.split('/').pop()?.split('-').pop());
  //   if (slugColor) colorsSet.add(slugColor);
  // }

  const images: string[] = [];
  if (raw.imageUrl) {
    images.push(prefixHttp(raw.imageUrl));
  }
  if (raw.additionalImageUrls && Array.isArray(raw.additionalImageUrls)) {
    images.push(...raw.additionalImageUrls.map(prefixHttp));
  }
  
  const price = raw.price?.current?.value ?? null;
  const salePrice = raw.price?.previous?.value ?? raw.price?.rrp?.value ?? null;

  return {
    title: raw.name,
    url: `https://www.asos.com/${raw.url.replace(/^\/+/, '')}`,
    images,
    colors: Array.from(colorsSet),
    isSellingFast: raw.isSellingFast ?? false,
    price,
    oldPrice: salePrice,
    salePercent: calcSalePercent(price, salePrice),
    currency: raw.price?.currency ?? 'ILS',
    brand: raw.brandName ?? 'Unknown',
    categories: detectedCategories,
    gender,
    source: 'asos.com',
  };
}

async function scrapeSingleCategory(cat: CategoryWithPath): Promise<{
  title: string;
  url: string;
  images: string[];
  colors: string[];
  isSellingFast: boolean;
  price: number | null;
  oldPrice: number | null;
  salePercent: number | null;
  currency: string;
  brand: string;
  categories: string[];
  gender: string;
  source: string;
}[]> {
  const { id, path, gender } = cat;
  let offset = 0;
  const limit = 200;
  const items: {
    title: string;
    url: string;
    images: string[];
    colors: string[];
    isSellingFast: boolean;
    price: number | null;
    oldPrice: number | null;
    salePercent: number | null;
    currency: string;
    brand: string;
    categories: string[];
    gender: string;
    source: string;
  }[] = [];
  
  while (true) {
    const page = await fetchPage(id, offset, limit);
    if (!page.length) break;
    items.push(...page.map((p) => buildProductObj(p, path, gender)));
    offset += page.length;
  }
  
  return items;
}

// ------------------- Main orchestrator -------------------------------
async function main(): Promise<void> {
  // Initialize NestJS application
  const app = await NestFactory.createApplicationContext(AppModule);
  const productsService = app.get(ProductService);

  await warmCookies();

  console.log('Using static ASOS categories…');
  const categories = getCategories();
  console.log(`Found ${categories.length} categories to scan.`);

  let totalProcessed = 0;
  let totalNew = 0;
  let totalUpdated = 0;

  for (let i = 0; i < categories.length; i++) {
    const cat = categories[i];
    console.log(
      `Scanning category #${cat.id} - ${cat.path.join(' > ')} – ${i + 1}/${categories.length}`
    );
    try {
      const products = await scrapeSingleCategory(cat);
      console.log(`Found ${products.length} products`);
      
      // Process products and save to database
      let newProducts = 0;
      let updatedProducts = 0;
      
      for (const product of products) {
        try {
          await productsService.upsertProduct(product);
          totalProcessed++;
          newProducts++;
        } catch (error) {
          console.warn(`⚠️  Failed to save product ${product.url}: ${error.message}`);
        }
      }
      
      console.log(`📊 Processed: ${newProducts} products from this category`);
      totalNew += newProducts;
      
    } catch (e: any) {
      console.warn(`⚠️  Failed category ${cat.id}: ${e.message}`);
    }
  }

  console.log(`🎉 Final result: ${totalProcessed} products processed`);
  console.log(`📈 New products: ${totalNew}, Updated: ${totalUpdated}`);
  
  await app.close();
}

// ------------------- Run if CLI --------------------------------------
if (require.main === module) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

export { main, getCategories, scrapeSingleCategory, buildProductObj }; 