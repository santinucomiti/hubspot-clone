import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { PrismaService } from '../common/prisma.service';

const mockPrisma: any = {
  ticket: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  ticketComment: {
    create: jest.fn(),
  },
  ticketStatusHistory: {
    create: jest.fn(),
  },
  $transaction: jest.fn(),
};

describe('TicketsService', () => {
  let service: TicketsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<TicketsService>(TicketsService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a ticket with defaults', async () => {
      const dto = { subject: 'Login issue' };
      const expected = {
        id: 'ticket-1',
        subject: 'Login issue',
        status: 'OPEN',
        priority: 'MEDIUM',
        source: 'MANUAL',
        ownerId: 'user-1',
      };
      mockPrisma.ticket.create.mockResolvedValue(expected);

      const result = await service.create(dto, 'user-1');

      expect(result).toEqual(expected);
      expect(mockPrisma.ticket.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          subject: 'Login issue',
          priority: 'MEDIUM',
          source: 'MANUAL',
          ownerId: 'user-1',
        }),
        include: expect.objectContaining({
          owner: expect.any(Object),
          contact: expect.any(Object),
          company: expect.any(Object),
          _count: expect.any(Object),
        }),
      });
    });
  });

  describe('findAll', () => {
    const mockTickets = [
      { id: 'ticket-1', subject: 'Issue 1' },
      { id: 'ticket-2', subject: 'Issue 2' },
    ];

    it('should return paginated tickets', async () => {
      mockPrisma.ticket.findMany.mockResolvedValue(mockTickets);
      mockPrisma.ticket.count.mockResolvedValue(2);

      const result = await service.findAll({ page: 1, limit: 25 });

      expect(result.data).toEqual(mockTickets);
      expect(result.meta.total).toBe(2);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(25);
    });

    it('should filter by status', async () => {
      mockPrisma.ticket.findMany.mockResolvedValue([]);
      mockPrisma.ticket.count.mockResolvedValue(0);

      await service.findAll({ status: 'OPEN' });

      expect(mockPrisma.ticket.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'OPEN' }),
        }),
      );
    });

    it('should filter by priority', async () => {
      mockPrisma.ticket.findMany.mockResolvedValue([]);
      mockPrisma.ticket.count.mockResolvedValue(0);

      await service.findAll({ priority: 'HIGH' });

      expect(mockPrisma.ticket.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ priority: 'HIGH' }),
        }),
      );
    });
  });

  describe('findById', () => {
    it('should return a ticket with comments and history', async () => {
      const ticket = { id: 'ticket-1', subject: 'Issue', comments: [], statusHistory: [] };
      mockPrisma.ticket.findUnique.mockResolvedValue(ticket);

      const result = await service.findById('ticket-1');

      expect(result).toEqual(ticket);
    });

    it('should throw NotFoundException', async () => {
      mockPrisma.ticket.findUnique.mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a ticket', async () => {
      mockPrisma.ticket.findUnique.mockResolvedValue({ id: 'ticket-1' });
      const updated = { id: 'ticket-1', subject: 'Updated subject' };
      mockPrisma.ticket.update.mockResolvedValue(updated);

      const result = await service.update('ticket-1', { subject: 'Updated subject' });

      expect(result).toEqual(updated);
    });

    it('should throw NotFoundException', async () => {
      mockPrisma.ticket.findUnique.mockResolvedValue(null);

      await expect(
        service.update('nonexistent', { subject: 'Updated' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStatus', () => {
    it('should update status and create history', async () => {
      const existing = { id: 'ticket-1', status: 'OPEN' };
      mockPrisma.ticket.findUnique.mockResolvedValue(existing);
      const updatedTicket = { id: 'ticket-1', status: 'IN_PROGRESS' };
      mockPrisma.$transaction.mockResolvedValue([updatedTicket, {}]);

      const result = await service.updateStatus('ticket-1', 'IN_PROGRESS', 'user-1');

      expect(result).toEqual(updatedTicket);
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it('should throw NotFoundException', async () => {
      mockPrisma.ticket.findUnique.mockResolvedValue(null);

      await expect(
        service.updateStatus('nonexistent', 'CLOSED', 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('addComment', () => {
    it('should add a comment to a ticket', async () => {
      mockPrisma.ticket.findUnique.mockResolvedValue({ id: 'ticket-1' });
      const comment = {
        id: 'comment-1',
        body: 'Test comment',
        isInternal: false,
        authorId: 'user-1',
      };
      mockPrisma.ticketComment.create.mockResolvedValue(comment);

      const result = await service.addComment('ticket-1', { body: 'Test comment' }, 'user-1');

      expect(result).toEqual(comment);
      expect(mockPrisma.ticketComment.create).toHaveBeenCalledWith({
        data: {
          ticketId: 'ticket-1',
          body: 'Test comment',
          isInternal: false,
          authorId: 'user-1',
        },
        include: {
          author: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      });
    });

    it('should throw NotFoundException for nonexistent ticket', async () => {
      mockPrisma.ticket.findUnique.mockResolvedValue(null);

      await expect(
        service.addComment('nonexistent', { body: 'Comment' }, 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a ticket', async () => {
      mockPrisma.ticket.findUnique.mockResolvedValue({ id: 'ticket-1' });
      mockPrisma.ticket.delete.mockResolvedValue({ id: 'ticket-1' });

      await expect(service.remove('ticket-1')).resolves.not.toThrow();
    });

    it('should throw NotFoundException', async () => {
      mockPrisma.ticket.findUnique.mockResolvedValue(null);

      await expect(service.remove('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});
