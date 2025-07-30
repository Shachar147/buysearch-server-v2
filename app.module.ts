import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_INTERCEPTOR } from '@nestjs/core';
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
import { ProxyModule } from './src/proxy/proxy.module';
import { NotificationModule } from './src/notification/notification.module';
import { SecurityModule } from './src/modules/security.module';
import { SecurityMiddleware } from './src/middleware/security.middleware';
import { ValidationMiddleware } from './src/middleware/validation.middleware';
import { LoggingInterceptor } from './src/interceptors/logging.interceptor';

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
    ProxyModule,
    NotificationModule,
    SecurityModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    ...(process.env.ENABLE_CRON === 'true' ? [ScraperCronService] : []),
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SecurityMiddleware, ValidationMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
