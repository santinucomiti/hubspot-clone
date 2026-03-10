import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CustomPropertiesService } from './custom-properties.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CreateCustomPropertyDefinitionDto,
  SetCustomPropertyValueDto,
  CustomPropertyQueryDto,
} from './dto';

@Controller('custom-properties')
@UseGuards(JwtAuthGuard)
export class CustomPropertiesController {
  constructor(
    private readonly customPropertiesService: CustomPropertiesService,
  ) {}

  @Post()
  createDefinition(@Body() dto: CreateCustomPropertyDefinitionDto) {
    return this.customPropertiesService.createDefinition(dto);
  }

  @Get()
  findDefinitions(@Query() query: CustomPropertyQueryDto) {
    return this.customPropertiesService.findDefinitions(query);
  }

  @Post('values')
  setValue(@Body() dto: SetCustomPropertyValueDto) {
    return this.customPropertiesService.setValue(dto);
  }

  @Get('values/:entityType/:entityId')
  getValues(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    return this.customPropertiesService.getValues(entityType, entityId);
  }
}
