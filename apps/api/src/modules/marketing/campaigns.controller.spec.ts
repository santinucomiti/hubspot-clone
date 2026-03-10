import { Test, TestingModule } from '@nestjs/testing';
import { CampaignsController } from './campaigns.controller';
import { CampaignsService } from './campaigns.service';

const mockService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('CampaignsController', () => {
  let controller: CampaignsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CampaignsController],
      providers: [
        { provide: CampaignsService, useValue: mockService },
      ],
    }).compile();

    controller = module.get<CampaignsController>(CampaignsController);
    jest.clearAllMocks();
  });

  it('should create a campaign', async () => {
    const dto = {
      name: 'Spring Sale',
      subject: 'Spring Sale!',
      fromName: 'Marketing',
      fromEmail: 'marketing@example.com',
      templateId: 'tpl-1',
    };
    const expected = { id: 'camp-1', ...dto, status: 'DRAFT' };
    mockService.create.mockResolvedValue(expected);

    const result = await controller.create(dto);

    expect(result).toEqual(expected);
    expect(mockService.create).toHaveBeenCalledWith(dto);
  });

  it('should return paginated campaigns', async () => {
    const query = { page: 1, limit: 25 };
    const expected = { data: [], meta: { total: 0, page: 1, limit: 25, totalPages: 0 } };
    mockService.findAll.mockResolvedValue(expected);

    const result = await controller.findAll(query);

    expect(result).toEqual(expected);
    expect(mockService.findAll).toHaveBeenCalledWith(query);
  });

  it('should return a single campaign', async () => {
    const expected = { id: 'camp-1', name: 'Spring Sale' };
    mockService.findById.mockResolvedValue(expected);

    const result = await controller.findOne('camp-1');

    expect(result).toEqual(expected);
    expect(mockService.findById).toHaveBeenCalledWith('camp-1');
  });

  it('should update a campaign', async () => {
    const dto = { name: 'Updated' };
    const expected = { id: 'camp-1', name: 'Updated' };
    mockService.update.mockResolvedValue(expected);

    const result = await controller.update('camp-1', dto);

    expect(result).toEqual(expected);
    expect(mockService.update).toHaveBeenCalledWith('camp-1', dto);
  });

  it('should delete a campaign', async () => {
    mockService.remove.mockResolvedValue(undefined);

    await controller.remove('camp-1');

    expect(mockService.remove).toHaveBeenCalledWith('camp-1');
  });
});
