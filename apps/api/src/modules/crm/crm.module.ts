import { Module } from '@nestjs/common';
import { ContactsController } from './contacts.controller';
import { ContactsService } from './contacts.service';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';
import { ActivitiesController } from './activities.controller';
import { ActivitiesService } from './activities.service';
import { CustomPropertiesController } from './custom-properties.controller';
import { CustomPropertiesService } from './custom-properties.service';

@Module({
  controllers: [
    ContactsController,
    CompaniesController,
    ActivitiesController,
    CustomPropertiesController,
  ],
  providers: [
    ContactsService,
    CompaniesService,
    ActivitiesService,
    CustomPropertiesService,
  ],
  exports: [
    ContactsService,
    CompaniesService,
    ActivitiesService,
    CustomPropertiesService,
  ],
})
export class CrmModule {}
