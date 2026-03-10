import { Test, TestingModule } from '@nestjs/testing';
import { PipelinesController } from './pipelines.controller';
import { PipelinesService } from './pipelines.service';

const mockPipelinesService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('PipelinesController', () => {
  let controller: PipelinesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PipelinesController],
      providers: [
        { provide: PipelinesService, useValue: mockPipelinesService },
      ],
    }).compile();

    controller = module.get<PipelinesController>(PipelinesController);
    jest.clearAllMocks();
  });

  it('should create a pipeline', async () => {
    const dto = { name: 'Sales', stages: [{ name: 'Lead', position: 0 }] };
    const expected = { id: 'p1', ...dto };
    mockPipelinesService.create.mockResolvedValue(expected);

    const result = await controller.create(dto);

    expect(result).toEqual(expected);
    expect(mockPipelinesService.create).toHaveBeenCalledWith(dto);
  });

  it('should return all pipelines', async () => {
    const expected = [{ id: 'p1', name: 'Sales' }];
    mockPipelinesService.findAll.mockResolvedValue(expected);

    const result = await controller.findAll();

    expect(result).toEqual(expected);
    expect(mockPipelinesService.findAll).toHaveBeenCalled();
  });

  it('should return a single pipeline', async () => {
    const expected = { id: 'p1', name: 'Sales' };
    mockPipelinesService.findById.mockResolvedValue(expected);

    const result = await controller.findOne('p1');

    expect(result).toEqual(expected);
    expect(mockPipelinesService.findById).toHaveBeenCalledWith('p1');
  });

  it('should update a pipeline', async () => {
    const dto = { name: 'Updated' };
    const expected = { id: 'p1', name: 'Updated' };
    mockPipelinesService.update.mockResolvedValue(expected);

    const result = await controller.update('p1', dto);

    expect(result).toEqual(expected);
    expect(mockPipelinesService.update).toHaveBeenCalledWith('p1', dto);
  });

  it('should delete a pipeline', async () => {
    mockPipelinesService.remove.mockResolvedValue(undefined);

    await controller.remove('p1');

    expect(mockPipelinesService.remove).toHaveBeenCalledWith('p1');
  });
});
