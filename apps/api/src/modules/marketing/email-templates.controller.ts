import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { EmailTemplatesService } from './email-templates.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateEmailTemplateDto, UpdateEmailTemplateDto, MarketingQueryDto } from './dto';

@Controller('email-templates')
@UseGuards(JwtAuthGuard)
export class EmailTemplatesController {
  constructor(private readonly emailTemplatesService: EmailTemplatesService) {}

  @Post()
  create(@Body() dto: CreateEmailTemplateDto) {
    return this.emailTemplatesService.create(dto);
  }

  @Get()
  findAll(@Query() query: MarketingQueryDto) {
    return this.emailTemplatesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.emailTemplatesService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEmailTemplateDto) {
    return this.emailTemplatesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.emailTemplatesService.remove(id);
  }
}
