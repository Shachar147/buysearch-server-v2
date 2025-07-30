import { fetchPageWithBrowser } from './base/browser-helpers';
import * as cheerio from 'cheerio';
import { BaseScraper } from './base/base-scraper';
import { Category as CategoryType } from './base/base-scraper';
import { Category } from '../category.constants';
import { Product, calcSalePercent } from './base/scraper_utils';
import { extractColorsWithHebrew } from '../color.constants';


const BASE_URL = 'https://www.zarahome.com';

const CATEGORIES: CategoryType[] = [
  {
    id: 'furniture',
    name: Category.HOME_FURNITURE,
    gender: 'Unisex',
    url: `${BASE_URL}/il/%D7%A8%D7%94%D7%99%D7%98%D7%99%D7%9D-n4104`,
  },
  {
    id: 'sleep',
    name: Category.HOME_SLEEP,
    gender: 'Unisex',
    url: `${BASE_URL}/il/%D7%97%D7%93%D7%A8-%D7%A9%D7%99%D7%A0%D7%94-%D7%A6%D7%99%D7%A4%D7%95%D7%AA-%D7%A9%D7%9E%D7%99%D7%9B%D7%95%D7%AA-%D7%A4%D7%95%D7%9A-n946`,
  },
  {
    id: 'carpets',
    name: Category.HOME_CARPETS,
    gender: 'Unisex',
    url: `${BASE_URL}/il/עיצוב-שטיחים-סלון-n992`,
  },
  {
    id: 'mirrors',
    name: Category.HOME_MIRRORS,
    gender: 'Unisex',
    url: `${BASE_URL}/il/עיצוב-מראות-סלון-n993`,
  },
  {
    id: 'lighting',
    name: Category.HOME_LIGHTING,
    gender: 'Unisex',
    url: `${BASE_URL}/il/תאורה-מנורות-n4847`,
  },
  {
    id: 'curtains',
    name: Category.HOME_CURTAINS,
    gender: 'Unisex',
    url: `${BASE_URL}/il/עיצוב-וילונות-ותריסים-n996`,
  },
  {
    id: 'pillows',
    name: Category.HOME_PILLOWS,
    gender: 'Unisex',
    url: `${BASE_URL}/il/עיצוב-כריות-ספה-סלון-n994`,
  },
  {
    id: 'pillows',
    name: Category.HOME_PILLOWS,
    gender: 'Unisex',
    url: `${BASE_URL}/il/עיצוב-מילויים-n2493`,
  },
  {
    id: 'blankets',
    name: Category.HOME_BLANKETS,
    gender: 'Unisex',
    url: `${BASE_URL}/il/עיצוב-שמיכות-סלון-ספה-n995`,
  },
  {
    id: 'decor',
    name: Category.HOME_DECOR,
    gender: 'Unisex',
    url: `${BASE_URL}/il/עיצוב-סלים-n997`,
  },
  {
    id: 'decor',
    name: Category.HOME_DECOR,
    gender: 'Unisex',
    url: `${BASE_URL}/il/חדר-שינה-קופסאות-תכשיטים-n971`,
  },
  {
    id: 'decor',
    name: Category.HOME_DECOR,
    gender: 'Unisex',
    url: `${BASE_URL}/il/אגרטלים-דקורטיביים-n1010`,
  },
  {
    id: 'decor',
    name: Category.HOME_DECOR,
    gender: 'Unisex',
    url: `${BASE_URL}/il/סלון-נרות-n1002`,
  },
  {
    id: 'decor',
    name: Category.HOME_DECOR,
    gender: 'Unisex',
    url: `${BASE_URL}/il/סלון-פמוטים-n1003`,
  },
  {
    id: 'decor',
    name: Category.HOME_DECOR,
    gender: 'Unisex',
    url: `${BASE_URL}/il/עיצוב-אביזרי-נוי-n1009`,
  },
  {
    id: 'decor',
    name: Category.HOME_DECOR,
    gender: 'Unisex',
    url: `${BASE_URL}/il/סלון-ידיות-n1005`,
  },
  // kitchen
  {
    id: 'kitchen',
    name: Category.HOME_KITCHEN,
    gender: 'Unisex',
    url: `${BASE_URL}/il/פינת-אוכל-כלי-שולחן-סטים-מלאים-n2472`,
  },
  // bath
  {
    id: 'bath',
    name: Category.HOME_BATH,
    gender: 'Unisex',
    url: `${BASE_URL}/il/אמבטיה-מגבות-n1051`,
  },
  // perfumes
  {
    id: 'perfumery',
    name: Category.PERFUMES,
    gender: 'Unisex',
    url: `${BASE_URL}/il/הבשמים-הנמכרים-ביותר-n4188`,
  },
  // women clothes
  {
    id: 'women-clothes',
    name: Category.CLOTHING,
    gender: 'Women',
    url: `${BASE_URL}/il/בגדים-נשים-n1388`,
  },
  // sale
  {
    id: 'sale',
    name: 'Sale',
    gender: 'Unisex',
    url: `${BASE_URL}/il/promo-פריטים-נבחרים-קולקציה-n4766`,
  },
  {
    id: 'sale',
    name: 'Sale',
    gender: 'Unisex',
    url: `${BASE_URL}/il/sale-n1170`,
  },
  // new
  {
    id: 'new',
    name: 'New',
    gender: 'Unisex',
    url: `${BASE_URL}/il/חדשים-קולקציה-n942`,
  },
  // Add more categories as needed
];

