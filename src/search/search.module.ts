import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { BrandModule } from '../brand/brand.module';
import { CategoryModule } from '../category/category.module';
import { ColorModule } from '../color/color.module';

@Module({
  imports: [BrandModule, CategoryModule, ColorModule],
  providers: [SearchService],
  controllers: [SearchController],
  exports: [SearchService],
})
export class SearchModule {} 