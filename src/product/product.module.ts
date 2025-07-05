import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { Product } from './product.entity';
import { BrandModule } from '../brand/brand.module';
import { CategoryModule } from '../category/category.module';
import { ColorModule } from '../color/color.module';
import { SourceModule } from '../source/source.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product]),
    BrandModule,
    CategoryModule,
    ColorModule,
    SourceModule,
  ],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {} 