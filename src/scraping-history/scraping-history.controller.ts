import { Controller, Get, Param, Query } from '@nestjs/common';
import { ScrapingHistoryService } from './scraping-history.service';
import { ScrapingHistory } from './scraping-history.entity';

@Controller('scraping-history')
export class ScrapingHistoryController {
  constructor(private readonly scrapingHistoryService: ScrapingHistoryService) {}

  @Get('summary')
  async getScraperSummaries() {
    const scrapers = await this.scrapingHistoryService.getAllScrapers();

    const summaries = await Promise.all(scrapers.map(async (scraper) => {
      // Cancel old in-progress scans
      await this.scrapingHistoryService.cancelOldInProgressSessions(scraper);

      // Get all history and in-progress sessions in parallel
      const [history, inProgress] = await Promise.all([
        this.scrapingHistoryService.getAllHistoryForScraper(scraper),
        this.scrapingHistoryService.getInProgressSessions(scraper),
      ]);

      const currentScan = inProgress.length > 0 ? inProgress[0] : null;

      // Calculate rate (items per minute)
      let ratePerMinute = null;
      if (currentScan) {
        const now = new Date();
        const start = new Date(currentScan.startTime);
        const elapsedMinutes = (now.getTime() - start.getTime()) / 60000;
        const itemsScanned = (currentScan.createdItems || 0) + (currentScan.updatedItems || 0);
        ratePerMinute = elapsedMinutes > 0 ? (itemsScanned / elapsedMinutes) : null;
      }

      return {
        scraper,
        history,
        currentScan,
        ratePerMinute,
      };
    }));

    return summaries;
  }


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