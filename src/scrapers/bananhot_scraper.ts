import * as cheerio from 'cheerio';
import { BaseScraper, Category as CategoryType } from './base/base-scraper';
import { calcSalePercent, Product } from './base/scraper_utils';
import { fetchPageWithBrowser } from './base/browser-helpers';
import { Category } from '../category.constants';
import { extractColorsWithHebrew } from 'src/color.constants';

const BASE_URL = 'https://bananhot.co.il';

const CATEGORIES: CategoryType[] = [
  {
    id: 'new-arrivals',
    name: 'New',
    gender: 'Women',
    url: `${BASE_URL}/collections/new-arrivals`,
  },
  {
    id: 'swimwear',
    name: Category.SWIMWEAR,
    gender: 'Women',
    url: `${BASE_URL}/collections/tops`,
  },
  {
    id: 'swimwear',
    name: Category.SWIMWEAR,
    gender: 'Women',
    url: `${BASE_URL}/collections/bottoms`,
  },
  {
    id: 'swimwear',
    name: Category.SWIMWEAR,
    gender: 'Women',
    url: `${BASE_URL}/collections/one-piece`,
  },
  {
    id: 'swimwear',
    name: Category.SWIMWEAR,
    gender: 'Men',
    url: `${BASE_URL}/collections/men-swimwear`,
  },
  {
    id: 'dresses',
    name: Category.DRESSES,
    gender: 'Women',
    url: `${BASE_URL}/collections/dresses`,
  },
  {
    id: 'beachwear',
    name: Category.BEACHWEAR, // todo change to Cover Ups?
    gender: 'Women',
    url: `${BASE_URL}/collections/cover-ups`,
  },
  {
    id: 'pants',
    name: Category.PANTS,
    gender: 'Women',
    url: `${BASE_URL}/collections/pants`,
  },
  {
    id: 'skirts',
    name: Category.SKIRTS,
    gender: 'Women',
    url: `${BASE_URL}/collections/skirts`,
  },
  {
    id: 'sarongs',
    name: Category.SARONGS,
    gender: 'Women',
    url: `${BASE_URL}/collections/sarongs`,
    additionalCategories: [Category.BEACHWEAR],
  },
  {
    id: 'beachwear-men',
    name: Category.BEACHWEAR,
    gender: 'Men',
    url: `${BASE_URL}/collections/mens-beachwear`,
  },
  {
    id: 'tights',
    name: Category.TIGHTS,
    gender: 'Women',
    url: `${BASE_URL}/collections/leggings`,
  },
  {
    id: 'bras-tops',
    name: Category.SPORT,
    gender: 'Women',
    url: `${BASE_URL}/collections/bras-tops`,
  },
  {
    id: 'overalls',
    name: Category.OVERALLS,
    gender: 'Women',
    url: `${BASE_URL}/collections/onesie`,
  },
  {
    id: 'clothing',
    name: Category.CLOTHING,
    gender: 'Women',
    url: `${BASE_URL}/collections/clothing`,
  },
  {
    id: 'hats',
    name: Category.HATS,
    gender: 'Women',
    url: `${BASE_URL}/collections/hats`,
  },
  {
    id: 'bandana',
    name: Category.ACCESSORIES, // bandanas
    gender: 'Women',
    url: `${BASE_URL}/collections/bandana`,
    additionalCategories: [Category.BEACHWEAR]
  },
  {
    id: 'jewelry',
    name: Category.JEWELRY,
    gender: 'Women',
    url: `${BASE_URL}/collections/charms`,
  },
  {
    id: 'slippers',
    name: Category.SLIPPERS,
    gender: 'Women',
    url: `${BASE_URL}/collections/כפכפים`,
  },
  {
    id: 'lingerie',
    name: Category.LINGERIE,
    gender: 'Women',
    url: `${BASE_URL}/collections/הלבשה-תחתונה`,
  },
  {
    id: 'holidays',
    name: Category.CLOTHING,
    gender: 'Women',
    url: `${BASE_URL}/collections/holiday`
  },
  {
    id: 'summer25',
    name: Category.CLOTHING,
    gender: 'Women',
    url: `${BASE_URL}/collections/summer-2025`
  },
  {
    id: 'resort-25',
    name: Category.CLOTHING,
    gender: 'Women',
    url: `${BASE_URL}/collection_resort-2025`
  },
  {
    id: 'spring-25',
    name: Category.CLOTHING,
    gender: 'Women',
    url: `${BASE_URL}/collections/spring-2025`
  },
];

export class BananhotScraper extends BaseScraper {
  protected readonly scraperName = 'Bananhot';
  protected readonly source = 'Bananhot';

  protected getCategories(): CategoryType[] {
    return CATEGORIES;
  }

