import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
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
  findAll(
    @Query('offset') offset = 0,
    @Query('limit') limit = 200,
    @Query('color') color?: string,
    @Query('brand') brand?: string,
    @Query('category') category?: string,
    @Query('priceFrom') priceFrom?: number,
    @Query('priceTo') priceTo?: number,
    @Query('sort') sort?: string,
    @Query('search') search?: string,
    @Query('gender') gender?: string,
  ) {
    offset = Number(offset) || 0;
    limit = Math.min(Number(limit) || 200, 200);
    return this.productService.findAll({ offset, limit, color, brand, category, priceFrom, priceTo, sort, search, gender });
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