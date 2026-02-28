import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { NotificationType } from '@modules/notifications/domain/notification-type.entity';
import { Notification } from '@modules/notifications/domain/notification.entity';
import { UserNotification } from '@modules/notifications/domain/user-notification.entity';
import { ClassEvent } from '@modules/events/domain/class-event.entity';
import { ClassEventProfessor } from '@modules/events/domain/class-event-professor.entity';
import { Enrollment } from '@modules/enrollments/domain/enrollment.entity';
import { EnrollmentStatus } from '@modules/enrollments/domain/enrollment-status.entity';
import { Material } from '@modules/materials/domain/material.entity';
import { CourseCycleProfessor } from '@modules/courses/domain/course-cycle-professor.entity';
import { NotificationTypeRepository } from '@modules/notifications/infrastructure/notification-type.repository';
import { NotificationRepository } from '@modules/notifications/infrastructure/notification.repository';
import { UserNotificationRepository } from '@modules/notifications/infrastructure/user-notification.repository';
import { NotificationsService } from '@modules/notifications/application/notifications.service';
import { NotificationsDispatchService } from '@modules/notifications/application/notifications-dispatch.service';
import { NotificationRecipientsService } from '@modules/notifications/application/notification-recipients.service';
import { NotificationDispatchProcessor } from '@modules/notifications/infrastructure/processors/notification-dispatch.processor';
import { NotificationsController } from '@modules/notifications/presentation/notifications.controller';
import { SettingsModule } from '@modules/settings/settings.module';
import { RedisCacheModule } from '@infrastructure/cache/redis-cache.module';
import { QUEUES } from '@infrastructure/queue/queue.constants';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      NotificationType,
      Notification,
      UserNotification,
      ClassEvent,
      ClassEventProfessor,
      Enrollment,
      EnrollmentStatus,
      Material,
      CourseCycleProfessor,
    ]),
    BullModule.registerQueue({ name: QUEUES.NOTIFICATIONS }),
    SettingsModule,
    RedisCacheModule,
  ],
  controllers: [NotificationsController],
  providers: [
    NotificationTypeRepository,
    NotificationRepository,
    UserNotificationRepository,
    NotificationsService,
    NotificationsDispatchService,
    NotificationRecipientsService,
    NotificationDispatchProcessor,
  ],
  exports: [NotificationsDispatchService],
})
export class NotificationsModule {}
