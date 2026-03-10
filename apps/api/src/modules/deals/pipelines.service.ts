import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreatePipelineDto, UpdatePipelineDto } from './dto';

@Injectable()
export class PipelinesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.pipeline.findMany({
      include: { stages: { orderBy: { position: 'asc' } } },
    });
  }

  async findById(id: string) {
    const pipeline = await this.prisma.pipeline.findUnique({
      where: { id },
      include: { stages: { orderBy: { position: 'asc' } } },
    });
    if (!pipeline) throw new NotFoundException('Pipeline not found');
    return pipeline;
  }

  async create(dto: CreatePipelineDto) {
    if (dto.isDefault) {
      await this.prisma.pipeline.updateMany({ where: { isDefault: true }, data: { isDefault: false } });
    }
    return this.prisma.pipeline.create({
      data: {
        name: dto.name,
        isDefault: dto.isDefault ?? false,
        stages: {
          create: dto.stages.map((s) => ({
            name: s.name,
            position: s.position,
            probability: s.probability ?? 0,
            isWon: s.isWon ?? false,
            isLost: s.isLost ?? false,
          })),
        },
      },
      include: { stages: { orderBy: { position: 'asc' } } },
    });
  }

  async update(id: string, dto: UpdatePipelineDto) {
    const existing = await this.prisma.pipeline.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Pipeline not found');
    if (dto.isDefault) {
      await this.prisma.pipeline.updateMany({ where: { isDefault: true }, data: { isDefault: false } });
    }
    return this.prisma.pipeline.update({
      where: { id },
      data: dto,
      include: { stages: { orderBy: { position: 'asc' } } },
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.pipeline.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Pipeline not found');
    if (existing.isDefault) throw new BadRequestException('Cannot delete the default pipeline');
    return this.prisma.pipeline.delete({ where: { id } });
  }
}
