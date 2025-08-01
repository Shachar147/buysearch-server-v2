import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { Product } from './product.entity';
import { BrandModule } from '../brand/brand.module';
import { CategoryModule } from '../category/category.module';
import { ColorModule } from '../color/color.module';
import { SourceModule } from '../source/source.module';
import { SearchModule } from '../search/search.module';
import { AuthModule } from '../auth/auth.module';
import { FavouritesModule } from '../favourites/favourites.module';
import { PriceHistoryModule } from '../price-history/price-history.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product]),
    BrandModule,
    CategoryModule,
    ColorModule,
    SourceModule,
    SearchModule,
    AuthModule,
    FavouritesModule,
    PriceHistoryModule,
    NotificationModule,
  ],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {} 