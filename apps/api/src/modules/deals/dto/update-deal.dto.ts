import { IsString, IsInt, IsOptional, IsDateString, IsArray, Min, MinLength, MaxLength } from 'class-validator';

export class UpdateDealDto {
  @IsOptional() @IsString() @MinLength(1) @MaxLength(200) name?: string;
  @IsOptional() @IsInt() @Min(0) amount?: number;
  @IsOptional() @IsString() currency?: string;
  @IsOptional() @IsDateString() closeDate?: string;
  @IsOptional() @IsString() stageId?: string;
  @IsOptional() @IsString() ownerId?: string;
  @IsOptional() @IsString() lostReason?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) contactIds?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) companyIds?: string[];
}
