import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

const mockService = {
  findByRecipient: jest.fn(),
  getUnreadCount: jest.fn(),
  markAsRead: jest.fn(),
  markAllAsRead: jest.fn(),
};

describe('NotificationsController', () => {
  let controller: NotificationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [{ provide: NotificationsService, useValue: mockService }],
    }).compile();

    controller = module.get<NotificationsController>(NotificationsController);
    jest.clearAllMocks();
  });

  it('should list notifications for current user', async () => {
    const expected = { data: [], total: 0, page: 1, limit: 25 };
    mockService.findByRecipient.mockResolvedValue(expected);

    const result = await controller.findAll('user-1', {});

    expect(mockService.findByRecipient).toHaveBeenCalledWith('user-1', {});
    expect(result).toEqual(expected);
  });

  it('should return unread count', async () => {
    mockService.getUnreadCount.mockResolvedValue(3);

    const result = await controller.getUnreadCount('user-1');

    expect(result).toBe(3);
  });

  it('should mark one notification as read', async () => {
    const expected = { id: 'n1', isRead: true };
    mockService.markAsRead.mockResolvedValue(expected);

    const result = await controller.markAsRead('n1', 'user-1');

    expect(mockService.markAsRead).toHaveBeenCalledWith('n1', 'user-1');
    expect(result).toEqual(expected);
  });

  it('should mark all as read', async () => {
    mockService.markAllAsRead.mockResolvedValue({ count: 5 });

    const result = await controller.markAllAsRead('user-1');

    expect(mockService.markAllAsRead).toHaveBeenCalledWith('user-1');
    expect(result).toEqual({ count: 5 });
  });
});
