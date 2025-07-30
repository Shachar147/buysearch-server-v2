import { fetchPageWithBrowser } from './base/browser-helpers';
import * as cheerio from 'cheerio';
import { BaseScraper, Category as CategoryType } from './base/base-scraper';
import { Category } from '../category.constants';
import {
  Product,
  calcSalePercent,
  normalizeBrandName,
  normalizeCategories,
} from './base/scraper_utils';
import * as dotenv from 'dotenv';
import { extractColorsWithHebrew } from '../color.constants';
dotenv.config();

export class HamashbirScraper extends BaseScraper {
  protected readonly scraperName = 'Hamashbir';
  protected readonly source = 'Hamashbir';

  // Define categories for Hamashbir
  private readonly CATEGORIES: CategoryType[] = [
    // Women's Clothing
    {
      id: 'women-clothing',
      name: Category.T_SHIRTS,
      gender: 'Women',
      url: 'https://365mashbir.co.il/collections/khvltsvt',
    },
    {
      id: 'women-pants',
      name: Category.PANTS,
      gender: 'Women',
      url: 'https://365mashbir.co.il/collections/mknsyym-nshym',
    },
    {
      id: 'women-jeans',
      name: Category.JEANS,
      gender: 'Women',
      url: 'https://365mashbir.co.il/collections/%D7%92%D7%99%D7%A0%D7%A1%D7%99%D7%9D-%D7%9C%D7%A0%D7%A9%D7%99%D7%9D',
    },
    {
      id: 'women-dresses',
      name: Category.DRESSES,
      gender: 'Women',
      url: 'https://365mashbir.co.il/collections/shmlvt-vkhtsyvt',
    },
    {
      id: 'women-skirts',
      name: Category.SKIRTS,
      gender: 'Women',
      url: 'https://365mashbir.co.il/collections/%D7%97%D7%A6%D7%90%D7%99%D7%95%D7%AA-1',
    },
    {
      id: 'women-sweaters',
      name: Category.SWEATERS,
      gender: 'Women',
      url: 'https://365mashbir.co.il/collections/%D7%A1%D7%95%D7%95%D7%98%D7%A9%D7%99%D7%A8%D7%98%D7%99%D7%9D-%D7%95%D7%A1%D7%A8%D7%99%D7%92%D7%99%D7%9D-%D7%9C%D7%A0%D7%A9%D7%99%D7%9D',
    },
    {
      id: 'women-kintwear',
      name: Category.KNITWEAR,
      gender: 'Women',
      url: 'https://365mashbir.co.il/collections/%D7%A1%D7%A8%D7%99%D7%92%D7%99%D7%9D',
    },
    {
      id: 'women-jackets',
      name: Category.JACKETS_COATS,
      gender: 'Women',
      url: 'https://365mashbir.co.il/collections/%D7%9E%D7%A2%D7%99%D7%9C%D7%99%D7%9D-%D7%95%D7%92%D7%A7%D7%98%D7%99%D7%9D-%D7%9C%D7%A0%D7%A9%D7%99%D7%9D',
    },
    {
      id: 'women-shoes',
      name: Category.SHOES,
      gender: 'Women',
      url: 'https://365mashbir.co.il/collections/n-ly-nshym',
    },
    {
      id: 'women-lingerie',
      name: Category.LINGERIE,
      gender: 'Women',
      url: 'https://365mashbir.co.il/collections/hlbshh-tkhtvnh-lnshym',
    },
    {
      id: 'women-swimwear',
      name: Category.SWIMWEAR,
      gender: 'Women',
      url: 'https://365mashbir.co.il/collections/%D7%91%D7%92%D7%93%D7%99-%D7%99%D7%9D-%D7%9C%D7%A0%D7%A9%D7%99%D7%9D',
    },
    {
      id: 'women-beachwear',
      name: Category.BEACHWEAR,
      gender: 'Women',
      url: 'https://365mashbir.co.il/collections/%D7%91%D7%92%D7%93%D7%99-%D7%97%D7%95%D7%A3',
    },
    {
      id: 'women-sale',
      name: 'Sale',
      gender: 'Women',
      url: 'https://365mashbir.co.il/collections/%D7%90%D7%95%D7%A4%D7%A0%D7%AA-%D7%A0%D7%A9%D7%99%D7%9D-sale',
    },
    {
      id: 'women-accessories',
      name: Category.ACCESSORIES,
      gender: 'Women',
      url: 'https://365mashbir.co.il/collections/%D7%90%D7%A7%D7%A1%D7%A1%D7%95%D7%A8%D7%99%D7%96-%D7%9C%D7%A0%D7%A9%D7%99%D7%9D',
    },
    // Home
    {
      id: 'kitchen',
      name: Category.HOME_KITCHEN,
      gender: 'Unisex',
      url: 'https://365mashbir.co.il/collections/lmtbkh',
    },
    {
      id: 'kitchen',
      name: Category.HOME_KITCHEN,
      gender: 'Unisex',
      url: 'https://365mashbir.co.il/collections/lshvlkhn-hvkl',
    },
    {
      id: 'bath',
      name: Category.HOME_BATH,
      gender: 'Unisex',
      url: 'https://365mashbir.co.il/collections/lkhdr-rkhtsh',
    },
    {
      id: 'sleep',
      name: Category.HOME_SLEEP,
      gender: 'Unisex',
      url: 'https://365mashbir.co.il/collections/lkhdr-hshynh',
    },
    {
      id: 'decor',
      name: Category.HOME_DECOR,
      gender: 'Unisex',
      url: 'https://365mashbir.co.il/collections/%D7%A2%D7%99%D7%A6%D7%95%D7%91-%D7%94%D7%91%D7%99%D7%AA',
    },
    // Men's Clothing
    {
      id: 'men-clothing',
      name: Category.CLOTHING,
      gender: 'Men',
      url: 'https://365mashbir.co.il/collections/gbrym',
    },
    {
      id: 'men-shoes',
      name: Category.SHOES,
      gender: 'Men',
      url: 'https://365mashbir.co.il/collections/n-ly-gbrym',
    },
    {
      id: 'men-lingerie',
      name: Category.LINGERIE,
      gender: 'Men',
      url: 'https://365mashbir.co.il/collections/hlbshh-tkhtvnh-lgbrym',
    },
    {
      id: 'men-accessories',
      name: Category.ACCESSORIES,
      gender: 'Men',
      url: 'https://365mashbir.co.il/collections/%D7%90%D7%A7%D7%A1%D7%A1%D7%95%D7%A8%D7%99%D7%96-%D7%92%D7%91%D7%A8%D7%99%D7%9D',
    },
    {
      id: 'men-sale',
      name: 'Sale',
      gender: 'Men',
      url: 'https://365mashbir.co.il/collections/%D7%90%D7%95%D7%A4%D7%A0%D7%AA-%D7%92%D7%91%D7%A8%D7%99%D7%9D-sale',
    },
  ];

