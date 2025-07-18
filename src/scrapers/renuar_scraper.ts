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
    url: 'https://www.renuar.co.il/men/clothes/jeans/?page=men',
  },
  {
    id: 'men-sale',
    name: 'Sale',
    gender: 'Men',
    url: 'https://www.renuar.co.il/men/midseasonsale/?page=men'
  },
  {
    id: 'men-shoes',
    name: Category.SHOES,
    gender: 'Men',
    url: 'https://www.renuar.co.il/men/shoes/?page=men'
  },
  {
    id: 'men-tshirts',
    name: Category.T_SHIRTS,
    gender: 'Men',
    url: 'https://www.renuar.co.il/men/clothes/t-shirts/?page=men',
  },
  {
    id: 'men-tshirts',
    name: Category.T_SHIRTS,
    gender: 'Men',
    url: 'https://www.renuar.co.il/men/clothes/shirts/?page=men',
  },
  {
    id: 'men-button-down-shirts',
    name: Category.SHIRTS,
    gender: 'Men',
    url: 'https://www.renuar.co.il/men/clothes/button_down_shirts/?page=men',
  },
  {
    id: 'men-polo-shirts',
    name: Category.POLO_SHIRTS,
    gender: 'Men',
    url: 'https://www.renuar.co.il/men/clothes/polo_shirts/?page=men',
  },
  {
    id: 'men-new',
    name: 'New',
    gender: 'Men',
    url: 'https://www.renuar.co.il/men/new/?page=men',
  },
  {
    id: 'men-accessories',
    name: Category.ACCESSORIES,
    gender: 'Men',
    url: 'https://www.renuar.co.il/men/accessories/?page=men',
  },
  {
    id: 'men-lingerie',
    name: Category.LINGERIE,
    gender: 'Men',
    url: 'https://www.renuar.co.il/men/lingerie/?page=men',
  },
  {
    id: 'men-swimming-suits',
    name: Category.SWIMWEAR,
    gender: 'Men',
    url: 'https://www.renuar.co.il/men/clothes/swimming_suits/?page=men',
  },
  {
    id: 'men-pants',
    name: Category.PANTS,
    gender: 'Men',
    url: 'https://www.renuar.co.il/men/clothes/pants/?page=men',
  },
  {
    id: 'women-new',
    name: 'New',
    gender: 'Women',
    url: 'https://www.renuar.co.il/women/new/?page=women',
  },
  {
    id: 'women-midseasonsale',
    name: 'Sale',
    gender: 'Women',
    url: 'https://www.renuar.co.il/women/midseasonsale/?page=women',
  },
  {
    id: 'women-jeans',
    name: Category.JEANS,
    gender: 'Women',
    url: 'https://www.renuar.co.il/women/clothing/jeans/?page=women',
  },
  {
    id: 'women-tshirts',
    name: Category.T_SHIRTS,
    gender: 'Women',
    url: 'https://www.renuar.co.il/%D7%A0%D7%A9%D7%99%D7%9D/%D7%91%D7%92%D7%93%D7%99%D7%9D/%D7%97%D7%95%D7%9C%D7%A6%D7%95%D7%AA/?page=women',
  },
  {
    id: 'women-shoes',
    name: Category.SHOES,
    gender: 'Women',
    url: 'https://www.renuar.co.il/women/shoes/?page=women',
  },
  {
    id: 'women-accessories',
    name: Category.ACCESSORIES,
    gender: 'Women',
    url: 'https://www.renuar.co.il/women/accessories/?page=women',
  },
  {
    id: 'women-lingerie',
    name: Category.LINGERIE,
    gender: 'Women',
    url: 'https://www.renuar.co.il/%D7%A0%D7%A9%D7%99%D7%9D/%D7%94%D7%9C%D7%91%D7%A9%D7%94-%D7%AA%D7%97%D7%AA%D7%95%D7%A0%D7%94/?page=women',
  },
  {
    id: 'women-dresses',
    name: Category.DRESSES,
    gender: 'Women',
    url: 'https://www.renuar.co.il/women/clothing/dresses/?page=women',
  },
  {
    id: 'women-skirts',
    name: Category.SKIRTS,
    gender: 'Women',
    url: 'https://www.renuar.co.il/women/clothing/skirts/?page=women',
  },
  {
    id: 'women-swimwear',
    name: Category.SWIMWEAR,
    gender: 'Women',
    url: 'https://www.renuar.co.il/women/clothing/swimwear/?page=women',
  },
  {
    id: 'women-jackets',
    name: Category.JACKETS_COATS,
    gender: 'Women',
    url: 'https://www.renuar.co.il/women/clothing/jackets-women/?page=women',
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
    let fetchUrl = url;
    // Add sz=1000 if not present
    if (!fetchUrl.includes('sz=')) {
      fetchUrl += (fetchUrl.includes('?') ? '&' : '?') + 'sz=1000';
    }
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-geolocation',
        '--disable-notifications',
        '--disable-popup-blocking',
        '--disable-infobars',
        '--disable-features=Geolocation,Notifications'
      ]
    });
    const page = await browser.newPage();

    // Block geolocation and notifications
    await page.evaluateOnNewDocument(() => {
        // Block geolocation
        navigator.geolocation.getCurrentPosition = function() {
          throw new Error('Geolocation is disabled');
        };
        navigator.geolocation.watchPosition = function() {
          throw new Error('Geolocation is disabled');
        };
        // Block notifications
        // @ts-ignore
        window.Notification = { permission: 'denied' };
      });

    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36'
    );
    await page.goto(fetchUrl, { waitUntil: 'networkidle2', timeout: 60000 });
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
      // Color extraction: extract from data-display-value on .producttitle-swatch
      const colorNames = elem.find('.swatch-circle').map((_, c) => $(c).attr('alt')).get().filter(Boolean);
    //   console.log(url, colorNames);
      const colors = extractColorsWithHebrew(title, colorNames, 'renuar_scraper');
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