import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from './pagination-query.dto';

export class ActivityQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(['NOTE', 'EMAIL', 'CALL', 'MEETING', 'TASK'])
  type?: string;

  @IsOptional()
  @IsEnum(['contact', 'company', 'deal', 'ticket'])
  entityType?: string;

  @IsOptional()
  @IsString()
  entityId?: string;
}
