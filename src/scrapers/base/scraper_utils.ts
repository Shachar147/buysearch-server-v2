// Common utilities for scrapers
// =============================================================

import { NestFactory } from '@nestjs/core';
import { ProductService } from '../../product/product.service';
import { ScrapingHistoryService, ScrapingType } from '../../scraping-history/scraping-history.service';
import { SourceService } from '../../source/source.service';
import { CATEGORIES_TO_IGNORE, Category, CATEGORY_NORMALIZATION_MAP } from '../../category.constants';
import { ucfirst } from '../../search/search.utils';
import { AppModule } from '../../../app.module';
import * as path from 'path';

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
  'burgundy', 'silver', 'gold', 'multi', 'mauve', 'teal', 'coral', 'mint', 'lavender', 'azure', 'nude', 'stone'
];

export const COLOR_ALIASES: Record<string, string> = {
  'charcoal marl': 'grey', 'off white': 'white', 'stone': 'beige', 'ivory': 'white',
  'midnight': 'navy', 'taupe': 'beige', 'camel': 'brown', 'ecru': 'beige', 'cream': 'cream',
  'chocolate': 'brown', 'denim': 'blue', 'olive': 'green', 'mustard': 'yellow', 'peach': 'pink',
  'wine': 'burgundy', 'lilac': 'purple', 'charcoal': 'grey', 'marl': 'grey', 'gray': 'grey',
  'light moss': 'green', 'in sage': 'green', 'in anthracite': 'grey', 'in washed asphalt': 'grey',
  'in stone': 'beige', 'in tan': 'beige', 'indigo': 'purple', 'in sand': 'beige', 'in rust': 'red',
  'in lime': 'yellow',
  'light blue': 'azure'
};

// --- Brand Synonyms Mapping ---
export const BRAND_SYNONYMS: Record<string, string> = {
  'ysl': 'Saint Laurent',
  'yves saint laurent': 'Saint Laurent',
  'san laurent': 'Saint Laurent',
  'sun laurent': 'Saint Laurent',
  'yves s': 'Saint Laurent',
  'איב סאן': 'Saint Laurent',
  'סאן לורן': 'Saint Laurent',
  'סאן לורנט': 'Saint Laurent',
  'jordan': 'Jordan',
  'ralph lauren': 'Polo Ralph Lauren',
  // 'polo': 'Polo Ralph Lauren',
  'polo ralph': 'Polo Ralph Lauren',
  'ralph': 'Polo Ralph Lauren',
  'nike': 'Nike',
  'adidas': 'Adidas',
  'reebok': 'Reebok',
  'puma': 'Puma',
  'under armour': 'Under Armour',
  'underarmour': 'Under Armour',
  'calvin klein': 'Calvin Klein',
  'allsaints': 'AllSaints',
  // 'ck': 'Calvin Klein',
  'tommy hilfiger': 'Tommy Hilfiger',
  'tommy': 'Tommy Hilfiger',
  'levi\'s': 'Levi\'s',
  'levis': 'Levi\'s',
  'diesel': 'Diesel',
  'guess': 'Guess',
  'hollister': 'Hollister',
  'abercrombie': 'Abercrombie & Fitch',
  'abercrombie & fitch': 'Abercrombie & Fitch',
  'abercrombie and fitch': 'Abercrombie & Fitch',
  'a&f': 'Abercrombie & Fitch',
  'gap': 'Gap',
  'gant': 'Gant',
  'old navy': 'Old Navy',
  'banana republic': 'Banana Republic',
  'uniqlo': 'Uniqlo',
  'zara': 'Zara',
  'h&m': 'H&M',
  'hm': 'H&M',
  'mango': 'Mango',
  'pull&bear': 'Pull&Bear',
  'pull and bear': 'Pull&Bear',
  'bershka': 'Bershka',
  'stradivarius': 'Stradivarius',
  'massimo dutti': 'Massimo Dutti',
  'oysho': 'Oysho',
  'zara home': 'Zara Home',
  'timberland': 'Timberland',
  'clarks': 'Clarks',
  'ecco': 'ECCO',
  'geox': 'Geox',
  'converse': 'Converse',
  'vans': 'Vans',
  'new balance': 'New Balance',
  'asics': 'ASICS',
  'mizuno': 'Mizuno',
  'brooks': 'Brooks',
  'saucony': 'Saucony',
  'skechers': 'Skechers',
  'crocs': 'Crocs',
  'birkenstock': 'Birkenstock',
  'dr. martens': 'Dr. Martens',
  'dr martens': 'Dr. Martens',
  'doc martens': 'Dr. Martens',
  'docs': 'Dr. Martens',
  'ugg': 'UGG',
  'north face': 'The North Face',
  'the north face': 'The North Face',
  'columbia': 'Columbia',
  'patagonia': 'Patagonia',
  'carhartt': 'Carhartt',
  'dickies': 'Dickies',
  'champion': 'Champion',
  'fila': 'Fila',
  'k-swiss': 'K-Swiss',
  'kswiss': 'K-Swiss',
  'lacoste': 'Lacoste',
  'fred perry': 'Fred Perry',
  'ben sherman': 'Ben Sherman',
  'paul smith': 'Paul Smith',
  'ted baker': 'Ted Baker',
  'superdry': 'Superdry',
  'jack & jones': 'Jack & Jones',
  'jack and jones': 'Jack & Jones',
  'selected': 'Selected',
  'only': 'Only',
  'vero moda': 'Vero Moda',
  'veromoda': 'Vero Moda',
  'pieces': 'Pieces',
  'weekday': 'Weekday',
  'monki': 'Monki',
  'cos': 'COS',
  'arket': 'Arket',
  'other stories': '& Other Stories',
  '& other stories': '& Other Stories',
  'itay brands': 'Itay Brands',
  'all saints': 'AllSaints',
  'a.p.c': 'A.P.C',
  'c.p. company': 'C.P. Company',
  'dr.martens': 'D.R Martens',
  'g-star': 'G-Star',
  'gstar': 'G-Star',
  'g-star raw': 'G-Star',
  'gstar raw': 'G-Star',
  'do it like beckham': 'Do It Like Beckham',
};

