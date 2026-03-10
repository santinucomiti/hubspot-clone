import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateActivityDto, ActivityQueryDto } from './dto';

@Controller('activities')
@UseGuards(JwtAuthGuard)
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Post()
  create(@Body() dto: CreateActivityDto, @CurrentUser() user: any) {
    return this.activitiesService.create(dto, user.id);
  }

  @Get()
  findAll(@Query() query: ActivityQueryDto) {
    return this.activitiesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.activitiesService.findById(id);
  }
}
