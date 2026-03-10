import { Test, TestingModule } from '@nestjs/testing';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';

const mockCompaniesService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('CompaniesController', () => {
  let controller: CompaniesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompaniesController],
      providers: [
        { provide: CompaniesService, useValue: mockCompaniesService },
      ],
    }).compile();

    controller = module.get<CompaniesController>(CompaniesController);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a company with current user as owner', async () => {
      const dto = { name: 'Acme Corp', domain: 'acme.com' };
      const expected = { id: 'company-1', ...dto, ownerId: 'user-1' };
      mockCompaniesService.create.mockResolvedValue(expected);

      const result = await controller.create(dto, { id: 'user-1' });

      expect(mockCompaniesService.create).toHaveBeenCalledWith(dto, 'user-1');
      expect(result).toEqual(expected);
    });
  });

  describe('findAll', () => {
    it('should return paginated companies', async () => {
      const expected = {
        data: [{ id: 'company-1' }],
        meta: { total: 1, page: 1, limit: 25 },
      };
      mockCompaniesService.findAll.mockResolvedValue(expected);

      const result = await controller.findAll({ page: 1, limit: 25 });

      expect(result).toEqual(expected);
    });
  });

  describe('findOne', () => {
    it('should return a single company', async () => {
      const expected = { id: 'company-1', name: 'Acme' };
      mockCompaniesService.findById.mockResolvedValue(expected);

      const result = await controller.findOne('company-1');

      expect(result).toEqual(expected);
    });
  });

  describe('update', () => {
    it('should update a company', async () => {
      const dto = { name: 'Acme Inc' };
      const expected = { id: 'company-1', name: 'Acme Inc' };
      mockCompaniesService.update.mockResolvedValue(expected);

      const result = await controller.update('company-1', dto);

      expect(result).toEqual(expected);
    });
  });

  describe('remove', () => {
    it('should delete a company', async () => {
      mockCompaniesService.remove.mockResolvedValue(undefined);

      await controller.remove('company-1');

      expect(mockCompaniesService.remove).toHaveBeenCalledWith('company-1');
    });
  });
});
