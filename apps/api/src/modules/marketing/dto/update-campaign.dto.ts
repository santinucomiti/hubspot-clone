import { IsString, IsOptional, IsArray, IsDateString, MinLength, MaxLength } from 'class-validator';

export class UpdateCampaignDto {
  @IsOptional() @IsString() @MinLength(1) @MaxLength(200) name?: string;
  @IsOptional() @IsString() subject?: string;
  @IsOptional() @IsString() fromName?: string;
  @IsOptional() @IsString() fromEmail?: string;
  @IsOptional() @IsString() templateId?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) contactListIds?: string[];
  @IsOptional() @IsDateString() scheduledAt?: string;
}