// --- Hebrew to English Color Mapping ---
export const HEBREW_COLOR_MAP: Record<string, string> = {
  'ארגמן': 'purple',
  'ניוד': 'nude',
  'תכלת': 'azure',
  'אדום': 'red',
  'אדומה': 'red',
  'אדומים': 'red',
  'אדומות': 'red',
  'שחור': 'black',
  'שחורה': 'black',
  'שחורים': 'black',
  'שחורות': 'black',
  'לבן': 'white',
  'לבנה': 'white',
  'לבנים': 'white',
  'לבנות': 'white',
  'כחול': 'blue',
  'כחולה': 'blue',
  'כחולים': 'blue',
  'כחולות': 'blue',
  'ירוק': 'green',
  'ירוקה': 'green',
  'ירוקים': 'green',
  'ירוקות': 'green',
  'צהוב': 'yellow',
  'צהובה': 'yellow',
  'צהובים': 'yellow',
  'צהובות': 'yellow',
  'ורוד': 'pink',
  'ורודה': 'pink',
  'ורודים': 'pink',
  'ורודות': 'pink',
  'סגול': 'purple',
  'סגולה': 'purple',
  'סגולים': 'purple',
  'סגולות': 'purple',
  'כתום': 'orange',
  'כתומה': 'orange',
  'כתומים': 'orange',
  'כתומות': 'orange',
  'חום': 'brown',
  'חומה': 'brown',
  'חומים': 'brown',
  'חומות': 'brown',
  'אפור': 'grey',
  'אפורה': 'grey',
  'אפורים': 'grey',
  'אפורות': 'grey',
  'אפרפר': 'grey',
  "בז'": 'beige',
  'בז': 'beige',
  'בזים': 'beige',
  'בזות': 'beige',
  'נייבי': 'navy',
  'כחול כהה': 'navy',
  'קרם': 'cream',
  'שמנת': 'cream',
  'חאקי': 'khaki',
  'בורדו': 'burgundy',
  'כסף': 'silver',
  'כסופה': 'silver',
  'כסופים': 'silver',
  'כסופות': 'silver',
  'זהב': 'gold',
  'זהובה': 'gold',
  'זהובים': 'gold',
  'זהובות': 'gold',
  'צבעוני': 'multi',
  'צבעונית': 'multi',
  'צבעוניים': 'multi',
  'צבעוניות': 'multi',
  'מולטי': 'multi',
  'סגלגל': 'mauve',
  'סגלגלה': 'mauve',
  'סגלגלים': 'mauve',
  'סגלגלות': 'mauve',
  'טורקיז': 'teal',
  'אלמוג': 'coral',
  'קורל': 'coral',
  'מנטה': 'mint',
  'לבנדר': 'lavender',
  'לוונדר': 'lavender',
  'לונדר': 'lavender',
  'אבן': 'stone',
  'אופייט': 'off white',
  "אוף וויט": 'off white',
  "אוף ווייט": 'off white',
  "אוף-וויט": "off white",
  "כחול-ים": "navy",
  "כחול נייבי": "navy",
};

/**
 * Normalize category names using synonyms mapping and ignore unwanted categories
 * @param categories Array of category names (string[])
 * @returns Array of normalized category names (string[])
 */
