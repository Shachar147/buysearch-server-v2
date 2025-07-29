import * as cheerio from 'cheerio';
import { BaseScraper } from './base/base-scraper';
import { Category as CategoryType } from './base/base-scraper';
import { Product, calcSalePercent, normalizeBrandName, extractCategory } from './base/scraper_utils';
import * as dotenv from 'dotenv';
import { Category } from '../category.constants';
import { fetchPageWithBrowser, handleCookieConsent } from './base/browser-helpers';
import { extractColorsWithHebrew } from 'src/color.constants';
dotenv.config();

const CATEGORIES: CategoryType[] = [
  {
    id: 'men-shoes-outlet',
    name: Category.SHOES,
    gender: 'Men',
    url: 'https://www.adidas.co.il/on/demandware.store/Sites-adidas-IL-Site/he_IL/Search-UpdateGrid?cgid=outlet-men-shoes&pmin=0.01&searchtrigger=shownext&start=0&sz=1000&selectedUrl=https%3A%2F%2Fwww.adidas.co.il%2Fon%2Fdemandware.store%2FSites-adidas-IL-Site%2Fhe_IL%2FSearch-UpdateGrid%3Fcgid%3Doutlet-men-shoes%26pmin%3D0.01%26searchtrigger%3Dshownext%26start%3D24%26sz%3D24',
  },
  {
    id: 'men-shoes-outlet',
    name: Category.SHOES,
    gender: 'Men',
    url: 'https://www.adidas.co.il/on/demandware.store/Sites-adidas-IL-Site/he_IL/Search-UpdateGrid?cgid=men-shoes&pmin=0.01&searchtrigger=shownext&start=0&sz=1000&selectedUrl=https%3A%2F%2Fwww.adidas.co.il%2Fon%2Fdemandware.store%2FSites-adidas-IL-Site%2Fhe_IL%2FSearch-UpdateGrid%3Fcgid%3Dmen-shoes%26pmin%3D0.01%26searchtrigger%3Dshownext%26start%3D24%26sz%3D24',
  },
  {
    id: 'women-shoes-outlet',
    name: Category.SHOES,
    gender: 'Women',
    url: 'https://www.adidas.co.il/on/demandware.store/Sites-adidas-IL-Site/he_IL/Search-UpdateGrid?cgid=women-shoes&pmin=0.01&searchtrigger=shownext&start=0&sz=1000&selectedUrl=https%3A%2F%2Fwww.adidas.co.il%2Fon%2Fdemandware.store%2FSites-adidas-IL-Site%2Fhe_IL%2FSearch-UpdateGrid%3Fcgid%3Dwomen-shoes%26pmin%3D0.01%26searchtrigger%3Dshownext%26start%3D24%26sz%3D24',
  },
  {
    id: 'women-clothing',
    name: Category.CLOTHING,
    gender: 'Women',
    url: 'https://www.adidas.co.il/on/demandware.store/Sites-adidas-IL-Site/he_IL/Search-UpdateGrid?cgid=women-clothing&pmin=0.01&searchtrigger=shownext&start=0&sz=1000&selectedUrl=https%3A%2F%2Fwww.adidas.co.il%2Fon%2Fdemandware.store%2FSites-adidas-IL-Site%2Fhe_IL%2FSearch-UpdateGrid%3Fcgid%3Dwomen-clothing%26pmin%3D0.01%26searchtrigger%3Dshownext%26start%3D24%26sz%3D24',
  },
  { 
    id: 'men-clothing',
    name: Category.CLOTHING,
    gender: 'Men',
    url: 'https://www.adidas.co.il/on/demandware.store/Sites-adidas-IL-Site/he_IL/Search-UpdateGrid?cgid=men-clothing&pmin=0.01&searchtrigger=shownext&start=0&sz=1000&selectedUrl=https%3A%2F%2Fwww.adidas.co.il%2Fon%2Fdemandware.store%2FSites-adidas-IL-Site%2Fhe_IL%2FSearch-UpdateGrid%3Fcgid%3Dmen-clothing%26pmin%3D0.01%26searchtrigger%3Dshownext%26start%3D24%26sz%3D24',
  },
  {
    id: 'men-accessories',
    name: Category.ACCESSORIES,
    gender: 'Men',
    url: 'https://www.adidas.co.il/on/demandware.store/Sites-adidas-IL-Site/he_IL/Search-UpdateGrid?cgid=men-accessories&pmin=0.01&searchtrigger=shownext&start=0&sz=1000&selectedUrl=https%3A%2F%2Fwww.adidas.co.il%2Fon%2Fdemandware.store%2FSites-adidas-IL-Site%2Fhe_IL%2FSearch-UpdateGrid%3Fcgid%3Dmen-accessories%26pmin%3D0.01%26searchtrigger%3Dshownext%26start%3D24%26sz%3D24',
  },
  {
    id: 'women-accessories',
    name: Category.ACCESSORIES,
    gender: 'Women',
    url: 'https://www.adidas.co.il/on/demandware.store/Sites-adidas-IL-Site/he_IL/Search-UpdateGrid?cgid=women-accessories&pmin=0.01&searchtrigger=shownext&start=0&sz=1000&selectedUrl=https%3A%2F%2Fwww.adidas.co.il%2Fon%2Fdemandware.store%2FSites-adidas-IL-Site%2Fhe_IL%2FSearch-UpdateGrid%3Fcgid%3Dwomen-accessories%26pmin%3D0.01%26searchtrigger%3Dshownext%26start%3D24%26sz%3D24',
  }
];

