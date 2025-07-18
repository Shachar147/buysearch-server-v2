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
    id: 'men-tshirts',
    name: Category.T_SHIRTS,
    gender: 'Men',
    url: 'https://www.castro.com/גברים/חולצות',
  },
  {
    id: 'men-swimwear',
    name: Category.SWIMWEAR,
    gender: 'Men',
    url: 'https://www.castro.com/גברים/בגד-ים',
  },
  {
    id: 'men-jeans',
    name: Category.JEANS,
    gender: 'Men',
    url: 'https://www.castro.com/גברים/גינס',
  },
  {
    id: 'men-pants',
    name: Category.PANTS,
    gender: 'Men',
    url: 'https://www.castro.com/גברים/מכנסיים',
  },
  {
    id: 'men-accessories',
    name: Category.ACCESSORIES,
    gender: 'Men',
    url: 'https://www.castro.com/%D7%92%D7%91%D7%A8%D7%99%D7%9D/%D7%AA%D7%97%D7%AA%D7%95%D7%A0%D7%99%D7%9D-%D7%92%D7%A8%D7%91%D7%99%D7%99%D7%9D',
  },
  {
    id: 'men-accessories',
    name: Category.ACCESSORIES,
    gender: 'Men',
    url: 'https://www.castro.com/%D7%92%D7%91%D7%A8%D7%99%D7%9D/%D7%90%D7%A7%D7%A1%D7%A1%D7%95%D7%A8%D7%99%D7%96',
  },
  {
    id: 'men-shoes',
    name: Category.SHOES,
    gender: 'Men',
    url: 'https://www.castro.com/%D7%92%D7%91%D7%A8%D7%99%D7%9D/%D7%A0%D7%A2%D7%9C%D7%99%D7%99%D7%9D',
  },
  {
    id: 'men-accessories',
    name: Category.SWEATERS,
    gender: 'Men',
    url: 'https://www.castro.com/%D7%92%D7%91%D7%A8%D7%99%D7%9D/%D7%A1%D7%A8%D7%99%D7%92%D7%99%D7%9D-%D7%95%D7%A4%D7%95%D7%98%D7%A8%D7%99%D7%9D',
  },
  {
    id: 'men-jackets-coats',
    name: Category.JACKETS_COATS,
    gender: 'Men',
    url: 'https://www.castro.com/%D7%92%D7%91%D7%A8%D7%99%D7%9D/%D7%9E%D7%A2%D7%99%D7%9C%D7%99%D7%9D-%D7%95%D7%92%D7%A7%D7%98%D7%99%D7%9D'
  },
  // Women
  {
    id: 'women-swim',
    name: Category.SWIMWEAR,
    gender: 'Women',
    url: 'https://www.castro.com/%D7%A0%D7%A9%D7%99%D7%9D/%D7%91%D7%92%D7%93-%D7%99%D7%9D',
  },
  {
    id: 'women-t-shirts',
    name: Category.T_SHIRTS,
    gender: 'Women',
    url: 'https://www.castro.com/%D7%A0%D7%A9%D7%99%D7%9D/%D7%97%D7%95%D7%9C%D7%A6%D7%95%D7%AA',
  },
  {
    id: 'women-dress',
    name: Category.DRESSES_OVERALLS,
    gender: 'Women',
    url: 'https://www.castro.com/%D7%A0%D7%A9%D7%99%D7%9D/%D7%A9%D7%9E%D7%9C%D7%95%D7%AA',
  },
  {
    id: 'women-skirts',
    name: Category.SKIRTS,
    gender: 'Women',
    url: 'https://www.castro.com/%D7%A0%D7%A9%D7%99%D7%9D/%D7%97%D7%A6%D7%90%D7%99%D7%95%D7%AA',
  },
  {
    id: 'women-jeans',
    name: Category.JEANS,
    gender: 'Women',
    url: 'https://www.castro.com/%D7%A0%D7%A9%D7%99%D7%9D/%D7%92%D7%99%D7%A0%D7%A1',
  },
  {
    id: 'women-shoes',
    name: Category.SHOES,
    gender: 'Women',
    url: 'https://www.castro.com/%D7%A0%D7%A9%D7%99%D7%9D/%D7%A0%D7%A2%D7%9C%D7%99%D7%99%D7%9D',
  },
  {
    id: 'women-accessories',
    name: Category.ACCESSORIES,
    gender: 'Women',
    url: 'https://www.castro.com/%D7%A0%D7%A9%D7%99%D7%9D/%D7%90%D7%A7%D7%A1%D7%A1%D7%95%D7%A8%D7%99%D7%96',
  },
  {
    id: 'women-sweaters',
    name: Category.SWEATERS,
    gender: 'Women',
    url: 'https://www.castro.com/%D7%A0%D7%A9%D7%99%D7%9D/%D7%A1%D7%A8%D7%99%D7%92%D7%99%D7%9D-%D7%95%D7%A4%D7%95%D7%98%D7%A8%D7%99%D7%9D',
  },
  {
    id: 'women-jackets',
    name: Category.JACKETS_COATS,
    gender: 'Women',
    url: 'https://www.castro.com/%D7%A0%D7%A9%D7%99%D7%9D/%D7%9E%D7%A2%D7%99%D7%9C%D7%99%D7%9D-%D7%92%D7%A7%D7%98%D7%99%D7%9D',
  },
  {
    id: 'women-lingerie',
    name: Category.LINGERIE,
    gender: 'Women',
    url: 'https://www.castro.com/%D7%A0%D7%A9%D7%99%D7%9D/%D7%94%D7%9C%D7%91%D7%A9%D7%94-%D7%AA%D7%97%D7%AA%D7%95%D7%A0%D7%94',
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
    const MAX_PAGES = 20;
    while (hasMore && page <= MAX_PAGES) {
      let url = category.url;
      if (page > 1) {
        url += url.includes('?') ? `&p=${page}` : `?p=${page}`;
      }
      this.logProgress(`Fetching ${url}`);
      const html = await this.fetchCastroPage(url);
      const products = (await this.parseCastroProducts(html, category)).filter(Boolean);
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

    // await new Promise(res => setTimeout(res, 200000)); // Wait 2 seconds

    await browser.close();
    return html;
  }

  private async parseCastroProducts(html: string, category: CategoryType): Promise<Product[]> {
    const $ = cheerio.load(html);
    const productCards = $('.product-tile, .product, .product-item');

    // Extract all product info from the listing page DOM
    const productInfos = productCards.map((_, el) => {
      const elem = $(el);
      const title = elem.find('h3, h2, .product-title').first().text().trim() || elem.find('a').attr('title') || '';
      let url = elem.find('a').attr('href') || '';
      if (url && !url.startsWith('http')) url = BASE_URL + url;
      let image = elem.find('img').attr('data-src') || elem.find('img').attr('src') || '';
      if (image && image.startsWith('//')) image = 'https:' + image;
      // Price extraction
      const priceStr = elem.find('.price-wrapper[data-price-type="finalPrice"] .price').first().text().replace(/[₪,]/g, '').trim();
      const price = priceStr ? parseFloat(priceStr) : null;
      const oldPriceStr = elem.find('.price-wrapper[data-price-type="oldPrice"] .price').first().text().replace(/[₪,]/g, '').trim();
      const oldPrice = oldPriceStr ? parseFloat(oldPriceStr) : null;
      const salePercent = (oldPrice && price && oldPrice > price) ? calcSalePercent(price, oldPrice) : null;
      // Colors extraction (if present in listing)
      const colorNames = elem.find('.swatch-option.image .show-text').map((_, c) => $(c).text().trim()).get().filter(Boolean);
      return { title, url, image, price, oldPrice, salePercent, colorNames };
    }).get();

    // Build product objects directly from listing page info
    const products: Product[] = productInfos
      .filter(info => {
        // Skip if price is 0 and url is missing or empty
        if ((info.price === 0 || info.price === null) && (!info.url || info.url.trim() === '')) {
          return false;
        }
        return true;
      })
      .map(info => {
        const brand = normalizeBrandName('Castro');
        const colors = extractColorsWithHebrew(info.title, info.colorNames, 'castro_scraper');
        const categories = [category.name];
        const gender = category.gender;
        if (!info.title || !info.url || info.price == undefined) return undefined;
        return this.createProduct({
          title: info.title,
          url: info.url,
          images: [info.image].filter(Boolean),
          colors,
          isSellingFast: false,
          price: info.price,
          oldPrice: info.oldPrice,
          salePercent: info.salePercent,
          currency: 'ILS',
          brand,
          categories,
          gender,
        });
      });
    return products;
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