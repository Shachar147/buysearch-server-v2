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
  'ck': 'Calvin Klein',
  'tommy hilfiger': 'Tommy Hilfiger',
  'tommy': 'Tommy Hilfiger',
  'levi\'s': 'Levi\'s',
  'levis': 'Levi\'s',
  'diesel': 'Diesel',
  'guess': 'Guess',
  'hollister': 'Hollister',
  'abercrombie': 'Abercrombie & Fitch',
  'abercrombie & fitch': 'Abercrombie & Fitch',
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
  'itay brands': 'Itay Brands'
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
  'בז׳': 'beige',
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
  'אבן': 'stone'
};

// --- Category Synonyms Mapping ---
export const CATEGORY_SYNONYMS: Record<string, string[]> = {
  'caps': ['Hats'],
  'כובעים': ['Hats'],
  'כובע': ['Hats'],
  'hats': ['Hats'],
  't-shirts': ['T-Shirts & Vests'],
  'tshirts': ['T-Shirts & Vests'],
  'חולצות': ['Shirts'],
  'shirts': ['Shirts'],
  'pants': ['Pants'],
  'מכנסיים': ['Pants'],
  'dresses': ['Dresses'],
  'שמלות': ['Dresses'],
  'skirts': ['Skirts'],
  'חצאיות': ['Skirts'],
  'jackets': ['Jackets & Coats'],
  'coats': ['Jackets & Coats'],
  'ג׳קטים': ['Jackets & Coats'],
  'אוברולים': ['Overalls'],
  'overalls': ['Overalls'],
  'bodysuit': ['Bodysuits'],
  'bodysuits': ['Bodysuits'],
  'בגד גוף': ['Bodysuits'],
  'בגדי גוף': ['Bodysuits'],
  'jewlery': ['Jewelry'],
  'תכשיטים': ['Jewelry'],
  'אביזרים': ['Accessories'],
  'תיקים': ['Accessories', 'Bags'],
  'תיק נסיעה': ['Bags', 'Travel Bags'],
  'תיקי נסיעה': ['Accessories', 'Bags', 'Travel Bags'],
  'תיקי גב': ['Accessories', 'Bags', 'Backpacks'],
  'פאוץ׳': ['Accessories', 'Bags', 'Pouch'],
  "תיקי פאוץ'": ['Accessories', 'Bags', 'Pouch'],
  "סנדלים וכפכפים": ['Shoes', 'Sandals', 'Flip Flops'],
  "סניקרס": ['Shoes', 'Snickers'],
  "צ'אנקי סניקרס": ['Shoes', 'Snickers'],
  'תיק לפטופ': ['Bags', 'Laptop Bags'],
  'תיק ללפטופ': ['Bags', 'Laptop Bags'],
  'תיק למחשב נייד': ['Bags', 'Laptop Bags'],
  'תיק למחשב-נייד': ['Bags', 'Laptop Bags'],
  'תיקי לפטופ': ['Bags', 'Laptop Bags'],
  'בגדים': ['Clothing'],
  'טי שרט שרוול ארוך': ['Clothing', 'T-Shirts & Vests'],
  'טי שרט שרוול קצר': ['Clothing', 'T-Shirts & Vests'],
  'נעליים': ['Shoes'],
  "ג'ינסים": ['Jeans'],
  "תיקי צד": ['Bags', 'Side Bags'],
  "חגורה": ['Accessories', 'Belts'],
  "חגורות": ['Accessories', 'Belts'],
  'ארנק כרטיסים': ['Accessories', 'Wallets'],
  'ארנקים': ['Accessories', 'Wallets'],
  "פאוץ'": ['Bags', 'Pouch Bags'],
  'משקפי שמש': ['Accessories', 'Sunglasses'],
  'גרב': ['Accessories', 'Socks'],
  'גרביים': ['Accessories', 'Socks'],
  'צמידים': ['Accessories', 'Jewelry', 'Bracelets'],
  'צמיד': ['Accessories', 'Jewelry', 'Bracelets'],
  'tax free': ['Tax Free'],
  'שרשרת': ['Accessories', 'Jewelry', 'Necklaces'],
  'שרשראות': ['Accessories', 'Jewelry', 'Necklaces'],
  'טבעות': ['Accessories', 'Jewelry', 'Rings'],
  'בקבוקי ספורט': ['Accessories', 'Sport', 'Bottles'],
  'אביזרי ספורט': ['Accessories', 'Sport'],
  'כפפות': ['Accessories', 'Gloves'],
  'חליפות': ['Suites'],
  'גוף & וולנס': ['Welness & Body'],
  'straight': ['Jeans', 'Straight Jeans'],
  'skinny': ['Jeans', 'Skinny Jeans'],
  'slim': ['Jeans', 'Slim Jeans'],
  'נעליים אלגנטיות': ['Shoes', 'Elegant Shoes'],
  'נעליים שטוחות': ['Shoes'],
  'מגפי שרוכים': ['Shoes', 'Boots'],
  'בגדי ים': ['Swimwear'],
  'בגד ים': ['Swimwear'],
  "מגפי צ'לסי": ['Shoes', 'Boots'],
  'מוקסינים': ['Shoes', 'Moccasin Shoes'],
  'כפכפים': ['Flip Flops'],
  'סנדלים': ['Sandals'],
  'ספורט': ['Sport'],
  'גופיות': ['Tanks'],
  'beauty': ['Beauty'],
  'סריגים': ['Clothing', 'Knitwear'],
  'סריג רוכסן': ['Clothing', 'Knitwear'],
  'קרדיגן': ['Clothing', 'Knitwear'],
  'סווטשירטים': ['Clothing', 'Sweaters'],
  'סוודרים': ['Clothing', 'Sweaters'],
  'סווטשירט crew': ['Clothing', 'Sweaters', 'Crew Neck Sweaters'],
  'חולצות פולו': ['Clothing', 'T-Shirts & Vests', 'Polo T-Shirts'],
  'פולו שרוול קצר': ['Clothing', 'T-Shirts & Vests', 'Polo T-Shirts'],
  'נעלי בית': ['Slippers'],
  'אביזרי נעליים': ['Shoes', 'Accessories'],
  'clothes': ['Clothing'],
  'הלבשה תחתונה': ['Clothing', 'Lingerie'],
  'מתנות': ['Gifts'],
  'טי שירט': ['Clothing', 'T-Shirts & Vests'],
  'מגפיים': ['Shoes', 'Boots'],
  'מגפיים אלגנטיות': ['Shoes', 'Boots'],
  'כפכפי אצבע': ['Shoes', 'Flip Flops'],
  'נעלי אוקספורד': ['Shoes', 'Oxford Shoes'],
  'בגדי ספורט': ['Clothing', 'Sport'],
  'Phonebag': ['Accessories', 'Bags'],
  'אספדרילים': ['Shoes', 'Espadrilles Shoes'],
  'אספדריל': ['Shoes', 'Espadrilles Shoes'],
  'בגד חוף': ['Beachwear', 'Swimwear'],
  'וסט': ['Clothing', 'T-Shirts & Vests'],
  "ג'קטים": ['Clothing', 'Jackets & Coats'],
  'סטרפלס': ['Clothing', 'Strapless'],
  'מטפחות': ['Accessories', 'Handkerchiefs'],
  "טישירט": ['Clothing', 'T-Shirts & Vests'],
  "מכנסיים קצרים": ['Clothing', 'Pants', 'Shorts'],
  "אוברסייז": ['Clothing', 'Oversize'],
  "Oversize": ['Clothing', 'Oversize'],
  
  // 'mocha mousse': 'Mocha Mousse',
  // 'מתנות': 'Gifts',
  // Add more as needed
};

