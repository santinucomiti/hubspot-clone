import { AuditInterceptor } from './audit.interceptor';
import { AuditService } from './audit.service';
import { of } from 'rxjs';

describe('AuditInterceptor', () => {
  let interceptor: AuditInterceptor;
  let auditService: Partial<AuditService>;

  beforeEach(() => {
    auditService = {
      log: jest.fn().mockResolvedValue({}),
    };
    interceptor = new AuditInterceptor(auditService as AuditService);
  });

  it('should log CREATE action for POST requests', (done) => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          method: 'POST',
          params: { id: 'c1' },
          user: { id: 'u1' },
        }),
      }),
      getClass: () => ({ name: 'ContactsController' }),
      getHandler: () => ({}),
    } as any;

    const next = { handle: () => of({ id: 'c1' }) };

    interceptor.intercept(context, next).subscribe({
      complete: () => {
        expect(auditService.log).toHaveBeenCalledWith('u1', 'CREATE', 'contacts', 'c1');
        done();
      },
    });
  });

  it('should not log for GET requests', (done) => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          method: 'GET',
          params: {},
          user: { id: 'u1' },
        }),
      }),
      getClass: () => ({ name: 'ContactsController' }),
      getHandler: () => ({}),
    } as any;

    const next = { handle: () => of([]) };

    interceptor.intercept(context, next).subscribe({
      complete: () => {
        expect(auditService.log).not.toHaveBeenCalled();
        done();
      },
    });
  });
});
