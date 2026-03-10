import { IsBoolean, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;

  @IsOptional()
  @IsEnum(['ADMIN', 'MANAGER', 'MEMBER'])
  role?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
