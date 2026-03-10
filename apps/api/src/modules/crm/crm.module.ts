import { Module } from '@nestjs/common';
import { ContactsController } from './contacts.controller';
import { ContactsService } from './contacts.service';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';
import { ActivitiesController } from './activities.controller';
import { ActivitiesService } from './activities.service';

@Module({
  controllers: [ContactsController, CompaniesController, ActivitiesController],
  providers: [ContactsService, CompaniesService, ActivitiesService],
  exports: [ContactsService, CompaniesService, ActivitiesService],
})
export class CrmModule {}
