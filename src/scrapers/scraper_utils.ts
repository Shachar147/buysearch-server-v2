// Common utilities for scrapers
// =============================================================

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { ProductService } from '../product/product.service';
import { ScrapingHistoryService, ScrapingType } from '../scraping-history/scraping-history.service';
import {
  T_SHIRTS_CATEGORY,
  HATS_CATEGORY,
  JACKETS_COATS_CATEGORY,
  SHIRTS_CATEGORY,
  PANTS_CATEGORY,
  DRESSES_CATEGORY,
  SKIRTS_CATEGORY,
  OVERALLS_CATEGORY,
  BODYSUITS_CATEGORY,
  JEWELRY_CATEGORY,
  ACCESSORIES_MAIN_CATEGORY,
  BAGS_CATEGORY,
  TRAVEL_BAGS_CATEGORY,
  BACKPACKS_CATEGORY,
  POUCHES_CATEGORY,
  SANDALS_CATEGORY,
  FLIP_FLOPS_CATEGORY,
  SNICKERS_CATEGORY,
  LAPTOP_BAGS_CATEGORY,
  CLOTHING_MAIN_CATEGORY,
  SHOES_MAIN_CATEGORY,
  JEANS_CATEGORY,
  SIDE_BAGS_CATEGORY,
  BELTS_CATEGORY,
  WALLETS_CATEGORY,
  SUNGLASSES_CATEGORY,
  SOCKS_CATEGORY,
  BRACELETS_CATEGORY,
  NECKLACES_CATEGORY,
  RINGS_CATEGORY,
  SPORT_CATEGORY,
  GLOVES_CATEGORY,
  SUITS_CATEGORY,
  WELLNESS_CATEGORY,
  STRAIGHT_JEANS_CATEGORY,
  SKINNY_JEANS_CATEGORY,
  SLIM_JEANS_CATEGORY,
  ELEGANT_SHOES_CATEGORY,
  BOOTS_CATEGORY,
  SWIMWEAR_CATEGORY,
  MOCCASINS_CATEGORY,
  TANKS_CATEGORY,
  BEAUTY_CATEGORY,
  KNITWEAR_CATEGORY,
  SWEATERS_CATEGORY,
  POLO_SHIRTS_CATEGORY,
  SLIPPERS_CATEGORY,
  LINGERIE_CATEGORY,
  GIFTS_CATEGORY,
  OXFORD_SHOES_CATEGORY,
  ESPADRILLES_CATEGORY,
  BEACHWEAR_CATEGORY,
  OVERSIZE_CATEGORY,
  STRAPLESS_CATEGORY,
  HANDKERCHIEFS_CATEGORY,
  CARD_HOLDERS_CATEGORY,
  BLAZERS_CATEGORY,
  HOME_CATEGORY,
  SHORTS_CATEGORY,
  SHORT_JEANS_CATEGORY,
  POUCH_BAGS_CATEGORY,
  MINI_SKIRTS_CATEGORY,
  MAXI_SKIRTS_CATEGORY,
  MAXI_DRESSES_CATEGORY,
  MINI_DRESSES_CATEGORY
} from '../category.constants';

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
  "אוף ווייט": 'off white'
};

