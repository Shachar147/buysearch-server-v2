import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { CategoryService } from './category.service';
import { Category } from './category.entity';
import { UserGuard } from '../auth/user.guard';

@UseGuards(UserGuard)
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  create(@Body() createCategoryDto: Partial<Category>) {
    return this.categoryService.create(createCategoryDto);
  }

  @Get()
  findAll(@Query('gender') gender: string, @Query('offset') offset = 0, @Query('limit') limit = 200) {
    offset = Number(offset) || 0;
    limit = Math.min(Number(limit) || 200, 200);
    return this.categoryService.findAll(offset, limit, gender);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoryService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCategoryDto: Partial<Category>) {
    return this.categoryService.update(+id, updateCategoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoryService.remove(+id);
  }
} 