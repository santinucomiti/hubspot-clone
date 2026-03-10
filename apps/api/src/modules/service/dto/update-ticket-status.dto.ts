import { IsEnum } from 'class-validator';

export class UpdateTicketStatusDto {
  @IsEnum(['OPEN', 'IN_PROGRESS', 'WAITING', 'RESOLVED', 'CLOSED']) status!: string;
}
