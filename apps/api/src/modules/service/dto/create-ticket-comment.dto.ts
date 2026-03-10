import { IsString, IsOptional, IsBoolean, MinLength } from 'class-validator';

export class CreateTicketCommentDto {
  @IsString() @MinLength(1) body!: string;
  @IsOptional() @IsBoolean() isInternal?: boolean;
}
