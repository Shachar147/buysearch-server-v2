import * as cheerio from 'cheerio';
import { BaseScraper, Category as CategoryType } from './base/base-scraper';
import { calcSalePercent, Product } from './base/scraper_utils';
import { Category } from '../category.constants';
import { fetchPageWithBrowser } from './base/browser-helpers';
import { extractColors } from 'src/color.constants';

// NOTE: if there's a range (min, max), we currently take the max.
// we can change it by using minPrice and oldminPrice

export class GolfAndCoScraper extends BaseScraper {
  protected readonly scraperName = 'Golf & Co';
  protected readonly source = 'Golf & Co';

  protected getCategories(): CategoryType[] {
    return [
      {
        id: 'bedroom',
        name: Category.HOME_SLEEP,
        gender: 'Unisex',
        url: 'https://www.golfco.co.il/%D7%97%D7%93%D7%A8-%D7%A9%D7%99%D7%A0%D7%94',
      },
      {
        id: 'dining-table',
        name: Category.HOME_KITCHEN,
        gender: 'Unisex',
        url: 'https://www.golfco.co.il/dining-table',
      },
      {
        id: 'bathroom',
        name: Category.HOME_BATH,
        gender: 'Unisex',
        url: 'https://www.golfco.co.il/bathroom',
      },
      {
        id: 'living-room',
        name: Category.HOME_LIVING_ROOM,
        gender: 'Unisex',
        url: 'https://www.golfco.co.il/%D7%A1%D7%9C%D7%95%D7%9F-%D7%95%D7%90%D7%95%D7%95%D7%99%D7%A8%D7%94',
      },
      {
        id: 'tulips-bedroom',
        name: Category.HOME_SLEEP,
        gender: 'Unisex',
        url: 'https://www.golfco.co.il/tulips-gallery/%D7%97%D7%93%D7%A8-%D7%A9%D7%99%D7%A0%D7%94',
      },
      {
        id: 'tulips-dining-table',
        name: Category.HOME_KITCHEN,
        gender: 'Unisex',
        url: 'https://www.golfco.co.il/tulips-gallery/%D7%A9%D7%95%D7%9C%D7%97%D7%9F-%D7%90%D7%95%D7%9B%D7%9C',
      },
      {
        id: 'tulips-bathroom',
        name: Category.HOME_BATH,
        gender: 'Unisex',
        url: 'https://www.golfco.co.il/tulips-gallery/%D7%97%D7%93%D7%A8-%D7%A8%D7%97%D7%A6%D7%94',
      },
    ];
  }

  private async fetchPage(url: string): Promise<string> {
    return fetchPageWithBrowser(url, {
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
      waitUntil: 'domcontentloaded',
      timeout: 60000,
      onPageReady: async (page) => {
        // Wait for the product grid to load
        try {
          await page.waitForSelector('.grid__item', { timeout: 10000 });
        } catch (error) {
          console.log('No products found on page, might be the last page');
        }
      }
    });
  }

  protected async scrapeCategory(category: CategoryType): Promise<Product[]> {
    let page = 1;
    let allProducts: Product[] = [];
    let hasMore = true;

    let lastSeenUrls = [];
    let currProducts = [];

    while (hasMore) {
      const url = `${category.url}${page > 1 ? `?p=${page}` : ''}`;
      this.logProgress(`Fetching ${url}`);
      const html = await this.fetchPage(url);
      const $ = cheerio.load(html);
      const products = $('.product-item, .product, .product-card');
      this.logProgress(`found: ${products.length} products on this page`);

      currProducts = [];

      products.each((_, el) => {
        const title = $(el).find('.product_link').text().trim();
        const url = $(el).find('a.product_link').attr('href');
        let images: string[] = [];
        const imgObject = $(el).find('.product-image-photo');
        if (imgObject) {
            let img1 = $(imgObject).attr('src');
            if (img1) images.push(img1)
            let img2 = $(imgObject).attr('src_1');
            if (img2) images.push(img2);
        }
        let priceText = $(el).find('span[data-price-type="finalPrice"]').first().text().replace(/[^\d.]/g, '');
        let oldPriceText = $(el).find('span[data-price-type="oldPrice"]').first().text().replace(/[^\d.]/g, '');

        let price = priceText && priceText != '' ? parseFloat(priceText) : null;
        let oldPrice = oldPriceText && oldPriceText != '' ? parseFloat(oldPriceText) : null;
        let salePercent = oldPrice ? calcSalePercent(price, oldPrice) : null;


        // NOTE: if there's a range (min, max), we currently take the max.
        // we can change it by using minPrice and oldminPrice
        if (!price){
            priceText = $(el).find('span[data-price-type="maxPrice"]').first().text().replace(/[^\d.]/g, '');
            oldPriceText = $(el).find('span[data-price-type="oldmaxPrice"]').first().text().replace(/[^\d.]/g, '');
            price = priceText && priceText != '' ? parseFloat(priceText) : null;
            oldPrice = oldPriceText && oldPriceText != '' ? parseFloat(oldPriceText) : null;
            salePercent = oldPrice ? calcSalePercent(price, oldPrice) : null;
        }

        const colors = Array.from($(el).find('.swatch-option.color').find('.show-text')).map((e) => $(e).text())
        
        if (!price || !title){
            this.logProgress(`Skipping product: ${title} - ${url} - ${price} - ${oldPrice}`);
            return;
        }

        if (!title || !url || !price){
          return;
        }

        const formattedProduct = this.createProduct({
            title,
            url: url ? (url.startsWith('http') ? url : `https://www.golfco.co.il${url}`) : '',
            images,
            colors: extractColors(title, colors),
            price,
            oldPrice,
            salePercent,
            currency: 'ILS',
            brand: 'Golf & Co',
            categories: [category.name],
            gender: category.gender,
          });

        currProducts.push(formattedProduct);
        allProducts.push(formattedProduct);
      });

      if (!currProducts.length || currProducts.map((p) => p.url).every((url) => lastSeenUrls.includes(url))){
        this.logProgress(`No new products found, stopping`);
        break;
      }
      lastSeenUrls = currProducts.map((p) => p.url);
      page++;
    }
    return allProducts;
  }
}

// Standalone runner
async function main() {
  const scraper = new GolfAndCoScraper();
  await scraper.run();
}

if (require.main === module) {
  main();
} 