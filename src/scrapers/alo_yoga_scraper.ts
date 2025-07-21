import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import { BaseScraper, Category as BaseCategory } from './base/base-scraper';
import { Product, extractColors, calcSalePercent, normalizeBrandName, prefixHttp } from './base/scraper_utils';
import { Category } from '../category.constants';

export class AloYogaScraper extends BaseScraper {
  protected readonly scraperName = 'Alo Yoga';
  protected readonly source = 'Alo Yoga';

  protected getCategories(): BaseCategory[] {
    return [
      {
        id: 'womens-leggings',
        name: Category.JOGGERS,
        gender: 'Women',
        url: 'https://www.aloyoga.com/he-il/collections/womens-leggings',
      },
    ];
  }

  private async fetchPage(url: string): Promise<string> {
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36'
    );
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
    });
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 20000 });
    const html = await page.content();
    await browser.close();
    return html;
  }

  protected async scrapeCategory(category: BaseCategory): Promise<Product[]> {
    const products: Product[] = [];
    try {
      const html = await this.fetchPage(category.url);
      const $ = cheerio.load(html);
      const productDivs = $('.PlpTile');
      if (productDivs.length === 0) {
        this.logWarning('No products found in DOM');
        return products;
      }
      productDivs.each((_, el) => {
        const elem = $(el);
        // Product URL
        const url = elem.find('.product-name a').attr('href') || elem.find('a').attr('href');
        // Title
        const title = elem.find('.product-name a p').text().trim() || elem.find('.product-name a').text().trim();
        // Images
        const images: string[] = [];
        const img = elem.find('.image-wrapper img').attr('src');
        if (img) images.push(img);
        // Colors
        const colors = elem.find('.swatches-wrapper button[title]').map((_, b) => $(b).attr('title')).get().filter(Boolean);
        // Price
        let price: number | null = null;
        let oldPrice: number | null = null;
        const priceText = elem.find('.card-price .product-price').text().replace(/[^\d.]/g, '');
        if (priceText) price = parseFloat(priceText);
        // TODO: Add oldPrice extraction if sale/old price structure is found
        const salePercent = calcSalePercent(price, oldPrice);
        const brand = 'Alo Yoga';
        const categories = [category.name];
        const gender = category.gender;
        if (title && url && price !== null) {
          products.push(
            this.createProduct({
              title,
              url,
              images,
              colors: extractColors(title, colors),
              price,
              oldPrice,
              salePercent,
              currency: 'ILS',
              brand,
              categories,
              gender,
            })
          );
        }
      });
    } catch (error) {
      this.logError('Failed to scrape Alo Yoga category', error);
    }
    return products;
  }
}

// Standalone runner
async function main() {
  const scraper = new AloYogaScraper();
  await scraper.run();
}

if (require.main === module) {
  main();
} 