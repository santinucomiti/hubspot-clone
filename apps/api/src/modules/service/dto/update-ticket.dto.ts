import { IsString, IsOptional, IsEnum, MaxLength, MinLength } from 'class-validator';

export class UpdateTicketDto {
  @IsOptional() @IsString() @MinLength(1) @MaxLength(255) subject?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']) priority?: string;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsString() ownerId?: string;
  @IsOptional() @IsString() contactId?: string;
  @IsOptional() @IsString() companyId?: string;
  @IsOptional() @IsString() dealId?: string;
}
