import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';
import { PAGINATION_LIMIT } from '../consts';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
  ) {}

  async findAll(offset = 0, limit = PAGINATION_LIMIT): Promise<any> {
    const [data, total] = await this.categoriesRepository.findAndCount({
      where: { isActive: true },
      skip: offset,
      take: limit,
      order: { id: 'ASC' },
    });
    return {
      total,
      offset,
      limit,
      hasNextPage: offset + limit < total,
      data,
    };
  }

  async findOne(id: number): Promise<Category> {
    return this.categoriesRepository.findOne({ where: { id, isActive: true } });
  }

  async findByName(name: string): Promise<Category | null> {
    return this.categoriesRepository.findOne({ where: { name, isActive: true } });
  }

  async create(createCategoryDto: Partial<Category>): Promise<Category> {
    const category = this.categoriesRepository.create(createCategoryDto);
    return this.categoriesRepository.save(category);
  }

  async update(id: number, updateCategoryDto: Partial<Category>): Promise<Category> {
    await this.categoriesRepository.update(id, updateCategoryDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.categoriesRepository.update(id, { isActive: false });
  }

  async upsert(name: string): Promise<Category> {
    let category = await this.findByName(name);
    
    if (!category) {
      category = await this.create({ name });
    }
    
    return category;
  }

  async upsertMany(names: string[]): Promise<Category[]> {
    const categories: Category[] = [];
    
    for (const name of names) {
      const category = await this.upsert(name);
      categories.push(category);
    }
    
    return categories;
  }
} 