import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScrapingHistory, ScrapingType, ScrapingStatus } from './scraping-history.entity';

export { ScrapingType, ScrapingStatus } from './scraping-history.entity';

@Injectable()
export class ScrapingHistoryService {
  constructor(
    @InjectRepository(ScrapingHistory)
    private scrapingHistoryRepository: Repository<ScrapingHistory>,
  ) {}

  async createScrapingSession(
    scraper: string,
    type: ScrapingType = ScrapingType.MANUAL
  ): Promise<ScrapingHistory> {
    const session = this.scrapingHistoryRepository.create({
      scraper,
      type,
      startTime: new Date(),
      status: ScrapingStatus.IN_PROGRESS,
      createdItems: 0,
      updatedItems: 0,
    });
    
    return this.scrapingHistoryRepository.save(session);
  }

  async updateScrapingProgress(
    id: number,
    createdItems: number,
    updatedItems: number,
    progress?: number
  ): Promise<ScrapingHistory> {
    const updateData: any = {
      createdItems,
      updatedItems,
    };
    
    if (progress !== undefined) {
      updateData.progress = progress;
    }
    
    await this.scrapingHistoryRepository.update(id, updateData);
    
    return this.scrapingHistoryRepository.findOne({ where: { id } });
  }

  async finishScrapingSession(
    id: number,
    createdItems: number,
    updatedItems: number,
    totalItems?: number,
    missingItems?: number
  ): Promise<ScrapingHistory> {
    const session = await this.scrapingHistoryRepository.findOne({ where: { id } });
    if (!session) {
      throw new Error(`Scraping session with id ${id} not found`);
    }

    const endTime = new Date();
    const totalSeconds = Math.round((endTime.getTime() - session.startTime.getTime()) / 1000);

    await this.scrapingHistoryRepository.update(id, {
      status: ScrapingStatus.FINISHED,
      endTime,
      totalSeconds,
      createdItems,
      updatedItems,
      totalItems: totalItems ?? (createdItems + updatedItems),
      missingItems: missingItems ?? 0,
    });

    return this.scrapingHistoryRepository.findOne({ where: { id } });
  }

  async failScrapingSession(
    id: number,
    createdItems: number,
    updatedItems: number
  ): Promise<ScrapingHistory> {
    const session = await this.scrapingHistoryRepository.findOne({ where: { id } });
    if (!session) {
      throw new Error(`Scraping session with id ${id} not found`);
    }
    const endTime = new Date();
    const totalSeconds = Math.round((endTime.getTime() - session.startTime.getTime()) / 1000);
    await this.scrapingHistoryRepository.update(id, {
      status: ScrapingStatus.FAILED,
      endTime,
      totalSeconds,
      createdItems,
      updatedItems,
    });
    return this.scrapingHistoryRepository.findOne({ where: { id } });
  }

  async findAll(limit: number = 50): Promise<ScrapingHistory[]> {
    return this.scrapingHistoryRepository.find({
      order: { startTime: 'DESC' },
      take: limit,
    });
  }

  async findById(id: number): Promise<ScrapingHistory> {
    return this.scrapingHistoryRepository.findOne({ where: { id } });
  }

  async findByScraper(scraper: string, limit: number = 20): Promise<ScrapingHistory[]> {
    return this.scrapingHistoryRepository.find({
      where: { scraper },
      order: { startTime: 'DESC' },
      take: limit,
    });
  }

  async getLatestByScraper(scraper: string): Promise<ScrapingHistory | null> {
    return this.scrapingHistoryRepository.findOne({
      where: { scraper },
      order: { startTime: 'DESC' },
    });
  }

  // Get all unique scrapers
  async getAllScrapers(): Promise<string[]> {
    const result = await this.scrapingHistoryRepository.createQueryBuilder('sh')
      .select('DISTINCT sh.scraper', 'scraper')
      .getRawMany();
    return result.map((row: { scraper: string }) => row.scraper);
  }

  // Get all histories for a scraper (no limit, newest first)
  async getAllHistoryForScraper(scraper: string): Promise<ScrapingHistory[]> {
    const results = await this.scrapingHistoryRepository.find({
      where: { scraper },
      order: { startTime: 'DESC' },
    });

    // @ts-ignore
    return results.map((r) => {

       // Calculate rate (items per minute)
       const now = r.endTime ?? new Date();
       const start = new Date(r.startTime);
       const elapsedMinutes = (now.getTime() - start.getTime()) / 60000;
       const itemsScanned = (r.createdItems || 0) + (r.updatedItems || 0);
       const ratePerMinute = elapsedMinutes > 0 ? (itemsScanned / elapsedMinutes) : null;

       return {
        ...r,
        ratePerMinute
       };
    });
  }

  // Get all in-progress sessions for a scraper (newest first)
  async getInProgressSessions(scraper: string): Promise<ScrapingHistory[]> {
    return this.scrapingHistoryRepository.find({
      where: { scraper, status: ScrapingStatus.IN_PROGRESS },
      order: { startTime: 'DESC' },
    });
  }

  async cancelOldInProgressSessions(scraper: string): Promise<number[]> {
    const inProgress = await this.getInProgressSessions(scraper);
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000);
  
    const toCancel = inProgress.filter((session, index) =>
      index > 0 || // not the latest
      new Date(session.updatedAt) < oneHourAgo // last update > 4 hours ago
    );
  
    const ids = toCancel.map(s => s.id);
  
    if (ids.length > 0) {
      await this.scrapingHistoryRepository.update(ids, {
        status: ScrapingStatus.FAILED,
        endTime: new Date()
      });
    }
  
    return ids;
  }
} 