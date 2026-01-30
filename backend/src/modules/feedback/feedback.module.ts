import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeedbackController } from '@modules/feedback/presentation/feedback.controller';
import { FeedbackService } from '@modules/feedback/application/feedback.service';
import { CourseTestimony } from '@modules/feedback/domain/course-testimony.entity';
import { FeaturedTestimony } from '@modules/feedback/domain/featured-testimony.entity';
import { CourseTestimonyRepository } from '@modules/feedback/infrastructure/course-testimony.repository';
import { FeaturedTestimonyRepository } from '@modules/feedback/infrastructure/featured-testimony.repository';
import { StorageModule } from '@infrastructure/storage/storage.module';
import { EnrollmentsModule } from '@modules/enrollments/enrollments.module';
import { UsersModule } from '@modules/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CourseTestimony, FeaturedTestimony]),
    StorageModule,
    EnrollmentsModule,
    UsersModule,
  ],
  controllers: [FeedbackController],
  providers: [
    FeedbackService,
    CourseTestimonyRepository,
    FeaturedTestimonyRepository,
  ],
})
export class FeedbackModule {}