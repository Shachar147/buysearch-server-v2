import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SourceService } from './source.service';
import { Source } from './source.entity';

@Controller('sources')
export class SourceController {
  constructor(private readonly sourceService: SourceService) {}

  @Post()
  create(@Body() createSourceDto: Partial<Source>) {
    return this.sourceService.create(createSourceDto);
  }

  @Get()
  findAll() {
    return this.sourceService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sourceService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSourceDto: Partial<Source>) {
    return this.sourceService.update(+id, updateSourceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sourceService.remove(+id);
  }
} 