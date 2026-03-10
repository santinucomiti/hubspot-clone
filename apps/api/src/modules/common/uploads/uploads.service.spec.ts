import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { PrismaService } from '../prisma.service';
import * as fs from 'fs';

jest.mock('fs', () => ({
  existsSync: jest.fn().mockReturnValue(true),
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn(),
  unlinkSync: jest.fn(),
}));

const mockPrisma: any = {
  attachment: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn(),
  },
};

describe('UploadsService', () => {
  let service: UploadsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<UploadsService>(UploadsService);
    jest.clearAllMocks();
  });

  describe('createAttachment', () => {
    it('should write file and create attachment record', async () => {
      const file = {
        originalname: 'test.pdf',
        mimetype: 'application/pdf',
        size: 1024,
        buffer: Buffer.from('test'),
      } as any;

      const expected = {
        id: 'att1',
        fileName: 'test.pdf',
        mimeType: 'application/pdf',
        size: 1024,
      };
      mockPrisma.attachment.create.mockResolvedValue(expected);

      const result = await service.createAttachment(file, 'CONTACT', 'c1', 'u1');

      expect(fs.writeFileSync).toHaveBeenCalled();
      expect(mockPrisma.attachment.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          fileName: 'test.pdf',
          mimeType: 'application/pdf',
          size: 1024,
          entityType: 'CONTACT',
          entityId: 'c1',
          uploadedById: 'u1',
        }),
      });
      expect(result).toEqual(expected);
    });
  });

  describe('findByEntity', () => {
    it('should return attachments for entity', async () => {
      const attachments = [{ id: 'att1', fileName: 'test.pdf' }];
      mockPrisma.attachment.findMany.mockResolvedValue(attachments);

      const result = await service.findByEntity('CONTACT', 'c1');

      expect(result).toEqual(attachments);
      expect(mockPrisma.attachment.findMany).toHaveBeenCalledWith({
        where: { entityType: 'CONTACT', entityId: 'c1' },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('deleteAttachment', () => {
    it('should delete file and attachment record', async () => {
      const attachment = {
        id: 'att1',
        storagePath: '/tmp/test.pdf',
        uploadedById: 'u1',
      };
      mockPrisma.attachment.findUnique.mockResolvedValue(attachment);
      mockPrisma.attachment.delete.mockResolvedValue(attachment);
      (fs.existsSync as jest.Mock).mockReturnValue(true);

      const result = await service.deleteAttachment('att1', 'u1');

      expect(fs.unlinkSync).toHaveBeenCalledWith('/tmp/test.pdf');
      expect(mockPrisma.attachment.delete).toHaveBeenCalledWith({
        where: { id: 'att1' },
      });
      expect(result).toEqual(attachment);
    });

    it('should throw NotFoundException if attachment not found', async () => {
      mockPrisma.attachment.findUnique.mockResolvedValue(null);

      await expect(service.deleteAttachment('att999', 'u1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if user does not own attachment', async () => {
      mockPrisma.attachment.findUnique.mockResolvedValue({
        id: 'att1',
        uploadedById: 'u2',
      });

      await expect(service.deleteAttachment('att1', 'u1')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
