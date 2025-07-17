import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FavouriteProduct } from './favourite-product.entity';
import { FavouritesService } from './favourites.service';
import { FavouritesController } from './favourites.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([FavouriteProduct]), AuthModule],
  providers: [FavouritesService],
  controllers: [FavouritesController],
  exports: [FavouritesService],
})
export class FavouritesModule {} 