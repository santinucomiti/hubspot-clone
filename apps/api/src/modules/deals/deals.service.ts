import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../common/prisma.service';
import { CreateDealDto, UpdateDealDto, DealQueryDto, ForecastQueryDto } from './dto';

@Injectable()
export class DealsService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly dealInclude = {
    stage: true,
    pipeline: true,
    owner: { select: { id: true, firstName: true, lastName: true, email: true } },
    contacts: { include: { contact: true } },
    companies: { include: { company: true } },
  };

  async findAll(query: DealQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 25;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.pipelineId) {
      where.pipelineId = query.pipelineId;
    }
    if (query.stageId) {
      where.stageId = query.stageId;
    }
    if (query.ownerId) {
      where.ownerId = query.ownerId;
    }
    if (query.search) {
      where.name = { contains: query.search, mode: 'insensitive' };
    }

    let orderBy: any = { createdAt: 'desc' };
    if (query.sort) {
      const direction = query.sort.startsWith('-') ? 'desc' : 'asc';
      const field = query.sort.replace(/^-/, '');
      orderBy = { [field]: direction };
    }

    const [data, total] = await Promise.all([
      this.prisma.deal.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: this.dealInclude,
      }),
      this.prisma.deal.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const deal = await this.prisma.deal.findUnique({
      where: { id },
      include: this.dealInclude,
    });

    if (!deal) {
      throw new NotFoundException('Deal not found');
    }

    return deal;
  }

  async create(dto: CreateDealDto, userId: string) {
    const { contactIds, companyIds, closeDate, ...rest } = dto;

    return this.prisma.deal.create({
      data: {
        ...rest,
        closeDate: closeDate ? new Date(closeDate) : undefined,
        ownerId: dto.ownerId || userId,
        contacts: contactIds?.length
          ? { create: contactIds.map((contactId) => ({ contactId })) }
          : undefined,
        companies: companyIds?.length
          ? { create: companyIds.map((companyId) => ({ companyId })) }
          : undefined,
      },
      include: this.dealInclude,
    });
  }

  async update(id: string, dto: UpdateDealDto) {
    const existing = await this.prisma.deal.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Deal not found');
    }

    const { contactIds, companyIds, closeDate, ...rest } = dto;

    const data: any = { ...rest };
    if (closeDate !== undefined) {
      data.closeDate = new Date(closeDate);
    }

    if (contactIds) {
      data.contacts = {
        deleteMany: {},
        create: contactIds.map((contactId: string) => ({ contactId })),
      };
    }

    if (companyIds) {
      data.companies = {
        deleteMany: {},
        create: companyIds.map((companyId: string) => ({ companyId })),
      };
    }

    return this.prisma.deal.update({
      where: { id },
      data,
      include: this.dealInclude,
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.deal.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Deal not found');
    }

    await this.prisma.deal.delete({ where: { id } });
  }

  async moveStage(id: string, stageId: string) {
    const deal = await this.prisma.deal.findUnique({
      where: { id },
      include: { stage: true },
    });
    if (!deal) {
      throw new NotFoundException('Deal not found');
    }

    const newStage = await this.prisma.stage.findUnique({ where: { id: stageId } });
    if (!newStage) {
      throw new NotFoundException('Stage not found');
    }

    if (newStage.pipelineId !== deal.pipelineId) {
      throw new BadRequestException('Stage does not belong to the same pipeline');
    }

    const data: any = { stageId };
    if (newStage.isLost) {
      data.lostReason = data.lostReason || null;
    }

    return this.prisma.deal.update({
      where: { id },
      data: { stageId },
      include: this.dealInclude,
    });
  }

  async forecast(query: ForecastQueryDto) {
    const period = query.period || 'month';
    let dateFormat: string;

    switch (period) {
      case 'quarter':
        dateFormat = 'YYYY-"Q"Q';
        break;
      case 'year':
        dateFormat = 'YYYY';
        break;
      default:
        dateFormat = 'YYYY-MM';
    }

    const pipelineFilter = query.pipelineId
      ? Prisma.sql`AND d."pipelineId" = ${query.pipelineId}`
      : Prisma.sql``;

    const results = await this.prisma.$queryRaw`
      SELECT
        to_char(d."closeDate", ${dateFormat}) as period,
        SUM(d.amount * s.probability / 100) as weighted_amount,
        SUM(d.amount) as total_amount,
        COUNT(d.id) as deal_count
      FROM deals d
      JOIN stages s ON d."stageId" = s.id
      WHERE d."closeDate" IS NOT NULL
        AND s."isWon" = false
        AND s."isLost" = false
        ${pipelineFilter}
      GROUP BY period
      ORDER BY period ASC
    `;

    return (results as any[]).map((r) => ({
      period: r.period,
      weightedAmount: Number(r.weighted_amount),
      totalAmount: Number(r.total_amount),
      dealCount: Number(r.deal_count),
    }));
  }
}
