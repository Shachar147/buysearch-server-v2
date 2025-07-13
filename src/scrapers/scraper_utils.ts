// Common utilities for scrapers
// =============================================================

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { ProductService } from '../product/product.service';
import { ScrapingHistoryService, ScrapingType } from '../scraping-history/scraping-history.service';

// --- Common Types ---
export interface Product {
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
}

export interface ScrapingResult {
  created: number;
  updated: number;
  total: number;
}

// --- Color Utilities ---
export const COLOR_KEYWORDS = [
  'black', 'white', 'red', 'blue', 'green', 'yellow', 'pink', 'purple',
  'orange', 'brown', 'grey', 'beige', 'navy', 'cream', 'khaki', 'turquoise', 'indigo',
  'burgundy', 'silver', 'gold', 'multi', 'mauve', 'teal', 'coral', 'mint', 'lavender'
];

export const COLOR_ALIASES: Record<string, string> = {
  'charcoal marl': 'grey', 'off white': 'white', 'stone': 'beige', 'ivory': 'white',
  'midnight': 'navy', 'taupe': 'beige', 'camel': 'brown', 'ecru': 'beige', 'cream': 'cream',
  'chocolate': 'brown', 'denim': 'blue', 'olive': 'green', 'mustard': 'yellow', 'peach': 'pink',
  'wine': 'burgundy', 'lilac': 'purple', 'charcoal': 'grey', 'marl': 'grey', 'gray': 'grey',
  'light moss': 'green', 'in sage': 'green', 'in anthracite': 'grey', 'in washed asphalt': 'grey',
  'in stone': 'beige', 'in tan': 'beige', 'indigo': 'purple', 'in sand': 'beige', 'in rust': 'red',
  'in lime': 'yellow'
};

// --- Utility Functions ---
export function extractColors(title: string, apiColors: string[]): string[] {
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

export function calcSalePercent(price: number | null, oldPrice: number | null): number | null {
  if (!oldPrice || !price || oldPrice <= price) return null;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}

export function prefixHttp(url?: string): string {
  return url?.startsWith('http') ? url : `http://${url}`;
}

export function slugToColor(slug?: string): string | null {
  if (!slug) return null;
  const cleaned = slug.replace(/[^a-z]/gi, '').toLowerCase();
  if (!cleaned) return null;
  // try camel split
  const camel = cleaned.replace(/([a-z])([A-Z])/g, '$1 $2');
  return camel;
}

// --- Scraping Session Management ---
export async function createScrapingSession(
  scraperName: string,
  scrapingHistoryService: ScrapingHistoryService
): Promise<{ session: any; startTime: Date }> {
  const startTime = new Date();
  console.log(`${scraperName}: Starting scan at ${startTime.toISOString()}`);
  
  // Detect if running from cron service
  const isAutoRun = process.argv.includes('--cron');
  const scrapingType = isAutoRun ? ScrapingType.AUTO : ScrapingType.MANUAL;
  
  // Create scraping session
  const session = await scrapingHistoryService.createScrapingSession(scraperName, scrapingType);
  console.log(`📊 Created scraping session #${session.id} (${scrapingType})`);
  
  return { session, startTime };
}

export async function finishScrapingSession(
  session: any,
  totalNew: number,
  totalUpdated: number,
  startTime: Date,
  scraperName: string,
  scrapingHistoryService: ScrapingHistoryService
): Promise<void> {
  const endTime = new Date();
  const totalSeconds = Math.round((endTime.getTime() - startTime.getTime()) / 1000);
  
  // Finish scraping session
  await scrapingHistoryService.finishScrapingSession(session.id, totalNew, totalUpdated);
  
  console.log(`${scraperName}: ${totalNew + totalUpdated} products processed in total.`);
  console.log(`🟢 CREATED: ${totalNew}, 🟡 UPDATED: ${totalUpdated}`);
  console.log(`📊 Progress: ${session.progress || 0}% complete`);
  console.log(`⏱️  Scan completed in ${totalSeconds} seconds (${startTime.toISOString()} → ${endTime.toISOString()})`);
}

// --- NestJS App Context ---
export async function createAppContext() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const productsService = app.get(ProductService);
  const scrapingHistoryService = app.get(ScrapingHistoryService);
  
  return { app, productsService, scrapingHistoryService };
}

// --- Product Processing ---
export async function processProducts(
  products: Product[],
  productsService: ProductService
): Promise<ScrapingResult> {
  let newProducts = 0;
  let updatedProducts = 0;
  let totalProcessed = 0;
  
  for (const product of products) {
    try {
      const result = await productsService.upsertProduct(product);
      if (result.created) {
        newProducts++;
      } else if (result.updated) {
        updatedProducts++;
      }
      totalProcessed++;
    } catch (error) {
      console.warn(`⚠️  Failed to save product ${product.url}: ${error.message}`);
    }
  }
  
  return { created: newProducts, updated: updatedProducts, total: totalProcessed };
} 