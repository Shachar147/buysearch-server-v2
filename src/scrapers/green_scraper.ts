import { fetchPageWithBrowser } from './base/browser-helpers';
import * as cheerio from 'cheerio';
import { BaseScraper, Category as CategoryType } from './base/base-scraper';
import { Category } from '../category.constants';
import { Product, calcSalePercent, normalizeBrandName, normalizeCategories } from './base/scraper_utils';
import * as dotenv from 'dotenv';
import { extractColorsWithHebrew } from '../color.constants';
import axios, { AxiosInstance } from 'axios';
dotenv.config();

// Define categories for Green based on actual menu structure
const CATEGORIES: CategoryType[] = [
  {
    id: 'dining-furniture',
    name: Category.HOME_OUTDOOR_FURNITURE,
    gender: 'Unisex',
    url: 'https://green-israel.co.il/%d7%a4%d7%99%d7%a0%d7%95%d7%aa-%d7%90%d7%95%d7%9b%d7%9c/'
  },
  // https://green-israel.co.il/%d7%a9%d7%95%d7%9c%d7%97%d7%a0%d7%95%d7%aa/
  {
    id: 'outdoor-dining',
    name: Category.HOME_OUTDOOR_FURNITURE,
    gender: 'Unisex',
    url: 'https://green-israel.co.il/%d7%a4%d7%99%d7%a0%d7%95%d7%aa-%d7%99%d7%a9%d7%99%d7%91%d7%94/'
  },
  {
    id: 'outdoor-dining',
    name: Category.HOME_OUTDOOR_FURNITURE,
    gender: 'Unisex',
    url: 'https://green-israel.co.il/%d7%a8%d7%99%d7%94%d7%95%d7%98-%d7%9e%d7%a9%d7%9c%d7%99%d7%9d/'
  },
  {
    id: 'outdoor-grill',
    name: Category.HOME_OUTDOOR_KITCHEN,
    gender: 'Unisex',
    url: 'https://green-israel.co.il/%d7%92%d7%a8%d7%99%d7%9c%d7%99%d7%9d/'
  },
  // https://green-israel.co.il/%d7%94%d7%a6%d7%9c%d7%9c%d7%94/
  {
    id: 'outdoor-shading',
    name: Category.HOME_OUTDOOR_SHADOWING,
    gender: 'Unisex',
    url: 'https://green-israel.co.il/%d7%94%d7%a6%d7%9c%d7%9c%d7%94/'
  },
  {
    id: 'outdoor',
    name: Category.HOME_OUTDOOR_FURNITURE,
    gender: 'Unisex',
    url: 'https://green-israel.co.il/left-sticker/online__only/'
  }
];

export class GreenScraper extends BaseScraper {
  protected readonly scraperName = 'Green';
  protected readonly source = 'Green';

  private client: AxiosInstance;

