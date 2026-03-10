import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { CustomPropertiesService } from './custom-properties.service';
import { PrismaService } from '../common/prisma.service';

const mockPrisma = {
  customPropertyDefinition: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    count: jest.fn(),
  },
  customPropertyValue: {
    upsert: jest.fn(),
    findMany: jest.fn(),
  },
};

describe('CustomPropertiesService', () => {
  let service: CustomPropertiesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomPropertiesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<CustomPropertiesService>(CustomPropertiesService);
    jest.clearAllMocks();
  });

  describe('createDefinition', () => {
    it('should create a TEXT property definition', async () => {
      const dto = {
        name: 'company_size',
        label: 'Company Size',
        fieldType: 'TEXT',
        entityType: 'CONTACT',
      };
      mockPrisma.customPropertyDefinition.create.mockResolvedValue({
        id: 'def-1',
        ...dto,
        options: null,
        isRequired: false,
      });

      const result = await service.createDefinition(dto);

      expect(mockPrisma.customPropertyDefinition.create).toHaveBeenCalledWith({
        data: {
          name: 'company_size',
          label: 'Company Size',
          fieldType: 'TEXT',
          entityType: 'CONTACT',
          options: undefined,
          isRequired: false,
        },
      });
      expect(result.id).toBe('def-1');
    });

    it('should create a DROPDOWN property definition with options', async () => {
      const dto = {
        name: 'priority',
        label: 'Priority',
        fieldType: 'DROPDOWN',
        entityType: 'CONTACT',
        options: ['Low', 'Medium', 'High'],
      };
      mockPrisma.customPropertyDefinition.create.mockResolvedValue({
        id: 'def-2',
        ...dto,
        isRequired: false,
      });

      const result = await service.createDefinition(dto);

      expect(mockPrisma.customPropertyDefinition.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          options: ['Low', 'Medium', 'High'],
        }),
      });
      expect(result.id).toBe('def-2');
    });

    it('should throw BadRequestException for DROPDOWN without options', async () => {
      const dto = {
        name: 'priority',
        label: 'Priority',
        fieldType: 'DROPDOWN',
        entityType: 'CONTACT',
      };

      await expect(service.createDefinition(dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw ConflictException for duplicate name+entityType', async () => {
      mockPrisma.customPropertyDefinition.create.mockRejectedValue({
        code: 'P2002',
      });

      await expect(
        service.createDefinition({
          name: 'existing',
          label: 'Existing',
          fieldType: 'TEXT',
          entityType: 'CONTACT',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findDefinitions', () => {
    it('should return paginated definitions', async () => {
      const definitions = [{ id: 'def-1', name: 'company_size' }];
      mockPrisma.customPropertyDefinition.findMany.mockResolvedValue(definitions);
      mockPrisma.customPropertyDefinition.count.mockResolvedValue(1);

      const result = await service.findDefinitions({ page: 1, limit: 25 });

      expect(result).toEqual({
        data: definitions,
        meta: { total: 1, page: 1, limit: 25 },
      });
    });

    it('should filter by entityType', async () => {
      mockPrisma.customPropertyDefinition.findMany.mockResolvedValue([]);
      mockPrisma.customPropertyDefinition.count.mockResolvedValue(0);

      await service.findDefinitions({
        page: 1,
        limit: 25,
        entityType: 'CONTACT',
      });

      expect(mockPrisma.customPropertyDefinition.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { entityType: 'CONTACT' },
        }),
      );
    });
  });

  describe('setValue', () => {
    it('should upsert a custom property value', async () => {
      mockPrisma.customPropertyDefinition.findUnique.mockResolvedValue({
        id: 'def-1',
        fieldType: 'TEXT',
        entityType: 'CONTACT',
        options: null,
      });
      mockPrisma.customPropertyValue.upsert.mockResolvedValue({
        id: 'val-1',
        definitionId: 'def-1',
        entityType: 'CONTACT',
        entityId: 'contact-1',
        value: 'Enterprise',
      });

      const result = await service.setValue({
        definitionId: 'def-1',
        entityType: 'CONTACT',
        entityId: 'contact-1',
        value: 'Enterprise',
      });

      expect(mockPrisma.customPropertyValue.upsert).toHaveBeenCalledWith({
        where: {
          definitionId_entityType_entityId: {
            definitionId: 'def-1',
            entityType: 'CONTACT',
            entityId: 'contact-1',
          },
        },
        update: { value: 'Enterprise' },
        create: {
          definitionId: 'def-1',
          entityType: 'CONTACT',
          entityId: 'contact-1',
          value: 'Enterprise',
        },
      });
      expect(result.value).toBe('Enterprise');
    });

    it('should throw NotFoundException for nonexistent definition', async () => {
      mockPrisma.customPropertyDefinition.findUnique.mockResolvedValue(null);

      await expect(
        service.setValue({
          definitionId: 'nonexistent',
          entityType: 'CONTACT',
          entityId: 'contact-1',
          value: 'test',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for entityType mismatch', async () => {
      mockPrisma.customPropertyDefinition.findUnique.mockResolvedValue({
        id: 'def-1',
        fieldType: 'TEXT',
        entityType: 'COMPANY',
      });

      await expect(
        service.setValue({
          definitionId: 'def-1',
          entityType: 'CONTACT',
          entityId: 'contact-1',
          value: 'test',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should validate NUMBER type values', async () => {
      mockPrisma.customPropertyDefinition.findUnique.mockResolvedValue({
        id: 'def-1',
        fieldType: 'NUMBER',
        entityType: 'CONTACT',
        options: null,
      });

      await expect(
        service.setValue({
          definitionId: 'def-1',
          entityType: 'CONTACT',
          entityId: 'contact-1',
          value: 'not-a-number',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should validate DROPDOWN value against allowed options', async () => {
      mockPrisma.customPropertyDefinition.findUnique.mockResolvedValue({
        id: 'def-1',
        fieldType: 'DROPDOWN',
        entityType: 'CONTACT',
        options: ['Low', 'Medium', 'High'],
      });

      await expect(
        service.setValue({
          definitionId: 'def-1',
          entityType: 'CONTACT',
          entityId: 'contact-1',
          value: 'Invalid',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should validate DATE type values', async () => {
      mockPrisma.customPropertyDefinition.findUnique.mockResolvedValue({
        id: 'def-1',
        fieldType: 'DATE',
        entityType: 'CONTACT',
        options: null,
      });

      await expect(
        service.setValue({
          definitionId: 'def-1',
          entityType: 'CONTACT',
          entityId: 'contact-1',
          value: 'not-a-date',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getValues', () => {
    it('should return custom property values for an entity', async () => {
      const values = [
        {
          id: 'val-1',
          definitionId: 'def-1',
          value: 'Enterprise',
          definition: { name: 'company_size', label: 'Company Size', fieldType: 'TEXT' },
        },
      ];
      mockPrisma.customPropertyValue.findMany.mockResolvedValue(values);

      const result = await service.getValues('CONTACT', 'contact-1');

      expect(mockPrisma.customPropertyValue.findMany).toHaveBeenCalledWith({
        where: { entityType: 'CONTACT', entityId: 'contact-1' },
        include: { definition: true },
      });
      expect(result).toEqual(values);
    });
  });
});
