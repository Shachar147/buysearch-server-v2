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
    id: 'men-shirts',
    name: Category.SHIRTS,
    gender: 'Men',
    url: 'https://www.castro.com/%D7%92%D7%91%D7%A8%D7%99%D7%9D/%D7%97%D7%95%D7%9C%D7%A6%D7%95%D7%AA',
  },
];

const BASE_URL = 'https://www.castro.com';

class CastroScraper extends BaseScraper {
  protected readonly scraperName = 'Castro';
  protected readonly source = 'Castro';

  protected getCategories(): CategoryType[] {
    return CATEGORIES;
  }

  protected async scrapeCategory(category: CategoryType): Promise<Product[]> {
    let page = 1;
    let allProducts: Product[] = [];
    let hasMore = true;
    const MAX_PAGES = 2;
    while (hasMore && page <= MAX_PAGES) {
      let url = category.url;
      if (page > 1) {
        url += url.includes('?') ? `&p=${page}` : `?p=${page}`;
      }
      this.logProgress(`Fetching ${url}`);
      const html = await this.fetchCastroPage(url);
      const products = await this.parseCastroProducts(html, category);
      this.logProgress(`Found ${products.length} products in ${category.name} (page ${page})`);
      if (!products.length) break;
      allProducts.push(...products);
      hasMore = products.length > 0;
      page++;
      if (hasMore) {
        // await new Promise(res => setTimeout(res, 2000)); // Wait 2 seconds
      }
    }
    return allProducts;
  }

  private async fetchCastroPage(url: string): Promise<string> {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36'
    );
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    const html = await page.content();
    await browser.close();
    return html;
  }

  private async parseCastroProducts(html: string, category: CategoryType): Promise<Product[]> {
    const $ = cheerio.load(html);
    const productCards = $('.product-tile, .product, .product-item');
    const products: Product[] = [];
    const productInfos = productCards.map((_, el) => {
      const elem = $(el);
      let title = elem.find('h3, h2, .product-title').first().text().trim();
      if (!title) title = elem.find('a').attr('title') || '';
      let url = elem.find('a').attr('href') || '';
      if (url && !url.startsWith('http')) url = BASE_URL + url;
      let image = elem.find('img').attr('data-src') || elem.find('img').attr('src') || '';
      if (image && image.startsWith('//')) image = 'https:' + image;
      return { title, url, image };
    }).get();

    // Limit concurrency to 5
    const concurrency = 5;
    let idx = 0;
    async function fetchDetail(info: any) {
      try {
        const detailHtml = await (await fetch(info.url)).text();
        const $$ = cheerio.load(detailHtml);
        // Price extraction from detail page
        let price = null, oldPrice = null, salePercent = null;
        // Only use price from data-price-type="finalPrice"
        const priceStr = $$('.price-wrapper[data-price-type="finalPrice"] .price').first().text().replace(/[₪,]/g, '').trim();
        if (priceStr) {
          price = parseFloat(priceStr);
        }
        // Only use oldPrice from data-price-type="oldPrice"
        const oldPriceStr = $$('.price-wrapper[data-price-type="oldPrice"] .price').first().text().replace(/[₪,]/g, '').trim();
        if (oldPriceStr) {
          const parsedOld = parseFloat(oldPriceStr);
          if (!isNaN(parsedOld) && parsedOld > (price ?? 0)) {
            oldPrice = parsedOld;
          }
        }
        if (oldPrice && price && oldPrice > price) {
          salePercent = calcSalePercent(price, oldPrice) ?? 0;
        }
        const brand = normalizeBrandName('Castro');
        const colors = extractColorsWithHebrew(info.title, [], 'castro_scraper');
        const categories = [category.name];
        const gender = category.gender;
        return this.createProduct({
          title: info.title,
          url: info.url,
          images: [info.image].filter(Boolean),
          colors,
          isSellingFast: false,
          price,
          oldPrice,
          salePercent,
          currency: 'ILS',
          brand,
          categories,
          gender,
        });
      } catch (e) {
        return null;
      }
    }
    const results: Product[] = [];
    while (idx < productInfos.length) {
      const chunk = productInfos.slice(idx, idx + concurrency);
      const chunkResults = await Promise.all(chunk.map(info => fetchDetail.call(this, info)));
      results.push(...chunkResults.filter(Boolean));
      idx += concurrency;
    }
    return results;
  }
}

// Main function
async function main() {
  const scraper = new CastroScraper();
  await scraper.run();
}

// CLI entry point
if (require.main === module) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

export { main, CastroScraper }; 