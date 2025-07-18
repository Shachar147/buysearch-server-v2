import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { SearchService } from './search.service';
import { UserGuard } from '../auth/user.guard';

@UseGuards(UserGuard)
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Post('parse')
  async parse(@Body('search') search: string) {
    if (!search || typeof search !== 'string') {
      return { filters: null };
    }
    const filters = await this.searchService.parseSearchQuery(search);
    return { filters };
  }
} 