export function normalizeCategories(categories: string[]): string[] {
  if (!Array.isArray(categories)) return [];
  const resultSet = new Set<string>();
  categories.forEach((cat) => {
    if (!cat) return;
    const normalized = cat.trim().toLowerCase();
    const mapped = CATEGORY_NORMALIZATION_MAP[normalized] || [ucfirst(cat.trim())];
    mapped.forEach((normCat) => {
      if (normCat && !CATEGORIES_TO_IGNORE.has(normCat.toLocaleLowerCase())) {
        resultSet.add(normCat);
      }
    });
  });
  return Array.from(resultSet);
}

// --- Utility Functions ---
export function extractColors(title: string, apiColors: string[]): string[] {
  const lowerTitle = title.toLowerCase().replace('tailored', '');
  const colorsSet = new Set(apiColors.map(c => c.toLowerCase()));
  
  // Add keyword-based detection
  COLOR_KEYWORDS.forEach((c) => {
    if (lowerTitle.includes(c)) colorsSet.add(c);
  });

  Object.keys(HEBREW_COLOR_MAP).forEach((c) => {
    if (lowerTitle.includes(c)) colorsSet.add(HEBREW_COLOR_MAP[c]);
  });
  
  // Add alias-based detection
  for (const [alias, color] of Object.entries(COLOR_ALIASES)) {
    if (lowerTitle.includes(alias)) colorsSet.add(color);
  }
  
  return Array.from(colorsSet).filter((c) => c.trim().length > 0);
}

/**
 * Normalize brand names using synonyms mapping
 * @param brandName The original brand name
 * @returns Normalized brand name
 */
