import { Controller, Get, Param, Query } from '@nestjs/common';
import { PriceHistoryService } from './price-history.service';

@Controller('price-history')
export class PriceHistoryController {
  constructor(private readonly priceHistoryService: PriceHistoryService) {}

  @Get('bulk')
  async getBulk(@Query('ids') ids: string, @Query('limit') limit?: string) {
    const idArr = ids.split(',').map(Number);
    const result: Record<number, any[]> = {};
    for (const id of idArr) {
      result[id] = await this.priceHistoryService.getRecent(id, limit ? Number(limit) : 5);
    }
    
    return result;
  }

  @Get(':productId')
  async getRecent(@Param('productId') productId: string, @Query('limit') limit?: string) {
    return this.priceHistoryService.getRecent(Number(productId), limit ? Number(limit) : 5);
  }
} 