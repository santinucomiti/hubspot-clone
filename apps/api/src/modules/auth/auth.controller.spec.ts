import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const mockAuthService = {
  register: jest.fn(),
  login: jest.fn(),
  refreshTokens: jest.fn(),
  forgotPassword: jest.fn(),
  resetPassword: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should call authService.register and return result', async () => {
      const dto = { email: 'test@example.com', password: 'password123', firstName: 'Test', lastName: 'User' };
      const expected = {
        user: { id: '1', email: dto.email, firstName: 'Test', lastName: 'User', role: 'ADMIN' },
        tokens: { accessToken: 'at', refreshToken: 'rt' },
      };
      mockAuthService.register.mockResolvedValue(expected);
      const result = await controller.register(dto);
      expect(mockAuthService.register).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });
  });

  describe('login', () => {
    it('should call authService.login and return result', async () => {
      const dto = { email: 'test@example.com', password: 'password123' };
      const expected = {
        user: { id: '1', email: dto.email, firstName: 'Test', lastName: 'User', role: 'MEMBER' },
        tokens: { accessToken: 'at', refreshToken: 'rt' },
      };
      mockAuthService.login.mockResolvedValue(expected);
      const result = await controller.login(dto);
      expect(mockAuthService.login).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });
  });

  describe('refresh', () => {
    it('should call authService.refreshTokens and return result', async () => {
      const dto = { refreshToken: 'valid-token' };
      const expected = {
        user: { id: '1', email: 'test@example.com', firstName: 'Test', lastName: 'User', role: 'MEMBER' },
        tokens: { accessToken: 'new-at', refreshToken: 'new-rt' },
      };
      mockAuthService.refreshTokens.mockResolvedValue(expected);
      const result = await controller.refresh(dto);
      expect(mockAuthService.refreshTokens).toHaveBeenCalledWith('valid-token');
      expect(result).toEqual(expected);
    });
  });

  describe('forgotPassword', () => {
    it('should call authService.forgotPassword', async () => {
      const dto = { email: 'test@example.com' };
      const expected = { message: 'If the email exists, a reset link has been sent' };
      mockAuthService.forgotPassword.mockResolvedValue(expected);
      const result = await controller.forgotPassword(dto);
      expect(mockAuthService.forgotPassword).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });
  });

  describe('resetPassword', () => {
    it('should call authService.resetPassword', async () => {
      const dto = { token: 'valid-token', newPassword: 'newpassword123' };
      const expected = { message: 'Password reset successfully' };
      mockAuthService.resetPassword.mockResolvedValue(expected);
      const result = await controller.resetPassword(dto);
      expect(mockAuthService.resetPassword).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });
  });
});
