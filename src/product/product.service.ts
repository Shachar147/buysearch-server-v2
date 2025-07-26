import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Product } from './product.entity';
import { BrandService } from '../brand/brand.service';
import { CategoryService } from '../category/category.service';
import { ColorService } from '../color/color.service';
import { SourceService } from '../source/source.service';
import { Brackets } from 'typeorm';
import { FavouritesService } from '../favourites/favourites.service';
import { PriceHistoryService } from '../price-history/price-history.service';
import { PAGINATION_LIMIT } from '../consts';

export interface ProductFilters {
  color?: string;
  brand?: string;
  category?: string;
  priceFrom?: number;
  priceTo?: number;
  sort?: string;
  search?: string;
  offset?: number;
  limit?: number;
  priceRange?: string;
  gender?: string;
  isFavourite?: boolean;
  source?: string;
  isOnSale?: string;
  salePercent?: number;
  withPriceChange?: boolean;
}

interface ProductInput {
  title: string;
  url: string;
  images: string[];
  colors: string[];
  isSellingFast: boolean;
  price: number | null;
  oldPrice: number | null;
  salePercent: number | null;
  currency: string;
  brand: string;
  categories: string[];
  gender: string;
  source: string;
}

export type ScrapingResult = {
  created: number;
  updated: number;
  total: number;
};

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    private brandService: BrandService,
    private categoryService: CategoryService,
    private colorService: ColorService,
    private sourceService: SourceService,
    private favouritesService: FavouritesService,
    private readonly priceHistoryService: PriceHistoryService,
  ) {}

  async findAll(filters: ProductFilters = {}, userId?: number): Promise<any> {
    // 1. Pre-query related tables for IDs
    let brandIds: number[] = [];
    let categoryIds: number[] = [];
    let colorIds: number[] = [];
    let sourceIds: number[] = [];

    const offset = Number(filters.offset || 0);
    const limit = Number(filters.limit || PAGINATION_LIMIT);

    const NO_RESULTS = {
      total: 0,
      offset,
      limit,
      hasNextPage: false,
      data: [],
    }

    if (filters.brand) {
      const brands = await this.brandService.findByNameOrNames(filters.brand);
      brandIds = brands.map(b => b.id);
      if (!brandIds.length) return { total: 0, data: NO_RESULTS };
    }
    if (filters.category) {
      const categories = await this.categoryService.findByNameOrNames(filters.category);
      categoryIds = categories.map(c => c.id);
      if (!categoryIds.length) return { total: 0, data: NO_RESULTS };
    }
    if (filters.color) {
      const colors = await this.colorService.findByNameOrNames(filters.color);
      colorIds = colors.map(c => c.id);
      if (!colorIds.length) return { total: 0, data: [] };
    }
    if (filters.source && filters.source !== 'All') {
      const sources = await this.sourceService.findByNameOrNames(filters.source);
      sourceIds = sources.map(s => s.id);
      if (!sourceIds.length) return { total: 0, data: [] };
    }

    // 2. Build main products query (no joins)
    const qb = this.productsRepository.createQueryBuilder('product');
    qb.where('1=1');

    if (brandIds.length) {
      qb.andWhere('product."brandId" IN (:...brandIds)', { brandIds });
    }
    if (sourceIds.length) {
      qb.andWhere('product."sourceId" IN (:...sourceIds)', { sourceIds });
    } else if (!filters.source) {
      // If no source filter is passed, only include products from active sources
      qb.andWhere('product."sourceId" IN (SELECT s.id FROM sources s WHERE s."isActive" = true)');
    }
    if (filters.gender) {
      qb.andWhere('LOWER(product.gender) = LOWER(:gender)', { gender: filters.gender });
    }
    if (filters.priceFrom !== undefined) {
      qb.andWhere('product.price >= :priceFrom', { priceFrom: filters.priceFrom });
    }
    if (filters.priceTo !== undefined) {
      qb.andWhere('product.price <= :priceTo', { priceTo: filters.priceTo });
    }
    if (filters.search) {
      qb.andWhere('product.title ILIKE :search', { search: `%${filters.search}%` });
    }
    if (filters.isOnSale !== undefined) {
      if (filters.isOnSale === 'Yes') {
        qb.andWhere('product."oldPrice" > product.price');
      } else if (filters.isOnSale === 'No') {
        qb.andWhere('(product."oldPrice" <= product.price OR product.oldPrice IS NULL)');
      }
    }
    if (filters.salePercent !== undefined) {
      qb.andWhere('product."salePercent" >= :salePercent', { salePercent: filters.salePercent });
    }
    // For category and color, filter by product IDs in join tables
    if (categoryIds.length) {
      qb.andWhere(`product.id IN (SELECT pc."productId" FROM product_categories pc WHERE pc."categoryId" IN (:...categoryIds))`, { categoryIds });
    }
    if (colorIds.length) {
      qb.andWhere(`product.id IN (SELECT pc."productId" FROM product_colors pc WHERE pc."colorId" IN (:...colorIds))`, { colorIds });
    }
    // Favourites
    if (filters.isFavourite && userId) {
      const favs = await this.favouritesService.getFavourites(userId);
      const favIds = favs.map((f: any) => f.productId);
      if (!favIds.length) {
        return { total: 0, offset: 0, limit, hasNextPage: false, data: [] };
      }
      qb.andWhere('product.id IN (:...favIds)', { favIds });
    }
    // Price range
    if (filters.priceRange) {
      const priceRanges = filters.priceRange.split(',').map(r => r.trim()).filter(Boolean);
      const priceRangeMap = {
        'Up to 100 ILS': { from: 0, to: 100 },
        '100-150 ILS': { from: 100, to: 150 },
        '151-200 ILS': { from: 151, to: 200 },
        '201-300 ILS': { from: 201, to: 300 },
        '301-600 ILS': { from: 301, to: 600 },
        '601-1000 ILS': { from: 601, to: 1000 },
        '1000+ ILS': { from: 1001, to: 1000000 },
      };
      if (priceRanges.length > 1) {
        qb.andWhere(new Brackets(qb1 => {
          priceRanges.forEach((label, idx) => {
            const range = priceRangeMap[label];
            if (range) {
              qb1.orWhere('(product.price >= :from' + idx + ' AND product.price <= :to' + idx + ')', {
                ['from' + idx]: range.from,
                ['to' + idx]: range.to,
              });
            }
          });
        }));
      } else if (priceRanges.length === 1 && priceRangeMap[priceRanges[0]]) {
        const range = priceRangeMap[priceRanges[0]];
        qb.andWhere('product.price >= :from AND product.price <= :to', { from: range.from, to: range.to });
      }
    }
    // price change
    if (filters.withPriceChange) {
      const ids = await this.priceHistoryService.getProductIdsWithPriceChange();
      if (!ids.length) {
        return { total: 0, offset: 0, limit: filters.limit || 20, hasNextPage: false, data: [] };
      }
      qb.andWhere('product.id IN (:...ids)', { ids });
    }

    // Sorting
    if (filters.sort === 'Price: Low to High') {
      qb.orderBy('product.price', 'ASC');
    } else if (filters.sort === 'Price: High to Low') {
      qb.orderBy('product.price', 'DESC');
    } else if (filters.sort === 'Sale: Highest Percent') {
      qb.orderBy('product.salePercent', 'DESC').addOrderBy('product.id', 'DESC');
    } else if (filters.sort === 'Created: Newest First') {
      qb.orderBy('product.createdAt', 'DESC');
    } else if (filters.sort === 'Created: Oldest First') {
      qb.orderBy('product.createdAt', 'ASC');
    } else if (filters.sort === 'Updated: Newest First') {
      qb.orderBy('product.updatedAt', 'DESC');
    } else if (filters.sort === 'Updated: Oldest First') {
      qb.orderBy('product.updatedAt', 'ASC');
    } else {
      qb.orderBy('product.id', 'DESC');
    }
    // Pagination
    qb.skip(offset).take(limit);

    // // Log the generated query with parameters injected
    // const [query, parameters] = qb.getQueryAndParameters();
    // let interpolatedQuery = query;
    // parameters.forEach((param, i) => {
    //   const placeholder = new RegExp(`\\$${i + 1}`, 'g');
    //   const value = typeof param === 'string' ? `'${param}'` : Array.isArray(param) ? param.map(p => typeof p === 'string' ? `'${p}'` : p).join(',') : param;
    //   interpolatedQuery = interpolatedQuery.replace(placeholder, String(value));
    // });
    // console.log('--- EXECUTING QUERY ---');
    // console.log(interpolatedQuery);
    // console.log('-----------------------');

    // 3. Get product IDs and total
    const [products, total] = await qb.getManyAndCount();
    const productIds = products.map(p => p.id);
    if (!productIds.length) return { total: 0, offset, limit, hasNextPage: false, data: [] };

    // 4. Fetch full product data for those IDs (with relations)
    const fullProducts = await this.productsRepository.find({
      where: { id: In(productIds) },
      relations: ['brand', 'categories', 'colors', 'source'],
    });

    // Re-order the full products to match the sorted IDs from the first query
    const productMap = new Map(fullProducts.map(p => [p.id, p]));
    const sortedFullProducts = products.map(p => productMap.get(p.id)).filter(Boolean);

    // 5. Return results
    const mappedData = sortedFullProducts.map(product => ({
      ...product,
      brand: product.brand ? { id: product.brand.id, name: product.brand.name } : null,
      source: product.source ? { id: product.source.id, name: product.source.name } : null,
      categories: Array.isArray(product.categories)
        ? product.categories.map(c => ({ id: c.id, name: c.name }))
        : [],
      colors: Array.isArray(product.colors)
        ? product.colors.map(c => ({ id: c.id, name: c.name }))
        : [],
      price: Number(product.price),
      oldPrice: product.oldPrice ? Number(product.oldPrice) : undefined
    }));

    return {
      total,
      offset,
      limit,
      hasNextPage: offset + limit < total,
      data: mappedData,
    };
  }

  async findAllOld(filters: ProductFilters = {}, userId?: number): Promise<any> {
    const qb = this.productsRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.brand', 'brand')
      .leftJoinAndSelect('product.source', 'source')
      .leftJoinAndSelect('product.categories', 'category')
      .leftJoinAndSelect('product.colors', 'color')
      .distinct(true);
    // Only include products from active sources
    qb.andWhere('source.isActive = true');

    if (filters.isFavourite && userId) {
      const favs = await this.favouritesService.getFavourites(userId);
      const favIds = favs.map((f: any) => f.productId);
      if (favIds.length === 0) {
        return { total: 0, offset: 0, limit: filters.limit || 20, hasNextPage: false, data: [] };
      }
      qb.andWhere('product.id IN (:...favIds)', { favIds });
    }

    if (filters.brand) {
      if (filters.brand.includes(',')) {
        const brands = filters.brand.split(',').map(b => b.trim().toLowerCase());
        qb.andWhere('LOWER(brand.name) IN (:...brands)', { brands });
      } else {
        qb.andWhere('LOWER(brand.name) = :brand', { brand: filters.brand.toLowerCase() });
      }
    }
    if (filters.category) {
      if (filters.category.includes(',')) {
        const categories = filters.category.split(',').map(c => c.trim().toLowerCase());
        qb.andWhere('LOWER(category.name) IN (:...categories)', { categories });
      } else {
        qb.andWhere('LOWER(category.name) = :category', { category: filters.category.toLowerCase() });
      }
    }
    if (filters.color) {
      if (filters.color.includes(',')) {
        const colors = filters.color.split(',').map(c => c.trim().toLowerCase()).filter(Boolean);
        if (colors.length > 0) {
          qb.andWhere('LOWER(color.name) IN (:...colors)', { colors });
        }
      } else {
        qb.andWhere('LOWER(color.name) = :color', { color: filters.color.toLowerCase() });
      }
    }
    if (filters.priceFrom !== undefined) {
      qb.andWhere('product.price >= :priceFrom', { priceFrom: filters.priceFrom });
    }
    if (filters.priceTo !== undefined) {
      qb.andWhere('product.price <= :priceTo', { priceTo: filters.priceTo });
    }
    if (filters.search) {
      qb.andWhere('product.title ILIKE :search', { search: `%${filters.search}%` });
    }
    // Sorting logic
    if (filters.sort === 'Price: Low to High') {
      qb.orderBy('product.price', 'ASC');
    } else if (filters.sort === 'Price: High to Low') {
      qb.orderBy('product.price', 'DESC');
    } else if (filters.sort === 'Sale: Highest Percent') {
      // qb.andWhere('product.salePercent is not NULL')
      qb.orderBy('product.salePercent', 'DESC').addOrderBy('product.id', 'DESC');
    } else if (filters.sort === 'Created: Newest First') {
      qb.orderBy('product.createdAt', 'DESC');
    } else if (filters.sort === 'Created: Oldest First') {
      qb.orderBy('product.createdAt', 'ASC');
    } else if (filters.sort === 'Updated: Newest First') {
      qb.orderBy('product.updatedAt', 'DESC');
    } else if (filters.sort === 'Updated: Oldest First') {
      qb.orderBy('product.updatedAt', 'ASC');
    } else {
      // Default or relevance
      qb.orderBy('product.id', 'DESC');
    }
    if (filters.priceRange) {
      const priceRanges = filters.priceRange.split(',').map(r => r.trim()).filter(Boolean);
      const priceRangeMap = {
        'Up to 100 ILS': { from: 0, to: 100 },
        '100-150 ILS': { from: 100, to: 150 },
        '151-200 ILS': { from: 151, to: 200 },
        '201-300 ILS': { from: 201, to: 300 },
        '301-600 ILS': { from: 301, to: 600 },
        '601-1000 ILS': { from: 601, to: 1000 },
        '1000+ ILS': { from: 1001, to: 1000000 },
      };
      if (priceRanges.length > 1) {
        qb.andWhere(new Brackets(qb1 => {
          priceRanges.forEach((label, idx) => {
            const range = priceRangeMap[label];
            if (range) {
              qb1.orWhere('(product.price >= :from' + idx + ' AND product.price <= :to' + idx + ')', {
                ['from' + idx]: range.from,
                ['to' + idx]: range.to,
              });
            }
          });
        }));
      } else if (priceRanges.length === 1 && priceRangeMap[priceRanges[0]]) {
        const range = priceRangeMap[priceRanges[0]];
        qb.andWhere('product.price >= :from AND product.price <= :to', { from: range.from, to: range.to });
      }
    }
    if (filters.gender) {
      qb.andWhere('LOWER(product.gender) = LOWER(:gender)', { gender: filters.gender });
    }

    if (filters.withPriceChange) {
      const ids = await this.priceHistoryService.getProductIdsWithPriceChange();
      if (!ids.length) {
        return { total: 0, offset: 0, limit: filters.limit || 20, hasNextPage: false, data: [] };
      }
      qb.andWhere('product.id IN (:...ids)', { ids });
    }
    if (filters.source && filters.source != 'All') {
      if (filters.source.includes(',')) {
        const sources = filters.source.split(',').map(c => c.trim().toLowerCase());
        qb.andWhere('LOWER(source.name) IN (:...sources)', { sources });
      } else {
        qb.andWhere('LOWER(source.name) = :source', { source: filters.source.toLowerCase() });
      }
    }

    if (filters.isOnSale !== undefined) {
      if (filters.isOnSale === 'Yes') {
        qb.andWhere('product.oldPrice > product.price');
      } else if (filters.isOnSale === 'No') {
        qb.andWhere('(product.oldPrice <= product.price OR product.oldPrice IS NULL)');
      }
    }
    const offset = Number(filters.offset || 0);
    const limit = Number(filters.limit || PAGINATION_LIMIT);
    qb.skip(offset).take(limit);
    const [data, total] = await qb.getManyAndCount();
    const mappedData = data.map(product => ({
      ...product,
      brand: product.brand ? { id: product.brand.id, name: product.brand.name } : null,
      source: product.source ? { id: product.source.id, name: product.source.name } : null,
      categories: Array.isArray(product.categories)
        ? product.categories.map(c => ({ id: c.id, name: c.name }))
        : [],
      colors: Array.isArray(product.colors)
        ? product.colors.map(c => ({ id: c.id, name: c.name }))
        : [],
        price: Number(product.price),
        oldPrice: product.oldPrice ? Number(product.oldPrice) : undefined
    }));

    return {
      total,
      offset,
      limit,
      hasNextPage: offset + limit < total,
      data: mappedData,
    };
  }

  async findOne(id: number): Promise<Product> {
    return this.productsRepository.findOne({
      where: { id },
      relations: ['brand', 'source', 'categories', 'colors'],
    });
  }

  async findByUrl(url: string): Promise<Product | null> {
    return this.productsRepository.findOne({
      where: { url },
      relations: ['brand', 'source', 'categories', 'colors'],
    });
  }

  async create(createProductDto: Partial<Product>): Promise<Product> {
    const product = this.productsRepository.create(createProductDto);
    
    // smart search text
    // Generate search_text if not provided
    if (!product.search_text) {
      product.search_text = this.generateSearchText(product);
    }
    
    return this.productsRepository.save(product);
  }

  async update(id: number, updateProductDto: Partial<Product>): Promise<Product> {
    await this.productsRepository.update(id, updateProductDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.productsRepository.delete(id);
  }

  // smart search text
  private generateSearchText(product: Partial<Product>): string {
    const searchTextParts = [
      product.title,
      product.brand?.name,
      product.source?.name,
      product.categories?.map(c => c.name).join(' '),
      product.colors?.map(c => c.name).join(' ')
    ].filter(Boolean);
    
    return searchTextParts.join(' ');
  }

  async upsertProduct(productData: ProductInput): Promise<{ product: Product; created: boolean; updated: boolean }> {
    // Upsert brand
    const brand = await this.brandService.upsert(productData.brand);

    // Upsert source
    const source = await this.sourceService.upsert(productData.source);

    // Upsert categories
    const categories = await this.categoryService.upsertMany(productData.categories, productData.gender);

    // Upsert colors
    const colors = await this.colorService.upsertMany(productData.colors);

    // Check if product already exists
    let product = await this.findByUrl(productData.url);

    let originalMinimalPrice = undefined;
    let wasUpdated = false;
    
    if (product) {
      originalMinimalPrice = product.price ?? product.oldPrice;

      // Update existing product - only update fields that actually changed
      const updates: Partial<Product> = {};
      
      if (product.title !== productData.title) updates.title = productData.title;
      if (JSON.stringify(product.images) !== JSON.stringify(productData.images)) updates.images = productData.images;
      if (product.isSellingFast !== productData.isSellingFast) updates.isSellingFast = productData.isSellingFast;
      if (product.price !== productData.price) updates.price = productData.price;
      if (product.oldPrice !== productData.oldPrice) updates.oldPrice = productData.oldPrice;
      if (product.salePercent !== productData.salePercent) updates.salePercent = productData.salePercent;
      if (product.currency !== productData.currency) updates.currency = productData.currency;
      if (product.gender !== productData.gender) updates.gender = productData.gender;
      if (product.brand?.id !== brand.id) updates.brand = brand;
      if (product.source?.id !== source.id) updates.source = source;

      // smart search text
      // Always update search_text when any field changes
      const searchText = [
        productData.title,
        brand.name,
        source.name,
        categories.map(c => c.name).join(' '),
        colors.map(c => c.name).join(' ')
      ].filter(Boolean).join(' ');
      updates.search_text = searchText;

      // Only update if there are actual changes
      if (Object.keys(updates).length > 0) {
        await this.productsRepository.update(product.id, updates);
        wasUpdated = true;
      }

      // Handle many-to-many relationships separately to avoid unnecessary deletes
      // Only update categories if they actually changed
      const currentCategoryIds = product.categories?.map(c => c.id).sort() || [];
      const newCategoryIds = categories.map(c => c.id).sort();
      
      if (JSON.stringify(currentCategoryIds) !== JSON.stringify(newCategoryIds)) {
        product.categories = categories;
        await this.productsRepository.save(product);
        wasUpdated = true;
      }

      // Only update colors if they actually changed
      const currentColorIds = product.colors?.map(c => c.id).sort() || [];
      const newColorIds = colors.map(c => c.id).sort();
      
      if (JSON.stringify(currentColorIds) !== JSON.stringify(newColorIds)) {
        product.colors = colors;
        await this.productsRepository.save(product);
        wasUpdated = true;
      }

      // Reload the product to get updated data
      product = await this.findOne(product.id);
    } else {

      // smart search text
      const searchText = [
        productData.title,
        brand.name,
        source.name,
        categories.map(c => c.name).join(' '),
        colors.map(c => c.name).join(' ')
      ].filter(Boolean).join(' ');

      const data = {
        title: productData.title,
        url: productData.url,
        images: productData.images,
        isSellingFast: productData.isSellingFast,
        price: productData.price,
        oldPrice: productData.oldPrice,
        salePercent: productData.salePercent,
        currency: productData.currency,
        gender: productData.gender,
        search_text: searchText, // smart search text
        brand,
        source,
        categories,
        colors,
      };
      
      // Create new product
      product = this.productsRepository.create(data);

      product = await this.productsRepository.save(product);
    }

    // Add price history if changed
    let currMinimalPrice = productData.price ?? productData.oldPrice;
    if (originalMinimalPrice != currMinimalPrice) {
      await this.priceHistoryService.addIfChanged(product.id, currMinimalPrice);
    }

    return {
      product,
      created: !product.id || product.id === 0 ? false : !wasUpdated && product.id > 0,
      updated: wasUpdated
    };
  }

  async findByIds(ids: number[]): Promise<any[]> {
    if (!ids || ids.length === 0) return [];
    const products = await this.productsRepository.find({
      where: ids.map(id => ({ id })),
      relations: ['brand', 'source', 'categories', 'colors'],
    });
    return products.map(product => ({
      ...product,
      brand: product.brand ? { id: product.brand.id, name: product.brand.name } : null,
      source: product.source ? { id: product.source.id, name: product.source.name } : null,
      categories: Array.isArray(product.categories)
        ? product.categories.map(c => ({ id: c.id, name: c.name }))
        : [],
      colors: Array.isArray(product.colors)
        ? product.colors.map(c => ({ id: c.id, name: c.name }))
        : [],
    }));
  }

  async getAllUrlsBySource(sourceName: string): Promise<string[]> {
    const products = await this.productsRepository.createQueryBuilder('product')
      .leftJoin('product.source', 'source')
      .where('LOWER(source.name) = :source', { source: sourceName.toLowerCase() })
      .select(['product.url'])
      .getMany();
    return products.map(p => p.url);
  }

  async getAllUrlsAndIdsBySource(sourceName: string): Promise<{id: number, url: string}[]> {
    const products = await this.productsRepository.createQueryBuilder('product')
      .leftJoin('product.source', 'source')
      .where('LOWER(source.name) = :source', { source: sourceName.toLowerCase() })
      .select(['product.id', 'product.url'])
      .getMany();
    return products.map(p => ({ id: p.id, url: p.url }));
  }

  async bulkUpsertProducts(products: ProductInput[]): Promise<ScrapingResult> {
    console.log(`[bulkUpsertProducts] Received ${products.length} products`);
    // Deduplicate input products by url, keep first occurrence only
    const seenUrls = new Set<string>();
    const uniqueProducts = products.filter(p => {
      if (seenUrls.has(p.url)) return false;
      seenUrls.add(p.url);
      return true;
    });

    const duplicatesCount = products.length - uniqueProducts.length;
    if (duplicatesCount > 0) {
      console.warn(`[bulkUpsertProducts] Ignored ${duplicatesCount} duplicate products by URL.`);
    }
    console.log(`[bulkUpsertProducts] Unique products: ${uniqueProducts.length}`);

    const uniqueBrands = [...new Set(uniqueProducts.map(p => p.brand))];
    const uniqueSources = [...new Set(uniqueProducts.map(p => p.source))];
    const uniqueColors = [...new Set(uniqueProducts.flatMap(p => p.colors))];
    const uniqueCategoryGenderPairs = [
      ...new Set(uniqueProducts.flatMap(p => p.categories.map(cat => `${p.gender}|${cat}`)))
    ];
    console.log(`[bulkUpsertProducts] Brands: ${uniqueBrands.length}, Sources: ${uniqueSources.length}, Colors: ${uniqueColors.length}, Category-Gender pairs: ${uniqueCategoryGenderPairs.length}`);
  
    const [brands, sources, colors, categories] = await Promise.all([
      this.brandService.upsertMany(uniqueBrands), // returns name → Brand map
      this.sourceService.upsertMany(uniqueSources),
      this.colorService.upsertMany(uniqueColors),
      this.categoryService.upsertManyFromPairs(uniqueCategoryGenderPairs)
    ]);
  
    const brandMap = new Map(brands.map(b => [b.name, b]));
    const sourceMap = new Map(sources.map(s => [s.name, s]));
    const colorMap = new Map(colors.map(c => [c.name, c]));
    const categoryMap = new Map(categories.map(c => [`${c.gender}|${c.name}`, c]));
  
    const urls = uniqueProducts.map(p => p.url);
    const existingProducts = await this.productsRepository.find({
      where: { url: In(urls) },
      relations: ['categories', 'colors', 'brand', 'source']
    });
    const existingMap = new Map(existingProducts.map(p => [p.url, p]));
    console.log(`[bulkUpsertProducts] Found ${existingProducts.length} existing products in DB`);
  
    const productsToSave: Product[] = [];
    const priceHistoryMap: { productId: number; price: number | null }[] = [];
  
    let newCount = 0;
    let updatedCount = 0;

    // Check for duplicate URLs in input products
    const urlCounts = uniqueProducts.reduce((acc, p) => {
      acc[p.url] = (acc[p.url] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const duplicateUrls = Object.entries(urlCounts)
      .filter(([url, count]) => count > 1)
      .map(([url]) => url);
    
    if (duplicateUrls.length > 0) {
      console.warn(`[bulkUpsertProducts] Warning: Found duplicate URLs in input products:`, duplicateUrls);
    }
  
    for (let i = 0; i < uniqueProducts.length; i++) {
      const input = uniqueProducts[i];
      const existing = existingMap.get(input.url);

      const brand = brandMap.get(input.brand);
      const source = sourceMap.get(input.source);
      const colorEntities = input.colors.map(c => colorMap.get(c));
      const categoryEntities = input.categories.map(cat => categoryMap.get(`${input.gender}|${cat}`));

      if (existing) {
        const shouldUpdate = 
          existing.title !== input.title ||
          JSON.stringify(existing.images) !== JSON.stringify(input.images) ||
          existing.isSellingFast !== input.isSellingFast ||
          existing.price !== input.price ||
          existing.oldPrice !== input.oldPrice ||
          existing.salePercent !== input.salePercent ||
          existing.currency !== input.currency ||
          existing.gender !== input.gender ||
          existing.brand?.id !== brand?.id ||
          existing.source?.id !== source?.id;

        if (shouldUpdate) {
          // smart search text
          // Generate search_text for the updated product
          const searchText = [
            input.title,
            brand?.name,
            source?.name,
            input.categories.map(cat => cat).join(' '),
            input.colors.map(col => col).join(' ')
          ].filter(Boolean).join(' ');

          Object.assign(existing, {
            title: input.title,
            images: input.images,
            isSellingFast: input.isSellingFast,
            price: input.price,
            oldPrice: input.oldPrice,
            salePercent: input.salePercent,
            currency: input.currency,
            gender: input.gender,
            search_text: searchText,
            brand,
            source
          });
          updatedCount++;
          productsToSave.push(existing);
        }

        existing.colors = colorEntities;
        existing.categories = categoryEntities;

        const oldMin = existing.price ?? existing.oldPrice;
        const newMin = input.price ?? input.oldPrice;
        if (oldMin !== newMin) {
          priceHistoryMap.push({ productId: existing.id, price: newMin });
        }
      } else {
        // smart search text
        // Generate search_text for the new product
        const searchText = [
          input.title,
          brand?.name,
          source?.name,
          input.categories.map(cat => cat).join(' '),
          input.colors.map(col => col).join(' ')
        ].filter(Boolean).join(' ');

        const newProduct = this.productsRepository.create({
          ...input,
          search_text: searchText, // smart search text
          brand,
          source,
          colors: colorEntities,
          categories: categoryEntities,
        });
        newCount++;
        productsToSave.push(newProduct);
      }
      // Periodic progress log
      if ((i + 1) % 1000 === 0) {
        console.log(`[bulkUpsertProducts] Progress: ${i + 1}/${uniqueProducts.length} processed, New: ${newCount}, Updated: ${updatedCount}`);
      }
    }
  
    // Save in chunks (optional: 100 at a time)
    await this.productsRepository.save(productsToSave, { chunk: 100 });
  
    // Save price history
    await this.priceHistoryService.addMany(priceHistoryMap);
  
    // After all upserts
    console.log(`[bulkUpsertProducts] New: ${newCount}, Updated: ${updatedCount}, Total processed: ${uniqueProducts.length}`);
    return { created: newCount, updated: updatedCount, total: uniqueProducts.length };
  }  
} 