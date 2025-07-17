import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import { BaseScraper } from './base/base-scraper';
import { Category as CategoryType } from './base/base-scraper';
import { Product, calcSalePercent, normalizeBrandName, extractColorsWithHebrew, normalizeCategories } from './base/scraper_utils';
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
  {
    id: 'mens-tshirts',
    name: Category.T_SHIRTS,
    gender: 'Men',
    url: 'https://www.nike.com/il/w/mens-tops-t-shirts-9om13znik1'
  },
  {
    id: 'mens-sale',
    name: 'Sale',
    gender: 'Men',
    url: 'https://www.nike.com/il/w/mens-sale-3yaepznik1'
  },
  {
    id: 'mens-shorts',
    name :Category.SHORTS,
    gender: 'Men',
    url: 'https://www.nike.com/il/w/mens-shorts-38fphznik1'
  },
  {
    id: 'mens-surf-swimwear',
    name: Category.SWIMWEAR,
    gender: 'Men',
    url: 'https://www.nike.com/il/w/mens-surf-swimwear-nik1zq3un',
  },
  {
    id: 'mens-hoodies-sweatshirts',
    name: Category.SWEATERS,
    gender: 'Men',
    url: 'https://www.nike.com/il/w/mens-hoodies-sweatshirts-6riveznik1',
  },
  {
    id: 'mens-football-shoes',
    name: Category.SOCCER_SHOES,
    gender: 'Men',
    url: 'https://www.nike.com/il/w/mens-football-shoes-1gdj0znik1zy7ok',
  },
  {
    id: 'mens-running-shoes',
    name: Category.RUNNING_SHOES,
    gender: 'Men',
    url: 'https://www.nike.com/il/w/mens-running-shoes-37v7jznik1zy7ok',
  },
  {
    id: 'mens-jackets-gilets',
    name: Category.JACKETS_COATS,
    gender: 'Men',
    url: 'https://www.nike.com/il/w/mens-jackets-gilets-50r7yznik1',
  },
  {
    id: 'mens-trousers-tights',
    name: Category.PANTS,
    gender: 'Men',
    url: 'https://www.nike.com/il/w/mens-trousers-tights-2kq19znik1',
  },
  {
    id: 'mens-accessories-equipment',
    name: Category.ACCESSORIES,
    gender: 'Men',
    url: 'https://www.nike.com/il/w/mens-accessories-equipment-awwpwznik1',
  },
  {
    id: 'womens-running-shoes',
    name: Category.RUNNING_SHOES,
    gender: 'Women',
    url: 'https://www.nike.com/il/w/womens-running-shoes-37v7jz5e1x6zy7ok',
  },
  {
    id: 'womens-football-shoes',
    name: Category.SOCCER_SHOES,
    gender: 'Women',
    url: 'https://www.nike.com/il/w/womens-football-shoes-1gdj0z5e1x6zy7ok',
  },
  {
    id: 'womens-tops-t-shirts',
    name: Category.T_SHIRTS,
    gender: 'Women',
    url: 'https://www.nike.com/il/w/womens-tops-t-shirts-5e1x6z9om13',
  },
  {
    id: 'womens-hoodies-sweatshirts',
    name: Category.SWEATERS,
    gender: 'Women',
    url: 'https://www.nike.com/il/w/womens-hoodies-sweatshirts-5e1x6z6rive',
  },
  {
    id: 'womens-shorts',
    name: Category.SHORTS,
    gender: 'Women',
    url: 'https://www.nike.com/il/w/womens-shorts-38fphz5e1x6',
  },
  {
    id: 'womens-tights-leggings',
    name: Category.TIGHTS,
    gender: 'Women',
    url: 'https://www.nike.com/il/w/womens-tights-leggings-29sh2z5e1x6',
  },
  {
    id: 'womens-trousers-tights',
    name: Category.PANTS,
    gender: 'Women',
    url: 'https://www.nike.com/il/w/womens-trousers-tights-2kq19z5e1x6',
  },
  {
    id: 'womens-jackets-gilets',
    name: Category.JACKETS_COATS,
    gender: 'Women',
    url: 'https://www.nike.com/il/w/womens-jackets-gilets-50r7yz5e1x6',
  },
  {
    id: 'womens-matching-sets',
    name: Category.SETS,
    gender: 'Women',
    url: 'https://www.nike.com/il/w/womens-matching-sets-2lukpz5e1x6',
  },
  {
    id: 'womens-basketball-shoes',
    name: Category.BASKETBALL_SHOES,
    gender: 'Women',
    url: 'https://www.nike.com/il/w/womens-basketball-shoes-3glsmz5e1x6zy7ok',
  },
  {
    id: 'womens-accessories-equipment',
    name: Category.ACCESSORIES,
    gender: 'Women',
    url: 'https://www.nike.com/il/w/womens-accessories-equipment-5e1x6zawwpw',
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
    // Only call fetchNikePage once, since all products are loaded via infinite scroll
    this.logProgress(`Fetching ${category.url}`);
    const html = await this.fetchNikePage(category.url);
    const products = this.parseNikeProducts(html, category);
    this.logProgress(`Found ${products.length} products in ${category.name}`);
    return products;
  }

  private async fetchNikePage(url: string): Promise<string> {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36'
    );
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    // Infinite scroll: keep scrolling and waiting for new products
    let previousCount = 0;
    let reachedEnd = false;
    let scrollIteration = 1;
    while (!reachedEnd) {
      const productsBefore = await page.$$eval('a.product-card__link-overlay', els => els.length);
      this.logProgress(`Scroll iteration ${scrollIteration}: ${productsBefore} products loaded. Scrolling to bottom...`);
      // await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
      // Set scroll position to be 800px above the bottom of the page
    //   await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
        await page.evaluate('window.scrollTo(0, document.body.scrollHeight - 1200)');
      this.logProgress(`Waiting 10 seconds for new items to load...`);
      await new Promise(res => setTimeout(res, 10000)); // Wait 10 seconds for new items to load
      const productsAfter = await page.$$eval('a.product-card__link-overlay', els => els.length);
      if (productsAfter > productsBefore) {
        this.logProgress(`New products loaded: ${productsAfter - productsBefore}. Total: ${productsAfter}`);
      } else {
        this.logProgress(`No new products loaded after scroll. Stopping infinite scroll.`);
        reachedEnd = true;
      }
      previousCount = productsAfter;
      scrollIteration++;
    }

    const totalProducts = await page.$$eval('a.product-card__link-overlay', els => els.length);
    this.logProgress(`Infinite scroll complete. Total products loaded: ${totalProducts}`);

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
      let colors = extractColorsWithHebrew(fullTitle, [color].filter(Boolean), 'nike_scraper').filter((c) => {
        // Use regex to match patterns like '1 Colour', '2 Colours', etc.
        return !/^\d+\s+Colours?$/i.test(c);
      });
      // If all colors were filtered out (i.e., only '1 Colour', '2 Colours', etc.), set to empty array
      if (colors.length === 0) {
        colors = [];
      }
      const brand = normalizeBrandName('Nike');
      const categories = [category.name];
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