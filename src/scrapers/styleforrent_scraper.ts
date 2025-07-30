import { fetchPageWithBrowser } from './base/browser-helpers';
import * as cheerio from 'cheerio';
import { BaseScraper } from './base/base-scraper';
import { Category as CategoryType } from './base/base-scraper';
import {
  Product,
  extractCategory,
  normalizeBrandName,
} from './base/scraper_utils';
import { extractColorsWithHebrew } from '../color.constants';
import * as dotenv from 'dotenv';
import { Category } from '../category.constants';
dotenv.config();

const CATEGORIES: CategoryType[] = [
  {
    id: 'sale',
    name: 'Sale',
    gender: 'Women',
    url: 'https://styleforrent.co.il/collections/sale-1',
  },
  {
    id: 'new',
    name: 'New',
    gender: 'Women',
    url: 'https://styleforrent.co.il/collections/online-only',
  },
  {
    id: 'suits-sets',
    name: Category.SUITS,
    gender: 'Women',
    url: 'https://styleforrent.co.il/collections/%D7%97%D7%9C%D7%99%D7%A4%D7%95%D7%AA-%D7%95%D7%A1%D7%98%D7%99%D7%9D',
  },
  {
    id: 'dresses',
    name: Category.DRESSES,
    gender: 'Women',
    url: 'https://styleforrent.co.il/collections/dresses',
  },
  {
    id: 'overalls',
    name: Category.OVERALLS,
    gender: 'Women',
    url: 'https://styleforrent.co.il/collections/jumpsuit',
  },
  {
    id: 'jeans',
    name: Category.JEANS,
    gender: 'Women',
    url: 'https://styleforrent.co.il/collections/%D7%92%D7%99%D7%A0%D7%A1%D7%99%D7%9D',
  },
  {
    id: 'pants',
    name: Category.PANTS,
    gender: 'Women',
    url: 'https://styleforrent.co.il/collections/%D7%9E%D7%9B%D7%A0%D7%A1%D7%99%D7%99%D7%9D',
  },
  {
    id: 'skirts-shorts',
    name: Category.SKIRTS,
    gender: 'Women',
    url: 'https://styleforrent.co.il/collections/%D7%97%D7%A6%D7%90%D7%99%D7%95%D7%AA',
  },
  {
    id: 'shirts',
    name: Category.SHIRTS,
    gender: 'Women',
    url: 'https://styleforrent.co.il/collections/%D7%9E%D7%9B%D7%95%D7%A4%D7%AA%D7%A8%D7%95%D7%AA',
  },
  {
    id: 'tops-bodysuits',
    name: Category.BODYSUITS,
    gender: 'Women',
    url: 'https://styleforrent.co.il/collections/%D7%92%D7%95%D7%A4%D7%99%D7%95%D7%AA-%D7%91%D7%92%D7%93%D7%99-%D7%92%D7%95%D7%A3-%D7%98%D7%95%D7%A4%D7%99%D7%9D',
  },
  {
    id: 'jackets-coats',
    name: Category.JACKETS_COATS,
    gender: 'Women',
    url: 'https://styleforrent.co.il/collections/jackets-coats',
  },
  {
    id: 'basic',
    name: 'New',
    gender: 'Women',
    url: 'https://styleforrent.co.il/collections/basic',
  },
  {
    id: 'govana',
    name: Category.BY_BRAND,
    brand: 'Govana',
    gender: 'Women',
    url: 'https://styleforrent.co.il/collections/govana',
  },
  {
    id: 'bat-7',
    brand: 'Bat 7',
    name: Category.BY_BRAND,
    gender: 'Women',
    url: 'https://styleforrent.co.il/collections/%D7%91%D7%AA-%D7%A9%D7%91%D7%A2-7',
  },
  {
    id: 'tiago',
    brand: 'Tiago',
    name: Category.BY_BRAND,
    gender: 'Women',
    url: 'https://styleforrent.co.il/collections/tiago',
  },
  {
    id: 'sfr-exclusive',
    name: Category.BY_BRAND,
    brand: 'SFR Exclusive',
    gender: 'Women',
    url: 'https://styleforrent.co.il/collections/exclusive',
  },
  {
    id: 'toya-beachwear',
    name: Category.BY_BRAND,
    brand: 'Toya Beachwear',
    gender: 'Women',
    url: 'https://styleforrent.co.il/collections/toya',
  },
];

const BASE_URL = 'https://styleforrent.co.il';

class StyleForRentScraper extends BaseScraper {
  protected readonly scraperName = 'StyleForRent';
  protected readonly source = 'StyleForRent';

  protected getCategories(): CategoryType[] {
    return CATEGORIES;
  }

  protected async scrapeCategory(category: CategoryType): Promise<Product[]> {
    return this.scrapeStyleForRentCategory(category);
  }

  private async fetchStyleForRentPage(url: string): Promise<string> {
    return fetchPageWithBrowser(url, {
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
      waitUntil: 'domcontentloaded',
      timeout: 60000,
      onPageReady: async (page) => {
        // Wait for the product grid to load
        await page
          .waitForSelector('.grid__item', { timeout: 10000 })
          .catch(() => {
            console.log('No products found on page, might be the last page');
          });

        // Small delay to ensure dynamic content loads
        await new Promise((resolve) => setTimeout(resolve, 2000));
      },
    });
  }

