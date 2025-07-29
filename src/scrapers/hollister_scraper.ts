import { fetchPageWithBrowser } from './base/browser-helpers';
import * as cheerio from 'cheerio';
import { BaseScraper, Category as CategoryType } from './base/base-scraper';
import { Category } from '../category.constants';
import { Product, calcSalePercent, normalizeBrandName } from './base/scraper_utils';
import * as dotenv from 'dotenv';
import { extractColorsWithHebrew } from 'src/color.constants';
dotenv.config();

export class HollisterScraper extends BaseScraper {
  protected readonly scraperName = 'Hollister';
  protected readonly source = 'Hollister';

  // Define categories for Hollister
  private readonly CATEGORIES: CategoryType[] = [
    // Men's New Arrivals
    {
      id: 'mens-new-arrivals',
      name: Category.CLOTHING,
      gender: 'Men',
      url: 'https://www.hollisterco.com/shop/wd/mens-new-arrivals?filtered=true&rows=90&start=0'
    },
    {
        url: 'https://www.hollisterco.com/shop/wd/womens-new-arrivals?filtered=true&rows=90',
        id: 'sale',
        name: 'Sale',
        gender: 'Men',
    },
    // Women's New Arrivals
    {
      id: 'womens-new-arrivals',
      name: Category.CLOTHING,
      gender: 'Women',
      url: 'https://www.hollisterco.com/shop/wd/womens-new-arrivals?filtered=true&rows=90&start=0'
    },
    // Women's Tops
    {
      id: 'womens-tops',
      name: Category.TOPS,
      gender: 'Women',
      url: 'https://www.hollisterco.com/shop/wd/womens-tops?filtered=true&rows=90&start=0'
    },
    // Women's Bottoms
    {
      id: 'womens-bottoms',
      name: Category.PANTS,
      gender: 'Women',
      url: 'https://www.hollisterco.com/shop/wd/womens-bottoms?filtered=true&rows=90&start=0'
    },
    // Women's Dresses & Rompers
    {
      id: 'womens-dresses-and-rompers',
      name: Category.DRESSES,
      gender: 'Women',
      url: 'https://www.hollisterco.com/shop/wd/womens-dresses-and-rompers?filtered=true&rows=90&start=0'
    },
    // Women's Jackets & Coats
    {
      id: 'womens-jackets-and-coats',
      name: Category.JACKETS_COATS,
      gender: 'Women',
      url: 'https://www.hollisterco.com/shop/wd/womens-jackets-and-coats?filtered=true&rows=90&start=0'
    },
    // Women's Sweatshirts & Sweatpants
    {
      id: 'womens-sweatshirts-and-sweatpants',
      name: Category.BOTTOMS,
      gender: 'Women',
      url: 'https://www.hollisterco.com/shop/wd/womens-sweatshirts-and-sweatpants?filtered=true&rows=90&start=0'
    },
    // Women's Sleepwear & Loungewear
    {
      id: 'womens-sleepwear-and-loungewear',
      name: Category.SLEEP_WEAR,
      gender: 'Women',
      url: 'https://www.hollisterco.com/shop/wd/womens-sleepwear-and-loungewear?filtered=true&rows=90&start=0'
    },
    // Women's Swimwear
    {
      id: 'womens-swimwear',
      name: Category.SWIMWEAR,
      gender: 'Women',
      url: 'https://www.hollisterco.com/shop/wd/womens-swimwear?filtered=true&rows=90&start=0'
    },
    // Women's Activewear
    {
      id: 'womens-activewear',
      name: Category.SPORT,
      gender: 'Women',
      url: 'https://www.hollisterco.com/shop/wd/womens-activewear?filtered=true&rows=90&start=0'
    },
    // Women's Matching Sets
    {
      id: 'womens-matching-sets',
      name: Category.SETS,
      gender: 'Women',
      url: 'https://www.hollisterco.com/shop/wd/womens-matching-sets?filtered=true&rows=90&start=0'
    },
    // Women's Bralettes & Sports Bras
    {
      id: 'womens-bras-and-underwear',
      name: Category.LINGERIE,
      gender: 'Women',
      url: 'https://www.hollisterco.com/shop/wd/womens-bras-and-underwear?filtered=true&rows=90&start=0'
    },
    // Women's Accessories
    {
      id: 'womens-accessories-and-shoes',
      name: Category.ACCESSORIES,
      gender: 'Women',
      url: 'https://www.hollisterco.com/shop/wd/womens-accessories-and-shoes?filtered=true&rows=90&start=0'
    },
    // Women's Fragrance
    {
      id: 'womens-fragrance-and-body',
      name: Category.PERFUMES,
      gender: 'Women',
      url: 'https://www.hollisterco.com/shop/wd/womens-fragrance-and-body?filtered=true&rows=90&start=0'
    },
    // Women's Clearance
    {
      id: 'womens-clearance',
      name: 'Sale',
      gender: 'Women',
      url: 'https://www.hollisterco.com/shop/wd/womens-clearance?filtered=true&rows=90&start=0'
    },
    // Women's Festival Collection
    {
      id: 'womens-festival',
      name: Category.CLOTHING,
      gender: 'Women',
      url: 'https://www.hollisterco.com/shop/wd/womens-festival?filtered=true&rows=90&start=0'
    },
    // Women's Gilly Hicks Collection
    {
      id: 'womens-gilly-hicks-collection',
      name: Category.CLOTHING,
      gender: 'Women',
      url: 'https://www.hollisterco.com/shop/wd/womens-gilly-hicks-collection?filtered=true&rows=90&start=0'
    },
    // Men's Tops
    {
      id: 'mens-tops',
      name: Category.TOPS,
      gender: 'Men',
      url: 'https://www.hollisterco.com/shop/wd/mens-tops?filtered=true&rows=90&start=0'
    },
    // Men's Bottoms
    {
      id: 'mens-bottoms',
      name: Category.PANTS,
      gender: 'Men',
      url: 'https://www.hollisterco.com/shop/wd/mens-bottoms?filtered=true&rows=90&start=0'
    },
    // Men's Graphics Shop
    {
      id: 'mens-licensed-collection',
      name: Category.TOPS,
      gender: 'Men',
      url: 'https://www.hollisterco.com/shop/wd/mens-licensed-collection?filtered=true&rows=90&start=0'
    },
    // Men's Jackets & Coats
    {
      id: 'mens-jackets-and-coats',
      name: Category.JACKETS_COATS,
      gender: 'Men',
      url: 'https://www.hollisterco.com/shop/wd/mens-jackets-and-coats?filtered=true&rows=90&start=0'
    },
    // Men's Sweatshirts & Sweatpants
    {
      id: 'mens-sweatshirts-and-sweatpants',
      name: Category.BOTTOMS,
      gender: 'Men',
      url: 'https://www.hollisterco.com/shop/wd/mens-sweatshirts-and-sweatpants?filtered=true&rows=90&start=0'
    },
    // Men's Sleepwear & Loungewear
    {
      id: 'mens-sleepwear-and-loungewear',
      name: Category.SLEEP_WEAR,
      gender: 'Men',
      url: 'https://www.hollisterco.com/shop/wd/mens-sleepwear-and-loungewear?filtered=true&rows=90&start=0'
    },
    // Men's Swimwear
    {
      id: 'mens-swimwear',
      name: Category.SWIMWEAR,
      gender: 'Men',
      url: 'https://www.hollisterco.com/shop/wd/mens-swimwear?filtered=true&rows=90&start=0'
    },
    // Men's Underwear & Socks
    {
      id: 'mens-underwear-and-socks',
      name: Category.LINGERIE,
      gender: 'Men',
      url: 'https://www.hollisterco.com/shop/wd/mens-underwear-and-socks?filtered=true&rows=90&start=0'
    },
    // Men's Accessories
    {
      id: 'mens-accessories-and-shoes',
      name: Category.ACCESSORIES,
      gender: 'Men',
      url: 'https://www.hollisterco.com/shop/wd/mens-accessories-and-shoes?filtered=true&rows=90&start=0'
    },
    // Men's Cologne
    {
      id: 'mens-cologne-and-body',
      name: Category.PERFUMES,
      gender: 'Men',
      url: 'https://www.hollisterco.com/shop/wd/mens-cologne-and-body?filtered=true&rows=90&start=0'
    },
    // Men's Clearance
    {
      id: 'mens-clearance',
      name: 'Sale',
      gender: 'Men',
      url: 'https://www.hollisterco.com/shop/wd/mens-clearance?filtered=true&rows=90&start=0'
    }
  ];

