import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import { BaseScraper, Category as BaseCategory } from './base/base-scraper';
import { Product, extractColors, calcSalePercent, normalizeBrandName, prefixHttp } from './base/scraper_utils';
import { Category } from '../category.constants';

export class TommyScraper extends BaseScraper {
  protected readonly scraperName = 'Tommy';
  protected readonly source = 'Tommy Hilfiger';

  protected getCategories(): BaseCategory[] {
    return [
      {
        id: 'mens-sale',
        name: 'Sale',
        gender: 'Men',
        url: 'https://usa.tommy.com/en/sale/mens-sale',
      },
      {
        id: 'womens-sale',
        name: 'Sale',
        gender: 'Women',
        url: 'https://usa.tommy.com/en/sale/womens-sale',
      },
      {
        id: 'tops',
        name: Category.TOPS,
        gender: 'Men',
        url: 'https://usa.tommy.com/en/men/clothing/tops',
      },
      {
        id: 'swimwear',
        name: Category.SWIMWEAR,
        gender: 'Men',
        url: 'https://usa.tommy.com/en/men/clothing/swimwear',
      },
      {
        id: 'shoes',
        name: Category.SHOES,
        gender: 'Men',
        url: 'https://usa.tommy.com/en/men/shoes-accessories/shoes',
      },
      {
        id: 'underwear',
        name: Category.UNDERWEAR,
        gender: 'Men',
        url: 'https://usa.tommy.com/en/men/underwear',
      },
      {
        id: 'bags',
        name: Category.BAGS,
        gender: 'Men',
        url: 'https://usa.tommy.com/en/men/shoes-accessories/bags-wallets',
      },
      {
        id: 'jeans',
        name: Category.JEANS,
        gender: 'Men',
        url: 'https://usa.tommy.com/en/men/clothing/jeans',
      },
      {
        id: 'shorts',
        name: Category.SHORTS,
        gender: 'Men',
        url: 'https://usa.tommy.com/en/men/clothing/shorts',
      },
      {
        id: 'sleepwear',
        name: Category.SLEEP_WEAR,
        gender: 'Men',
        url: 'https://usa.tommy.com/en/men/clothing/sleepwear',
      },
      {
        id: 'pants',
        name: Category.PANTS,
        gender: 'Men',
        url: 'https://usa.tommy.com/en/men/clothing/pants',
      },
      {
        id: 'jackets',
        name: Category.JACKETS_COATS,
        gender: 'Men',
        url: 'https://usa.tommy.com/en/men/clothing/jackets',
      },
      {
        id: 'joggers',
        name: Category.JOGGERS,
        gender: 'Men',
        url: 'https://usa.tommy.com/en/men/clothing/sweatpants-joggers',
      },
      {
        id: 'hats',
        name: Category.HATS,
        gender: 'Men',
        url: 'https://usa.tommy.com/en/men/shoes-accessories/hats',
      },
      {
        id: 'jewelry',
        name: Category.JEWELRY,
        gender: 'Men',
        url: 'https://usa.tommy.com/en/men/shoes-accessories/watches-jewelry',
      },
      {
        id: 'sets',
        name: Category.SETS,
        gender: 'Men',
        url: 'https://usa.tommy.com/en/all-gender/matching-sets/men',
      },
      {
        id: 'womens-tops',
        name: Category.TOPS,
        gender: 'Women',
        url: 'https://usa.tommy.com/en/women/clothing/tops',
      },
      {
        id: 'womens-dresses',
        name: Category.DRESSES,
        gender: 'Women',
        url: 'https://usa.tommy.com/en/women/clothing/dresses-skirts',
      },
      {
        id: 'womens-pants',
        name: Category.PANTS,
        gender: 'Women',
        url: 'https://usa.tommy.com/en/women/clothing/pants',
      },
      {
        id: 'womens-jeans',
        name: Category.JEANS,
        gender: 'Women',
        url: 'https://usa.tommy.com/en/women/clothing/jeans',
      },
      {
        id: 'womens-joggers',
        name: Category.JOGGERS,
        gender: 'Women',
        url: 'https://usa.tommy.com/en/women/clothing/sweatpants-joggers',
      },
      {
        id: 'womens-shorts',
        name: Category.SHORTS,
        gender: 'Women',
        url: 'https://usa.tommy.com/en/women/clothing/shorts',
      },
      {
        id: 'womens-jackets',
        name: Category.JACKETS_COATS,
        gender: 'Women',
        url: 'https://usa.tommy.com/en/women/clothing/jackets',
      },
      {
        id: 'womens-sets',
        name: Category.SETS,
        gender: 'Women',
        url: 'https://usa.tommy.com/en/all-gender/matching-sets/women',
      },
      {
        id: 'womens-shoes',
        name: Category.SHOES,
        gender: 'Women',
        url: 'https://usa.tommy.com/en/women/shoes-accessories/shoes',
      },
      {
        id: 'womens-bags',
        name: Category.BAGS,
        gender: 'Women',
        url: 'https://usa.tommy.com/en/women/shoes-accessories/bags-wallets',
      },
      {
        id: 'womens-socks',
        name: Category.SOCKS,
        gender: 'Women',
        url: 'https://usa.tommy.com/en/women/shoes-accessories/socks',
      },
      {
        id: 'womens-lingerie',
        name: Category.LINGERIE,
        gender: 'Women',
        url: 'https://usa.tommy.com/en/women/underwear',
      },
    ];
  }

