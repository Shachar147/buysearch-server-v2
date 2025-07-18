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
import puppeteer from 'puppeteer';
import { BaseScraper } from './base/base-scraper';
import { Category as CategoryType } from './base/base-scraper';
import { Product, extractColorsWithHebrew, calcSalePercent, normalizeBrandName, extractCategory } from './base/scraper_utils';
import * as dotenv from 'dotenv';
import { Category } from '../category.constants';
dotenv.config();

const CATEGORIES: CategoryType[] = [
  {
    id: 'shirts-men',
    name: Category.SHIRTS,
    gender: 'Men',
    url: 'https://itaybrands.co.il/collections/%D7%97%D7%95%D7%9C%D7%A6%D7%95%D7%AA-%D7%92%D7%91%D7%A8%D7%99%D7%9D',
  },
  {
    id: 'pants',
    name: Category.PANTS,
    gender: 'Men',
    url: 'https://itaybrands.co.il/collections/%D7%9E%D7%9B%D7%A0%D7%A1%D7%99%D7%99%D7%9D-%D7%92%D7%91%D7%A8%D7%99%D7%9D'
  },
  {
    id: 'jewelry',
    name: Category.JEWELRY,
    gender: 'Men',
    url: 'https://itaybrands.co.il/collections/%D7%AA%D7%9B%D7%A9%D7%99%D7%98%D7%99%D7%9D'
  },
  {
    id: 't-shirts',
    name: Category.T_SHIRTS, 
    gender: 'Women',
    url: 'https://itaybrands.co.il/collections/%D7%97%D7%95%D7%9C%D7%A6%D7%95%D7%AA'
  },
  {
    id: 'pants',
    name: Category.PANTS,
    gender: 'Women',
    url: 'https://itaybrands.co.il/collections/%D7%9E%D7%9B%D7%A0%D7%A1%D7%99%D7%99%D7%9D'
  },
  {
    id: 'bodysuits',
    name: Category.BODYSUITS,
    gender: 'Women',
    url: 'https://itaybrands.co.il/collections/%D7%91%D7%92%D7%93%D7%99-%D7%92%D7%95%D7%A3',
  },
  {
    id: 'overalls',
    name: Category.OVERALLS,
    gender: 'Women',
    url: 'https://itaybrands.co.il/collections/%D7%90%D7%95%D7%91%D7%A8%D7%95%D7%9C%D7%99%D7%9D',
  },
  {
    id: 'dresses',
    name: Category.DRESSES,
    gender: 'Women',
    url: 'https://itaybrands.co.il/collections/%D7%A9%D7%9E%D7%9C%D7%95%D7%AA',
  },
  {
    id: 'skirts',
    name: Category.SKIRTS,
    gender: 'Women',
    url: 'https://itaybrands.co.il/collections/%D7%97%D7%A6%D7%90%D7%99%D7%95%D7%AA'
  },
  {
    id: 'jackets-coats',
    name: Category.JACKETS_COATS,
    gender: 'Women',
    url: 'https://itaybrands.co.il/collections/%D7%92%D7%A7%D7%98%D7%99%D7%9D'
  }
  // Add more categories as needed
];

const BASE_URL = 'https://itaybrands.co.il';

class ItayBrandsScraper extends BaseScraper {
  protected readonly scraperName = 'ItayBrands';
  protected readonly source = 'ItayBrands';

  protected getCategories(): CategoryType[] {
    return CATEGORIES;
  }

  protected async scrapeCategory(category: CategoryType): Promise<Product[]> {
    return this.scrapeItayBrandsCategory(category);
  }

  // private async fetchItayBrandsPage(url: string): Promise<string> {
  //   const { data } = await axios.get(url, {
  //     headers: {
  //       'accept': 'text/html,application/xhtml+xml,application/xml',
  //       'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
  //     },
  //   });
  //   return data;
  // }

  private async fetchItayBrandsPage(url: string): Promise<string> {
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36');
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    const html = await page.content();
    await browser.close();
    return html;
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

  /**
   * Extracts Spurit.Preorder2.snippet.products from the HTML and returns a map of variantId -> compare_at_price (in ILS)
   */
  private extractSpuritCompareAtPrices(html: string): Record<string, number> {
    // Look for all occurrences of Spurit.Preorder2.snippet.products['handle'] = {...};
    const regex = /Spurit\.Preorder2\.snippet\.products\['[^']+'\] = (\{[\s\S]*?\});/g;
    let match;
    const variantIdToCompareAt: Record<string, number> = {};
    while ((match = regex.exec(html)) !== null) {
      try {
        // Parse the JS object (not strict JSON)
        const objStr = match[1]
          .replace(/([,{])([a-zA-Z0-9_]+):/g, '$1"$2":') // quote keys
          .replace(/'/g, '"'); // single to double quotes
        const productObj = JSON.parse(objStr);
        if (Array.isArray(productObj.variants)) {
          for (const v of productObj.variants) {
            if (v.id && typeof v.compare_at_price === 'number') {
              variantIdToCompareAt[v.id] = v.compare_at_price / 100; // convert to ILS
            }
          }
        }
      } catch (e) {
        // Ignore parse errors
      }
    }
    return variantIdToCompareAt;
  }

  private parseItayBrandsVariant(variant: any, category: CategoryType, compareAtMap: Record<string, number>): Product {
    // variant: { price: { amount, currencyCode }, product: { title, vendor, ... }, ... }
    const title = variant.product?.title || '';
    const url = variant.product?.url ? `${BASE_URL}/${variant.product.url}` : '';
    if (!url){
      console.error("url not found", variant);
    }
    const images = [`http:${variant.image.src}`];
    const colors = variant.title.split(' / ').length > 1 ? extractColorsWithHebrew(title, [variant.title.split(' / ')[1]], 'itaybrands_scraper') : [];
    const price = typeof variant.price?.amount === 'number' ? variant.price.amount : null;
    // Use compare_at_price from Spurit if available
    let oldPrice = null;
    if (variant.id && compareAtMap[variant.id]) {
      oldPrice = compareAtMap[variant.id];
    }
    const salePercent = calcSalePercent(price, oldPrice) ?? 0;
    const currency = variant.price?.currencyCode || 'ILS';
    const brand = normalizeBrandName(variant.product?.vendor || 'Itay Brands');
    const categories = [...extractCategory(category.name), ...extractCategory(variant.product?.type)].filter(Boolean);
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
    // console.log(product);
    return this.createProduct(product);
  }

  private async scrapeItayBrandsCategory(category: CategoryType): Promise<Product[]> {
    let page = 1;
    let allProducts: Product[] = [];
    let hasMore = true;
    while (hasMore) {
      const url = `${category.url}${page > 1 ? `?page=${page}` : ''}`;
      this.logProgress(`Fetching ${url}`);
      const html = await this.fetchItayBrandsPage(url);
      const variants = this.extractLastProductVariants(html);
      const compareAtMap = this.extractSpuritCompareAtPrices(html);
      this.logProgress(`extractLastProductVariants found: ${variants.length} variants`);
      if (!variants.length) break;
      allProducts.push(...variants.map((variant: any) => this.parseItayBrandsVariant(variant, category, compareAtMap)));
      // If less than 20 variants, it's the last page
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