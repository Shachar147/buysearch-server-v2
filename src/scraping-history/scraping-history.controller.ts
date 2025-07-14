import { Controller, Get, Param, Query } from '@nestjs/common';
import { ScrapingHistoryService } from './scraping-history.service';
import { ScrapingHistory } from './scraping-history.entity';

@Controller('scraping-history')
export class ScrapingHistoryController {
  constructor(private readonly scrapingHistoryService: ScrapingHistoryService) {}

  @Get()
  async findAll(@Query('limit') limit?: string): Promise<ScrapingHistory[]> {
    const limitNum = limit ? parseInt(limit, 10) : 50;
    return this.scrapingHistoryService.findAll(limitNum);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ScrapingHistory> {
    return this.scrapingHistoryService.findById(parseInt(id, 10));
  }

  @Get('scraper/:scraper')
  async findByScraper(
    @Param('scraper') scraper: string,
    @Query('limit') limit?: string
  ): Promise<ScrapingHistory[]> {
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.scrapingHistoryService.findByScraper(scraper, limitNum);
  }

  @Get('scraper/:scraper/latest')
  async getLatestByScraper(@Param('scraper') scraper: string): Promise<ScrapingHistory | null> {
    return this.scrapingHistoryService.getLatestByScraper(scraper);
  }

  @Get('scraper/:scraper/progress')
  async getScraperProgress(@Param('scraper') scraper: string): Promise<{
    latest: ScrapingHistory | null;
    progress: string;
    isRunning: boolean;
  }> {
    const latest = await this.scrapingHistoryService.getLatestByScraper(scraper);
    
    if (!latest) {
      return {
        latest: null,
        progress: 'No scraping sessions found',
        isRunning: false
      };
    }

    const isRunning = latest.status === 'in_progress';
    let progress = 'Completed';
    
    if (isRunning) {
      // Display progress as percentage
      progress = `${latest.progress}% complete`;
    }

    return {
      latest,
      progress,
      isRunning
    };
  }
} 