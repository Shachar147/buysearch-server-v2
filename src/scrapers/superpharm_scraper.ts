import { fetchPageWithBrowser } from './base/browser-helpers';
import * as cheerio from 'cheerio';
import { BaseScraper, Category as CategoryType } from './base/base-scraper';
import { Category } from '../category.constants';
import { Product, calcSalePercent, normalizeBrandName, normalizeCategories } from './base/scraper_utils';
import * as dotenv from 'dotenv';
import { extractColorsWithHebrew } from '../color.constants';
dotenv.config();

// Define categories for SuperPharm based on their website structure
const CATEGORIES: CategoryType[] = [
  {
    id: 'women-perfumes',
    name: Category.PERFUMES,
    gender: 'Women',
    url: 'https://shop.super-pharm.co.il/cosmetics/perfumes/c/20110000?q=:relevance:category:20111100:category:20111300:category:20111600:category:20112000'
  },
  {
    id: 'men-perfumes',
    name: Category.PERFUMES,
    gender: 'Men',
    url: 'https://shop.super-pharm.co.il/cosmetics/perfumes/c/20110000?q=:relevance:category:20111900:category:20111000:category:20111200:category:20111700'
  },
  {
    id: 'unisex-perfumes',
    name: Category.PERFUMES,
    gender: 'Unisex',
    url: 'https://shop.super-pharm.co.il/cosmetics/perfumes/c/20110000?q=:relevance:category:20112100:category:20111400:category:20111500:category:20111800'
  },
  {
    id: 'men-fashion',
    name: Category.CLOTHING,
    gender: 'Men',
    url: 'https://shop.super-pharm.co.il/fashion/men/c/40100000'
  },
  {
    id: 'women-fashion',
    name: Category.CLOTHING,
    gender: 'Women',
    url: 'https://shop.super-pharm.co.il/fashion/women/c/40130000'
  },
  {
    id: 'kids-fashion',
    name: Category.CLOTHING,
    gender: 'Kids',
    url: 'https://shop.super-pharm.co.il/fashion/boys/c/40120000'
  },
  {
    id: 'face-makeup',
    name: Category.MAKEUP,
    gender: 'Women',
    url: 'https://shop.super-pharm.co.il/cosmetics/facial-makeup/c/20180000'
  },
  {
    id: 'eye-makeup',
    name: Category.MAKEUP,
    gender: 'Women',
    url: 'https://shop.super-pharm.co.il/cosmetics/eye-makeup/c/20170000'
  },
  {
    id: 'lips-makeup',
    name: Category.MAKEUP,
    gender: 'Women',
    url: 'https://shop.super-pharm.co.il/cosmetics/lip-makeup/c/20190000'
  },
  {
    id: 'eyebrows-makeup',
    name: Category.MAKEUP,
    gender: 'Women',
    url: 'https://shop.super-pharm.co.il/cosmetics/eyebrows-makeup/c/20100000'
  },
  {
    id: 'nails-makeup',
    name: Category.MAKEUP,
    gender: 'Women',
    url: 'https://shop.super-pharm.co.il/cosmetics/nail-care/c/20130000'
  },
  {
    id: 'garden-and-terrace',
    name: Category.HOME_OUTDOOR_FURNITURE,
    gender: 'Unisex',
    url: 'https://shop.super-pharm.co.il/home/garden-and-terrace/c/10120000'
  },
  {
    id: 'handbags-for-women',
    name: Category.BAGS,
    gender: 'Women',
    url: 'https://shop.super-pharm.co.il/fashion/cases/handbags-for-women/c/40152500'
  },
  {
    id: 'backpacks-for-men',
    name: Category.BACKPACKS,
    gender: 'Men',
    url: 'https://shop.super-pharm.co.il/fashion/cases/backpacks-for-men/c/40152200'
  },
  {
    id: 'suitcases',
    name: Category.SUITCASES,
    gender: 'Unisex',
    url: 'https://shop.super-pharm.co.il/fashion/cases/suitcases/c/40151800'
  },
  {
    id: 'handbags',
    name: Category.HAND_BAGS,
    gender: 'Men',
    url: 'https://shop.super-pharm.co.il/fashion/cases/handbags-for-men/c/40152400',
  },
  // https://shop.super-pharm.co.il/cosmetics/cosmetics-brands-care-products/c/20230000
  {
    id: 'cosmetics',
    name: Category.BEAUTY,
    gender: 'Women',
    url: 'https://shop.super-pharm.co.il/cosmetics/cosmetics-brands-care-products/c/20230000'
  },
  {
    id: 'beauty-men',
    name: Category.BEAUTY,
    gender: 'Men',
    url: 'https://shop.super-pharm.co.il/cosmetics/cosmetics-brands-care-products/mens-care-products/c/20231500'
  }
  // todo add:
  // - makeup
  // - skipcare
  // - home?
  // more
];

