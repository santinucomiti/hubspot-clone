import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateActivityDto, ActivityQueryDto } from './dto';

const activityInclude = {
  createdBy: {
    select: { id: true, firstName: true, lastName: true, email: true },
  },
  contact: {
    select: { id: true, firstName: true, lastName: true, email: true },
  },
  company: {
    select: { id: true, name: true },
  },
};

@Injectable()
export class ActivitiesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateActivityDto, userId: string) {
    // At least one entity must be linked
    if (!dto.contactId && !dto.companyId && !dto.dealId && !dto.ticketId) {
      throw new BadRequestException(
        'At least one of contactId, companyId, dealId, or ticketId must be provided',
      );
    }

    const data: any = {
      type: dto.type,
      subject: dto.subject,
      body: dto.body,
      occurredAt: dto.occurredAt ? new Date(dto.occurredAt) : new Date(),
      createdById: userId,
      contactId: dto.contactId,
      companyId: dto.companyId,
      dealId: dto.dealId,
      ticketId: dto.ticketId,
    };

    // Type-specific fields
    if (dto.type === 'CALL' && dto.duration !== undefined) {
      data.duration = dto.duration;
    }
    if (dto.type === 'MEETING') {
      if (dto.startAt) data.startAt = new Date(dto.startAt);
      if (dto.endAt) data.endAt = new Date(dto.endAt);
    }
    if (dto.type === 'TASK') {
      if (dto.dueAt) data.dueAt = new Date(dto.dueAt);
      if (dto.completedAt) data.completedAt = new Date(dto.completedAt);
    }

    return this.prisma.activity.create({
      data,
      include: activityInclude,
    });
  }

  async findAll(query: ActivityQueryDto) {
    const { page = 1, limit = 25, sort, type, entityType, entityId } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (type) where.type = type;

    // Map entityType + entityId to the correct FK field
    if (entityType && entityId) {
      const entityFieldMap: Record<string, string> = {
        contact: 'contactId',
        company: 'companyId',
        deal: 'dealId',
        ticket: 'ticketId',
      };
      const field = entityFieldMap[entityType];
      if (field) {
        where[field] = entityId;
      }
    }

    let orderBy: any = { occurredAt: 'desc' };
    if (sort) {
      const [field, direction] = sort.split(':');
      if (field && (direction === 'asc' || direction === 'desc')) {
        orderBy = { [field]: direction };
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.activity.findMany({
        where,
        include: activityInclude,
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.activity.count({ where }),
    ]);

    return { data, meta: { total, page, limit } };
  }

  async findById(id: string) {
    const activity = await this.prisma.activity.findUnique({
      where: { id },
      include: activityInclude,
    });
    if (!activity) {
      throw new NotFoundException('Activity not found');
    }
    return activity;
  }
}