  constructor() {
    super();
    this.client = axios.create({
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Accept-Language': 'en-US,en;q=0.9,he;q=0.8',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'X-Requested-With': 'XMLHttpRequest',
        'Origin': 'https://green-israel.co.il',
        'Referer': 'https://green-israel.co.il/',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin'
      }
    });
  }

  protected getCategories(): CategoryType[] {
    return CATEGORIES;
  }

  protected async scrapeCategory(category: CategoryType): Promise<Product[]> {
    return await this.scrapeGreenCategory(category);
  }

  protected async initialize(): Promise<void> {
    this.logProgress('Initializing Green scraper...');
    this.totalCategories = CATEGORIES.length;
  }

  private async scrapeGreenCategory(category: CategoryType): Promise<Product[]> {
    this.logProgress(`Fetching ${category.url}`);
    
    try {
      let allProducts: Product[] = [];
      let page = 1;
      let hasMore = true;
      const MAX_PAGES = 50; // Safety limit

      while (hasMore && page <= MAX_PAGES) {
        this.logProgress(`Fetching page ${page} for category ${category.name}`);
        
        let products: Product[] = [];
        
        if (page === 1) {
          // First page - fetch the initial HTML
          const html = await this.fetchGreenPage(category.url);
          products = this.parseGreenProducts(html, category);
        } else {
           // Subsequent pages - use AJAX endpoint
           console.log('Fetching AJAX page', category.url, page);
           const ajaxHtml = await this.fetchGreenAjaxPage(category.url, page);
           products = this.parseGreenAjaxProducts(ajaxHtml, category);
         }

        if (products.length === 0) {
          hasMore = false;
        } else {
          allProducts = allProducts.concat(products);
          this.logProgress(`Found ${products.length} products on page ${page}, total: ${allProducts.length}`);
          page++;
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

  private async fetchGreenPage(url: string): Promise<string> {
    return fetchPageWithBrowser(url, {
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
      waitUntil: 'networkidle2',
      timeout: 60000,
      onPageReady: async (page) => {
        // Wait for products to load
        await page.waitForSelector('.jet-listing-grid__item', { timeout: 10000 });
      }
    });
  }

  private async fetchGreenAjaxPage(baseUrl: string, page: number): Promise<string> {
    try {
      // Extract category slug from URL
      const urlParts = baseUrl.split('/');
      const categorySlug = urlParts[urlParts.length - 2]; // Get the category slug

      const formData = new URLSearchParams();
      
      // Add all the form data manually to avoid duplicate key issues
      formData.append('action', 'jet_engine_ajax');
      formData.append('handler', 'listing_load_more');
      formData.append('query[post_status]', 'publish');
      formData.append('query[found_posts]', '136');
      formData.append('query[max_num_pages]', '10');
      formData.append('query[post_type]', '');
      formData.append('query[tax_query][0][taxonomy]', 'product_visibility');
      formData.append('query[tax_query][0][terms][]', '244');
      formData.append('query[tax_query][0][field]', 'term_taxonomy_id');
      formData.append('query[tax_query][0][operator]', 'NOT IN');
      formData.append('query[tax_query][0][include_children]', 'true');
      formData.append('query[tax_query][1][taxonomy]', 'product_cat');
      formData.append('query[tax_query][1][terms][]', categorySlug);
      formData.append('query[tax_query][1][field]', 'slug');
      formData.append('query[tax_query][1][operator]', 'IN');
      formData.append('query[tax_query][1][include_children]', 'true');
      formData.append('query[tax_query][relation]', 'AND');
      formData.append('query[orderby]', 'date ID');
      formData.append('query[order]', 'DESC');
      formData.append('query[paged]', '0');
      formData.append('query[posts_per_page]', '15');
      formData.append('query[taxonomy]', 'product_cat');
      formData.append('query[term]', categorySlug);
      formData.append('query[wc_query]', 'product_query');
      formData.append('query[suppress_filters]', 'false');
      formData.append('query[jet_smart_filters]', 'jet-engine/list1');
      formData.append('widget_settings[lisitng_id]', '11095');
      formData.append('widget_settings[posts_num]', '30');
      formData.append('widget_settings[columns]', '3');
      formData.append('widget_settings[columns_tablet]', '2');
      formData.append('widget_settings[columns_mobile]', '2');
      formData.append('widget_settings[column_min_width]', '240');
      formData.append('widget_settings[column_min_width_tablet]', '240');
      formData.append('widget_settings[column_min_width_mobile]', '240');
      formData.append('widget_settings[inline_columns_css]', 'false');
      formData.append('widget_settings[Is_archive_template]', 'yes');
      formData.append('widget_settings[post_status][]', 'publish');
      formData.append('widget_settings[use_random_posts_num]', '');
      formData.append('widget_settings[max_posts_num]', '30');
      formData.append('widget_settings[not_found_message]', 'אין עוד מוצרים בקטגוריה זו');
      formData.append('widget_settings[is_masonry]', 'false');
      formData.append('widget_settings[equal_columns_height]', '');
      formData.append('widget_settings[use_load_more]', 'yes');
      formData.append('widget_settings[load_more_id]', 'loadmore');
      formData.append('widget_settings[load_more_type]', 'scroll');
      formData.append('widget_settings[load_more_offset][unit]', 'px');
      formData.append('widget_settings[load_more_offset][size]', '0');
      formData.append('widget_settings[use_custom_post_types]', '');
      formData.append('widget_settings[custom_post_types][]', 'product');
      formData.append('widget_settings[hide_widget_if]', '');
      formData.append('widget_settings[carousel_enabled]', '');
      formData.append('widget_settings[slides_to_scroll]', '1');
      formData.append('widget_settings[arrows]', 'true');
      formData.append('widget_settings[arrow_icon]', 'fa fa-angle-left');
      formData.append('widget_settings[dots]', '');
      formData.append('widget_settings[autoplay]', 'true');
      formData.append('widget_settings[pause_on_hover]', 'true');
      formData.append('widget_settings[autoplay_speed]', '5000');
      formData.append('widget_settings[infinite]', 'true');
      formData.append('widget_settings[center_mode]', '');
      formData.append('widget_settings[effect]', 'slide');
      formData.append('widget_settings[speed]', '500');
      formData.append('widget_settings[inject_alternative_items]', '');
      formData.append('widget_settings[scroll_slider_enabled]', '');
      formData.append('widget_settings[scroll_slider_on][]', 'desktop');
      formData.append('widget_settings[scroll_slider_on][]', 'tablet');
      formData.append('widget_settings[scroll_slider_on][]', 'mobile');
      formData.append('widget_settings[custom_query]', 'false');
      formData.append('widget_settings[custom_query_id]', '');
      formData.append('widget_settings[_element_id]', 'list1');
      formData.append('widget_settings[collapse_first_last_gap]', 'false');
      formData.append('widget_settings[list_tag_selection]', '');
      formData.append('widget_settings[list_items_wrapper_tag]', 'div');
      formData.append('widget_settings[list_item_tag]', 'div');
      formData.append('widget_settings[empty_items_wrapper_tag]', 'div');
      formData.append('page_settings[post_id]', 'false');
      formData.append('page_settings[queried_id]', '21|WP_Term');
      formData.append('page_settings[element_id]', '505b576');
      formData.append('page_settings[page]', page.toString());
      formData.append('listing_type', 'false');
      formData.append('isEditMode', 'false');
      formData.append('addedPostCSS[]', '11095');

      const response = await this.client.post(
        `${baseUrl}?nocache=${Date.now()}`,
        formData.toString(),
        {
          headers: {
            'Referer': baseUrl
          }
        }
      );

             if (response.data && response.data.data && response.data.data.html) {
         return response.data.data.html;
       }

       return '';
    } catch (error) {
      this.logError(`Error fetching AJAX page ${page}:`, error);
      return '';
    }
  }

  private parseGreenProducts(html: string, category: CategoryType): Product[] {
    const $ = cheerio.load(html);
    const products: Product[] = [];

    // Find all product items
    const productItems = $('.jet-listing-grid__item');

    if (productItems.length === 0) {
      this.logProgress(`No products found for category ${category.name}`);
      return [];
    }

    this.logProgress(`Found ${productItems.length} products in ${category.name}`);

    productItems.each((_, item) => {
      const product = this.parseGreenProduct($(item), category, $);
      if (product) {
        products.push(this.createProduct(product));
      }
    });

    return products;
  }

  private parseGreenAjaxProducts(html: string, category: CategoryType): Product[] {
    const $ = cheerio.load(html);
    const products: Product[] = [];

    // Find all product items in AJAX response
    const productItems = $('.jet-listing-grid__item');

    productItems.each((_, item) => {
      const product = this.parseGreenProduct($(item), category, $);
      if (product) {
        products.push(this.createProduct(product));
      }
    });

    return products;
  }

  private parseGreenProduct(productItem: cheerio.Cheerio<any>, category: CategoryType, $: cheerio.CheerioAPI): Product | null {
    try {
      // Check if product is out of stock
      const outOfStockElement = productItem.find('.elementor-heading-title:contains("OUT OF STOCK")');
      if (outOfStockElement.length > 0) {
        return null; // Skip out of stock products
      }

      // Extract title
      const titleElement = productItem.find('.elementor-heading-title a');
      let title = titleElement.text().trim();
      
      if (!title) {
        return null;
      }

      // Remove "COMING SOON" from title
      title = title.replace(/\s*COMING\s+SOON\s*/gi, '').trim();

      // Extract URL
      const url = titleElement.attr('href');
      if (!url) {
        return null;
      }

      // Extract images
      const images: string[] = [];
      const imageElement = productItem.find('.p-img img');
      if (imageElement.length > 0) {
        const src = imageElement.attr('src');
        if (src) {
          images.push(src);
        }
        // Also get srcset for additional images
        const srcset = imageElement.attr('srcset');
        if (srcset) {
          const srcsetUrls = srcset.split(',').map(s => s.trim().split(' ')[0]);
          images.push(...srcsetUrls);
        }
      }

      // Extract prices
      let price: number | null = null;
      let oldPrice: number | null = null;

      const priceElement = productItem.find('.p-price .price');
      
      // Check for sale price (del and ins tags)
      const delElement = priceElement.find('del .woocommerce-Price-amount');
      const insElement = priceElement.find('ins .woocommerce-Price-amount');
      
      if (delElement.length > 0 && insElement.length > 0) {
        // This is a sale item
        const delText = delElement.text().trim();
        const insText = insElement.text().trim();
        
        if (delText) {
          const delMatch = delText.replace(/[₪,]/g, '').match(/[\d.]+/);
          if (delMatch) {
            oldPrice = parseFloat(delMatch[0]);
          }
        }
        
        if (insText) {
          const insMatch = insText.replace(/[₪,]/g, '').match(/[\d.]+/);
          if (insMatch) {
            price = parseFloat(insMatch[0]);
          }
        }
      } else {
        // Regular item - single price
        const priceText = priceElement.find('.woocommerce-Price-amount').text().trim();
        
        if (priceText) {
          const priceMatch = priceText.replace(/[₪,]/g, '').match(/[\d.]+/);
          if (priceMatch) {
            price = parseFloat(priceMatch[0]);
          }
        }
      }

      // Skip products with no price
      if (!price) {
        return null;
      }

      // Extract product ID
      const productId = productItem.attr('data-post-id') || '';

      // Determine if on sale
      const isOnSale = oldPrice !== null && price !== null && oldPrice > price;
      const salePercent = isOnSale && oldPrice && price ? calcSalePercent(oldPrice, price) : null;

      // Extract brand (Green is the brand)
      const brand = 'Green';

      // Normalize brand name
      const normalizedBrand = normalizeBrandName(brand);

      // Extract colors from title and any additional text
      const extractedColors = extractColorsWithHebrew(title, [], this.source);

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
        isSellingFast: false, // Green doesn't seem to have this indicator
      };

      return product;

    } catch (error) {
      this.logError('Error parsing Green product:', error);
      return null;
    }
  }
}

// Run the scraper if this file is executed directly
if (require.main === module) {
  const scraper = new GreenScraper();
  scraper.run().catch(console.error);
} 