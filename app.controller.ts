import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { UserGuard } from './src/auth/user.guard';

@UseGuards(UserGuard)
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
