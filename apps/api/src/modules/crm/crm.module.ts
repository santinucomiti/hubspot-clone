import { Module } from '@nestjs/common';
import { ContactsController } from './contacts.controller';
import { ContactsService } from './contacts.service';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';

@Module({
  controllers: [ContactsController, CompaniesController],
  providers: [ContactsService, CompaniesService],
  exports: [ContactsService, CompaniesService],
})
export class CrmModule {}
