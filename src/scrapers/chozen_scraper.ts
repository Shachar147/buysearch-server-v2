// chozen_scraper.ts – v1
// =============================================================
// Features:
// - Extends BaseScraper for common functionality
// - Scans categories (configurable)
// - Extracts product info (title, url, images, price, brand, categories, gender, source)
// - Uses HTML parsing (cheerio) to extract data
// - Saves to PostgreSQL via ProductService
//
// Usage: npm run scrape:chozen

import * as cheerio from 'cheerio';
import { BaseScraper } from './base/base-scraper';
import { Category as CategoryType } from './base/base-scraper';
import { Product, calcSalePercent, normalizeBrandName, extractColorsWithHebrew } from './base/scraper_utils';
import * as dotenv from 'dotenv';
import { Category } from '../category.constants';
import puppeteer from 'puppeteer';
dotenv.config();

const MEN_FILTER = '?filter.p.m.custom.gender=%D7%92%D7%91%D7%A8%D7%99%D7%9D';
const WOMEN_FILTER = '?filter.p.m.custom.gender=%D7%A0%D7%A9%D7%99%D7%9D';

const CATEGORIES: CategoryType[] = [
  {
    id: 'tshirts-men',
    name: Category.T_SHIRTS,
    gender: 'Men',
    url: `https://chozen.co.il/collections/%D7%98%D7%99%D7%A9%D7%A8%D7%98%D7%99%D7%9D${MEN_FILTER}`,
  },
  {
    id: 'tshirts-women',
    name: Category.T_SHIRTS,
    gender: 'Women',
    url: `https://chozen.co.il/collections/%D7%98%D7%99%D7%A9%D7%A8%D7%98%D7%99%D7%9D${WOMEN_FILTER}`,
  },
  {
    id: 'shirts-men',
    name: Category.SHIRTS,
    gender: 'Men',
    url: `https://chozen.co.il/collections/%D7%9E%D7%9B%D7%95%D7%A4%D7%AA%D7%A8%D7%95%D7%AA${MEN_FILTER}`,
  },
  {
    id: 'shirts-women',
    name: Category.SHIRTS,
    gender: 'Women',
    url: `https://chozen.co.il/collections/%D7%9E%D7%9B%D7%95%D7%A4%D7%AA%D7%A8%D7%95%D7%AA${WOMEN_FILTER}`,
  },
  {
    id: 'sweaters-men',
    name: Category.SWEATERS,
    gender: 'Men',
    url: `https://chozen.co.il/collections/%D7%A1%D7%95%D7%95%D7%98%D7%A9%D7%99%D7%A8%D7%98%D7%99%D7%9D${MEN_FILTER}`,
  },
  {
    id: 'sweaters-women',
    name: Category.SWEATERS,
    gender: 'Women',
    url: `https://chozen.co.il/collections/%D7%A1%D7%95%D7%95%D7%98%D7%A9%D7%99%D7%A8%D7%98%D7%99%D7%9D${WOMEN_FILTER}`,
  },
  {
    id: 'jackets-coats-men',
    name: Category.JACKETS_COATS,
    gender: 'Men',
    url: `https://chozen.co.il/collections/%D7%92%D7%A7%D7%98%D7%99%D7%9D-%D7%95%D7%9E%D7%A2%D7%99%D7%9C%D7%99%D7%9D${MEN_FILTER}`,
  },
  {
    id: 'jackets-coats-women',
    name: Category.JACKETS_COATS,
    gender: 'Women',
    url: `https://chozen.co.il/collections/%D7%92%D7%A7%D7%98%D7%99%D7%9D-%D7%95%D7%9E%D7%A2%D7%99%D7%9C%D7%99%D7%9D${WOMEN_FILTER}`,
  },
  {
    id: 'dresses',
    name: Category.DRESSES,
    gender: 'Women',
    url: `https://chozen.co.il/collections/%D7%A9%D7%9E%D7%9C%D7%95%D7%AA${WOMEN_FILTER}`,
  },
  {
    id: 'skirts',
    name: Category.SKIRTS,
    gender: 'Women',
    url: `https://chozen.co.il/collections/%D7%97%D7%A6%D7%90%D7%99%D7%95%D7%AA${WOMEN_FILTER}`,
  },
  {
    id: 'accessories-men',
    name: Category.ACCESSORIES,
    gender: 'Men',
    url: `https://chozen.co.il/collections/%D7%90%D7%A7%D7%A1%D7%A1%D7%95%D7%A8%D7%99%D7%96${MEN_FILTER}`,
  },
  {
    id: 'accessories-women',
    name: Category.ACCESSORIES,
    gender: 'Women',
    url: `https://chozen.co.il/collections/%D7%90%D7%A7%D7%A1%D7%A1%D7%95%D7%A8%D7%99%D7%96${WOMEN_FILTER}`,
  },
  {
    id: 'jewelry-men',
    name: Category.JEWELRY,
    gender: 'Men',
    url: `https://chozen.co.il/collections/%D7%AA%D7%9B%D7%A9%D7%99%D7%98%D7%99%D7%9D${MEN_FILTER}`,
  },
  {
    id: 'jewelry-women',
    name: Category.JEWELRY,
    gender: 'Women',
    url: `https://chozen.co.il/collections/%D7%AA%D7%9B%D7%A9%D7%99%D7%98%D7%99%D7%9D${WOMEN_FILTER}`,
  },
  {
    id: 'jeans-men',
    name: Category.JEANS,
    gender: 'Men',
    url: `https://chozen.co.il/collections/%D7%92%D7%99%D7%A0%D7%A1%D7%99%D7%9D${MEN_FILTER}`,
  },
  {
    id: 'jeans-women',
    name: Category.JEANS,
    gender: 'Women',
    url: `https://chozen.co.il/collections/%D7%92%D7%99%D7%A0%D7%A1%D7%99%D7%9D${WOMEN_FILTER}`,
  },
  {
    id: 'shoes-men',
    name: Category.SHOES,
    gender: 'Men',
    url: `https://chozen.co.il/collections/%D7%A0%D7%A2%D7%9C%D7%99%D7%99%D7%9D${MEN_FILTER}`,
  },
  {
    id: 'shoes-women',
    name: Category.SHOES,
    gender: 'Women',
    url: `https://chozen.co.il/collections/%D7%A0%D7%A2%D7%9C%D7%99%D7%99%D7%9D${WOMEN_FILTER}`,
  },
  {
    id: 'perfumes-men',
    name: Category.PERFUMES,
    gender: 'Men',
    url: `https://chozen.co.il/collections/%D7%91%D7%A9%D7%9E%D7%99%D7%9D${MEN_FILTER}`,
  },
  {
    id: 'perfumes-women',
    name: Category.PERFUMES,
    gender: 'Women',
    url: `https://chozen.co.il/collections/%D7%91%D7%A9%D7%9E%D7%99%D7%9D${WOMEN_FILTER}`,
  },
  {
    id: 'allsaints-men',
    name: 'AllSaints',
    gender: 'Men',
    url: `https://chozen.co.il/collections/allsaints${MEN_FILTER}`,
  },
  {
    id: 'allsaints-women',
    name: 'AllSaints',
    gender: 'Women',
    url: `https://chozen.co.il/collections/allsaints${WOMEN_FILTER}`,
  },
  {
    id: 'brownie-men',
    name: 'Brownie',
    gender: 'Men',
    url: `https://chozen.co.il/collections/brownie${MEN_FILTER}`,
  },
  {
    id: 'brownie-women',
    name: 'Brownie',
    gender: 'Women',
    url: `https://chozen.co.il/collections/brownie${WOMEN_FILTER}`,
  },
  {
    id: 'gant-men',
    name: 'Gant',
    gender: 'Men',
    url: `https://chozen.co.il/collections/gant${MEN_FILTER}`,
  },
  {
    id: 'gant-women',
    name: 'Gant',
    gender: 'Women',
    url: `https://chozen.co.il/collections/gant${WOMEN_FILTER}`,
  },
  {
    id: 'adidas-men',
    name: 'Adidas',
    gender: 'Men',
    url: `https://chozen.co.il/collections/adidas${MEN_FILTER}`,
  },
  {
    id: 'adidas-women',
    name: 'Adidas',
    gender: 'Women',
    url: `https://chozen.co.il/collections/adidas${WOMEN_FILTER}`,
  },
  {
    id: 'tous-men',
    name: 'Tous',
    gender: 'Men',
    url: `https://chozen.co.il/collections/tous${MEN_FILTER}`,
  },
  {
    id: 'tous-women',
    name: 'Tous',
    gender: 'Women',
    url: `https://chozen.co.il/collections/tous${WOMEN_FILTER}`,
  },
  {
    id: 'veja-men',
    name: 'Veja',
    gender: 'Men',
    url: `https://chozen.co.il/collections/veja${MEN_FILTER}`,
  },
  {
    id: 'veja-women',
    name: 'Veja',
    gender: 'Women',
    url: `https://chozen.co.il/collections/veja${WOMEN_FILTER}`,
  },
  {
    id: 'socks-men',
    name: Category.SOCKS,
    gender: 'Men',
    url: `https://chozen.co.il/collections/happy-socks${MEN_FILTER}`,
  },
  {
    id: 'socks-women',
    name: Category.SOCKS,
    gender: 'Women',
    url: `https://chozen.co.il/collections/happy-socks${WOMEN_FILTER}`,
  },
  {
    id: 'the-north-face-men',
    name: 'The North Face',
    gender: 'Men',
    url: `https://chozen.co.il/collections/the-north-face${MEN_FILTER}`,
  },
  {
    id: 'the-north-face-women',
    name: 'The North Face',
    gender: 'Women',
    url: `https://chozen.co.il/collections/the-north-face${WOMEN_FILTER}`,
  },
];

