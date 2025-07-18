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
    id: 'men-jeans',
    name: Category.JEANS,
    gender: 'Men',
    url: 'https://www.renuar.co.il/men/clothes/jeans/?page=men&sz=1000',
  },
  {
    id: 'men-sale',
    name: 'Sale',
    gender: 'Men',
    url: 'https://www.renuar.co.il/men/midseasonsale/?page=men&sz=1000'
  },
  {
    id: 'men-shoes',
    name: Category.SHOES,
    gender: 'Men',
    url: 'https://www.renuar.co.il/men/shoes/?page=men&sz=1000'
  },
  {
    id: 'men-tshirts',
    name: Category.T_SHIRTS,
    gender: 'Men',
    url: 'https://www.renuar.co.il/men/clothes/t-shirts/?page=men&sz=1000',
  },
  {
    id: 'men-tshirts',
    name: Category.T_SHIRTS,
    gender: 'Men',
    url: 'https://www.renuar.co.il/men/clothes/shirts/?page=men&sz=1000',
  },
  {
    id: 'men-button-down-shirts',
    name: Category.SHIRTS,
    gender: 'Men',
    url: 'https://www.renuar.co.il/men/clothes/button_down_shirts/?page=men&sz=1000',
  },
  {
    id: 'men-polo-shirts',
    name: Category.POLO_SHIRTS,
    gender: 'Men',
    url: 'https://www.renuar.co.il/men/clothes/polo_shirts/?page=men&sz=1000',
  },
  {
    id: 'men-new',
    name: 'New',
    gender: 'Men',
    url: 'https://www.renuar.co.il/men/new/?page=men&sz=1000',
  },
  {
    id: 'men-accessories',
    name: Category.ACCESSORIES,
    gender: 'Men',
    url: 'https://www.renuar.co.il/men/accessories/?page=men&sz=1000',
  },
  {
    id: 'men-lingerie',
    name: Category.LINGERIE,
    gender: 'Men',
    url: 'https://www.renuar.co.il/men/lingerie/?page=men&sz=1000',
  },
  {
    id: 'men-swimming-suits',
    name: Category.SWIMWEAR,
    gender: 'Men',
    url: 'https://www.renuar.co.il/men/clothes/swimming_suits/?page=men&sz=1000',
  },
  {
    id: 'men-pants',
    name: Category.PANTS,
    gender: 'Men',
    url: 'https://www.renuar.co.il/men/clothes/pants/?page=men&sz=1000',
  },
  {
    id: 'women-new',
    name: 'New',
    gender: 'Women',
    url: 'https://www.renuar.co.il/women/new/?page=women&sz=1000',
  },
  {
    id: 'women-midseasonsale',
    name: 'Sale',
    gender: 'Women',
    url: 'https://www.renuar.co.il/women/midseasonsale/?page=women&sz=1000',
  },
  {
    id: 'women-jeans',
    name: Category.JEANS,
    gender: 'Women',
    url: 'https://www.renuar.co.il/women/clothing/jeans/?page=women&sz=1000',
  },
  {
    id: 'women-tshirts',
    name: Category.T_SHIRTS,
    gender: 'Women',
    url: 'https://www.renuar.co.il/%D7%A0%D7%A9%D7%99%D7%9D/%D7%91%D7%92%D7%93%D7%99%D7%9D/%D7%97%D7%95%D7%9C%D7%A6%D7%95%D7%AA/?page=women&sz=1000',
  },
  {
    id: 'women-shoes',
    name: Category.SHOES,
    gender: 'Women',
    url: 'https://www.renuar.co.il/women/shoes/?page=women&sz=1000',
  },
  {
    id: 'women-accessories',
    name: Category.ACCESSORIES,
    gender: 'Women',
    url: 'https://www.renuar.co.il/women/accessories/?page=women&sz=1000',
  },
  {
    id: 'women-lingerie',
    name: Category.LINGERIE,
    gender: 'Women',
    url: 'https://www.renuar.co.il/%D7%A0%D7%A9%D7%99%D7%9D/%D7%94%D7%9C%D7%91%D7%A9%D7%94-%D7%AA%D7%97%D7%AA%D7%95%D7%A0%D7%94/?page=women&sz=1000',
  },
  {
    id: 'women-dresses',
    name: Category.DRESSES,
    gender: 'Women',
    url: 'https://www.renuar.co.il/women/clothing/dresses/?page=women&sz=1000',
  },
  {
    id: 'women-skirts',
    name: Category.SKIRTS,
    gender: 'Women',
    url: 'https://www.renuar.co.il/women/clothing/skirts/?page=women&sz=1000',
  },
  {
    id: 'women-swimwear',
    name: Category.SWIMWEAR,
    gender: 'Women',
    url: 'https://www.renuar.co.il/women/clothing/swimwear/?page=women&sz=1000',
  },
  {
    id: 'women-jackets',
    name: Category.JACKETS_COATS,
    gender: 'Women',
    url: 'https://www.renuar.co.il/women/clothing/jackets-women/?page=women&sz=1000',
  },
];

