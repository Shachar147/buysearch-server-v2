import { fetchPageWithBrowser } from './base/browser-helpers';
import * as cheerio from 'cheerio';
import { BaseScraper, Category as CategoryType } from './base/base-scraper';
import { Category } from '../category.constants';
import { Product, normalizeBrandName, normalizeCategories } from './base/scraper_utils';
import * as dotenv from 'dotenv';
import { extractColorsWithHebrew } from 'src/color.constants';
dotenv.config();

export class CarolinaLemkeScraper extends BaseScraper {
  protected readonly scraperName = 'Carolina Lemke';
  protected readonly source = 'Carolina Lemke';

  // Define categories for Carolina Lemke
  private readonly CATEGORIES: CategoryType[] = [
    // Women's Sunglasses
    {
      id: 'women-sunglasses',
      name: Category.SUNGLASSES,
      gender: 'Women',
      url: 'https://www.carolinalemke.co.il/sunglasses?gender_group=1101'
    },
    {
      id: 'women-sunglasses-new',
      name: Category.SUNGLASSES,
      gender: 'Women',
      url: 'https://www.carolinalemke.co.il/sunglasses/new-collection-2025?gender_group=1101'
    },
    {
      id: 'women-sunglasses-best',
      name: Category.SUNGLASSES,
      gender: 'Women',
      url: 'https://www.carolinalemke.co.il/sunglasses/best-sellers?gender_group=1101'
    },
    {
      id: 'women-sunglasses-polarized',
      name: Category.SUNGLASSES,
      gender: 'Women',
      url: 'https://www.carolinalemke.co.il/sunglasses/polarized?gender_group=1101'
    },
    // Men's Sunglasses
    {
        id: 'men-sunglasses',
        name: Category.SUNGLASSES,
        gender: 'Men',
        url: 'https://www.carolinalemke.co.il/sunglasses?gender_group=1103'
    },
    {
    id: 'men-sunglasses-new',
    name: Category.SUNGLASSES,
    gender: 'Men',
    url: 'https://www.carolinalemke.co.il/sunglasses/new-collection-2025?gender_group=1103'
    },
    {
    id: 'men-sunglasses-best',
    name: Category.SUNGLASSES,
    gender: 'Men',
    url: 'https://www.carolinalemke.co.il/sunglasses/best-sellers?gender_group=1103'
    },
    {
    id: 'men-sunglasses-polarized',
    name: Category.SUNGLASSES,
    gender: 'Men',
    url: 'https://www.carolinalemke.co.il/sunglasses/polarized?gender_group=1103'
    },
    // Women's Eyeglasses
    {
      id: 'women-eyeglasses',
      name: Category.EYEGLASSES,
      gender: 'Women',
      url: 'https://www.carolinalemke.co.il/optic/women'
    },
    {
      id: 'women-eyeglasses-new',
      name: Category.EYEGLASSES,
      gender: 'Women',
      url: 'https://www.carolinalemke.co.il/optic/new-collection?gender_group=1101'
    },
    {
      id: 'women-eyeglasses-best',
      name: Category.EYEGLASSES,
      gender: 'Women',
      url: 'https://www.carolinalemke.co.il/optic/best-seller-optics?gender_group=1101'
    },
    // Men's Eyeglasses
    {
        id: 'men-eyeglasses',
        name: Category.EYEGLASSES,
        gender: 'Men',
        url: 'https://www.carolinalemke.co.il/optic/men'
    },
    {
        id: 'men-eyeglasses-new',
        name: Category.EYEGLASSES,
        gender: 'Men',
        url: 'https://www.carolinalemke.co.il/optic/new-collection?gender_group=1103'
    },
    {
        id: 'men-eyeglasses-best',
        name: Category.EYEGLASSES,
        gender: 'Men',
        url: 'https://www.carolinalemke.co.il/optic/best-seller-optics?gender_group=1103'
    },
    // Accessories
    {
      id: 'accessories',
      name: Category.ACCESSORIES,
      gender: 'Unisex',
      url: 'https://www.carolinalemke.co.il/accessories'
    }
  ];

  protected getCategories(): CategoryType[] {
    return this.CATEGORIES;
  }

  protected async scrapeCategory(category: CategoryType): Promise<Product[]> {
    return await this.scrapeCarolinaLemkeCategory(category);
  }

  protected async initialize(): Promise<void> {
    this.logProgress('Initializing Carolina Lemke scraper...');
    this.totalCategories = this.CATEGORIES.length;
  }

