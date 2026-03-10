import { Test, TestingModule } from '@nestjs/testing';
import { CustomPropertiesController } from './custom-properties.controller';
import { CustomPropertiesService } from './custom-properties.service';

const mockCustomPropertiesService = {
  createDefinition: jest.fn(),
  findDefinitions: jest.fn(),
  setValue: jest.fn(),
  getValues: jest.fn(),
};

describe('CustomPropertiesController', () => {
  let controller: CustomPropertiesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomPropertiesController],
      providers: [
        {
          provide: CustomPropertiesService,
          useValue: mockCustomPropertiesService,
        },
      ],
    }).compile();

    controller = module.get<CustomPropertiesController>(
      CustomPropertiesController,
    );
    jest.clearAllMocks();
  });

  describe('createDefinition', () => {
    it('should create a custom property definition', async () => {
      const dto = {
        name: 'priority',
        label: 'Priority',
        fieldType: 'TEXT',
        entityType: 'CONTACT',
      };
      const expected = { id: 'def-1', ...dto };
      mockCustomPropertiesService.createDefinition.mockResolvedValue(expected);

      const result = await controller.createDefinition(dto);

      expect(mockCustomPropertiesService.createDefinition).toHaveBeenCalledWith(
        dto,
      );
      expect(result).toEqual(expected);
    });
  });

  describe('findDefinitions', () => {
    it('should return paginated definitions', async () => {
      const expected = {
        data: [{ id: 'def-1' }],
        meta: { total: 1, page: 1, limit: 25 },
      };
      mockCustomPropertiesService.findDefinitions.mockResolvedValue(expected);

      const result = await controller.findDefinitions({ page: 1, limit: 25 });

      expect(result).toEqual(expected);
    });
  });

  describe('setValue', () => {
    it('should set a custom property value', async () => {
      const dto = {
        definitionId: 'def-1',
        entityType: 'CONTACT',
        entityId: 'contact-1',
        value: 'Enterprise',
      };
      const expected = { id: 'val-1', ...dto };
      mockCustomPropertiesService.setValue.mockResolvedValue(expected);

      const result = await controller.setValue(dto);

      expect(mockCustomPropertiesService.setValue).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });
  });

  describe('getValues', () => {
    it('should return custom property values for an entity', async () => {
      const expected = [{ id: 'val-1', value: 'Enterprise' }];
      mockCustomPropertiesService.getValues.mockResolvedValue(expected);

      const result = await controller.getValues('CONTACT', 'contact-1');

      expect(mockCustomPropertiesService.getValues).toHaveBeenCalledWith(
        'CONTACT',
        'contact-1',
      );
      expect(result).toEqual(expected);
    });
  });
});
