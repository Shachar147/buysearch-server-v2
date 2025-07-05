import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brand } from './brand.entity';

@Injectable()
export class BrandService {
  constructor(
    @InjectRepository(Brand)
    private brandsRepository: Repository<Brand>,
  ) {}

  async findAll(): Promise<Brand[]> {
    return this.brandsRepository.find({ where: { isActive: true } });
  }

  async findOne(id: number): Promise<Brand> {
    return this.brandsRepository.findOne({ where: { id, isActive: true } });
  }

  async findByName(name: string): Promise<Brand | null> {
    return this.brandsRepository.findOne({ where: { name, isActive: true } });
  }

  async create(createBrandDto: Partial<Brand>): Promise<Brand> {
    const brand = this.brandsRepository.create(createBrandDto);
    return this.brandsRepository.save(brand);
  }

  async update(id: number, updateBrandDto: Partial<Brand>): Promise<Brand> {
    await this.brandsRepository.update(id, updateBrandDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.brandsRepository.update(id, { isActive: false });
  }

  async upsert(name: string): Promise<Brand> {
    let brand = await this.findByName(name);
    
    if (!brand) {
      brand = await this.create({ name });
    }
    
    return brand;
  }
} 