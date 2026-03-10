import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateContactDto, UpdateContactDto, ContactQueryDto, BulkContactActionDto } from './dto';

@Injectable()
export class ContactsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateContactDto, userId: string) {
    try {
      return await this.prisma.contact.create({
        data: {
          ...dto,
          lifecycleStage: (dto.lifecycleStage as any) || 'SUBSCRIBER',
          ownerId: userId,
        },
        include: {
          company: true,
          owner: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('A contact with this email already exists');
      }
      throw error;
    }
  }

  async findAll(query: ContactQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 25;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.lifecycleStage) {
      where.lifecycleStage = query.lifecycleStage;
    }
    if (query.ownerId) {
      where.ownerId = query.ownerId;
    }
    if (query.companyId) {
      where.companyId = query.companyId;
    }

    if (query.search) {
      const searchIds: { id: string }[] = await this.prisma.$queryRawUnsafe(
        `SELECT id FROM contacts WHERE search_vector @@ plainto_tsquery('english', $1)`,
        query.search,
      );
      where.id = { in: searchIds.map((r) => r.id) };
    }

    let orderBy: any = { createdAt: 'desc' };
    if (query.sort) {
      const direction = query.sort.startsWith('-') ? 'desc' : 'asc';
      const field = query.sort.replace(/^-/, '');
      orderBy = { [field]: direction };
    }

    const [data, total] = await Promise.all([
      this.prisma.contact.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          company: true,
          owner: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
      }),
      this.prisma.contact.count({ where }),
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
    const contact = await this.prisma.contact.findUnique({
      where: { id },
      include: {
        company: true,
        owner: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!contact) {
      throw new NotFoundException('Contact not found');
    }

    return contact;
  }

  async update(id: string, dto: UpdateContactDto) {
    const existing = await this.prisma.contact.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Contact not found');
    }

    try {
      return await this.prisma.contact.update({
        where: { id },
        data: dto as any,
        include: {
          company: true,
          owner: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('A contact with this email already exists');
      }
      throw error;
    }
  }

  async remove(id: string) {
    const existing = await this.prisma.contact.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Contact not found');
    }

    await this.prisma.contact.delete({ where: { id } });
  }

  async bulkAction(dto: BulkContactActionDto) {
    const { ids, action } = dto;

    switch (action) {
      case 'assignOwner': {
        if (!dto.ownerId) {
          throw new BadRequestException('ownerId is required for assignOwner action');
        }
        const result = await this.prisma.contact.updateMany({
          where: { id: { in: ids } },
          data: { ownerId: dto.ownerId },
        });
        return { count: result.count };
      }
      case 'updateLifecycleStage': {
        if (!dto.lifecycleStage) {
          throw new BadRequestException('lifecycleStage is required for updateLifecycleStage action');
        }
        const result = await this.prisma.contact.updateMany({
          where: { id: { in: ids } },
          data: { lifecycleStage: dto.lifecycleStage as any },
        });
        return { count: result.count };
      }
      case 'delete': {
        const result = await this.prisma.contact.deleteMany({
          where: { id: { in: ids } },
        });
        return { count: result.count };
      }
      default:
        throw new BadRequestException(`Unknown action: ${action}`);
    }
  }
}
