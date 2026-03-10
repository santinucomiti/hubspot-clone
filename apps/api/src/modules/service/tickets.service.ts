import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateTicketDto, UpdateTicketDto, TicketQueryDto, CreateTicketCommentDto } from './dto';

const ticketInclude = {
  owner: { select: { id: true, firstName: true, lastName: true, email: true } },
  contact: { select: { id: true, firstName: true, lastName: true, email: true } },
  company: { select: { id: true, name: true } },
  _count: { select: { comments: true } },
};

@Injectable()
export class TicketsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTicketDto, userId: string) {
    return this.prisma.ticket.create({
      data: {
        subject: dto.subject,
        description: dto.description,
        priority: (dto.priority as any) || 'MEDIUM',
        category: dto.category,
        source: (dto.source as any) || 'MANUAL',
        ownerId: userId,
        contactId: dto.contactId,
        companyId: dto.companyId,
        dealId: dto.dealId,
      },
      include: ticketInclude,
    });
  }

  async findAll(query: TicketQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 25;
    const skip = (page - 1) * limit;
    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.priority) where.priority = query.priority;
    if (query.ownerId) where.ownerId = query.ownerId;
    if (query.category) where.category = query.category;
    if (query.search) where.subject = { contains: query.search, mode: 'insensitive' };

    let orderBy: any = { createdAt: 'desc' };
    if (query.sort) {
      const [field, direction] = query.sort.split(':');
      if (field && (direction === 'asc' || direction === 'desc')) orderBy = { [field]: direction };
    }

    const [data, total] = await Promise.all([
      this.prisma.ticket.findMany({ where, include: ticketInclude, orderBy, skip, take: limit }),
      this.prisma.ticket.count({ where }),
    ]);
    return { data, meta: { total, page, limit } };
  }

  async findById(id: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: {
        ...ticketInclude,
        comments: {
          orderBy: { createdAt: 'asc' },
          include: {
            author: { select: { id: true, firstName: true, lastName: true, email: true } },
          },
        },
        statusHistory: { orderBy: { changedAt: 'desc' }, take: 20 },
      },
    });
    if (!ticket) throw new NotFoundException('Ticket not found');
    return ticket;
  }

  async update(id: string, dto: UpdateTicketDto) {
    const existing = await this.prisma.ticket.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Ticket not found');
    return this.prisma.ticket.update({
      where: { id },
      data: dto as any,
      include: ticketInclude,
    });
  }

  async updateStatus(id: string, status: string, userId: string) {
    const existing = await this.prisma.ticket.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Ticket not found');

    const [ticket] = await this.prisma.$transaction([
      this.prisma.ticket.update({
        where: { id },
        data: { status: status as any, statusChangedAt: new Date() },
        include: ticketInclude,
      }),
      this.prisma.ticketStatusHistory.create({
        data: {
          ticketId: id,
          fromStatus: existing.status,
          toStatus: status as any,
          changedById: userId,
        },
      }),
    ]);
    return ticket;
  }

  async addComment(ticketId: string, dto: CreateTicketCommentDto, userId: string) {
    const existing = await this.prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!existing) throw new NotFoundException('Ticket not found');
    return this.prisma.ticketComment.create({
      data: {
        ticketId,
        body: dto.body,
        isInternal: dto.isInternal ?? false,
        authorId: userId,
      },
      include: {
        author: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.ticket.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Ticket not found');
    return this.prisma.ticket.delete({ where: { id } });
  }
}