const BASE_URL = 'https://www.renuar.co.il';

class RenuarScraper extends BaseScraper {
  protected readonly scraperName = 'Renuar';
  protected readonly source = 'Renuar';

  protected getCategories(): CategoryType[] {
    return CATEGORIES;
  }

  protected async scrapeCategory(category: CategoryType): Promise<Product[]> {
    this.logProgress(`Fetching ${category.url}`);
    const html = await this.fetchRenuarPage(category.url);
    const products = this.parseRenuarProducts(html, category);
    this.logProgress(`Found ${products.length} products in ${category.name}`);
    return products;
  }

  private async fetchRenuarPage(url: string): Promise<string> {
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

  private parseRenuarProducts(html: string, category: CategoryType): Product[] {
    const $ = cheerio.load(html);
    // Each product is likely in a .product-tile or similar class
    const productCards = $('.product-tile, .product, .product-item');
    const products: Product[] = [];
    productCards.each((_, el) => {
      const elem = $(el);
      // Title: try h3, h2, or .product-title
      let title = elem.find('h3, h2, .product-title').first().text().trim();
      if (!title) title = elem.find('a').attr('title') || '';
      // URL: first <a> with href
      let url = elem.find('a').attr('href') || '';
      if (url && !url.startsWith('http')) url = BASE_URL + url;
      // Image: first <img> src
      let image = elem.find('img.tile-image').attr('data-src') || elem.find('img.tile-image').attr('src') || '';
      if (image && image.startsWith('//')) image = 'https:' + image;
      // Price: look for sale and regular price
      let price = null, oldPrice = null, salePercent = null;
      // Try to find sale price and old price
      const priceText = elem.text();
      const priceMatches = priceText.match(/₪\s?(\d+[.,]?\d*)/g);
      if (priceMatches && priceMatches.length > 0) {
        price = parseFloat(priceMatches[0].replace(/[₪,]/g, ''));
        if (priceMatches.length > 1) {
          oldPrice = parseFloat(priceMatches[1].replace(/[₪,]/g, ''));
          salePercent = calcSalePercent(price, oldPrice) ?? 0;
        }
      }
      // Discount percent (if present)
      const percentMatch = priceText.match(/(\d+)%/);
      if (percentMatch && oldPrice && !salePercent) {
        salePercent = parseInt(percentMatch[1], 10);
        price = Math.round((oldPrice * (100 - salePercent)) / 100);
      }
      const brand = normalizeBrandName('Renuar');
      const colors = extractColorsWithHebrew(title, [], 'renuar_scraper');
      const categories = [category.name];
      const gender = category.gender;
      const product = this.createProduct({
        title,
        url,
        images: [image].filter(Boolean),
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
      products.push(product);
    });
    return products;
  }
}

// Main function
async function main() {
  const scraper = new RenuarScraper();
  await scraper.run();
}

// CLI entry point
if (require.main === module) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

export { main, RenuarScraper }; 