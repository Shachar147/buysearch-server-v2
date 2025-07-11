import { Controller, Post, Delete, Get, Body, Param, Req, UseGuards } from '@nestjs/common';
import { FavouritesService } from './favourites.service';
import { UserGuard } from '../auth/user.guard';

@UseGuards(UserGuard)
@Controller('favourites')
export class FavouritesController {
  constructor(private readonly favouritesService: FavouritesService) {}

  @Post()
  async addToFavourite(@Req() req, @Body() body: { productId: number }) {
    const userId = req.user.sub;
    return this.favouritesService.addToFavourite(userId, body.productId);
  }

  @Delete(':productId')
    async removeFromFavourite(@Req() req, @Param('productId') productId: number) {
    const userId = req.user.sub;
    return this.favouritesService.removeFromFavourite(userId, Number(productId));
  }

  @Get()
  async getFavourites(@Req() req) {
    const userId = req.user.sub;
    return this.favouritesService.getFavourites(userId);
  }

  @Get('is-favourite/:productId')
  async isFavourite(@Req() req, @Param('productId') productId: number) {
    const userId = req.user.sub;
    return { isFavourite: await this.favouritesService.isFavourite(userId, Number(productId)) };
  }
} 