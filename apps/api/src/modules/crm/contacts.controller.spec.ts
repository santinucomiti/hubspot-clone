import { Test, TestingModule } from '@nestjs/testing';
import { ContactsController } from './contacts.controller';
import { ContactsService } from './contacts.service';

const mockContactsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  bulkAction: jest.fn(),
};

describe('ContactsController', () => {
  let controller: ContactsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContactsController],
      providers: [
        { provide: ContactsService, useValue: mockContactsService },
      ],
    }).compile();

    controller = module.get<ContactsController>(ContactsController);
    jest.clearAllMocks();
  });

  it('should create a contact with current user as owner', async () => {
    const dto = { firstName: 'John', lastName: 'Doe', email: 'john@example.com' };
    const user = { id: 'user-1' };
    const expected = { id: 'contact-1', ...dto, ownerId: 'user-1' };
    mockContactsService.create.mockResolvedValue(expected);

    const result = await controller.create(dto, user);

    expect(result).toEqual(expected);
    expect(mockContactsService.create).toHaveBeenCalledWith(dto, 'user-1');
  });

  it('should return paginated contacts', async () => {
    const query = { page: 1, limit: 25 };
    const expected = { data: [], meta: { total: 0, page: 1, limit: 25, totalPages: 0 } };
    mockContactsService.findAll.mockResolvedValue(expected);

    const result = await controller.findAll(query);

    expect(result).toEqual(expected);
    expect(mockContactsService.findAll).toHaveBeenCalledWith(query);
  });

  it('should return a single contact', async () => {
    const expected = { id: 'contact-1', firstName: 'John' };
    mockContactsService.findById.mockResolvedValue(expected);

    const result = await controller.findOne('contact-1');

    expect(result).toEqual(expected);
    expect(mockContactsService.findById).toHaveBeenCalledWith('contact-1');
  });

  it('should update a contact', async () => {
    const dto = { firstName: 'Updated' };
    const expected = { id: 'contact-1', firstName: 'Updated' };
    mockContactsService.update.mockResolvedValue(expected);

    const result = await controller.update('contact-1', dto);

    expect(result).toEqual(expected);
    expect(mockContactsService.update).toHaveBeenCalledWith('contact-1', dto);
  });

  it('should delete a contact', async () => {
    mockContactsService.remove.mockResolvedValue(undefined);

    await controller.remove('contact-1');

    expect(mockContactsService.remove).toHaveBeenCalledWith('contact-1');
  });

  it('should perform bulk action', async () => {
    const dto = { ids: ['c1', 'c2'], action: 'delete' };
    const expected = { count: 2 };
    mockContactsService.bulkAction.mockResolvedValue(expected);

    const result = await controller.bulkAction(dto);

    expect(result).toEqual(expected);
    expect(mockContactsService.bulkAction).toHaveBeenCalledWith(dto);
  });
});
