import * as cheerio from 'cheerio';
import { BaseScraper, Category as BaseCategory } from './base/base-scraper';
import { Product, calcSalePercent, extractColors } from './base/scraper_utils';
import { fetchPageWithBrowser } from './base/browser-helpers';
import { Category } from 'src/category.constants';

const CATEGORIES: BaseCategory[] = [
  // Main Categories
  {
    id: 'new-arrivals',
    name: 'New',
    gender: 'Women',
    url: 'https://www.de-rococo.co.il/collections/new-arrivals'
  },
  {
    id: 'wedding-season',
    name: Category.WEDDING,
    gender: 'Women',
    url: 'https://www.de-rococo.co.il/collections/wedding-season'
  },
  {
    id: 'leather-goods',
    name: Category.CLOTHING,
    gender: 'Women',
    url: 'https://www.de-rococo.co.il/collections/leather-goods'
  },
  {
    id: 'swimwear',
    name: Category.SWIMWEAR,
    gender: 'Women',
    url: 'https://www.de-rococo.co.il/collections/swimwear'
  },
  {
    id: 'daddy-collection',
    name: Category.CLOTHING,
    gender: 'Women',
    url: 'https://www.de-rococo.co.il/collections/daddy-collection'
  },
  {
    id: 'denim',
    name: Category.JEANS,
    gender: 'Women',
    url: 'https://www.de-rococo.co.il/collections/denim'
  },
  {
    id: 'activewear',
    name: Category.SPORT,
    gender: 'Women',
    url: 'https://www.de-rococo.co.il/collections/activewear'
  },

  // Clothing Categories
  {
    id: 'outwear',
    name: Category.JACKETS_COATS,
    gender: 'Women',
    url: 'https://www.de-rococo.co.il/collections/outwear'
  },
  {
    id: 'jackets',
    name: Category.JACKETS_COATS,
    gender: 'Women',
    url: 'https://www.de-rococo.co.il/collections/jackets'
  },
  {
    id: 'knits-sweaters',
    name: Category.SWEATERS,
    gender: 'Women',
    url: 'https://www.de-rococo.co.il/collections/knits-sweaters'
  },
  {
    id: 'shirts-blouses',
    name: Category.TOPS,
    gender: 'Women',
    url: 'https://www.de-rococo.co.il/collections/shirts-blouses'
  },
  {
    id: 't-shirts-tanks',
    name: Category.T_SHIRTS,
    gender: 'Women',
    url: 'https://www.de-rococo.co.il/collections/t-shirts-tanks'
  },
  {
    id: 'trousers-shorts',
    name: Category.BOTTOMS,
    gender: 'Women',
    url: 'https://www.de-rococo.co.il/collections/trousers-shorts'
  },
  {
    id: 'dresses-skirts',
    name: Category.CLOTHING,
    gender: 'Women',
    url: 'https://www.de-rococo.co.il/collections/dresses-skirts'
  },
  {
    id: 'jumpsuits',
    name: Category.OVERALLS,
    gender: 'Women',
    url: 'https://www.de-rococo.co.il/collections/jumpsuits'
  },
  {
    id: 'active-loungewear',
    name: Category.SPORT,
    gender: 'Women',
    url: 'https://www.de-rococo.co.il/collections/active-loungewear'
  },
  {
    id: 'sets',
    name: Category.SETS,
    gender: 'Women',
    url: 'https://www.de-rococo.co.il/collections/sets'
  },

  // Accessories Categories
  {
    id: 'accessories',
    name: Category.ACCESSORIES,
    gender: 'Women',
    url: 'https://www.de-rococo.co.il/collections/accessories'
  },
  {
    id: 'bags',
    name: Category.BAGS,
    gender: 'Women',
    url: 'https://www.de-rococo.co.il/collections/bags'
  },
  {
    id: 'belts',
    name: Category.BELTS,
    gender: 'Women',
    url: 'https://www.de-rococo.co.il/collections/belts'
  },
  {
    id: 'hats-gloves',
    name: Category.ACCESSORIES,
    gender: 'Women',
    url: 'https://www.de-rococo.co.il/collections/hats-gloves'
  },
  {
    id: 'sunglasses',
    name: Category.SUNGLASSES,
    gender: 'Women',
    url: 'https://www.de-rococo.co.il/collections/sunglasses'
  },
  {
    id: 'scarves-sarongs',
    name: Category.ACCESSORIES,
    gender: 'Women',
    url: 'https://www.de-rococo.co.il/collections/scarves-sarongs'
  },
  {
    id: 'small-goods',
    name: Category.ACCESSORIES,
    gender: 'Women',
    url: 'https://www.de-rococo.co.il/collections/small-goods'
  },

  // Special Collections
  {
    id: 'resort',
    name: 'New',
    gender: 'Women',
    url: 'https://www.de-rococo.co.il/collections/resort'
  },
  {
    id: 'boucle',
    name: 'New',
    gender: 'Women',
    url: 'https://www.de-rococo.co.il/collections/boucle'
  },
  {
    id: 'satin',
    name: 'New',
    gender: 'Women',
    url: 'https://www.de-rococo.co.il/collections/satin'
  },
  {
    id: 'knitwear',
    name: Category.KNITWEAR,
    gender: 'Women',
    url: 'https://www.de-rococo.co.il/collections/knitwear'
  },

  // Sale Categories
  {
    id: 'sale',
    name: 'Sale',
    gender: 'Women',
    url: 'https://www.de-rococo.co.il/collections/sale'
  },
  {
    id: 'sale-favorites',
    name: 'Sale',
    gender: 'Women',
    url: 'https://www.de-rococo.co.il/collections/sale-favorites'
  },
  {
    id: 'sale-basics',
    name: 'Sale',
    gender: 'Women',
    url: 'https://www.de-rococo.co.il/collections/sale-basics'
  },
  {
    id: 'resort-sale',
    name: 'Sale',
    gender: 'Women',
    url: 'https://www.de-rococo.co.il/collections/resort-sale'
  },
  {
    id: 'daddy-sale',
    name: 'Sale',
    gender: 'Women',
    url: 'https://www.de-rococo.co.il/collections/daddy-sale'
  },
  {
    id: 'knitwear-sale',
    name: Category.KNITWEAR,
    gender: 'Women',
    url: 'https://www.de-rococo.co.il/collections/knitwear-sale'
  },
  {
    id: 'denim-sale',
    name: Category.JEANS,
    gender: 'Women',
    url: 'https://www.de-rococo.co.il/collections/denim-sale'
  },
  {
    id: 'jackets-sale',
    name: Category.JACKETS_COATS,
    gender: 'Women',
    url: 'https://www.de-rococo.co.il/collections/jackets-sale'
  },
  {
    id: 'coats-sale',
    name: Category.JACKETS_COATS,
    gender: 'Women',
    url: 'https://www.de-rococo.co.il/collections/coats-sale'
  },
  {
    id: 'tops-sale',
    name: Category.TOPS,
    gender: 'Women',
    url: 'https://www.de-rococo.co.il/collections/tops-sale'
  },
  {
    id: 'pants-sale',
    name: Category.PANTS,
    gender: 'Women',
    url: 'https://www.de-rococo.co.il/collections/pants-sale'
  },
  {
    id: 'shorts-sale',
    name: Category.SHORTS,
    gender: 'Women',
    url: 'https://www.de-rococo.co.il/collections/shorts-sale'
  },
  {
    id: 'skirts-sale',
    name: Category.SKIRTS,
    gender: 'Women',
    url: 'https://www.de-rococo.co.il/collections/skirts-sale'
  },
  {
    id: 'dresses-sale',
    name: Category.DRESSES,
    gender: 'Women',
    url: 'https://www.de-rococo.co.il/collections/dresses-sale'
  },
  {
    id: 'jumpsuits-sale',
    name: Category.OVERALLS,
    gender: 'Women',
    url: 'https://www.de-rococo.co.il/collections/jumpsuits-sale'
  },
  {
    id: 'tracksuits-sale',
    name: Category.CLOTHING,
    gender: 'Women',
    url: 'https://www.de-rococo.co.il/collections/tracksuits-sale'
  },
  {
    id: 'activewear-sale',
    name: Category.SPORT,
    gender: 'Women',
    url: 'https://www.de-rococo.co.il/collections/activewear-sale'
  },
  {
    id: 'accessories-sale',
    name: Category.ACCESSORIES,
    gender: 'Women',
    url: 'https://www.de-rococo.co.il/collections/accessories-sale'
  }
];

