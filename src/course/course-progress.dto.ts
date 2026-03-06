import { IsUUID } from 'class-validator';

export class UpdateCourseProgressDto {
  @IsUUID()
  currentSectionId!: string;
}
