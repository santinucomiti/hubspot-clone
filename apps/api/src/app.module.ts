import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './modules/common/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { CrmModule } from './modules/crm/crm.module';
import { DealsModule } from './modules/deals/deals.module';
import { ServiceModule } from './modules/service/service.module';
import { MarketingModule } from './modules/marketing/marketing.module';
import { SearchModule } from './modules/common/search/search.module';
import { NotificationsModule } from './modules/common/notifications/notifications.module';
import { AuditModule } from './modules/common/audit/audit.module';
import { UploadsModule } from './modules/common/uploads/uploads.module';
import { DashboardModule } from './modules/common/dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    PrismaModule,
    AuthModule,
    CrmModule,
    DealsModule,
    ServiceModule,
    MarketingModule,
    SearchModule,
    NotificationsModule,
    AuditModule,
    UploadsModule,
    DashboardModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