  protected getCategories(): CategoryType[] {
    return this.CATEGORIES;
  }

  protected async scrapeCategory(category: CategoryType): Promise<Product[]> {
    return await this.scrapeHollisterCategory(category);
  }

  protected async initialize(): Promise<void> {
    this.logProgress('Initializing Hollister scraper...');
    this.totalCategories = this.CATEGORIES.length;
  }

  private async scrapeHollisterCategory(category: CategoryType): Promise<Product[]> {
    this.logProgress(`Fetching ${category.url}`);
    
    try {
      const allProducts: Product[] = [];
      let page = 0;
      const itemsPerPage = 90;
      let hasMoreProducts = true;

      while (hasMoreProducts) {
        const pageUrl = this.buildPageUrl(category.url, page, itemsPerPage);
        this.logProgress(`Fetching page ${page + 1}: ${pageUrl}`);
        
        const html = await this.fetchHollisterPage(pageUrl);
        const $ = cheerio.load(html);
        
        // Find all product items - Hollister uses li.catalog-productCard-module__productCard
        const productItems = $('li.catalog-productCard-module__productCard');
        
        if (productItems.length === 0) {
          this.logProgress(`No more products found on page ${page + 1}`);
          hasMoreProducts = false;
          break;
        }

        this.logProgress(`Found ${productItems.length} products on page ${page + 1}`);

        let pageProducts = 0;
        productItems.each((_, item) => {
          const product = this.parseHollisterProduct($(item), category, $);
          if (product) {
            allProducts.push(product);
            pageProducts++;
          }
        });

        this.logProgress(`Successfully parsed ${pageProducts} products from page ${page + 1}`);
        
        // If we got fewer products than expected, we've reached the end
        if (productItems.length < itemsPerPage) {
          hasMoreProducts = false;
        }
        
        page++;
        
        // Add a small delay between pages to be respectful
        if (hasMoreProducts) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      this.logProgress(`Total products scraped from ${category.name}: ${allProducts.length}`);
      return allProducts;
      
    } catch (error) {
      this.logError(`Error scraping category ${category.name}:`, error);
      return [];
    }
  }

  private buildPageUrl(baseUrl: string, page: number, itemsPerPage: number): string {
    const start = page * itemsPerPage;
    return `${baseUrl.replace('&start=0', '')}&start=${start}`;
  }

    private async fetchHollisterPage(url: string): Promise<string> {
    return fetchPageWithBrowser(url, {
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
      waitUntil: 'networkidle2',
      timeout: 60000,
      onPageReady: async (page) => {
        // Custom page logic can be added here
      }
    });
  }

  private parseHollisterProduct(productItem: cheerio.Cheerio<any>, category: CategoryType, $: cheerio.CheerioAPI): Product | null {
    try {
      // Extract title from product name
      const titleElement = productItem.find('[data-testid="catalog-product-card-name"]');
      const title = titleElement.text().trim();
      
      if (!title) {
        return null;
      }

      // Extract brand - Hollister is the main brand
      const brand = 'Hollister';

      // Extract URL
      const urlElement = productItem.find('.catalog-productCard-module__product-content-link');
      const relativeUrl = urlElement.attr('href');
      const url = relativeUrl ? `https://www.hollisterco.com${relativeUrl}` : '';

      // Extract images
      const images: string[] = [];
      const imageElements = productItem.find('.catalog-productCard-module__productCardImage_1, .catalog-productCard-module__productCardImage_2');
      
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

      // Look for price elements
      const priceElement = productItem.find('.product-price');
      const priceVariant = priceElement.attr('data-variant');
      
      if (priceVariant === 'discount') {
        // Sale item - extract both original and sale prices
        const originalPriceElement = priceElement.find('[data-variant="original"]');
        const discountPriceElement = priceElement.find('[data-variant="discount"]');
        
        const originalPriceText = originalPriceElement.text().trim();
        const discountPriceText = discountPriceElement.text().trim();
        
        if (originalPriceText) {
          const originalMatch = originalPriceText.match(/₪([\d,]+\.?\d*)/);
          if (originalMatch) {
            oldPrice = parseFloat(originalMatch[1].replace(/,/g, ''));
          }
        }
        
        if (discountPriceText) {
          const discountMatch = discountPriceText.match(/₪([\d,]+\.?\d*)/);
          if (discountMatch) {
            price = parseFloat(discountMatch[1].replace(/,/g, ''));
          }
        }
      } else {
        // Regular price item
        const priceText = priceElement.text().trim();
        if (priceText) {
          const priceMatch = priceText.match(/₪([\d,]+\.?\d*)/);
          if (priceMatch) {
            price = parseFloat(priceMatch[1].replace(/,/g, ''));
          }
        }
      }

      // Skip products with no price
      if (!price) {
        return null;
      }

      // Extract product ID from data attributes
      const productId = productItem.attr('data-intlkic') || '';

      // Look for sale indicators
      const isOnSale = priceVariant === 'discount';
      const clearanceBadge = productItem.find('.clearance-badge');
      const hasClearanceBadge = clearanceBadge.length > 0;
      
      // Calculate sale percent if on sale
      let salePercent = null;
      if (isOnSale && oldPrice && price) {
        salePercent = calcSalePercent(oldPrice, price);
      }

      // Extract colors from swatch labels
      const colors: string[] = [];
      const swatchLabels = productItem.find('label[data-label-visible="false"]');
      
      swatchLabels.each((_, label) => {
        const labelText = $(label).text().trim();
        if (labelText) {
          // Remove "swatch" suffix if present
          const cleanColor = labelText.replace(/\s*swatch\s*$/i, '').trim();
          if (cleanColor) {
            colors.push(cleanColor);
          }
        }
      });

      // Normalize brand name
      const normalizedBrand = normalizeBrandName(brand);

      // Extract colors from Hebrew text if available
      const extractedColors = extractColorsWithHebrew(title + ' ' + colors.join(' '), colors, this.source);

      if (!title || !price || !url){
        console.log('❕ No title, price, or url found for product:', productItem);
        return null;
      }

      const p = this.createProduct({
        title,
        brand: normalizedBrand,
        price,
        oldPrice,
        salePercent,
        currency: 'ILS',
        url,
        images,
        colors: extractedColors,
        categories: [category.name],
        gender: category.gender,
        isSellingFast: false, // Hollister doesn't seem to have this indicator
      });

      console.log(p.title, p.categories)

      return p;

    } catch (error) {
      this.logError('Error parsing Hollister product:', error);
      return null;
    }
  }
}

// Run the scraper if this file is executed directly
if (require.main === module) {
  const scraper = new HollisterScraper();
  scraper.run().catch(console.error);
} 