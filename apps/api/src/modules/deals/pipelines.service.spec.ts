import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PipelinesService } from './pipelines.service';
import { PrismaService } from '../common/prisma.service';

const mockPrisma: any = {
  pipeline: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    delete: jest.fn(),
  },
};

describe('PipelinesService', () => {
  let service: PipelinesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PipelinesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<PipelinesService>(PipelinesService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all pipelines with stages', async () => {
      const pipelines = [
        { id: 'p1', name: 'Sales', stages: [{ id: 's1', name: 'Lead', position: 0 }] },
      ];
      mockPrisma.pipeline.findMany.mockResolvedValue(pipelines);

      const result = await service.findAll();

      expect(result).toEqual(pipelines);
      expect(mockPrisma.pipeline.findMany).toHaveBeenCalledWith({
        include: { stages: { orderBy: { position: 'asc' } } },
      });
    });
  });

  describe('findById', () => {
    it('should return a pipeline', async () => {
      const pipeline = { id: 'p1', name: 'Sales', stages: [] };
      mockPrisma.pipeline.findUnique.mockResolvedValue(pipeline);

      const result = await service.findById('p1');

      expect(result).toEqual(pipeline);
    });

    it('should throw NotFoundException', async () => {
      mockPrisma.pipeline.findUnique.mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a pipeline with stages', async () => {
      const dto = {
        name: 'Sales',
        stages: [{ name: 'Lead', position: 0 }, { name: 'Won', position: 1, isWon: true, probability: 100 }],
      };
      const expected = { id: 'p1', name: 'Sales', isDefault: false, stages: [] };
      mockPrisma.pipeline.create.mockResolvedValue(expected);

      const result = await service.create(dto);

      expect(result).toEqual(expected);
      expect(mockPrisma.pipeline.create).toHaveBeenCalled();
    });

    it('should clear existing defaults when creating default pipeline', async () => {
      const dto = {
        name: 'Sales',
        isDefault: true,
        stages: [{ name: 'Lead', position: 0 }],
      };
      mockPrisma.pipeline.updateMany.mockResolvedValue({ count: 1 });
      mockPrisma.pipeline.create.mockResolvedValue({ id: 'p1', ...dto });

      await service.create(dto);

      expect(mockPrisma.pipeline.updateMany).toHaveBeenCalledWith({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    });
  });

  describe('update', () => {
    it('should update a pipeline', async () => {
      mockPrisma.pipeline.findUnique.mockResolvedValue({ id: 'p1' });
      const updated = { id: 'p1', name: 'Updated' };
      mockPrisma.pipeline.update.mockResolvedValue(updated);

      const result = await service.update('p1', { name: 'Updated' });

      expect(result).toEqual(updated);
    });

    it('should throw NotFoundException for non-existent pipeline', async () => {
      mockPrisma.pipeline.findUnique.mockResolvedValue(null);

      await expect(service.update('nonexistent', { name: 'Updated' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a pipeline', async () => {
      mockPrisma.pipeline.findUnique.mockResolvedValue({ id: 'p1', isDefault: false });
      mockPrisma.pipeline.delete.mockResolvedValue({ id: 'p1' });

      await expect(service.remove('p1')).resolves.not.toThrow();
    });

    it('should throw NotFoundException', async () => {
      mockPrisma.pipeline.findUnique.mockResolvedValue(null);

      await expect(service.remove('nonexistent')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for default pipeline', async () => {
      mockPrisma.pipeline.findUnique.mockResolvedValue({ id: 'p1', isDefault: true });

      await expect(service.remove('p1')).rejects.toThrow(BadRequestException);
    });
  });
});