export class ZaraHomeScraper extends BaseScraper {
  protected readonly scraperName = 'ZaraHome';
  protected readonly source = 'ZaraHome';

  protected getCategories(): CategoryType[] {
    return CATEGORIES;
  }

  private parseZaraHomeProduct(productElem: cheerio.Cheerio<any>, category: CategoryType, $: cheerio.CheerioAPI): Product | undefined {
    // Title
    const title = productElem.find('.product-info__product-name').text().trim();

    // URL
    let url = productElem.find('h2.product-info__product-name a').attr('href') || '';
    if (url && !url.startsWith('http')) url = BASE_URL + url;

    // Images
    let images: string[] = [];
    let imagesAlts = [];
    productElem.find('.product-item__image-container img').each((_, img) => {
      let src = $(img).attr('src');
      if (src && src.startsWith('//')) src = 'https:' + src;
      if (src && !src.startsWith('http')) src = BASE_URL + src;
      if (src && !images.includes(src)) images.push(src);
      const alt = $(img).attr('alt');
      if (alt) imagesAlts.push(alt.trim());
    });
    images = images.filter(Boolean);

        // Price and Old Price (handle ranges like '25,999 ₪ - 31,999 ₪')
    let price = null, oldPrice = null;
    let minPrice = null, maxPrice = null, minOldPrice = null, maxOldPrice = null;
    const priceTextRaw = productElem.find('.price-single__current').first().text();
    const oldPriceTextRaw = productElem.find('.price-single__old').first().text();

    // Helper to extract min/max from a price string
    function extractMinMaxPrice(text: string): { min: number|null, max: number|null } {
      if (!text) return { min: null, max: null };
      // Remove currency and trim
      const cleaned = text.replace(/[^0-9,.-]/g, '').replace(/\s+/g, '');
      // Split on '-' for range
      const parts = cleaned.split('-').map(s => s.trim()).filter(Boolean);
      if (parts.length === 2) {
        const min = parseFloat(parts[0].replace(/,/g, ''));
        const max = parseFloat(parts[1].replace(/,/g, ''));
        return { min, max };
      } else if (parts.length === 1) {
        const val = parseFloat(parts[0].replace(/,/g, ''));
        return { min: val, max: val };
      }
      return { min: null, max: null };
    }

    const { min: minPriceVal, max: maxPriceVal } = extractMinMaxPrice(priceTextRaw);
    minPrice = minPriceVal;
    maxPrice = maxPriceVal;
    price = maxPrice;
    const { min: minOldPriceVal, max: maxOldPriceVal } = extractMinMaxPrice(oldPriceTextRaw);
    minOldPrice = minOldPriceVal;
    maxOldPrice = maxOldPriceVal;
    oldPrice = maxOldPrice;
    // Optionally log for debug
    // console.log(url, "priceTextRaw", priceTextRaw, "minPrice", minPrice, "maxPrice", maxPrice);
    // console.log(url, "oldPriceTextRaw", oldPriceTextRaw, "minOldPrice", minOldPrice, "maxOldPrice", maxOldPrice);

    const salePercent = calcSalePercent(price, oldPrice) ?? 0;

    // Colors (from color swatches and fallback to title)
    const colorAlts: string[] = [];
    productElem.find('.product-color-selector__color-image').each((_, img) => {
      const alt = $(img).attr('alt');
      if (alt) colorAlts.push(alt.trim());
    });
    // console.log("image alts", imagesAlts);
    const colors = extractColorsWithHebrew(title + '-' + imagesAlts.join(' '), colorAlts, 'zarahome_scraper');
    const currency = 'ILS';
    const brand = 'ZaraHome';
    const categories = [category.name];
    const gender = category.gender;


    if (!title || !url || price == undefined) return undefined;

    return this.createProduct({
      title,
      url,
      images,
      colors,
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

  protected async scrapeCategory(category: CategoryType): Promise<Product[]> {
    this.logProgress(`Fetching ${category.url}`);
    const products: Product[] = [];
    
    const finalHtml = await fetchPageWithBrowser(category.url, {
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
      waitUntil: 'networkidle2',
      timeout: 60000,
      onPageReady: async (page) => {
        try {
          await page.waitForSelector('.product-item-container', { timeout: 20000 });
        } catch (e) {
          this.logProgress('Timeout waiting for .product-item-container');
        }

        await new Promise(res => setTimeout(res, 1500)); // Short delay after scroll

        // Infinite scroll: keep scrolling and waiting for new products
        let reachedEnd = false;
        let scrollIteration = 1;
        while (!reachedEnd) {
          const productsBefore = await page.$$eval('.product-item-container', els => els.length);
          this.logProgress(`Scroll iteration ${scrollIteration}: ${productsBefore} products loaded. Scrolling .sidenav-main-content to bottom...`);
          await page.evaluate(() => {
            const el = document.querySelector('.sidenav-main-content');
            if (el) {
              el.scrollTo(0, el.scrollHeight - 1200);
              // Optionally, trigger a small mouse move to help with lazy loading
              window.dispatchEvent(new Event('mousemove'));
            }
          });
          await new Promise(res => setTimeout(res, 500)); // Short delay after scroll
          this.logProgress('Waiting 4 seconds for new items to load...');
          await new Promise(res => setTimeout(res, 4000)); // Wait 7 seconds for new items to load
          const productsAfter = await page.$$eval('.product-item-container', els => els.length);
          if (productsAfter > productsBefore) {
            this.logProgress(`New products loaded: ${productsAfter - productsBefore}. Total: ${productsAfter}`);
          } else {
            this.logProgress('No new products loaded after scroll. Stopping infinite scroll.');
            reachedEnd = true;
          }
          scrollIteration++;
        }
      }
    });
    
    const $ = cheerio.load(finalHtml);
    const allProductElems = $('.product-item-container');
    this.logProgress(`Total products found after scrolling: ${allProductElems.length}`);
    for (let i = 0; i < allProductElems.length; i++) {
      const productElem = $(allProductElems[i]);
      const product = this.parseZaraHomeProduct(productElem, category, $);
      if (product) {
        products.push(product);
      }
    }
    this.logProgress(`Total products parsed: ${products.length}`);
    return products;
  }
}

// Standalone runner
async function main() {
  const scraper = new ZaraHomeScraper();
  await scraper.run();
}

if (require.main === module) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
} 