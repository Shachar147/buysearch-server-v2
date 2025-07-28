import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';
import { User } from '../user/user.entity';
import { Product } from '../product/product.entity';
import { FavouriteProduct } from '../favourites/favourite-product.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(FavouriteProduct)
    private favouriteProductRepository: Repository<FavouriteProduct>,
  ) {}

  private getCurrencySymbol(currency: string): string {
    switch (currency.toUpperCase()) {
      case 'USD':
        return '$';
      case 'ILS':
        return '₪';
      case 'EUR':
        return '€';
      case 'GBP':
        return '£';
      default:
        return currency; // Return the currency code if no symbol is found
    }
  }

  private formatPrice(price: number | string | null, currency: string): string {
    if (price === null || price === undefined) {
      return `${this.getCurrencySymbol(currency)}0.00`;
    }
    
    // Convert to number and handle any type issues
    const numericPrice = typeof price === 'string' ? parseFloat(price) : Number(price);
    
    if (isNaN(numericPrice)) {
      return `${this.getCurrencySymbol(currency)}0.00`;
    }
    
    const symbol = this.getCurrencySymbol(currency);
    return `${symbol}${numericPrice.toFixed(2)}`;
  }

  async createPriceChangeNotification(productId: number, oldPrice: number, newPrice: number): Promise<void> {
    // Convert prices to numbers to ensure proper calculations
    const oldPriceNum = typeof oldPrice === 'string' ? parseFloat(oldPrice) : Number(oldPrice);
    const newPriceNum = typeof newPrice === 'string' ? parseFloat(newPrice) : Number(newPrice);
    
    const priceChange = newPriceNum - oldPriceNum;
    const priceChangePercent = ((priceChange / oldPriceNum) * 100).toFixed(1);
    const changeType = priceChange > 0 ? 'increased' : 'dropped';
    const changeAmount = Math.abs(priceChange);
    // if (!changeAmount) {
    //   return;
    // }

    // ------------------------------------------------------------

    // Get all users who have this product in their favourites
    const favouriteUsers = await this.favouriteProductRepository
      .createQueryBuilder('favourite')
      .where('favourite.productId = :productId', { productId })
      .getMany();

    if (favouriteUsers.length === 0) {
      return;
    }

    const userIds = favouriteUsers.map(f => f.userId);
    const usersWithFavourite = await this.userRepository
      .createQueryBuilder('user')
      .where('user.id IN (:...userIds)', { userIds })
      .getMany();

    const product = await this.productRepository.findOne({ where: { id: productId } });
    if (!product) {
      return;
    }

    const currency = product.currency;
    const oldPriceFormatted = this.formatPrice(oldPrice, currency);
    const newPriceFormatted = this.formatPrice(newPrice, currency);
    const changeAmountFormatted = this.formatPrice(changeAmount, currency);
    
    const message = `${product.title}\nPrice ${changeType} by ${Math.abs(Number(priceChangePercent))}%\nFrom ${oldPriceFormatted} to ${newPriceFormatted}`;

    // Create notifications for all users who have this product favourited
    const notifications = usersWithFavourite.map(user => {
      const notification = new Notification();
      notification.message = message;
      notification.userId = user.id;
      notification.productId = productId;
      return notification;
    });

    // Use insert with ON CONFLICT DO NOTHING to avoid duplicates
    await this.notificationRepository
      .createQueryBuilder()
      .insert()
      .into(Notification)
      .values(notifications)
      .orIgnore()
      .execute();
  }

  async getUserNotifications(userId: number, page: number = 1, limit: number = 10): Promise<{
    notifications: Notification[];
    total: number;
    hasMore: boolean;
  }> {
    const offset = (page - 1) * limit;

    const [notifications, total] = await this.notificationRepository
      .createQueryBuilder('notification')
      .leftJoinAndSelect('notification.product', 'product')
      .where('notification.userId = :userId', { userId })
      .orderBy('notification.createdAt', 'DESC')
      .skip(offset)
      .take(limit)
      .getManyAndCount();

    return {
      notifications,
      total,
      hasMore: offset + limit < total,
    };
  }

  async markAsSeen(notificationId: number, userId: number): Promise<void> {
    await this.notificationRepository
      .createQueryBuilder()
      .update(Notification)
      .set({ seenAt: new Date() })
      .where('id = :notificationId AND userId = :userId', { notificationId, userId })
      .execute();
  }

  async getUnseenCount(userId: number): Promise<number> {
    return await this.notificationRepository
      .createQueryBuilder('notification')
      .where('notification.userId = :userId', { userId })
      .andWhere('notification.seenAt IS NULL')
      .getCount();
  }

  async markAllAsSeen(userId: number): Promise<void> {
    await this.notificationRepository
      .createQueryBuilder()
      .update(Notification)
      .set({ seenAt: new Date() })
      .where('userId = :userId AND seenAt IS NULL', { userId })
      .execute();
  }
} 