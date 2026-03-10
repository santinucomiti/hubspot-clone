import { IsString, IsInt, IsOptional, IsDateString, IsArray, Min, MinLength, MaxLength } from 'class-validator';

export class CreateDealDto {
  @IsString() @MinLength(1) @MaxLength(200) name!: string;
  @IsInt() @Min(0) @IsOptional() amount?: number;
  @IsString() @IsOptional() currency?: string;
  @IsDateString() @IsOptional() closeDate?: string;
  @IsString() stageId!: string;
  @IsString() pipelineId!: string;
  @IsString() @IsOptional() ownerId?: string;
  @IsArray() @IsString({ each: true }) @IsOptional() contactIds?: string[];
  @IsArray() @IsString({ each: true }) @IsOptional() companyIds?: string[];
}
