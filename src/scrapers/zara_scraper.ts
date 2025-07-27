import * as cheerio from 'cheerio';
import { BaseScraper } from './base/base-scraper';
import { Category as CategoryType } from './base/base-scraper';
import { Category } from '../category.constants';
import { Product, calcSalePercent, normalizeBrandName, extractColorsWithHebrew, extractCategory } from './base/scraper_utils';
import { fetchPageWithBrowser, handleCookieConsent } from './base/browser-helpers';
import * as dotenv from 'dotenv';
dotenv.config();

const CATEGORIES: CategoryType[] = [
  {
    id: 'man-tshirts',
    name: Category.T_SHIRTS,
    gender: 'Men',
    url: 'https://www.zara.com/il/he/man-tshirts-l855.html',
  },
  {
    id: 'sale', // 'sale-40',
    name: 'Sale',
    gender: 'Men',
    url: 'https://www.zara.com/il/he/s-man-sale-l10847.html', // 'https://www.zara.com/il/he/s-man-from-40-l10609.html'
  },
  {
    id: 'jeans',
    name: Category.JEANS,
    gender: 'Men',
    url: 'https://www.zara.com/il/he/man-jeans-l659.html',
  },
  {
    id: 'shorts',
    name: Category.SHORTS,
    gender: 'Men',
    url: 'https://www.zara.com/il/he/man-bermudas-l592.html'
  },
  {
    id: 'sweaters',
    name: Category.SWEATERS,
    gender: 'Men',
    url: 'https://www.zara.com/il/he/man-knitwear-l10702.html'
  },
  {
    id: 'shirts',
    name: Category.SHIRTS,
    gender: 'Men',
    url: 'https://www.zara.com/il/he/man-shirts-l737.html'
  },
  {
    id: 'polo-shirts',
    name: Category.POLO_SHIRTS,
    gender: 'Men',
    url: 'https://www.zara.com/il/he/man-polos-l733.html'
  },
  {
    id: 'sunglasses',
    name: Category.SUNGLASSES,
    gender: 'Men',
    url: 'https://www.zara.com/il/he/man-accessories-sunglasses-l558.html'
  },
  {
    id: 'swimwear',
    name: Category.BEACHWEAR,
    gender: 'Men',
    url: 'https://www.zara.com/il/he/man-beachwear-l590.html'
  },
  {
    id: 'overshirts',
    name: Category.OVERSHIRTS,
    gender: 'Men',
    url: 'https://www.zara.com/il/he/man-overshirts-l3174.html'
  },
  {
    id: 'bags',
    name: Category.BAGS,
    gender: 'Men',
    url: 'https://www.zara.com/il/he/man-bags-l563.html'
  },
  {
    id: 'dress-sale',
    name: Category.DRESSES,
    gender: 'Women',
    url: 'https://www.zara.com/il/he/s-woman-dresses-l8887.html'
  },
  {
    id: 'dress-sale',
    name: Category.DRESSES,
    gender: 'Women',
    url: 'https://www.zara.com/il/he/s-woman-dresses-l8887.html'
  },
  {
    id: 'tshirt-sale',
    name: Category.T_SHIRTS,
    gender: 'Women',
    url: 'https://www.zara.com/il/he/s-woman-tshirts-l10252.html'
  },
  {
    id: 'jeans-sale',
    name: Category.JEANS,
    gender: 'Women',
    url: 'https://www.zara.com/il/he/s-woman-jeans-l9082.html'
  },
  {
    id: 'tshirts',
    name: Category.T_SHIRTS,
    gender: 'Women',
    url: 'https://www.zara.com/il/he/woman-tshirts-l1362.html'
  },
  {
    id: 'jeans-sale',
    name: Category.JEANS,
    gender: 'Women',
    url: 'https://www.zara.com/il/he/woman-jeans-l1119.html'
  },
  {
    id: 'dresses',
    name: Category.DRESSES,
    gender: 'Women',
    url: 'https://www.zara.com/il/he/woman-dresses-l1066.html'
  },
  {
    id: 'shirts',
    name: Category.SHIRTS,
    gender: 'Women',
    url: 'https://www.zara.com/il/he/woman-shirts-l1217.html'
  },
  {
    id: 'bags',
    name: Category.BAGS,
    gender: 'Women',
    url: 'https://www.zara.com/il/he/woman-bags-l1024.html'
  },
  {
    id: 'perfumes',
    name: Category.PERFUMES,
    gender: 'Women',
    url: 'https://www.zara.com/il/he/woman-beauty-perfumes-l1415.html'
  },
  {
    id: 'jackets-and-coats-sale',
    name: Category.JACKETS_COATS,
    gender: 'Women',
    url: 'https://www.zara.com/il/he/woman-outerwear-l1184.html'
  },
  {
    id: 'accessories',
    name: Category.ACCESSORIES,
    gender: 'Women',
    url: 'https://www.zara.com/il/he/woman-accessories-l1003.html'
  },
  {
    id: 'shorts-skorts',
    name: Category.SKIRTS,
    gender: 'Women',
    url: 'https://www.zara.com/il/he/woman-shorts-skorts-l1297.html'
  },
  {
    id: 'shorts-denim',
    name: Category.SHORT_JEANS,
    gender: 'Women',
    url: 'https://www.zara.com/il/he/woman-shorts-denim-l1710.html'
  },
  {
    id: 'co-ords',
    name: Category.SETS,
    gender: 'Women',
    url: 'https://www.zara.com/il/he/woman-co-ords-l1061.html'
  },
  {
    id: 'lingerie',
    name: Category.LINGERIE,
    gender: 'Women',
    url: 'https://www.zara.com/il/he/woman-lingerie-l4021.html'
  },
  {
    id: 'pyjamas',
    name: Category.SLEEP_WEAR,
    gender: 'Women',
    url: 'https://www.zara.com/il/he/woman-lingerie-pyjamas-l4024.html'
  },
  {
    id: 'total-look-men',
    name: Category.SETS,
    gender: 'Men',
    url: 'https://www.zara.com/il/he/man-total-look-l5490.html'
  },
  {
    id: 'summer-collection-men',
    name: 'summer essentials',
    gender: 'Men',
    url: 'https://www.zara.com/il/he/man-summer-collection-l6321.html'
  },
  {
    id: 'accessories-men',
    name: Category.ACCESSORIES,
    gender: 'Men',
    url: 'https://www.zara.com/il/he/man-accessories-l537.html'
  },
  {
    id: 'shoes-men',
    name: Category.SHOES,
    gender: 'Men',
    url: 'https://www.zara.com/il/he/man-shoes-sandals-l794.html'
  },
  {
    id: 'linen-men',
    name: Category.CLOTHING,
    gender: 'Men',
    url: 'https://www.zara.com/il/he/man-linen-l708.html'
  },
  {
    id: 'sale-kids',
    name: 'Sale',
    gender: 'Kids',
    url: 'https://www.zara.com/il/he/s-kids-l12716.html'
  },
  {
    id: 'clothing-girls-small',
    name: Category.CLOTHING,
    gender: 'Kids',
    age: '1.5-6', // ignored for now
    url: 'https://www.zara.com/il/he/kids-babygirl-l87.html?v1=2421860'
  },
  {
    id: 'clothing-girls-big',
    name: Category.CLOTHING,
    gender: 'Kids',
    age: '6-14',
    url: 'https://www.zara.com/il/he/kids-girl-l323.html?v1=2425905'
  },
  {
    id: 'clothing-boys-small',
    name: Category.CLOTHING,
    gender: 'Kids',
    age: '1.5-6',
    url: 'https://www.zara.com/il/he/kids-babyboy-l5.html?v1=2422499'
  },
  {
    id: 'clothing-boys-big',
    name: Category.CLOTHING,
    gender: 'Kids',
    age: '6-14',
    url: 'https://www.zara.com/il/he/kids-boy-l173.html?v1=2426469'
  },
  {
    id: 'clothing-babies',
    name: Category.CLOTHING,
    gender: 'Babies',
    age: '0-18',
    url: 'https://www.zara.com/il/he/kids-baby-l7244.html?v1=2428025'
  }
  // Add more categories as needed
];

