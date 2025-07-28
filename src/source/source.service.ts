import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Source } from './source.entity';
import { PAGINATION_LIMIT } from '../consts';

@Injectable()
export class SourceService {
  constructor(
    @InjectRepository(Source)
    private sourcesRepository: Repository<Source>,
  ) {}

  async findAll(offset = 0, limit = PAGINATION_LIMIT): Promise<any> {
    const [data, total] = await this.sourcesRepository.findAndCount({
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

  async findOne(id: number): Promise<Source> {
    return this.sourcesRepository.findOne({ where: { id, isActive: true } });
  }

  async findByName(name: string): Promise<Source | null> {
    return this.sourcesRepository.findOne({ where: { name, isActive: true } });
  }

  async create(createSourceDto: Partial<Source>): Promise<Source> {
    const source = this.sourcesRepository.create(createSourceDto);
    return this.sourcesRepository.save(source);
  }

  async update(id: number, updateSourceDto: Partial<Source>): Promise<Source> {
    await this.sourcesRepository.update(id, updateSourceDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.sourcesRepository.update(id, { isActive: false });
  }

  async upsert(name: string, baseUrl?: string): Promise<Source> {
    let source = await this.findByName(name);
    
    if (!source) {
      source = await this.create({ name, baseUrl });
    }
    
    return source;
  }

  async findByNames(names: string[]): Promise<Source[]> {
    if (!names || names.length === 0) return [];
    return this.sourcesRepository
      .createQueryBuilder('source')
      .where('source.isActive = true')
      .andWhere('LOWER(source.name) IN (:...names)', { names: names.map(n => n.toLowerCase()) })
      .getMany();
  }

  async findByNameOrNames(nameOrNames: string): Promise<Source[]> {
    const names = nameOrNames.split(',').map(n => n.trim()).filter(Boolean);
    return this.findByNames(names);
  }

  async upsertMany(sources: string[]): Promise<Source[]> {
    const sourceObjects: Partial<Source>[] = sources.map(source =>
      ({ name: source }),
    );
  
    await this.sourcesRepository.upsert(sourceObjects, ['name']);
  
    const names = sourceObjects.map(s => s.name).filter(Boolean);
    return this.sourcesRepository.find({
      where: { name: In(names) },
    });
  }

  public async findAllNoPagination(): Promise<Source[]> {
    return this.sourcesRepository.find({ where: { isActive: true }, order: { id: 'ASC' } });
  }
  
} 