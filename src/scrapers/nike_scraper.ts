import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import { BaseScraper } from './base/base-scraper';
import { Category as CategoryType } from './base/base-scraper';
import { Product, calcSalePercent, normalizeBrandName, extractColorsWithHebrew } from './base/scraper_utils';
import * as dotenv from 'dotenv';
import { Category } from '../category.constants';
dotenv.config();

const CATEGORIES: CategoryType[] = [
  {
    id: 'mens-basketball-shoes',
    name: Category.SHOES,
    gender: 'Men',
    url: 'https://www.nike.com/il/w/mens-basketball-shoes-3glsmznik1zy7ok',
  },
];

const BASE_URL = 'https://www.nike.com';

class NikeScraper extends BaseScraper {
  protected readonly scraperName = 'Nike';
  protected readonly source = 'Nike';

  protected getCategories(): CategoryType[] {
    return CATEGORIES;
  }

  protected async scrapeCategory(category: CategoryType): Promise<Product[]> {
    return this.scrapeNikeCategory(category);
  }

  private async fetchNikePage(url: string): Promise<string> {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36'
    );
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    // Scroll to load all products (Nike uses infinite scroll)
    let previousHeight = 0;
    let reachedEnd = false;
    while (!reachedEnd) {
      const productsBefore = await page.$$eval('a.product-card__link-overlay', els => els.length);
      await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
      await new Promise(res => setTimeout(res, 1500));
      const productsAfter = await page.$$eval('a.product-card__link-overlay', els => els.length);
      if (productsAfter === productsBefore) reachedEnd = true;
    }

    const html = await page.content();
    await browser.close();
    return html;
  }

  private parseNikeProducts(html: string, category: CategoryType): Product[] {
    const $ = cheerio.load(html);
    const productCards = $('div.product-card');
    const products: Product[] = [];
    productCards.each((_, el) => {
      const elem = $(el);
      const title = elem.find('div.product-card__title').text().trim();
      const subtitle = elem.find('div.product-card__subtitle').text().trim();
      const fullTitle = subtitle ? `${title} ${subtitle}` : title;
      const url = elem.find('a.product-card__link-overlay').attr('href')
        ? elem.find('a.product-card__link-overlay').attr('href')
        : '';
      const image = (elem.find('img.product-card__hero-image').attr('src') || '').split(',').join('%2C');
      let price = null, oldPrice = null;
      const priceText = elem.find('div.product-price').text();
      // Nike sometimes shows both sale and original price
      const priceMatches = priceText.match(/₪([\d,.]+)/g);
      if (priceMatches) {
        if (priceMatches.length === 2) {
          oldPrice = parseFloat(priceMatches[0].replace(/[₪,]/g, ''));
          price = parseFloat(priceMatches[1].replace(/[₪,]/g, ''));
        } else {
          price = parseFloat(priceMatches[0].replace(/[₪,]/g, ''));
        }
      }
      const color = elem.find('div.product-card__product-count').text().trim();
      const colors = extractColorsWithHebrew(fullTitle, [color].filter(Boolean), 'nike_scraper');
      const brand = normalizeBrandName('Nike');
      const categories = [category.name, 'Basketball Shoes'];
      const gender = category.gender;
      const product = this.createProduct({
        title: fullTitle,
        url,
        images: [image].filter(Boolean),
        colors,
        isSellingFast: false,
        price,
        oldPrice,
        salePercent: calcSalePercent(price, oldPrice) ?? 0,
        currency: 'ILS',
        brand,
        categories,
        gender,
      });
      products.push(product);
    });
    return products;
  }

  private async scrapeNikeCategory(category: CategoryType): Promise<Product[]> {
    let pageNum = 1;
    let allProducts: Product[] = [];
    let hasMore = true;
    while (hasMore) {
      const url = `${category.url}${pageNum > 1 ? `?p=${pageNum}` : ''}`;
      this.logProgress(`Fetching ${url}`);
      const html = await this.fetchNikePage(url);
      const products = this.parseNikeProducts(html, category);
      this.logProgress(`Found ${products.length} products in ${category.name} (page ${pageNum})`);
      allProducts.push(...products);
      hasMore = products.length >= 48;
      pageNum++;
    }
    return allProducts;
  }
}

// Main function
async function main() {
  const scraper = new NikeScraper();
  await scraper.run();
}

// CLI entry point
if (require.main === module) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

export { main, NikeScraper }; 