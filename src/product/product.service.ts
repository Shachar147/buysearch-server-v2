import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { BrandService } from '../brand/brand.service';
import { CategoryService } from '../category/category.service';
import { ColorService } from '../color/color.service';
import { SourceService } from '../source/source.service';
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
  ) {}

  async findAll(filters: ProductFilters = {}): Promise<any> {
    const qb = this.productsRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.brand', 'brand')
      .leftJoinAndSelect('product.source', 'source')
      .leftJoinAndSelect('product.categories', 'category')
      .leftJoinAndSelect('product.colors', 'color');

    if (filters.brand) {
      qb.andWhere('brand.name = :brand', { brand: filters.brand });
    }
    if (filters.category) {
      qb.andWhere('category.name = :category', { category: filters.category });
    }
    if (filters.color) {
      qb.andWhere('color.name = :color', { color: filters.color });
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
    const categories = await this.categoryService.upsertMany(productData.categories);

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
} 