import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { ProductService } from './product.service';
import { Product } from './product.entity';
import { UserGuard } from '../auth/user.guard';

@UseGuards(UserGuard)
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  create(@Body() createProductDto: Partial<Product>) {
    return this.productService.create(createProductDto);
  }

  @Get()
  async findAll(@Query() query: any, @Req() req?: any) {
    const offset = Number(query.offset) || 0;
    const limit = Math.min(Number(query.limit) || 200, 200);
    const color = query.color;
    const brand = query.brand;
    const category = query.category;
    const priceFrom = query.priceFrom;
    const priceTo = query.priceTo;
    const sort = query.sort || 'Updated: Newest First';
    const search = query.search;
    const gender = query.gender;
    const isFavourite = query.isFavourite;
    const filters: any = { offset, limit, color, brand, category, priceFrom, priceTo, sort, search, gender };
    if (isFavourite !== undefined) filters.isFavourite = isFavourite === 'true' || isFavourite === '';
    const userId = filters.isFavourite && req && req.user ? req.user.sub : undefined;

    console.time('findAll Execution Time');
    const result = await this.productService.findAll({ ...query, sort }, userId);
    console.timeEnd('findAll Execution Time');
    
    return result;
  }

  @Get('by-ids')
  async findByIds(@Query('ids') ids: string) {
    if (!ids) return { data: [] };
    const idArr = ids.split(',').map(id => Number(id)).filter(Boolean);
    const products = await this.productService.findByIds(idArr);
    return { data: products };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: Partial<Product>) {
    return this.productService.update(+id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productService.remove(+id);
  }
} 