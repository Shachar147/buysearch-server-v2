import { Injectable } from '@nestjs/common';
import { BrandService } from '../brand/brand.service';
import { CategoryService } from '../category/category.service';
import { ColorService } from '../color/color.service';
import { ucfirst } from './search.utils';

export interface ParsedFilters {
  colors: string[];
  categories: string[];
  brands: string[];
  maxPrice: number | null;
  minPrice: number | null;
  keywords: string[];
  gender: string | null;
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

  private CATEGORY_SYNONYMS = {
    'T-Shirts & Vests': ['t-shirt', 'tshirt', 'tee', 't shirt', 'tank top', 'vest'],
    'Shirts': ['shirt', 'blouse', 'button down', 'button-up', 'dress shirt'],
    'Jeans': ['jeans', 'denim', 'pants', 'trousers'],
    'Jackets & Coats': ['jacket', 'coat', 'blazer', 'suit jacket'],
    'Dresses': ['dress', 'gown', 'frock'],
    'Shoes': ['shoes', 'footwear', 'sneakers', 'trainers', 'boots', 'sandals'],
    'Accessories': ['accessories', 'jewelry', 'watch', 'sunglasses', 'bag', 'hat'],
  };

  private BRAND_SYNONYMS = {
    'tommy hilfiger': ['tommy hilfiger', 'tommy h', 'hilfiger'],
    'calvin klein': ['calvin klein', 'calvin', 'klein'],
    'polo ralph lauren': ['polo ralph lauren', 'polo', 'ralph lauren'],
    "levi's": ["levi's", 'levis', 'levi'],
    'nike': ['nike'],
    'adidas': ['adidas'],
    'converse': ['converse'],
    'jordan': ['jordan'],
    'new balance': ['new balance', 'newbalance'],
    'champion': ['champion'],
    'lacoste': ['lacoste'],
    'hollister': ['hollister'],
    'abercrombie': ['abercrombie', 'abercrombie and fitch', 'a&f'],
    'allsaints': ['allsaints', 'all saints'],
    'ellesse': ['ellesse'],
    'new era': ['new era', 'newera'],
    'collusion': ['collusion']
  };

  async parseSearchQuery(query: string): Promise<ParsedFilters> {
    const filters: ParsedFilters = {
      colors: [],
      categories: [],
      brands: [],
      maxPrice: null,
      minPrice: null,
      keywords: [],
      gender: null
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

    // Extract colors
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
    filters.colors = Array.from(foundColors).filter(Boolean);

    // Extract price information (support both min and max in a single query)
    const priceMatches = Array.from(lowerQuery.matchAll(/(\d+)\s*(?:ils?|shekel|₪|dollar|usd|\$|euro|eur|€)?/g));
    priceMatches.forEach(match => {
      const price = parseInt(match[1]);
      // Get context around the match (15 chars before and after)
      const before = lowerQuery.slice(Math.max(0, (match.index || 0) - 15), match.index);
      const after = lowerQuery.slice((match.index || 0) + match[0].length, (match.index || 0) + match[0].length + 15);
      const context = before + after;
      if (/not\s*(over|above|more)/.test(context)) {
        filters.maxPrice = price;
      } else if (/min(imum)?|over|above|more/.test(context)) {
        filters.minPrice = price;
      } else if (/max(imum)?|under|below|less/.test(context)) {
        filters.maxPrice = price;
      } else if (!filters.maxPrice) {
        // Default to maxPrice if not set
        filters.maxPrice = price;
      } else if (!filters.minPrice) {
        // If maxPrice is set, assign to minPrice
        filters.minPrice = price;
      }
    });

    // Extract categories
    const foundCategories = new Set<string>();
    dbCategories.forEach(category => {
      if (lowerQuery.includes(category)) {
        foundCategories.add(ucfirst(category));
      }
    });
    Object.entries(this.CATEGORY_SYNONYMS).forEach(([category, synonyms]) => {
      synonyms.forEach(synonym => {
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
    filters.categories = Array.from(foundCategories).filter(Boolean);

    // Extract brands
    const foundBrands = new Set<string>();
    dbBrands.forEach(brand => {
      if (lowerQuery.includes(brand)) {
        foundBrands.add(ucfirst(brand));
      }
    });
    Object.entries(this.BRAND_SYNONYMS).forEach(([brand, synonyms]) => {
      synonyms.forEach(synonym => {
        if (lowerQuery.includes(synonym)) {
          foundBrands.add(ucfirst(brand));
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

    return filters;
  }
} 