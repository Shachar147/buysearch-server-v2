import axios from 'axios';
import { BaseScraper, Category as BaseCategory } from './base/base-scraper';
import { Product, calcSalePercent } from './base/scraper_utils';
import { Category } from '../category.constants';
import { extractColors } from 'src/color.constants';

export class LululemonScraper extends BaseScraper {
  protected readonly scraperName = 'Lululemon';
  protected readonly source = 'Lululemon';

  protected getCategories(): BaseCategory[] {
    return [
      {
        id: 'women-joggers',
        name: Category.JOGGERS,
        gender: 'Women',
        url: 'https://shop.lululemon.com/c/women-joggers/n1ea9q',
        category: 'women-joggers',
        cdpHash: 'n1ea9q',
        sl: 'US',
        locale: 'en_US',
      },
      {
        id: 'women-bestsellers',
        name: "New",
        gender: 'Women',
        url: 'https://shop.lululemon.com/c/women-bestsellers/n16o10znskl',
        category: 'women-bestsellers',
        cdpHash: 'n16o10znskl',
        sl: 'US',
        locale: 'en_US',
      },
      {
        id: 'women-we-made-too-much',
        name: "Sale",
        gender: 'Women',
        url: 'https://shop.lululemon.com/c/women-we-made-too-much/n16o10z8mhd',
        category: 'women-we-made-too-much',
        cdpHash: 'n16o10z8mhd',
        sl: 'US',
        locale: 'en_US',
      },
      {
        id: 'women-shorts',
        name: Category.SHORTS,
        gender: 'Women',
        url: 'https://shop.lululemon.com/c/women-shorts/n11ybt',
        category: 'women-shorts',
        cdpHash: 'n11ybt',
        sl: 'US',
        locale: 'en_US',
      },
      {
        id: 'women-tank-tops',
        name: Category.TANKS,
        gender: 'Women',
        url: 'https://shop.lululemon.com/c/women-tank-tops/n1uk4w',
        category: 'women-tank-tops',
        cdpHash: 'n1uk4w',
        sl: 'US',
        locale: 'en_US',
      },
      {
        id: 'women-leggings',
        name: Category.TIGHTS,
        gender: 'Women',
        url: 'https://shop.lululemon.com/c/women-leggings/n1udsq',
        category: 'women-leggings',
        cdpHash: 'n1udsq',
        sl: 'US',
        locale: 'en_US',
      },
      {
        id: 'women-bodysuits',
        name: Category.BODYSUITS,
        gender: 'Women',
        url: 'https://shop.lululemon.com/c/women-bodysuits/n14ron',
        category: 'women-bodysuits',
        cdpHash: 'n14ron',
        sl: 'US',
        locale: 'en_US',
      },
      {
        id: 'women-coats-and-jackets',
        name: Category.JACKETS_COATS,
        gender: 'Women',
        url: 'https://shop.lululemon.com/c/women-coats-and-jackets/n1p54j',
        category: 'women-coats-and-jackets',
        cdpHash: 'n1p54j',
        sl: 'US',
        locale: 'en_US',
      },
      {
        id: 'women-dresses',
        name: Category.DRESSES,
        gender: 'Women',
        url: 'https://shop.lululemon.com/c/women-dresses/n1mk31',
        category: 'women-dresses',
        cdpHash: 'n1mk31',
        sl: 'US',
        locale: 'en_US',
      },
      {
        id: 'women-shirts',
        name: Category.T_SHIRTS,
        gender: 'Women',
        url: 'https://shop.lululemon.com/c/women-shirts/n1atfg',
        category: 'women-shirts',
        cdpHash: 'n1atfg',
        sl: 'US',
        locale: 'en_US',
      },
      {
        id: 'women-skirts',
        name: Category.SKIRTS,
        gender: 'Women',
        url: 'https://shop.lululemon.com/c/women-skirts/n1efya',
        category: 'women-skirts',
        cdpHash: 'n1efya',
        sl: 'US',
        locale: 'en_US',
      },
      {
        id: 'women-bras-and-underwear',
        name: Category.LINGERIE,
        gender: 'Women',
        url: 'https://shop.lululemon.com/c/women-bras-and-underwear/n1sv6a',
        category: 'women-bras-and-underwear',
        cdpHash: 'n1sv6a',
        sl: 'US',
        locale: 'en_US',
      },
      {
        id: 'women-hoodies-and-sweatshirts',
        name: Category.SWEATERS,
        gender: 'Women',
        url: 'https://shop.lululemon.com/c/women-hoodies-and-sweatshirts/n1jux6',
        category: 'women-hoodies-and-sweatshirts',
        cdpHash: 'n1jux6',
        sl: 'US',
        locale: 'en_US',
      },
      {
        id: 'women-pants',
        name: Category.PANTS,
        gender: 'Women',
        url: 'https://shop.lululemon.com/c/women-pants/n1qd1q',
        category: 'women-pants',
        cdpHash: 'n1qd1q',
        sl: 'US',
        locale: 'en_US',
      },
      {
        id: 'women-shoes',
        name: Category.SHOES,
        gender: 'Women',
        url: 'https://shop.lululemon.com/c/women-shoes/n16o10zn4fc',
        category: 'women-shoes',
        cdpHash: 'n16o10zn4fc',
        sl: 'US',
        locale: 'en_US',
      },
      {
        id: 'men-clothes',
        name: Category.CLOTHING,
        gender: 'Men',
        url: 'https://shop.lululemon.com/c/men-clothes/n1oxc7',
        category: 'men-clothes',
        cdpHash: 'n1oxc7',
        sl: 'US',
        locale: 'en_US',
      },
      {
        id: 'women-accessories',
        name: Category.ACCESSORIES,
        gender: 'Women',
        url: 'https://shop.lululemon.com/c/accessories/n1dslk',
        category: 'accessories',
        cdpHash: 'n1dslk',
        sl: 'US',
        locale: 'en_US',
      },
      {
        id: 'women-bags',
        name: Category.BAGS,
        gender: 'Women',
        url: 'https://shop.lululemon.com/c/bags/n1rdci',
        category: 'bags',
        cdpHash: 'n1rdci',
        sl: 'US',
        locale: 'en_US',
      },
    ];
  }