// --- Category Synonyms Mapping ---
export const CATEGORY_SYNONYMS: Record<string, string[]> = {
  'caps': [HATS_CATEGORY],
  'כובעים': [HATS_CATEGORY],
  'כובע': [HATS_CATEGORY],
  "ג'קט": [JACKETS_COATS_CATEGORY],
  'hats': [HATS_CATEGORY],
  't-shirt': [T_SHIRTS_CATEGORY],
  't-shirts': [T_SHIRTS_CATEGORY],
  'tshirts': [T_SHIRTS_CATEGORY],
  'חולצות': [SHIRTS_CATEGORY],
  'shirts': [SHIRTS_CATEGORY],
  'pants': [PANTS_CATEGORY],
  'מכנסיים': [PANTS_CATEGORY],
  'dresses': [DRESSES_CATEGORY],
  'שמלות': [DRESSES_CATEGORY],
  'skirts': [SKIRTS_CATEGORY],
  'חצאיות': [SKIRTS_CATEGORY],
  'jackets': [JACKETS_COATS_CATEGORY],
  'coats': [JACKETS_COATS_CATEGORY],
  "ג'קטים": [JACKETS_COATS_CATEGORY],
  'אוברולים': [OVERALLS_CATEGORY],
  'overalls': [OVERALLS_CATEGORY],
  'bodysuit': [BODYSUITS_CATEGORY],
  'bodysuits': [BODYSUITS_CATEGORY],
  'בגד גוף': [BODYSUITS_CATEGORY],
  'בגדי גוף': [BODYSUITS_CATEGORY],
  'jewlery': [JEWELRY_CATEGORY],
  'תכשיטים': [JEWELRY_CATEGORY],
  'אביזרים': [ACCESSORIES_MAIN_CATEGORY],
  'תיקים': [ACCESSORIES_MAIN_CATEGORY, BAGS_CATEGORY],
  'תיק נסיעה': [BAGS_CATEGORY, TRAVEL_BAGS_CATEGORY],
  'תיקי נסיעה': [ACCESSORIES_MAIN_CATEGORY, BAGS_CATEGORY, TRAVEL_BAGS_CATEGORY],
  'תיקי גב': [ACCESSORIES_MAIN_CATEGORY, BAGS_CATEGORY, BACKPACKS_CATEGORY],
  'פאוץ׳': [ACCESSORIES_MAIN_CATEGORY, BAGS_CATEGORY, POUCHES_CATEGORY],
  "תיקי פאוץ'": [ACCESSORIES_MAIN_CATEGORY, BAGS_CATEGORY, POUCHES_CATEGORY],
  "סנדלים וכפכפים": [SHOES_MAIN_CATEGORY, SANDALS_CATEGORY, FLIP_FLOPS_CATEGORY],
  "סניקרס": [SHOES_MAIN_CATEGORY, SNICKERS_CATEGORY],
  "צ'אנקי סניקרס": [SHOES_MAIN_CATEGORY, SNICKERS_CATEGORY],
  'תיק לפטופ': [BAGS_CATEGORY, LAPTOP_BAGS_CATEGORY],
  'תיק ללפטופ': [BAGS_CATEGORY, LAPTOP_BAGS_CATEGORY],
  'תיק למחשב נייד': [BAGS_CATEGORY, LAPTOP_BAGS_CATEGORY],
  'תיק למחשב-נייד': [BAGS_CATEGORY, LAPTOP_BAGS_CATEGORY],
  'תיקי לפטופ': [BAGS_CATEGORY, LAPTOP_BAGS_CATEGORY],
  'בגדים': [CLOTHING_MAIN_CATEGORY],
  'טי שרט שרוול ארוך': [CLOTHING_MAIN_CATEGORY, T_SHIRTS_CATEGORY],
  'טי שרט שרוול קצר': [CLOTHING_MAIN_CATEGORY, T_SHIRTS_CATEGORY],
  'נעליים': [SHOES_MAIN_CATEGORY],
  "ג'ינסים": [JEANS_CATEGORY],
  "תיקי צד": [BAGS_CATEGORY, SIDE_BAGS_CATEGORY],
  "חגורה": [ACCESSORIES_MAIN_CATEGORY, BELTS_CATEGORY],
  "חגורות": [ACCESSORIES_MAIN_CATEGORY, BELTS_CATEGORY],
  'ארנק כרטיסים': [ACCESSORIES_MAIN_CATEGORY, WALLETS_CATEGORY, CARD_HOLDERS_CATEGORY],
  'ארנקים': [ACCESSORIES_MAIN_CATEGORY, WALLETS_CATEGORY],
  "פאוץ'": [BAGS_CATEGORY, POUCHES_CATEGORY],
  'pouch bags': [BAGS_CATEGORY, POUCHES_CATEGORY],
  // 't-shirt': [CLOTHING_MAIN_CATEGORY, T_SHIRTS_CATEGORY],
  'משקפי שמש': [ACCESSORIES_MAIN_CATEGORY, SUNGLASSES_CATEGORY],
  'גרב': [ACCESSORIES_MAIN_CATEGORY, SOCKS_CATEGORY],
  'גרביים': [ACCESSORIES_MAIN_CATEGORY, SOCKS_CATEGORY],
  'צמידים': [ACCESSORIES_MAIN_CATEGORY, JEWELRY_CATEGORY, BRACELETS_CATEGORY],
  'צמיד': [ACCESSORIES_MAIN_CATEGORY, JEWELRY_CATEGORY, BRACELETS_CATEGORY],
  'tax free': ['Tax Free'],
  'שרשרת': [ACCESSORIES_MAIN_CATEGORY, JEWELRY_CATEGORY, NECKLACES_CATEGORY],
  'שרשראות': [ACCESSORIES_MAIN_CATEGORY, JEWELRY_CATEGORY, NECKLACES_CATEGORY],
  'טבעות': [ACCESSORIES_MAIN_CATEGORY, JEWELRY_CATEGORY, RINGS_CATEGORY],
  'בקבוקי ספורט': [ACCESSORIES_MAIN_CATEGORY, SPORT_CATEGORY, 'Bottles'],
  'אביזרי ספורט': [ACCESSORIES_MAIN_CATEGORY, SPORT_CATEGORY],
  'כפפות': [ACCESSORIES_MAIN_CATEGORY, GLOVES_CATEGORY],
  'חליפות': [SUITS_CATEGORY],
  'גוף & וולנס': [WELLNESS_CATEGORY],
  'straight': [JEANS_CATEGORY, STRAIGHT_JEANS_CATEGORY],
  'skinny': [JEANS_CATEGORY, SKINNY_JEANS_CATEGORY],
  'slim': [JEANS_CATEGORY, SLIM_JEANS_CATEGORY],
  'נעליים אלגנטיות': [SHOES_MAIN_CATEGORY, ELEGANT_SHOES_CATEGORY],
  'נעליים שטוחות': [SHOES_MAIN_CATEGORY],
  'מגפי שרוכים': [SHOES_MAIN_CATEGORY, BOOTS_CATEGORY],
  'בגדי ים': [SWIMWEAR_CATEGORY],
  'בגד ים': [SWIMWEAR_CATEGORY],
  "מגפי צ'לסי": [SHOES_MAIN_CATEGORY, BOOTS_CATEGORY],
  'מוקסינים': [SHOES_MAIN_CATEGORY, MOCCASINS_CATEGORY],
  'מוקסין': [SHOES_MAIN_CATEGORY, MOCCASINS_CATEGORY],
  'כפכפים': [FLIP_FLOPS_CATEGORY],
  'סנדלים': [SANDALS_CATEGORY],
  'ספורט': [SPORT_CATEGORY],
  'גופיות': [TANKS_CATEGORY],
  'sleeveless': [TANKS_CATEGORY],
  'גופייה': [TANKS_CATEGORY],
  'גופיה': [TANKS_CATEGORY],
  'beauty': [BEAUTY_CATEGORY],
  'סריגים': [CLOTHING_MAIN_CATEGORY, KNITWEAR_CATEGORY],
  'סריג רוכסן': [CLOTHING_MAIN_CATEGORY, KNITWEAR_CATEGORY],
  'קרדיגן': [CLOTHING_MAIN_CATEGORY, KNITWEAR_CATEGORY],
  'סווטשירטים': [CLOTHING_MAIN_CATEGORY, SWEATERS_CATEGORY],
  'סווטשירט': [CLOTHING_MAIN_CATEGORY, SWEATERS_CATEGORY],
  'סוודרים': [CLOTHING_MAIN_CATEGORY, SWEATERS_CATEGORY],
  'סווטשירט crew': [CLOTHING_MAIN_CATEGORY, SWEATERS_CATEGORY],
  'חולצות פולו': [CLOTHING_MAIN_CATEGORY, T_SHIRTS_CATEGORY, POLO_SHIRTS_CATEGORY],
  'פולו שרוול קצר': [CLOTHING_MAIN_CATEGORY, T_SHIRTS_CATEGORY, POLO_SHIRTS_CATEGORY],
  'polo t-shirts': [POLO_SHIRTS_CATEGORY],
  'polo tshirts': [POLO_SHIRTS_CATEGORY],
  'נעלי בית': [SLIPPERS_CATEGORY],
  'אביזרי נעליים': [SHOES_MAIN_CATEGORY, ACCESSORIES_MAIN_CATEGORY],
  'clothes': [CLOTHING_MAIN_CATEGORY],
  'חולצת פולו': [POLO_SHIRTS_CATEGORY],
  'הלבשה תחתונה': [CLOTHING_MAIN_CATEGORY, LINGERIE_CATEGORY],
  'מתנות': [GIFTS_CATEGORY],
  'טי שירט': [CLOTHING_MAIN_CATEGORY, T_SHIRTS_CATEGORY],
  'מגפיים': [SHOES_MAIN_CATEGORY, BOOTS_CATEGORY],
  'מגפיים אלגנטיות': [SHOES_MAIN_CATEGORY, BOOTS_CATEGORY],
  'כפכפי אצבע': [SHOES_MAIN_CATEGORY, FLIP_FLOPS_CATEGORY],
  'נעלי אוקספורד': [SHOES_MAIN_CATEGORY, OXFORD_SHOES_CATEGORY],
  'בגדי ספורט': [CLOTHING_MAIN_CATEGORY, SPORT_CATEGORY],
  'Phonebag': [ACCESSORIES_MAIN_CATEGORY, BAGS_CATEGORY],
  'אספדרילים': [SHOES_MAIN_CATEGORY, ESPADRILLES_CATEGORY],
  'אספדריל': [SHOES_MAIN_CATEGORY, ESPADRILLES_CATEGORY],
  'בגד חוף': [BEACHWEAR_CATEGORY, SWIMWEAR_CATEGORY],
  'וסט': [CLOTHING_MAIN_CATEGORY, T_SHIRTS_CATEGORY],
  'סטרפלס': [CLOTHING_MAIN_CATEGORY, STRAPLESS_CATEGORY],
  'מטפחות': [ACCESSORIES_MAIN_CATEGORY, HANDKERCHIEFS_CATEGORY],
  "טישירט": [CLOTHING_MAIN_CATEGORY, T_SHIRTS_CATEGORY],
  "מכנסיים קצרים": [CLOTHING_MAIN_CATEGORY, PANTS_CATEGORY, SHORTS_CATEGORY],
  'short jeans': [CLOTHING_MAIN_CATEGORY, SHORTS_CATEGORY, SHORT_JEANS_CATEGORY],
  "אוברסייז": [CLOTHING_MAIN_CATEGORY, OVERSIZE_CATEGORY],
  "Oversize": [CLOTHING_MAIN_CATEGORY, OVERSIZE_CATEGORY],
  "סוודר": [CLOTHING_MAIN_CATEGORY, SWEATERS_CATEGORY],
  "קרדיגנים": [CLOTHING_MAIN_CATEGORY, 'Cardigans'],
  "בלייזר": [CLOTHING_MAIN_CATEGORY, BLAZERS_CATEGORY],
  "בלייזרים": [CLOTHING_MAIN_CATEGORY, BLAZERS_CATEGORY],
  'home': [HOME_CATEGORY],
  'pouch': [POUCH_BAGS_CATEGORY],
  'new era': ['New Era'],
  'abercrombie and fitch': ['Abercrombie & Fitch'],
  'חצאית': [SKIRTS_CATEGORY],
  'חצאית מיני': [SKIRTS_CATEGORY, MINI_SKIRTS_CATEGORY],
  'חצאית מקסי': [SKIRTS_CATEGORY, MAXI_SKIRTS_CATEGORY],
  'שמלה ארוכה': [DRESSES_CATEGORY, MAXI_DRESSES_CATEGORY],
  'שמלה קצרה': [DRESSES_CATEGORY, MINI_DRESSES_CATEGORY],
  'שמלה מקסי': [DRESSES_CATEGORY, MAXI_DRESSES_CATEGORY],
  'שמלה מיני': [DRESSES_CATEGORY, MINI_DRESSES_CATEGORY],
  'שמלת מיני': [DRESSES_CATEGORY, MINI_DRESSES_CATEGORY]
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
  'טי שירט שרוול קצר',
  'men', // <- todo remove,
  'short jeans', // <- todo remove,
  'tax free', // todo remove,
  'italian summer', // todo remove,
  'mocha mousse', // todo remove,
  'straight',
  'back in stock', // todo remove,
  'crew neck sweaters' // todo remove
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
  if (!brandName || brandName == 'false') return 'Unknown';
  
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