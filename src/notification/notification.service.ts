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

  async createPriceChangeNotification(productId: number, oldPrice: number, newPrice: number): Promise<void> {
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

    const priceChange = newPrice - oldPrice;
    const priceChangePercent = ((priceChange / oldPrice) * 100).toFixed(1);
    const changeType = priceChange > 0 ? 'increased' : 'decreased';
    const changeAmount = Math.abs(priceChange);

    const message = `${product.title} price ${changeType} by ${changeAmount} ILS (${priceChangePercent}%)`;

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