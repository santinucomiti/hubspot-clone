import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { PrismaService } from '../common/prisma.service';

const mockPrisma = {
  activity: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    count: jest.fn(),
  },
};

describe('ActivitiesService', () => {
  let service: ActivitiesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivitiesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ActivitiesService>(ActivitiesService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a NOTE activity', async () => {
      const dto = {
        type: 'NOTE',
        subject: 'Follow up',
        body: 'Discussed pricing',
        contactId: 'contact-1',
      };
      mockPrisma.activity.create.mockResolvedValue({
        id: 'activity-1',
        ...dto,
        createdById: 'user-1',
        occurredAt: new Date(),
      });

      const result = await service.create(dto, 'user-1');

      expect(mockPrisma.activity.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          type: 'NOTE',
          subject: 'Follow up',
          createdById: 'user-1',
          contactId: 'contact-1',
        }),
        include: expect.any(Object),
      });
      expect(result.id).toBe('activity-1');
    });

    it('should create a CALL activity with duration', async () => {
      const dto = {
        type: 'CALL',
        subject: 'Sales call',
        contactId: 'contact-1',
        duration: 300,
      };
      mockPrisma.activity.create.mockResolvedValue({
        id: 'activity-2',
        ...dto,
        createdById: 'user-1',
      });

      const result = await service.create(dto, 'user-1');

      expect(mockPrisma.activity.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ duration: 300 }),
        include: expect.any(Object),
      });
      expect(result.id).toBe('activity-2');
    });

    it('should create a MEETING activity with startAt/endAt', async () => {
      const dto = {
        type: 'MEETING',
        subject: 'Kick-off meeting',
        companyId: 'company-1',
        startAt: '2026-03-15T10:00:00Z',
        endAt: '2026-03-15T11:00:00Z',
      };
      mockPrisma.activity.create.mockResolvedValue({
        id: 'activity-3',
        ...dto,
        createdById: 'user-1',
      });

      const result = await service.create(dto, 'user-1');

      expect(mockPrisma.activity.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          startAt: new Date('2026-03-15T10:00:00Z'),
          endAt: new Date('2026-03-15T11:00:00Z'),
        }),
        include: expect.any(Object),
      });
      expect(result.id).toBe('activity-3');
    });

    it('should create a TASK activity with dueAt', async () => {
      const dto = {
        type: 'TASK',
        subject: 'Send proposal',
        contactId: 'contact-1',
        dueAt: '2026-03-20T17:00:00Z',
      };
      mockPrisma.activity.create.mockResolvedValue({
        id: 'activity-4',
        ...dto,
        createdById: 'user-1',
      });

      const result = await service.create(dto, 'user-1');

      expect(mockPrisma.activity.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          dueAt: new Date('2026-03-20T17:00:00Z'),
        }),
        include: expect.any(Object),
      });
      expect(result.id).toBe('activity-4');
    });

    it('should throw BadRequestException if no entity is linked', async () => {
      const dto = {
        type: 'NOTE',
        subject: 'Orphan note',
      };

      await expect(service.create(dto, 'user-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated activities', async () => {
      const activities = [{ id: 'activity-1', type: 'NOTE' }];
      mockPrisma.activity.findMany.mockResolvedValue(activities);
      mockPrisma.activity.count.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 25 });

      expect(result).toEqual({
        data: activities,
        meta: { total: 1, page: 1, limit: 25 },
      });
    });

    it('should filter by entityType and entityId', async () => {
      mockPrisma.activity.findMany.mockResolvedValue([]);
      mockPrisma.activity.count.mockResolvedValue(0);

      await service.findAll({
        page: 1,
        limit: 25,
        entityType: 'contact',
        entityId: 'contact-1',
      });

      expect(mockPrisma.activity.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ contactId: 'contact-1' }),
        }),
      );
    });

    it('should filter by activity type', async () => {
      mockPrisma.activity.findMany.mockResolvedValue([]);
      mockPrisma.activity.count.mockResolvedValue(0);

      await service.findAll({
        page: 1,
        limit: 25,
        type: 'CALL',
      });

      expect(mockPrisma.activity.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ type: 'CALL' }),
        }),
      );
    });
  });

  describe('findById', () => {
    it('should return an activity by id', async () => {
      const activity = { id: 'activity-1', type: 'NOTE', subject: 'Test' };
      mockPrisma.activity.findUnique.mockResolvedValue(activity);

      const result = await service.findById('activity-1');
      expect(result).toEqual(activity);
    });

    it('should throw NotFoundException if activity not found', async () => {
      mockPrisma.activity.findUnique.mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
