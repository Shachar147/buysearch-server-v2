import { fetchPageWithBrowser, handleCookieConsent } from './base/browser-helpers';
import * as cheerio from 'cheerio';
import { BaseScraper, Category as BaseCategory } from './base/base-scraper';
import { Product, extractColors, calcSalePercent, normalizeBrandName, prefixHttp } from './base/scraper_utils';
import { Category } from '../category.constants';

// V todo: fix sale price
// todo: fix ralph lauren blocking "are you robot"

export class RalphLaurenScraper extends BaseScraper {
  protected readonly scraperName = 'Polo Ralph Lauren';
  protected readonly source = 'Polo Ralph Lauren';

  protected getCategories(): BaseCategory[] {
    return [
      // {
      //   id: 'sale',
      //   name: 'Sale',
      //   gender: 'Men',
      //   url: 'https://www.ralphlauren.global/il/en/sale/men/shop-all/1004105',
      // },
      {
        id: 't-shirts',
        name: Category.T_SHIRTS,
        gender: 'Men',
        url: 'https://www.ralphlauren.global/il/en/men/clothing/t-shirts/10203',
      },
      {
        id: 'swimwear',
        name: Category.SWIMWEAR,
        gender: 'Men',
        url: 'https://www.ralphlauren.global/il/en/men/clothing/swimwear/102014',
      },
      {
        id: 'polo-shirts',
        name: Category.POLO_SHIRTS,
        gender: 'Men',
        url: 'https://www.ralphlauren.global/il/en/men/clothing/polo-shirts/10201',
      },
      {
        id: 'hoodies',
        name: Category.SWEATERS,
        gender: 'Men',
        url: 'https://www.ralphlauren.global/il/en/men/clothing/hoodies-sweatshirts/10204',
      },
      {
        id: 'blazers',
        name: Category.BLAZERS,
        gender: 'Men',
        url: 'https://www.ralphlauren.global/il/en/men/clothing/blazers/10209',
      },
      {
        id: 'jackets-coats',
        name: Category.JACKETS_COATS,
        gender: 'Men',
        url: 'https://www.ralphlauren.global/il/en/men/clothing/jackets-coats/10205',
      },
      {
        id: 'trousers',
        name: Category.PANTS,
        gender: 'Men',
        url: 'https://www.ralphlauren.global/il/en/men/clothing/trousers/102015',
      },
      {
        id: 'shorts',
        name: Category.SHORTS,
        gender: 'Men',
        url: 'https://www.ralphlauren.global/il/en/men/clothing/shorts/102013',
      },
      {
        id: 'loungewear',
        name: Category.SLEEP_WEAR,
        gender: 'Men',
        url: 'https://www.ralphlauren.global/il/en/men/clothing/loungewear/105039',
      },
      {
        id: 'shoes',
        name: Category.SHOES,
        gender: 'Men',
        url: 'https://www.ralphlauren.global/il/en/men/shoes/1040?orignalCatID=men-shoes-shop-all-rd&altrurlID=men-shoes-shop-all-rd',
      },
      {
        id: 'accessories',
        name: Category.ACCESSORIES,
        gender: 'Men',
        url: 'https://www.ralphlauren.global/il/en/men/accessories/1030?orignalCatID=men-accessories-shop-all-rd&altrurlID=men-accessories-shop-all-rd',
      },
    ];
  }

  private async handleCookieConsent(page: any): Promise<void> {
    try {
      // Wait for cookie consent popup to appear
      await page.waitForSelector('[data-testid="cookie-banner"]', { timeout: 5000 });
      
      // Look for and click "ACCEPT ALL COOKIES" button
      const acceptButton = await page.$('button:has-text("ACCEPT ALL COOKIES")');
      if (acceptButton) {
        await acceptButton.click();
        this.logProgress('Cookie consent popup handled - accepted all cookies');
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for popup to disappear
      } else {
        // Fallback: try to find any accept button
        const acceptSelectors = [
          'button[data-testid="accept-all-cookies"]',
          'button:contains("Accept")',
          'button:contains("Accept All")',
          '.cookie-accept',
          '[data-testid="cookie-accept"]'
        ];
        
        for (const selector of acceptSelectors) {
          try {
            const button = await page.$(selector);
            if (button) {
              await button.click();
              this.logProgress(`Cookie consent popup handled using selector: ${selector}`);
              await new Promise(resolve => setTimeout(resolve, 1000));
              break;
            }
          } catch (e) {
            // Continue to next selector
          }
        }
      }
    } catch (error) {
      // Cookie popup might not appear, which is fine
      this.logProgress('No cookie consent popup found or already handled');
    }
  }

  private async fetchPageWithPuppeteer(url: string): Promise<string> {
    return fetchPageWithBrowser(url, {
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
      waitUntil: 'networkidle2',
      timeout: 60000,
      extraHeaders: {
        'Accept-Language': 'en-US,en;q=0.9',
      },
      onPageReady: async (page) => {
      // Handle cookie consent popup
      await this.handleCookieConsent(page);
             await new Promise(resolve => setTimeout(resolve, 2000)); // Reduced wait time
    }
    });
  }

