import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ContactListsService } from './contact-lists.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateContactListDto, MarketingQueryDto } from './dto';

@Controller('contact-lists')
@UseGuards(JwtAuthGuard)
export class ContactListsController {
  constructor(private readonly contactListsService: ContactListsService) {}

  @Post()
  create(@Body() dto: CreateContactListDto) {
    return this.contactListsService.create(dto);
  }

  @Get()
  findAll(@Query() query: MarketingQueryDto) {
    return this.contactListsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contactListsService.findById(id);
  }

  @Post(':id/members')
  addMembers(@Param('id') id: string, @Body() body: { contactIds: string[] }) {
    return this.contactListsService.addMembers(id, body.contactIds);
  }

  @Delete(':id/members')
  removeMembers(@Param('id') id: string, @Body() body: { contactIds: string[] }) {
    return this.contactListsService.removeMembers(id, body.contactIds);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.contactListsService.remove(id);
  }
}
