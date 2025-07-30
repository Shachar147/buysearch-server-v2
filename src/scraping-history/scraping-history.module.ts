import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScrapingHistory } from './scraping-history.entity';
import { ScrapingHistoryService } from './scraping-history.service';
import { ScrapingHistoryController } from './scraping-history.controller';
import { SourceModule } from '../source/source.module';

@Module({
  imports: [TypeOrmModule.forFeature([ScrapingHistory]), SourceModule],
  providers: [ScrapingHistoryService],
  controllers: [ScrapingHistoryController],
  exports: [ScrapingHistoryService],
})
export class ScrapingHistoryModule {}
