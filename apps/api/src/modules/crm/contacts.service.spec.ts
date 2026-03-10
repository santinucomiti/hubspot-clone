import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { PrismaService } from '../common/prisma.service';

const mockPrisma: any = {
  contact: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    updateMany: jest.fn(),
    deleteMany: jest.fn(),
  },
  $queryRawUnsafe: jest.fn(),
};

describe('ContactsService', () => {
  let service: ContactsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContactsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ContactsService>(ContactsService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDto = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '+1234567890',
    };

    it('should create a contact', async () => {
      const expected = {
        id: 'contact-1',
        ...createDto,
        lifecycleStage: 'SUBSCRIBER',
        ownerId: 'user-1',
      };
      mockPrisma.contact.create.mockResolvedValue(expected);

      const result = await service.create(createDto, 'user-1');

      expect(result).toEqual(expected);
      expect(mockPrisma.contact.create).toHaveBeenCalledWith({
        data: {
          ...createDto,
          lifecycleStage: 'SUBSCRIBER',
          ownerId: 'user-1',
        },
        include: { company: true, owner: { select: { id: true, firstName: true, lastName: true, email: true } } },
      });
    });

    it('should throw ConflictException for duplicate email', async () => {
      mockPrisma.contact.create.mockRejectedValue({ code: 'P2002' });

      await expect(service.create(createDto, 'user-1')).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    const mockContacts = [
      { id: 'contact-1', firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
      { id: 'contact-2', firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com' },
    ];

    it('should return paginated contacts', async () => {
      mockPrisma.contact.findMany.mockResolvedValue(mockContacts);
      mockPrisma.contact.count.mockResolvedValue(2);

      const result = await service.findAll({ page: 1, limit: 25 });

      expect(result.data).toEqual(mockContacts);
      expect(result.meta.total).toBe(2);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(25);
    });

    it('should apply lifecycle stage filter', async () => {
      mockPrisma.contact.findMany.mockResolvedValue([]);
      mockPrisma.contact.count.mockResolvedValue(0);

      await service.findAll({ page: 1, limit: 25, lifecycleStage: 'LEAD' });

      expect(mockPrisma.contact.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ lifecycleStage: 'LEAD' }),
        }),
      );
    });

    it('should apply owner filter', async () => {
      mockPrisma.contact.findMany.mockResolvedValue([]);
      mockPrisma.contact.count.mockResolvedValue(0);

      await service.findAll({ page: 1, limit: 25, ownerId: 'user-1' });

      expect(mockPrisma.contact.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ ownerId: 'user-1' }),
        }),
      );
    });

    it('should apply search via tsvector', async () => {
      mockPrisma.$queryRawUnsafe.mockResolvedValue([{ id: 'contact-1' }]);
      mockPrisma.contact.findMany.mockResolvedValue(mockContacts);
      mockPrisma.contact.count.mockResolvedValue(1);

      await service.findAll({ page: 1, limit: 25, search: 'John' });

      expect(mockPrisma.$queryRawUnsafe).toHaveBeenCalled();
    });

    it('should apply sorting', async () => {
      mockPrisma.contact.findMany.mockResolvedValue([]);
      mockPrisma.contact.count.mockResolvedValue(0);

      await service.findAll({ page: 1, limit: 25, sort: '-createdAt' });

      expect(mockPrisma.contact.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        }),
      );
    });
  });

  describe('findById', () => {
    it('should return a contact', async () => {
      const contact = { id: 'contact-1', firstName: 'John', lastName: 'Doe' };
      mockPrisma.contact.findUnique.mockResolvedValue(contact);

      const result = await service.findById('contact-1');

      expect(result).toEqual(contact);
    });

    it('should throw NotFoundException', async () => {
      mockPrisma.contact.findUnique.mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a contact', async () => {
      mockPrisma.contact.findUnique.mockResolvedValue({ id: 'contact-1' });
      const updated = { id: 'contact-1', firstName: 'Updated' };
      mockPrisma.contact.update.mockResolvedValue(updated);

      const result = await service.update('contact-1', { firstName: 'Updated' });

      expect(result).toEqual(updated);
    });

    it('should throw NotFoundException', async () => {
      mockPrisma.contact.findUnique.mockResolvedValue(null);

      await expect(
        service.update('nonexistent', { firstName: 'Updated' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException for duplicate email', async () => {
      mockPrisma.contact.findUnique.mockResolvedValue({ id: 'contact-1' });
      mockPrisma.contact.update.mockRejectedValue({ code: 'P2002' });

      await expect(
        service.update('contact-1', { email: 'taken@example.com' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should delete a contact', async () => {
      mockPrisma.contact.findUnique.mockResolvedValue({ id: 'contact-1' });
      mockPrisma.contact.delete.mockResolvedValue({ id: 'contact-1' });

      await expect(service.remove('contact-1')).resolves.not.toThrow();
    });

    it('should throw NotFoundException', async () => {
      mockPrisma.contact.findUnique.mockResolvedValue(null);

      await expect(service.remove('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('bulkAction', () => {
    it('should assign owner', async () => {
      mockPrisma.contact.updateMany.mockResolvedValue({ count: 2 });

      const result = await service.bulkAction({
        ids: ['c1', 'c2'],
        action: 'assignOwner',
        ownerId: 'user-1',
      });

      expect(result.count).toBe(2);
      expect(mockPrisma.contact.updateMany).toHaveBeenCalledWith({
        where: { id: { in: ['c1', 'c2'] } },
        data: { ownerId: 'user-1' },
      });
    });

    it('should update lifecycle stage', async () => {
      mockPrisma.contact.updateMany.mockResolvedValue({ count: 2 });

      const result = await service.bulkAction({
        ids: ['c1', 'c2'],
        action: 'updateLifecycleStage',
        lifecycleStage: 'LEAD',
      });

      expect(result.count).toBe(2);
    });

    it('should delete contacts', async () => {
      mockPrisma.contact.deleteMany.mockResolvedValue({ count: 2 });

      const result = await service.bulkAction({
        ids: ['c1', 'c2'],
        action: 'delete',
      });

      expect(result.count).toBe(2);
    });

    it('should throw for missing ownerId on assignOwner', async () => {
      await expect(
        service.bulkAction({ ids: ['c1'], action: 'assignOwner' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw for missing lifecycleStage on updateLifecycleStage', async () => {
      await expect(
        service.bulkAction({ ids: ['c1'], action: 'updateLifecycleStage' }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
