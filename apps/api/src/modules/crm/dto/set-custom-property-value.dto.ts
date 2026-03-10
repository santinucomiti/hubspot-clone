import { IsEnum, IsString } from 'class-validator';

export class SetCustomPropertyValueDto {
  @IsString()
  definitionId!: string;

  @IsEnum(['CONTACT', 'COMPANY'])
  entityType!: string;

  @IsString()
  entityId!: string;

  @IsString()
  value!: string;
}
