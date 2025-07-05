import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ColorsService } from './colors.service';
import { Color } from '../../entities/color.entity';

@Controller('colors')
export class ColorsController {
  constructor(private readonly colorsService: ColorsService) {}

  @Post()
  create(@Body() createColorDto: Partial<Color>) {
    return this.colorsService.create(createColorDto);
  }

  @Get()
  findAll() {
    return this.colorsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.colorsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateColorDto: Partial<Color>) {
    return this.colorsService.update(+id, updateColorDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.colorsService.remove(+id);
  }
} 