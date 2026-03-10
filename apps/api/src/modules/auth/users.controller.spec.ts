import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

const mockUsersService = {
  findAll: jest.fn(),
  findById: jest.fn(),
  updateProfile: jest.fn(),
  updateUser: jest.fn(),
};

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    }).compile();
    controller = module.get<UsersController>(UsersController);
    jest.clearAllMocks();
  });

  describe('listUsers', () => {
    it('should return a list of users', async () => {
      const users = [{ id: '1', email: 'admin@test.com', role: 'ADMIN' }];
      mockUsersService.findAll.mockResolvedValue(users);
      const result = await controller.listUsers();
      expect(result).toEqual(users);
    });
  });

  describe('getMyProfile', () => {
    it('should return current user profile', async () => {
      const user = { id: '1', email: 'test@test.com', role: 'MEMBER' };
      mockUsersService.findById.mockResolvedValue(user);
      const result = await controller.getMyProfile({ id: '1' });
      expect(mockUsersService.findById).toHaveBeenCalledWith('1');
      expect(result).toEqual(user);
    });
  });

  describe('updateMyProfile', () => {
    it('should update current user profile', async () => {
      const updated = { id: '1', firstName: 'Updated', email: 'test@test.com' };
      mockUsersService.updateProfile.mockResolvedValue(updated);
      const result = await controller.updateMyProfile({ id: '1' }, { firstName: 'Updated' });
      expect(mockUsersService.updateProfile).toHaveBeenCalledWith('1', { firstName: 'Updated' });
      expect(result).toEqual(updated);
    });
  });

  describe('updateUser', () => {
    it('should update a user by id', async () => {
      const updated = { id: '1', role: 'MANAGER' };
      mockUsersService.updateUser.mockResolvedValue(updated);
      const result = await controller.updateUser('1', { role: 'MANAGER' as any });
      expect(mockUsersService.updateUser).toHaveBeenCalledWith('1', { role: 'MANAGER' });
      expect(result).toEqual(updated);
    });
  });
});
