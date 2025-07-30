import * as cheerio from 'cheerio';
import { BaseScraper, Category as CategoryType } from './base/base-scraper';
import {
  Product,
  calcSalePercent,
  normalizeBrandName,
} from './base/scraper_utils';
import * as dotenv from 'dotenv';
import { Category } from '../category.constants';
import { fetchPageWithBrowser } from './base/browser-helpers';
import { extractColorsWithHebrew } from '../color.constants';
dotenv.config();

const CATEGORIES: CategoryType[] = [
  {
    id: 'mens-tshirts',
    name: Category.T_SHIRTS,
    gender: 'Men',
    url: 'https://storyonline.co.il/collections/%D7%92%D7%91%D7%A8%D7%99%D7%9D-%D7%91%D7%99%D7%92%D7%95%D7%93-%D7%98%D7%99-%D7%A9%D7%99%D7%A8%D7%98%D7%99%D7%9D',
  },
  {
    id: 'mens-tshirts',
    name: Category.T_SHIRTS,
    gender: 'Men',
    url: 'https://storyonline.co.il/collections/%D7%92%D7%91%D7%A8%D7%99%D7%9D-%D7%91%D7%99%D7%92%D7%95%D7%93-%D7%97%D7%95%D7%9C%D7%A6%D7%95%D7%AA-1',
  },
  {
    id: 'mens-shirts',
    name: Category.SHIRTS,
    gender: 'Men',
    url: 'https://storyonline.co.il/collections/%D7%92%D7%91%D7%A8%D7%99%D7%9D-%D7%91%D7%99%D7%92%D7%95%D7%93-%D7%97%D7%95%D7%9C%D7%A6%D7%95%D7%AA-%D7%9E%D7%9B%D7%95%D7%A4%D7%AA%D7%A8%D7%95%D7%AA',
  },
  {
    id: 'mens-swimwear',
    name: Category.SWIMWEAR,
    gender: 'Men',
    url: 'https://storyonline.co.il/collections/%D7%92%D7%91%D7%A8%D7%99%D7%9D-%D7%91%D7%99%D7%92%D7%95%D7%93-%D7%91%D7%92%D7%93%D7%99-%D7%99%D7%9D',
  },
  {
    id: 'mens-sale',
    name: 'Sale',
    gender: 'Men',
    url: 'https://storyonline.co.il/collections/summer-sale-2025-men',
  },
  {
    id: 'mens-new',
    name: 'New',
    gender: 'Men',
    url: 'https://storyonline.co.il/collections/%D7%92%D7%91%D7%A8%D7%99%D7%9D-%D7%97%D7%93%D7%A9-%D7%9B%D7%9C-%D7%94%D7%9E%D7%95%D7%A6%D7%A8%D7%99%D7%9D',
  },
  {
    id: 'mens-jeans',
    name: Category.JEANS,
    gender: 'Men',
    url: 'https://storyonline.co.il/collections/%D7%92%D7%91%D7%A8%D7%99%D7%9D-%D7%91%D7%99%D7%92%D7%95%D7%93-%D7%92%D7%99%D7%A0%D7%A1%D7%99%D7%9D',
  },
  {
    id: 'mens-sweaters',
    name: Category.SWEATERS,
    gender: 'Men',
    url: 'https://storyonline.co.il/collections/%D7%92%D7%91%D7%A8%D7%99%D7%9D-%D7%91%D7%99%D7%92%D7%95%D7%93-%D7%A1%D7%95%D7%95%D7%98%D7%A9%D7%99%D7%A8%D7%98%D7%99%D7%9D',
  },
  {
    id: 'mens-jackets',
    name: Category.JACKETS_COATS,
    gender: 'Men',
    url: 'https://storyonline.co.il/collections/%D7%92%D7%91%D7%A8%D7%99%D7%9D-%D7%91%D7%99%D7%92%D7%95%D7%93-%D7%9E%D7%A2%D7%99%D7%9C%D7%99%D7%9D-%D7%92%D7%A7%D7%98%D7%99%D7%9D',
  },
  {
    id: 'mens-shoes',
    name: Category.SHOES,
    gender: 'Men',
    url: 'https://storyonline.co.il/collections/%D7%A0%D7%A2%D7%9C%D7%99-%D7%92%D7%91%D7%A8%D7%99%D7%9D-%D7%9B%D7%9C-%D7%94%D7%A0%D7%A2%D7%9C%D7%99%D7%99%D7%9D',
  },
  {
    id: 'mens-accessories',
    name: Category.ACCESSORIES,
    gender: 'Men',
    url: 'https://storyonline.co.il/collections/%D7%92%D7%91%D7%A8%D7%99%D7%9D-%D7%90%D7%91%D7%99%D7%96%D7%A8%D7%99%D7%9D-%D7%9B%D7%9C-%D7%94%D7%9E%D7%95%D7%A6%D7%A8%D7%99%D7%9D',
  },
  // Add more categories as needed
  {
    id: 'women-shoes',
    name: Category.SHOES,
    gender: 'Women',
    url: 'https://storyonline.co.il/collections/%D7%A0%D7%A9%D7%99%D7%9D-%D7%A0%D7%A2%D7%9C%D7%99%D7%99%D7%9D-%D7%9B%D7%9C-%D7%94%D7%9E%D7%95%D7%A6%D7%A8%D7%99%D7%9D',
  },
  {
    id: 'women-tshirts',
    name: Category.T_SHIRTS,
    gender: 'Women',
    url: 'https://storyonline.co.il/collections/%D7%97%D7%95%D7%9C%D7%A6%D7%95%D7%AA-%D7%95%D7%98%D7%95%D7%A4%D7%99%D7%9D-%D7%9C%D7%A0%D7%A9%D7%99%D7%9D',
  },
  {
    id: 'women-tshirts',
    name: Category.T_SHIRTS,
    gender: 'Women',
    url: 'https://storyonline.co.il/collections/%D7%98%D7%99-%D7%A9%D7%99%D7%A8%D7%98%D7%99%D7%9D-%D7%9C%D7%A0%D7%A9%D7%99%D7%9D',
  },
  {
    id: 'women-dresses',
    name: Category.DRESSES,
    gender: 'Women',
    url: 'https://storyonline.co.il/collections/%D7%A0%D7%A9%D7%99%D7%9D-%D7%91%D7%99%D7%92%D7%95%D7%93-%D7%A9%D7%9E%D7%9C%D7%95%D7%AA',
  },
  {
    id: 'women-swimwear',
    name: Category.SWIMWEAR,
    gender: 'Women',
    url: 'https://storyonline.co.il/collections/%D7%A0%D7%A9%D7%99%D7%9D-%D7%91%D7%99%D7%92%D7%95%D7%93-%D7%91%D7%92%D7%93%D7%99-%D7%99%D7%9D',
  },
  {
    id: 'women-pants',
    name: Category.PANTS,
    gender: 'Women',
    url: 'https://storyonline.co.il/collections/%D7%A0%D7%A9%D7%99%D7%9D-%D7%91%D7%99%D7%92%D7%95%D7%93-%D7%9E%D7%9B%D7%A0%D7%A1%D7%99%D7%99%D7%9D',
  },
  {
    id: 'women-jeans',
    name: Category.JEANS,
    gender: 'Women',
    url: 'https://storyonline.co.il/collections/%D7%A0%D7%A9%D7%99%D7%9D-%D7%91%D7%99%D7%92%D7%95%D7%93-%D7%92%D7%99%D7%A0%D7%A1%D7%99%D7%9D',
  },
  {
    id: 'women-skirts',
    name: Category.SKIRTS,
    gender: 'Women',
    url: 'https://storyonline.co.il/collections/%D7%A0%D7%A9%D7%99%D7%9D-%D7%91%D7%99%D7%92%D7%95%D7%93-%D7%97%D7%A6%D7%90%D7%99%D7%95%D7%AA',
  },
  {
    id: 'women-jackets',
    name: Category.JACKETS_COATS,
    gender: 'Women',
    url: 'https://storyonline.co.il/collections/%D7%A0%D7%A9%D7%99%D7%9D-%D7%91%D7%99%D7%92%D7%95%D7%93-%D7%9E%D7%A2%D7%99%D7%9C%D7%99%D7%9D-%D7%92%D7%A7%D7%98%D7%99%D7%9D',
  },
  {
    id: 'women-sweaters',
    name: Category.SWEATERS,
    gender: 'Women',
    url: 'hhttps://storyonline.co.il/collections/%D7%A0%D7%A9%D7%99%D7%9D-%D7%91%D7%99%D7%92%D7%95%D7%93-%D7%A1%D7%95%D7%95%D7%98%D7%A9%D7%99%D7%A8%D7%98%D7%99%D7%9D',
  },
  {
    id: 'women-knitwear',
    name: Category.KNITWEAR,
    gender: 'Women',
    url: 'https://storyonline.co.il/collections/%D7%A0%D7%A9%D7%99%D7%9D-%D7%91%D7%99%D7%92%D7%95%D7%93-%D7%A1%D7%A8%D7%99%D7%92%D7%99%D7%9D',
  },
  {
    id: 'women-clearance',
    name: 'Sale',
    gender: 'Men',
    url: 'https://storyonline.co.il/collections/men-sale',
  },
  {
    id: 'women-clearance',
    name: 'Sale',
    gender: 'Women',
    url: 'https://storyonline.co.il/collections/women-clearance',
  },
];

