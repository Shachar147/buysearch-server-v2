import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { SourceService } from './source.service';
import { Source } from './source.entity';
import { UserGuard } from '../auth/user.guard';

@Controller('sources')
export class SourceController {
  constructor(private readonly sourceService: SourceService) {}

  @UseGuards(UserGuard)
  @Post()
  create(@Body() createSourceDto: Partial<Source>) {
    return this.sourceService.create(createSourceDto);
  }

  @Get()
  async findAll(@Query('offset') offset = 0, @Query('limit') limit = 200, @Query('all') all?: string) {
    if (all === 'true') {
      return await this.sourceService.findAllNoPagination();
    }
    offset = Number(offset) || 0;
    limit = Math.min(Number(limit) || 200, 200);
    return this.sourceService.findAll(offset, limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sourceService.findOne(+id);
  }

  @UseGuards(UserGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSourceDto: Partial<Source>) {
    return this.sourceService.update(+id, updateSourceDto);
  }

  @UseGuards(UserGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sourceService.remove(+id);
  }
} 