// --- Categories to Ignore ---
export const CATEGORIES_TO_IGNORE = new Set([
  'גברים',
  'נשים',
  'ילדים',
  'מצחיה',
  'מצחייה',
  '(not set)',
  'נמוכות',
  'גבוהות',
  'sale',
  'or luzon picks',
  'סטיילינג',
  '10%',
  '20%',
  '30%',
  '40%',
  '50%',
  '60%',
  '70%',
  '80%',
  '90%',
  'archive',
  'wear it like jeremy',
  'five point four',
  'run',
  'שטוחים',
  'לוגו',
  'ארוכים',
  'מודפסים',
  'חלקים',
  'לוגומאניה',
  'אספדרילים',
  'נעלי אוקספורד',
  'מגפיים',
  'מגפי שרוכים',
  'נעליים שטוחות',
  'כפכפי אצבע',
  "מגפי צ'לסי",
  'וסט',
  "קז'ואל",
  'טי שירט שרוול ארוך',
  'טי שירט שרוול קצר'
]);

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
    const mapped = CATEGORY_SYNONYMS[normalized] || [cat.trim()];
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

/**
 * Normalize brand names using synonyms mapping
 * @param brandName The original brand name
 * @returns Normalized brand name
 */
export function normalizeBrandName(brandName: string): string {
  if (!brandName) return 'Unknown';
  
  const normalizedBrand = brandName.trim().toLowerCase();
  const synonym = BRAND_SYNONYMS[normalizedBrand];
  
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
  return brandName.trim();
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
  
  return Array.from(allColors);
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

/**
 * Extract categories from a product title/name using keyword matching and normalization
 * @param title Product title or name
 * @returns Array of normalized category names (string[])
 */
export function extractCategory(title: string): string[] {
  if (!title) return [];
  const lowerTitle = title.toLowerCase();
  const foundCategories = new Set<string>();
  // Check for each synonym key and value in the title
  for (const [key, mappedArr] of Object.entries(CATEGORY_SYNONYMS)) {
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