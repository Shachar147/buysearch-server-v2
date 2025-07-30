import { fetchPageWithBrowser } from './base/browser-helpers';
import * as cheerio from 'cheerio';
import { BaseScraper } from './base/base-scraper';
import { Category as CategoryType } from './base/base-scraper';
import { Product, normalizeBrandName } from './base/scraper_utils';
import * as dotenv from 'dotenv';
import { Category } from '../category.constants';
import { ucfirst } from '../search/search.utils';
import { extractColorsWithHebrew } from '../color.constants';
dotenv.config();

const CATEGORIES: CategoryType[] = [
  {
    id: 'men-swimwear',
    name: Category.SWIMWEAR,
    gender: 'Men',
    url: 'https://www.gant.co.il/product-category/%D7%92%D7%91%D7%A8%D7%99%D7%9D/%D7%91%D7%92%D7%93%D7%99-%D7%99%D7%9D-%D7%92%D7%91%D7%A8%D7%99%D7%9D/?_gl=1*o8uob1*_up*MQ..*_gs*MQ..&gbraid=0AAAAACo76E5nnVoUyMqw6QW3DOXlsMaS8',
    categoryId: 2204
  },
  {
    id: 'men-shirts',
    name: Category.SHIRTS,
    gender: 'Men',
    url: 'https://www.gant.co.il/product-category/%D7%92%D7%91%D7%A8%D7%99%D7%9D/%D7%97%D7%95%D7%9C%D7%A6%D7%95%D7%AA-%D7%9E%D7%9B%D7%95%D7%A4%D7%AA%D7%A8%D7%95%D7%AA-%D7%92%D7%91%D7%A8%D7%99%D7%9D',
    categoryId: 1989
  },
  {
    id: 'men-tshirts',
    name: Category.T_SHIRTS,
    gender: 'Men',
    url: 'https://www.gant.co.il/product-category/%d7%92%d7%91%d7%a8%d7%99%d7%9d/%d7%97%d7%95%d7%9c%d7%a6%d7%95%d7%aa-%d7%98%d7%99-%d7%a9%d7%99%d7%a8%d7%98-%d7%92%d7%91%d7%a8%d7%99%d7%9d/',
    categoryId: 1961
  },
  {
    id: 'men-underwear',
    name: Category.UNDERWEAR,
    gender: 'Men',
    url: 'https://www.gant.co.il/product-category/%d7%92%d7%91%d7%a8%d7%99%d7%9d/%d7%aa%d7%97%d7%aa%d7%95%d7%a0%d7%99%d7%9d-%d7%92%d7%91%d7%a8%d7%99%d7%9d/',
    categoryId: 2014
  },
  {
    id: 'men-accessories',
    name: Category.ACCESSORIES,
    gender: 'Men',
    url: 'https://www.gant.co.il/product-category/%d7%92%d7%91%d7%a8%d7%99%d7%9d/%d7%90%d7%91%d7%99%d7%96%d7%a8%d7%99%d7%9d-%d7%95%d7%94%d7%9c%d7%91%d7%a9%d7%94-%d7%aa%d7%97%d7%aa%d7%95%d7%a0%d7%94-%d7%92%d7%91%d7%a8%d7%99%d7%9d/',
    categoryId: 1990
  },
  {
    id: 'men-shoes',
    name: Category.SHOES,
    gender: 'Men',
    url: 'https://www.gant.co.il/product-category/%d7%92%d7%91%d7%a8%d7%99%d7%9d/%d7%94%d7%a0%d7%a2%d7%9c%d7%94-%d7%92%d7%91%d7%a8%d7%99%d7%9d/%d7%9b%d7%9c-%d7%94%d7%a0%d7%a2%d7%9c%d7%99%d7%99%d7%9d-%d7%92%d7%91%d7%a8%d7%99%d7%9d/',
    categoryId: 2395
  },
  {
    id: 'men-sale',
    name: 'Sale',
    gender: 'Men',
    url: 'https://www.gant.co.il/product-category/sale/sale-men/',
    categoryId: 2150
  },
  {
    id: 'women-sale',
    name: 'Sale',
    gender: 'Women',
    url: 'https://www.gant.co.il/product-category/sale/sale-women/',
    categoryId: 2151
  },
  {
    id: 'men-new',
    name: 'New',
    gender: 'Men',
    url: 'https://www.gant.co.il/product-category/%d7%92%d7%91%d7%a8%d7%99%d7%9d/new-arrivals-%d7%92%d7%91%d7%a8%d7%99%d7%9d/',
    categoryId: 2204,
  },
  {
    id: 'men-knitwear',
    name: Category.KNITWEAR,
    gender: 'Men',
    url: 'https://www.gant.co.il/product-category/%d7%92%d7%91%d7%a8%d7%99%d7%9d/%d7%a1%d7%a8%d7%99%d7%92%d7%99%d7%9d-%d7%92%d7%91%d7%a8%d7%99%d7%9d/'
  },
  {
    id: 'men-shorts',
    name: Category.SHORTS,
    gender: 'Men',
    url: 'https://www.gant.co.il/product-category/%d7%92%d7%91%d7%a8%d7%99%d7%9d/%d7%9e%d7%9b%d7%a0%d7%a1%d7%99%d7%99%d7%9d-%d7%a7%d7%a6%d7%a8%d7%99%d7%9d-%d7%92%d7%91%d7%a8%d7%99%d7%9d/'
  },
  {
    id: 'men-jeans',
    name: Category.JEANS,
    gender: 'Men',
    url: 'https://www.gant.co.il/product-category/%d7%92%d7%91%d7%a8%d7%99%d7%9d/%d7%92%d7%99%d7%a0%d7%a1%d7%99%d7%9d-%d7%92%d7%91%d7%a8%d7%99%d7%9d/',
    categoryId: 1978
  },
  {
    id: 'women-knitwear',
    name: Category.KNITWEAR,
    gender: 'Women',
    url: 'https://www.gant.co.il/product-category/%d7%a0%d7%a9%d7%99%d7%9d/%d7%a1%d7%a8%d7%99%d7%92%d7%99%d7%9d-%d7%a0%d7%a9%d7%99%d7%9d/'
  },
  {
    id: 'women-tshirts',
    name: Category.T_SHIRTS,
    gender: 'Women',
    url: 'https://www.gant.co.il/product-category/%d7%a0%d7%a9%d7%99%d7%9d/%d7%97%d7%95%d7%9c%d7%a6%d7%95%d7%aa-%d7%98%d7%99-%d7%a9%d7%99%d7%a8%d7%98-%d7%a0%d7%a9%d7%99%d7%9d/',
    categoryId: 1996
  },
  {
    id: 'women-dresses',
    name: Category.DRESSES,
    gender: 'Women',
    url: 'https://www.gant.co.il/product-category/%d7%a0%d7%a9%d7%99%d7%9d/%d7%a9%d7%9e%d7%9c%d7%95%d7%aa-%d7%a0%d7%a9%d7%99%d7%9d/'
  },
  {
    id: 'women-skirts',
    name: Category.SKIRTS,
    gender: 'Women',
    url: 'https://www.gant.co.il/product-category/%d7%a0%d7%a9%d7%99%d7%9d/%d7%97%d7%a6%d7%90%d7%99%d7%95%d7%aa-%d7%a0%d7%a9%d7%99%d7%9d/'
  },
  {
    id: 'women-pants',
    name: Category.PANTS,
    gender: 'Women',
    url: 'https://www.gant.co.il/product-category/%d7%a0%d7%a9%d7%99%d7%9d/%d7%92%d7%99%d7%a0%d7%a1%d7%99%d7%9d-%d7%95%d7%9e%d7%9b%d7%a0%d7%a1%d7%99%d7%99%d7%9d-%d7%a0%d7%a9%d7%99%d7%9d/',
    categoryId: 1994
  },
  {
    id: 'women-accessories',
    name: Category.ACCESSORIES,
    gender: 'Women',
    url: 'https://www.gant.co.il/product-category/%d7%a0%d7%a9%d7%99%d7%9d/%d7%90%d7%91%d7%99%d7%96%d7%a8%d7%99%d7%9d-%d7%a0%d7%a9%d7%99%d7%9d/',
    categoryId: 1991
  },
  {
    id: 'women-shoes',
    name: Category.SHOES,
    gender: 'Women',
    url: 'https://www.gant.co.il/product-category/%d7%a0%d7%a9%d7%99%d7%9d/%d7%94%d7%a0%d7%a2%d7%9c%d7%94-%d7%a0%d7%a9%d7%99%d7%9d/',
    categoryId: 1988
  },
  {
    id: 'home',
    name: Category.HOME_BATH,
    gender: 'Unisex',
    url: 'https://www.gant.co.il/product-category/%d7%91%d7%99%d7%aa/%d7%97%d7%93%d7%a8-%d7%a8%d7%97%d7%a6%d7%94-%d7%91%d7%99%d7%aa/',
    categoryId: 2020
  },
  {
    id: 'home',
    name: Category.HOME,
    gender: 'Unisex',
    url: 'https://www.gant.co.il/product-category/%d7%91%d7%99%d7%aa/new-arrivals-%d7%91%d7%99%d7%aa/',
    categoryId: 2019
  },
  {
    id: 'home',
    name: Category.HOME_SLEEP,
    gender: 'Unisex',
    url: 'https://www.gant.co.il/product-category/%d7%91%d7%99%d7%aa/%d7%97%d7%93%d7%a8-%d7%a9%d7%99%d7%a0%d7%94-%d7%95%d7%a1%d7%9c%d7%95%d7%9f-%d7%91%d7%99%d7%aa/',
    categoryId: 2021,
  }
];