  private async fetchTommyPage(url: string): Promise<string> {
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36'
    );
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
    });
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 20000 }); // 60000
    // Wait a bit for images and JS to load
    // await new Promise(res => setTimeout(res, 2000));
    const html = await page.content();
    await browser.close();
    // If the page is blank, retry once after a delay
    if (html.trim().length < 1000) {
      await new Promise(res => setTimeout(res, 3000));
      const browser2 = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
      const page2 = await browser2.newPage();
      await page2.setUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36'
      );
      await page2.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9',
      });
      await page2.goto(url, { waitUntil: 'networkidle2', timeout: 20000 }); // 60000
      const html2 = await page2.content();
      await browser2.close();
      return html2;
    }
    return html;
  }

  protected async scrapeCategory(category: BaseCategory): Promise<Product[]> {
    const baseUrl = category.url;
    const products: Product[] = [];
    try {
      const firstPageSize = 16;
      const pageSize = 48;
      let start = 0;
      let hasMore = true;
      let pageNum = 1;
      const MAX_PAGES = 15;
      while (hasMore && pageNum <= MAX_PAGES) {
        let url = baseUrl;
        if (pageNum > 1) {
          url = `${baseUrl}?sz=${pageSize}&start=${start}`;
        }
        this.logProgress(`Fetching page ${pageNum} - ${url}`);
        const html = await this.fetchTommyPage(url);
        const $ = cheerio.load(html);
        const productDivs = $('.product');
        if (productDivs.length === 0) {
          this.logWarning('No products found in DOM');
          break;
        }
        productDivs.each((_, el) => {
          const productTile = $(el).find('.product-tile');
          // Product URL
          const urlPath = productTile.find('.pdpurl').attr('href') || productTile.find('.ds-product-name').attr('href');
          const url = urlPath ? prefixHttp('usa.tommy.com' + urlPath) : '';
          // Title
          const title = productTile.find('.ds-product-name span[role="heading"]').text().trim();
          // Images (main and alternates)
          const images: string[] = [];
          // Extract from <source srcset> inside <picture>
          productTile.find('picture source').each((_, source) => {
            const srcset = $(source).attr('srcset') || $(source).attr('data-srcset');
            if (srcset) {
              // srcset can be a comma-separated list, take the first URL
              const firstUrl = srcset.split(',')[0].split(' ')[0].trim();
              if (firstUrl && !images.includes(firstUrl)) images.push(firstUrl);
            }
          });
          // Fallback: try <img src> if no <source> found
          if (images.length === 0) {
            productTile.find('img.plp-slick-img').each((_, img) => {
              const src = $(img).attr('src');
              if (src && !src.startsWith('data:')) images.push(src);
            });
          }
          if (images.length === 0){
            const parts = url.split('?')[0].split('/');
            const id = parts[parts.length-1].replace('-','_').replace('.html','');
            images.push(`https://shoptommy.scene7.com/is/image/ShopTommy/${id}_FNT`);
            images.push(`https://shoptommy.scene7.com/is/image/ShopTommy/${id}_BCK`);
          }
          console.log(url, images);

          // Colors
          const colors: string[] = [];
          productTile.find('.swatch-list .swatch-item').each((_, swatch) => {
            const color = $(swatch).attr('aria-label');
            if (color) colors.push(color);
          });
          // Price
          let price: number | null = null;
          let oldPrice: number | null = null;
          const priceText = productTile.find('.sales .value').attr('content') || productTile.find('.sales .value').text();
          if (priceText) price = parseFloat(priceText.replace(/[^\d.]/g, ''));
          const oldPriceText = productTile.find('.ds-slash-price .value').attr('content') || productTile.find('.ds-slash-price .value').text();
          if (oldPriceText) oldPrice = parseFloat(oldPriceText.replace(/[^\d.]/g, ''));
          // Sale percent
          const salePercent = calcSalePercent(price, oldPrice);
          // Brand
          const brand = normalizeBrandName('Tommy Hilfiger');
          // Categories
          const categories = [category.name];
          // Gender
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
                currency: 'USD',
                brand,
                categories,
                gender,
              })
            );
          }
        });
        // Pagination logic: first page always returns 16, others 48
        console.log(`Tommy: Found ${products.length} products so far.`);
        if ((pageNum === 1 && productDivs.length === firstPageSize) || (pageNum > 1 && productDivs.length === pageSize)) {
          hasMore = true;
          await new Promise(res => setTimeout(res, 2000));
          start += (pageNum == 1 ? firstPageSize : pageSize);
          pageNum++;
        } else {
          hasMore = false;
        }
      }
    } catch (error) {
      this.logError('Failed to scrape Tommy category', error);
    }
    return products;
  }
}

// Standalone runner
async function main() {
  const scraper = new TommyScraper();
  await scraper.run();
}

if (require.main === module) {
  main();
} 