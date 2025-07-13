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
import { Product, extractColors, calcSalePercent } from './scraper_utils';
import * as dotenv from 'dotenv';
dotenv.config();

// --- Category config ---
const CATEGORIES = [
  { id: '17486', name: 'Swimwear', gender: 'Men', baseUrl: 'men/swimwear/' },
  // Add more categories here
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

  private async fetchTerminalXPage(categoryId: string, page: number, pageSize: number = 24) {
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

  private parseTerminalXProduct(item: any, categoryPath: string[], gender: string, baseUrl: string): Product {
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
      brand: item.brand_url?.name || 'Unknown',
      categories,
      gender,
    });
  }

  private async scrapeTerminalXCategory(cat: Category): Promise<Product[]> {
    let page = 1;
    let totalPages = 1;
    let allProducts: Product[] = [];
    
    do {
      const result = await this.fetchTerminalXPage(cat.id as string, page);
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