import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { Auth } from '@common/decorators/auth.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { ResponseMessage } from '@common/decorators/response-message.decorator';
import { User } from '@modules/users/domain/user.entity';
import { NotificationsService } from '@modules/notifications/application/notifications.service';
import { GetNotificationsQueryDto } from '@modules/notifications/dto/get-notifications-query.dto';
import { NotificationResponseDto } from '@modules/notifications/dto/notification-response.dto';

@Controller('notifications')
@Auth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ResponseMessage('Notificaciones recuperadas exitosamente')
  async getMyNotifications(
    @CurrentUser() user: User,
    @Query() query: GetNotificationsQueryDto,
  ): Promise<NotificationResponseDto[]> {
    const userNotifications =
      await this.notificationsService.getMyNotifications(
        user.id,
        query.onlyUnread ?? false,
        query.limit,
        query.offset,
      );
    return userNotifications.map((un) =>
      NotificationResponseDto.fromEntity(un),
    );
  }

  @Get('unread-count')
  @ResponseMessage('Conteo de notificaciones no leídas recuperado exitosamente')
  async getUnreadCount(@CurrentUser() user: User): Promise<{ count: number }> {
    const count = await this.notificationsService.getUnreadCount(user.id);
    return { count };
  }

  @Patch('read-all')
  @HttpCode(HttpStatus.NO_CONTENT)
  async markAllAsRead(@CurrentUser() user: User): Promise<void> {
    await this.notificationsService.markAllAsRead(user.id);
  }

  @Patch(':id/read')
  @HttpCode(HttpStatus.NO_CONTENT)
  async markAsRead(
    @CurrentUser() user: User,
    @Param('id') notificationId: string,
  ): Promise<void> {
    await this.notificationsService.markAsRead(user.id, notificationId);
  }
}
