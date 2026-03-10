import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../prisma.service';

const mockPrisma: any = {
  notification: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    count: jest.fn(),
  },
};

describe('NotificationsService', () => {
  let service: NotificationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a notification', async () => {
      const dto = { type: 'GENERAL' as any, message: 'Hello', recipientId: 'user-1' };
      const expected = { id: 'n1', ...dto, isRead: false };
      mockPrisma.notification.create.mockResolvedValue(expected);

      const result = await service.create(dto);

      expect(result).toEqual(expected);
      expect(mockPrisma.notification.create).toHaveBeenCalledWith({
        data: { type: 'GENERAL', message: 'Hello', link: undefined, recipientId: 'user-1' },
      });
    });
  });

  describe('findByRecipient', () => {
    it('should return paginated notifications', async () => {
      const notifications = [{ id: 'n1', message: 'Test' }];
      mockPrisma.notification.findMany.mockResolvedValue(notifications);
      mockPrisma.notification.count.mockResolvedValue(1);

      const result = await service.findByRecipient('user-1', {});

      expect(result).toEqual({ data: notifications, total: 1, page: 1, limit: 25 });
    });

    it('should filter unread only', async () => {
      mockPrisma.notification.findMany.mockResolvedValue([]);
      mockPrisma.notification.count.mockResolvedValue(0);

      await service.findByRecipient('user-1', { unreadOnly: 'true' });

      expect(mockPrisma.notification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { recipientId: 'user-1', isRead: false },
        }),
      );
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      const notification = { id: 'n1', recipientId: 'user-1', isRead: false };
      mockPrisma.notification.findUnique.mockResolvedValue(notification);
      mockPrisma.notification.update.mockResolvedValue({ ...notification, isRead: true });

      const result = await service.markAsRead('n1', 'user-1');

      expect(result.isRead).toBe(true);
    });

    it('should throw NotFoundException if notification not found', async () => {
      mockPrisma.notification.findUnique.mockResolvedValue(null);

      await expect(service.markAsRead('n999', 'user-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read for user', async () => {
      mockPrisma.notification.updateMany.mockResolvedValue({ count: 3 });

      const result = await service.markAllAsRead('user-1');

      expect(result).toEqual({ count: 3 });
      expect(mockPrisma.notification.updateMany).toHaveBeenCalledWith({
        where: { recipientId: 'user-1', isRead: false },
        data: { isRead: true },
      });
    });
  });

  describe('getUnreadCount', () => {
    it('should return count of unread notifications', async () => {
      mockPrisma.notification.count.mockResolvedValue(5);

      const result = await service.getUnreadCount('user-1');

      expect(result).toBe(5);
      expect(mockPrisma.notification.count).toHaveBeenCalledWith({
        where: { recipientId: 'user-1', isRead: false },
      });
    });
  });
});
