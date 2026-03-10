import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from './pagination-query.dto';

export class ContactQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(['SUBSCRIBER', 'LEAD', 'OPPORTUNITY', 'CUSTOMER'])
  lifecycleStage?: string;

  @IsOptional()
  @IsString()
  ownerId?: string;

  @IsOptional()
  @IsString()
  companyId?: string;
}
