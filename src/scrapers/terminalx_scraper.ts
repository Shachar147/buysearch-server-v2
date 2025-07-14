// terminalx_scraper.ts – v2 (using BaseScraper)
// =============================================================
// Features:
// - Extends BaseScraper for common functionality
// - Scans categories (configurable)
// - Extracts product info (title, url, images, colors, price, brand, categories, gender, source)
// - Uses both API info and keyword/alias enrichment
// - Saves to PostgreSQL via ProductService
//
// Usage: npm run scrape:terminalx

import axios from 'axios';
import { BaseScraper, Category } from './base-scraper';
import { Product, extractColorsWithHebrew, calcSalePercent, normalizeBrandName } from './scraper_utils';
import * as dotenv from 'dotenv';
dotenv.config();

// --- Category config ---
const MEN = 11221;
const WOMEN = 11220;
const CATEGORIES = [
  { id: '17486', name: 'Swimwear', gender: 'Men', baseUrl: 'men/swimwear' },
  { id: '175', name: 'Jeans', gender: 'Men', baseUrl: 'men/pants/jeans'},
  { id: '169', name: 'T-Shirts & Vests', gender: 'Men', baseUrl: 'men/shirts/tshirts'},
  { id: '171', name: 'Shirts', gender: 'Men', baseUrl: 'men/shirts/dress-shirts'},
  { id: '367', name: 'Boxers', gender: 'Men', baseUrl: 'men/underwear/underpants'},
  { id: '122', name: 'Dresses', gender: 'Women', baseUrl: 'women/dresses' },
  { id: '128', name: 'Jeans', gender: 'Women', baseUrl: 'women/pants-skirts/jeans' },
  { id: '132', name: 'T-Shirts & Vests', gender: 'Women', baseUrl: 'women/tops/tshirts' },

  // by brand
  { id: '17345', name: 'Polo Ralph Lauren', gender: 'Men', baseUrl: 'brands/ralph-lauren', additionalFilters: { department_level: { eq: MEN }}},
  { id: '17345', name: 'Polo Ralph Lauren', gender: 'Women', baseUrl: 'brands/ralph-lauren', additionalFilters: { department_level: { eq: WOMEN }}},
  { id: '17125', name: 'Tommy Hilfiger', gender: 'Men', baseUrl: 'brands/tommy-hilfiger', additionalFilters: { department_level: { eq: MEN }}},
  { id: '17125', name: 'Tommy Hilfiger', gender: 'Women', baseUrl: 'brands/tommy-hilfiger', additionalFilters: { department_level: { eq: WOMEN }}},
  { id: '17045', name: 'Calvin Klein', gender: 'Men', baseUrl: 'brands/calvin-klein', additionalFilters: { department_level: { eq: MEN }}},
  { id: '17045', name: 'Calvin Klein', gender: 'Women', baseUrl: 'brands/calvin-klein', additionalFilters: { department_level: { eq: WOMEN }}},
  { id: '30337', name: 'Lacoste', gender: 'Men', baseUrl: 'brands/lacoste', additionalFilters: { department_level: { eq: MEN }}},
  { id: '30337', name: 'Lacoste', gender: 'Women', baseUrl: 'brands/lacoste', additionalFilters: { department_level: { eq: WOMEN }}},
  { id: '20188', name: 'Allsaints', gender: 'Men', baseUrl: 'brands/all-saints', additionalFilters: { department_level: { eq: MEN }}},
  { id: '20188', name: 'Allsaints', gender: 'Women', baseUrl: 'brands/all-saints', additionalFilters: { department_level: { eq: WOMEN }}},
  { id: '30406', name: 'Jordan', gender: 'Men', baseUrl: 'brands/jordan', additionalFilters: { department_level: { eq: MEN }}},
  { id: '30406', name: 'Jordan', gender: 'Women', baseUrl: 'brands/jordan', additionalFilters: { department_level: { eq: WOMEN }}},
  { id: '23789', name: 'UGG', gender: 'Men', baseUrl: 'brands/ugg', additionalFilters: { department_level: { eq: MEN }}},
  { id: '23789', name: 'UGG', gender: 'Women', baseUrl: 'brands/ugg', additionalFilters: { department_level: { eq: WOMEN }}},
  { id: '19718', name: 'Champion', gender: 'Men', baseUrl: 'brands/champion', additionalFilters: { department_level: { eq: MEN }}},
  { id: '19718', name: 'Champion', gender: 'Women', baseUrl: 'brands/champion', additionalFilters: { department_level: { eq: WOMEN }}},
  { id: '19669', name: 'New Era', gender: 'Men', baseUrl: 'brands/new-era', additionalFilters: { department_level: { eq: MEN }}},
  { id: '19669', name: 'New Era', gender: 'Women', baseUrl: 'brands/new-era', additionalFilters: { department_level: { eq: WOMEN }}},
  { id: '23974', name: 'Prada', gender: 'Men', baseUrl: 'brands/prada', additionalFilters: { department_level: { eq: MEN }}},
  { id: '23974', name: 'Prada', gender: 'Women', baseUrl: 'brands/prada', additionalFilters: { department_level: { eq: WOMEN }}},
  { id: '347', name: 'Nike', gender: 'Men', baseUrl: 'brands/nike', additionalFilters: { department_level: { eq: MEN }}},
  { id: '347', name: 'Nike', gender: 'Women', baseUrl: 'brands/nike', additionalFilters: { department_level: { eq: WOMEN }}},
  // Add more categories here
    // { id: '', name: 'TRENDING / SHEER', gender: 'Women', baseUrl: 'women/trending/sheer-trend' },
    // { id: '', name: 'TRENDING / METALLIC', gender: 'Women', baseUrl: 'women/trending/metallic' },
    // { id: '', name: 'TRENDING / BALLERINA-SHOES', gender: 'Women', baseUrl: 'women/trending/ballerina-shoes' },
    // { id: '', name: 'TRENDING / SLINGBACK HEELS', gender: 'Women', baseUrl: 'women/trending/slingback-heels' },
    // { id: '', name: 'TRENDING / MULES', gender: 'Women', baseUrl: 'women/trending/mules' },
    // { id: '', name: 'TRENDING / PLATFORMS', gender: 'Women', baseUrl: 'women/trending/platforms' },
    // { id: '', name: 'TRENDING / Floral', gender: 'Women', baseUrl: 'women/trending/floral' },
    // { id: '', name: 'TRENDING / RED', gender: 'Women', baseUrl: 'women/trending/red' },
    // { id: '', name: 'TRENDING / beach wear', gender: 'Women', baseUrl: 'women/trending/beach-wear' },
    // { id: '', name: 'TRENDING / Stripes', gender: 'Women', baseUrl: 'women/trending/stripes' },
    // { id: '', name: 'TRENDING / Sets', gender: 'Women', baseUrl: 'women/trending/sets' },
    // { id: '', name: 'חולצות / טופים', gender: 'Women', baseUrl: 'women/tops/shirts' },
    // { id: '', name: 'חולצות / טישירטים', gender: 'Women', baseUrl: 'women/tops/tshirts' },
    // { id: '', name: 'חולצות / חולצות מכופתרות', gender: 'Women', baseUrl: 'women/tops/dress-shirts' },
    // { id: '', name: 'חולצות / גופיות', gender: 'Women', baseUrl: 'women/tops/tank-tops' },
    // { id: '', name: 'חולצות / חולצות ספורט', gender: 'Women', baseUrl: 'women/tops/sport-tops' },
    // { id: '', name: 'חולצות / בגדי גוף', gender: 'Women', baseUrl: 'women/tops/leotard' },
    // { id: '', name: 'מכנסיים / ג\'ינס', gender: 'Women', baseUrl: 'women/pants-skirts/jeans' },
    // { id: '', name: 'מכנסיים / מכנסיים ארוכים', gender: 'Women', baseUrl: 'women/pants-skirts/long-pants' },
    // { id: '', name: 'מכנסיים / טייצים', gender: 'Women', baseUrl: 'women/pants-skirts/leggings' },
    // { id: '', name: 'מכנסיים / מכנסיים קצרים', gender: 'Women', baseUrl: 'women/pants-skirts/shorts' },
    // { id: '', name: 'מכנסיים / מכנסי טרנינג', gender: 'Women', baseUrl: 'women/pants-skirts/joggers' },
    // { id: '', name: 'שמלות וחצאיות / שמלות מקסי', gender: 'Women', baseUrl: 'women/dresses/maxi' },
    // { id: '', name: 'שמלות וחצאיות / שמלות מידי', gender: 'Women', baseUrl: 'women/dresses/midi' },
    // { id: '', name: 'שמלות וחצאיות / שמלות מיני', gender: 'Women', baseUrl: 'women/dresses/short-dresses' },
    // { id: '', name: 'שמלות וחצאיות / חצאיות מקסי', gender: 'Women', baseUrl: 'women/dresses/maxiskirts' },
    // { id: '', name: 'שמלות וחצאיות / חצאיות מידי', gender: 'Women', baseUrl: 'women/dresses/midiskirts' },
    // { id: '', name: 'שמלות וחצאיות / חצאיות מיני', gender: 'Women', baseUrl: 'women/dresses/miniskirts' },
    // { id: '', name: 'חליפות ואוברולים / אוברולים', gender: 'Women', baseUrl: 'women/suits-and-overalls/overalls' },
    // { id: '', name: 'חליפות ואוברולים / חליפות', gender: 'Women', baseUrl: 'women/suits-and-overalls/suits' },
    // { id: '', name: 'הלבשה תחתונה / תחתונים', gender: 'Women', baseUrl: 'women/lingerie/underwear' },
    // { id: '', name: 'הלבשה תחתונה / גרביים וגרביונים', gender: 'Women', baseUrl: 'women/lingerie/tights-socks' },
    // { id: '', name: 'הלבשה תחתונה / חזיות', gender: 'Women', baseUrl: 'women/lingerie/bras' },
    // { id: '', name: 'הלבשה תחתונה / פיג\'מות', gender: 'Women', baseUrl: 'women/lingerie/pyjamas' },
    // { id: '', name: 'הלבשה תחתונה / מחטבים', gender: 'Women', baseUrl: 'women/lingerie/shapewear' },
    // { id: '', name: 'נעליים / סנדלים וכפכפים', gender: 'Women', baseUrl: 'women/shoes/sandals' },
    // { id: '', name: 'נעליים / סניקרס', gender: 'Women', baseUrl: 'women/shoes/sneakers-shoes' },
    // { id: '', name: 'נעליים / נעליים שטוחות', gender: 'Women', baseUrl: 'women/shoes/flat-shoes' },
    // { id: '', name: 'נעליים / נעלי ספורט', gender: 'Women', baseUrl: 'women/shoes/sports-shoes' },
    // { id: '', name: 'נעליים / נעלי עקב', gender: 'Women', baseUrl: 'women/shoes/heels' },
    // { id: '', name: 'נעליים / נעלי בית', gender: 'Women', baseUrl: 'women/shoes/slippers' },
    // { id: '', name: 'נעליים / מגפיים ומגפונים', gender: 'Women', baseUrl: 'women/shoes/boots' },
    // { id: '', name: 'אקססוריז / חגורות', gender: 'Women', baseUrl: 'women/accessories/belts' },
    // { id: '', name: 'אקססוריז / משקפי שמש', gender: 'Women', baseUrl: 'women/accessories/sun-glasses' },
    // { id: '', name: 'אקססוריז / כובעים ואביזרי שיער', gender: 'Women', baseUrl: 'women/accessories/hats' },
    // { id: '', name: 'אקססוריז / לייף סטייל', gender: 'Women', baseUrl: 'women/accessories/life-style' },
    // { id: '', name: 'אקססוריז / אביזרי ספורט', gender: 'Women', baseUrl: 'women/accessories/sports' },
    // { id: '', name: 'אקססוריז / צעיפים וכפפות', gender: 'Women', baseUrl: 'women/accessories/scarves' },
    // { id: '', name: 'תיקים וארנקים / ארנקים', gender: 'Women', baseUrl: 'women/bags/purses' },
    // { id: '', name: 'תיקים וארנקים / תיקי גב', gender: 'Women', baseUrl: 'women/bags/backpacks' },
    // { id: '', name: 'תיקים וארנקים / תיקי צד', gender: 'Women', baseUrl: 'women/bags/cross-bags' },
    // { id: '', name: 'תיקים וארנקים / תיקי ערב', gender: 'Women', baseUrl: 'women/bags/evening-bags' },
    // { id: '', name: 'תיקים וארנקים / קלמרים', gender: 'Women', baseUrl: 'women/bags/pencil-cases' },
    // { id: '', name: 'תיקים וארנקים / תיקי נשיאה', gender: 'Women', baseUrl: 'women/bags/tote-bags' },
    // { id: '', name: 'תכשיטים ושעונים / טבעות', gender: 'Women', baseUrl: 'women/jewellery/rings' },
    // { id: '', name: 'תכשיטים ושעונים / שרשראות', gender: 'Women', baseUrl: 'women/jewellery/necklaces' },
    // { id: '', name: 'תכשיטים ושעונים / צמידים', gender: 'Women', baseUrl: 'women/jewellery/bracelets' },
    // { id: '', name: 'תכשיטים ושעונים / עגילים', gender: 'Women', baseUrl: 'women/jewellery/earrings' },
    // { id: '', name: 'תכשיטים ושעונים / שעונים', gender: 'Women', baseUrl: 'women/jewellery/שעונים' },
    // { id: '', name: 'תכשיטים ושעונים / צ\'ארמס', gender: 'Women', baseUrl: 'women/jewellery/charms' },
    // { id: '', name: 'ג\'קטים ומעילים / ג\'קטים', gender: 'Women', baseUrl: 'women/jackets-coats/jackets' },
    // { id: '', name: 'ג\'קטים ומעילים / מעילים', gender: 'Women', baseUrl: 'women/jackets-coats/coats' },
    // { id: '', name: 'סוודרים וסווטשירטים / סווטשירטים', gender: 'Women', baseUrl: 'women/knitwear-sweatshirts/sweatshirts' },
    // { id: '', name: 'סוודרים וסווטשירטים / סוודרים וסריגים', gender: 'Women', baseUrl: 'women/knitwear-sweatshirts/knitwear' },
    // { id: '', name: 'סוודרים וסווטשירטים / קרדיגנים', gender: 'Women', baseUrl: 'women/knitwear-sweatshirts/cardigans' },
    // { id: '', name: 'בגדי ים / ביקיני', gender: 'Women', baseUrl: 'women/swimsuit/bikini' },
    // { id: '', name: 'בגדי ים / שלם', gender: 'Women', baseUrl: 'women/swimsuit/one-piece' },
    // { id: '', name: 'בגדי ים / בגדי חוף', gender: 'Women', baseUrl: 'women/swimsuit/swimwear' },
    // { id: '', name: 'קולקציות / SPORTS', gender: 'Women', baseUrl: 'women/collections/active' },
    // { id: '', name: 'קולקציות / EVENING', gender: 'Women', baseUrl: 'women/collections/evening' },
    // { id: '', name: 'קולקציות / OFFICE', gender: 'Women', baseUrl: 'women/collections/office' },
    // { id: '', name: 'קולקציות / MATERNITY', gender: 'Women', baseUrl: 'women/collections/maternity' },
    // { id: '', name: 'קולקציות / PLUS SIZE', gender: 'Women', baseUrl: 'women/collections/plus-size' },
    // { id: '', name: 'קולקציות / תחפושות לנשים', gender: 'Women', baseUrl: 'women/collections/purim' },
    // { id: '', name: 'קולקציות / בייסיק', gender: 'Women', baseUrl: 'women/collections/basic' },
    // { id: '', name: 'קולקציות / שמלות ערב צנועות', gender: 'Women', baseUrl: 'women/collections/modest-fashion' },
    // { id: '', name: 'קולקציות / SUSTAINABLE', gender: 'Women', baseUrl: 'women/collections/sustainability' },

];

