import { Test, TestingModule } from '@nestjs/testing';
import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';

const mockService = {
  findByEntity: jest.fn(),
  findByUser: jest.fn(),
  log: jest.fn(),
};

describe('AuditController', () => {
  let controller: AuditController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuditController],
      providers: [{ provide: AuditService, useValue: mockService }],
    }).compile();

    controller = module.get<AuditController>(AuditController);
    jest.clearAllMocks();
  });

  it('should return logs by entity when entityType and entityId provided', async () => {
    const logs = [{ id: 'a1', action: 'CREATE' }];
    mockService.findByEntity.mockResolvedValue(logs);

    const result = await controller.findAll({
      entityType: 'contact',
      entityId: 'c1',
    });

    expect(mockService.findByEntity).toHaveBeenCalledWith('contact', 'c1');
    expect(result).toEqual(logs);
  });

  it('should return logs by user when userId provided', async () => {
    const expected = { data: [{ id: 'a1' }], total: 1, page: 1, limit: 25 };
    mockService.findByUser.mockResolvedValue(expected);

    const result = await controller.findAll({
      userId: 'u1',
      page: '1',
      limit: '25',
    });

    expect(mockService.findByUser).toHaveBeenCalledWith('u1', {
      page: '1',
      limit: '25',
    });
    expect(result).toEqual(expected);
  });

  it('should fallback to findByEntity with empty strings when no params', async () => {
    mockService.findByEntity.mockResolvedValue([]);

    const result = await controller.findAll({});

    expect(mockService.findByEntity).toHaveBeenCalledWith('', '');
    expect(result).toEqual([]);
  });
});
