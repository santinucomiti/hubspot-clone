import { Test, TestingModule } from '@nestjs/testing';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

const mockSearchService = {
  search: jest.fn(),
};

describe('SearchController', () => {
  let controller: SearchController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SearchController],
      providers: [{ provide: SearchService, useValue: mockSearchService }],
    }).compile();

    controller = module.get<SearchController>(SearchController);
    jest.clearAllMocks();
  });

  it('should delegate search to service', async () => {
    const query = { q: 'test' };
    const expected = { contacts: [], companies: [], deals: [], tickets: [] };
    mockSearchService.search.mockResolvedValue(expected);

    const result = await controller.search(query as any);

    expect(mockSearchService.search).toHaveBeenCalledWith(query);
    expect(result).toEqual(expected);
  });

  it('should pass type and limit params to service', async () => {
    const query = { q: 'test', type: 'contacts', limit: '5' };
    const expected = { contacts: [{ id: 'c1', title: 'John', entityType: 'contact', url: '/contacts/c1' }], companies: [], deals: [], tickets: [] };
    mockSearchService.search.mockResolvedValue(expected);

    const result = await controller.search(query as any);

    expect(mockSearchService.search).toHaveBeenCalledWith(query);
    expect(result).toEqual(expected);
  });
});