const BASE_URL = 'https://www.gant.co.il';

class GantScraper extends BaseScraper {
  protected readonly scraperName = 'Gant';
  protected readonly source = 'Gant';

  protected getCategories(): CategoryType[] {
    return CATEGORIES;
  }

  protected async scrapeCategory(category: CategoryType): Promise<Product[]> {
    // If categoryId is present, use AJAX endpoint
    if (category.categoryId) {
      console.log(`using Ajax scraping for ${category.name} - ${category.categoryId}... `)
      let page = 0;
      let allProducts: Product[] = [];
      let hasMore = true;
      const MAX_PAGES = 20;
      let prevPageUrls: string[] = [];
      while (page <= MAX_PAGES) {
        const ajaxUrl = `${BASE_URL}/wp-admin/admin-ajax.php?action=filter_products&categories[]=${category.categoryId}&paged=${page}&filters=false&query_type=load_more&current_pdt_in_page=16`;
        this.logProgress(`Fetching AJAX: ${ajaxUrl}`);
        try {
          const res = await fetch(ajaxUrl, {
            headers: {
              'accept': 'application/json, text/javascript, */*; q=0.01',
              'x-requested-with': 'XMLHttpRequest',
              'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
            },
          });
          const json = await res.json();
          const html = json?.result || '';
          if (!html) {
            this.logProgress('No HTML returned from AJAX (json.result), stopping');
            break;
          }
          const products = this.parseGantProducts(html, category);
          this.logProgress(`Found ${products.length} products in ${category.name} (page ${page})`);
          if (!products.length) break;
          // Check for duplicate page (same product URLs as previous page)
          const pageUrls = products.map(p => p.url).sort();
          const nextHasMore = products.length > 0 && (prevPageUrls.length === 0 || prevPageUrls.join(',') !== pageUrls.join(','));
          if (!nextHasMore) break;
          prevPageUrls = pageUrls;
          allProducts.push(...products);
          page++;
        } catch (e) {
          this.logWarning(`Failed to fetch AJAX Gant page, falling back to old method: ${e}`);
          // fallback to old method for this category
          return this.scrapeCategoryOld(category);
        }
      }
      return allProducts;
    } else {
      // Fallback: old method (puppeteer)
      return this.scrapeCategoryOld(category);
    }
  }

