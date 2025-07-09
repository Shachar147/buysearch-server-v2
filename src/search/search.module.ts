import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { BrandModule } from '../brand/brand.module';
import { CategoryModule } from '../category/category.module';
import { ColorModule } from '../color/color.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [BrandModule, CategoryModule, ColorModule, AuthModule],
  providers: [SearchService],
  controllers: [SearchController],
  exports: [SearchService],
})
export class SearchModule {} 