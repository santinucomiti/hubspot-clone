import { Module } from '@nestjs/common';
import { ContactListsService } from './contact-lists.service';
import { ContactListsController } from './contact-lists.controller';
import { EmailTemplatesService } from './email-templates.service';
import { EmailTemplatesController } from './email-templates.controller';
import { CampaignsService } from './campaigns.service';
import { CampaignsController } from './campaigns.controller';

@Module({
  controllers: [ContactListsController, EmailTemplatesController, CampaignsController],
  providers: [ContactListsService, EmailTemplatesService, CampaignsService],
  exports: [ContactListsService, EmailTemplatesService, CampaignsService],
})
export class MarketingModule {}
