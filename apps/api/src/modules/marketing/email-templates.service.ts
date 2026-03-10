import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateEmailTemplateDto, UpdateEmailTemplateDto, MarketingQueryDto } from './dto';

@Injectable()
export class EmailTemplatesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateEmailTemplateDto) {
    return this.prisma.emailTemplate.create({
      data: dto,
    });
  }

  async findAll(query: MarketingQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 25;
    const skip = (page - 1) * limit;

    const where: any = {};

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
      this.prisma.emailTemplate.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.emailTemplate.count({ where }),
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
    const template = await this.prisma.emailTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      throw new NotFoundException('Email template not found');
    }

    return template;
  }

  async update(id: string, dto: UpdateEmailTemplateDto) {
    const existing = await this.prisma.emailTemplate.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Email template not found');
    }

    return this.prisma.emailTemplate.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.emailTemplate.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Email template not found');
    }

    await this.prisma.emailTemplate.delete({ where: { id } });
  }
}
