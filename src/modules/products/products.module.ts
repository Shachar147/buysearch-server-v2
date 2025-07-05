import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { Product } from '../../entities/product.entity';
import { BrandsModule } from '../brands/brands.module';
import { CategoriesModule } from '../categories/categories.module';
import { ColorsModule } from '../colors/colors.module';
import { SourcesModule } from '../sources/sources.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product]),
    BrandsModule,
    CategoriesModule,
    ColorsModule,
    SourcesModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {} 