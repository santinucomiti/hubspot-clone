import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { PrismaService } from '../common/prisma.service';

const mockPrisma: any = {
  campaign: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  campaignList: {
    deleteMany: jest.fn(),
  },
};

describe('CampaignsService', () => {
  let service: CampaignsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CampaignsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<CampaignsService>(CampaignsService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a campaign', async () => {
      const dto = {
        name: 'Spring Sale',
        subject: 'Spring Sale!',
        fromName: 'Marketing',
        fromEmail: 'marketing@example.com',
        templateId: 'tpl-1',
      };
      const expected = { id: 'camp-1', ...dto, status: 'DRAFT' };
      mockPrisma.campaign.create.mockResolvedValue(expected);

      const result = await service.create(dto);

      expect(result).toEqual(expected);
      expect(mockPrisma.campaign.create).toHaveBeenCalled();
    });

    it('should create a campaign with contact list ids', async () => {
      const dto = {
        name: 'Spring Sale',
        subject: 'Spring Sale!',
        fromName: 'Marketing',
        fromEmail: 'marketing@example.com',
        templateId: 'tpl-1',
        contactListIds: ['list-1', 'list-2'],
      };
      const expected = { id: 'camp-1', ...dto, status: 'DRAFT' };
      mockPrisma.campaign.create.mockResolvedValue(expected);

      await service.create(dto);

      expect(mockPrisma.campaign.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            campaignLists: {
              create: [
                { contactListId: 'list-1' },
                { contactListId: 'list-2' },
              ],
            },
          }),
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated campaigns', async () => {
      const campaigns = [{ id: 'camp-1', name: 'Spring Sale' }];
      mockPrisma.campaign.findMany.mockResolvedValue(campaigns);
      mockPrisma.campaign.count.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 25 });

      expect(result.data).toEqual(campaigns);
      expect(result.meta.total).toBe(1);
    });

    it('should filter by status', async () => {
      mockPrisma.campaign.findMany.mockResolvedValue([]);
      mockPrisma.campaign.count.mockResolvedValue(0);

      await service.findAll({ status: 'DRAFT' });

      expect(mockPrisma.campaign.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'DRAFT' }),
        }),
      );
    });
  });

  describe('findById', () => {
    it('should return a campaign', async () => {
      const campaign = { id: 'camp-1', name: 'Spring Sale' };
      mockPrisma.campaign.findUnique.mockResolvedValue(campaign);

      const result = await service.findById('camp-1');

      expect(result).toEqual(campaign);
    });

    it('should throw NotFoundException', async () => {
      mockPrisma.campaign.findUnique.mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a campaign', async () => {
      mockPrisma.campaign.findUnique.mockResolvedValue({ id: 'camp-1' });
      const updated = { id: 'camp-1', name: 'Updated' };
      mockPrisma.campaign.update.mockResolvedValue(updated);

      const result = await service.update('camp-1', { name: 'Updated' });

      expect(result).toEqual(updated);
    });

    it('should throw NotFoundException', async () => {
      mockPrisma.campaign.findUnique.mockResolvedValue(null);

      await expect(
        service.update('nonexistent', { name: 'Updated' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a campaign', async () => {
      mockPrisma.campaign.findUnique.mockResolvedValue({ id: 'camp-1' });
      mockPrisma.campaign.delete.mockResolvedValue({ id: 'camp-1' });

      await expect(service.remove('camp-1')).resolves.not.toThrow();
    });

    it('should throw NotFoundException', async () => {
      mockPrisma.campaign.findUnique.mockResolvedValue(null);

      await expect(service.remove('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