const BASE_URL = 'https://www.zara.com';

class ZaraScraper extends BaseScraper {
  protected readonly scraperName = 'Zara';
  protected readonly source = 'Zara';

  protected getCategories(): CategoryType[] {
    return CATEGORIES;
  }

  protected async scrapeCategory(category: CategoryType): Promise<Product[]> {
    return this.scrapeZaraCategory(category);
  }

  
  private async fetchZaraPage(url: string): Promise<string> {
    return fetchPageWithBrowser(url, {
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
      waitUntil: 'domcontentloaded',
      timeout: 60000,
      extraHeaders: {
        'Accept-Language': 'en-US,en;q=0.9',
      },
      onPageReady: async (page) => {
        // Wait for cookie popup and click accept if visible
        await handleCookieConsent(page, ['button.onetrust-close-btn-handler']);
      }
    });
  }

  /**
   * Extracts product data from <script type="application/ld+json"> tags
   */
  private extractProductsFromLdJson(html: string): any[] {
    const $ = cheerio.load(html);
    let products: any[] = [];
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const json = JSON.parse($(el).html() || '{}');
        if (json['@type'] === 'ItemList' && Array.isArray(json.itemListElement)) {
          for (const item of json.itemListElement) {
            if (item.item && item.item['@type'] === 'Product') {
              products.push(item.item);
            }
          }
        }
      } catch (e) {
        // Ignore parse errors
      }
    });
    return products;
  }

  private extractColorsAndPricesFromDom($: cheerio.CheerioAPI, productCard: cheerio.Cheerio<any>): { colors: string[], price: number | null, oldPrice: number | null } {
    // Extract all color bubbles (if multiple colors are shown)
    const colorBubbles = productCard.find('.product-grid-product-info-colors__bubble[aria-label]');
    let colors: string[] = [];
    colorBubbles.each((_, el) => {
      const color = $(el).attr('aria-label');
      if (color) colors = [...colors, ...color.trim().split(' / ')];
    });

    // Extract current price (always present)
    const priceElem = productCard.find('.price-current__amount .money-amount__main, .price__amount .money-amount__main').first();
    let price: number | null = null;
    if (priceElem && priceElem.text()) {
      const match = priceElem.text().replace(',', '').match(/[\d.]+/g);
      price = match ? parseFloat(match[0]) : null;
    }

    // Extract old price (if on sale)
    const oldPriceElem = productCard.find('.price-old__amount .money-amount__main').first();
    let oldPrice: number | null = null;
    if (oldPriceElem && oldPriceElem.text()) {
      const match = oldPriceElem.text().replace(',', '').match(/[\d.]+/g);
      oldPrice = match ? parseFloat(match[0]) : null;
    }

    colors = Array.from(new Set(colors));

    return { colors, price, oldPrice };
  }

  private parseZaraProduct(product: any, category: CategoryType, $: cheerio.CheerioAPI): Product | undefined {
    // product: { name, image, offers, url, ... }
    const title = product.name || '';
    if (!title){
        console.error("product with no title", product);
        return undefined;
    } 
    // else {
    //     console.log({
    //         product
    //     })
    // }
    
    const url = product.offers.url;
    const images = [product.image];

    // Find the product card in the DOM by URL
    const productCard = $(`a[href='${url}']`).closest('li.product-grid-product') as cheerio.Cheerio<any>;

    // Extract colors and prices from DOM
    const { colors, price, oldPrice } = this.extractColorsAndPricesFromDom($, productCard);
    let currency = 'ILS';
    // Fallback to ld+json if not found in DOM
    let fallbackPrice = null;
    let fallbackOldPrice = null;
    if (product.offers) {
      fallbackPrice = product.offers.price ? Number(product.offers.price) : null;
      fallbackOldPrice = product.offers.priceSpecification?.originalPrice ? Number(product.offers.priceSpecification?.originalPrice) : null;
      currency = product.offers.priceCurrency || 'ILS';
    }

    const brand = normalizeBrandName(product.brand?.name || 'Zara');
    const categories = [category.name, ...extractCategory(title)];
    const gender = category.gender;
    const productJson = {
        title,
        url,
        images,
        colors: extractColorsWithHebrew(title, colors, 'zara_scraper'),
        isSellingFast: false,
        price: fallbackPrice,
        oldPrice: oldPrice ?? fallbackOldPrice,
        salePercent: calcSalePercent(fallbackPrice, oldPrice ?? fallbackOldPrice) ?? 0,
        currency,
        brand,
        categories,
        gender,
      };

    // console.log(productJson);
    return this.createProduct(productJson);
  }

  private async scrapeZaraCategory(category: CategoryType): Promise<Product[]> {
    let page = 1;
    let allProducts: Product[] = [];
    let hasMore = true;
    let prevPageUrls: string[] = [];
    const MAX_PAGES = 100;
    while (hasMore && page <= MAX_PAGES) {
      const url = `${category.url}${page > 1 ? `?page=${page}` : ''}`;
      this.logProgress(`Fetching ${url}`);
      const html = await this.fetchZaraPage(url);
      const $ = cheerio.load(html);
      // Attach cheerio instance to category for color extraction
      (category as any).cheerioInstance = $;
      const products = this.extractProductsFromLdJson(html);
      this.logProgress(`extractProductsFromLdJson found: ${products.length} products`);
      if (!products.length) break;
      const pageProducts = products.map((p: any) => this.parseZaraProduct(p, category, $)).filter(Boolean) as Product[];
      const pageUrls = pageProducts.map(p => p.url);
    //   // If all URLs are the same as previous page, stop
    //   if (prevPageUrls.length && pageUrls.length && prevPageUrls.join(',') === pageUrls.join(',')) {
    //     hasMore = false;
    //     break;
    //   }
      allProducts.push(...pageProducts);
      prevPageUrls = pageUrls;
      // If less than 9 products, it's the last page (Zara paginates by 9)
      hasMore = products.length >= 9;
      page++;
    }
    return allProducts;
  }
}

// Main function
async function main() {
  const scraper = new ZaraScraper();
  await scraper.run();
}

// CLI entry point
if (require.main === module) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

export { main, ZaraScraper }; 