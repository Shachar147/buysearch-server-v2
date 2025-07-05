import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SourcesService } from './sources.service';
import { Source } from '../../entities/source.entity';

@Controller('sources')
export class SourcesController {
  constructor(private readonly sourcesService: SourcesService) {}

  @Post()
  create(@Body() createSourceDto: Partial<Source>) {
    return this.sourcesService.create(createSourceDto);
  }

  @Get()
  findAll() {
    return this.sourcesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sourcesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSourceDto: Partial<Source>) {
    return this.sourcesService.update(+id, updateSourceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sourcesService.remove(+id);
  }
} 