  protected getCategories(): CategoryType[] {
    return this.CATEGORIES;
  }

  protected async scrapeCategory(category: CategoryType): Promise<Product[]> {
    return await this.scrapeHamashbirCategory(category);
  }

  protected async initialize(): Promise<void> {
    this.logProgress('Initializing Hamashbir scraper...');
    this.totalCategories = this.CATEGORIES.length;
  }

  private async scrapeHamashbirCategory(
    category: CategoryType,
  ): Promise<Product[]> {
    this.logProgress(`Fetching ${category.url}`);

    try {
      const html = await this.fetchHamashbirPage(category.url);
      const $ = cheerio.load(html);

      // Find all product items
      const productItems = $('.card-wrapper');

      if (productItems.length === 0) {
        this.logProgress(`No products found for category ${category.name}`);
        return [];
      }

      this.logProgress(
        `Found ${productItems.length} products in ${category.name}`,
      );

      const products: Product[] = [];
      productItems.each((_, item) => {
        const product = this.parseHamashbirProduct($(item), category, $);
        if (product) {
          products.push(this.createProduct(product));
        }
      });

      this.logProgress(
        `Successfully parsed ${products.length} products from ${category.name}`,
      );
      return products;
    } catch (error) {
      this.logError(`Error scraping category ${category.name}:`, error);
      return [];
    }
  }

