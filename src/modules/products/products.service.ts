import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../../entities/product.entity';
import { BrandsService } from '../brands/brands.service';
import { CategoriesService } from '../categories/categories.service';
import { ColorsService } from '../colors/colors.service';
import { SourcesService } from '../sources/sources.service';

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

  async findAll(): Promise<Product[]> {
    return this.productsRepository.find({
      relations: ['brand', 'source', 'categories', 'colors'],
    });
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