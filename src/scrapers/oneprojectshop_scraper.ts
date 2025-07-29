// oneprojectshop_scraper.ts – v1
// =============================================================
// Features:
// - Extends BaseScraper for common functionality
// - Scans categories (configurable)
// - Extracts product info (title, url, images, price, brand, categories, gender, source)
// - Uses HTML parsing (cheerio) to extract data
// - Saves to PostgreSQL via ProductService
//
// Usage: npm run scrape:oneprojectshop

import axios from 'axios';
import * as cheerio from 'cheerio';
import { BaseScraper } from './base/base-scraper';
import { Category as CategoryType } from './base/base-scraper';
import { Product, calcSalePercent, normalizeBrandName } from './base/scraper_utils';
import * as dotenv from 'dotenv';
import { Category } from '../category.constants';
import { extractColorsWithHebrew } from 'src/color.constants';
dotenv.config();

const CATEGORIES: CategoryType[] = [
  {
    id: 'mens-short-t-shirts',
    name: Category.T_SHIRTS,
    gender: 'Men',
    url: 'https://www.oneprojectshop.com/collections/mens-short-t-shirts',
  },
   {
    id: 'mens-jackets',
    name: Category.JACKETS_COATS,
    gender: 'Men',
    url: 'https://www.oneprojectshop.com/collections/mens-jackets-and-coats',
  },
  {
    id: 'mens-swimwear',
    name: Category.SWIMWEAR,
    gender: 'Men',
    url: 'https://www.oneprojectshop.com/collections/mens-swimwear',
  },
  {
    id: 'mens-shoes',
    name: Category.SHOES,
    gender: 'Men',
    url: 'https://www.oneprojectshop.com/collections/mens-shoes',
  },
  {
    id: 'women-tshirts',
    name: Category.T_SHIRTS,
    gender: 'Women',
    url: 'https://www.oneprojectshop.com/collections/womens-shorts-t-shirts',
  },
  {
    id: 'women-tshirts',
    name: Category.LONG_T_SHIRTS,
    gender: 'Women',
    url: 'https://www.oneprojectshop.com/collections/long-t-shirts-women',
  },
  {
    id: 'women-shirts',
    name: Category.SHIRTS,
    gender: 'Women',
    url: 'https://www.oneprojectshop.com/collections/womens-buttoned-shirts',
  },
  {
    id: 'women-bodysuits',
    name: Category.BODYSUITS,
    gender: 'Women',
    url: 'https://www.oneprojectshop.com/collections/womens-leotards',
  },
  {
    id: 'women-jeans',
    name: Category.JEANS,
    gender: 'Women',
    url: 'https://www.oneprojectshop.com/collections/long-jeans-women',
  },
  {
    id: 'women-dresses',
    name: Category.DRESSES,
    gender: 'Women',
    url: 'https://www.oneprojectshop.com/collections/jeans-dress-women',
  },
  {
    id: 'women-tights',
    name: Category.TIGHTS,
    gender: 'Women',
    url: 'https://www.oneprojectshop.com/collections/tights-long-women',
  },
  {
    id: 'women-short-tights',
    name: Category.SHORT_TIGHTS,
    gender: 'Women',
    url: 'https://www.oneprojectshop.com/collections/short-tights-women',
  },
  {
    id: 'women-max-dress',
    name: Category.MAXI_DRESSES,
    gender: 'Women',
    url: 'https://www.oneprojectshop.com/collections/women-maxi-dresses',
  },
  {
    id: 'women-min-dress',
    name: Category.MINI_DRESSES,
    gender: 'Women',
    url: 'https://www.oneprojectshop.com/collections/women-mini-dresses',
  },
  {
    id: 'women-mid-dress',
    name: Category.MIDI_DRESSES,
    gender: 'Women',
    url: 'https://www.oneprojectshop.com/collections/midi-dresses-women',
  },
  {
    id: 'women-max-skirt',
    name: Category.MAXI_SKIRTS,
    gender: 'Women',
    url: 'https://www.oneprojectshop.com/collections/women-maxi-skirts',
  },
  {
    id: 'women-min-skirt',
    name: Category.MINI_SKIRTS,
    gender: 'Women',
    url: 'https://www.oneprojectshop.com/collections/women-mini-skirts',
  },
  {
    id: 'women-mid-skirt',
    name: Category.MIDI_SKIRTS,
    gender: 'Women',
    url: 'https://www.oneprojectshop.com/collections/women-midi-skirts',
  },
  {
    id: 'women-jackets',
    name: Category.JACKETS_COATS,
    gender: 'Women',
    url: 'https://www.oneprojectshop.com/collections/women-jackets-coats',
  },
  // Add more categories as needed
];

const BASE_URL = 'https://www.oneprojectshop.com';

class OneProjectShopScraper extends BaseScraper {
  protected readonly scraperName = 'OneProjectShop';
  protected readonly source = 'OneProjectShop';

  protected getCategories(): CategoryType[] {
    return CATEGORIES;
  }

  protected async scrapeCategory(category: CategoryType): Promise<Product[]> {
    return this.scrapeOneProjectShopCategory(category);
  }

  private extractProductsFromMeta(html: string): any[] {
    // Look for: var meta = {"products": ...};
    const metaMatch = html.match(/var\s+meta\s*=\s*(\{[\s\S]*?\});/);
    if (metaMatch) {
      try {
        const metaObj = JSON.parse(metaMatch[1]);
        if (Array.isArray(metaObj.products)) {
          this.logProgress(`Found ${metaObj.products.length} products in meta.products`);
          return metaObj.products;
        }
      } catch (e) {
        this.logWarning('Failed to parse meta.products JSON');
      }
    }
    return [];
  }

