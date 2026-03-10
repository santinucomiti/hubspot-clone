import { IsString, IsBoolean, IsOptional, MaxLength, MinLength } from 'class-validator';

export class UpdatePipelineDto {
  @IsOptional() @IsString() @MinLength(1) @MaxLength(100) name?: string;
  @IsOptional() @IsBoolean() isDefault?: boolean;
}
