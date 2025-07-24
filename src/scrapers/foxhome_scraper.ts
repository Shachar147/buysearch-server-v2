import * as cheerio from 'cheerio';
import { BaseScraper, Category as CategoryType } from './base/base-scraper';
import { calcSalePercent, extractColorsWithHebrew, Product } from './base/scraper_utils';
import puppeteer from 'puppeteer';
import { Category } from '../category.constants';

const BASE_URL = 'https://www.foxhome.co.il';

const CATEGORIES: CategoryType[] = [
  {
    id: 'tabletop',
    name: Category.HOME_KITCHEN,
    gender: 'Unisex',
    url: `${BASE_URL}/collections/tabletop`,
  },
  {
    // https://www.foxhome.co.il/collections/kitchen
    id: 'kitchen',
    name: Category.HOME_KITCHEN,
    gender: 'Unisex',
    url: `${BASE_URL}/collections/kitchen`,
  },
  {
    // https://www.foxhome.co.il/collections/bath
    id: 'bath',
    name: Category.HOME_BATH,
    gender: 'Unisex',
    url: `${BASE_URL}/collections/bath`,
  },
  // https://www.foxhome.co.il/collections/bedroom
  {
    id: 'sleep',
    name: Category.HOME_SLEEP,
    gender: 'Unisex',
    url: `${BASE_URL}/collections/bedroom`,
  },
  // https://www.foxhome.co.il/collections/%D7%A0%D7%95%D7%99-%D7%95%D7%A2%D7%99%D7%A6%D7%95%D7%91-%D7%94%D7%91%D7%99%D7%AA
  {
    id: 'decor',
    name: Category.HOME_DECOR,
    gender: 'Unisex',
    url: `${BASE_URL}/collections/נוי-ועיצוב-הבית`,
  },
  {
    id: 'online',
    name: 'New',
    gender: 'Unisex',
    url: `${BASE_URL}/collections/new`,
  },
  {
    id: 'sale',
    name: Category.HOME,
    gender: 'Unisex',
    url: `${BASE_URL}/collections/online-only`,
  },
  {
    id: 'last-chance',
    name: Category.HOME,
    gender: 'Unisex',
    url: `${BASE_URL}/collections/last-chance`,
  },
  // /collections/best-sellers
  {
    id: 'best-sellers',
    name: Category.HOME,
    gender: 'Unisex',
    url: `${BASE_URL}/collections/best-sellers`,
  },
  // Add more categories as needed
];

export class FoxHomeScraper extends BaseScraper {
  protected readonly scraperName = 'FoxHome';
  protected readonly source = 'FoxHome';

  protected getCategories(): CategoryType[] {
    return CATEGORIES;
  }

  private async fetchFoxHomePage(url: string): Promise<string> {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36');
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    const html = await page.content();
    await browser.close();
    return html;
  }

  private parseFoxHomeProduct(productElem: cheerio.Cheerio<any>, category: CategoryType, $: cheerio.CheerioAPI): Product | undefined {
    // Title
    const title = productElem.find('.product-item-meta__title').text().trim();

    // URL
    let url = productElem.find('.product-item-meta__title').attr('href') || '';
    if (url && !url.startsWith('http')) url = BASE_URL + url;
    
    // Images
    let images: string[] = [];
    productElem.find('.product-item__image-wrapper img').each((_, img) => {
      let src = $(img).attr('src');
      if (src && src.startsWith('//')) src = 'https:' + src;
      if (src && !src.startsWith('http')) src = BASE_URL + src;
      if (src && !images.includes(src)) images.push(src);
    });
    images = images.filter(Boolean);
    
    // Price and Old Price (handle price ranges)
    let price = null, oldPrice = null;
    
    // Find price range span
    const priceRange = productElem.find('.boa-price-range.prices.price');
    if (priceRange.length) {
      // Get all price values, use the max
      const priceSpans = priceRange.find('span').filter((_, el) => $(el).text().includes('₪'));
      const prices = priceSpans.map((_, el) => parseFloat($(el).text().replace(/[^\d.]/g, ''))).get().filter(Boolean);
      if (prices.length) price = Math.max(...prices);
    } else {
      // Fallback: single price
      const priceText = productElem.find('.price.price--highlight, .price.price--regular').first().text().replace(/[^\d.]/g, '');
      if (priceText) price = parseFloat(priceText);
    }
    
    // Old price (handle range)
    const oldPriceRange = productElem.find('.boa-price-range.compare-prices.price');
    if (oldPriceRange.length) {
      const oldPriceSpans = oldPriceRange.find('span').filter((_, el) => $(el).text().includes('₪'));
      const oldPrices = oldPriceSpans.map((_, el) => parseFloat($(el).text().replace(/[^\d.]/g, ''))).get().filter(Boolean);
      if (oldPrices.length) oldPrice = Math.max(...oldPrices);
    } else {
      const oldPriceText = productElem.find('.price.price--compare').first().text().replace(/[^\d.]/g, '');
      if (oldPriceText) oldPrice = parseFloat(oldPriceText);
    }
    const salePercent = calcSalePercent(price, oldPrice) ?? 0;
    
    // Colors (FoxHome usually doesn't show color swatches, so fallback to title)
    const colors = extractColorsWithHebrew(title, [], 'foxhome_scraper');
    const currency = 'ILS';
    const brand = 'FoxHome';
    const categories = [category.name];
    const gender = category.gender;
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
      const html = await this.fetchFoxHomePage(url);
      const $ = cheerio.load(html);
      // Use product-item as the product selector
      const productElems = $('product-item');
      if (!productElems.length) {
        this.logProgress('No products found on page, stopping');
        break;
      }
      const pageProducts = productElems.map((_, el) => this.parseFoxHomeProduct($(el), category, $)).get().filter(Boolean) as Product[];
      this.logProgress(`Found ${pageProducts.length} products on page ${page}`);
      allProducts.push(...pageProducts);
      // If less than 16 products, it's the last page
      hasMore = productElems.length >= 50;
      page++;
    }
    return allProducts;
  }
}

// Standalone runner
async function main() {
  const scraper = new FoxHomeScraper();
  await scraper.run();
}

if (require.main === module) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
} 