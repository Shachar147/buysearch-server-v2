import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { databaseConfig } from './config/database.config';
import { BrandModule } from './brand/brand.module';
import { CategoryModule } from './category/category.module';
import { ColorModule } from './color/color.module';
import { SourceModule } from './source/source.module';
import { ProductModule } from './product/product.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(databaseConfig),
    BrandModule,
    CategoryModule,
    ColorModule,
    SourceModule,
    ProductModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
