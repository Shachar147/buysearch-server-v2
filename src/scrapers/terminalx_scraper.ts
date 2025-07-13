// terminalx_scraper.ts – v1 (database integration)
// =============================================================
// Features:
// - Scans categories (configurable)
// - Extracts product info (title, url, images, colors, price, brand, categories, gender, source)
// - Uses both API info and keyword/alias enrichment (like ASOS)
// - Saves to PostgreSQL via ProductService
//
// Usage: npm run scrape:terminalx

import axios from 'axios';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { ProductService } from '../product/product.service';
import * as dotenv from 'dotenv';
dotenv.config();

// --- Type definitions (same as ASOS) ---
interface Product {
  title: string;
  url: string;
  images: string[];
  colors: string[];
  isSellingFast: boolean;
  price: number;
  oldPrice: number;
  salePercent: number;
  currency: string;
  brand: string;
  categories: string[];
  gender: string;
  source: string;
}

// --- Color helpers (reuse from ASOS) ---
const COLOR_KEYWORDS = [
  'black', 'white', 'red', 'blue', 'green', 'yellow', 'pink', 'purple',
  'orange', 'brown', 'grey', 'beige', 'navy', 'cream', 'khaki', 'turquoise', 'indigo',
  'burgundy', 'silver', 'gold', 'multi', 'mauve', 'teal', 'coral', 'mint', 'lavender'
];
const COLOR_ALIASES: Record<string, string> = {
  'charcoal marl': 'grey', 'off white': 'white', 'stone': 'beige', 'ivory': 'white',
  'midnight': 'navy', 'taupe': 'beige', 'camel': 'brown', 'ecru': 'beige', 'cream': 'cream',
  'chocolate': 'brown', 'denim': 'blue', 'olive': 'green', 'mustard': 'yellow', 'peach': 'pink',
  'wine': 'burgundy', 'lilac': 'purple', 'charcoal': 'grey', 'marl': 'grey', 'gray': 'grey',
  'light moss': 'green', 'in sage': 'green', 'in anthracite': 'grey', 'in washed asphalt': 'grey',
  'in stone': 'beige', 'in tan': 'beige', 'indigo': 'purple', 'in sand': 'beige', 'in rust': 'red',
  'in lime': 'yellow'
};

// --- Category config (add more as needed) ---
const CATEGORIES = [
  { id: '17486', name: 'Swimwear', gender: 'Men', baseUrl: 'men/swimwear/' },
  // Add more categories here
];

const categoryIdToName = CATEGORIES.reduce((acc, c) => {
    acc[c.id] = c.name; 
    return acc;
}, {})

const BASE_URL = 'https://www.terminalx.com/a/listingSearch';

async function fetchTerminalXPage(categoryId: string, page: number, pageSize: number = 24) {
  const body = {
    listingSearchQuery: {
      categoryId,
      filter: { category_id: { eq: categoryId } },
      pageSize,
      currentPage: page,
      sort: { default: true },
      includeAggregations: false,
    }
  };
  const { data } = await axios.post(BASE_URL, body, {
    headers: {
      'accept': 'application/json, text/plain, */*',
      'content-type': 'application/json;charset=UTF-8',
      'origin': 'https://www.terminalx.com',
      'referer': `https://www.terminalx.com/men/swimwear`,
      'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
    }
  });
  return data.data.elasticSearch;
}

function extractColors(title: string, apiColors: string[]): string[] {
  const lowerTitle = title.toLowerCase();
  const colorsSet = new Set(apiColors.map(c => c.toLowerCase()));
  // Add keyword-based detection
  COLOR_KEYWORDS.forEach((c) => {
    if (lowerTitle.includes(c)) colorsSet.add(c);
  });
  // Add alias-based detection
  for (const [alias, color] of Object.entries(COLOR_ALIASES)) {
    if (lowerTitle.includes(alias)) colorsSet.add(color);
  }
  return Array.from(colorsSet);
}

function calcSalePercent(price: number | null, oldPrice: number | null): number | null {
  if (!oldPrice || !price || oldPrice <= price) return null;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}

function parseTerminalXProduct(item: any, categoryPath: string[], gender: string, baseUrl: string): Product {
  // Use item.name, or fallback to item.image?.label, or empty string
  const title = item.name || item.image?.label || '';
  const images: string[] = [];
  if (item.image?.url) images.push(item.image.url);
  if (item.media_gallery) images.push(...item.media_gallery.map((img: any) => img.url));
  const apiColors = item.configurable_options?.find((opt: any) => opt.attribute_code === 'color')?.values?.map((v: any) => v.label) || [];
  const colors = extractColors(title, apiColors);
  const price = item.price_range?.minimum_price?.final_price?.value ?? 0;
  const oldPrice = item.price_range?.minimum_price?.regular_price?.value ?? 0;

  const categories = Array.from(new Set([
    ...categoryPath,
    ...item.category_ids.map((c_id) => categoryIdToName[Number(c_id)]).filter(Boolean)
  ]));

  console.log(item);

  console.log("hereee", {
    title,
    url: `https://www.terminalx.com/${baseUrl}/${item.sku.toLowerCase()}`,
    images,
    colors,
    isSellingFast: false, // Not available in API
    price,
    oldPrice,
    salePercent: calcSalePercent(price, oldPrice) ?? 0,
    currency: item.price_range?.minimum_price?.final_price?.currency ?? 'ILS',
    brand: item.brand_url?.name || undefined,
    categories,
    gender,
    source: 'terminalx.com',
  })

  return {
    title,
    url: `https://www.terminalx.com/${baseUrl}/${item.sku.toLowerCase()}`,
    images,
    colors,
    isSellingFast: false, // Not available in API
    price,
    oldPrice,
    salePercent: calcSalePercent(price, oldPrice) ?? 0,
    currency: item.price_range?.minimum_price?.final_price?.currency ?? 'ILS',
    brand: item.brand_url?.name || undefined,
    categories,
    gender,
    source: 'terminalx.com',
  };
}

async function scrapeTerminalXCategory(cat: { id: string; name: string; gender: string; baseUrl: string }) {
  let page = 1;
  let totalPages = 1;
  let allProducts: Product[] = [];
  do {
    const result = await fetchTerminalXPage(cat.id, page);
    const items = result.items || [];
    totalPages = result.page_info?.total_pages || 1;
    console.log(`TerminalX: Scanning ${cat.name} page ${page}/${totalPages} (${items.length} items)`);
    allProducts.push(...items.map((item: any) => parseTerminalXProduct(item, [cat.name], cat.gender, cat.baseUrl)));
    page++;
  } while (page <= totalPages);
  return allProducts;
}

// Main orchestrator
async function main() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const productsService = app.get(ProductService);

  let totalProcessed = 0;
  for (const cat of CATEGORIES) {
    try {
      const products = await scrapeTerminalXCategory(cat);
      let newProducts = 0;
      for (const product of products) {
        try {
          await productsService.upsertProduct(product);
          newProducts++;
        } catch (e) {
          console.warn(`Failed to save product ${product.url}: ${e.message}`);
        }
      }
      totalProcessed += newProducts;
      console.log(`TerminalX: ${newProducts} products processed for category ${cat.name}`);
    } catch (e) {
      console.warn(`TerminalX: Failed category ${cat.name}: ${e.message}`);
    }
  }
  console.log(`TerminalX: ${totalProcessed} products processed in total.`);
  await app.close();
}

if (require.main === module) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

export { main, scrapeTerminalXCategory }; 