// story_scraper.ts – v1
// =============================================================
// Features:
// - Extends BaseScraper for common functionality
// - Scans categories (configurable)
// - Extracts product info (title, url, images, price, brand, categories, gender, source)
// - Uses HTML parsing (cheerio) to extract data
// - Saves to PostgreSQL via ProductService
//
// Usage: npm run scrape:story

import axios from 'axios';
import * as cheerio from 'cheerio';
import { BaseScraper, Category } from './base-scraper';
import { Product, calcSalePercent, normalizeBrandName, extractColorsWithHebrew } from './scraper_utils';
import * as dotenv from 'dotenv';
dotenv.config();

const CATEGORIES: Category[] = [
  {
    id: 'mens-tshirts',
    name: 'T-Shirts & Vests',
    gender: 'Men',
    url: 'https://storyonline.co.il/collections/%D7%92%D7%91%D7%A8%D7%99%D7%9D-%D7%91%D7%99%D7%92%D7%95%D7%93-%D7%98%D7%99-%D7%A9%D7%99%D7%A8%D7%98%D7%99%D7%9D',
  },
  {
    id: 'mens-shirts',
    name: 'Shirts',
    gender: 'Men',
    url: "https://storyonline.co.il/collections/%D7%92%D7%91%D7%A8%D7%99%D7%9D-%D7%91%D7%99%D7%92%D7%95%D7%93-%D7%97%D7%95%D7%9C%D7%A6%D7%95%D7%AA-1"
  }
  // Add more categories as needed
];

const BASE_URL = 'https://storyonline.co.il';

class StoryScraper extends BaseScraper {
  protected readonly scraperName = 'Story';
  protected readonly source = 'Story';

  protected getCategories(): Category[] {
    return CATEGORIES;
  }

  protected async scrapeCategory(category: Category): Promise<Product[]> {
    return this.scrapeStoryCategory(category);
  }

  private async fetchStoryPage(url: string): Promise<string> {
    const { data } = await axios.get(url, {
      headers: {
        'accept': 'text/html,application/xhtml+xml,application/xml',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
      },
    });
    return data;
  }

  private parseStoryProduct(productElem: cheerio.Cheerio<any>, category: Category, $: cheerio.CheerioAPI): Product | undefined {
    // Extract product info from the product element
    const title = productElem.find('.product-title, .card__heading').text().trim();
    const url = BASE_URL + (productElem.find('a').attr('href') || '');
    const images = [productElem.find('img').attr('src') || ''].filter(Boolean);
    const priceText = productElem.find('.price-item--regular, .price__regular').first().text().replace(/[^\d.]/g, '');
    const price = priceText ? parseFloat(priceText) : null;
    const oldPriceText = productElem.find('.price-item--sale, .price__sale').first().text().replace(/[^\d.]/g, '');
    const oldPrice = oldPriceText ? parseFloat(oldPriceText) : null;
    const salePercent = calcSalePercent(price, oldPrice) ?? 0;
    const currency = 'ILS';
    // Try to extract brand from .caption-with-letter-spacing or .caption-with-letter-spacing.light
    let brand = productElem.find('.caption-with-letter-spacing, .caption-with-letter-spacing.light').text().trim();
    if (!brand) {
      brand = productElem.find('.product-vendor, .card__vendor').text().trim();
    }
    brand = normalizeBrandName(brand || 'Story');
    const categories = [category.name];
    const gender = category.gender;
    if (!title || !url) return undefined;
    return this.createProduct({
      title,
      url,
      images,
      colors: extractColorsWithHebrew(title, [], 'story_scraper'),
      isSellingFast: false,
      price,
      oldPrice,
      salePercent,
      currency,
      brand,
      categories,
      gender,
    });
  }

  private async scrapeStoryCategory(category: Category): Promise<Product[]> {
    let page = 1;
    let allProducts: Product[] = [];
    let hasMore = true;
    while (hasMore) {
      const url = `${category.url}${page > 1 ? `?page=${page}` : ''}`;
      this.logProgress(`Fetching ${url}`);
      const html = await this.fetchStoryPage(url);
      const $ = cheerio.load(html);
      const productElems = $('.product-card, .card--product');
      if (!productElems.length) break;
      const pageProducts = productElems.map((_, el) => this.parseStoryProduct($(el), category, $)).get().filter(Boolean) as Product[];
      allProducts.push(...pageProducts);
      // If less than 24 products, it's the last page
      hasMore = productElems.length >= 24;
      page++;
    }
    return allProducts;
  }
}

// Main function
async function main() {
  const scraper = new StoryScraper();
  await scraper.run();
}

// CLI entry point
if (require.main === module) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

export { main, StoryScraper }; 