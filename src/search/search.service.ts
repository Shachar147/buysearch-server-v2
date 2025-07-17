import { Injectable } from '@nestjs/common';
import { BrandService } from '../brand/brand.service';
import { CategoryService } from '../category/category.service';
import { ColorService } from '../color/color.service';
import { ucfirst } from './search.utils';

import {
  CATEGORY_SEARCH_KEYWORDS_MAP
} from '../category.constants';
import { normalizeBrandName } from '../scrapers/base/scraper_utils';

export interface ParsedFilters {
  colors: string[];
  categories: string[];
  brands: string[];
  maxPrice: number | null;
  minPrice: number | null;
  keywords: string[];
  gender: string | null;
  isOnSale?: string;
  sources?: string[];
}

@Injectable()
export class SearchService {
  constructor(
    private readonly brandService: BrandService,
    private readonly categoryService: CategoryService,
    private readonly colorService: ColorService,
  ) {}

  private COLOR_KEYWORDS = [
    'black', 'white', 'red', 'blue', 'green', 'yellow', 'pink', 'purple',
    'orange', 'brown', 'grey', 'gray', 'beige', 'navy', 'cream', 'khaki',
    'burgundy', 'silver', 'gold', 'multi', 'mauve', 'teal', 'coral', 'mint', 'lavender'
  ];

  private BRAND_SYNONYMS = {
    'tommy hilfiger': ['tommy hilfiger', 'tommy h', 'hilfiger', 'של טומי', 'טומי ה', 'טומי הילפיגר', 'הילפיגר'],
    'calvin klein': ['calvin klein', 'calvin', 'klein', 'קלווין ק', 'קלוין ק', 'קלווין קליין', 'קלוין קליין'],
    'polo ralph lauren': ['polo ralph lauren', 'polo', 'ralph lauren', 'ראלף ל', 'פולו ראלף', 'פולו', 'ראלף לורן', 'פולו ראלף לורן'],
    "levi's": ["levi's", 'levis', 'levi','ליוויס', 'ליויס', 'ליווייס', 'לוי׳ס'],
    'nike': ['nike', 'נייק', 'נייקי'],
    'adidas': ['adidas', 'אדידס', 'אדידאס'],
    'converse': ['converse', 'אול-סטאר', 'אולסטאר', 'אול סטאר', 'קונברס', 'קונברס אולסטאר'],
    'jordan': ['jordan', 'ג׳ורדן', 'גורדן', 'ג׳ורדאן', "ג׳ורד"],
    'asos design': ["asos d","אסוס די"],
    'new balance': ['new balance', 'newbalance', 'ניובלאנס', 'ניו באלאנס', 'ניו בלאנס', 'ניו באלנס'],
    'champion': ['champion', 'צ׳מפיון', 'צמפיון'],
    'lacoste': ['lacoste', 'לקוסט', 'לאקוסט'],
    'hollister': ['hollister', 'הוליסטר'],
    'abercrombie': ['abercrombie', 'abercrombie and fitch', 'a&f', 'אברקרומבי', 'אברקרומבי אנד פיץ׳'],
    'allsaints': ['allsaints', 'all saints', 'אולסיינטס', 'אול סיינטס'],
    'ellesse': ['ellesse', 'אלסה'],
    'new era': ['new era', 'newera', 'ניו ארה', 'ניוארה'],
    'collusion': ['collusion', 'קולוז׳ן', 'קולוזן'],
    'skims': ['סקימס'],
    'brownie': ['בראוני'],
  };

