import { IsOptional, IsString, IsIn } from 'class-validator';

export class ForecastQueryDto {
  @IsOptional() @IsString() pipelineId?: string;
  @IsOptional() @IsString() @IsIn(['month', 'quarter', 'year']) period?: string;
}
