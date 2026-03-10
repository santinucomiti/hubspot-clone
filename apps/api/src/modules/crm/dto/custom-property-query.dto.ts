import { IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from './pagination-query.dto';

export class CustomPropertyQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(['CONTACT', 'COMPANY'])
  entityType?: string;
}
