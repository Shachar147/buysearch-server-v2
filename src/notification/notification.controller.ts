import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { UserGuard } from '../auth/user.guard';

@Controller('notifications')
@UseGuards(UserGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async getUserNotifications(
    @Request() req,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    const userId = req.user.sub;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    return await this.notificationService.getUserNotifications(
      userId,
      pageNum,
      limitNum,
    );
  }

  @Get('unseen-count')
  async getUnseenCount(@Request() req) {
    const userId = req.user.sub;
    const count = await this.notificationService.getUnseenCount(userId);
    return { count };
  }

  @Post(':id/mark-seen')
  async markAsSeen(@Request() req, @Param('id') notificationId: string) {
    const userId = req.user.sub;
    await this.notificationService.markAsSeen(
      parseInt(notificationId, 10),
      userId,
    );
    return { success: true };
  }

  @Post('mark-all-seen')
  async markAllAsSeen(@Request() req) {
    const userId = req.user.sub;
    await this.notificationService.markAllAsSeen(userId);
    return { success: true };
  }
}
