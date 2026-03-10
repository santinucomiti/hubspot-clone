import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class CreateEmailTemplateDto {
  @IsString() @MinLength(1) @MaxLength(200) name!: string;
  @IsString() @MinLength(1) subject!: string;
  @IsString() @MinLength(1) htmlContent!: string;
  @IsOptional() @IsString() mjmlSource?: string;
}
