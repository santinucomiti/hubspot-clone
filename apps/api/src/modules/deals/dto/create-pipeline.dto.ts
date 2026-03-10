import { IsString, IsBoolean, IsOptional, IsArray, ValidateNested, ArrayMinSize, MinLength, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateStageDto } from './create-stage.dto';

export class CreatePipelineDto {
  @IsString() @MinLength(1) @MaxLength(100) name!: string;
  @IsBoolean() @IsOptional() isDefault?: boolean;
  @IsArray() @ValidateNested({ each: true }) @ArrayMinSize(1) @Type(() => CreateStageDto) stages!: CreateStageDto[];
}
