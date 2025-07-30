import { BaseScraper } from './base/base-scraper';
import { Category as CategoryType } from './base/base-scraper';
import { Product, normalizeBrandName } from './base/scraper_utils';
import * as cheerio from 'cheerio';
import { Category } from '../category.constants';
import { fetchPageWithBrowser } from './base/browser-helpers';
import axios from 'axios';

// Define categories for Brenda Studio based on their website structure
const CATEGORIES: CategoryType[] = [
  {
    id: 'eveningwear',
    name: Category.CLOTHING,
    gender: 'Women',
    url: 'https://brendastudio.com/collections/eveningwear'
  },
  {
    id: 'dresses',
    name: Category.DRESSES,
    gender: 'Women',
    url: 'https://brendastudio.com/collections/dresses'
  },
  {
    id: 'overalls',
    name: Category.OVERALLS,
    gender: 'Women',
    url: 'https://brendastudio.com/collections/jumpsuits'
  },
  {
    id: 'tops',
    name: Category.TOPS,
    gender: 'Women',
    url: 'https://brendastudio.com/collections/shirts-and-tops'
  },
  {
    id: 'casual',
    name: Category.CLOTHING,
    gender: 'Women',
    url: 'https://brendastudio.com/collections/%D7%A7%D7%96%D7%95%D7%90%D7%9C'
  },
  {
    id: 'bottoms',
    name: Category.BOTTOMS,
    gender: 'Women',
    url: 'https://brendastudio.com/collections/pants-and-skirts'
  },
  {
    id: 'sets',
    name: Category.SETS,
    gender: 'Women',
    url: 'https://brendastudio.com/collections/%D7%97%D7%9C%D7%99%D7%A4%D7%95%D7%AA-1'
  },
  {
    id: 'swimwear',
    name: Category.SWIMWEAR,
    gender: 'Women',
    url: 'https://brendastudio.com/collections/swimwear-1'
  },
  {
    id: 'jeans',
    name: Category.JEANS,
    gender: 'Women',
    url: 'https://brendastudio.com/collections/denim-1'
  },
  {
    id: 'all-white',
    name: Category.CLOTHING,
    gender: 'Women',
    url: 'https://brendastudio.com/collections/all-white'
  },
  {
    id: 'brenda-lioness',
    name: Category.CLOTHING,
    gender: 'Women',
    url: 'https://brendastudio.com/collections/brenda-lioness'
  },
  {
    id: 'sweaters',
    name: Category.SWEATERS,
    gender: 'Women',
    url: 'https://brendastudio.com/collections/%D7%A1%D7%A8%D7%99%D7%92%D7%99%D7%9D-%D7%95%D7%A1%D7%95%D7%95%D7%93%D7%A8%D7%99%D7%9D'
  },
  {
    id: 'coats-and-jackets',
    name: Category.JACKETS_COATS,
    gender: 'Women',
    url: 'https://brendastudio.com/collections/jackets'
  },
  {
    id: 'chest-accessories',
    name: Category.ACCESSORIES,
    gender: 'Women',
    url: 'https://brendastudio.com/collections/chest-accessories'
  },
  {
    id: 'clothing',
    name: Category.CLOTHING,
    gender: 'Women',
    url: 'https://brendastudio.com/collections/pre-order'
  },
  {
    id: 'sale-dec-2024',
    name: 'Sale',
    gender: 'Women',
    url: 'https://brendastudio.com/collections/sale-dec-2024'
  },
  {
    id: 'new-arrivals',
    name: 'New',
    gender: 'Women',
    url: 'https://brendastudio.com/collections/new-arrivals'
  }
];

export class BrendaScraper extends BaseScraper {
  protected readonly scraperName = 'Brenda Studio';
  protected readonly source = 'Brenda';

  private readonly baseUrl = 'https://brendastudio.com';

  protected getCategories(): CategoryType[] {
    return CATEGORIES;
  }

