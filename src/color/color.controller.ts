import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ColorService } from './color.service';
import { Color } from './color.entity';

@Controller('colors')
export class ColorController {
  constructor(private readonly colorService: ColorService) {}

  @Post()
  create(@Body() createColorDto: Partial<Color>) {
    return this.colorService.create(createColorDto);
  }

  @Get()
  findAll() {
    return this.colorService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.colorService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateColorDto: Partial<Color>) {
    return this.colorService.update(+id, updateColorDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.colorService.remove(+id);
  }
} 