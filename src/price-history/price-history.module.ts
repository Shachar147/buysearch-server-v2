import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PriceHistory } from './price-history.entity';
import { PriceHistoryRepository } from './price-history.repository';
import { PriceHistoryService } from './price-history.service';
import { AuthModule } from '../auth/auth.module';
import { PriceHistoryController } from './price-history.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PriceHistory, PriceHistoryRepository]), AuthModule],
  providers: [PriceHistoryService],
  exports: [PriceHistoryService],
  controllers: [PriceHistoryController], // <-- Add this line
})
export class PriceHistoryModule {} 