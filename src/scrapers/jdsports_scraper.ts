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
    id: 'men-clothing-shirts',
    name: Category.SHIRTS,
    gender: 'Men',
    url: 'https://www.jdsports.co.il/collections/men-clothing-shirts',
  },
  {
    id: 'men-clothing-vests',
    name: Category.TANKS,
    gender: 'Men',
    url: 'https://www.jdsports.co.il/collections/men-clothing-vests',
  },
  {
    id: 'men-sale',
    name: 'Sale',
    gender: 'Men',
    url: 'https://www.jdsports.co.il/collections/sale-men',
  },
  {
    id: 'men-shoes-sneakers',
    name: Category.SNICKERS,
    gender: 'Men',
    url: 'https://www.jdsports.co.il/collections/men-shoes-sneakers',
  },
  {
    id: 'men-accessories',
    name: Category.ACCESSORIES,
    gender: 'Men',
    url: 'https://www.jdsports.co.il/collections/men-accessories',
  },
  {
    id: 'men-clothing-swimwear',
    name: Category.SWIMWEAR,
    gender: 'Men',
    url: 'https://www.jdsports.co.il/collections/men-clothing-swimwear',
  },
  {
    id: 'men-clothing-shorts',
    name: Category.SHORTS,
    gender: 'Men',
    url: 'https://www.jdsports.co.il/collections/men-clothing-shorts',
  },
  {
    id: 'women-clothing-shirts',
    name: Category.T_SHIRTS,
    gender: 'Women',
    url: 'https://www.jdsports.co.il/collections/women-clothing-shirts',
  },
  {
    id: 'women-clothing-sweatshirts-knits',
    name: Category.SWEATERS,
    gender: 'Women',
    url: 'https://www.jdsports.co.il/collections/women-clothing-sweatshirts-knits',
  },
  {
    id: 'women-clothing-coats-jackets',
    name: Category.JACKETS_COATS,
    gender: 'Women',
    url: 'https://www.jdsports.co.il/collections/women-clothing-coats-jackets',
  },
  {
    id: 'women-accessories',
    name: Category.ACCESSORIES,
    gender: 'Women',
    url: 'https://www.jdsports.co.il/collections/women-accessories',
  },
  {
    id: 'women-shoes-sneakers',
    name: Category.SNICKERS,
    gender: 'Women',
    url: 'https://www.jdsports.co.il/collections/women-shoes-sneakers',
  },
];

const BASE_URL = 'https://www.jdsports.co.il';

class JDSportsScraper extends BaseScraper {
  protected readonly scraperName = 'JDSports';
  protected readonly source = 'JDSports';

  protected getCategories(): CategoryType[] {
    return CATEGORIES;
  }

  protected async scrapeCategory(category: CategoryType): Promise<Product[]> {
    let page = 1;
    let allProducts: Product[] = [];
    let hasMore = true;
    const MAX_PAGES = 100;
    while (hasMore && page <= MAX_PAGES) {
      let url = category.url;
      if (page > 1) {
        url += url.includes('?') ? `&page=${page}` : `?page=${page}`;
      }
      this.logProgress(`Fetching ${url}`);
      const html = await this.fetchJDSportsPage(url);
      const products = this.parseJDSportsProducts(html, category);
      this.logProgress(`Found ${products.length} products in ${category.name} (page ${page})`);
      if (!products.length) break;
      allProducts.push(...products);
      hasMore = products.length > 0;
      page++;
      if (hasMore){
        await new Promise(res => setTimeout(res, 5000)); // Wait 5 seconds
      }
    }
    return allProducts;
  }

  private async fetchJDSportsPage(url: string): Promise<string> {
    try {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.setUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36'
        );
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
        const html = await page.content();

        // if (html.includes("product-item")){
        //     console.log("all good");
        // } else {
        //     console.log("oops")
        // }
        await browser.close();
        return html;
    } catch {
        return "";
    }
  }

  private getPrice(elm, selector: string): number | undefined {
    const str = elm.find(selector).first();
    if (str && str.length){
        const match = str.text().trim().match(/[\d.]+/);
        return parseFloat(match[0]);
    }
  }

  private parseJDSportsProducts(html: string, category: CategoryType): Product[] {
    const $ = cheerio.load(html);
    const productCards = $('product-item.product-item');
    const products: Product[] = [];
    productCards.each((_, el) => {
      const elem = $(el);
      console.log(elem.html());
      const title = elem.find('.product-item-meta').find('h2').find('a').text();
      let image = elem.find(".product-item__primary-image").attr("src");
      image = image ? `http:${image}` : image;
      
      let oldPrice = this.getPrice(elem, '.price .price--compare');
      let price;
      if (oldPrice){
        price = this.getPrice(elem, '.price .price--highlight');
      } else {
        price = this.getPrice(elem, ".price-list .price");
        oldPrice = price;
      }

      const url = elem.find('a[href]').attr('href') ? BASE_URL + elem.find('a[href]').attr('href') : '';
      const brand = normalizeBrandName(elem.find(".product-item-meta__vendor").text());
      const colors = Array.from($(elem).find(".wd-product-item-swatch span[data-color]")).map((span) => $(span).attr("data-color"))
      const normalizedColors = extractColorsWithHebrew(title, colors, 'jdsports_scraper');
      const categories = [category.name];
      const gender = category.gender;
      const product = this.createProduct({
        title,
        url,
        images: [image].filter(Boolean),
        colors: normalizedColors,
        isSellingFast: false,
        price,
        oldPrice,
        salePercent: calcSalePercent(price, oldPrice) ?? 0,
        currency: 'ILS',
        brand,
        categories,
        gender,
      });
      console.log({
        product
      })
      products.push(product);
    });
    return products;
  }
}

// Main function
async function main() {
  const scraper = new JDSportsScraper();
  await scraper.run();
}

// CLI entry point
if (require.main === module) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

export { main, JDSportsScraper }; 