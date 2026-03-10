import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class CreateCustomPropertyDefinitionDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  label!: string;

  @IsEnum(['TEXT', 'NUMBER', 'DATE', 'DROPDOWN'])
  fieldType!: string;

  @IsEnum(['CONTACT', 'COMPANY'])
  entityType!: string;

  @ValidateIf((o) => o.fieldType === 'DROPDOWN')
  @IsArray()
  @IsString({ each: true })
  options?: string[];

  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;
}
