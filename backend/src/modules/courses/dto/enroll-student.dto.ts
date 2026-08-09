import { IsUUID, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EnrollStudentDto {
  @ApiProperty({ example: 'student-uuid-here' })
  @IsUUID()
  @IsNotEmpty()
  studentId: string;
}
