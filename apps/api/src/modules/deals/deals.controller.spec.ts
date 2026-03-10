import { Test, TestingModule } from '@nestjs/testing';
import { DealsController } from './deals.controller';
import { DealsService } from './deals.service';

const mockDealsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  moveStage: jest.fn(),
  forecast: jest.fn(),
};

describe('DealsController', () => {
  let controller: DealsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DealsController],
      providers: [
        { provide: DealsService, useValue: mockDealsService },
      ],
    }).compile();

    controller = module.get<DealsController>(DealsController);
    jest.clearAllMocks();
  });

  it('should create a deal with current user as owner', async () => {
    const dto = { name: 'New Deal', stageId: 's1', pipelineId: 'p1' };
    const user = { id: 'user-1' };
    const expected = { id: 'd1', ...dto, ownerId: 'user-1' };
    mockDealsService.create.mockResolvedValue(expected);

    const result = await controller.create(dto, user);

    expect(result).toEqual(expected);
    expect(mockDealsService.create).toHaveBeenCalledWith(dto, 'user-1');
  });

  it('should return paginated deals', async () => {
    const query = { page: 1, limit: 25 };
    const expected = { data: [], meta: { total: 0, page: 1, limit: 25, totalPages: 0 } };
    mockDealsService.findAll.mockResolvedValue(expected);

    const result = await controller.findAll(query);

    expect(result).toEqual(expected);
    expect(mockDealsService.findAll).toHaveBeenCalledWith(query);
  });

  it('should return a single deal', async () => {
    const expected = { id: 'd1', name: 'Deal 1' };
    mockDealsService.findById.mockResolvedValue(expected);

    const result = await controller.findOne('d1');

    expect(result).toEqual(expected);
    expect(mockDealsService.findById).toHaveBeenCalledWith('d1');
  });

  it('should update a deal', async () => {
    const dto = { name: 'Updated Deal' };
    const expected = { id: 'd1', name: 'Updated Deal' };
    mockDealsService.update.mockResolvedValue(expected);

    const result = await controller.update('d1', dto);

    expect(result).toEqual(expected);
    expect(mockDealsService.update).toHaveBeenCalledWith('d1', dto);
  });

  it('should delete a deal', async () => {
    mockDealsService.remove.mockResolvedValue(undefined);

    await controller.remove('d1');

    expect(mockDealsService.remove).toHaveBeenCalledWith('d1');
  });

  it('should move a deal to a new stage', async () => {
    const dto = { stageId: 's2' };
    const expected = { id: 'd1', stageId: 's2' };
    mockDealsService.moveStage.mockResolvedValue(expected);

    const result = await controller.moveStage('d1', dto);

    expect(result).toEqual(expected);
    expect(mockDealsService.moveStage).toHaveBeenCalledWith('d1', 's2');
  });

  it('should return forecast data', async () => {
    const query = { period: 'month' };
    const expected = [{ period: '2024-01', weightedAmount: 5000, totalAmount: 10000, dealCount: 3 }];
    mockDealsService.forecast.mockResolvedValue(expected);

    const result = await controller.forecast(query);

    expect(result).toEqual(expected);
    expect(mockDealsService.forecast).toHaveBeenCalledWith(query);
  });
});
