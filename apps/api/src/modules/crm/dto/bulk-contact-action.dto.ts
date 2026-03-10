import { IsArray, IsEnum, IsOptional, IsString, ArrayMinSize } from 'class-validator';

export class BulkContactActionDto {
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  ids!: string[];

  @IsEnum(['assignOwner', 'updateLifecycleStage', 'delete'])
  action!: string;

  @IsOptional()
  @IsString()
  ownerId?: string;

  @IsOptional()
  @IsEnum(['SUBSCRIBER', 'LEAD', 'OPPORTUNITY', 'CUSTOMER'])
  lifecycleStage?: string;
}