  private async fetchHamashbirPage(url: string): Promise<string> {
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

  private parseHamashbirProduct(
    productItem: cheerio.Cheerio<any>,
    category: CategoryType,
    $: cheerio.CheerioAPI,
  ): Product | null {
    try {
      // Extract title
      const titleElement = productItem.find('.card__heading a');
      const title = titleElement.text().trim();

      if (!title) {
        return null;
      }

      // Skip gift cards and non-product items
      if (
        title.toLowerCase().includes('gift') ||
        title.toLowerCase().includes('גיפט')
      ) {
        return null;
      }

      // Extract brand from vendor link
      const brandElement = productItem.find('.product-vendor-link');
      const brand = brandElement.text().trim() || 'Hamashbir';

      // Extract URL
      const urlElement = productItem.find('.card__heading a');
      const relativeUrl = urlElement.attr('href');
      const url = relativeUrl ? `https://365mashbir.co.il${relativeUrl}` : '';

      // Extract images
      const images: string[] = [];
      const imageElements = productItem.find('.card__media img');

      imageElements.each((_, img) => {
        const imgSrc = $(img).attr('src');
        if (imgSrc) {
          // Convert relative URLs to absolute
          const fullUrl = imgSrc.startsWith('//') ? `https:${imgSrc}` : imgSrc;
          if (!images.includes(fullUrl)) {
            images.push(fullUrl);
          }
        }
      });

      // Extract prices - Hamashbir has different price structures
      let price: number | null = null;
      let oldPrice: number | null = null;

      // Check if this is a sale item (has sale price structure)
      const salePriceElement = productItem.find(
        '.price--on-sale .price-item--sale',
      );
      const regularPriceElement = productItem.find(
        '.price--on-sale .price-item--regular',
      );

      if (salePriceElement.length > 0 && regularPriceElement.length > 0) {
        // This is a sale item
        const salePriceText = salePriceElement.text().trim();
        const regularPriceText = regularPriceElement.text().trim();

        if (salePriceText) {
          const saleMatch = salePriceText.replace(/[₪,]/g, '').match(/[\d.]+/);
          if (saleMatch) {
            price = parseFloat(saleMatch[0]);
          }
        }

        if (regularPriceText) {
          const regularMatch = regularPriceText
            .replace(/[₪,]/g, '')
            .match(/[\d.]+/);
          if (regularMatch) {
            oldPrice = parseFloat(regularMatch[0]);
          }
        }
      } else {
        // Regular item - single price
        const singlePriceElement = productItem.find(
          '.price__regular .price-item--last',
        );
        const singlePriceText = singlePriceElement.text().trim();

        if (singlePriceText) {
          const singleMatch = singlePriceText
            .replace(/[₪,]/g, '')
            .match(/[\d.]+/);
          if (singleMatch) {
            price = parseFloat(singleMatch[0]);
          }
        }
      }

      // Skip products with no price
      if (!price) {
        return null;
      }

      // Extract product ID from data attributes
      const productId =
        productItem.find('img').first().attr('data-item_id') || '';

      // Extract sale badge (like "60% הנחה")
      const saleBadgeElement = productItem.find('.product-badge__content');
      const saleLabel = saleBadgeElement.text().trim();

      // Determine if on sale
      const isOnSale = oldPrice !== null && price !== null && oldPrice > price;
      const salePercent =
        isOnSale && oldPrice && price ? calcSalePercent(oldPrice, price) : null;

      // Extract colors from swatches
      const colors: string[] = [];
      const colorSwatches = productItem.find(
        '.card__variant-list-color .card__variant-list-item',
      );
      colorSwatches.each((_, swatch) => {
        const swatchElement = $(swatch);
        const colorTitle = swatchElement.find('a').attr('title');
        if (colorTitle) {
          colors.push(colorTitle.trim());
        }
      });

      // Normalize brand name
      const normalizedBrand = normalizeBrandName(brand);

      // Extract colors from Hebrew text if available
      const extractedColors = extractColorsWithHebrew(
        title + ' ' + colors.join(' '),
        colors,
        this.source,
      );

      const product: Product = {
        title,
        brand: normalizedBrand,
        price,
        oldPrice,
        salePercent,
        currency: 'ILS',
        url,
        images,
        colors: extractedColors,
        source: this.source,
        categories: normalizeCategories([category.name]),
        gender: category.gender,
        isSellingFast: false, // Hamashbir doesn't seem to have this indicator
      };

      return product;
    } catch (error) {
      this.logError('Error parsing Hamashbir product:', error);
      return null;
    }
  }
}

// Run the scraper if this file is executed directly
if (require.main === module) {
  const scraper = new HamashbirScraper();
  scraper.run().catch(console.error);
}
