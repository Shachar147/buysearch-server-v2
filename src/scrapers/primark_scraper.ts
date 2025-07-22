import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import { BaseScraper, Category as BaseCategory } from './base/base-scraper';
import { Product, calcSalePercent, extractColors, normalizeBrandName } from './base/scraper_utils';
import { Category } from '../category.constants';

const CATEGORIES: BaseCategory[] = [
  {
    id: 'men-clothing',
    name: Category.CLOTHING,
    gender: 'Men',
    url: 'https://www.primark.com/en-us/c/men/clothing',
  },
  {
    id: 'men-shoes',
    name: Category.SHOES,
    gender: 'Men',
    url: 'https://www.primark.com/en-us/c/men/shoes',
  },
  {
    id: 'men-sport',
    name: Category.SPORT,
    gender: 'Men',
    url: 'https://www.primark.com/en-us/c/men/sportswear-and-leisure',
  },
  {
    id: 'men-suits',
    name: Category.SUITS,
    gender: 'Men',
    url: 'https://www.primark.com/en-us/c/men/suits-and-formalwear',
  },
  {
    id: 'men-sleepwear',
    name: Category.SLEEP_WEAR,
    gender: 'Men',
    url: 'https://www.primark.com/en-us/c/men/sleepwear',
  },
  {
    id: 'men-accessories',
    name: Category.ACCESSORIES,
    gender: 'Men',
    url: 'https://www.primark.com/en-us/c/men/accessories',
  },
  {
    id: 'women-clothing',
    name: Category.CLOTHING,
    gender: 'Women',
    url: 'https://www.primark.com/en-us/c/women/clothing',
  },
  {
    id: 'women-lingerie',
    name: Category.LINGERIE,
    gender: 'Women',
    url: 'https://www.primark.com/en-us/c/women/sleepwear-and-lingerie',
  },
  {
    id: 'women-sport',
    name: Category.SPORT,
    gender: 'Women',
    url: 'https://www.primark.com/en-us/c/women/gymwear-and-leisure',
  },
  {
    id: 'women-accessories',
    name: Category.ACCESSORIES,
    gender: 'Women',
    url: 'https://www.primark.com/en-us/c/women/accessories',
  },
  {
    id: 'women-shoes',
    name: Category.SHOES,
    gender: 'Women',
    url: 'https://www.primark.com/en-us/c/women/shoes',
  },
  {
    id: 'women-general',
    name: 'New',
    gender: 'Women',
    url: 'https://www.primark.com/en-us/c/women/occasionwear',
  }
];

export class PrimarkScraper extends BaseScraper {
  protected readonly scraperName = 'Primark';
  protected readonly source = 'Primark';

  protected getCategories(): BaseCategory[] {
    return CATEGORIES;
  }

  protected async scrapeCategory(category: BaseCategory): Promise<Product[]> {
    let page = 1;
    let allProducts: Product[] = [];
    let hasMore = true;
    let prevPageUrls: string[] = [];
    const MAX_PAGES = 50;
    while (hasMore && page <= MAX_PAGES) {
      const url = `${category.url}${page > 1 ? `?page=${page}` : ''}`;
      this.logProgress(`Fetching ${url}`);
      const html = await this.fetchPrimarkPage(url);
      const $ = cheerio.load(html);
      // Use the actual product card selector from the provided DOM
      const productCards = $('[id^="product-card-"]');
      if (!productCards.length) break;
      const pageProducts: Product[] = [];
      const pageUrls: string[] = [];
      productCards.each((_, el) => {
        const product = this.parsePrimarkProduct($, el, category);
        if (product) {
          pageProducts.push(product);
          pageUrls.push(product.url);
        }
      });
      console.log(`Found ${pageProducts.length} products on this page`);
      if (prevPageUrls.length && pageUrls.length && prevPageUrls.join(',') === pageUrls.join(',')) {
        hasMore = false;
        break;
      }
      allProducts.push(...pageProducts);
      prevPageUrls = pageUrls;
      hasMore = productCards.length > 0;
      page++;
    }
    return allProducts;
  }

  private async fetchPrimarkPage(url: string): Promise<string> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    try {
      const page = await browser.newPage();
      await page.setUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
      );
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForSelector('[id^="product-card-"]', { timeout: 10000 }).catch(() => {
        this.logProgress('No product cards found on page, might be the last page.');
      });
      const html = await page.content();
      return html;
    } finally {
      await browser.close();
    }
  }

  private parsePrimarkProduct($: cheerio.CheerioAPI, el: any, category: BaseCategory): Product | undefined {
    const $el = $(el);
    // Title
    const title = $el.find('h2[data-testautomation-id="name"] a').text().trim();
    if (!title) return undefined;
    // URL
    const relativeUrl = $el.find('a[data-testautomation-id="link"]').attr('href');
    const url = relativeUrl ? `https://www.primark.com${relativeUrl}` : '';
    if (!url) return undefined;
    // Image
    const images: string[] = [];
    const imgSrc = $el.find('img.ProductCard-image').attr('src');
    if (imgSrc) images.push(imgSrc);
    // Price
    let price: number | null = null;
    let oldPrice: number | null = null;
    let currency = 'USD';
    const priceText = $el.find('p[data-testautomation-id="price"] a').text().trim();
    if (priceText) {
      const match = priceText.replace(/[$,]/g, '').match(/\d+(\.\d+)?/);
      if (match) price = parseFloat(match[0]);
      if (priceText.includes('$')) currency = 'USD';
    }
    // Color extraction: try to extract from color links
    let colors: string[] = [];
    $el.find('p[data-testautomation-id="colors-number"] a').each((_, colorLink) => {
      const colorText = $(colorLink).text().trim().toLowerCase();
      // Only push if it's a color name, not a number or 'color(s)'
      if (colorText && isNaN(Number(colorText)) && !/color(s)?/i.test(colorText)) {
        colors.push(colorText);
      }
    });
    // If no color links, fallback to extracting from title
    if (colors.length === 0) {
      colors = extractColors(title, []);
    }
    // Category extraction/normalization: only use config
    const categories = [category.name];
    const brand = normalizeBrandName('Primark');
    const gender = category.gender;
    return this.createProduct({
      title,
      url,
      images,
      colors,
      price,
      oldPrice,
      salePercent: calcSalePercent(price, oldPrice),
      currency,
      brand,
      categories,
      gender,
    });
  }
}

// Standalone runner
async function main() {
  const scraper = new PrimarkScraper();
  await scraper.run();
}

if (require.main === module) {
  main();
} 