import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EmailTemplatesService } from './email-templates.service';
import { PrismaService } from '../common/prisma.service';

const mockPrisma: any = {
  emailTemplate: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
};

describe('EmailTemplatesService', () => {
  let service: EmailTemplatesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailTemplatesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<EmailTemplatesService>(EmailTemplatesService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an email template', async () => {
      const dto = {
        name: 'Welcome Email',
        subject: 'Welcome!',
        htmlContent: '<h1>Welcome</h1>',
      };
      const expected = { id: 'tpl-1', ...dto };
      mockPrisma.emailTemplate.create.mockResolvedValue(expected);

      const result = await service.create(dto);

      expect(result).toEqual(expected);
      expect(mockPrisma.emailTemplate.create).toHaveBeenCalledWith({
        data: dto,
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated templates', async () => {
      const templates = [{ id: 'tpl-1', name: 'Welcome' }];
      mockPrisma.emailTemplate.findMany.mockResolvedValue(templates);
      mockPrisma.emailTemplate.count.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 25 });

      expect(result.data).toEqual(templates);
      expect(result.meta.total).toBe(1);
    });

    it('should apply search filter', async () => {
      mockPrisma.emailTemplate.findMany.mockResolvedValue([]);
      mockPrisma.emailTemplate.count.mockResolvedValue(0);

      await service.findAll({ search: 'Welcome' });

      expect(mockPrisma.emailTemplate.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { name: { contains: 'Welcome', mode: 'insensitive' } },
        }),
      );
    });
  });

  describe('findById', () => {
    it('should return a template', async () => {
      const template = { id: 'tpl-1', name: 'Welcome' };
      mockPrisma.emailTemplate.findUnique.mockResolvedValue(template);

      const result = await service.findById('tpl-1');

      expect(result).toEqual(template);
    });

    it('should throw NotFoundException', async () => {
      mockPrisma.emailTemplate.findUnique.mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a template', async () => {
      mockPrisma.emailTemplate.findUnique.mockResolvedValue({ id: 'tpl-1' });
      const updated = { id: 'tpl-1', name: 'Updated' };
      mockPrisma.emailTemplate.update.mockResolvedValue(updated);

      const result = await service.update('tpl-1', { name: 'Updated' });

      expect(result).toEqual(updated);
    });

    it('should throw NotFoundException', async () => {
      mockPrisma.emailTemplate.findUnique.mockResolvedValue(null);

      await expect(
        service.update('nonexistent', { name: 'Updated' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a template', async () => {
      mockPrisma.emailTemplate.findUnique.mockResolvedValue({ id: 'tpl-1' });
      mockPrisma.emailTemplate.delete.mockResolvedValue({ id: 'tpl-1' });

      await expect(service.remove('tpl-1')).resolves.not.toThrow();
    });

    it('should throw NotFoundException', async () => {
      mockPrisma.emailTemplate.findUnique.mockResolvedValue(null);

      await expect(service.remove('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
