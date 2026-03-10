import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../common/prisma.service';

const mockPrisma = {
  user: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return users without passwords', async () => {
      mockPrisma.user.findMany.mockResolvedValue([
        { id: '1', email: 'admin@test.com', firstName: 'Admin', lastName: 'User', role: 'ADMIN', avatarUrl: null, isActive: true, createdAt: new Date() },
      ]);
      const result = await service.findAll();
      expect(result).toHaveLength(1);
      expect(result[0]).not.toHaveProperty('password');
    });
  });

  describe('findById', () => {
    it('should return a user by id', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: '1', email: 'test@test.com', firstName: 'Test', lastName: 'User', role: 'MEMBER', avatarUrl: null, isActive: true, createdAt: new Date() });
      const result = await service.findById('1');
      expect(result).toBeDefined();
      expect(result.email).toBe('test@test.com');
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateProfile', () => {
    it('should update user profile fields', async () => {
      mockPrisma.user.update.mockResolvedValue({ id: '1', email: 'test@test.com', firstName: 'Updated', lastName: 'User', role: 'MEMBER', avatarUrl: null, isActive: true, createdAt: new Date() });
      const result = await service.updateProfile('1', { firstName: 'Updated' });
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { firstName: 'Updated' },
        select: expect.objectContaining({ password: false }),
      });
      expect(result.firstName).toBe('Updated');
    });
  });

  describe('updateUser', () => {
    it('should update a user by id (admin)', async () => {
      mockPrisma.user.update.mockResolvedValue({ id: '1', email: 'admin@test.com', firstName: 'Updated', lastName: 'User', role: 'MANAGER', avatarUrl: null, isActive: true, createdAt: new Date() });
      const result = await service.updateUser('1', { firstName: 'Updated', role: 'MANAGER' as any });
      expect(result.role).toBe('MANAGER');
    });
  });
});
