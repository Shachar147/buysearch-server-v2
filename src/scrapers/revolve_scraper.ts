import * as cheerio from 'cheerio';
import { BaseScraper, Category as BaseCategory } from './base/base-scraper';
import { Product, calcSalePercent, normalizeBrandName } from './base/scraper_utils';
import { Category } from '../category.constants';
import { fetchPageWithBrowser } from './base/browser-helpers';
import { extractColors } from 'src/color.constants';

const CATEGORIES: BaseCategory[] = [
  {
    id: 'women-sale',
    name: "Sale",
    gender: 'Women',
    // url: 'https://www.revolve.com/sale/all-sale-items/br/54cc7b/?navsrc=subSale',
    url: 'https://www.revolve.com/r/BrandsContent.jsp?aliasURL=sale%2Fall-sale-items%2Fbr%2F54cc7b&s=d&c=All+Sale+Items&n=s&navsrc=subSale&lazyLoadedPlp=false'
    // url: 'https://www.revolve.com/r/Brands.jsp?aliasURL=sale/all-sale-items/br/54cc7b&navsrc=subSale&n=s&s=d&c=All+Sale+Items',
  },
  // ------- Men --------------
  {
    id: 'women-shoes',
    name: Category.SHOES,
    gender: 'Women',
    url: 'https://www.revolve.com/r/BrandsContent.jsp?aliasURL=shoes%2Fbr%2F3f40a9&s=c&c=Shoes&navsrc=subShoes&lazyLoadedPlp=false'
  },
  {
    id: 'women-dresses',
    name: Category.DRESSES,
    gender: 'Women',
    url: 'https://www.revolve.com/r/BrandsContent.jsp?aliasURL=dresses%2Fbr%2Fa8e981&s=c&c=Dresses&navsrc=subDresses&lazyLoadedPlp=false'
  },
  {
    id: 'women-skirts',
    name: Category.SKIRTS,
    gender: 'Women',
    url: 'https://www.revolve.com/r/BrandsContent.jsp?aliasURL=skirts%2Fbr%2F8b6a66&s=c&c=Skirts&navsrc=subclothing&lazyLoadedPlp=false'
  },
  {
    id: 'women-tops',
    name: Category.TOPS,
    gender: 'Women',
    url: 'https://www.revolve.com/r/BrandsContent.jsp?aliasURL=tops%2Fbr%2Fdb773d&s=c&c=Tops&navsrc=subclothing&lazyLoadedPlp=false'
  },
  {
    id: 'women-loungewear',
    name: Category.SLEEP_WEAR,
    gender: 'Women',
    url: 'https://www.revolve.com/r/BrandsContent.jsp?aliasURL=loungewear%2Fbr%2F97c04e&s=c&c=Loungewear&navsrc=subclothing&lazyLoadedPlp=false'
  },
  {
    id: 'women-bags',
    name: Category.ACCESSORIES,
    gender: 'Women',
    url: 'https://www.revolve.com/r/BrandsContent.jsp?aliasURL=bags%2Fbr%2F2df9df&s=c&c=Bags&navsrc=subAccessories&lazyLoadedPlp=false'
  },
  {
    id: 'women-dresses',
    name: Category.DRESSES,
    gender: 'Women',
    url: 'https://www.revolve.com/r/BrandsContent.jsp?aliasURL=dresses%2Fbr%2Fa8e981&s=c&c=Dresses&navsrc=subDresses&lazyLoadedPlp=false'
  },
  {
    id: 'women-skirts',
    name: Category.SKIRTS,
    gender: 'Women',
    url: 'https://www.revolve.com/r/BrandsContent.jsp?aliasURL=skirts%2Fbr%2F8b6a66&s=c&c=Skirts&navsrc=subclothing&lazyLoadedPlp=false'
  },
  {
    id: 'women-tops',
    name: Category.TOPS,
    gender: 'Women',
    url: 'https://www.revolve.com/r/BrandsContent.jsp?aliasURL=tops%2Fbr%2Fdb773d&s=c&c=Tops&navsrc=subclothing&lazyLoadedPlp=false'
  },
  {
    id: 'women-loungewear',
    name: Category.SLEEP_WEAR,
    gender: 'Women',
    url: 'https://www.revolve.com/r/BrandsContent.jsp?aliasURL=loungewear%2Fbr%2F97c04e&s=c&c=Loungewear&navsrc=subclothing&lazyLoadedPlp=false'
  },
  // ------- Men --------------
  {
    id: 'men-polo-ralph-lauren',
    name: Category.BY_BRAND,
    brand: 'Polo Ralph Lauren',
    gender: 'Men',
    // url: 'https://www.revolve.com/mens/polo-ralph-lauren/br/e06df7/?navsrc=subdesigners_top',
    url: 'https://www.revolve.com/r/BrandsContent.jsp?aliasURL=mens%2Fpolo-ralph-lauren%2Fbr%2Fe06df7&s=b&c=Polo+Ralph+Lauren&d=Mens&navsrc=subdesigners_top&lazyLoadedPlp=false'
    // url: 'https://www.revolve.com/r/Brands.jsp?aliasURL=mens/polo-ralph-lauren/br/e06df7&navsrc=subdesigners_top&n=s&s=b&c=olo+Ralph+Lauren',
  },
  {
    id: 'men-all-saints',
    name: Category.BY_BRAND,
    brand: 'AllSaints',
    gender: 'Men',
    // url: 'https://www.revolve.com/mens/allsaints/br/c9c85e/?dessrc=myindex',
    url: 'https://www.revolve.com/r/BrandsContent.jsp?aliasURL=mens%2Fallsaints%2Fbr%2Fc9c85e&s=b&c=ALLSAINTS&d=Mens&dessrc=myindex&lazyLoadedPlp=false'
  },
  {
    id: 'men-sale',
    name: "Sale",
    gender: "Men",
    // url: "https://www.revolve.com/mens/sale/all-sale-items/br/650eb6/?navsrc=subSale"
    url: 'https://www.revolve.com/r/BrandsContent.jsp?aliasURL=mens%2Fsale%2Fall-sale-items%2Fbr%2F650eb6&s=d&c=All+Sale+Items&d=Mens&n=s&navsrc=subSale&lazyLoadedPlp=false'
    // url: 'https://www.revolve.com/r/Brands.jsp?aliasURL=mens/sale/all-sale-items/br/650eb6&navsrc=subSale&n=s&s=d&c=All+Sale+Items',
  },
  {
    id: 'men-accessories',
    name: Category.ACCESSORIES,
    gender: "Men",
    url: 'https://www.revolve.com/r/BrandsContent.jsp?aliasURL=mens%2Faccessories%2Fbr%2F8ad9de&s=c&c=Accessories&d=Mens&navsrc=subAccessories&lazyLoadedPlp=false',
  },
  {
    id: 'men-shoes',
    name: Category.SHOES,
    gender: "Men",
    url: 'https://www.revolve.com/r/BrandsContent.jsp?aliasURL=mens%2Fshoes%2Fbr%2Fb05f2e&s=c&c=Shoes&d=Mens&navsrc=subShoes&lazyLoadedPlp=false',
  },
  {
    id: 'men-tshirts',
    name: Category.T_SHIRTS,
    gender: "Men",
    url: 'https://www.revolve.com/r/BrandsContent.jsp?aliasURL=mens%2Ftshirts%2Fbr%2Fe90f7b&s=c&c=T-Shirts&d=Mens&navsrc=subClothing&lazyLoadedPlp=false',
  },
  {
    id: 'men-knitwear',
    name: Category.KNITWEAR,
    gender: "Men",
    url: 'https://www.revolve.com/r/BrandsContent.jsp?aliasURL=mens%2Fclothing-sweaters-knits%2Fbr%2F1bd505&sc=Sweaters+%26+Knits&s=c&c=Clothing&d=Mens&navsrc=subClothing&lazyLoadedPlp=false',
  },
  {
    id: 'men-lounge',
    name: Category.SLEEP_WEAR,
    gender: "Men",
    url: 'https://www.revolve.com/r/BrandsContent.jsp?aliasURL=mens%2Fclothing-lounge%2Fbr%2F625b8c&sc=Lounge&s=c&c=Clothing&d=Mens&navsrc=left&lazyLoadedPlp=false',
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
    const maxPages = 250; // todo change to much higher value
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
    return fetchPageWithBrowser(url, {
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
      waitUntil: 'domcontentloaded',
      timeout: 60000,
      onPageReady: async (page) => {
        await page.waitForSelector('li.js-plp-container', { timeout: 10000 }).catch(() => {
          this.logProgress('No product cards found on page, might be the last page.');
        });
      }
    });
  }

  private parseProduct($, el: any, category: BaseCategory): Product | undefined {
    const $el = $(el);
    const title = $el.find('.product-name.js-plp-name').text().trim();
    if (!title) return undefined;

    let brand = $el.find('.product-brand.js-plp-brand').text().trim();
    if (!brand) return undefined;

    const relativeUrl = $el.find('a.js-plp-pdp-link').attr('href');
    if (!relativeUrl) return undefined;
    const url = 'https://www.revolve.com' + relativeUrl.split('?')[0];
    
    const images: string[] = [];
    const mainImgSrc = $el.find('img.js-plp-image').attr('src');
    if (mainImgSrc) images.push(mainImgSrc);
    const altImgSrc = $el.find('img.plp_altview').attr('data-lazy-src');
    if (altImgSrc) images.push(altImgSrc);

    let price: number | null = null;
    let oldPrice: number | null = null;
    let currency = 'ILS';

    const priceContainer = $el.find('.js-plp-prices-div');
    const isOnSale = priceContainer.find('.price--on-sale').length > 0;

    let priceText = '';
    if (isOnSale) {
        priceText = priceContainer.find('.price__sale.js-plp-price').text().trim();
        const oldPriceText = priceContainer.find('s.price__retail.js-plp-price-retail').text().trim();
        
        if (priceText) {
          const match = priceText.replace(/[$,]/g, '').match(/\d+(\.\d+)?/);
          if (match) price = parseFloat(match[0]);
          // Extract currency symbol (e.g., $)
          const currencyMatch = priceText.match(/[^\d.,\s]+/);
          if (currencyMatch) {
            currency = currencyMatch[0].trim();
            if (currency === '$') currency = 'USD';
            // Add more mappings if needed
          }
        }
        if (oldPriceText) {
          const match = oldPriceText.replace(/[$,]/g, '').match(/\d+(\.\d+)?/);
          if (match) oldPrice = parseFloat(match[0]);
        }
    } else {
        priceText = priceContainer.find('.js-plp-price, .plp_price.price__retail').text().trim();
        if (priceText) {
          const match = priceText.replace(/[$,]/g, '').match(/\d+(\.\d+)?/);
          if (match) price = parseFloat(match[0]);
          // Extract currency symbol (e.g., $)
          const currencyMatch = priceText.match(/[^\d.,\s]+/);
          if (currencyMatch) {
            currency = currencyMatch[0].trim();
            if (currency === '$') currency = 'USD';
            // Add more mappings if needed
          }
        }
    }
    
    const salePercent = calcSalePercent(price, oldPrice);
    const colors = extractColors(title, []);

    if (!title || !url || !price) return;

    return this.createProduct({
      title,
      url,
      images,
      colors,
      price,
      oldPrice,
      salePercent,
      currency,
      brand: category.brand || normalizeBrandName(brand),
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