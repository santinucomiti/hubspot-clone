import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class UpdateEmailTemplateDto {
  @IsOptional() @IsString() @MinLength(1) @MaxLength(200) name?: string;
  @IsOptional() @IsString() subject?: string;
  @IsOptional() @IsString() htmlContent?: string;
  @IsOptional() @IsString() mjmlSource?: string;
}