const BASE_URL = 'https://chozen.co.il';

class ChozenScraper extends BaseScraper {
  protected readonly scraperName = 'Chozen';
  protected readonly source = 'Chozen';

  protected getCategories(): CategoryType[] {
    return CATEGORIES;
  }

  protected async scrapeCategory(category: CategoryType): Promise<Product[]> {
    return this.scrapeChozenCategory(category);
  }

  private async fetchChozenPage(url: string): Promise<string> {
    const browser = await puppeteer.launch({ headless: true });
    try {
      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36');
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      const html = await page.content();
      return html;
    } finally {
      await browser.close();
    }
  }

  private parseChozenProduct(productElem: cheerio.Cheerio<any>, category: CategoryType, $: cheerio.CheerioAPI): Product | undefined {
    // Extract product info from the product element
    const title = productElem.find('.card__heading, .product-title, .product-card__title').text().trim();
    const url = BASE_URL + (productElem.find('a').attr('href') || '');
    // Images: prefer data-src, else src
    let images: string[] = [];
    const img1 = productElem.find('img').attr('data-src') || productElem.find('img').attr('src');
    if (img1) images.push(img1.startsWith('http') ? img1 : 'https:' + img1);
    images = images.filter(Boolean);
    // --- Price and Sale Price ---
    let price = null, oldPrice = null;
    // Sale price: <sale-price>
    const salePriceText = productElem.find('sale-price').text().replace(/[^\d.]/g, '');
    if (salePriceText) price = parseFloat(salePriceText);
    // Old price: <compare-at-price>
    const compareAtText = productElem.find('compare-at-price').text().replace(/[^\d.]/g, '');
    if (compareAtText) oldPrice = parseFloat(compareAtText);
    // Fallback to previous selectors if not found
    if (!price) {
      const priceText = productElem.find('.price-item--regular, .price__regular, .price').first().text().replace(/[^\d.]/g, '');
      if (priceText) price = parseFloat(priceText);
    }
    if (!oldPrice) {
      const oldPriceText = productElem.find('.price-item--sale, .price__sale, .price--on-sale').first().text().replace(/[^\d.]/g, '');
      if (oldPriceText) oldPrice = parseFloat(oldPriceText);
    }
    const salePercent = calcSalePercent(price, oldPrice) ?? 0;
    const currency = 'ILS';
    // --- Brand ---
    let brand = productElem.find('p.body2-thin.mb-none').text().trim();
    if (!brand) {
      brand = productElem.find('.product-vendor, .card__vendor, .product-card__brand').text().trim();
    }
    brand = normalizeBrandName(brand || 'Chozen');
    const categories = [category.name];
    const gender = category.gender;
    if (!title || !url || price == undefined) return undefined;
    return this.createProduct({
      title,
      url,
      images,
      colors: extractColorsWithHebrew(title, [], 'chozen_scraper'),
      isSellingFast: false,
      price,
      oldPrice,
      salePercent,
      currency,
      brand,
      categories,
      gender: title.includes("לגבר") ? "Men": (title.includes("לנשים") || title.includes("לאישה")) ? "Women" : gender,
    });
  }

  private async scrapeChozenCategory(category: CategoryType): Promise<Product[]> {
    let page = 1;
    let allProducts: Product[] = [];
    let hasMore = true;
    while (hasMore) {
      const url = `${category.url}${page > 1 ? `&page=${page}` : ''}`;
      this.logProgress(`Fetching ${url}`);
      const html = await this.fetchChozenPage(url);
      const $ = cheerio.load(html);
      const productElems = $('.product-card, .card--product, .product-card__wrapper, .product-grid__item');
      if (!productElems.length) break;
      const pageProducts = productElems.map((_, el) => this.parseChozenProduct($(el), category, $)).get().filter(Boolean) as Product[];
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
  const scraper = new ChozenScraper();
  await scraper.run();
}

// CLI entry point
if (require.main === module) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

export { main, ChozenScraper }; 