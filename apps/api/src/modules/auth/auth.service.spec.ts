import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { PrismaService } from '../common/prisma.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

jest.mock('bcrypt');

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
  },
  refreshToken: {
    create: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
  },
};

const mockJwt = {
  signAsync: jest.fn(),
};

const mockConfig = {
  get: jest.fn((key: string) => {
    const config: Record<string, string> = {
      JWT_SECRET: 'test-secret',
      JWT_EXPIRES_IN: '15m',
      JWT_REFRESH_EXPIRES_IN: '7d',
    };
    return config[key];
  }),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerDto = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
    };

    it('should register the first user as ADMIN', async () => {
      mockPrisma.user.count.mockResolvedValue(0);
      mockPrisma.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      mockPrisma.user.create.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'ADMIN',
      });
      mockJwt.signAsync.mockResolvedValue('jwt-token');
      mockPrisma.refreshToken.create.mockResolvedValue({});

      const result = await service.register(registerDto);

      expect(mockPrisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ role: 'ADMIN' }),
        }),
      );
      expect(result.user.role).toBe('ADMIN');
      expect(result.tokens).toBeDefined();
    });

    it('should register subsequent users as MEMBER', async () => {
      mockPrisma.user.count.mockResolvedValue(1);
      mockPrisma.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      mockPrisma.user.create.mockResolvedValue({
        id: 'user-2',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'MEMBER',
      });
      mockJwt.signAsync.mockResolvedValue('jwt-token');
      mockPrisma.refreshToken.create.mockResolvedValue({});

      const result = await service.register(registerDto);

      expect(mockPrisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ role: 'MEMBER' }),
        }),
      );
      expect(result.user.role).toBe('MEMBER');
    });

    it('should throw ConflictException if email exists', async () => {
      mockPrisma.user.count.mockResolvedValue(1);
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'existing' });

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('login', () => {
    const loginDto = { email: 'test@example.com', password: 'password123' };

    it('should return tokens for valid credentials', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        password: 'hashed-password',
        firstName: 'Test',
        lastName: 'User',
        role: 'MEMBER',
        isActive: true,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwt.signAsync.mockResolvedValue('jwt-token');
      mockPrisma.refreshToken.create.mockResolvedValue({});

      const result = await service.login(loginDto);

      expect(result.tokens).toBeDefined();
      expect(result.user.email).toBe('test@example.com');
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        password: 'hashed-password',
        isActive: true,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for inactive user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        password: 'hashed-password',
        isActive: false,
      });

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('refreshTokens', () => {
    it('should return new tokens for valid refresh token', async () => {
      const rawToken = 'valid-refresh-token';
      const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

      mockPrisma.refreshToken.findUnique.mockResolvedValue({
        id: 'rt-1',
        token: hashedToken,
        expiresAt: new Date(Date.now() + 86400000),
        user: {
          id: 'user-1',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          role: 'MEMBER',
          isActive: true,
        },
      });
      mockPrisma.refreshToken.delete.mockResolvedValue({});
      mockJwt.signAsync.mockResolvedValue('new-jwt-token');
      mockPrisma.refreshToken.create.mockResolvedValue({});

      const result = await service.refreshTokens(rawToken);

      expect(result.tokens).toBeDefined();
      expect(mockPrisma.refreshToken.findUnique).toHaveBeenCalledWith({
        where: { token: hashedToken },
        include: { user: true },
      });
      expect(mockPrisma.refreshToken.delete).toHaveBeenCalledWith({
        where: { id: 'rt-1' },
      });
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      mockPrisma.refreshToken.findUnique.mockResolvedValue(null);

      await expect(
        service.refreshTokens('invalid-token'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for expired refresh token', async () => {
      const rawToken = 'expired-token';
      const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

      mockPrisma.refreshToken.findUnique.mockResolvedValue({
        id: 'rt-1',
        token: hashedToken,
        expiresAt: new Date(Date.now() - 86400000),
        user: { id: 'user-1', isActive: true },
      });
      mockPrisma.refreshToken.delete.mockResolvedValue({});

      await expect(
        service.refreshTokens(rawToken),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('forgotPassword', () => {
    it('should generate reset token for existing user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
      });
      mockPrisma.user.update.mockResolvedValue({});

      await expect(
        service.forgotPassword({ email: 'test@example.com' }),
      ).resolves.toEqual({ message: 'If the email exists, a reset link has been sent' });
    });

    it('should not reveal if email does not exist', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.forgotPassword({ email: 'nonexistent@example.com' }),
      ).resolves.toEqual({ message: 'If the email exists, a reset link has been sent' });
    });
  });

  describe('resetPassword', () => {
    it('should reset password with valid token', async () => {
      const rawToken = 'valid-reset-token';
      const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'user-1',
        resetToken: hashedToken,
        resetTokenExpiresAt: new Date(Date.now() + 3600000),
      });
      (bcrypt.hash as jest.Mock).mockResolvedValue('new-hashed-password');
      mockPrisma.user.update.mockResolvedValue({});
      mockPrisma.refreshToken.deleteMany.mockResolvedValue({});

      await expect(
        service.resetPassword({ token: rawToken, newPassword: 'newpassword123' }),
      ).resolves.toEqual({ message: 'Password reset successfully' });
    });

    it('should throw UnauthorizedException for invalid reset token', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);

      await expect(
        service.resetPassword({ token: 'invalid', newPassword: 'newpassword123' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
