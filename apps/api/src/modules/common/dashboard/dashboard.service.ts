import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview() {
    const [
      totalContacts,
      totalCompanies,
      totalDeals,
      openTickets,
      dealsByStage,
      recentActivities,
    ] = await Promise.all([
      this.prisma.contact.count(),
      this.prisma.company.count(),
      this.prisma.deal.count(),
      this.prisma.ticket.count({ where: { status: 'OPEN' } }),
      this.prisma.deal.groupBy({
        by: ['stageId'],
        _count: { id: true },
        _sum: { amount: true },
      }),
      this.prisma.activity.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          createdBy: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
    ]);

    return {
      totalContacts,
      totalCompanies,
      totalDeals,
      openTickets,
      dealsByStage,
      recentActivities,
    };
  }
}
