import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AuditService } from './audit.service';
import { AuditQueryDto } from './dto';

@Controller('audit-logs')
@UseGuards(JwtAuthGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  findAll(@Query() query: AuditQueryDto) {
    if (query.entityType && query.entityId) {
      return this.auditService.findByEntity(query.entityType, query.entityId);
    }
    if (query.userId) {
      return this.auditService.findByUser(query.userId, {
        page: query.page,
        limit: query.limit,
      });
    }
    return this.auditService.findByEntity(
      query.entityType || '',
      query.entityId || '',
    );
  }
}