export function normalizeBrandName(brandName: string): string {
  if (!brandName || brandName == 'false') return 'Unknown';
  
  const normalizedBrand = brandName.trim().toLowerCase();
  const synonym = BRAND_SYNONYMS[normalizedBrand];
  
  if (brandName.toLocaleLowerCase().includes('adidas')) {
    return 'Adidas';
  }

  if (synonym) {
    return synonym;
  }
  
  // If no exact match, try partial matching for common patterns
  for (const [key, value] of Object.entries(BRAND_SYNONYMS)) {
    if (normalizedBrand.includes(key) || key.includes(normalizedBrand)) {
      return value;
    }
  }
  
  // Return original brand name with proper capitalization if no match found
  return brandName
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Convert Hebrew color names to English color names
 * @param hebrewColors Array of Hebrew color names
 * @param source Source name for logging (e.g., 'terminalx_scraper')
 * @returns Array of English color names
 */
export function convertHebrewColors(hebrewColors: string[], source: string): string[] {
  const englishColors = new Set<string>();
  
  hebrewColors.forEach(hebrewColor => {
    const normalizedHebrew = hebrewColor.trim().toLowerCase();
    const englishColor = HEBREW_COLOR_MAP[normalizedHebrew];
    
    if (englishColor) {
      englishColors.add(englishColor);
    } 
    else if (normalizedHebrew.includes("אפור")){
        englishColors.add("grey");
    }
    else if (normalizedHebrew.includes("חום ")){
        englishColors.add("brown");
    }
    else {
      // Log warning for missing Hebrew color mapping
      console.warn(`⚠️  [${source}] Missing Hebrew color mapping: "${hebrewColor}" - please add to HEBREW_COLOR_MAP`);
      // Keep the original Hebrew color as fallback
      englishColors.add(hebrewColor.toLowerCase());
    }
  });
  
  return Array.from(englishColors);
}

/**
 * Enhanced color extraction that handles both Hebrew and English colors
 * @param title Product title
 * @param apiColors Colors from API
 * @param source Source name for logging
 * @returns Array of English color names
 */
export function extractColorsWithHebrew(title: string, apiColors: string[], source: string): string[] {
  // First, convert any Hebrew colors from API
  const convertedApiColors = convertHebrewColors(apiColors, source);
  
  // Then extract colors from title (this already handles English)
  const titleColors = extractColors(title, []);
  
  // Combine both sets
  const allColors = new Set([...convertedApiColors, ...titleColors]);
  
  return Array.from(allColors).filter((c) => c.trim().length > 0);;
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
  scrapingHistoryService: ScrapingHistoryService,
  totalItems?: number,
  missingItems?: number
): Promise<void> {
  const endTime = new Date();
  const totalSeconds = Math.round((endTime.getTime() - startTime.getTime()) / 1000);
  
  // Finish scraping session
  await scrapingHistoryService.finishScrapingSession(session.id, totalNew, totalUpdated, totalItems, missingItems);
  
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
  const sourceService = app.get(SourceService);
  
  return { app, productsService, scrapingHistoryService, sourceService };
}

// --- Source Path Management ---
export async function updateSourceScraperPath(
  sourceName: string,
  sourceService: SourceService
): Promise<void> {
  try {
    // Get the current file path and convert it to the expected format
    const currentFilePath = process.argv[1]; // This gets the path to the current script
    const fileName = path.basename(currentFilePath, path.extname(currentFilePath));
    
    // Convert to the expected format: '../filename.js'
    const scraperPath = `../${fileName}.js`;
    
    // Find the source by name
    const source = await sourceService.findByName(sourceName);
    
    if (source) {
      // Only update if scraper_path doesn't exist
      if (!source.scraper_path) {
        await sourceService.update(source.id, { scraper_path: scraperPath });
        console.log(`📝 Updated scraper_path for source "${sourceName}": ${scraperPath}`);
      } else {
        console.log(`✅ Source "${sourceName}" already has scraper_path: ${source.scraper_path}`);
      }
    } else {
      // // Create the source if it doesn't exist
      // await sourceService.create({ 
      //   name: sourceName, 
      //   scraper_path: scraperPath,
      //   isActive: true 
      // });
      // console.log(`📝 Created source "${sourceName}" with scraper_path: ${scraperPath}`);
    }
  } catch (error) {
    console.warn(`⚠️  Failed to update scraper_path for source "${sourceName}": ${error.message}`);
  }
}

// --- Product Processing ---
export async function processProducts(
  products: Product[],
  productsService: ProductService
): Promise<ScrapingResult> {
  const totalProducts = products.length;
  const startTime = Date.now();

  // Use bulkUpsertProducts for efficiency
  try {
    const result = await productsService.bulkUpsertProducts(products);
    const elapsed = (Date.now() - startTime) / 1000;
    const rate = result.total / elapsed;
    console.log(`Bulk upsert: ${result.total} products processed in ${elapsed.toFixed(1)}s (${rate.toFixed(2)} products/sec)`);
    // Progress logging (single log for bulk)
    console.log(`Progress: ${result.total}/${totalProducts} (100%) | Added: ${result.created} | Updated: ${result.updated}`);
    return result;
  } catch (error) {
    console.warn(`⚠️  Failed to bulk upsert products: ${error.message}`);
    return { created: 0, updated: 0, total: 0 };
  }
}

export async function processProductsOld(
  products: Product[],
  productsService: ProductService
): Promise<ScrapingResult> {
  let newProducts = 0;
  let updatedProducts = 0;
  let totalProcessed = 0;
  const totalProducts = products.length;
  const startTime = Date.now();
  let lastLoggedPercent = 0;

  // todo: use bulkUpsertProducts instead of upsertProduct

  for (const product of products) {
    try {
      const result = await productsService.upsertProduct(product);
      if (result.created) {
        newProducts++;
      } else if (result.updated) {
        updatedProducts++;
      }
      totalProcessed++;
      // Progress logging every 100 products or every 10%
      const percent = Math.floor((totalProcessed / totalProducts) * 100);
      const shouldLog = totalProcessed % 100 === 0 || percent >= lastLoggedPercent + 10;
      if (shouldLog || totalProcessed === totalProducts) {
        lastLoggedPercent = percent;
        const elapsed = (Date.now() - startTime) / 1000; // seconds
        const rate = totalProcessed / elapsed; // products per second
        const remaining = totalProducts - totalProcessed;
        const etaSeconds = rate > 0 ? Math.round(remaining / rate) : 0;
        const etaMinutes = Math.floor(etaSeconds / 60);
        const etaSec = etaSeconds % 60;
        console.log(`Progress: ${totalProcessed}/${totalProducts} (${percent}%) | Added: ${newProducts} | Updated: ${updatedProducts} | ETA: ${etaMinutes}m ${etaSec}s`);
      }
    } catch (error) {
      console.warn(`⚠️  Failed to save product ${product.url}: ${error.message}`);
    }
  }
  
  return { created: newProducts, updated: updatedProducts, total: totalProcessed };
} 

/**
 * Extract categories from a product title/name using keyword matching and normalization
 * @param title Product title or name
 * @returns Array of normalized category names (string[])
 */
export function extractCategory(title: string): string[] {
  if (!title) return [];
  let lowerTitle = title.toLowerCase();
  const foundCategories = new Set<string>();

  if (lowerTitle.includes('swim trunks')) {
    foundCategories.add(Category.SWIMWEAR);
    lowerTitle = lowerTitle.replace('swim trunks', ''); // to prevent 'trunks' from being converted to Boxers
  }

  // Check for each synonym key and value in the title
  for (const [key, mappedArr] of Object.entries(CATEGORY_NORMALIZATION_MAP)) {
    if (lowerTitle.includes(key)) {
      mappedArr.forEach((cat) => foundCategories.add(cat));
    }
    // Also check if any mapped category appears as a word in the title
    mappedArr.forEach((cat) => {
      if (lowerTitle.includes(cat.toLowerCase())) {
        foundCategories.add(cat);
      }
    });
  }
  // Remove ignored categories
  return Array.from(foundCategories).filter((cat) => !CATEGORIES_TO_IGNORE.has(cat.toLowerCase()));
}