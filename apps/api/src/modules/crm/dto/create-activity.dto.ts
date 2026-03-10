import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateActivityDto {
  @IsEnum(['NOTE', 'EMAIL', 'CALL', 'MEETING', 'TASK'])
  type!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(500)
  subject!: string;

  @IsOptional()
  @IsString()
  body?: string;

  @IsOptional()
  @IsDateString()
  occurredAt?: string;

  @IsOptional()
  @IsString()
  contactId?: string;

  @IsOptional()
  @IsString()
  companyId?: string;

  @IsOptional()
  @IsString()
  dealId?: string;

  @IsOptional()
  @IsString()
  ticketId?: string;

  // CALL-specific
  @IsOptional()
  @IsInt()
  @Min(0)
  duration?: number;

  // MEETING-specific
  @IsOptional()
  @IsDateString()
  startAt?: string;

  @IsOptional()
  @IsDateString()
  endAt?: string;

  // TASK-specific
  @IsOptional()
  @IsDateString()
  dueAt?: string;

  @IsOptional()
  @IsDateString()
  completedAt?: string;
}
