import { Controller, Post, Body } from '@nestjs/common';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Post('parse')
  parse(@Body('search') search: string) {
    if (!search || typeof search !== 'string') {
      return { filters: null };
    }
    const filters = this.searchService.parseSearchQuery(search);
    return { filters };
  }
} 