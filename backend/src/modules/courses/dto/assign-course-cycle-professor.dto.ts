import { IsNotEmpty, IsString } from 'class-validator';

export class AssignCourseCycleProfessorDto {
  @IsString()
  @IsNotEmpty()
  professorUserId: string;
}
