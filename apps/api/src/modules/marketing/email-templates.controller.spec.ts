import { Test, TestingModule } from '@nestjs/testing';
import { EmailTemplatesController } from './email-templates.controller';
import { EmailTemplatesService } from './email-templates.service';

const mockService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('EmailTemplatesController', () => {
  let controller: EmailTemplatesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmailTemplatesController],
      providers: [
        { provide: EmailTemplatesService, useValue: mockService },
      ],
    }).compile();

    controller = module.get<EmailTemplatesController>(EmailTemplatesController);
    jest.clearAllMocks();
  });

  it('should create an email template', async () => {
    const dto = { name: 'Welcome', subject: 'Welcome!', htmlContent: '<h1>Hi</h1>' };
    const expected = { id: 'tpl-1', ...dto };
    mockService.create.mockResolvedValue(expected);

    const result = await controller.create(dto);

    expect(result).toEqual(expected);
    expect(mockService.create).toHaveBeenCalledWith(dto);
  });

  it('should return paginated templates', async () => {
    const query = { page: 1, limit: 25 };
    const expected = { data: [], meta: { total: 0, page: 1, limit: 25, totalPages: 0 } };
    mockService.findAll.mockResolvedValue(expected);

    const result = await controller.findAll(query);

    expect(result).toEqual(expected);
    expect(mockService.findAll).toHaveBeenCalledWith(query);
  });

  it('should return a single template', async () => {
    const expected = { id: 'tpl-1', name: 'Welcome' };
    mockService.findById.mockResolvedValue(expected);

    const result = await controller.findOne('tpl-1');

    expect(result).toEqual(expected);
    expect(mockService.findById).toHaveBeenCalledWith('tpl-1');
  });

  it('should update a template', async () => {
    const dto = { name: 'Updated' };
    const expected = { id: 'tpl-1', name: 'Updated' };
    mockService.update.mockResolvedValue(expected);

    const result = await controller.update('tpl-1', dto);

    expect(result).toEqual(expected);
    expect(mockService.update).toHaveBeenCalledWith('tpl-1', dto);
  });

  it('should delete a template', async () => {
    mockService.remove.mockResolvedValue(undefined);

    await controller.remove('tpl-1');

    expect(mockService.remove).toHaveBeenCalledWith('tpl-1');
  });
});
