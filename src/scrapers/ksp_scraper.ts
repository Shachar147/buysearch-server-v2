import axios from 'axios';
import { BaseScraper, Category as CategoryType } from './base/base-scraper';
import { Category } from '../category.constants';
import { Product, calcSalePercent, normalizeBrandName, normalizeCategories } from './base/scraper_utils';
import * as dotenv from 'dotenv';
import { extractColorsWithHebrew } from '../color.constants';
dotenv.config();

// Define categories for KSP based on their website structure
const CATEGORIES: CategoryType[] = [
  {
    id: 'women-perfumes',
    name: Category.PERFUMES,
    gender: 'Women',
    url: 'https://ksp.co.il/web/cat/4544..4546..61652'
  },
  {
    id: 'men-perfumes',
    name: Category.PERFUMES,
    gender: 'Men',
    url: 'https://ksp.co.il/web/cat/4544..4620'
  },
  {
    id: 'unisex-perfumes',
    name: Category.PERFUMES,
    gender: 'Unisex',
    url: 'https://ksp.co.il/web/cat/4544..11484..61652'
  },
  {
    id: 'underwear',
    name: Category.UNDERWEAR,
    gender: 'Men',
    url: 'https://ksp.co.il/web/cat/8372..36749..67180'
  },
  {
    id: 'beauty',
    name: Category.BEAUTY,
    gender: 'Women',
    url: 'https://ksp.co.il/web/cat/9125'
  },
  {
    id: 'charging-batteries',
    name: Category.ELECTRONICS,
    gender: 'Unisex',
    url: 'https://ksp.co.il/web/cat/1083'
  },
  {
    id: 'phones',
    name: Category.PHONES,
    gender: 'Unisex',
    url: 'https://ksp.co.il/web/cat/573'
  },
  {
    id: 'laptops',
    name: Category.LAPTOPS,
    gender: 'Unisex',
    url: 'https://ksp.co.il/web/cat/31635..271'
  },
  {
    id: 'smartwatches',
    name: Category.SMART_WATCHES,
    gender: 'Unisex',
    url: 'https://ksp.co.il/web/cat/31635..2085'
  },
  {
    id: 'tablets',
    name: Category.TABLETS,
    gender: 'Unisex',
    url: 'https://ksp.co.il/web/cat/31635..270..61845'
  },
  {
    id: 'tvs',
    name: Category.TVS,
    gender: 'Unisex',
    url: 'https://ksp.co.il/web/cat/3158'
  }
//   {
//     id: 'women-fashion',
//     name: Category.CLOTHING,
//     gender: 'Women',
//     url: 'https://ksp.co.il/web/cat/4544..4546..23035'
//   },
//   {
//     id: 'men-fashion',
//     name: Category.CLOTHING,
//     gender: 'Men',
//     url: 'https://ksp.co.il/web/cat/4544..4546..26081'
//   },
//   {
//     id: 'kids-fashion',
//     name: Category.CLOTHING,
//     gender: 'Kids',
//     url: 'https://ksp.co.il/web/cat/4544..4546..16777'
//   },
//   {
//     id: 'accessories',
//     name: Category.ACCESSORIES,
//     gender: 'Unisex',
//     url: 'https://ksp.co.il/web/cat/4544..4546..4586'
//   },
//   {
//     id: 'bags',
//     name: Category.BAGS,
//     gender: 'Women',
//     url: 'https://ksp.co.il/web/cat/4544..4546..6469'
//   },
//   {
//     id: 'shoes',
//     name: Category.SHOES,
//     gender: 'Unisex',
//     url: 'https://ksp.co.il/web/cat/4544..4546..31358'
//   },
//   {
//     id: 'jewelry',
//     name: Category.JEWELRY,
//     gender: 'Women',
//     url: 'https://ksp.co.il/web/cat/4544..4546..30049'
//   }
];

interface KSPProduct {
  id: string;
  name: string;
  price: number;
  min_eilat_price?: number;
  brandName: string;
  img: string;
  uin: string;
  is_out_of_stock?: boolean;
  // Additional fields that might be present
  title?: string;
  description?: string;
  category?: string;
  availability?: string;
}

interface KSPApiResponse {
  result: {
    items: KSPProduct[];
    products_total: number;
    timestamp: string;
    main_world_data?: {
      id: number;
      title: string;
    };
    minMax?: {
      min: number;
      max: number;
      current_min: number;
      current_max: number;
    };
  };
}

