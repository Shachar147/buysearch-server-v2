import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Brand } from './brand.entity';
import { PAGINATION_LIMIT } from '../consts';

@Injectable()
export class BrandService {
  constructor(
    @InjectRepository(Brand)
    private brandsRepository: Repository<Brand>,
  ) {}

  async findAll(offset = 0, limit = PAGINATION_LIMIT): Promise<any> {
    const [data, total] = await this.brandsRepository.findAndCount({
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

  async findOne(id: number): Promise<Brand> {
    return this.brandsRepository.findOne({ where: { id, isActive: true } });
  }

  async findByName(name: string): Promise<Brand | null> {
    return this.brandsRepository.findOne({ where: { name, isActive: true } });
  }

  async findByNames(names: string[]): Promise<Brand[]> {
    return this.brandsRepository
      .createQueryBuilder('brand')
      .where('brand.isActive = true')
      .andWhere('LOWER(brand.name) IN (:...names)', { names: names.map(n => n.toLowerCase()) })
      .getMany();
  }

  async findByNameOrNames(nameOrNames: string): Promise<Brand[]> {
    const names = nameOrNames.split(',').map(n => n.trim()).filter(Boolean);
    return this.findByNames(names);
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

  async upsertMany(brands: string[]): Promise<Brand[]> {
    const brandObjects: Partial<Brand>[] = brands.map(brand =>
      ({ name: brand })
    );
  
    // Perform bulk upsert on `name`
    await this.brandsRepository.upsert(brandObjects, ['name']);
  
    // Fetch and return all upserted brands
    const names = brandObjects.map(b => b.name).filter(Boolean);
    return this.brandsRepository.find({
      where: { name: In(names) },
    });
  }

  public async findAllNoPagination(): Promise<Brand[]> {
    return this.brandsRepository.find({ where: { isActive: true }, order: { id: 'ASC' } });
  }

} 