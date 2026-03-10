import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditAction } from '@prisma/client';
import { AuditService } from './audit.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;

    let action: AuditAction | null = null;
    if (method === 'POST') action = AuditAction.CREATE;
    else if (method === 'PATCH' || method === 'PUT') action = AuditAction.UPDATE;
    else if (method === 'DELETE') action = AuditAction.DELETE;

    if (!action) {
      return next.handle();
    }

    const entityType = context.getClass().name.replace('Controller', '').toLowerCase();
    const entityId = request.params?.id || 'unknown';
    const userId = request.user?.id;

    return next.handle().pipe(
      tap(() => {
        if (userId) {
          this.auditService.log(userId, action!, entityType, entityId).catch(() => {
            // silently fail audit logging
          });
        }
      }),
    );
  }
}
