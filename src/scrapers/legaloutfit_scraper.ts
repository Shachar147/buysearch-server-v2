import {
  fetchPageWithBrowser,
  handleCookieConsent,
} from './base/browser-helpers';
import * as cheerio from 'cheerio';
import { BaseScraper } from './base/base-scraper';
import { Category as CategoryType } from './base/base-scraper';
import { Category } from '../category.constants';
import {
  Product,
  calcSalePercent,
  normalizeBrandName,
  extractCategory,
} from './base/scraper_utils';
import { extractColorsWithHebrew } from '../color.constants';
import * as dotenv from 'dotenv';
dotenv.config();

const CATEGORIES: CategoryType[] = [
  {
    id: 'shirts',
    name: Category.T_SHIRTS,
    gender: 'Women',
    url: 'https://www.legaloutfit.co.il/en/collections/%D7%97%D7%95%D7%9C%D7%A6%D7%95%D7%AA',
  },
  {
    id: 'pants',
    name: Category.PANTS,
    gender: 'Women',
    url: 'https://www.legaloutfit.co.il/en/collections/%D7%9E%D7%9B%D7%A0%D7%A1%D7%99%D7%99%D7%9D-%D7%95%D7%97%D7%A6%D7%90%D7%99%D7%95%D7%AA',
  },
  {
    id: 'dresses',
    name: Category.DRESSES,
    gender: 'Women',
    url: 'https://www.legaloutfit.co.il/en/collections/%D7%A9%D7%9E%D7%9C%D7%95%D7%AA',
  },
  {
    id: 'matching-suits',
    name: Category.SETS,
    gender: 'Women',
    url: 'https://www.legaloutfit.co.il/en/collections/%D7%97%D7%9C%D7%99%D7%A4%D7%95%D7%AA',
  },
  {
    id: 'skirts',
    name: Category.SKIRTS,
    gender: 'Women',
    url: 'https://www.legaloutfit.co.il/en/collections/%D7%97%D7%A6%D7%90%D7%99%D7%95%D7%AA',
  },
  {
    id: 'jumpsuits',
    name: Category.OVERALLS,
    gender: 'Women',
    url: 'https://www.legaloutfit.co.il/en/collections/%D7%90%D7%95%D7%91%D7%A8%D7%95%D7%9C%D7%99%D7%9D',
  },
  {
    id: 'jewelry',
    name: Category.JEWELRY,
    gender: 'Women',
    url: 'https://www.legaloutfit.co.il/en/collections/%D7%AA%D7%9B%D7%A9%D7%99%D7%98%D7%99%D7%9D',
  },
  {
    id: 'lingerie',
    name: Category.LINGERIE,
    gender: 'Women',
    url: 'https://www.legaloutfit.co.il/en/collections/%D7%94%D7%9C%D7%91%D7%A9%D7%94-%D7%AA%D7%97%D7%AA%D7%95%D7%A0%D7%94',
  },
  {
    id: 'jackets-coats',
    name: Category.JACKETS_COATS,
    gender: 'Women',
    url: 'https://www.legaloutfit.co.il/en/collections/%D7%92%D7%A7%D7%98%D7%99%D7%9D-%D7%95%D7%9E%D7%A2%D7%99%D7%9C%D7%99%D7%9D',
  },
  {
    id: 'sale',
    name: 'Sale',
    gender: 'Women',
    url: 'https://www.legaloutfit.co.il/en/collections/sale',
  },
  {
    id: 'new',
    name: 'New',
    gender: 'Women',
    url: 'https://www.legaloutfit.co.il/en/collections/new',
  },
  {
    id: 'basics-1-1',
    name: Category.CLOTHING,
    gender: 'Women',
    url: 'https://www.legaloutfit.co.il/en/collections/%D7%97%D7%95%D7%9C%D7%A6%D7%95%D7%AA-%D7%91%D7%94%D7%98%D7%91%D7%94',
  },
  {
    id: 'legaloutfit-x-hental',
    name: Category.CLOTHING,
    gender: 'Women',
    url: 'https://www.legaloutfit.co.il/en/collections/hental-x-legaloutfit-1',
  },
];

const BASE_URL = 'https://www.legaloutfit.co.il';

class LegaloutfitScraper extends BaseScraper {
  protected readonly scraperName = 'Legaloutfit';
  protected readonly source = 'Legaloutfit';

  protected getCategories(): CategoryType[] {
    return CATEGORIES;
  }

  protected async scrapeCategory(category: CategoryType): Promise<Product[]> {
    return this.scrapeLegaloutfitCategory(category);
  }

  private async fetchLegaloutfitPage(url: string): Promise<string> {
    return fetchPageWithBrowser(url, {
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
      waitUntil: 'domcontentloaded',
      timeout: 60000,
      onPageReady: async (page) => {
        // Handle cookie consent
        // Custom page logic can be added here
        await handleCookieConsent(page, [
          'button',
          'button.onetrust-close-btn-handler',
        ]);
      },
    });
  }

