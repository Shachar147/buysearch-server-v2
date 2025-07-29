import { fetchPageWithBrowser } from './base/browser-helpers';
import * as cheerio from 'cheerio';
import { BaseScraper, Category as CategoryType } from './base/base-scraper';
import { Category } from '../category.constants';
import { Product, normalizeBrandName, normalizeCategories } from './base/scraper_utils';
import * as dotenv from 'dotenv';
import { extractColorsWithHebrew } from 'src/color.constants';
dotenv.config();

export class IOpticScraper extends BaseScraper {
  protected readonly scraperName = 'IOptic';
  protected readonly source = 'IOptic';

  // Define categories for IOptic
  private readonly CATEGORIES: CategoryType[] = [
    // Women's Sunglasses
    {
      id: 'women-sunglasses-miu',
      name: Category.SUNGLASSES,
      gender: 'Women',
      brand: 'Miu Miu',
      url: 'https://www.i-optic.co.il/%D7%9E%D7%A9%D7%A7%D7%A4%D7%99-%D7%A9%D7%9E%D7%A9-miu-miu'
    },
    {
        id: 'women-sunglasses-saint-laurent',
        name: Category.SUNGLASSES,
        gender: 'Women',
        brand: 'Saint Laurent',
        url: 'https://www.i-optic.co.il/%D7%9E%D7%A9%D7%A7%D7%A4%D7%99-%D7%A9%D7%9E%D7%A9-saint-laurent'
      },
      {
        id: 'women-sunglasses-lgr',
        name: Category.SUNGLASSES,
        gender: 'Women',
        brand: 'L.G.R',
        url: 'https://www.i-optic.co.il/%D7%9E%D7%A9%D7%A7%D7%A4%D7%99-%D7%A9%D7%9E%D7%A9-lgr'
      },
      {
        id: 'women-sunglasses-tom-ford',
        name: Category.SUNGLASSES,
        gender: 'Women',
        brand: 'Tom Ford',
        url: 'https://www.i-optic.co.il/%D7%9E%D7%A9%D7%A7%D7%A4%D7%99-%D7%A9%D7%9E%D7%A9-tom-ford'
      },
      {
        id: 'women-sunglasses-garrett-leight',
        name: Category.SUNGLASSES,
        gender: 'Women',
        brand: 'Garrett Leight',
        url: 'https://www.i-optic.co.il/%D7%9E%D7%A9%D7%A7%D7%A4%D7%99-%D7%A9%D7%9E%D7%A9-garrett-leight'
      },
      {
        id: 'women-sunglasses-swarovski',
        name: Category.SUNGLASSES,
        gender: 'Women',
        brand: 'Swarovski',
        url: 'https://www.i-optic.co.il/%D7%9E%D7%A9%D7%A7%D7%A4%D7%99-%D7%A9%D7%9E%D7%A9-swarovski'
      },
      {
        id: 'women-sunglasses-nia-milano',
        name: Category.SUNGLASSES,
        gender: 'Women',
        brand: 'Nia Milano',
        url: 'https://www.i-optic.co.il/%D7%9E%D7%A9%D7%A7%D7%A4%D7%99-%D7%A9%D7%9E%D7%A9-nia-milano'
      },
      {
        id: 'women-sunglasses-celine',
        name: Category.SUNGLASSES,
        gender: 'Women',
        brand: 'Celine',
        url: 'https://www.i-optic.co.il/%D7%9E%D7%A9%D7%A7%D7%A4%D7%99-%D7%A9%D7%9E%D7%A9-celine'
      },
      {
        id: 'women-sunglasses-fendi',
        name: Category.SUNGLASSES,
        gender: 'Women',
        brand: 'Fendi',
        url: 'https://www.i-optic.co.il/%D7%9E%D7%A9%D7%A7%D7%A4%D7%99-%D7%A9%D7%9E%D7%A9-fendi'
      },
      {
        id: 'women-sunglasses-burberry',
        name: Category.SUNGLASSES,
        gender: 'Women',
        brand: 'Burberry',
        url: 'https://www.i-optic.co.il/%D7%9E%D7%A9%D7%A7%D7%A4%D7%99-%D7%A9%D7%9E%D7%A9-burberry'
      },
      {
        id: 'women-sunglasses-kyme',
        name: Category.SUNGLASSES,
        gender: 'Women',
        brand: 'Kyme',
        url: 'https://www.i-optic.co.il/%D7%9E%D7%A9%D7%A7%D7%A4%D7%99-%D7%A9%D7%9E%D7%A9-kyme',
      },
      {
        id: 'women-sunglasses-valentino',
        name: Category.SUNGLASSES,
        gender: 'Women',
        brand: 'Valentino',
        url: 'https://www.i-optic.co.il/%D7%9E%D7%A9%D7%A7%D7%A4%D7%99-%D7%A9%D7%9E%D7%A9-valentino'
      },
      {
        id: 'women-sunglasses',
        name: Category.SUNGLASSES,
        gender: 'Women',
        brand: 'Miu Miu',
        url: 'https://www.i-optic.co.il/%D7%9E%D7%A9%D7%A7%D7%A4%D7%99-%D7%A9%D7%9E%D7%A9-miu-miu'
      },
      {
        id: 'women-sunglasses-linda-farrow',
        name: Category.SUNGLASSES,
        gender: 'Women',
        brand: 'Linda Farrow',
        url: 'https://www.i-optic.co.il/%D7%9E%D7%A9%D7%A7%D7%A4%D7%99-%D7%A9%D7%9E%D7%A9-linda-farrow'
      },
      {
        id: 'women-sunglasses',
        name: Category.SUNGLASSES,
        gender: 'Women',
        url: 'https://www.i-optic.co.il/%D7%9E%D7%A9%D7%A7%D7%A4%D7%99-%D7%A9%D7%9E%D7%A9-%D7%9C%D7%A0%D7%A9%D7%99%D7%9D'
      },
    // Men's Sunglasses
    {
      id: 'men-sunglasses',
      name: Category.SUNGLASSES,
      gender: 'Men',
      url: 'https://www.i-optic.co.il/%D7%9E%D7%A9%D7%A7%D7%A4%D7%99-%D7%A9%D7%9E%D7%A9-%D7%9C%D7%92%D7%91%D7%A8%D7%99%D7%9D'
    }
  ];

