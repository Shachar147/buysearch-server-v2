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

  async addIfChanged(productId: number, newPrice: number, oldPrice?: number) {
    const last = await this.repo.findOne({ where: { productId }, order: { date: 'DESC' } });
    
    // If no history exists and we have an old price, add it first
    if (!last && oldPrice !== undefined && oldPrice !== newPrice) {
      await this.repo.save({ productId, price: oldPrice });
    }
    
    // Add the new price if it's different from the last recorded price
    if (!last || last.price !== newPrice) {
      await this.repo.save({ productId, price: newPrice });
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

  async addMany(entries: { productId: number; price: number | null; oldPrice?: number | null }[]): Promise<void> {
    if (!entries.length) return;
  
    const now = new Date();
    const records = [];
  
    for (const entry of entries) {
      const productId = entry.productId;
      const newPrice = entry.price ?? 0;
      const oldPrice = entry.oldPrice;
      
      // Check if this product has any existing price history
      const last = await this.repo.findOne({ where: { productId }, order: { date: 'DESC' } });
      
      // If no history exists and we have an old price, add it first
      if (!last && oldPrice !== undefined && oldPrice !== null && oldPrice !== newPrice) {
        records.push({
          productId,
          price: oldPrice,
          date: new Date(now.getTime() - 1000), // 1 second before the new price
        });
      }
      
      // Add the new price
      records.push({
        productId,
        price: newPrice,
        date: now,
      });
    }
  
    if (records.length > 0) {
      await this.repo.insert(records);
    }
  }
  
} 