  private extractProductsFromProductItemTags(html: string): any[] {
    // Look for <product-item ...> tags and parse their attributes
    const productItems: any[] = [];
    const $ = cheerio.load(html);
    const elems = $('product-item, .product-item');
    this.logProgress(`extractProductsFromProductItemTags: found ${elems.length} elements`);
    if (elems.length > 0) {
      this.logProgress('First product-item HTML: ' + $.html(elems[0]).slice(0, 500));
    }
    elems.each((_, el) => {
      const attribs = el.attribs || {};
      productItems.push(attribs);
    });
    if (productItems.length) {
      this.logProgress(`Found ${productItems.length} products in <product-item> tags`);
    } else {
        this.logProgress(`Found ${productItems.length} products in <product-item> tags`);
    }
    return productItems;
  }

  private parseMetaProduct(metaProduct: any, category: CategoryType): Product | undefined {
    const title = metaProduct.title || '';
    const url = metaProduct.url ? `https://www.oneprojectshop.com${metaProduct.url}` : '';
    const images = metaProduct.featured_image ? [metaProduct.featured_image] : [];
    const price = metaProduct.price || null;
    const oldPrice = metaProduct.compare_at_price || null;
    const salePercent = calcSalePercent(price, oldPrice) ?? 0;
    const currency = 'ILS';
    const brand = normalizeBrandName(metaProduct.vendor || 'OneProjectShop');
    const categories = [category.name];
    const gender = category.gender;
    if (!title || !url) return undefined;
    return this.createProduct({
      title,
      url,
      images,
      colors: extractColorsWithHebrew(title, [], 'oneprojectshop_scraper'),
      isSellingFast: false,
      price,
      oldPrice,
      salePercent,
      currency,
      brand,
      categories,
      gender,
    });
  }

  // Restore fetchOneProjectShopPage for HTTP requests
  private async fetchOneProjectShopPage(url: string): Promise<string> {
    const { data } = await axios.get(url, {
      headers: {
        'accept': 'text/html,application/xhtml+xml,application/xml',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
      },
    });
    return data;
  }

  private async scrapeOneProjectShopCategory(category: CategoryType): Promise<Product[]> {
    let page = 1;
    let allProducts: Product[] = [];
    let hasMore = true;
    while (hasMore) {
      const url = `${category.url}${page > 1 ? `?page=${page}` : ''}`;
      this.logProgress(`Fetching ${url}`);
      const html = await this.fetchOneProjectShopPage(url);
      // --- 1. Parse meta.products for product identity ---
      const metaProducts = this.extractProductsFromMeta(html);
      const metaById: Record<string, any> = {};
      for (const p of metaProducts) {
        if (p.id) metaById[String(p.id)] = p;
      }
      // --- 2. Parse DOM for product-item elements ---
      const $ = cheerio.load(html);
      const productElems = $('.product-item');
      this.logProgress(`Found ${productElems.length} .product-item elements in DOM`);
      const products: Product[] = [];
      productElems.each((_, el) => {
        const elem = $(el);
        const id = elem.attr('data-infator-id') || elem.attr('id');
        const meta = id && metaById[id] ? metaById[id] : {};
        // --- Extract from DOM ---
        const title = elem.find('.product-item-meta__title').text().trim() || meta.title || '';
        const url = elem.find('.product-item__image-wrapper a').attr('href')
          ? `https://www.oneprojectshop.com${elem.find('.product-item__image-wrapper a').attr('href')}`
          : meta.url ? `https://www.oneprojectshop.com${meta.url}` : '';
        // Images: prefer data-selected-img, else <img src>
        let images: string[] = [];
        const img1 = elem.find('[data-selected-img]').attr('data-selected-img');
        const img2 = elem.find('img').attr('src');
        if (img1) images.push(img1.startsWith('http') ? img1 : `https:${img1}`);
        if (img2) images.push(img2.startsWith('http') ? img2 : `https:${img2}`);
        images = images.filter(Boolean);
        // Price: prefer .price, else meta.variants[0].price
        let price = null, oldPrice = null;
        const priceText = elem.find('.price').first().text().replace(/[^\d.]/g, '');
        if (priceText) price = parseFloat(priceText);
        // Sale/old price: look for compare-at or sale price
        const saleText = elem.find('.price--on-sale').first().text().replace(/[^\d.]/g, '');
        if (saleText) oldPrice = parseFloat(saleText);
        // Fallback to meta.variants
        if (!price && meta.variants && meta.variants[0]) price = meta.variants[0].price;
        if (!oldPrice && meta.variants && meta.variants[0]) oldPrice = meta.variants[0].compare_at_price;
        // Color: from data-selected-color or swatch, else empty
        let colors: string[] = [];
        const color = elem.find('.related-product-color-link[title]').attr('title');
        if (color) colors.push(color);
        // Brand/vendor: prefer meta
        const brand = normalizeBrandName(meta.vendor || elem.find('.product-item-meta__vendor').text().trim() || 'OneProjectShop');
        // Category/type: prefer meta
        const categories = [category.name, meta.type].filter(Boolean);
        const gender = category.gender;
        const salePercent = calcSalePercent(price, oldPrice) ?? 0;
        if (!title || !url) return;
        products.push(this.createProduct({
          title,
          url,
          images,
          colors: extractColorsWithHebrew(title, colors, 'oneprojectshop_scraper'),
          isSellingFast: false,
          price,
          oldPrice,
          salePercent,
          currency: 'ILS',
          brand,
          categories,
          gender,
        }));
      });
      allProducts.push(...products);
      hasMore = products.length >= 11;
      page++;
    }
    return allProducts;
  }
}

// Main function
async function main() {
  const scraper = new OneProjectShopScraper();
  await scraper.run();
}

// CLI entry point
if (require.main === module) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

export { main, OneProjectShopScraper }; 