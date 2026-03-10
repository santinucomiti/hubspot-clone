import { IsString, IsEnum, IsOptional, MinLength, MaxLength } from 'class-validator';

export class CreateContactListDto {
  @IsString() @MinLength(1) @MaxLength(200) name!: string;
  @IsEnum(['STATIC', 'DYNAMIC']) type!: string;
  @IsOptional() filters?: any;
}
