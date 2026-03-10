import { IsString } from 'class-validator';

export class MoveDealStageDto {
  @IsString() stageId!: string;
}