  private async scrapeCarolinaLemkeCategory(category: CategoryType): Promise<Product[]> {
    this.logProgress(`Fetching ${category.url}`);
    
    try {
      const html = await this.fetchCarolinaLemkePage(category.url);
      const $ = cheerio.load(html);
      
      // Find all product items - Carolina Lemke uses li.product-item
      const productItems = $('li.product-item');
      
      if (productItems.length === 0) {
        this.logProgress(`No products found for category ${category.name}`);
        return [];
      }

      this.logProgress(`Found ${productItems.length} products in ${category.name}`);

      const products: Product[] = [];
      productItems.each((_, item) => {
        const product = this.parseCarolinaLemkeProduct($(item), category, $);
        if (product) {
          products.push(this.createProduct(product));
        }
      });

      this.logProgress(`Successfully parsed ${products.length} products from ${category.name}`);
      return products;
      
    } catch (error) {
      this.logError(`Error scraping category ${category.name}:`, error);
      return [];
    }
  }

    private async fetchCarolinaLemkePage(url: string): Promise<string> {
    return fetchPageWithBrowser(url, {
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
      waitUntil: 'networkidle2',
      timeout: 60000,
      onPageReady: async (page) => {
        // Custom page logic can be added here
      }
    });
  }

  private parseCarolinaLemkeProduct(productItem: cheerio.Cheerio<any>, category: CategoryType, $: cheerio.CheerioAPI): Product | null {
    try {
      // Extract title - Carolina Lemke products have model names like "Emeline"
      const titleElement = productItem.find('.product-category-name, .product-name');
      const title = titleElement.text().trim();
      
      if (!title) {
        return null;
      }

      // Extract brand - Carolina Lemke is the main brand
      const brand = 'Carolina Lemke';

      // Extract URL
      const urlElement = productItem.find('.product_link_element, .action.product_link');
      const relativeUrl = urlElement.attr('href');
      const url = relativeUrl || '';

      // Extract images
      const images: string[] = [];
      const imageElements = productItem.find('.product-image-photo, .gallery-img');
      
      imageElements.each((_, img) => {
        const imgSrc = $(img).attr('src') || $(img).attr('data-src');
        if (imgSrc) {
          if (!images.includes(imgSrc)) {
            images.push(imgSrc);
          }
        }
      });

      // Extract prices - Carolina Lemke shows "As low as" pricing
      let price: number | null = null;
      let oldPrice: number | null = null;

      // Look for "As low as" price in the price box
      const priceElement = productItem.find('.price-final_price .price');
      const priceText = priceElement.text().trim();
      
      if (priceText) {
        const priceMatch = priceText.match(/(\d+(?:,\d+)*\.?\d*)/);
        if (priceMatch) {
          price = parseFloat(priceMatch[1].replace(/,/g, ''));
        }
      }

      // Skip products with no price
      if (!price) {
        return null;
      }

      // Extract product ID from data attributes
      const productId = productItem.attr('data-productid') || 
                       productItem.attr('data-id') || '';

      // Look for sale indicators in the data layer
      const dataLayerScript = productItem.find('script[data-type="datalayer"]').html();
      let isOnSale = false;
      let salePercent = null;

      if (dataLayerScript) {
        // Check for sale indicators in the data layer
        if (dataLayerScript.includes('"stampa_sale":"') && !dataLayerScript.includes('"stampa_sale":""')) {
          isOnSale = true;
          salePercent = 20; // Default sale percent
        }
      }

      // Extract colors from swatch options
      const colors: string[] = [];
      const colorSwatches = productItem.find('.swatch-option');
      
      colorSwatches.each((_, swatch) => {
        const swatchElement = $(swatch);
        const colorTitle = swatchElement.attr('title') || swatchElement.attr('option-label');
        if (colorTitle) {
          colors.push(colorTitle.trim());
        }
      });

      // Normalize brand name
      const normalizedBrand = normalizeBrandName(brand);

      // Extract colors from Hebrew text if available
      const extractedColors = extractColorsWithHebrew(title + ' ' + colors.join(' '), colors, this.source);

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
        isSellingFast: false, // Carolina Lemke doesn't seem to have this indicator
      };

      return product;

    } catch (error) {
      this.logError('Error parsing Carolina Lemke product:', error);
      return null;
    }
  }
}

// Run the scraper if this file is executed directly
if (require.main === module) {
  const scraper = new CarolinaLemkeScraper();
  scraper.run().catch(console.error);
} 