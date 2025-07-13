import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { databaseConfig } from './config/database.config';
import { BrandModule } from './brand/brand.module';
import { ColorModule } from './color/color.module';
import { SourceModule } from './source/source.module';
import { ProductModule } from './product/product.module';
import { ScheduleModule } from '@nestjs/schedule';
import { CategoryModule } from './category/category.module';
import { ScraperCronService } from './scrapers/scraper-cron.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { FavouritesModule } from './favourites/favourites.module';
import { ScrapingHistoryModule } from './scraping-history/scraping-history.module';

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
  ],
  controllers: [AppController],
  providers: [AppService, ScraperCronService],
})
export class AppModule {}
