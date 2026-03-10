import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import {
  CreateCustomPropertyDefinitionDto,
  SetCustomPropertyValueDto,
  CustomPropertyQueryDto,
} from './dto';

@Injectable()
export class CustomPropertiesService {
  constructor(private readonly prisma: PrismaService) {}

  async createDefinition(dto: CreateCustomPropertyDefinitionDto) {
    // Validate DROPDOWN requires options
    if (dto.fieldType === 'DROPDOWN' && (!dto.options || dto.options.length === 0)) {
      throw new BadRequestException(
        'options are required for DROPDOWN field type',
      );
    }

    try {
      return await this.prisma.customPropertyDefinition.create({
        data: {
          name: dto.name,
          label: dto.label,
          fieldType: dto.fieldType as any,
          entityType: dto.entityType as any,
          options: dto.fieldType === 'DROPDOWN' ? dto.options : undefined,
          isRequired: dto.isRequired || false,
        },
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException(
          `A custom property with name "${dto.name}" already exists for ${dto.entityType}`,
        );
      }
      throw error;
    }
  }

  async findDefinitions(query: CustomPropertyQueryDto) {
    const { page = 1, limit = 25, entityType } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (entityType) where.entityType = entityType;

    const [data, total] = await Promise.all([
      this.prisma.customPropertyDefinition.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.customPropertyDefinition.count({ where }),
    ]);

    return { data, meta: { total, page, limit } };
  }

  async setValue(dto: SetCustomPropertyValueDto) {
    // Validate definition exists
    const definition = await this.prisma.customPropertyDefinition.findUnique({
      where: { id: dto.definitionId },
    });
    if (!definition) {
      throw new NotFoundException('Custom property definition not found');
    }

    // Validate entityType matches
    if (definition.entityType !== dto.entityType) {
      throw new BadRequestException(
        `This property is defined for ${definition.entityType}, not ${dto.entityType}`,
      );
    }

    // Validate value based on fieldType
    this.validateValue(definition.fieldType, dto.value, definition.options as string[] | null);

    return this.prisma.customPropertyValue.upsert({
      where: {
        definitionId_entityType_entityId: {
          definitionId: dto.definitionId,
          entityType: dto.entityType as any,
          entityId: dto.entityId,
        },
      },
      update: { value: dto.value },
      create: {
        definitionId: dto.definitionId,
        entityType: dto.entityType as any,
        entityId: dto.entityId,
        value: dto.value,
      },
    });
  }

  async getValues(entityType: string, entityId: string) {
    return this.prisma.customPropertyValue.findMany({
      where: { entityType: entityType as any, entityId },
      include: { definition: true },
    });
  }

  private validateValue(
    fieldType: string,
    value: string,
    options: string[] | null,
  ) {
    switch (fieldType) {
      case 'NUMBER': {
        if (isNaN(Number(value))) {
          throw new BadRequestException(
            `Value "${value}" is not a valid number`,
          );
        }
        break;
      }
      case 'DATE': {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          throw new BadRequestException(
            `Value "${value}" is not a valid date`,
          );
        }
        break;
      }
      case 'DROPDOWN': {
        if (options && !options.includes(value)) {
          throw new BadRequestException(
            `Value "${value}" is not one of the allowed options: ${options.join(', ')}`,
          );
        }
        break;
      }
      // TEXT: no validation needed
    }
  }
}