  private parseStyleForRentProduct(
    $: cheerio.CheerioAPI,
    productCard: any,
    category: CategoryType,
  ): Product | undefined {
    const $card = $(productCard);

    // Extract title
    const title = $card.find('.card__heading a').first().text().trim();
    if (!title) {
      return undefined;
    }

    // Extract URL
    const relativeUrl = $card.find('.card__heading a').first().attr('href');
    const url = relativeUrl ? `${BASE_URL}${relativeUrl}` : '';
    if (!url) {
      return undefined;
    }

    // Extract images
    const images: string[] = [];
    $card.find('.media img').each((_, img) => {
      const srcset = $(img).attr('srcset');
      if (srcset) {
        // Get the largest image from srcset
        const matches = srcset.match(/([^\s]+)\s+\d+w/g);
        if (matches && matches.length > 0) {
          matches[matches.length - 1].split(' ').forEach((lastImage) => {
            if (!images.includes(lastImage) && lastImage != '') {
              if (lastImage.startsWith(',')) {
                lastImage = lastImage.substring(1, lastImage.length);
              }
              if (lastImage.startsWith('//')) {
                lastImage = `http:${lastImage}`;
              }
              lastImage = lastImage.split('?')[0].split(',').join('%2C');
              // console.log(lastImage);
              images.push(lastImage);
            }
          });
        }
      }
    });

    // Extract price information
    let price: number | null = null;
    let oldPrice: number | null = null;

    const priceContainer = $card.find('.price');
    const isOnSale = priceContainer.hasClass('price--on-sale');

    if (isOnSale) {
      // For sale items, old price is in <s> tag, sale price is in .price-item--sale
      const oldPriceText = priceContainer.find('s .money').first().text();
      const salePriceText = priceContainer
        .find('.price-item--sale .money')
        .first()
        .text();

      const oldPriceMatch = oldPriceText.match(/[\d,.]+/);
      if (oldPriceMatch) {
        oldPrice = parseFloat(oldPriceMatch[0].replace(/,/g, ''));
      }

      const salePriceMatch = salePriceText.match(/[\d,.]+/);
      if (salePriceMatch) {
        price = parseFloat(salePriceMatch[0].replace(/,/g, ''));
      }
    } else {
      // For regular items, price is in .price-item--regular
      const regularPriceText = priceContainer
        .find('.price-item--regular .money')
        .first()
        .text();
      const regularPriceMatch = regularPriceText.match(/[\d,.]+/);
      if (regularPriceMatch) {
        price = parseFloat(regularPriceMatch[0].replace(/,/g, ''));
      }
    }

    // Extract sale percentage
    const salePercentText = $card
      .find('.badge.price__badge-sale')
      .text()
      .trim();
    let salePercent = 0;
    if (salePercentText) {
      const match = salePercentText.match(/(\d+)%/);
      if (match) {
        salePercent = parseInt(match[1], 10);
      }
    }

    // Extract brand from category if it's a brand category
    // const brand = normalizeBrandName(
    //   ['GOVANA', 'BAT 7', 'TIAGO', 'SFR EXCLUSIVE', 'TOYA BEACHWEAR'].includes(category.name)
    //     ? category.name
    //     : 'Style For Rent'
    // );
    const brand = category.brand
      ? normalizeBrandName(category.brand)
      : 'Style For Rent';

    // Create product object
    const productJson = {
      title,
      url,
      images,
      colors: extractColorsWithHebrew(title, [], 'styleforrent_scraper'),
      isSellingFast: false,
      price,
      oldPrice,
      salePercent,
      currency: 'ILS',
      brand,
      categories: [category.name, ...extractCategory(title)],
      gender: category.gender,
    };

    return this.createProduct(productJson);
  }

  private async scrapeStyleForRentCategory(
    category: CategoryType,
  ): Promise<Product[]> {
    let page = 1;
    const allProducts: Product[] = [];
    let hasMore = true;
    const MAX_PAGES = 20;

    while (hasMore && page <= MAX_PAGES) {
      const url = `${category.url}${page > 1 ? `?page=${page}` : ''}`;
      this.logProgress(`Fetching ${url}`);

      const html = await this.fetchStyleForRentPage(url);
      const $ = cheerio.load(html);

      const productCards = $('.grid__item');
      if (productCards.length === 0) {
        break;
      }

      const pageProducts = productCards
        .map((_, card) => this.parseStyleForRentProduct($, card, category))
        .get()
        .filter((p): p is Product => p !== undefined);

      if (pageProducts.length === 0) {
        break;
      }

      allProducts.push(...pageProducts);

      //   // Check if tshere's a next page by looking for pagination
      //   const nextPageExists = $('a.pagination__item[aria-label="Next"]').length > 0;
      //   hasMore = nextPageExists;
      hasMore = pageProducts.length >= 24;

      page++;
    }

    return allProducts;
  }
}

// Main function
async function main() {
  const scraper = new StyleForRentScraper();
  await scraper.run();
}

// CLI entry point
if (require.main === module) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

export { main, StyleForRentScraper };
