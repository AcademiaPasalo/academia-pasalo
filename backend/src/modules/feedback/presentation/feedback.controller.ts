import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UploadedFile,
  UseInterceptors,
  HttpStatus,
  HttpCode,
  ParseFilePipeBuilder,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FeedbackService } from '@modules/feedback/application/feedback.service';
import { CreateTestimonyDto } from '@modules/feedback/dto/create-testimony.dto';
import { FeatureTestimonyDto } from '@modules/feedback/dto/feature-testimony.dto';
import {
  TestimonyResponseDto,
  FeaturedTestimonyResponseDto,
} from '@modules/feedback/dto/feedback-response.dto';
import { Auth } from '@common/decorators/auth.decorator';
import { Roles } from '@common/decorators/roles.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { ResponseMessage } from '@common/decorators/response-message.decorator';
import { User } from '@modules/users/domain/user.entity';
import { plainToInstance } from 'class-transformer';

@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  @Auth()
  @Roles('STUDENT')
  @UseInterceptors(FileInterceptor('photo'))
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('¡Gracias por tu opinión!')
  async create(
    @CurrentUser() user: User,
    @Body() dto: CreateTestimonyDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: /(jpg|jpeg|png)$/ })
        .addMaxSizeValidator({ maxSize: 5 * 1024 * 1024 })
        .build({ fileIsRequired: false }),
    )
    photo?: Express.Multer.File,
  ) {
    const testimony = await this.feedbackService.createTestimony(
      user.id,
      dto,
      photo,
    );
    return plainToInstance(TestimonyResponseDto, testimony, {
      excludeExtraneousValues: true,
    });
  }

  @Post('admin/:id/feature')
  @Auth()
  @Roles('ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Visibilidad de testimonio actualizada')
  async feature(
    @CurrentUser() user: User,
    @Param('id') testimonyId: string,
    @Body() dto: FeatureTestimonyDto,
  ) {
    const featured = await this.feedbackService.featureTestimony(
      user.id,
      testimonyId,
      dto,
    );
    return plainToInstance(FeaturedTestimonyResponseDto, featured, {
      excludeExtraneousValues: true,
    });
  }

  @Get('public/course-cycle/:id')
  @ResponseMessage('Testimonios destacados obtenidos')
  async getPublic(@Param('id') courseCycleId: string) {
    const testimonies =
      await this.feedbackService.getPublicTestimonies(courseCycleId);
    return plainToInstance(FeaturedTestimonyResponseDto, testimonies, {
      excludeExtraneousValues: true,
    });
  }

  @Get('admin/course-cycle/:id')
  @Auth()
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ResponseMessage('Listado completo de testimonios')
  async getAdmin(@Param('id') courseCycleId: string) {
    const testimonies =
      await this.feedbackService.getAllTestimoniesAdmin(courseCycleId);
    return plainToInstance(TestimonyResponseDto, testimonies, {
      excludeExtraneousValues: true,
    });
  }
}