  protected getCategories(): CategoryType[] {
    return this.CATEGORIES;
  }

  protected async scrapeCategory(category: CategoryType): Promise<Product[]> {
    return await this.scrapeIOpticCategory(category);
  }

  protected async initialize(): Promise<void> {
    this.logProgress('Initializing IOptic scraper...');
    this.totalCategories = this.CATEGORIES.length;
  }

  private async scrapeIOpticCategory(category: CategoryType): Promise<Product[]> {
    this.logProgress(`Fetching ${category.url}`);
    
    try {
      const html = await this.fetchIOpticPage(category.url);
      const $ = cheerio.load(html);
      
      // Find all product items - IOptic uses div.product-item
      const productItems = $('.product-item');
      
      if (productItems.length === 0) {
        this.logProgress(`No products found for category ${category.name}`);
        return [];
      }

      this.logProgress(`Found ${productItems.length} products in ${category.name}`);

      const products: Product[] = [];
      productItems.each((_, item) => {
        const product = this.parseIOpticProduct($(item), category, $);
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

    private async fetchIOpticPage(url: string): Promise<string> {
    return fetchPageWithBrowser(url, {
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
      waitUntil: 'networkidle2',
      timeout: 60000,
      onPageReady: async (page) => {
        // Custom page logic can be added here
      }
    });
  }

  private parseIOpticProduct(productItem: cheerio.Cheerio<any>, category: CategoryType, $: cheerio.CheerioAPI): Product | null {
    try {
      // Extract title from product title link
      const titleElement = productItem.find('.product-title a');
      const title = titleElement.text().trim();
      
      if (!title) {
        return null;
      }

      // Extract brand from title - look for brand names after Hebrew text
      let brand = category.brand;

      // If category.brand is not set, try to extract from title
      if (!brand) {
        brand = this.extractBrandFromTitle(title);
      }

      brand = normalizeBrandName(brand);

      // Extract URL
      const urlElement = productItem.find('.product-title a, .picture a');
      const relativeUrl = urlElement.attr('href');
      const url = relativeUrl ? `https://www.i-optic.co.il${relativeUrl}` : '';

      // Extract images
      const images: string[] = [];
      const imageElements = productItem.find('.picture img');
      
      imageElements.each((_, img) => {
        const imgSrc = $(img).attr('src');
        if (imgSrc) {
          if (!images.includes(imgSrc)) {
            images.push(imgSrc);
          }
        }
      });

      // Extract prices
      let price: number | null = null;
      let oldPrice: number | null = null;

      // Look for actual price
      const priceElement = productItem.find('.actual-price');
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
      const productId = productItem.attr('data-productid') || '';

      // Look for sale indicators (discount box)
      const discountBox = productItem.find('.BoxDiscount');
      const isOnSale = discountBox.length > 0;
      
      // Calculate sale percent if on sale
      const salePercent = isOnSale ? 20 : null; // Default sale percent for IOptic

      // Extract SKU/model number
      const skuElement = productItem.find('.sku');
      const sku = skuElement.text().trim();

      // Extract colors from title or SKU
      const colors: string[] = [];
      const colorText = title + ' ' + sku;
      
      // Common Hebrew color terms
      const hebrewColors = ['שחור', 'לבן', 'חום', 'כחול', 'אדום', 'ירוק', 'צהוב', 'ורוד', 'סגול', 'כתום', 'אפור', 'זהב', 'כסף'];
      hebrewColors.forEach(color => {
        if (colorText.includes(color)) {
          colors.push(color);
        }
      });

      // Extract colors from Hebrew text if available
      const extractedColors = extractColorsWithHebrew(title + ' ' + colors.join(' '), colors, this.source);

      const product: Product = {
        title,
        brand,
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
        isSellingFast: false, // IOptic doesn't seem to have this indicator
      };

      return product;

    } catch (error) {
      this.logError('Error parsing IOptic product:', error);
      return null;
    }
  }

  private extractBrandFromTitle(title: string): string {
    // Function to normalize text for comparison (lowercase and remove dashes)
    const normalizeText = (text: string): string => {
      return text.toLowerCase().replace(/-/g, '');
    };

    let brand = undefined; // Default brand if no match is found

    const normalizedTitle = normalizeText(title);

    // List of brands from the image, normalized for comparison
    const brands = [
      { name: 'NIA Milano', normalized: normalizeText('NIA MILANO') },
      { name: 'Ray-Ban', normalized: normalizeText('RAY-BAN') },
      { name: 'Gucci', normalized: normalizeText('GUCCI') },
      { name: 'Oliver Peoples', normalized: normalizeText('OLIVER PEOPLES') },
      { name: 'Dolce & Gabbana', normalized: normalizeText('DOLCE & GABBANA') },
      { name: 'Valentino', normalized: normalizeText('VALENTINO') },
      { name: 'Saint Laurent', normalized: normalizeText('SAINT LAURENT') },
      { name: 'L.G.R', normalized: normalizeText('L.G.R') },
      { name: 'Tom Ford', normalized: normalizeText('TOM FORD') },
      { name: 'Miu Miu', normalized: normalizeText('MIU MIU') },
      { name: 'Celine', normalized: normalizeText('CELINE') },
      { name: 'Fendi', normalized: normalizeText('FENDI') },
      { name: 'Burberry', normalized: normalizeText('BURBERRY') },
      { name: 'Prada', normalized: normalizeText('PRADA') },
      { name: 'Garrett Leight', normalized: normalizeText('GARRETT LEIGHT') },
      { name: 'Versace', normalized: normalizeText('VERSACE') },
      { name: 'Dior', normalized: normalizeText('DIOR') },
      { name: 'Kyme', normalized: normalizeText('KYME') },
      { name: 'Balenciaga', normalized: normalizeText('BALENCIAGA') },
      { name: 'Oakley', normalized: normalizeText('OAKLY') }, // Note: 'OAKLY' in image, assuming it's 'Oakley'
      { name: 'Oakley', normalized: normalizeText('OAKLEY') }, // Also support 'OAKLEY' spelling
      { name: 'Bottega Veneta', normalized: normalizeText('BOTTEGA VENETA') },
      { name: 'Adidas', normalized: normalizeText('ADIDAS') },
      { name: 'Swarovski', normalized: normalizeText('SWAROVSKI') },
      { name: 'Linda Farrow', normalized: normalizeText('LINDA FARROW') },
      { name: 'Moscot', normalized: normalizeText('MOSCOT') },
    ];

    for (const b of brands) {
      if (normalizedTitle.includes(b.normalized)) {
        brand = b.name;
        break;
      }
    }

    return brand;
  }
}

// Run the scraper if this file is executed directly
if (require.main === module) {
  const scraper = new IOpticScraper();
  scraper.run().catch(console.error);
} 