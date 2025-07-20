import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import { BaseScraper, Category as BaseCategory } from './base/base-scraper';
import { Product, extractColors, calcSalePercent, normalizeBrandName, prefixHttp } from './base/scraper_utils';
import { Category } from 'src/category.constants';

export class RalphLaurenScraper extends BaseScraper {
  protected readonly scraperName = 'Polo Ralph Lauren';
  protected readonly source = 'Polo Ralph Lauren';

  protected getCategories(): BaseCategory[] {
    return [
      {
        id: 'sale',
        name: 'Sale',
        gender: 'Men',
        url: 'https://www.ralphlauren.global/il/en/sale/men/shop-all/1004105',
      },
      {
        id: 't-shirts',
        name: Category.T_SHIRTS,
        gender: 'Men',
        url: 'https://www.ralphlauren.global/il/en/men/clothing/t-shirts/10203',
      },
      {
        id: 'swimwear',
        name: Category.SWIMWEAR,
        gender: 'Men',
        url: 'https://www.ralphlauren.global/il/en/men/clothing/swimwear/102014',
      },
      {
        id: 'polo-shirts',
        name: Category.POLO_SHIRTS,
        gender: 'Men',
        url: 'https://www.ralphlauren.global/il/en/men/clothing/polo-shirts/10201',
      },
      {
        id: 'hoodies',
        name: Category.SWEATERS,
        gender: 'Men',
        url: 'https://www.ralphlauren.global/il/en/men/clothing/hoodies-sweatshirts/10204',
      },
      {
        id: 'blazers',
        name: Category.BLAZERS,
        gender: 'Men',
        url: 'https://www.ralphlauren.global/il/en/men/clothing/blazers/10209',
      },
      {
        id: 'jackets-coats',
        name: Category.JACKETS_COATS,
        gender: 'Men',
        url: 'https://www.ralphlauren.global/il/en/men/clothing/jackets-coats/10205',
      },
      {
        id: 'trousers',
        name: Category.PANTS,
        gender: 'Men',
        url: 'https://www.ralphlauren.global/il/en/men/clothing/trousers/102015',
      },
      {
        id: 'shorts',
        name: Category.SHORTS,
        gender: 'Men',
        url: 'https://www.ralphlauren.global/il/en/men/clothing/shorts/102013',
      },
      {
        id: 'loungewear',
        name: Category.SLEEP_WEAR,
        gender: 'Men',
        url: 'https://www.ralphlauren.global/il/en/men/clothing/loungewear/105039',
      },
      {
        id: 'shoes',
        name: Category.SHOES,
        gender: 'Men',
        url: 'https://www.ralphlauren.global/il/en/men/shoes/1040?orignalCatID=men-shoes-shop-all-rd&altrurlID=men-shoes-shop-all-rd',
      },
      {
        id: 'accessories',
        name: Category.ACCESSORIES,
        gender: 'Men',
        url: 'https://www.ralphlauren.global/il/en/men/accessories/1030?orignalCatID=men-accessories-shop-all-rd&altrurlID=men-accessories-shop-all-rd',
      },
    ];
  }

  private async fetchPage(url: string): Promise<string> {
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    try {
      const page = await browser.newPage();
      await page.setUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36'
      );
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9',
      });
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 40000 });
      const html = await page.content();
      await new Promise(resolve => setTimeout(resolve, 1000 * 3)); // wait between pages
      return html;
    } finally {
      await browser.close();
    }
  }

  protected async scrapeCategory(category: BaseCategory): Promise<Product[]> {
    const products: Product[] = [];
    const maxPages = 20;
    let page = 1;
    let foundAny = false;
    try {
      while (page <= maxPages) {
        // Build paginated URL
        let pageUrl = category.url;
        if (page > 1) {
          pageUrl += (pageUrl.includes('?') ? '&' : '?') + `page=${page}`;
        }
        const html = await this.fetchPage(pageUrl);
        const $ = cheerio.load(html);
        const productDivs = $('.product-tile');
        if (productDivs.length === 0) {
          if (!foundAny) this.logWarning('No products found in DOM');
          break;
        }
        foundAny = true;
        productDivs.each((_, el) => {
          const elem = $(el);
          // Product URL
          const urlPath = elem.find('.name-link').attr('href');
          const url = urlPath ? prefixHttp('www.ralphlauren.global' + urlPath) : '';
          // Title
          const title = elem.find('.name-link').text().trim();
          // Brand
          const brand = normalizeBrandName(elem.find('.brand-name').text().trim() || 'Ralph Lauren');
          // Images
          const images: string[] = [];
          elem.find('img').each((_, img) => {
            const src = $(img).attr('src');
            if (src && !src.startsWith('data:') && !images.includes(src)) images.push(src);
          });
          // Colors
          const colors: string[] = [];
          elem.find('.swatchanchor').each((_, swatch) => {
            const color = $(swatch).attr('title') || $(swatch).attr('aria-label');
            if (color) colors.push(color);
          });
          // Price
          let price: number | null = null;
          let oldPrice: number | null = null;
          // Look for sale price in .lowred class (current sale price)
          const salePriceText = elem.find('.lowred').text().trim();
          if (salePriceText) {
            price = parseFloat(salePriceText.replace(/[^\d.]/g, ''));
          }
          // Look for original price in .product-standard-price class
          const oldPriceText = elem.find('.product-standard-price').text().trim();
          if (oldPriceText) {
            oldPrice = parseFloat(oldPriceText.replace(/[^\d.]/g, ''));
          }
          // If no sale price found in .lowred, try other selectors
          if (price === null) {
            const fallbackPriceText = elem.find('.price').text() || elem.find('.product-sales-price').text();
            if (fallbackPriceText) {
              price = parseFloat(fallbackPriceText.replace(/[^\d.]/g, ''));
            }
          }
          const salePercent = calcSalePercent(price, oldPrice);
          const categories = [category.name];
          const gender = category.gender;
          if (title && url && price !== null) {
            products.push(
              this.createProduct({
                title,
                url,
                images,
                colors: extractColors(title, colors),
                price,
                oldPrice,
                salePercent,
                currency: 'ILS',
                brand,
                categories,
                gender,
              })
            );
          }
        });
        page++;
      }
    } catch (error) {
      this.logError('Failed to scrape Ralph Lauren category', error);
    }
    return products;
  }
}

// Standalone runner
async function main() {
  const scraper = new RalphLaurenScraper();
  await scraper.run();
}

if (require.main === module) {
  main();
} 