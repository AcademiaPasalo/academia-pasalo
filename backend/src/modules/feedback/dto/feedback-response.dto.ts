import { Expose, Type } from 'class-transformer';

export class TestimonyAuthorDto {
  @Expose()
  id: string;

  @Expose()
  firstName: string;

  @Expose()
  lastName1: string;

  @Expose()
  profilePhotoUrl: string | null;
}

export class TestimonyResponseDto {
  @Expose()
  id: string;

  @Expose()
  rating: number;

  @Expose()
  comment: string;

  @Expose()
  photoUrl: string | null;

  @Expose()
  photoSource: string;

  @Expose()
  createdAt: Date;

  @Expose()
  @Type(() => TestimonyAuthorDto)
  user: TestimonyAuthorDto;
}

export class FeaturedTestimonyResponseDto {
  @Expose()
  id: string;

  @Expose()
  displayOrder: number;

  @Expose()
  @Type(() => TestimonyResponseDto)
  courseTestimony: TestimonyResponseDto;
}
