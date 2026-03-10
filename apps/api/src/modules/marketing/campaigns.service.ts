import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateCampaignDto, UpdateCampaignDto, MarketingQueryDto } from './dto';

@Injectable()
export class CampaignsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCampaignDto) {
    const { contactListIds, ...campaignData } = dto;

    return this.prisma.campaign.create({
      data: {
        ...campaignData,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
        campaignLists: contactListIds?.length
          ? {
              create: contactListIds.map((contactListId) => ({
                contactListId,
              })),
            }
          : undefined,
      },
      include: {
        template: true,
        campaignLists: { include: { contactList: true } },
      },
    });
  }

  async findAll(query: MarketingQueryDto & { status?: string }) {
    const page = query.page || 1;
    const limit = query.limit || 25;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.search) {
      where.name = { contains: query.search, mode: 'insensitive' };
    }

    if (query.status) {
      where.status = query.status;
    }

    let orderBy: any = { createdAt: 'desc' };
    if (query.sort) {
      const direction = query.sort.startsWith('-') ? 'desc' : 'asc';
      const field = query.sort.replace(/^-/, '');
      orderBy = { [field]: direction };
    }

    const [data, total] = await Promise.all([
      this.prisma.campaign.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          template: true,
          campaignLists: { include: { contactList: true } },
        },
      }),
      this.prisma.campaign.count({ where }),
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
    const campaign = await this.prisma.campaign.findUnique({
      where: { id },
      include: {
        template: true,
        campaignLists: { include: { contactList: true } },
      },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    return campaign;
  }

  async update(id: string, dto: UpdateCampaignDto) {
    const existing = await this.prisma.campaign.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Campaign not found');
    }

    const { contactListIds, ...updateData } = dto;

    if (contactListIds) {
      await this.prisma.campaignList.deleteMany({
        where: { campaignId: id },
      });
    }

    return this.prisma.campaign.update({
      where: { id },
      data: {
        ...updateData,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
        campaignLists: contactListIds
          ? {
              create: contactListIds.map((contactListId) => ({
                contactListId,
              })),
            }
          : undefined,
      },
      include: {
        template: true,
        campaignLists: { include: { contactList: true } },
      },
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.campaign.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Campaign not found');
    }

    await this.prisma.campaign.delete({ where: { id } });
  }
}
