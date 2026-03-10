import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { PrismaService } from '../common/prisma.service';

const mockPrisma = {
  company: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  $queryRawUnsafe: jest.fn(),
};

describe('CompaniesService', () => {
  let service: CompaniesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompaniesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<CompaniesService>(CompaniesService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a company', async () => {
      const dto = { name: 'Acme Corp', domain: 'acme.com', industry: 'Tech' };
      mockPrisma.company.create.mockResolvedValue({
        id: 'company-1',
        ...dto,
        ownerId: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.create(dto, 'user-1');

      expect(mockPrisma.company.create).toHaveBeenCalledWith({
        data: { ...dto, ownerId: 'user-1' },
        include: {
          owner: { select: { id: true, firstName: true, lastName: true, email: true } },
          _count: { select: { contacts: true } },
        },
      });
      expect(result.id).toBe('company-1');
    });

    it('should throw ConflictException for duplicate domain', async () => {
      mockPrisma.company.create.mockRejectedValue({
        code: 'P2002',
        meta: { target: ['domain'] },
      });

      await expect(
        service.create({ name: 'Test', domain: 'taken.com' }, 'user-1'),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return paginated companies', async () => {
      const companies = [{ id: 'company-1', name: 'Acme' }];
      mockPrisma.company.findMany.mockResolvedValue(companies);
      mockPrisma.company.count.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 25 });

      expect(result).toEqual({
        data: companies,
        meta: { total: 1, page: 1, limit: 25 },
      });
    });

    it('should apply industry filter', async () => {
      mockPrisma.company.findMany.mockResolvedValue([]);
      mockPrisma.company.count.mockResolvedValue(0);

      await service.findAll({ page: 1, limit: 25, industry: 'Tech' });

      expect(mockPrisma.company.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ industry: 'Tech' }),
        }),
      );
    });

    it('should apply search via tsvector', async () => {
      mockPrisma.$queryRawUnsafe.mockResolvedValue([{ id: 'company-1' }]);
      mockPrisma.company.count.mockResolvedValue(1);

      const result = await service.findAll({
        page: 1,
        limit: 25,
        search: 'Acme',
      });

      expect(mockPrisma.$queryRawUnsafe).toHaveBeenCalled();
      expect(result.data).toHaveLength(1);
    });
  });

  describe('findById', () => {
    it('should return a company by id', async () => {
      const company = { id: 'company-1', name: 'Acme' };
      mockPrisma.company.findUnique.mockResolvedValue(company);

      const result = await service.findById('company-1');
      expect(result).toEqual(company);
    });

    it('should throw NotFoundException if company not found', async () => {
      mockPrisma.company.findUnique.mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a company', async () => {
      mockPrisma.company.findUnique.mockResolvedValue({ id: 'company-1' });
      mockPrisma.company.update.mockResolvedValue({
        id: 'company-1',
        name: 'Acme Inc',
      });

      const result = await service.update('company-1', { name: 'Acme Inc' });
      expect(result.name).toBe('Acme Inc');
    });

    it('should throw NotFoundException if company not found', async () => {
      mockPrisma.company.findUnique.mockResolvedValue(null);

      await expect(
        service.update('nonexistent', { name: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a company', async () => {
      mockPrisma.company.findUnique.mockResolvedValue({ id: 'company-1' });
      mockPrisma.company.delete.mockResolvedValue({ id: 'company-1' });

      await service.remove('company-1');

      expect(mockPrisma.company.delete).toHaveBeenCalledWith({
        where: { id: 'company-1' },
      });
    });

    it('should throw NotFoundException if company not found', async () => {
      mockPrisma.company.findUnique.mockResolvedValue(null);

      await expect(service.remove('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