  private async scrapeCategoryOld(category: CategoryType): Promise<Product[]> {
    let page = 1;
    let allProducts: Product[] = [];
    let hasMore = true;
    const MAX_PAGES = 20;
    let prevPageUrls: string[] = [];
    while (hasMore && page <= MAX_PAGES) {
      let url = category.url;
      if (page > 1) {
        url += url.includes('?') ? `&page=${page}` : `?page=${page}`;
      }
      this.logProgress(`Fetching ${url}`);
      const html = await this.fetchGantPage(url);
      const products = this.parseGantProducts(html, category);
      this.logProgress(`Found ${products.length} products in ${category.name} (page ${page})`);
      if (!products.length) break;
      // Check for duplicate page (same product URLs as previous page)
      const pageUrls = products.map(p => p.url).sort();
      const nextHasMore = products.length > 0 && (prevPageUrls.length === 0 || prevPageUrls.join(',') !== pageUrls.join(','));
      if (!nextHasMore) break;
      prevPageUrls = pageUrls;
      allProducts.push(...products);
      hasMore = products.length > 0;
      page++;
      // if (hasMore) {
      //   await new Promise(res => setTimeout(res, 3000)); // Wait 3 seconds
      // }
    }
    return allProducts;
  }

  private async fetchGantPage(url: string): Promise<string> {
    return fetchPageWithBrowser(url, {
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
      waitUntil: 'networkidle2',
      timeout: 60000,
      onPageReady: async (page) => {
        // Custom page logic can be added here
      }
    });
  }