  protected async scrapeCategory(category: CategoryType): Promise<Product[]> {
    const products: Product[] = [];
    let page = 1;
    let hasMorePages = true;

    while (hasMorePages) {
      try {
        const url = this.buildUrl(category, page);
        this.logProgress(`Scraping ${category.name} page ${page}: ${url}`);

        const html = await fetchPageWithBrowser(url);
        const $ = cheerio.load(html);

        const productElements = $('.ProductItem');
        
        if (productElements.length === 0) {
          this.logProgress(`No products found on page ${page}, stopping pagination`);
          hasMorePages = false;
          break;
        }

        for (let i = 0; i < productElements.length; i++) {
          const productElement = productElements.eq(i);
          const product = await this.extractProduct($, productElement, category);
          
          if (product) {
            products.push(product);
          }
        }

        // Check if there's a next page
        const nextPageExists = $('.Pagination__Nav a[aria-label="Next page"]').length > 0;
        if (!nextPageExists) {
          hasMorePages = false;
        }

        page++;
        
        // Add delay between pages to be respectful
        await this.delay(1000);

      } catch (error) {
        this.logError(`Error scraping page ${page}:`, error);
        hasMorePages = false;
      }
    }

    this.logProgress(`Scraped ${products.length} products from ${category.name}`);
    return products;
  }

  private buildUrl(category: CategoryType, page: number = 1): string {
    return `${category.url}?page=${page}`;
  }

