import { IsOptional, IsString } from 'class-validator';

export class ListNotificationsQueryDto {
  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  limit?: string;

  @IsOptional()
  @IsString()
  unreadOnly?: string;
}
