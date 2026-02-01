import { IsString, IsNotEmpty, IsDefined, MaxLength } from 'class-validator';

export class AssignProfessorDto {
  @IsString()
  @IsNotEmpty()
  @IsDefined()
  @MaxLength(20)
  professorUserId: string;
}
