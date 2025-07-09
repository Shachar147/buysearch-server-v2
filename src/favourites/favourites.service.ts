import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FavouriteProduct } from './favourite-product.entity';

@Injectable()
export class FavouritesService {
  constructor(
    @InjectRepository(FavouriteProduct)
    private favouritesRepository: Repository<FavouriteProduct>,
  ) {}

  async addToFavourite(userId: number, productId: number) {
    let fav = await this.favouritesRepository.findOne({ where: { userId, productId } });
    if (!fav) {
      fav = this.favouritesRepository.create({ userId, productId });
      await this.favouritesRepository.save(fav);
    }
    return fav;
  }

  async removeFromFavourite(userId: number, productId: number) {
    await this.favouritesRepository.delete({ userId, productId });
    return { success: true };
  }

  async getFavourites(userId: number) {
    return this.favouritesRepository.find({ where: { userId } });
  }

  async isFavourite(userId: number, productId: number) {
    const fav = await this.favouritesRepository.findOne({ where: { userId, productId } });
    return !!fav;
  }
} 