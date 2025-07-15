// itaybrands_scraper.ts – v1
// =============================================================
// Features:
// - Extends BaseScraper for common functionality
// - Scans categories (configurable)
// - Extracts product info (title, url, images, colors, price, brand, categories, gender, source, variants)
// - Uses HTML parsing (cheerio) to extract data from meta.products and DOM
// - Saves to PostgreSQL via ProductService
//
// Usage: npm run scrape:itaybrands

import axios from 'axios';
import * as cheerio from 'cheerio';
import { BaseScraper, Category } from './base-scraper';
import { Product, extractColorsWithHebrew, calcSalePercent, normalizeBrandName } from './scraper_utils';
import * as dotenv from 'dotenv';
dotenv.config();

const CATEGORIES: Category[] = [
  {
    id: 'shirts-men',
    name: 'Shirts',
    gender: 'Men',
    url: 'https://itaybrands.co.il/collections/%D7%97%D7%95%D7%9C%D7%A6%D7%95%D7%AA-%D7%92%D7%91%D7%A8%D7%99%D7%9D',
  },
  // Add more categories as needed
];

const BASE_URL = 'https://itaybrands.co.il';

class ItayBrandsScraper extends BaseScraper {
  protected readonly scraperName = 'ItayBrands';
  protected readonly source = 'itaybrands.co.il';

  protected getCategories(): Category[] {
    return CATEGORIES;
  }

  protected async scrapeCategory(category: Category): Promise<Product[]> {
    return this.scrapeItayBrandsCategory(category);
  }

  private async fetchItayBrandsPage(url: string): Promise<string> {
    const { data } = await axios.get(url, {
      headers: {
        'accept': 'text/html,application/xhtml+xml,application/xml',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
      },
    });
    return data;
  }

  /**
   * Extracts the last occurrence of productVariants from the HTML and parses it as JSON.
   */
  private extractLastProductVariants(html: string): any[] {
    // Find all occurrences of "productVariants":\[...\]
    const regex = /"productVariants":(\[[\s\S]*?\])[,}]/g;
    let match;
    let lastMatch = null;
    while ((match = regex.exec(html)) !== null) {
      lastMatch = match[1];
    }
    if (!lastMatch) return [];
    try {
      return JSON.parse(lastMatch);
    } catch (e) {
      this.logWarning('Failed to parse productVariants JSON');
      return [];
    }
  }

  private extractProductImages($: cheerio.CheerioAPI, handle: string): string[] {
    // Find product-card[data-handle=handle] and extract all <img src="...">
    const images: string[] = [];
    const $card = $(`product-card[data-handle="${handle}"]`);
    $card.find('img').each((_, img) => {
      const src = $(img).attr('src');
      if (src && !images.includes(src)) images.push(src.startsWith('http') ? src : BASE_URL + src);
    });
    return images;
  }

  private parseItayBrandsVariant(variant: any, category: Category): Product {
    if (variant.product.url == '/products/%D7%92%D7%95%D7%A4%D7%99%D7%99%D7%AA-%D7%9B%D7%95%D7%AA%D7%A0%D7%94-%D7%91%D7%99%D7%99%D7%A1%D7%99%D7%A7') {
        console.log("hereeee", variant);
    }
    // variant: { price: { amount, currencyCode }, product: { title, vendor, ... }, ... }
    const title = variant.product?.title || '';
    const url = variant.product?.url ? `${BASE_URL}/${variant.product.url}` : '';
    if (!url){

        console.error("url not found", variant);
    }
    const images = Array.isArray(variant.product?.images) ? variant.product.images : [];
    const colors = extractColorsWithHebrew(title, [variant.public_title].filter(Boolean), 'itaybrands_scraper');
    const price = typeof variant.price?.amount === 'number' ? variant.price.amount : null;
    const oldPrice = null; // Sale price logic can be added if available
    const salePercent = calcSalePercent(price, oldPrice) ?? 0;
    const currency = variant.price?.currencyCode || 'ILS';
    const brand = normalizeBrandName(variant.product?.vendor || 'Itay Brands');
    const categories = [category.name, variant.product?.type].filter(Boolean);
    const gender = category.gender;
    const product = {
      title,
      url,
      images,
      colors,
      isSellingFast: false,
      price,
      oldPrice,
      salePercent,
      currency,
      brand,
      categories,
      gender,
    };
    return this.createProduct(product);
  }

  private async scrapeItayBrandsCategory(category: Category): Promise<Product[]> {
    let page = 1;
    let allProducts: Product[] = [];
    let hasMore = true;
    while (hasMore) {
      const url = `${category.url}${page > 1 ? `?page=${page}` : ''}`;
      this.logProgress(`Fetching ${url}`);
      const html = await this.fetchItayBrandsPage(url);
      const variants = this.extractLastProductVariants(html);
      
      this.logProgress(`extractLastProductVariants found: ${variants.length} variants`);
      if (!variants.length) break;
      allProducts.push(...variants.map((variant: any) => this.parseItayBrandsVariant(variant, category)));

      // If less than 24 variants, it's the last page
      hasMore = variants.length === 20;
      page++;
    }
    return allProducts;
  }
}

// Main function
async function main() {
  const scraper = new ItayBrandsScraper();
  await scraper.run();
}

// CLI entry point
if (require.main === module) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

export { main, ItayBrandsScraper }; 