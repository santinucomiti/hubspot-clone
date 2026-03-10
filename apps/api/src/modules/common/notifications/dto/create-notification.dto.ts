import { IsString, IsOptional, IsEnum } from 'class-validator';
import { NotificationType } from '@prisma/client';

export class CreateNotificationDto {
  @IsEnum(NotificationType)
  type!: NotificationType;

  @IsString()
  message!: string;

  @IsOptional()
  @IsString()
  link?: string;

  @IsString()
  recipientId!: string;
}
