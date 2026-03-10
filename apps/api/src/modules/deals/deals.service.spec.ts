import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DealsService } from './deals.service';
import { PrismaService } from '../common/prisma.service';

const mockPrisma: any = {
  deal: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  stage: {
    findUnique: jest.fn(),
  },
  $queryRaw: jest.fn(),
};

const dealInclude = {
  stage: true,
  pipeline: true,
  owner: { select: { id: true, firstName: true, lastName: true, email: true } },
  contacts: { include: { contact: true } },
  companies: { include: { company: true } },
};

describe('DealsService', () => {
  let service: DealsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DealsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<DealsService>(DealsService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    const mockDeals = [
      { id: 'd1', name: 'Deal 1', amount: 1000 },
      { id: 'd2', name: 'Deal 2', amount: 2000 },
    ];

    it('should return paginated deals', async () => {
      mockPrisma.deal.findMany.mockResolvedValue(mockDeals);
      mockPrisma.deal.count.mockResolvedValue(2);

      const result = await service.findAll({ page: 1, limit: 25 });

      expect(result.data).toEqual(mockDeals);
      expect(result.meta.total).toBe(2);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(25);
    });

    it('should apply pipelineId filter', async () => {
      mockPrisma.deal.findMany.mockResolvedValue([]);
      mockPrisma.deal.count.mockResolvedValue(0);

      await service.findAll({ pipelineId: 'p1' });

      expect(mockPrisma.deal.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ pipelineId: 'p1' }),
        }),
      );
    });

    it('should apply stageId filter', async () => {
      mockPrisma.deal.findMany.mockResolvedValue([]);
      mockPrisma.deal.count.mockResolvedValue(0);

      await service.findAll({ stageId: 's1' });

      expect(mockPrisma.deal.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ stageId: 's1' }),
        }),
      );
    });

    it('should apply ownerId filter', async () => {
      mockPrisma.deal.findMany.mockResolvedValue([]);
      mockPrisma.deal.count.mockResolvedValue(0);

      await service.findAll({ ownerId: 'u1' });

      expect(mockPrisma.deal.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ ownerId: 'u1' }),
        }),
      );
    });

    it('should apply search filter', async () => {
      mockPrisma.deal.findMany.mockResolvedValue([]);
      mockPrisma.deal.count.mockResolvedValue(0);

      await service.findAll({ search: 'Enterprise' });

      expect(mockPrisma.deal.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            name: { contains: 'Enterprise', mode: 'insensitive' },
          }),
        }),
      );
    });
  });

  describe('findById', () => {
    it('should return a deal', async () => {
      const deal = { id: 'd1', name: 'Deal 1' };
      mockPrisma.deal.findUnique.mockResolvedValue(deal);

      const result = await service.findById('d1');

      expect(result).toEqual(deal);
    });

    it('should throw NotFoundException', async () => {
      mockPrisma.deal.findUnique.mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a deal', async () => {
      const dto = { name: 'New Deal', stageId: 's1', pipelineId: 'p1' };
      const expected = { id: 'd1', ...dto, ownerId: 'user-1' };
      mockPrisma.deal.create.mockResolvedValue(expected);

      const result = await service.create(dto, 'user-1');

      expect(result).toEqual(expected);
      expect(mockPrisma.deal.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: 'New Deal',
          stageId: 's1',
          pipelineId: 'p1',
          ownerId: 'user-1',
        }),
        include: dealInclude,
      });
    });

    it('should create a deal with contacts and companies', async () => {
      const dto = {
        name: 'New Deal',
        stageId: 's1',
        pipelineId: 'p1',
        contactIds: ['c1', 'c2'],
        companyIds: ['co1'],
      };
      const expected = { id: 'd1', ...dto };
      mockPrisma.deal.create.mockResolvedValue(expected);

      await service.create(dto, 'user-1');

      expect(mockPrisma.deal.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          contacts: { create: [{ contactId: 'c1' }, { contactId: 'c2' }] },
          companies: { create: [{ companyId: 'co1' }] },
        }),
        include: dealInclude,
      });
    });
  });

  describe('update', () => {
    it('should update a deal', async () => {
      mockPrisma.deal.findUnique.mockResolvedValue({ id: 'd1' });
      const updated = { id: 'd1', name: 'Updated Deal' };
      mockPrisma.deal.update.mockResolvedValue(updated);

      const result = await service.update('d1', { name: 'Updated Deal' });

      expect(result).toEqual(updated);
    });

    it('should throw NotFoundException', async () => {
      mockPrisma.deal.findUnique.mockResolvedValue(null);

      await expect(service.update('nonexistent', { name: 'Updated' })).rejects.toThrow(NotFoundException);
    });

    it('should re-associate contacts on update', async () => {
      mockPrisma.deal.findUnique.mockResolvedValue({ id: 'd1' });
      mockPrisma.deal.update.mockResolvedValue({ id: 'd1' });

      await service.update('d1', { contactIds: ['c3'] });

      expect(mockPrisma.deal.update).toHaveBeenCalledWith({
        where: { id: 'd1' },
        data: expect.objectContaining({
          contacts: {
            deleteMany: {},
            create: [{ contactId: 'c3' }],
          },
        }),
        include: dealInclude,
      });
    });
  });

  describe('remove', () => {
    it('should delete a deal', async () => {
      mockPrisma.deal.findUnique.mockResolvedValue({ id: 'd1' });
      mockPrisma.deal.delete.mockResolvedValue({ id: 'd1' });

      await expect(service.remove('d1')).resolves.not.toThrow();
    });

    it('should throw NotFoundException', async () => {
      mockPrisma.deal.findUnique.mockResolvedValue(null);

      await expect(service.remove('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('moveStage', () => {
    it('should move deal to new stage', async () => {
      mockPrisma.deal.findUnique.mockResolvedValue({
        id: 'd1',
        pipelineId: 'p1',
        stage: { id: 's1', pipelineId: 'p1' },
      });
      mockPrisma.stage.findUnique.mockResolvedValue({ id: 's2', pipelineId: 'p1', isWon: false, isLost: false });
      mockPrisma.deal.update.mockResolvedValue({ id: 'd1', stageId: 's2' });

      const result = await service.moveStage('d1', 's2');

      expect(result.stageId).toBe('s2');
      expect(mockPrisma.deal.update).toHaveBeenCalledWith({
        where: { id: 'd1' },
        data: { stageId: 's2' },
        include: dealInclude,
      });
    });

    it('should throw NotFoundException for non-existent deal', async () => {
      mockPrisma.deal.findUnique.mockResolvedValue(null);

      await expect(service.moveStage('nonexistent', 's2')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException for non-existent stage', async () => {
      mockPrisma.deal.findUnique.mockResolvedValue({
        id: 'd1',
        pipelineId: 'p1',
        stage: { id: 's1', pipelineId: 'p1' },
      });
      mockPrisma.stage.findUnique.mockResolvedValue(null);

      await expect(service.moveStage('d1', 'nonexistent')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for cross-pipeline move', async () => {
      mockPrisma.deal.findUnique.mockResolvedValue({
        id: 'd1',
        pipelineId: 'p1',
        stage: { id: 's1', pipelineId: 'p1' },
      });
      mockPrisma.stage.findUnique.mockResolvedValue({ id: 's3', pipelineId: 'p2', isWon: false, isLost: false });

      await expect(service.moveStage('d1', 's3')).rejects.toThrow(BadRequestException);
    });
  });

  describe('forecast', () => {
    it('should return forecast data', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([
        { period: '2024-01', weighted_amount: BigInt(5000), total_amount: BigInt(10000), deal_count: BigInt(3) },
        { period: '2024-02', weighted_amount: BigInt(7500), total_amount: BigInt(15000), deal_count: BigInt(5) },
      ]);

      const result = await service.forecast({ period: 'month' });

      expect(result).toEqual([
        { period: '2024-01', weightedAmount: 5000, totalAmount: 10000, dealCount: 3 },
        { period: '2024-02', weightedAmount: 7500, totalAmount: 15000, dealCount: 5 },
      ]);
    });
  });
});
