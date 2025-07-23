import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { databaseConfig } from './src/config/database.config';
import { BrandModule } from './src/brand/brand.module';
import { ColorModule } from './src/color/color.module';
import { SourceModule } from './src/source/source.module';
import { ProductModule } from './src/product/product.module';
import { ScheduleModule } from '@nestjs/schedule';
import { CategoryModule } from './src/category/category.module';
import { ScraperCronService } from './src/scrapers/base/scraper-cron.service';
import { AuthModule } from './src/auth/auth.module';
import { UserModule } from './src/user/user.module';
import { FavouritesModule } from './src/favourites/favourites.module';
import { ScrapingHistoryModule } from './src/scraping-history/scraping-history.module';
import { SavedFilterModule } from './src/saved-filter/saved-filter.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(databaseConfig),
    AuthModule,
    UserModule,
    BrandModule,
    CategoryModule,
    ColorModule,
    SourceModule,
    ProductModule,
    ScheduleModule.forRoot(),
    FavouritesModule,
    ScrapingHistoryModule,
    SavedFilterModule,
    UserModule
  ],
  controllers: [AppController],
  providers: [AppService, ScraperCronService],
})
export class AppModule {}
