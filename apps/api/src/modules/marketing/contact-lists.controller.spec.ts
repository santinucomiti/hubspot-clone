import { Test, TestingModule } from '@nestjs/testing';
import { ContactListsController } from './contact-lists.controller';
import { ContactListsService } from './contact-lists.service';

const mockService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  addMembers: jest.fn(),
  removeMembers: jest.fn(),
  remove: jest.fn(),
};

describe('ContactListsController', () => {
  let controller: ContactListsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContactListsController],
      providers: [
        { provide: ContactListsService, useValue: mockService },
      ],
    }).compile();

    controller = module.get<ContactListsController>(ContactListsController);
    jest.clearAllMocks();
  });

  it('should create a contact list', async () => {
    const dto = { name: 'VIP', type: 'STATIC' };
    const expected = { id: 'list-1', ...dto };
    mockService.create.mockResolvedValue(expected);

    const result = await controller.create(dto);

    expect(result).toEqual(expected);
    expect(mockService.create).toHaveBeenCalledWith(dto);
  });

  it('should return paginated contact lists', async () => {
    const query = { page: 1, limit: 25 };
    const expected = { data: [], meta: { total: 0, page: 1, limit: 25, totalPages: 0 } };
    mockService.findAll.mockResolvedValue(expected);

    const result = await controller.findAll(query);

    expect(result).toEqual(expected);
    expect(mockService.findAll).toHaveBeenCalledWith(query);
  });

  it('should return a single contact list', async () => {
    const expected = { id: 'list-1', name: 'VIP' };
    mockService.findById.mockResolvedValue(expected);

    const result = await controller.findOne('list-1');

    expect(result).toEqual(expected);
    expect(mockService.findById).toHaveBeenCalledWith('list-1');
  });

  it('should add members to a contact list', async () => {
    const expected = { id: 'list-1', members: [{ contactId: 'c1' }] };
    mockService.addMembers.mockResolvedValue(expected);

    const result = await controller.addMembers('list-1', { contactIds: ['c1'] });

    expect(result).toEqual(expected);
    expect(mockService.addMembers).toHaveBeenCalledWith('list-1', ['c1']);
  });

  it('should remove members from a contact list', async () => {
    const expected = { id: 'list-1', members: [] };
    mockService.removeMembers.mockResolvedValue(expected);

    const result = await controller.removeMembers('list-1', { contactIds: ['c1'] });

    expect(result).toEqual(expected);
    expect(mockService.removeMembers).toHaveBeenCalledWith('list-1', ['c1']);
  });

  it('should delete a contact list', async () => {
    mockService.remove.mockResolvedValue(undefined);

    await controller.remove('list-1');

    expect(mockService.remove).toHaveBeenCalledWith('list-1');
  });
});
