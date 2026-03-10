import { IsString, IsInt, IsBoolean, IsOptional, Min, Max, MinLength, MaxLength } from 'class-validator';

export class CreateStageDto {
  @IsString() @MinLength(1) @MaxLength(100) name!: string;
  @IsInt() @Min(0) position!: number;
  @IsInt() @Min(0) @Max(100) @IsOptional() probability?: number;
  @IsBoolean() @IsOptional() isWon?: boolean;
  @IsBoolean() @IsOptional() isLost?: boolean;
}
