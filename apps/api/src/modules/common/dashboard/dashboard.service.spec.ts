import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '../prisma.service';

const mockPrisma: any = {
  contact: { count: jest.fn() },
  company: { count: jest.fn() },
  deal: { count: jest.fn(), groupBy: jest.fn() },
  ticket: { count: jest.fn() },
  activity: { findMany: jest.fn() },
};

describe('DashboardService', () => {
  let service: DashboardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
    jest.clearAllMocks();
  });

  describe('getOverview', () => {
    it('should return aggregated dashboard stats', async () => {
      mockPrisma.contact.count.mockResolvedValue(100);
      mockPrisma.company.count.mockResolvedValue(50);
      mockPrisma.deal.count.mockResolvedValue(30);
      mockPrisma.ticket.count.mockResolvedValue(12);
      mockPrisma.deal.groupBy.mockResolvedValue([
        { stageId: 's1', _count: { id: 10 }, _sum: { amount: 50000 } },
        { stageId: 's2', _count: { id: 20 }, _sum: { amount: 100000 } },
      ]);
      mockPrisma.activity.findMany.mockResolvedValue([
        { id: 'act1', subject: 'Call with client' },
      ]);

      const result = await service.getOverview();

      expect(result.totalContacts).toBe(100);
      expect(result.totalCompanies).toBe(50);
      expect(result.totalDeals).toBe(30);
      expect(result.openTickets).toBe(12);
      expect(result.dealsByStage).toHaveLength(2);
      expect(result.recentActivities).toHaveLength(1);
    });

    it('should return zeros when no data exists', async () => {
      mockPrisma.contact.count.mockResolvedValue(0);
      mockPrisma.company.count.mockResolvedValue(0);
      mockPrisma.deal.count.mockResolvedValue(0);
      mockPrisma.ticket.count.mockResolvedValue(0);
      mockPrisma.deal.groupBy.mockResolvedValue([]);
      mockPrisma.activity.findMany.mockResolvedValue([]);

      const result = await service.getOverview();

      expect(result.totalContacts).toBe(0);
      expect(result.totalCompanies).toBe(0);
      expect(result.totalDeals).toBe(0);
      expect(result.openTickets).toBe(0);
      expect(result.dealsByStage).toHaveLength(0);
      expect(result.recentActivities).toHaveLength(0);
    });

    it('should count only OPEN tickets', async () => {
      mockPrisma.contact.count.mockResolvedValue(0);
      mockPrisma.company.count.mockResolvedValue(0);
      mockPrisma.deal.count.mockResolvedValue(0);
      mockPrisma.ticket.count.mockResolvedValue(5);
      mockPrisma.deal.groupBy.mockResolvedValue([]);
      mockPrisma.activity.findMany.mockResolvedValue([]);

      await service.getOverview();

      expect(mockPrisma.ticket.count).toHaveBeenCalledWith({
        where: { status: 'OPEN' },
      });
    });
  });
});