  private parseLegaloutfitProduct(
    productCard: cheerio.Cheerio<any>,
    category: CategoryType,
    $: cheerio.CheerioAPI,
  ): Product | undefined {
    try {
      // Extract title
      const title = productCard.find('.product-title').text().trim();
      if (!title) {
        console.error('Product with no title', productCard.html());
        return undefined;
      }

      // Extract URL
      const url = productCard.find('a.product-card__media').attr('href');
      if (!url) {
        console.error('Product with no URL', title);
        return undefined;
      }
      const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;

      // Extract images
      const images: string[] = [];
      productCard.find('img.product-card__image').each((_, img) => {
        const src = $(img).attr('src');
        if (src) {
          images.push(src.startsWith('//') ? `https:${src}` : src);
        }
      });

      // Extract sale price (current price)
      const salePriceElement = productCard.find('sale-price .money').first();
      const salePriceText = salePriceElement.text().trim();
      let price: number | null = null;
      if (salePriceText) {
        const match = salePriceText.replace(/[₪,]/g, '').match(/[\d.]+/);
        price = match ? parseFloat(match[0]) : null;
      }

      // Extract compare-at price (original price)
      const comparePriceElement = productCard
        .find('compare-at-price .money')
        .first();
      const comparePriceText = comparePriceElement.text().trim();
      let oldPrice: number | null = null;
      if (comparePriceText) {
        const match = comparePriceText.replace(/[₪,]/g, '').match(/[\d.]+/);
        oldPrice = match ? parseFloat(match[0]) : null;
      }

      // If no sale price found, try to get regular price from price-list
      if (!price) {
        const regularPriceElement = productCard
          .find('price-list .money')
          .first();
        const regularPriceText = regularPriceElement.text().trim();
        if (regularPriceText) {
          const match = regularPriceText.replace(/[₪,]/g, '').match(/[\d.]+/);
          price = match ? parseFloat(match[0]) : null;
        }
      }

      // Extract colors from title and images
      const colors = extractColorsWithHebrew(title, [], 'legaloutfit_scraper');

      // Determine brand (Legaloutfit is the main brand)
      const brand = normalizeBrandName('Legaloutfit');

      // Extract categories
      const categories = [category.name, ...extractCategory(title)];
      const gender = category.gender;

      const productJson = {
        title,
        url: fullUrl,
        images,
        colors,
        isSellingFast: false,
        price,
        oldPrice,
        salePercent: calcSalePercent(price, oldPrice) ?? 0,
        currency: 'ILS',
        brand,
        categories,
        gender,
      };

      if (!title || !fullUrl || !price) {
        console.error(
          'Product with no title, URL, or price',
          productCard.html(),
        );
        return;
      }

      return this.createProduct(productJson);
    } catch (error) {
      console.error('Error parsing product:', error);
      return undefined;
    }
  }

  private async scrapeLegaloutfitCategory(
    category: CategoryType,
  ): Promise<Product[]> {
    let page = 1;
    const allProducts: Product[] = [];
    let hasMore = true;
    const MAX_PAGES = 50; // Reasonable limit

    while (hasMore && page <= MAX_PAGES) {
      const url = page === 1 ? category.url : `${category.url}?page=${page}`;
      this.logProgress(`Fetching ${url}`);

      try {
        const html = await this.fetchLegaloutfitPage(url);
        const $ = cheerio.load(html);

        // Find all product cards
        const productCards = $('product-card.product-card');

        if (productCards.length === 0) {
          this.logProgress(
            `No products found on page ${page}, stopping pagination`,
          );
          break;
        }

        this.logProgress(
          `Found ${productCards.length} products on page ${page}`,
        );

        const pageProducts: Product[] = [];
        productCards.each((_, card) => {
          const product = this.parseLegaloutfitProduct($(card), category, $);
          if (product) {
            pageProducts.push(this.createProduct(product));
          }
        });

        allProducts.push(...pageProducts);

        // Check if there's a next page
        const nextPageLink = $(
          'a[aria-label*="page"][aria-label*="' + (page + 1) + '"]',
        );
        const hasNextPage = nextPageLink.length > 0;

        if (!hasNextPage && pageProducts.length === 0) {
          hasMore = false;
        } else if (!hasNextPage) {
          // If no next page link but we found products, this might be the last page
          hasMore = false;
        }

        page++;

        // Add a small delay to be respectful to the server
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        this.logError(
          `Error scraping page ${page} for category ${category.name}:`,
          error,
        );
        break;
      }
    }

    this.logProgress(
      `Total products found in ${category.name}: ${allProducts.length}`,
    );
    return allProducts;
  }
}

// Main function
async function main() {
  const scraper = new LegaloutfitScraper();
  await scraper.run();
}

// CLI entry point
if (require.main === module) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

export { main, LegaloutfitScraper };
