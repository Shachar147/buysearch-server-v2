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
    updatedItems: number
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
} 