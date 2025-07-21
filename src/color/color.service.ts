import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Color } from './color.entity';
import { PAGINATION_LIMIT } from '../consts';

@Injectable()
export class ColorService {
  constructor(
    @InjectRepository(Color)
    private colorsRepository: Repository<Color>,
  ) {}

  async findAll(offset = 0, limit = PAGINATION_LIMIT): Promise<any> {
    const [data, total] = await this.colorsRepository.findAndCount({
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

  async findOne(id: number): Promise<Color> {
    return this.colorsRepository.findOne({ where: { id, isActive: true } });
  }

  async findByName(name: string): Promise<Color | null> {
    return this.colorsRepository.findOne({ where: { name, isActive: true } });
  }

  async findByNames(names: string[]): Promise<Color[]> {
    return this.colorsRepository
      .createQueryBuilder('color')
      .where('color.isActive = true')
      .andWhere('LOWER(color.name) IN (:...names)', { names: names.map(n => n.toLowerCase()) })
      .getMany();
  }

  async findByNameOrNames(nameOrNames: string): Promise<Color[]> {
    const names = nameOrNames.split(',').map(n => n.trim()).filter(Boolean);
    return this.findByNames(names);
  }

  async create(createColorDto: Partial<Color>): Promise<Color> {
    const color = this.colorsRepository.create(createColorDto);
    return this.colorsRepository.save(color);
  }

  async update(id: number, updateColorDto: Partial<Color>): Promise<Color> {
    await this.colorsRepository.update(id, updateColorDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.colorsRepository.update(id, { isActive: false });
  }

  async upsert(name: string): Promise<Color> {
    let color = await this.findByName(name);
    
    if (!color) {
      color = await this.create({ name });
    }
    
    return color;
  }

  async upsertMany(names: string[]): Promise<Color[]> {
    const colors: Color[] = [];
    
    for (const name of names) {
      const color = await this.upsert(name);
      colors.push(color);
    }
    
    return colors;
  }
} 