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
import { DealsService } from './deals.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateDealDto, UpdateDealDto, DealQueryDto, MoveDealStageDto, ForecastQueryDto } from './dto';

@Controller('deals')
@UseGuards(JwtAuthGuard)
export class DealsController {
  constructor(private readonly dealsService: DealsService) {}

  @Post()
  create(@Body() dto: CreateDealDto, @CurrentUser() user: any) {
    return this.dealsService.create(dto, user.id);
  }

  @Get()
  findAll(@Query() query: DealQueryDto) {
    return this.dealsService.findAll(query);
  }

  @Get('forecast')
  forecast(@Query() query: ForecastQueryDto) {
    return this.dealsService.forecast(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dealsService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDealDto) {
    return this.dealsService.update(id, dto);
  }

  @Patch(':id/stage')
  moveStage(@Param('id') id: string, @Body() dto: MoveDealStageDto) {
    return this.dealsService.moveStage(id, dto.stageId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.dealsService.remove(id);
  }
}
