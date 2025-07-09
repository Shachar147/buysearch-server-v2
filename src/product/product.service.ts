import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { BrandService } from '../brand/brand.service';
import { CategoryService } from '../category/category.service';
import { ColorService } from '../color/color.service';
import { SourceService } from '../source/source.service';
import { PAGINATION_LIMIT } from '../consts';
import { Brackets } from 'typeorm';
import { FavouritesService } from '../favourites/favourites.service';

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
}

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
  ) {}

  async findAll(filters: ProductFilters = {}, userId?: number): Promise<any> {
    const qb = this.productsRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.brand', 'brand')
      .leftJoinAndSelect('product.source', 'source')
      .leftJoinAndSelect('product.categories', 'category')
      .leftJoinAndSelect('product.colors', 'color')
      .distinct(true);

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
    if (filters.sort === 'Price: Low to High') {
      qb.orderBy('product.price', 'ASC');
    } else if (filters.sort === 'Price: High to Low') {
      qb.orderBy('product.price', 'DESC');
    } else {
      qb.orderBy('product.id', 'DESC'); // Default sort
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
    const offset = filters.offset || 0;
    const limit = filters.limit || PAGINATION_LIMIT;
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
    return this.productsRepository.save(product);
  }

  async update(id: number, updateProductDto: Partial<Product>): Promise<Product> {
    await this.productsRepository.update(id, updateProductDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.productsRepository.delete(id);
  }

  async upsertProduct(productData: {
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
  }): Promise<Product> {
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

    if (product) {
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

      // Only update if there are actual changes
      if (Object.keys(updates).length > 0) {
        await this.productsRepository.update(product.id, updates);
      }

      // Handle many-to-many relationships separately to avoid unnecessary deletes
      // Only update categories if they actually changed
      const currentCategoryIds = product.categories?.map(c => c.id).sort() || [];
      const newCategoryIds = categories.map(c => c.id).sort();
      
      if (JSON.stringify(currentCategoryIds) !== JSON.stringify(newCategoryIds)) {
        product.categories = categories;
        await this.productsRepository.save(product);
      }

      // Only update colors if they actually changed
      const currentColorIds = product.colors?.map(c => c.id).sort() || [];
      const newColorIds = colors.map(c => c.id).sort();
      
      if (JSON.stringify(currentColorIds) !== JSON.stringify(newColorIds)) {
        product.colors = colors;
        await this.productsRepository.save(product);
      }

      // Reload the product to get updated data
      product = await this.findOne(product.id);
    } else {
      // Create new product
      product = this.productsRepository.create({
        title: productData.title,
        url: productData.url,
        images: productData.images,
        isSellingFast: productData.isSellingFast,
        price: productData.price,
        oldPrice: productData.oldPrice,
        salePercent: productData.salePercent,
        currency: productData.currency,
        gender: productData.gender,
        brand,
        source,
        categories,
        colors,
      });

      product = await this.productsRepository.save(product);
    }

    return product;
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
} 