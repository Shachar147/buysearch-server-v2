import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../../entities/product.entity';
import { BrandsService } from '../brands/brands.service';
import { CategoriesService } from '../categories/categories.service';
import { ColorsService } from '../colors/colors.service';
import { SourcesService } from '../sources/sources.service';

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
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    private brandsService: BrandsService,
    private categoriesService: CategoriesService,
    private colorsService: ColorsService,
    private sourcesService: SourcesService,
  ) {}

  async findAll(filters: ProductFilters = {}) {
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
    const limit = filters.limit || 20;
    qb.skip(offset).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return {
      data,
      total,
      offset,
      limit,
      hasNextPage: offset + data.length < total,
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
    const brand = await this.brandsService.upsert(productData.brand);

    // Upsert source
    const source = await this.sourcesService.upsert(productData.source);

    // Upsert categories
    const categories = await this.categoriesService.upsertMany(productData.categories);

    // Upsert colors
    const colors = await this.colorsService.upsertMany(productData.colors);

    // Check if product already exists
    let product = await this.findByUrl(productData.url);

    if (product) {
      // Update existing product
      product.title = productData.title;
      product.images = productData.images;
      product.isSellingFast = productData.isSellingFast;
      product.price = productData.price;
      product.oldPrice = productData.oldPrice;
      product.salePercent = productData.salePercent;
      product.currency = productData.currency;
      product.gender = productData.gender;
      product.brand = brand;
      product.source = source;
      product.categories = categories;
      product.colors = colors;
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
    }

    return this.productsRepository.save(product);
  }
} 