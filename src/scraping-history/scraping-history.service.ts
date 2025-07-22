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
    return this.scrapingHistoryRepository.find({
      where: { scraper },
      order: { startTime: 'DESC' },
    });
  }

  // Get all in-progress sessions for a scraper (newest first)
  async getInProgressSessions(scraper: string): Promise<ScrapingHistory[]> {
    return this.scrapingHistoryRepository.find({
      where: { scraper, status: ScrapingStatus.IN_PROGRESS },
      order: { startTime: 'DESC' },
    });
  }

  // Cancel all but the latest in-progress session for a scraper
  async cancelOldInProgressSessions(scraper: string): Promise<number[]> {
    const inProgress = await this.getInProgressSessions(scraper);
    if (inProgress.length <= 1) return [];
    // Keep the latest, cancel the rest
    const toCancel = inProgress.slice(1);
    const ids = toCancel.map(s => s.id);
    if (ids.length > 0) {
      await this.scrapingHistoryRepository.update(ids, { status: ScrapingStatus.FAILED, endTime: new Date() });
    }
    return ids;
  }
} 