  private async fetchAjaxPage(baseUrl: string, pageNum: number): Promise<string> {
    const url = `${baseUrl}?page=${pageNum}`;
    const ajaxUrl = `${url}&format=ajax`;
    this.logProgress(`Fetching AJAX page ${pageNum}: ${ajaxUrl}`);
    
    try {
      const response = await fetch(ajaxUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'X-Requested-With': 'XMLHttpRequest',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const html = await response.text();
      return html;
    } catch (error) {
      this.logWarning(`Failed to fetch AJAX page ${pageNum}: ${error}`);
      // Fallback to Puppeteer for this page
      return this.fetchPageWithPuppeteer(url);
    }
  }

  private parseProductsFromHtml(html: string, category: BaseCategory): Product[] {
    const products: Product[] = [];
    const $ = cheerio.load(html);
    
    const productDivs = $('.product-tile');
    if (productDivs.length === 0) {
      this.logWarning('No products found in DOM');
      return products;
    }

    productDivs.each((_, el) => {
      const elem = $(el);
      
      // Product URL
      const urlPath = elem.find('.name-link').attr('href');
      const url = urlPath ? prefixHttp('www.ralphlauren.global' + urlPath) : '';
      
      // Title
      const title = elem.find('.name-link').text().trim();
      
      // Brand
      const brand = normalizeBrandName(elem.find('.brand-name').text().trim() || 'Ralph Lauren');
      
      // Images
      const images: string[] = [];
      elem.find('.rlc-picture').find('img').each((_, img) => {
        const src = $(img).attr('src');
        if (src && !src.startsWith('data:') && !images.includes(src) && !src.includes('swatch')) images.push(src);
        const dataSrc = $(img).attr('data-src');
        if (dataSrc && !dataSrc.startsWith('data:') && !images.includes(dataSrc) && !dataSrc.includes('swatch')) images.push(dataSrc);
      });
      
      // Colors
      const colors: string[] = [];
      elem.find('.swatchanchor').each((_, swatch) => {
        const color = $(swatch).attr('title') || $(swatch).attr('aria-label');
        if (color) colors.push(color);
      });
      
      // Price
      let price: number | null = null;
      let oldPrice: number | null = null;
      
      // Look for sale price in .lowred class (current sale price)
      const salePriceText = elem.find('.lowred').text().trim();
      if (salePriceText) {
        price = parseFloat(salePriceText.replace(/[^\d.]/g, ''));
      }
      
      // Look for original price in .product-standard-price class
      const oldPriceText = elem.find('.product-standard-price').text().trim();
      if (oldPriceText) {
        oldPrice = parseFloat(oldPriceText.replace(/[^\d.]/g, ''));
      }
      
      // If no sale price found in .lowred, try other selectors
      if (price === null) {
        const fallbackPriceText = elem.find('.price').text() || elem.find('.product-sales-price').text();
        if (fallbackPriceText) {
          price = parseFloat(fallbackPriceText.replace(/[^\d.]/g, ''));
        }
      }
      
      const salePercent = calcSalePercent(price, oldPrice);
      const categories = [category.name];
      const gender = category.gender;
      
      if (title && url && price !== null) {
        products.push(
          this.createProduct({
            title,
            url,
            images,
            colors: extractColors(title, colors),
            price,
            oldPrice,
            salePercent,
            currency: 'ILS',
            brand,
            categories,
            gender,
          })
        );
      }
    });
    
    return products;
  }

  protected async scrapeCategory(category: BaseCategory): Promise<Product[]> {
    const allProducts: Product[] = [];
    const MAX_PAGES = 20; // Limit to prevent infinite loops
    let pageNum = 1;
    let hasMoreProducts = true;
    
    try {
      this.logProgress(`Starting to scrape category: ${category.name}`);
      
      while (hasMoreProducts && pageNum <= MAX_PAGES) {
        this.logProgress(`Scraping page ${pageNum} for ${category.name}`);
        
        let html: string;
        
        if (pageNum === 0) {
          // First page: use Puppeteer to handle cookie consent
          html = await this.fetchPageWithPuppeteer(category.url);
        } else {
          // Subsequent pages: use faster AJAX method
          html = await this.fetchAjaxPage(category.url, pageNum);
        }
        
        const pageProducts = this.parseProductsFromHtml(html, category);
        
        if (pageProducts.length === 0) {
          this.logProgress(`No products found on page ${pageNum}, stopping pagination`);
          hasMoreProducts = false;
        } else {
          allProducts.push(...pageProducts);
          this.logProgress(`Found ${pageProducts.length} products on page ${pageNum}`);
          
          // Check if we've reached the end (some sites return empty pages or last page content)
          if (pageProducts.length < 20) { // Assuming ~20 products per page
            this.logProgress(`Fewer products than expected on page ${pageNum}, likely reached end`);
            hasMoreProducts = false;
          }
        }
        
        pageNum++;
        
        // Add delay between requests to be respectful
        if (hasMoreProducts) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      this.logProgress(`Finished scraping ${category.name}. Total products: ${allProducts.length}`);
      
    } catch (error) {
      this.logError(`Failed to scrape Ralph Lauren category ${category.name}`, error);
    }
    
    return allProducts;
  }
}

// Standalone runner
async function main() {
  const scraper = new RalphLaurenScraper();
  await scraper.run();
}

if (require.main === module) {
  main();
} 