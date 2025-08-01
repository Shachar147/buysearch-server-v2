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

  async findAll(offset = 0, limit = PAGINATION_LIMIT, gender: string): Promise<any> {
    const qb = this.categoriesRepository.createQueryBuilder('category')
      .where('category.isActive = true');
    if (gender) {
      qb.andWhere('LOWER(category.gender) = LOWER(:gender)', { gender });
    }
    qb.skip(offset).take(limit).orderBy('category.id', 'ASC');
    const [data, total] = await qb.getManyAndCount();
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

  async findByName(name: string, gender: string): Promise<Category | null> {
    return this.categoriesRepository.createQueryBuilder('category')
      .where('category.isActive = true')
      .andWhere('category.name = :name', { name })
      .andWhere('LOWER(category.gender) = LOWER(:gender)', { gender })
      .getOne();
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

  async upsert(name: string, gender: string): Promise<Category> {
    let category = await this.findByName(name, gender);
    
    if (!category) {
      category = await this.create({ name, gender });
    }
    
    return category;
  }

  async upsertMany(names: string[], gender: string): Promise<Category[]> {
    const categories: Category[] = [];
    
    for (const name of names) {
      const category = await this.upsert(name, gender);
      categories.push(category);
    }
    
    return categories;
  }

  async findByNames(names: string[]): Promise<Category[]> {
    return this.categoriesRepository
      .createQueryBuilder('category')
      .where('category.isActive = true')
      .andWhere('LOWER(category.name) IN (:...names)', { names: names.map(n => n.toLowerCase()) })
      .getMany();
  }

  async findByNameOrNames(nameOrNames: string): Promise<Category[]> {
    const names = nameOrNames.split(',').map(n => n.trim()).filter(Boolean);
    return this.findByNames(names);
  }

  // examples: ['women|dresses', 'men|t-shirts']
  async upsertManyFromPairs(pairs: string[]): Promise<Category[]> {
    const categoryObjects: Partial<Category>[] = pairs.map(pair => {
      const [gender, name] = pair.split('|');
      return {
        name: name.trim(),
        gender: gender.trim(),
        isActive: true,
      };
    });

    // Use name + gender as upsert conflict keys
    await this.categoriesRepository.upsert(categoryObjects, ['name', 'gender']);

    // Return updated/inserted categories
    const conditions = categoryObjects.map(c => ({
      name: c.name,
      gender: c.gender,
    }));

    return this.categoriesRepository.find({
      where: conditions,
    });
  }
} 