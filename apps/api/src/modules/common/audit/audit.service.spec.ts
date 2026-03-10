import { Test, TestingModule } from '@nestjs/testing';
import { AuditService } from './audit.service';
import { PrismaService } from '../prisma.service';

const mockPrisma: any = {
  auditLog: {
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  },
};

describe('AuditService', () => {
  let service: AuditService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
    jest.clearAllMocks();
  });

  describe('log', () => {
    it('should create an audit log entry', async () => {
      const expected = { id: 'a1', userId: 'u1', action: 'CREATE', entityType: 'contact', entityId: 'c1' };
      mockPrisma.auditLog.create.mockResolvedValue(expected);

      const result = await service.log('u1', 'CREATE' as any, 'contact', 'c1');

      expect(result).toEqual(expected);
      expect(mockPrisma.auditLog.create).toHaveBeenCalledWith({
        data: { userId: 'u1', action: 'CREATE', entityType: 'contact', entityId: 'c1', changes: undefined },
      });
    });

    it('should include changes when provided', async () => {
      const changes = { name: { old: 'John', new: 'Jane' } };
      mockPrisma.auditLog.create.mockResolvedValue({ id: 'a2' });

      await service.log('u1', 'UPDATE' as any, 'contact', 'c1', changes);

      expect(mockPrisma.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ changes }),
      });
    });
  });

  describe('findByEntity', () => {
    it('should return audit logs for an entity', async () => {
      const logs = [{ id: 'a1', action: 'CREATE' }];
      mockPrisma.auditLog.findMany.mockResolvedValue(logs);

      const result = await service.findByEntity('contact', 'c1');

      expect(result).toEqual(logs);
      expect(mockPrisma.auditLog.findMany).toHaveBeenCalledWith({
        where: { entityType: 'contact', entityId: 'c1' },
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
      });
    });
  });

  describe('findByUser', () => {
    it('should return paginated audit logs for a user', async () => {
      const logs = [{ id: 'a1' }];
      mockPrisma.auditLog.findMany.mockResolvedValue(logs);
      mockPrisma.auditLog.count.mockResolvedValue(1);

      const result = await service.findByUser('u1', { page: '1', limit: '10' });

      expect(result).toEqual({ data: logs, total: 1, page: 1, limit: 10 });
    });
  });
});
