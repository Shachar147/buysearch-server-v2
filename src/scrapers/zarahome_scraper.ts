import puppeteer from 'puppeteer-extra';
import * as cheerio from 'cheerio';
import { BaseScraper } from './base/base-scraper';
import { Category as CategoryType } from './base/base-scraper';
import { Category } from '../category.constants';
import { Product, calcSalePercent, extractColorsWithHebrew } from './base/scraper_utils';
// @ts-ignore
import * as StealthPlugin from 'puppeteer-extra-plugin-stealth';
puppeteer.use((StealthPlugin as any)());

const BASE_URL = 'https://www.zarahome.com';

const CATEGORIES: CategoryType[] = [
  {
    id: 'furniture',
    name: Category.HOME,
    gender: 'Unisex',
    url: `${BASE_URL}/il/%D7%A8%D7%94%D7%99%D7%98%D7%99%D7%9D-n4104`,
  },
  // Add more categories as needed
];

export class ZaraHomeScraper extends BaseScraper {
  protected readonly scraperName = 'ZaraHome';
  protected readonly source = 'ZaraHome';

  protected getCategories(): CategoryType[] {
    return CATEGORIES;
  }

  private async fetchZaraHomePage(url: string): Promise<string> {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36');
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    // Wait for product items to appear in the DOM (up to 20 seconds)
    try {
      await page.waitForSelector('.product-item-container', { timeout: 20000 });
    } catch (e) {
      console.warn('Timeout waiting for .product-item-container');
    }
    const html = await page.content();
    await browser.close();
    return html;
  }

  private parseZaraHomeProduct(productElem: cheerio.Cheerio<any>, category: CategoryType, $: cheerio.CheerioAPI): Product | undefined {
    // Title
    const title = productElem.find('.product-info__product-name').text().trim();

    // URL
    let url = productElem.find('h2.product-info__product-name a').attr('href') || '';
    if (url && !url.startsWith('http')) url = BASE_URL + url;

    // Images
    let images: string[] = [];
    productElem.find('.product-item__image-container img').each((_, img) => {
      let src = $(img).attr('src');
      if (src && src.startsWith('//')) src = 'https:' + src;
      if (src && !src.startsWith('http')) src = BASE_URL + src;
      if (src && !images.includes(src)) images.push(src);
    });
    images = images.filter(Boolean);

    // Price and Old Price
    let price = null, oldPrice = null;
    const priceText = productElem.find('.price-single__current').first().text().replace(/[^ -9.]/g, '');
    if (priceText) price = parseFloat(priceText);
    const oldPriceText = productElem.find('.price-single__old').first().text().replace(/[^ -9.]/g, '');
    if (oldPriceText) oldPrice = parseFloat(oldPriceText);
    const salePercent = calcSalePercent(price, oldPrice) ?? 0;

    // Colors (fallback to title)
    const colors = extractColorsWithHebrew(title, [], 'zarahome_scraper');
    const currency = 'ILS';
    const brand = 'ZaraHome';
    const categories = [category.name];
    const gender = category.gender;
    
    console.log({
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
      });

    if (!title || !url || price == undefined) return undefined;

    return this.createProduct({
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
    });
  }

  protected async scrapeCategory(category: CategoryType): Promise<Product[]> {
    let page = 1;
    let allProducts: Product[] = [];
    let hasMore = true;
    const MAX_PAGES = 30;
    while (hasMore && page < MAX_PAGES) {
      const url = `${category.url}${page > 1 ? `?page=${page}` : ''}`;
      this.logProgress(`Fetching ${url}`);
      const html = await this.fetchZaraHomePage(url);
      const $ = cheerio.load(html);
      // Use .product-item-container as the product selector
      const productElems = $('.product-item-container');
      if (!productElems.length) {
        this.logProgress('No products found on page, stopping');
        break;
      }
      const pageProducts = productElems.map((_, el) => this.parseZaraHomeProduct($(el), category, $)).get().filter(Boolean) as Product[];
      this.logProgress(`Found ${pageProducts.length} products on page ${page}`);
      allProducts.push(...pageProducts);
      // If less than 16 products, it's the last page
      hasMore = false; //productElems.length >= 16;
      page++;
    }
    return allProducts;
  }
}

// Standalone runner
async function main() {
  const scraper = new ZaraHomeScraper();
  await scraper.run();
}

if (require.main === module) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
} 