const BASE_URL = 'https://www.adidas.co.il';

class AdidasScraper extends BaseScraper {
  protected readonly scraperName = 'Adidas';
  protected readonly source = 'Adidas';

  protected getCategories(): CategoryType[] {
    return CATEGORIES;
  }

  protected async scrapeCategory(category: CategoryType): Promise<Product[]> {
    return this.scrapeAdidasCategory(category);
  }

  private async fetchAdidasPage(url: string): Promise<string> {
    return fetchPageWithBrowser(url, {
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
      waitUntil: 'networkidle2',
      timeout: 60000,
      onPageReady: async (page) => {
        // Try to accept cookie consent if it appears
        await handleCookieConsent(page, ['button']);
        
        // Custom cookie consent handling for Hebrew text
        try {
          const buttons = await page.$$('button');
          for (const btn of buttons) {
            const text = await page.evaluate(el => el.textContent, btn);
            if (text && text.includes('אני מאשר')) {
              await btn.click();
              await new Promise(res => setTimeout(res, 1000)); // Wait for modal to close
              break;
            }
          }
        } catch (e) {
          // If not found, continue
        }
        
        await new Promise(res => setTimeout(res, 5000)); // Wait 5 seconds
      }
    });
  }

  private parseAdidasProducts(html: string, category: CategoryType): Product[] {
    const $ = cheerio.load(html);
    // Use .product[data-pid] as the product card selector
    const productCards = $('.product[data-pid]');
    console.log(`Found ${productCards.length} products`);
    const products: Product[] = [];
    productCards.each((_, el) => {
      const elem = $(el);
      // Extract product data from data-tracking-product-title JSON
      let trackingJson: any = {};
      const trackingAttr = elem.attr('data-tracking-product-title');
      if (trackingAttr) {
        try {
          trackingJson = JSON.parse(trackingAttr);
        } catch (e) {
          trackingJson = {};
        }
      }
      // Title
      let title = elem.find('.tile-body').find(".link").text().trim();
      console.log(`Title ${title}`)
      // Brand
      let brand = normalizeBrandName(trackingJson.product_brand || 'Adidas');
      console.log(`Brand ${brand}`)
      // URL
      let url = '';
      const linkElem = elem.find('.image-container a[href]');
      if (linkElem.length) {
        url = linkElem.attr('href') || '';
        if (url && !url.startsWith('http')) url = BASE_URL + url;
      }
      console.log(`URL ${url}`)
      // Images
      const imgElems = elem.find('img');
      let images: string[] = [];
      imgElems.each((i, img) => {
        let src = $(img).attr('src') || '';
        if (src && src.startsWith('//')) src = 'https:' + src;
        if (src && src.startsWith('/')) src = BASE_URL + src;
        if (src) images.push(src.split(',').join('%2C'));
      });
      // Filter out the QuickView icon image
      images = images.filter(src => !src.includes('QuickView Icon.png'));
      images = images.filter(Boolean);
      // Price and oldPrice: handle discount case
      let price: number | null = null;
      let oldPrice: number | null = null;
      // If both sales and strike-through are present, use them
      const saleValueElem = elem.find(".price .sales .value[content]");
      const strikeValueElem = elem.find(".price .strike-through.list .value[content]");
      if (saleValueElem.length && strikeValueElem.length) {
        const saleContent = saleValueElem.attr('content');
        const strikeContent = strikeValueElem.attr('content');
        if (saleContent) price = parseFloat(saleContent);
        if (strikeContent) oldPrice = parseFloat(strikeContent);
      } else {
        // Fallback to previous logic
        if (saleValueElem.length) {
          const saleContent = saleValueElem.attr('content');
          if (saleContent) price = parseFloat(saleContent);
        }
        if (price == null) {
          if (trackingJson.product_price) {
            price = parseFloat(String(trackingJson.product_price).replace(',', ''));
          } else {
            const priceText = elem.find('.product-price, .price').text().replace(/[^\d.,]/g, '').replace(',', '');
            if (priceText) {
              const match = priceText.match(/\d+(\.\d+)?/);
              if (match) price = parseFloat(match[0]);
            }
          }
        }
        // Old price (if on sale, fallback)
        if (trackingJson.product_discount_percentage && price) {
          const discount = parseFloat(trackingJson.product_discount_percentage);
          if (discount && discount > 0) {
            oldPrice = Math.round((price * 100) / (100 - discount));
          }
        } else {
          const oldPriceText = elem.find('.product-strike-price, .old-price').text().replace(/[^\d.,]/g, '').replace(',', '');
          if (oldPriceText) {
            const match = oldPriceText.match(/\d+(\.\d+)?/);
            if (match) oldPrice = parseFloat(match[0]);
          }
        }
      }
      // Colors: try to extract from product_name or swatch
      let colors: string[] = [];
      if (trackingJson.product_color) {
        colors.push(trackingJson.product_color);
      }
      // Also extract colors from data-attr-value on <img> tags (color swatches)
      elem.find('img[data-attr-value]').each((_, img) => {
        const colorVal = $(img).attr('data-attr-value');
        if (colorVal) {
          colorVal.split('/').forEach(part => {
            const trimmed = part.trim();
            if (trimmed) colors.push(trimmed);
          });
        }
      });
      colors = Array.from(new Set(colors));
      colors = extractColorsWithHebrew(title, colors, 'adidas_scraper');
      // Categories
      const categories = [category.name, ...extractCategory(title)];
      const gender = category.gender;
      // Sale percent
      let salePercent = null;
      if (trackingJson.product_discount_percentage) {
        salePercent = parseFloat(trackingJson.product_discount_percentage);
      } else {
        salePercent = calcSalePercent(price, oldPrice) ?? 0;
      }
      const product = this.createProduct({
        title,
        url,
        images,
        colors,
        isSellingFast: false,
        price,
        oldPrice,
        salePercent,
        currency: 'ILS',
        brand,
        categories,
        gender,
      });
      products.push(product);
    });
    return products;
  }

  private async scrapeAdidasCategory(category: CategoryType): Promise<Product[]> {
    let page = 0;
    let allProducts: Product[] = [];
    let hasMore = true;
    const PAGE_SIZE = 1000;
    const MAX_PAGES = 3;
    while (hasMore && page < MAX_PAGES) {
      let url;
      // Extract cgid from the category URL (everything after 'https://www.adidas.co.il/he/')
      if (page === 0) {
        url = category.url;
      } else {
        // Use the AJAX endpoint for pagination, with dynamic cgid
        const start = page * PAGE_SIZE;
        url = category.url.replace('&start=0&sz=1000', `&start=${start}&sz=${PAGE_SIZE}`);
      }
      this.logProgress(`Fetching ${url}`);
      const html = await this.fetchAdidasPage(url);
      const products = this.parseAdidasProducts(html, category);
      this.logProgress(`Found ${products.length} products in ${category.name} (page ${page + 1})`);
      if (!products.length) break;
      allProducts.push(...products);
      hasMore = products.length >= PAGE_SIZE;
      page++;
    }
    return allProducts;
  }
}

// Main function
async function main() {
  const scraper = new AdidasScraper();
  await scraper.run();
}

// CLI entry point
if (require.main === module) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

export { main, AdidasScraper }; 