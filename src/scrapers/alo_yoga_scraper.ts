import axios from 'axios';
import { BaseScraper, Category as BaseCategory } from './base/base-scraper';
import { Product, calcSalePercent } from './base/scraper_utils';
import { Category } from '../category.constants';
import { extractColors } from '../color.constants';

export class AloYogaScraper extends BaseScraper {
  protected readonly scraperName = 'Alo Yoga';
  protected readonly source = 'Alo Yoga';

  protected getCategories(): BaseCategory[] {
    return [
      {
        id: 'womens-leggings',
        name: Category.TIGHTS,
        gender: 'Women',
        url: 'https://www.aloyoga.com/he-il/collections/womens-leggings',
      },
      {
        id: 'bras',
        name: Category.SPORT, // Sports bras best fit as LINGERIE
        gender: 'Women',
        url: 'https://www.aloyoga.com/he-il/collections/bras',
      },
      {
        id: 'tops',
        name: Category.TOPS,
        gender: 'Women',
        url: 'https://www.aloyoga.com/he-il/collections/tops',
      },
      {
        id: 'womens-sweatshirts-hoodies',
        name: Category.SWEATERS,
        gender: 'Women',
        url: 'https://www.aloyoga.com/he-il/collections/womens-sweatshirts-hoodies',
      },
      {
        id: 'best-sets-1',
        name: Category.SETS,
        gender: 'Women',
        url: 'https://www.aloyoga.com/he-il/collections/best-sets-1',
      },
      {
        id: 'pants',
        name: Category.PANTS,
        gender: 'Women',
        url: 'https://www.aloyoga.com/he-il/collections/pants',
      },
      {
        id: 'womens-shorts',
        name: Category.SHORTS,
        gender: 'Women',
        url: 'https://www.aloyoga.com/he-il/collections/womens-shorts',
      },
      {
        id: 'skirts',
        name: Category.SKIRTS,
        gender: 'Women',
        url: 'https://www.aloyoga.com/he-il/collections/skirts',
      },
      {
        id: 'dresses',
        name: Category.DRESSES,
        gender: 'Women',
        url: 'https://www.aloyoga.com/he-il/collections/dresses',
      },
      {
        id: 'womens-jackets',
        name: Category.JACKETS_COATS,
        gender: 'Women',
        url: 'https://www.aloyoga.com/he-il/collections/womens-jackets',
      },
      {
        id: 'sweatpants',
        name: Category.JOGGERS,
        gender: 'Women',
        url: 'https://www.aloyoga.com/he-il/collections/sweatpants',
      },
      {
        id: 'sweaters',
        name: Category.KNITWEAR,
        gender: 'Women',
        url: 'https://www.aloyoga.com/he-il/collections/sweaters',
      },
      {
        id: 'onesies',
        name: Category.OVERALLS,
        gender: 'Women',
        url: 'https://www.aloyoga.com/he-il/collections/onesies',
      },
      {
        id: 'underwear',
        name: Category.UNDERWEAR,
        gender: 'Women',
        url: 'https://www.aloyoga.com/he-il/collections/underwear',
      },
      // Wellness/Beauty
      {
        id: 'beauty-shop-all',
        name: Category.BEAUTY,
        gender: 'Women',
        url: 'https://www.aloyoga.com/he-il/collections/beauty-shop-all',
      },
      {
        id: 'face',
        name: Category.WELLNESS,
        gender: 'Women',
        url: 'https://www.aloyoga.com/he-il/collections/face',
      },
      {
        id: 'body',
        name: Category.WELLNESS,
        gender: 'Women',
        url: 'https://www.aloyoga.com/he-il/collections/body',
      },
      {
        id: 'homecare',
        name: Category.HOME,
        gender: 'Women',
        url: 'https://www.aloyoga.com/he-il/collections/homecare',
      },
      {
        id: 'haircare',
        name: Category.WELLNESS,
        gender: 'Women',
        url: 'https://www.aloyoga.com/he-il/collections/haircare',
      },
      {
        id: 'gels',
        name: Category.WELLNESS,
        gender: 'Women',
        url: 'https://www.aloyoga.com/he-il/collections/gels',
      },
      // Shop by activity
      {
        id: 'yoga',
        name: Category.SPORT,
        gender: 'Women',
        url: 'https://www.aloyoga.com/he-il/collections/yoga',
      },
      {
        id: 'pilates',
        name: Category.SPORT,
        gender: 'Women',
        url: 'https://www.aloyoga.com/he-il/collections/pilates',
      },
      {
        id: 'run',
        name: Category.RUNNING,
        gender: 'Women',
        url: 'https://www.aloyoga.com/he-il/collections/run',
      },
      {
        id: 'tennis-inspired',
        name: Category.SPORT,
        gender: 'Women',
        url: 'https://www.aloyoga.com/he-il/collections/tennis-inspired',
      },
      {
        id: 'lounge-shop',
        name: Category.HOME,
        gender: 'Women',
        url: 'https://www.aloyoga.com/he-il/collections/lounge-shop',
      },
      {
        id: 'train',
        name: Category.SPORT,
        gender: 'Women',
        url: 'https://www.aloyoga.com/he-il/collections/train',
      },
      {
        id: 'hats',
        name: Category.HATS,
        gender: 'Women',
        url: 'https://www.aloyoga.com/he-il/collections/hats'
      },
      {
        id: 'snickers',
        name: Category.SNICKERS,
        gender: 'Women',
        url: 'https://www.aloyoga.com/he-il/collections/sneakers'
      },
      {
        id: 'flip-flops',
        name: Category.FLIP_FLOPS,
        gender: 'Women',
        url: 'https://www.aloyoga.com/he-il/collections/slides'
      },
      {
        id: 'socks',
        name: Category.SOCKS,
        gender: 'Women',
        url: 'https://www.aloyoga.com/he-il/collections/socks'
      },
      {
        id: 'bags',
        name: Category.BAGS,
        gender: 'Women',
        url: 'https://www.aloyoga.com/he-il/collections/bags',
      },
      // --- Men ---
      {
        id: 'tees-tanks',
        name: Category.SHIRTS,
        gender: 'Men',
        url: 'https://www.aloyoga.com/he-il/collections/tees-tanks',
      },
      {
        id: 'mens-shorts',
        name: Category.SHORTS,
        gender: 'Men',
        url: 'https://www.aloyoga.com/he-il/collections/mens-shorts',
      },
      {
        id: 'mens-sweatshirts-hoodies',
        name: Category.SWEATERS,
        gender: 'Men',
        url: 'https://www.aloyoga.com/he-il/collections/mens-sweatshirts-hoodies',
      },
      {
        id: 'mens-pants',
        name: Category.PANTS,
        gender: 'Men',
        url: 'https://www.aloyoga.com/he-il/collections/mens-pants',
      },
      {
        id: 'mens-sweatpants',
        name: Category.JOGGERS,
        gender: 'Men',
        url: 'https://www.aloyoga.com/he-il/collections/mens-sweatpants',
      },
      {
        id: 'mens-jackets',
        name: Category.JACKETS_COATS,
        gender: 'Men',
        url: 'https://www.aloyoga.com/he-il/collections/mens-jackets',
      },
      {
        id: 'mens-sweaters',
        name: Category.SWEATERS,
        gender: 'Men',
        url: 'https://www.aloyoga.com/he-il/collections/mens-sweaters',
      },
      {
        id: 'mens-underwear',
        name: Category.BOXERS,
        gender: 'Men',
        url: 'https://www.aloyoga.com/he-il/collections/mens-underwear',
      },
      // Men Highlights
      {
        id: 'mens-bestsellers',
        name: Category.CLOTHING,
        gender: 'Men',
        url: 'https://www.aloyoga.com/he-il/collections/mens-bestsellers',
      },
      {
        id: 'mens-new-arrivals',
        name: Category.CLOTHING,
        gender: 'Men',
        url: 'https://www.aloyoga.com/he-il/collections/mens-new-arrivals',
      },
      {
        id: 'mens-almost-gone',
        name: Category.CLOTHING,
        gender: 'Men',
        url: 'https://www.aloyoga.com/he-il/collections/mens-almost-gone',
      },
      {
        id: 'new-to-alo-him',
        name: Category.CLOTHING,
        gender: 'Men',
        url: 'https://www.aloyoga.com/he-il/pages/new-to-alo#for-him',
      },
      // Men by Activity
      {
        id: 'mens-train',
        name: Category.SPORT,
        gender: 'Men',
        url: 'https://www.aloyoga.com/he-il/collections/mens-train',
      },
      {
        id: 'mens-run',
        name: Category.RUNNING,
        gender: 'Men',
        url: 'https://www.aloyoga.com/he-il/collections/mens-run',
      },
      {
        id: 'mens-yoga',
        name: Category.SPORT,
        gender: 'Men',
        url: 'https://www.aloyoga.com/he-il/collections/mens-yoga',
      },
      {
        id: 'mens-tennis',
        name: Category.SPORT,
        gender: 'Men',
        url: 'https://www.aloyoga.com/he-il/collections/mens-tennis',
      },
      {
        id: 'mens-lounge-shop',
        name: Category.CLOTHING,
        gender: 'Men',
        url: 'https://www.aloyoga.com/he-il/collections/mens-lounge-shop',
      },
      // Men Wellness/Beauty
      {
        id: 'beauty-shop-all-men',
        name: Category.BEAUTY,
        gender: 'Men',
        url: 'https://www.aloyoga.com/he-il/collections/beauty-shop-all',
      },
      {
        id: 'face-men',
        name: Category.WELLNESS,
        gender: 'Men',
        url: 'https://www.aloyoga.com/he-il/collections/face',
      },
      {
        id: 'body-men',
        name: Category.WELLNESS,
        gender: 'Men',
        url: 'https://www.aloyoga.com/he-il/collections/body',
      },
      {
        id: 'homecare-men',
        name: Category.HOME,
        gender: 'Men',
        url: 'https://www.aloyoga.com/he-il/collections/homecare',
      },
      {
        id: 'haircare-men',
        name: Category.WELLNESS,
        gender: 'Men',
        url: 'https://www.aloyoga.com/he-il/collections/haircare',
      },
      {
        id: 'gels-men',
        name: Category.WELLNESS,
        gender: 'Men',
        url: 'https://www.aloyoga.com/he-il/collections/gels',
      },
    ];
  }

