import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PriceHistory } from './price-history.entity';
import { PriceHistoryRepository } from './price-history.repository';
import { In } from 'typeorm';

@Injectable()
export class PriceHistoryService {
  constructor(
    @InjectRepository(PriceHistory)
    private repo: PriceHistoryRepository,
  ) {}

  async addIfChanged(productId: number, price: number) {
    const last = await this.repo.findOne({ where: { productId }, order: { date: 'DESC' } });
    if (!last || last.price !== price) {
      await this.repo.save({ productId, price });
    }
  }

  async getRecent(productId: number, limit = 5) {
    return this.repo.find({
      where: { productId },
      order: { date: 'DESC' },
      take: limit,
    });
  }

  async getProductIdsWithPriceChange(): Promise<number[]> {
    const result = await this.repo.createQueryBuilder('ph')
      .select('ph.productId', 'productId')
      .addSelect('COUNT(*)', 'amount')
      .groupBy('ph.productId')
      .having('COUNT(*) > 1')
      .getRawMany();
    return result.map((row: any) => Number(row.productId));
  }
} 