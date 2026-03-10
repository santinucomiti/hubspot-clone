import { IsString } from 'class-validator';

export class UploadQueryDto {
  @IsString()
  entityType!: string;

  @IsString()
  entityId!: string;
}