export class SuperPharmScraper extends BaseScraper {
  protected readonly scraperName = 'SuperPharm';
  protected readonly source = 'SuperPharm';

  protected getCategories(): CategoryType[] {
    return CATEGORIES;
  }

  protected async scrapeCategory(category: CategoryType): Promise<Product[]> {
    return await this.scrapeSuperPharmCategory(category);
  }

  protected async initialize(): Promise<void> {
    this.logProgress('Initializing SuperPharm scraper...');
    this.totalCategories = CATEGORIES.length;
  }

  private async scrapeSuperPharmCategory(category: CategoryType): Promise<Product[]> {
    this.logProgress(`Fetching ${category.url}`);
    
    try {
      let allProducts: Product[] = [];
      let page = 0; // SuperPharm uses 0-based pagination
      let hasMore = true;
      const MAX_PAGES = 300; // Safety limit
      const seenProductIds = new Set<string>(); // Track seen products to detect duplicates

      while (hasMore && page <= MAX_PAGES) {
        this.logProgress(`Fetching page ${page} for category ${category.name}`);
        
        const sign = category.url.includes('?') ? '&' : '?';
        const pageUrl = page === 0 ? category.url : `${category.url}${sign}page=${page}`;
        console.log(`Fetching page ${page} for category ${category.name} at ${pageUrl}`);
        const html = await this.fetchSuperPharmPage(pageUrl);
        
        if (!html) {
          hasMore = false;
          continue;
        }
        
        const products = this.parseSuperPharmProducts(html, category);
        
        if (products.length === 0) {
          hasMore = false;
        } else {
          // Check for duplicate products (same page content)
          let newProducts = 0;
          const uniqueProducts: Product[] = [];
          
          products.forEach(product => {
            const productId = product.url || product.title; // Use URL or title as unique identifier
            if (!seenProductIds.has(productId)) {
              seenProductIds.add(productId);
              uniqueProducts.push(product);
              newProducts++;
            }
          });
          
          if (newProducts === 0) {
            // All products on this page were already seen, stop pagination
            this.logProgress(`All products on page ${page} were duplicates, stopping pagination`);
            hasMore = false;
          } else {
            allProducts = allProducts.concat(uniqueProducts);
            this.logProgress(`Found ${newProducts} new products on page ${page}, total: ${allProducts.length}`);
            page++;
          }
        }

        // Add delay between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      this.logProgress(`Successfully scraped ${allProducts.length} products from ${category.name}`);
      return allProducts;
      
    } catch (error) {
      this.logError(`Error scraping category ${category.name}:`, error);
      return [];
    }
  }

  private async fetchSuperPharmPage(url: string): Promise<string> {
    try {
      return fetchPageWithBrowser(url, {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
        waitUntil: 'networkidle2',
        timeout: 60000,
        onPageReady: async (page) => {
          // Wait for products to load
          await page.waitForSelector('.item-box-link', { timeout: 10000 });
        }
      });
    } catch {
      return '';
    }
  }

  private parseSuperPharmProducts(html: string, category: CategoryType): Product[] {
    const $ = cheerio.load(html);
    const products: Product[] = [];

    // Find all product links
    const productLinks = $('.item-box-link');

    if (productLinks.length === 0) {
      this.logProgress(`No products found for category ${category.name}`);
      return [];
    }

    this.logProgress(`Found ${productLinks.length} products in ${category.name}`);

    productLinks.each((_, item) => {
      const product = this.parseSuperPharmProduct($(item), category, $);
      if (product) {
        products.push(this.createProduct(product));
      }
    });

    return products;
  }

  private parseSuperPharmProduct(productLink: cheerio.Cheerio<any>, category: CategoryType, $: cheerio.CheerioAPI): Product | null {
    try {
      // Check if product is out of stock
      const outOfStockElement = productLink.find('.out-of-stock');
      if (outOfStockElement.length > 0) {
        return null; // Skip out of stock products
      }

      // Extract title
      const titleElement = productLink.find('.title h2');
      const title = titleElement.text().trim();
      
      if (!title) {
        return null;
      }

      // Extract URL
      const url = productLink.attr('href');
      if (!url) {
        return null;
      }

      // Make URL absolute
      const absoluteUrl = url.startsWith('http') ? url : `https://shop.super-pharm.co.il${url}`;

      // Extract images
      const images: string[] = [];
      const imageElement = productLink.find('.item-image img');
      if (imageElement.length > 0) {
        const src = imageElement.attr('src');
        if (src) {
          images.push(src);
        }
      }

      // Extract brand from data attributes
      const brand = productLink.attr('data-brand') || '';

      // Extract prices
      let price: number | null = null;
      let oldPrice: number | null = null;

      // Check for sale price (discountprice attribute)
      const discountPriceAttr = productLink.find('.item-box').attr('data-discountprice');
      if (discountPriceAttr && discountPriceAttr !== '') {
        const discountPrice = parseFloat(discountPriceAttr.replace(',',' '));
        if (!isNaN(discountPrice)) {
          price = discountPrice;
        }
      }

      // Check for regular price (price attribute)
      const regularPriceAttr = productLink.find('.item-box').attr('data-price');
      if (regularPriceAttr && regularPriceAttr !== '') {
        const regularPrice = parseFloat(regularPriceAttr.replace(',',' '));
        if (!isNaN(regularPrice)) {
          if (price === null) {
            // No sale price, use regular price
            price = regularPrice;
          } else {
            // Sale price exists, use regular price as old price
            oldPrice = regularPrice;
          }
        }
      }

      // Fallback: extract from DOM elements
      if (price === null) {
        const priceElement = productLink.find('.item-price .shekels');
        if (priceElement.length > 0) {
          const priceText = priceElement.text().trim();
          const priceMatch = priceText.replace(/[₪,]/g, '').match(/[\d.]+/);
          if (priceMatch) {
            price = parseFloat(priceMatch[0]);
          }
        }
      }

      if (oldPrice === null) {
        const oldPriceElement = productLink.find('.old-price .shekels');
        if (oldPriceElement.length > 0) {
          const oldPriceText = oldPriceElement.text().trim();
          const oldPriceMatch = oldPriceText.replace(/[₪,]/g, '').match(/[\d.]+/);
          if (oldPriceMatch) {
            oldPrice = parseFloat(oldPriceMatch[0]);
          }
        }
      }

      // Skip products with no price
      if (!price) {
        return null;
      }

      // Extract product ID
      const productId = productLink.find('.item-box').attr('data-id') || '';

      // Determine if on sale
      const isOnSale = oldPrice !== null && price !== null && oldPrice > price;
      const salePercent = isOnSale && oldPrice && price ? calcSalePercent(oldPrice, price) : null;

      // Normalize brand name
      const normalizedBrand = normalizeBrandName(brand);

      // Extract colors from title and description
      const descriptionElement = productLink.find('.description-wrap span');
      const description = descriptionElement.text().trim();
      const extractedColors = extractColorsWithHebrew(title + ' ' + description, [], this.source);

      let gender = category.gender;
      if (title.includes('גברים') || title.includes('לגברים')) {
        gender = 'Men';
      } else if (title.includes('נשים') || title.includes('לנשים')) {
        gender = 'Women';
      } else if (title.includes('לילדים') || title.includes('לילד')) {
        gender = 'Kids';
      } else if (title.includes('יוניסקס') || title.toLowerCase().includes('unisex')) {
        gender = 'Unisex';
      }

      const product: Product = {
        title,
        brand: normalizedBrand,
        price,
        oldPrice,
        salePercent,
        currency: 'ILS',
        url: absoluteUrl,
        images,
        colors: extractedColors,
        source: this.source,
        categories: normalizeCategories([category.name]),
        gender,
        isSellingFast: false, // SuperPharm doesn't seem to have this indicator
      };

      return product;

    } catch (error) {
      this.logError('Error parsing SuperPharm product:', error);
      return null;
    }
  }
}

// Run the scraper if this file is executed directly
if (require.main === module) {
  const scraper = new SuperPharmScraper();
  scraper.run().catch(console.error);
} 