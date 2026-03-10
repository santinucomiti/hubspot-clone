import { IsString, MinLength, IsOptional } from 'class-validator';

export class SearchQueryDto {
  @IsString()
  @MinLength(2)
  q!: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  limit?: string;
}