const BASE_URL = 'https://storyonline.co.il';

class StoryScraper extends BaseScraper {
  protected readonly scraperName = 'Story';
  protected readonly source = 'Story';

  protected getCategories(): CategoryType[] {
    return CATEGORIES;
  }

  protected async scrapeCategory(category: CategoryType): Promise<Product[]> {
    return this.scrapeStoryCategory(category);
  }

  private async fetchStoryPage(url: string): Promise<string> {
    return fetchPageWithBrowser(url, {
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
      waitUntil: 'networkidle2',
      timeout: 60000,
      onPageReady: async (page) => {
        // Custom page logic can be added here
      },
    });
  }

  private parseStoryProduct(
    productElem: cheerio.Cheerio<any>,
    category: CategoryType,
    $: cheerio.CheerioAPI,
  ): Product | undefined {
    // Extract product info from the product element
    const title = productElem
      .find('.product-title, .card__heading')
      .text()
      .trim();
    const url = BASE_URL + (productElem.find('a').attr('href') || '');
    const images = [productElem.find('img').attr('src') || ''].filter(Boolean);
    const priceText = productElem
      .find('.price-item--regular, .price__regular')
      .first()
      .text()
      .replace(/[^\d.]/g, '');
    const price = priceText ? parseFloat(priceText) : null;
    const oldPriceText = productElem
      .find('.price-item--sale, .price__sale')
      .first()
      .text()
      .replace(/[^\d.]/g, '');
    const oldPrice = oldPriceText ? parseFloat(oldPriceText) : null;
    const salePercent = calcSalePercent(price, oldPrice) ?? 0;
    const currency = 'ILS';
    // Try to extract brand from .caption-with-letter-spacing or .caption-with-letter-spacing.light
    let brand = productElem
      .find('.caption-with-letter-spacing, .caption-with-letter-spacing.light')
      .text()
      .trim();
    if (!brand) {
      brand = productElem.find('.product-vendor, .card__vendor').text().trim();
    }
    brand = normalizeBrandName(brand || 'Story');

    const categories = [category.name];

    const gender = category.gender;
    if (!title || !url) return undefined;
    return this.createProduct({
      title,
      url,
      images,
      colors: extractColorsWithHebrew(title, [], 'story_scraper'),
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

  private async scrapeStoryCategory(
    category: CategoryType,
  ): Promise<Product[]> {
    let page = 1;
    const allProducts: Product[] = [];
    let hasMore = true;
    while (hasMore) {
      const url = `${category.url}${page > 1 ? `?page=${page}` : ''}`;
      this.logProgress(`Fetching ${url}`);
      const html = await this.fetchStoryPage(url);
      const $ = cheerio.load(html);
      const productElems = $('.product-card, .card--product');
      if (!productElems.length) break;
      const pageProducts = productElems
        .map((_, el) => this.parseStoryProduct($(el), category, $))
        .get()
        .filter(Boolean) as Product[];
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
  const scraper = new StoryScraper();
  await scraper.run();
}

// CLI entry point
if (require.main === module) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

export { main, StoryScraper };
