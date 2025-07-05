import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Source } from '../../entities/source.entity';

@Injectable()
export class SourcesService {
  constructor(
    @InjectRepository(Source)
    private sourcesRepository: Repository<Source>,
  ) {}

  async findAll(): Promise<Source[]> {
    return this.sourcesRepository.find({ where: { isActive: true } });
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
} 