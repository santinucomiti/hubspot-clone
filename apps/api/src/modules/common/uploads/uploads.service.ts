import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as fs from 'fs';
import * as path from 'path';

export interface UploadedFileInfo {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@Injectable()
export class UploadsService {
  private readonly uploadDir = path.join(process.cwd(), 'uploads');

  constructor(private readonly prisma: PrismaService) {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async createAttachment(
    file: UploadedFileInfo,
    entityType: string,
    entityId: string,
    userId: string,
  ) {
    const storagePath = path.join(this.uploadDir, `${Date.now()}-${file.originalname}`);
    fs.writeFileSync(storagePath, file.buffer);

    return this.prisma.attachment.create({
      data: {
        fileName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        storagePath,
        entityType: entityType as any,
        entityId,
        uploadedById: userId,
      },
    });
  }

  async findByEntity(entityType: string, entityId: string) {
    return this.prisma.attachment.findMany({
      where: { entityType: entityType as any, entityId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteAttachment(id: string, userId: string) {
    const attachment = await this.prisma.attachment.findUnique({
      where: { id },
    });

    if (!attachment) {
      throw new NotFoundException('Attachment not found');
    }

    if (attachment.uploadedById !== userId) {
      throw new ForbiddenException('You can only delete your own attachments');
    }

    if (fs.existsSync(attachment.storagePath)) {
      fs.unlinkSync(attachment.storagePath);
    }

    return this.prisma.attachment.delete({ where: { id } });
  }
}