  private HEBREW_COLOR_SYNONYMS = {
    'red': ['אדום', 'אדומה', 'אדומים', 'אדומות'],
    'black': ['שחור', 'שחורה', 'שחורים', 'שחורות'],
    'white': ['לבן', 'לבנה', 'לבנים', 'לבנות'],
    'blue': ['כחול', 'כחולה', 'כחולים', 'כחולות'],
    'green': ['ירוק', 'ירוקה', 'ירוקים', 'ירוקות'],
    'yellow': ['צהוב', 'צהובה', 'צהובים', 'צהובות'],
    'pink': ['ורוד', 'ורודה', 'ורודים', 'ורודות'],
    'purple': ['סגול', 'סגולה', 'סגולים', 'סגולות'],
    'orange': ['כתום', 'כתומה', 'כתומים', 'כתומות'],
    'brown': ['חום', 'חומה', 'חומים', 'חומות'],
    'grey': ['אפור', 'אפורה', 'אפורים', 'אפורות', 'אפרפר'],
    'gray': ['אפור', 'אפורה', 'אפורים', 'אפורות', 'אפרפר'],
    'beige': ['בז׳', 'בז', 'בזים', 'בזות'],
    'navy': ['נייבי', 'כחול כהה'],
    'cream': ['קרם', 'שמנת'],
    'khaki': ['חאקי'],
    'burgundy': ['בורדו'],
    'silver': ['כסף', 'כסופה', 'כסופים', 'כסופות'],
    'gold': ['זהב', 'זהובה', 'זהובים', 'זהובות'],
    'multi': ['צבעוני', 'צבעונית', 'צבעוניים', 'צבעוניות', 'מולטי'],
    'mauve': ['סגלגל', 'סגלגלה', 'סגלגלים', 'סגלגלות'],
    'teal': ['טורקיז'],
    'coral': ['אלמוג', 'קורל'],
    'mint': ['מנטה'],
    'lavender': ['לבנדר', 'לוונדר', 'לונדר'],
    'stone': ['אבן']
  };

