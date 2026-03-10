import { Module } from '@nestjs/common';
import { PipelinesService } from './pipelines.service';
import { PipelinesController } from './pipelines.controller';
import { DealsService } from './deals.service';
import { DealsController } from './deals.controller';

@Module({
  controllers: [PipelinesController, DealsController],
  providers: [PipelinesService, DealsService],
  exports: [PipelinesService, DealsService],
})
export class DealsModule {}