export class DerococoScraper extends BaseScraper {
  private totalProductsProcessed = 0;
  protected readonly scraperName = 'Derococo';
  protected readonly source = 'Derococo';

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
    const maxPages = 50; // Reasonable limit for Derococo
    let prevPageUrls: string[] = [];

    while (page <= maxPages) {
      const url = this.getPageUrl(category.url, page);
      this.logProgress(`Fetching ${url}`);

      try {
        const html = await this.fetchPage(url);
        const $ = cheerio.load(html);
        const productCards = $('.Grid__Cell .ProductItem');
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
    return baseUrl + (baseUrl.includes('?') ? '&' : '?') + `page=${page}`;
  }

  private async fetchPage(url: string): Promise<string> {
    return fetchPageWithBrowser(url, {
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
      waitUntil: 'domcontentloaded',
      timeout: 60000,
      onPageReady: async (page) => {
        await page.waitForSelector('.Grid__Cell .ProductItem', { timeout: 10000 }).catch(() => {
          this.logProgress('No product cards found on page, might be the last page.');
        });
      }
    });
  }



  private parseProduct($, el: any, category: BaseCategory): Product | undefined {
    const $el = $(el);
    const title = $el.find('.ProductItem__Title a').text().trim();
    if (!title) return undefined;

    const relativeUrl = $el.find('.ProductItem__Title a').attr('href');
    if (!relativeUrl) return undefined;
    const url = 'https://www.de-rococo.co.il' + relativeUrl;
    
    let images: string[] = [];
    
    // Try to get the main image first (data-src attribute)
    const mainImgSrc = $el.find('.ProductItem__Image').attr('data-src');
    if (mainImgSrc) {
      const fullImgUrl = mainImgSrc.startsWith('http') ? mainImgSrc : `https:${mainImgSrc}`;
      images.push(fullImgUrl);
    }
    
    // Also try to get the alternate image
    const altImgSrc = $el.find('.ProductItem__Image--alternate').attr('data-src');
    if (altImgSrc && !images.includes(altImgSrc)) {
      const fullAltImgUrl = altImgSrc.startsWith('http') ? altImgSrc : `https:${altImgSrc}`;
      images.push(fullAltImgUrl);
    }
    
    // Fallback to regular src attribute if data-src is not available
    if (images.length === 0) {
      const fallbackImgSrc = $el.find('.ProductItem__Image').attr('src');
      if (fallbackImgSrc) {
        const fullImgUrl = fallbackImgSrc.startsWith('http') ? fallbackImgSrc : `https:${fallbackImgSrc}`;
        images.push(fullImgUrl);
      }
    }

    images = images.map(img => img.replace('{width}', '600'));

    let price: number | null = null;
    let oldPrice: number | null = null;
    let currency = 'ILS';

    // Check if product is on sale
    const isOnSale = $el.find('.ProductItem__Label--onSale').length > 0;
    const priceContainer = $el.find('.ProductItem__PriceList');

    if (isOnSale) {
      // Product has both regular and sale prices
      const salePriceText = priceContainer.find('.Price--highlight').text().trim();
      const regularPriceText = priceContainer.find('.Price--compareAt').text().trim();
      
      if (salePriceText) {
        const match = salePriceText.replace(/[^\d]/g, '').match(/\d+/);
        if (match) price = parseInt(match[0]);
      }
      if (regularPriceText) {
        const match = regularPriceText.replace(/[^\d]/g, '').match(/\d+/);
        if (match) oldPrice = parseInt(match[0]);
      }
    } else {
      // Product has only regular price
      const priceText = priceContainer.find('.ProductItem__Price').text().trim();
      if (priceText) {
        const match = priceText.replace(/[^\d]/g, '').match(/\d+/);
        if (match) price = parseInt(match[0]);
      }
    }
    
    const salePercent = calcSalePercent(price, oldPrice);
    let colors = this.extractDerococoColors(title, url);
    // console.log({ images, colors });
    // colors = [];

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
      brand: 'Derococo',
      categories: [category.name],
      gender: category.gender,
    });
  }

  private extractDerococoColors(title: string, url: string): string[] {
    
    // Then extract colors from title (this already handles English)
    const titleColors = extractColors(title, []);
    
    const urlColors = extractColors(url, []);

    // Combine both sets
    const allColors = new Set([...urlColors, ...titleColors]);
    
    return Array.from(allColors).filter((c) => c.trim().length > 0);
  }
}

// Standalone runner
async function main() {
  const scraper = new DerococoScraper();
  await scraper.run();
}

if (require.main === module) {
  main();
} 