  private getHandleForCategory(category: BaseCategory): string {
    // Map category to handle used in GraphQL API
    // For now, only leggings
    return 'womens-leggings';
  }

  private async fetchAloYogaProducts(handle: string, offset: number, limit: number = 15) {
    const GRAPHQL_URL = 'https://product-service.alo.software/graphql?opName=GetCollectionData&operationName=GetCollectionData';
    const variables = {
      handle,
      offset,
      limit,
      sortKey: 'DEFAULT',
      filters: [],
      countryCode: 'IL',
    };
    const extensions = {
      persistedQuery: {
        version: 1,
        sha256Hash: '1647816df62eafdb2ef8305209f54c5c24a715ee12af8e0a86721913abb10dd1',
      },
    };
    const url = `${GRAPHQL_URL}&variables=${encodeURIComponent(JSON.stringify(variables))}&extensions=${encodeURIComponent(JSON.stringify(extensions))}`;
    const headers = {
      'accept': 'application/json',
      'accept-language': 'en-US,en;q=0.9,he;q=0.8',
      'content-type': 'application/json',
      'origin': 'https://www.aloyoga.com',
    };
    const res = await axios.get(url, { headers });
    return res.data;
  }

  protected async scrapeCategory(category: BaseCategory): Promise<Product[]> {
    const products: Product[] = [];
    const parts = category.url.split('/');
    const handle = parts[parts.length - 1];
    let offset = 0;
    const limit = 15;
    let page = 0;
    const maxPages = 20;
    while (page < maxPages) {
      const data = await this.fetchAloYogaProducts(handle, offset, limit);
      // Use .nodes for the products array
      const items = data?.data?.productsByCollectionHandle?.products?.nodes || [];
      if (!items.length) break;
      for (const item of items) {
        const title = item.title;
        const url = `https://www.aloyoga.com/he-il/products/${item.handle}`;
        const images = item.images;
        const colorOption = item.options?.find((opt: any) => opt.name === 'Color');
        const colors = colorOption ? colorOption.values : [];
        const price = item.priceRange.minVariantPrice.amount;
        const oldPrice = item.priceRange.maxVariantPrice.amount;
        const salePercent = calcSalePercent(price, oldPrice);
        products.push(this.createProduct({
          title,
          url,
          images,
          colors: extractColors(title, colors),
          price,
          oldPrice,
          salePercent,
          currency: 'ILS',
          brand: 'Alo Yoga',
          categories: [category.name],
          gender: category.gender,
        }));
      }
      offset += limit;
      page++;
    }
    return products;
  }
}

// Standalone runner
async function main() {
  const scraper = new AloYogaScraper();
  await scraper.run();
}

if (require.main === module) {
  main();
} 