  private async fetchPage(url: string): Promise<string> {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
      timeout: 30000,
    });
    return response.data;
  }

  private async extractProduct($: cheerio.CheerioAPI, productElement: cheerio.Cheerio<any>, category: CategoryType): Promise<Product | null> {
    try {
      // Extract product ID
      const productId = productElement.attr('data-product-id');
      if (!productId) {
        this.logWarning('Product ID not found, skipping product');
        return null;
      }

      // Extract product URL
      const productUrlElement = productElement.find('.ProductItem__Title a');
      const productUrl = productUrlElement.attr('href');
      if (!productUrl) {
        this.logWarning('Product URL not found, skipping product');
        return null;
      }

      const fullProductUrl = productUrl.startsWith('http') ? productUrl : `${this.baseUrl}${productUrl}`;

      // Extract product name
      const productName = productUrlElement.text().trim();
      if (!productName) {
        this.logWarning('Product name not found, skipping product');
        return null;
      }

      // Extract brand
      const brandElement = productElement.find('.ProductItem__Vendor');
      const brandName = brandElement.text().trim() || 'BRENDA';

      // Extract price information
      const priceInfo = this.extractPriceInfo($, productElement);

      // Extract images
      const images = this.extractImages($, productElement);

      // Extract color from product name
      const color = this.extractColor(productName);

      // Create product object using BaseScraper's createProduct method
      const product = this.createProduct({
        title: productName,
        url: fullProductUrl,
        images: images,
        colors: color ? [color] : [],
        price: priceInfo.currentPrice,
        oldPrice: priceInfo.originalPrice,
        salePercent: priceInfo.originalPrice ? this.calculateSalePercent(priceInfo.originalPrice, priceInfo.currentPrice) : null,
        currency: 'ILS',
        brand: normalizeBrandName(brandName),
        categories: [category.name],
        gender: category.gender,
        isSellingFast: false,
      });

      return product;

    } catch (error) {
      this.logError('Error extracting product:', error);
      return null;
    }
  }

  private extractPriceInfo($: cheerio.CheerioAPI, productElement: cheerio.Cheerio<any>): { currentPrice: number; originalPrice?: number } {
    const priceList = productElement.find('.ProductItem__PriceList');
    
    // Check for sale price
    const salePriceElement = priceList.find('.ProductItem__Price.Price--highlight');
    const originalPriceElement = priceList.find('.ProductItem__Price.Price--compareAt');
    
    if (salePriceElement.length > 0) {
      // Product is on sale
      const salePriceText = salePriceElement.text().trim();
      const originalPriceText = originalPriceElement.text().trim();
      
      const currentPrice = this.extractPriceFromText(salePriceText);
      const originalPrice = this.extractPriceFromText(originalPriceText);
      
      return { currentPrice, originalPrice };
    } else {
      // Regular price
      const priceElement = priceList.find('.ProductItem__Price');
      const priceText = priceElement.text().trim();
      const currentPrice = this.extractPriceFromText(priceText);
      
      return { currentPrice };
    }
  }

  private extractPriceFromText(priceText: string): number {
    // Remove currency symbol and any non-numeric characters except decimal point
    const cleanPrice = priceText.replace(/[^\d.]/g, '').replace(',', '');
    const price = parseFloat(cleanPrice);
    
    if (isNaN(price)) {
      this.logWarning(`Could not parse price from text: "${priceText}"`);
      return 0;
    }
    
    return price;
  }

    private extractImages($: cheerio.CheerioAPI, productElement: cheerio.Cheerio<any>): string[] {
    // console.log('🔍 Starting image extraction...');
    
    // Step 1: Find all image elements
    const imageElements = $(productElement).find(".ProductItem__Image");
    // console.log(`📸 Found ${imageElements.length} image elements`);
    
    if (imageElements.length === 0) {
    //   console.log('⚠️ No image elements found, trying alternative selector...');
      const altImageElements = $(productElement).find("img");
    //   console.log(`📸 Found ${altImageElements.length} img elements with alternative selector`);
    }
    
    let images: string[] = [];
    
    // Step 2: Process each image element
    imageElements.each((index, element) => {
    //   console.log(`🔄 Processing image ${index + 1}/${imageElements.length}`);
      
      const img = $(element);
      
      // Step 3: Try different image attributes
      const dataSrcset = img.attr('data-srcset');
      const srcset = img.attr('srcset');
      const src = img.attr('src');
      const dataSrc = img.attr('data-src');
      
    //   console.log(`📋 data-srcset: ${dataSrcset ? 'Found' : 'Not found'}`);
    //   console.log(`📋 srcset: ${srcset ? 'Found' : 'Not found'}`);
    //   console.log(`📋 src: ${src ? 'Found' : 'Not found'}`);
    //   console.log(`📋 data-src: ${dataSrc ? 'Found' : 'Not found'}`);
      
      // Try data-srcset first (from your DOM example)
      if (dataSrcset) {
        try {
        //   console.log(`🔗 Raw data-srcset: ${dataSrcset}`);
          
          // Split srcset and get the highest quality image
          const srcsetUrls = dataSrcset.split(',');
        //   console.log(`📊 Found ${srcsetUrls.length} srcset URLs`);
          
          let bestImageUrl = '';
          let maxWidth = 0;
          
          for (const srcsetItem of srcsetUrls) {
            const trimmed = srcsetItem.trim();
            // console.log(`🔍 Processing srcset item: ${trimmed}`);
            
            const parts = trimmed.split(' ');
            if (parts.length >= 2) {
              const url = parts[0];
              const width = parts[1];
              const widthNum = parseInt(width.replace('w', ''));
              
            //   console.log(`📏 URL: ${url}, Width: ${widthNum}`);
              
              if (widthNum > maxWidth) {
                maxWidth = widthNum;
                bestImageUrl = url;
              }
            }
          }
          
          if (bestImageUrl) {
            // Ensure URL has protocol
            const fullUrl = bestImageUrl.startsWith('//') ? `https:${bestImageUrl}` : bestImageUrl;
            // console.log(`✅ Best image URL: ${fullUrl}`);
            
            if (!images.includes(fullUrl)) {
              images.push(fullUrl);
            }
          }
        } catch (error) {
        //   console.log(`❌ Error processing data-srcset: ${error}`);
        }
      }
      // Try regular srcset as fallback
      else if (srcset) {
        try {
        //   console.log(`🔗 Raw srcset: ${srcset}`);
          
          const srcsetUrls = srcset.split(',');
          let bestImageUrl = '';
          let maxWidth = 0;
          
          for (const srcsetItem of srcsetUrls) {
            const trimmed = srcsetItem.trim();
            const parts = trimmed.split(' ');
            if (parts.length >= 2) {
              const url = parts[0];
              const width = parts[1];
              const widthNum = parseInt(width.replace('w', ''));
              
              if (widthNum > maxWidth) {
                maxWidth = widthNum;
                bestImageUrl = url;
              }
            }
          }
          
          if (bestImageUrl) {
            const fullUrl = bestImageUrl.startsWith('//') ? `https:${bestImageUrl}` : bestImageUrl;
            // console.log(`✅ Best image URL from srcset: ${fullUrl}`);
            
            if (!images.includes(fullUrl)) {
              images.push(fullUrl);
            }
          }
        } catch (error) {
        //   console.log(`❌ Error processing srcset: ${error}`);
        }
      }
      // Try data-src as fallback
      else if (dataSrc) {
        const fullUrl = dataSrc.startsWith('//') ? `https:${dataSrc}` : dataSrc;
        // console.log(`✅ Image URL from data-src: ${fullUrl}`);
        
        if (!images.includes(fullUrl)) {
          images.push(fullUrl);
        }
      }
      // Try src as final fallback
      else if (src) {
        const fullUrl = src.startsWith('//') ? `https:${src}` : src;
        // console.log(`✅ Fallback image URL from src: ${fullUrl}`);
        
        if (!images.includes(fullUrl)) {
          images.push(fullUrl);
        }
      }
      
      if (dataSrcset) {
        try {
        //   console.log(`🔗 Raw data-srcset: ${dataSrcset}`);
          
          // Step 4: Split srcset and get the highest quality image
          const srcsetUrls = dataSrcset.split(',');
        //   console.log(`📊 Found ${srcsetUrls.length} srcset URLs`);
          
          let bestImageUrl = '';
          let maxWidth = 0;
          
          for (const srcsetItem of srcsetUrls) {
            const trimmed = srcsetItem.trim();
            // console.log(`🔍 Processing srcset item: ${trimmed}`);
            
            const parts = trimmed.split(' ');
            if (parts.length >= 2) {
              const url = parts[0];
              const width = parts[1];
              const widthNum = parseInt(width.replace('w', ''));
              
            //   console.log(`📏 URL: ${url}, Width: ${widthNum}`);
              
              if (widthNum > maxWidth) {
                maxWidth = widthNum;
                bestImageUrl = url;
              }
            }
          }
          
          if (bestImageUrl) {
            // Step 5: Ensure URL has protocol
            const fullUrl = bestImageUrl.startsWith('//') ? `https:${bestImageUrl}` : bestImageUrl;
            // console.log(`✅ Best image URL: ${fullUrl}`);
            
            if (!images.includes(fullUrl)) {
              images.push(fullUrl);
            }
          }
        } catch (error) {
        //   console.log(`❌ Error processing data-srcset: ${error}`);
        }
      }
    });

    images = images.map((img) => img.replace('{width}', '600'));

    // console.log(`🎯 Final image count: ${images.length}`);
    // console.log(`🖼️ Images:`, images);


    return images;
  }

  private extractColor(productName: string): string | null {
    // Look for color indicators in the product name
    const colorPatterns = [
      /ורוד/i, // Pink
      /כחול/i, // Blue
      /אדום/i, // Red
      /ירוק/i, // Green
      /צהוב/i, // Yellow
      /שחור/i, // Black
      /לבן/i, // White
      /אפור/i, // Gray
      /חום/i, // Brown
      /כתום/i, // Orange
      /סגול/i, // Purple
      /טורקיז/i, // Turquoise
      /זהב/i, // Gold
      /כסף/i, // Silver
      /בורדו/i, // Burgundy
      /חאקי/i, // Khaki
      /נבי/i, // Navy
      /בייז/i, // Beige
      /קרם/i, // Cream
      /מנטה/i, // Mint
      /סלמון/i, // Salmon
      /קורל/i, // Coral
      /לילך/i, // Lilac
      /טבעי/i, // Natural
      /מטאלי/i, // Metallic
      /גליטר/i, // Glitter
      /פסטל/i, // Pastel
    ];

    for (const pattern of colorPatterns) {
      const match = productName.match(pattern);
      if (match) {
        return match[0];
      }
    }

    return null;
  }

  private calculateSalePercent(originalPrice: number, currentPrice: number): number {
    if (originalPrice <= 0 || currentPrice >= originalPrice) {
      return 0;
    }
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export for use in cron jobs
export default BrendaScraper;

// Main function to run the scraper
async function main(): Promise<void> {
  const scraper = new BrendaScraper();
  await scraper.runWithSignalHandling();
}

// Run if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
} 