  // --- Hebrew price extraction ---
  private extractHebrewPrice(lowerQuery: string): { minPrice: number | null, maxPrice: number | null } {
    const hebrewPricePatterns = [
      { regex: /עד\s*(\d+)\s*(?:ש["׳]?(?:ח|קלים)?)/, type: 'max' },
      { regex: /בין\s*(\d+)\s*ל-?\s*(\d+)/, type: 'range' },
      { regex: /מקס(?:ימום|׳)?\s*(\d+)/, type: 'max' },
      { regex: /לפחות\s*(\d+)/, type: 'min' },
      { regex: /החל מ\s*(\d+)/, type: 'min' },
      { regex: /לא יותר מ\s*(\d+)/, type: 'max' },
      { regex: /יותר מ-?\s*(\d+)/, type: 'min' }, // NEW: 'יותר מ200' or 'יותר מ-200'
      { regex: /מינימום\s*(\d+)/, type: 'min' }, // NEW: 'מינימום 200'
    ];
    let minPrice: number | null = null;
    let maxPrice: number | null = null;
    for (const pat of hebrewPricePatterns) {
      const m = lowerQuery.match(pat.regex);
      if (m) {
        if (pat.type === 'max') maxPrice = parseInt(m[1]);
        if (pat.type === 'min') minPrice = parseInt(m[1]);
        if (pat.type === 'range') {
          minPrice = parseInt(m[1]);
          maxPrice = parseInt(m[2]);
        }
        break;
      }
    }
    return { minPrice, maxPrice };
  }

  // --- English price extraction ---
  private extractEnglishPrice(lowerQuery: string): { minPrice: number | null, maxPrice: number | null } {
    let minPrice: number | null = null;
    let maxPrice: number | null = null;
    const priceMatches = Array.from(lowerQuery.matchAll(/(\d+)\s*(?:ils?|shekel|₪|dollar|usd|\$|euro|eur|€)?/g));
    priceMatches.forEach(match => {
      const price = parseInt(match[1]);
      // Get context around the match (15 chars before and after)
      const before = lowerQuery.slice(Math.max(0, (match.index || 0) - 15), match.index);
      const after = lowerQuery.slice((match.index || 0) + match[0].length, (match.index || 0) + match[0].length + 15);
      const context = before + after;
      if (/not\s*(over|above|more)/.test(context)) {
        maxPrice = price;
      } else if (/min(imum)?|over|above|from|more/.test(context)) {
        minPrice = price;
      } else if (/max(imum)?|under|below|less/.test(context)) {
        maxPrice = price;
      } else if (!maxPrice) {
        // Default to maxPrice if not set
        maxPrice = price;
      } else if (!minPrice) {
        // If maxPrice is set, assign to minPrice
        minPrice = price;
      }
    });
    // Validation: if both minPrice and maxPrice are set and max < min, swap them
    if (minPrice !== null && maxPrice !== null && maxPrice < minPrice) {
      const tmp = minPrice;
      minPrice = maxPrice;
      maxPrice = tmp;
    }
    return { minPrice, maxPrice };
  }

  // --- Hebrew category extraction ---
  private extractHebrewCategories(lowerQuery: string, dbCategories: string[]): string[] {
    const foundCategories = new Set<string>();
    dbCategories.forEach(category => {
      if (lowerQuery.includes(category)) {
        foundCategories.add(ucfirst(category));
      }
    });
    Object.entries(CATEGORY_SEARCH_KEYWORDS_MAP).forEach(([category, synonyms]) => {
      console.log(synonyms.he, lowerQuery)
      // if (!dbCategories.includes(category.toLowerCase())) return;
      if (synonyms.he.some(h => lowerQuery.includes(h))) foundCategories.add(category);
    });
    return Array.from(foundCategories);
  }

  // --- English category extraction ---
  private extractEnglishCategories(lowerQuery: string, dbCategories: string[]): string[] {
    const foundCategories = new Set<string>();
    dbCategories.forEach(category => {
      if (lowerQuery.includes(category)) {
        foundCategories.add(ucfirst(category));
      }
    });
    Object.entries(CATEGORY_SEARCH_KEYWORDS_MAP).forEach(([category, synonyms]) => {
      if (!dbCategories.includes(category.toLowerCase())) return;
      synonyms.en.forEach(synonym => {
        let testQuery = lowerQuery;
        if (synonym === 'shirt' || synonym === 'shirts') {
          ['t-shirt', 'tshirt', 't shirt'].forEach(ts => {
            testQuery = testQuery.replace(new RegExp(ts, 'g'), '');
          });
        }
        if (testQuery.includes(synonym)) {
          foundCategories.add(category);
        }
      });
    });
    return Array.from(foundCategories);
  }

  // --- Hebrew color extraction ---
  private extractHebrewColors(lowerQuery: string, dbColors: string[]): string[] {
    const foundColors = new Set<string>();
    Object.entries(this.HEBREW_COLOR_SYNONYMS).forEach(([color, syns]) => {
      if (!dbColors.includes(color.toLowerCase())) return;
      if (syns.some(h => lowerQuery.includes(h))) foundColors.add(ucfirst(color));
    });
    return Array.from(foundColors);
  }

  // --- English color extraction ---
  private extractEnglishColors(lowerQuery: string, dbColors: string[]): string[] {
    const foundColors = new Set<string>();
    dbColors.forEach(color => {
      if (lowerQuery.includes(color)) {
        foundColors.add(ucfirst(color));
      }
    });
    this.COLOR_KEYWORDS.forEach(color => {
      if (lowerQuery.includes(color)) {
        foundColors.add(ucfirst(color));
      }
    });
    return Array.from(foundColors);
  }

  async parseSearchQuery(query: string): Promise<ParsedFilters> {
    const filters: ParsedFilters = {
      colors: [],
      categories: [],
      brands: [],
      maxPrice: null,
      minPrice: null,
      keywords: [],
      gender: null,
      isOnSale: null,
      sources: [],
    };
    const lowerQuery = query.toLowerCase();

    // Fetch all DB values for brands, categories, colors
    const [brandsRes, categoriesRes, colorsRes] = await Promise.all([
      this.brandService.findAll(0, 1000),
      this.categoryService.findAll(0, 1000, ''),
      this.colorService.findAll(0, 1000),
    ]);
    const dbBrands = (brandsRes.data || []).map((b: any) => b.name.toLowerCase());
    const dbCategories = (categoriesRes.data || []).map((c: any) => c.name.toLowerCase());
    const dbColors = (colorsRes.data || []).map((c: any) => c.name.toLowerCase());

    // --- Price extraction ---
    let priceResult = this.extractHebrewPrice(lowerQuery);
    if (priceResult.minPrice === null && priceResult.maxPrice === null) {
      priceResult = this.extractEnglishPrice(lowerQuery);
    }
    filters.minPrice = priceResult.minPrice;
    filters.maxPrice = priceResult.maxPrice;

    // --- Category extraction ---
    let categories = this.extractHebrewCategories(lowerQuery, dbCategories);
    if (!categories.length) {
      categories = this.extractEnglishCategories(lowerQuery, dbCategories);
    }
    filters.categories = categories;

    // --- Color extraction ---
    let colors = this.extractHebrewColors(lowerQuery, dbColors);
    if (!colors.length) {
      colors = this.extractEnglishColors(lowerQuery, dbColors);
    }
    filters.colors = colors;

    // Extract brands
    const foundBrands = new Set<string>();
    // Normalize function for brand matching
    function normalizeBrandStr(str: string) {
      return str.replace(/&/g, 'and').replace(/\band\b/g, 'and').replace(/\s+/g, ' ').trim();
    }
    const normalizedQuery = lowerQuery.replace(/&/g, 'and').replace(/\band\b/g, 'and').replace(/\s+/g, ' ').trim();
    dbBrands.forEach(brand => {
      if (normalizedQuery.includes(normalizeBrandStr(brand))) {
        foundBrands.add(ucfirst(brand));
      }
    });
    Object.entries(this.BRAND_SYNONYMS).forEach(([brand, synonyms]) => {
      if (!dbBrands.includes(brand.toLowerCase())) return;
      synonyms.forEach(synonym => {
        if (normalizedQuery.includes(normalizeBrandStr(synonym))) {
          foundBrands.add(normalizeBrandName(ucfirst(brand)));
        }
      });
    });
    filters.brands = Array.from(foundBrands).filter(Boolean);

    // Extract gender
    if (lowerQuery.includes('men') || lowerQuery.includes('male')) {
      filters.gender = 'Men';
    } else if (lowerQuery.includes('women') || lowerQuery.includes('female')) {
      filters.gender = 'Women';
    }

    // Extract general keywords (words that aren't colors, prices, or categories or brands)
    const words = query.toLowerCase().split(/\s+/);
    const foundKeywords = new Set<string>();
    words.forEach(word => {
      const cleanWord = word.replace(/[^\w]/g, '');
      if (
        cleanWord.length > 2 &&
        !filters.colors.includes(cleanWord) &&
        !filters.categories.includes(cleanWord) &&
        !filters.brands.includes(cleanWord) &&
        isNaN(Number(cleanWord)) === false &&
        !['at', 'and', 'or', 'the', 'a', 'an', 'in', 'on', 'with', 'for', 'to', 'of', 'by', 'from', 'under', 'below', 'above', 'over', 'max', 'maximum', 'min', 'minimum', 'price', 'cost', 'ils', 'shekel', 'dollar', 'euro', 'usd', 'eur'].includes(cleanWord)
      ) {
        foundKeywords.add(cleanWord);
      }
    });
    filters.keywords = Array.from(foundKeywords);

    // --- Sale/Not On Sale detection ---
    if (
      lowerQuery.includes('במבצע') ||
      lowerQuery.includes('במחיר מבצע') ||
      /\bsale\b/.test(lowerQuery)
    ) {
      filters.isOnSale = 'Yes';
    } else if (/\b(not on sale|לא במבצע|במחיר מלא)\b/.test(lowerQuery)) {
      filters.isOnSale = 'False';
    }

    // --- Source detection ---
    const sourceKeywords = [
      { key: 'Factory54', patterns: [/\bfactory\b/, /\bfactory54\b/, /factory 54/, /פקטורי/] },
      { key: 'Terminalx', patterns: [/\bterminal\b/, /\bterminalx\b/, /terminal x/, /טרמינל/, /טרמינל איקס/] },
      { key: 'Asos', patterns: [/\basos\b/, /אסוס/] },
      { key: 'ItayBrands', patterns: [/\itay b\b/, /איתי בר/] },
      { key: 'Zara', patterns: [/\zara\b/, /זארה/] },

    ];
    filters.sources = sourceKeywords
      .filter(src => src.patterns.some(pat => pat.test(lowerQuery)))
      .map(src => src.key);

    return filters;
  }
} 