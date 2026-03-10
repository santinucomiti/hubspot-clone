import { Test, TestingModule } from '@nestjs/testing';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';

const mockTicketsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  updateStatus: jest.fn(),
  addComment: jest.fn(),
  remove: jest.fn(),
};

describe('TicketsController', () => {
  let controller: TicketsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TicketsController],
      providers: [
        { provide: TicketsService, useValue: mockTicketsService },
      ],
    }).compile();

    controller = module.get<TicketsController>(TicketsController);
    jest.clearAllMocks();
  });

  it('should create a ticket with current user as owner', async () => {
    const dto = { subject: 'Login issue' };
    const user = { id: 'user-1' };
    const expected = { id: 'ticket-1', ...dto, ownerId: 'user-1' };
    mockTicketsService.create.mockResolvedValue(expected);

    const result = await controller.create(dto, user);

    expect(result).toEqual(expected);
    expect(mockTicketsService.create).toHaveBeenCalledWith(dto, 'user-1');
  });

  it('should return paginated tickets', async () => {
    const query = { page: 1, limit: 25 };
    const expected = { data: [], meta: { total: 0, page: 1, limit: 25 } };
    mockTicketsService.findAll.mockResolvedValue(expected);

    const result = await controller.findAll(query);

    expect(result).toEqual(expected);
    expect(mockTicketsService.findAll).toHaveBeenCalledWith(query);
  });

  it('should return a single ticket', async () => {
    const expected = { id: 'ticket-1', subject: 'Issue' };
    mockTicketsService.findById.mockResolvedValue(expected);

    const result = await controller.findOne('ticket-1');

    expect(result).toEqual(expected);
    expect(mockTicketsService.findById).toHaveBeenCalledWith('ticket-1');
  });

  it('should update a ticket', async () => {
    const dto = { subject: 'Updated' };
    const expected = { id: 'ticket-1', subject: 'Updated' };
    mockTicketsService.update.mockResolvedValue(expected);

    const result = await controller.update('ticket-1', dto);

    expect(result).toEqual(expected);
    expect(mockTicketsService.update).toHaveBeenCalledWith('ticket-1', dto);
  });

  it('should update ticket status', async () => {
    const dto = { status: 'IN_PROGRESS' };
    const user = { id: 'user-1' };
    const expected = { id: 'ticket-1', status: 'IN_PROGRESS' };
    mockTicketsService.updateStatus.mockResolvedValue(expected);

    const result = await controller.updateStatus('ticket-1', dto, user);

    expect(result).toEqual(expected);
    expect(mockTicketsService.updateStatus).toHaveBeenCalledWith('ticket-1', 'IN_PROGRESS', 'user-1');
  });

  it('should add a comment to a ticket', async () => {
    const dto = { body: 'Test comment' };
    const user = { id: 'user-1' };
    const expected = { id: 'comment-1', body: 'Test comment' };
    mockTicketsService.addComment.mockResolvedValue(expected);

    const result = await controller.addComment('ticket-1', dto, user);

    expect(result).toEqual(expected);
    expect(mockTicketsService.addComment).toHaveBeenCalledWith('ticket-1', dto, 'user-1');
  });

  it('should delete a ticket', async () => {
    mockTicketsService.remove.mockResolvedValue(undefined);

    await controller.remove('ticket-1');

    expect(mockTicketsService.remove).toHaveBeenCalledWith('ticket-1');
  });
});
