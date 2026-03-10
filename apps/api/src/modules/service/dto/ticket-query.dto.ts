import { IsOptional, IsString, IsEnum, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class TicketQueryDto {
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsEnum(['OPEN', 'IN_PROGRESS', 'WAITING', 'RESOLVED', 'CLOSED']) status?: string;
  @IsOptional() @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']) priority?: string;
  @IsOptional() @IsString() ownerId?: string;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsString() sort?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) limit?: number;
}
