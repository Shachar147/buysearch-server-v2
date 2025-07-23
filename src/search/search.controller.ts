import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { SearchService } from './search.service';
import { UserGuard } from '../auth/user.guard';
import { UserService } from '../user/user.service';
import { Request } from 'express';

@UseGuards(UserGuard)
@Controller('search')
export class SearchController {
  constructor(
    private readonly searchService: SearchService,
    private readonly userService: UserService,
  ) {}

  @Post('parse')
  async parse(@Body('search') search: string, @Req() req: Request) {
    if (!search || typeof search !== 'string') {
      return { filters: null };
    }
    // Increment totalSearches for the authenticated user if available
    const user = (req as any).user;
    if (user && user.sub) {
      await this.userService.incrementTotalSearches(user.sub);
    }
    const filters = await this.searchService.parseSearchQuery(search);
    return { filters };
  }
} 