  private async fetchLululemonProducts(category: BaseCategory, page: number, pageSize: number = 12) {
    const GRAPHQL_URL = 'https://shop.lululemon.com/snb/graphql';
    const variables = {
      pageSize,
      page,
      useHighlights: true,
      onlyStore: false,
      abFlags: ["cdpSeodsEnabled"],
      category: category.category,
      cdpHash: category.cdpHash,
      forceMemberCheck: false,
      fusionExperimentVariant: '',
      locale: category.locale,
      Ns: '',
      nValue: null,
      sl: category.sl,
      storeId: null,
      styleboost: [],
    };
    const data = {
      query: `query CategoryPageDataQuery( $category: String! $cid: String $forceMemberCheck: Boolean $nValue: String $cdpHash: String $sl: String! $locale: String! $Ns: String $storeId: String $pageSize: Int $page: Int $onlyStore: Boolean $useHighlights: Boolean $abFlags: [String] $styleboost: [String] $fusionExperimentVariant: String ) { categoryPageData( category: $category nValue: $nValue cdpHash: $cdpHash locale: $locale sl: $sl Ns: $Ns page: $page pageSize: $pageSize storeId: $storeId onlyStore: $onlyStore forceMemberCheck: $forceMemberCheck cid: $cid useHighlights: $useHighlights abFlags: $abFlags styleboost: $styleboost fusionExperimentVariant: $fusionExperimentVariant ) { products { displayName pdpUrl images: swatches { primaryImage } listPrice salePrice currencyCode allAvailableSizes skuStyleOrder { colorName } } } }`,
      variables,
    };
    const headers = {
      'accept': 'application/json',
      'content-type': 'application/json',
      'origin': 'https://shop.lululemon.com',
      'user-agent': 'Mozilla/5.0',
    };
    try {
      const res = await axios.post(GRAPHQL_URL, data, { headers });
      return res.data;
    } catch (error: any) {
      if (error.response) {
        console.error('Lululemon API 400 error:', {
          status: error.response.status,
          statusText: error.response.statusText,
          requestData: data,
          responseData: error.response.data,
        });
        if (error.response.data && error.response.data.errors) {
          console.error('Lululemon API error details:', JSON.stringify(error.response.data.errors, null, 2));
        }
      } else {
        console.error('Lululemon API error:', error.message);
      }
      throw error;
    }
  }

  protected async scrapeCategory(category: BaseCategory): Promise<Product[]> {
    const products: Product[] = [];
    let page = 1;
    const pageSize = 12;
    let totalPages = 20; // Will update after first request
    while (page <= totalPages) {
      console.log(`[Lululemon] Fetching page ${page}`);
      const data = await this.fetchLululemonProducts(category, page, pageSize);
      const catData = data?.data?.categoryPageData;
      if (!catData) break;
      if (page === 1 && catData.totalProductPages) {
        totalPages = catData.totalProductPages;
      }
      const items = catData.products || [];
      console.log(`[Lululemon] Page ${page}: found ${items.length} products`);
      if (!items.length) break;
      for (const item of items) {
        const title = item.displayName;
        const url = `https://shop.lululemon.com${item.pdpUrl}`;
        const images = (item.images || item.swatches || []).map((img: any) => img.primaryImage ? img.primaryImage : '').filter(Boolean);
        console.log(`[Lululemon] Images: ${images[0]}`);
        // // Fix image extraction: use only the image code, and build the full URL with parameters
        // const images = (item.images || [])
        // .map((img: any) => {
        //     // If primaryImage is already a full URL, use as is; otherwise, build the correct URL
        //     let code = img.primaryImage;
        //     if (!code) return null;
        //     // Remove any accidental double prefix
        //     if (code.startsWith('https://images.lululemon.com/is/image/lululemon/')) {
        //     code = code.replace('https://images.lululemon.com/is/image/lululemon/', '');
        //     }
        //     return `https://images.lululemon.com/is/image/lululemon/${code}?wid=2420&op_usm=0.5,2,10,0&fmt=webp&qlt=80,1&fit=constrain,0&op_sharpen=0&resMode=sharp2&iccEmbed=0&printRes=72`;
        // })
        // .filter(Boolean);
        const colors = (item.skuStyleOrder || []).map((s: any) => s.colorName).filter(Boolean);
        const price = item.listPrice && item.listPrice.length ? parseFloat(item.listPrice[0]) : null;
        const oldPrice = item.salePrice && item.salePrice.length ? parseFloat(item.salePrice[0]) : price;
        const salePercent = calcSalePercent(price, oldPrice);
        products.push(this.createProduct({
          title,
          url,
          images,
          colors: extractColors(title, colors),
          price,
          oldPrice,
          salePercent,
          currency: item.currencyCode || 'USD',
          brand: 'Lululemon',
          categories: [category.name],
          gender: category.gender,
        }));
      }
      page++;
    }
    return products;
  }
}

// Standalone runner
async function main() {
  const scraper = new LululemonScraper();
  await scraper.run();
}

if (require.main === module) {
  main();
} 