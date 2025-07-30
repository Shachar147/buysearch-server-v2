import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ColorService } from './color.service';
import { Color } from './color.entity';
import { UserGuard } from '../auth/user.guard';
import { 
  Color as ColorEnum, 
  colorNameToColor, 
  colorGroups, 
  COLOR_SEARCH_KEYWORDS_MAP,
  getAllColorKeywords,
  getColorSynonyms
} from '../color.constants';

@UseGuards(UserGuard)
@Controller('colors')
export class ColorController {
  constructor(private readonly colorService: ColorService) {}

  @Post()
  create(@Body() createColorDto: Partial<Color>) {
    return this.colorService.create(createColorDto);
  }

  @Get()
  async findAll(@Query('offset') offset = 0, @Query('limit') limit = 200, @Query('all') all?: string) {
    if (all === 'true') {
      return await this.colorService.findAllNoPagination();
    }
    offset = Number(offset) || 0;
    limit = Math.min(Number(limit) || 200, 200);
    return this.colorService.findAll(offset, limit);
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

  @Get('constants/all')
  getColorConstants() {
    return {
      colors: Object.values(ColorEnum),
      colorNameToHex: colorNameToColor,
      colorGroups,
      searchKeywords: COLOR_SEARCH_KEYWORDS_MAP,
      allKeywords: getAllColorKeywords(),
      colorSynonyms: getColorSynonyms()
    };
  }

  @Get('analysis/non-standard')
  async getNonStandardColors() {
    return await this.colorService.analyzeNonStandardColors();
  }
} 