  private parseGantProducts(html: string, category: CategoryType): Product[] {
    const $ = cheerio.load(html);
    const productCards = $('.search_suggestions_product');
    const products: Product[] = [];
    productCards.each((_, el) => {
      const elem = $(el);
      const title = elem.find('h3.name').text().trim();
      const url = elem.find('a.product_details').attr('href') || '';
      let image = elem.find('.product_thumbnail_wrapper img').attr('src') || '';
      if (image && image.startsWith('//')) {
        image = 'https:' + image;
      }
      // Price extraction from .pdt_price_wrapper
      let price = null, oldPrice = null, salePercent = null;
      const priceText = elem.find('.pdt_price_wrapper').text().replace(/[₪,]/g, '').replace(/[^\d.]/g, '');
      if (priceText) {
        price = parseFloat(priceText);
      }
      // Check for discount percent
      const saleTag = elem.find('div.sale_tag').text();
      const percentMatch = saleTag.match(/(\d+)%/);
      if (percentMatch && price) {
        salePercent = parseInt(percentMatch[1], 10);
        oldPrice = price;
        price = Math.round((oldPrice * (100 - salePercent)) / 100);
      }
      const brand = normalizeBrandName('Gant');
      const apiColors = Array.from(elem.find('.colors_wrapper a')).map((link) => ucfirst($(link).attr('title')?.toLocaleLowerCase()))
      const colors = extractColorsWithHebrew(title, apiColors, 'gant_scraper');
      const categories = [category.name];
      const gender = category.gender;
      const product = this.createProduct({
        title,
        url,
        images: [image].filter(Boolean),
        colors,
        isSellingFast: false,
        price,
        oldPrice,
        salePercent,
        currency: 'ILS',
        brand,
        categories,
        gender,
      });
      products.push(product);
    });
    return products;
  }
}

// Main function
async function main() {
  const scraper = new GantScraper();
  await scraper.run();
}

// CLI entry point
if (require.main === module) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

export { main, GantScraper }; 