import { Test, TestingModule } from '@nestjs/testing';
import { ActivitiesController } from './activities.controller';
import { ActivitiesService } from './activities.service';

const mockActivitiesService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
};

describe('ActivitiesController', () => {
  let controller: ActivitiesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActivitiesController],
      providers: [
        { provide: ActivitiesService, useValue: mockActivitiesService },
      ],
    }).compile();

    controller = module.get<ActivitiesController>(ActivitiesController);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an activity with current user', async () => {
      const dto = {
        type: 'NOTE',
        subject: 'Follow up',
        contactId: 'contact-1',
      };
      const expected = { id: 'activity-1', ...dto, createdById: 'user-1' };
      mockActivitiesService.create.mockResolvedValue(expected);

      const result = await controller.create(dto, { id: 'user-1' });

      expect(mockActivitiesService.create).toHaveBeenCalledWith(dto, 'user-1');
      expect(result).toEqual(expected);
    });
  });

  describe('findAll', () => {
    it('should return paginated activities', async () => {
      const expected = {
        data: [{ id: 'activity-1' }],
        meta: { total: 1, page: 1, limit: 25 },
      };
      mockActivitiesService.findAll.mockResolvedValue(expected);

      const result = await controller.findAll({ page: 1, limit: 25 });

      expect(result).toEqual(expected);
    });

    it('should pass entity filter parameters', async () => {
      const query = {
        page: 1,
        limit: 25,
        entityType: 'contact',
        entityId: 'contact-1',
      };
      mockActivitiesService.findAll.mockResolvedValue({
        data: [],
        meta: { total: 0, page: 1, limit: 25 },
      });

      await controller.findAll(query);

      expect(mockActivitiesService.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('findOne', () => {
    it('should return a single activity', async () => {
      const expected = { id: 'activity-1', type: 'NOTE' };
      mockActivitiesService.findById.mockResolvedValue(expected);

      const result = await controller.findOne('activity-1');

      expect(result).toEqual(expected);
    });
  });
});