const categoryIdToName = CATEGORIES.reduce((acc, c) => {
    acc[c.id] = c.name; 
    return acc;
}, {} as Record<string, string>);

const BASE_URL = 'https://www.terminalx.com/a/listingSearch';

class TerminalXScraper extends BaseScraper {
  protected readonly scraperName = 'TerminalX';
  protected readonly source = 'terminalx.com';

  protected getCategories(): Category[] {
    return CATEGORIES;
  }

  protected async scrapeCategory(category: Category): Promise<Product[]> {
    return this.scrapeTerminalXCategory(category);
  }

  private async fetchTerminalXPage(categoryId: string, page: number, pageSize: number = 24, additionalFilters = {}) {
    const body = {
      listingSearchQuery: {
        categoryId,
        filter: { category_id: { eq: categoryId }, ...additionalFilters },
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

  private parseTerminalXProduct(item: any, categoryPath: string[], gender: string, baseUrl: string): Product {
    // Use item.name, or fallback to item.image?.label, or empty string
    const title = item.name || item.image?.label || '';
    const images: string[] = [];
    if (item.image?.url) images.push(item.image.url);
    if (item.media_gallery) images.push(...item.media_gallery.map((img: any) => img.url));
    
    const apiColors = item.configurable_options?.find((opt: any) => opt.attribute_code === 'color')?.values?.map((v: any) => v.label) || [];
    const colors = extractColorsWithHebrew(title, apiColors, 'terminalx_scraper');
    
    const price = item.price_range?.minimum_price?.final_price?.value ?? 0;
    const oldPrice = item.price_range?.minimum_price?.regular_price?.value ?? 0;

    const categories = Array.from(new Set([
      ...categoryPath,
      ...item.category_ids.map((c_id) => categoryIdToName[Number(c_id)]).filter(Boolean)
    ]));

    return this.createProduct({
      title,
      url: `https://www.terminalx.com/${baseUrl}/${item.sku.toLowerCase()}`,
      images,
      colors,
      isSellingFast: false, // Not available in API
      price,
      oldPrice,
      salePercent: calcSalePercent(price, oldPrice) ?? 0,
      currency: item.price_range?.minimum_price?.final_price?.currency ?? 'ILS',
      brand: normalizeBrandName(item.brand_url?.name ?? 'Unknown'),
      categories,
      gender,
    });
  }

  private async scrapeTerminalXCategory(cat: Category): Promise<Product[]> {
    let page = 1;
    let totalPages = 1;
    let allProducts: Product[] = [];
    
    do {
      const result = await this.fetchTerminalXPage(cat.id as string, page, undefined, cat.additionalFilters);
      const items = result.items || [];
      totalPages = result.page_info?.total_pages || 1;
      
      this.logProgress(`Scanning ${cat.name} page ${page}/${totalPages} (${items.length} items)`);
      
      allProducts.push(...items.map((item: any) => 
        this.parseTerminalXProduct(item, [cat.name], cat.gender, (cat as any).baseUrl)
      ));
      
      page++;
    } while (page <= totalPages);
    
    return allProducts;
  }
}

// Main function
async function main() {
  const scraper = new TerminalXScraper();
  await scraper.run();
}

// CLI entry point
if (require.main === module) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

export { main, TerminalXScraper }; 