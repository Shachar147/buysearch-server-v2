import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, Patch } from '@nestjs/common';
import { SavedFilterService } from './saved-filter.service';
import { UserGuard } from '../auth/user.guard';

@Controller('saved-filters')
@UseGuards(UserGuard)
export class SavedFilterController {
  constructor(private readonly savedFilterService: SavedFilterService) {}

  @Get()
  async findAll(@Request() req: any) {
    const userId = req.user.sub;
    return this.savedFilterService.findAllByUserId(userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.sub;
    return this.savedFilterService.findById(parseInt(id), userId);
  }

  @Post()
  async create(@Body() body: { name: string; filters: any }, @Request() req: any) {
    const userId = req.user.sub;
    return this.savedFilterService.create(userId, body.name, body.filters);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: { name: string; filters: any },
    @Request() req: any,
  ) {
    const userId = req.user.sub;
    return this.savedFilterService.update(parseInt(id), userId, body.name, body.filters);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.sub;
    await this.savedFilterService.delete(parseInt(id), userId);
    return { message: 'Saved filter deleted successfully' };
  }

  @Patch(':id/last-used')
  async updateLastUsed(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.sub;
    return this.savedFilterService.setLastUsed(parseInt(id), userId);
  }
} 