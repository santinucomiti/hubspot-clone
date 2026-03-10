import { IsString, IsOptional, IsArray, IsDateString, MinLength, MaxLength } from 'class-validator';

export class CreateCampaignDto {
  @IsString() @MinLength(1) @MaxLength(200) name!: string;
  @IsString() @MinLength(1) subject!: string;
  @IsString() @MinLength(1) fromName!: string;
  @IsString() @MinLength(1) fromEmail!: string;
  @IsString() templateId!: string;
  @IsOptional() @IsArray() @IsString({ each: true }) contactListIds?: string[];
  @IsOptional() @IsDateString() scheduledAt?: string;
}
