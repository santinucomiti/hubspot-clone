import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ContactListsService } from './contact-lists.service';
import { PrismaService } from '../common/prisma.service';

const mockPrisma: any = {
  contactList: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  contactListMember: {
    createMany: jest.fn(),
    deleteMany: jest.fn(),
  },
};

describe('ContactListsService', () => {
  let service: ContactListsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContactListsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ContactListsService>(ContactListsService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a contact list', async () => {
      const dto = { name: 'VIP Customers', type: 'STATIC' };
      const expected = { id: 'list-1', ...dto, members: [] };
      mockPrisma.contactList.create.mockResolvedValue(expected);

      const result = await service.create(dto);

      expect(result).toEqual(expected);
      expect(mockPrisma.contactList.create).toHaveBeenCalledWith({
        data: { name: 'VIP Customers', type: 'STATIC', filters: undefined },
        include: { members: true },
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated contact lists', async () => {
      const lists = [{ id: 'list-1', name: 'VIP' }];
      mockPrisma.contactList.findMany.mockResolvedValue(lists);
      mockPrisma.contactList.count.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 25 });

      expect(result.data).toEqual(lists);
      expect(result.meta.total).toBe(1);
      expect(result.meta.page).toBe(1);
    });

    it('should apply search filter', async () => {
      mockPrisma.contactList.findMany.mockResolvedValue([]);
      mockPrisma.contactList.count.mockResolvedValue(0);

      await service.findAll({ search: 'VIP' });

      expect(mockPrisma.contactList.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { name: { contains: 'VIP', mode: 'insensitive' } },
        }),
      );
    });
  });

  describe('findById', () => {
    it('should return a contact list', async () => {
      const list = { id: 'list-1', name: 'VIP', members: [] };
      mockPrisma.contactList.findUnique.mockResolvedValue(list);

      const result = await service.findById('list-1');

      expect(result).toEqual(list);
    });

    it('should throw NotFoundException', async () => {
      mockPrisma.contactList.findUnique.mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('addMembers', () => {
    it('should add members to a contact list', async () => {
      const list = { id: 'list-1', name: 'VIP', members: [{ contactId: 'c1' }] };
      mockPrisma.contactList.findUnique.mockResolvedValue(list);
      mockPrisma.contactListMember.createMany.mockResolvedValue({ count: 2 });

      await service.addMembers('list-1', ['c1', 'c2']);

      expect(mockPrisma.contactListMember.createMany).toHaveBeenCalledWith({
        data: [
          { contactListId: 'list-1', contactId: 'c1' },
          { contactListId: 'list-1', contactId: 'c2' },
        ],
        skipDuplicates: true,
      });
    });

    it('should throw NotFoundException if list not found', async () => {
      mockPrisma.contactList.findUnique.mockResolvedValue(null);

      await expect(service.addMembers('nonexistent', ['c1'])).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('removeMembers', () => {
    it('should remove members from a contact list', async () => {
      const list = { id: 'list-1', name: 'VIP', members: [] };
      mockPrisma.contactList.findUnique.mockResolvedValue(list);
      mockPrisma.contactListMember.deleteMany.mockResolvedValue({ count: 1 });

      await service.removeMembers('list-1', ['c1']);

      expect(mockPrisma.contactListMember.deleteMany).toHaveBeenCalledWith({
        where: {
          contactListId: 'list-1',
          contactId: { in: ['c1'] },
        },
      });
    });
  });

  describe('remove', () => {
    it('should delete a contact list', async () => {
      mockPrisma.contactList.findUnique.mockResolvedValue({ id: 'list-1' });
      mockPrisma.contactList.delete.mockResolvedValue({ id: 'list-1' });

      await expect(service.remove('list-1')).resolves.not.toThrow();
    });

    it('should throw NotFoundException', async () => {
      mockPrisma.contactList.findUnique.mockResolvedValue(null);

      await expect(service.remove('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