    private async fetchBananhotPage(url: string): Promise<string> {
    return fetchPageWithBrowser(url, {
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
      waitUntil: 'domcontentloaded',
      timeout: 60000,
      onPageReady: async (page) => {
        // Custom page logic can be added here
      }
    });
  }

  private parseBananhotProduct(productElem: cheerio.Cheerio<any>, category: CategoryType, $: cheerio.CheerioAPI): Product | undefined {
    // Extract from data attributes
    const title = productElem.attr('data-producttitle')?.trim() ||
      productElem.find('.card__content a').text().trim();
    let url = productElem.find('.card__content a').attr('href') || '';
    if (url && !url.startsWith('http')) url = BASE_URL + url;

    // Images: collect all <img> in .card__media and swiper slides
    let images: string[] = [];
    productElem.find('.card__media img, swiper-slide img').each((_, img) => {
      const $img = $(img);
      let src = $img.attr('src');
      if (!src || src === 'undefined') {
        // Try srcset
        const srcset = $img.attr('srcset');
        if (srcset) {
          // Take the largest image (last in srcset)
          const parts = srcset.split(',').map(s => s.trim().split(' ')[0]);
          if (parts.length) src = parts[parts.length - 1];
        }
      }
      if (src && src.startsWith('//')) src = 'https:' + src;
      if (src && !src.startsWith('http')) src = BASE_URL + src;
      if (src && !images.includes(src)) images.push(src);
    });
    images = images.filter(Boolean);

    // Price and Old Price
    let price = null, oldPrice = null;
    const priceAttr = productElem.attr('data-price');
    if (priceAttr) price = parseFloat(priceAttr);
    const oldPriceAttr = productElem.attr('data-oldprice');
    if (oldPriceAttr) oldPrice = parseFloat(oldPriceAttr);
    // Fallback to DOM if not present
    if (!price) {
      const priceText = productElem.find('.price-item--regular, .price__regular, .price, .card-information__price').first().text().replace(/[^\d.]/g, '');
      if (priceText) price = parseFloat(priceText);
    }
    if (!oldPrice) {
      const oldPriceText = productElem.find('.price-item--sale, .price__sale, .price--on-sale, .price__compare').first().text().replace(/[^\d.]/g, '');
      if (oldPriceText) oldPrice = parseFloat(oldPriceText);
    }
    // Sale percent
    let salePercent = null;
    const discountAttr = productElem.attr('data-discountpercentage');
    if (discountAttr) {
      const match = discountAttr.match(/(\d+)%/);
      if (match) salePercent = parseInt(match[1], 10);
    }
    if (salePercent === null) salePercent = calcSalePercent(price, oldPrice) ?? 0;

    // Colors
    let colors: string[] = [];
    const colorAttr = productElem.attr('data-color');
    if (colorAttr) {
      // Try to extract color names from the attribute (may be comma or newline separated)
      colors = colorAttr.split(',').map(c => c.trim()).filter(Boolean);
      if (colors.length === 0) {
        // Try splitting by newlines
        colors = colorAttr.split('\n').map(c => c.trim()).filter(Boolean);
      }
    }
    if (!colors.length) {
      colors = extractColorsWithHebrew(title, [], 'bananhot_scraper');
    }

    // Category
    // let categories = [category.name];
    // const catAttr = productElem.attr('data-productcategory');
    // if (catAttr) {
    //   // Use the first category if available
    //   const cat = catAttr.split(',')[0].trim();
    //   if (cat) categories = [cat];
    // }

    const currency = 'ILS';
    const brand = 'Bananhot';
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
      categories: [category.name, ...$(category.additionalCategories ?? [])],
      gender,
    });
  }

  protected async scrapeCategory(category: CategoryType): Promise<Product[]> {
    let page = 1;
    let allProducts: Product[] = [];
    let hasMore = true;
    const MAX_PAGES = 30;
    while (hasMore && page < MAX_PAGES) {
      const url = `${category.url}${page > 1 ? `?page=${page}` : ''}`;
      this.logProgress(`Fetching ${url}`);
      const html = await this.fetchBananhotPage(url);
      const $ = cheerio.load(html);
      // Use .grid__item as the product selector
      const productElems = $('li.grid__item');
      if (!productElems.length) {
        this.logProgress('No products found on page, stopping');
        break;
      }
      const pageProducts = productElems.map((_, el) => this.parseBananhotProduct($(el), category, $)).get().filter(Boolean) as Product[];
      this.logProgress(`Found ${pageProducts.length} products on page ${page}`);
      allProducts.push(...pageProducts);
      // If less than 16 products, it's the last page
      hasMore = productElems.length >= 16;
      page++;
    }
    return allProducts;
  }
}

// Standalone runner
async function main() {
  const scraper = new BananhotScraper();
  await scraper.run();
}

if (require.main === module) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
} 