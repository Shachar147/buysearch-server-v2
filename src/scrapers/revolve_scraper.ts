import * as cheerio from 'cheerio';
import { BaseScraper, Category as BaseCategory } from './base/base-scraper';
import { Product, calcSalePercent, extractColors } from './base/scraper_utils';
import { Category } from '../category.constants';
import puppeteer from 'puppeteer';

const CATEGORIES: BaseCategory[] = [
  {
    id: 'women-sale',
    name: "Sale",
    gender: 'Women',
    // url: 'https://www.revolve.com/sale/all-sale-items/br/54cc7b/?navsrc=subSale',
    url: 'https://www.revolve.com/r/BrandsContent.jsp?aliasURL=sale%2Fall-sale-items%2Fbr%2F54cc7b&s=d&c=All+Sale+Items&n=s&navsrc=subSale&lazyLoadedPlp=false'
  },
  {
    id: 'men-polo-ralph-lauren',
    name: Category.BY_BRAND,
    brand: 'Polo Ralph Lauren',
    gender: 'Men',
    // url: 'https://www.revolve.com/mens/polo-ralph-lauren/br/e06df7/?navsrc=subdesigners_top',
    url: 'https://www.revolve.com/r/BrandsContent.jsp?aliasURL=mens%2Fpolo-ralph-lauren%2Fbr%2Fe06df7&s=b&c=Polo+Ralph+Lauren&d=Mens&navsrc=subdesigners_top&lazyLoadedPlp=false'
  },
  {
    id: 'men-sale',
    name: "Sale",
    gender: "Men",
    // url: "https://www.revolve.com/mens/sale/all-sale-items/br/650eb6/?navsrc=subSale"
    url: 'https://www.revolve.com/r/BrandsContent.jsp?aliasURL=mens%2Fsale%2Fall-sale-items%2Fbr%2F650eb6&s=d&c=All+Sale+Items&d=Mens&n=s&navsrc=subSale&lazyLoadedPlp=false'
  }
];

export class RevolveScraper extends BaseScraper {
  private totalProductsProcessed = 0;
  protected readonly scraperName = 'Revolve';
  protected readonly source = 'Revolve';

  private areArraysEqual(arr1: string[], arr2: string[]): boolean {
    if (arr1.length !== arr2.length) return false;
    return arr1.join(',') === arr2.join(',');
  }

  protected getCategories(): BaseCategory[] {
    return CATEGORIES;
  }

  protected async scrapeCategory(category: BaseCategory): Promise<Product[]> {
    const allProducts: Product[] = [];
    let page = 1;
    const maxPages = 80;
    let prevPageUrls: string[] = [];

    while (page <= maxPages) {
      const url = this.getPageUrl(category.url, page);
      this.logProgress(`Fetching ${url}`);

      try {
        const html = await this.fetchPage(url);
        const $ = cheerio.load(html);
        const productCards = $('li.js-plp-container');
        const currentPageUrls: string[] = [];

        for (let i = 0; i < productCards.length; i++) {
          try {
            const product = await this.parseProduct($, productCards[i], category);
            if (product) {
              allProducts.push(product);
              currentPageUrls.push(product.url);
              this.totalProductsProcessed++;
              if (this.totalProductsProcessed % 10 === 0) {
                this.logProgress(`Total products processed so far: ${this.totalProductsProcessed}`);
              }
            }
          } catch (error) {
            this.logProgress(`Failed to parse product: ${error.message}`);
          }
        }

        if (currentPageUrls.length === 0) {
          this.logProgress('No products found on page, stopping pagination');
          break;
        }

        if (this.areArraysEqual(currentPageUrls, prevPageUrls)) {
          this.logProgress('Same products as previous page, stopping pagination');
          break;
        }

        prevPageUrls = currentPageUrls;
        page++;
      } catch (error) {
        this.logProgress(`Failed to fetch page ${page}: ${error.message}`);
        break;
      }
    }

    return allProducts;
  }

  private getPageUrl(baseUrl: string, page: number): string {
    if (page === 1) return baseUrl;
    if (baseUrl.includes('pageNum=')) {
      return baseUrl.replace(/pageNum=\d+/, `pageNum=${page}`);
    }
    return baseUrl + (baseUrl.includes('?') ? '&' : '?') + `pageNum=${page}`;
  }

  private async fetchPage(url: string): Promise<string> {
    const browser = await puppeteer.launch({
      executablePath: puppeteer.executablePath(),
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    try {
      const page = await browser.newPage();
      await page.setUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
      );
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      
      await page.waitForSelector('li.js-plp-container', { timeout: 10000 }).catch(() => {
        this.logProgress('No product cards found on page, might be the last page.');
      });

      const html = await page.content();
      return html;
    } finally {
      await browser.close();
    }
    return "";
  }

  private parseProduct($, el: any, category: BaseCategory): Product | undefined {
    const $el = $(el);
    const title = $el.find('.product-name.js-plp-name').text().trim();
    if (!title) return undefined;

    const brand = $el.find('.product-brand.js-plp-brand').text().trim();
    if (!brand) return undefined;

    const relativeUrl = $el.find('a.js-plp-pdp-link').attr('href');
    if (!relativeUrl) return undefined;
    const url = 'https://www.revolve.com' + relativeUrl;
    
    const images: string[] = [];
    const mainImgSrc = $el.find('img.js-plp-image').attr('src');
    if (mainImgSrc) images.push(mainImgSrc);
    const altImgSrc = $el.find('img.plp_altview').attr('data-lazy-src');
    if (altImgSrc) images.push(altImgSrc);

    let price: number | null = null;
    let oldPrice: number | null = null;

    const priceContainer = $el.find('.js-plp-prices-div');
    const isOnSale = priceContainer.find('.price--on-sale').length > 0;

    if (isOnSale) {
        const priceText = priceContainer.find('.price__sale.js-plp-price').text().trim();
        const oldPriceText = priceContainer.find('s.price__retail.js-plp-price-retail').text().trim();
        
        if (priceText) {
          const match = priceText.replace(/[\$,]/g, '').match(/\d+(\.\d+)?/);
          if (match) price = parseFloat(match[0]);
        }
        if (oldPriceText) {
          const match = oldPriceText.replace(/[\$,]/g, '').match(/\d+(\.\d+)?/);
          if (match) oldPrice = parseFloat(match[0]);
        }
    } else {
        const priceText = priceContainer.find('.js-plp-price').text().trim();
         if (priceText) {
          const match = priceText.replace(/[\$,]/g, '').match(/\d+(\.\d+)?/);
          if (match) price = parseFloat(match[0]);
        }
    }
    
    const salePercent = calcSalePercent(price, oldPrice);
    const colors = extractColors(title, []);

    return this.createProduct({
      title,
      url,
      images,
      colors,
      price,
      oldPrice,
      salePercent,
      currency: 'USD',
      brand: category.brand || brand,
      categories: [category.name],
      gender: category.gender,
    });
  }
}

// Standalone runner
async function main() {
  const scraper = new RevolveScraper();
  await scraper.run();
}

if (require.main === module) {
  main();
} 