export class KSPScraper extends BaseScraper {
  protected readonly scraperName = 'KSP';
  protected readonly source = 'KSP';

  protected getCategories(): CategoryType[] {
    return CATEGORIES;
  }

  protected async scrapeCategory(category: CategoryType): Promise<Product[]> {
    return await this.scrapeKSPCategory(category);
  }

  protected async initialize(): Promise<void> {
    // No special initialization needed for KSP
  }

  private async scrapeKSPCategory(category: CategoryType): Promise<Product[]> {
    const allProducts: Product[] = [];
    let page = 1;
    const MAX_PAGES = 50; // Safety limit
    let hasMore = true;

    // Extract category ID from URL
    const categoryId = this.extractCategoryId(category.url);
    if (!categoryId) {
      this.logError(`Could not extract category ID from URL: ${category.url}`);
      return [];
    }

    this.logProgress(`Starting to scrape KSP category: ${category.name} (${category.gender})`);

    while (hasMore && page <= MAX_PAGES) {
      try {
        const apiUrl = `https://ksp.co.il/m_action/api/category/${categoryId}?sort=5&page=${page}`;
        this.logProgress(`Fetching page ${page} from: ${apiUrl}`);

        const response = await axios.get<KSPApiResponse>(apiUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
            'Accept': 'application/json',
            'Accept-Language': 'en-US,en;q=0.9,he;q=0.8',
            'Referer': category.url,
            'Origin': 'https://ksp.co.il'
          },
          timeout: 30000
        });

        const data = response.data;
        const products = data.result?.items || [];

        if (products.length === 0) {
          this.logProgress(`No more products found on page ${page}`);
          hasMore = false;
        } else {
          const parsedProducts = this.parseKSPProducts(products, category);
          allProducts.push(...parsedProducts);
          this.logProgress(`Found ${parsedProducts.length} products on page ${page}, total: ${allProducts.length}`);

          // Check if we've reached the end
          if (products.length < 12) { // Assuming 12 is the default page size
            hasMore = false;
          } else {
            page++;
          }
        }

        // Add delay between requests
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        this.logError(`Error fetching page ${page} for category ${category.name}:`, error);
        hasMore = false;
      }
    }

    this.logProgress(`Finished scraping KSP category ${category.name}. Total products: ${allProducts.length}`);
    return allProducts;
  }

  private extractCategoryId(url: string): string | null {
    // Extract category ID from URL like "https://ksp.co.il/web/cat/4544..4546..61652"
    const match = url.match(/\/cat\/([^\/]+)$/);
    return match ? match[1] : null;
  }

  private parseKSPProducts(products: KSPProduct[], category: CategoryType): Product[] {
    return products
      .filter(product => !product.is_out_of_stock)
      .map(product => this.parseKSPProduct(product, category))
      .filter((product): product is Product => product !== null);
  }

  private parseKSPProduct(product: KSPProduct, category: CategoryType): Product | null {
    try {
      // Clean and normalize the title
      let title = product.name.trim();
      
      // Remove any Unicode escape sequences and normalize
      title = title.replace(/\\u[\dA-F]{4}/gi, (match) => {
        return String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16));
      });

      // Use price, not eilat_price as requested
      const price = product.price || 0;
    //   const eilatPrice = product.min_eilat_price; // todo complete: add it to Product entity
      const oldPrice = undefined;
      
      // Calculate sale percentage
      const salePercent = oldPrice ? calcSalePercent(price, oldPrice) : null;

      // Normalize brand name
      const brand = normalizeBrandName(product.brandName || '');

      // Extract colors from title and any available color data
      const colors = extractColorsWithHebrew(title, [], this.source);

      // Normalize categories
      const categories = normalizeCategories([category.name]);

      // Create product URL
      const productUrl = `https://ksp.co.il/web/item/${product.uin}`;

      // Create image URL
      const imageUrl = product.img;

      if (!title || !productUrl || !price){
        console.log("Skipping product", {
          title,
          productUrl,
          price,
          product
        });
        return;
      }

      return this.createProduct({
        title,
        url: productUrl,
        images: product.img ? [imageUrl] : [],
        colors,
        price,
        oldPrice,
        salePercent,
        currency: 'ILS',
        brand,
        categories,
        gender: category.gender
      });

    } catch (error) {
      this.logError(`Error parsing KSP product ${product.id}:`, error);
      return null;
    }
  }
}

// Run the scraper if this file is executed directly
if (require.main === module) {
  const scraper = new KSPScraper();
  scraper.run().catch(console.error);
} 