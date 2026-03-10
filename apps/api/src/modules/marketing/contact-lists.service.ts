import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateContactListDto, MarketingQueryDto } from './dto';

@Injectable()
export class ContactListsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateContactListDto) {
    return this.prisma.contactList.create({
      data: {
        name: dto.name,
        type: dto.type as any,
        filters: dto.filters ?? undefined,
      },
      include: { members: true },
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
      this.prisma.contactList.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: { _count: { select: { members: true } } },
      }),
      this.prisma.contactList.count({ where }),
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
    const list = await this.prisma.contactList.findUnique({
      where: { id },
      include: {
        members: { include: { contact: true } },
      },
    });

    if (!list) {
      throw new NotFoundException('Contact list not found');
    }

    return list;
  }

  async addMembers(id: string, contactIds: string[]) {
    const list = await this.prisma.contactList.findUnique({ where: { id } });
    if (!list) {
      throw new NotFoundException('Contact list not found');
    }

    const data = contactIds.map((contactId) => ({
      contactListId: id,
      contactId,
    }));

    await this.prisma.contactListMember.createMany({
      data,
      skipDuplicates: true,
    });

    return this.findById(id);
  }

  async removeMembers(id: string, contactIds: string[]) {
    const list = await this.prisma.contactList.findUnique({ where: { id } });
    if (!list) {
      throw new NotFoundException('Contact list not found');
    }

    await this.prisma.contactListMember.deleteMany({
      where: {
        contactListId: id,
        contactId: { in: contactIds },
      },
    });

    return this.findById(id);
  }

  async remove(id: string) {
    const list = await this.prisma.contactList.findUnique({ where: { id } });
    if (!list) {
      throw new NotFoundException('Contact list not found');
    }

    await this.prisma.contactList.delete({ where: { id } });
  }
}
