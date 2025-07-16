import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SavedFilter } from './saved-filter.entity';
import { Not } from 'typeorm';

@Injectable()
export class SavedFilterService {
  constructor(
    @InjectRepository(SavedFilter)
    private savedFilterRepository: Repository<SavedFilter>,
  ) {}

  async findAllByUserId(userId: number): Promise<SavedFilter[]> {
    return this.savedFilterRepository.find({
      where: { userId },
      order: { lastUsedAt: 'DESC', createdAt: 'DESC' },
    });
  }

  async findById(id: number, userId: number): Promise<SavedFilter> {
    const savedFilter = await this.savedFilterRepository.findOne({
      where: { id, userId },
    });
    if (!savedFilter) {
      throw new NotFoundException('Saved filter not found');
    }
    return savedFilter;
  }

  async create(userId: number, name: string, filters: any): Promise<SavedFilter> {
    // Check if a filter with the same name already exists for this user
    const existingFilter = await this.savedFilterRepository.findOne({
      where: { userId, name },
    });
    if (existingFilter) {
      throw new ConflictException('A filter with this name already exists');
    }

    const savedFilter = this.savedFilterRepository.create({
      userId,
      name,
      filters,
    });
    return this.savedFilterRepository.save(savedFilter);
  }

  async update(id: number, userId: number, name: string, filters: any): Promise<SavedFilter> {
    const savedFilter = await this.findById(id, userId);
    
    // Check if another filter with the same name exists (excluding current one)
    const existingFilter = await this.savedFilterRepository.findOne({
      where: { userId, name, id: Not(id) },
    });
    if (existingFilter) {
      throw new ConflictException('A filter with this name already exists');
    }

    savedFilter.name = name;
    savedFilter.filters = filters;
    return this.savedFilterRepository.save(savedFilter);
  }

  async delete(id: number, userId: number): Promise<void> {
    const savedFilter = await this.findById(id, userId);
    await this.savedFilterRepository.remove(savedFilter);
  }

  async checkDuplicateName(userId: number, name: string, excludeId?: number): Promise<boolean> {
    const query = this.savedFilterRepository.createQueryBuilder('filter')
      .where('filter.userId = :userId', { userId })
      .andWhere('filter.name = :name', { name });
    
    if (excludeId) {
      query.andWhere('filter.id != :excludeId', { excludeId });
    }
    
    const count = await query.getCount();
    return count > 0;
  }

  async setLastUsed(id: number, userId: number): Promise<SavedFilter> {
    const savedFilter = await this.findById(id, userId);
    savedFilter.lastUsedAt = new Date();
    return this.savedFilterRepository.save(savedFilter);
  }
} 