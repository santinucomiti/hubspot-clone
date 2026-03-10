import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from './pagination-query.dto';

export class CompanyQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @IsString()
  ownerId?: string;
}
