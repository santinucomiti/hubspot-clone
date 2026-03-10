import { Test, TestingModule } from '@nestjs/testing';
import { SearchService } from './search.service';
import { PrismaService } from '../prisma.service';

const mockPrisma: any = {
  $queryRaw: jest.fn(),
};

describe('SearchService', () => {
  let service: SearchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);
    jest.clearAllMocks();
  });

  it('should return results grouped by entity type', async () => {
    mockPrisma.$queryRaw
      .mockResolvedValueOnce([{ id: 'c1', firstName: 'John', lastName: 'Doe', email: 'john@test.com' }])
      .mockResolvedValueOnce([{ id: 'co1', name: 'Acme', domain: 'acme.com' }])
      .mockResolvedValueOnce([{ id: 'd1', name: 'Big Deal', amount: 5000 }])
      .mockResolvedValueOnce([{ id: 't1', subject: 'Login issue', status: 'OPEN' }]);

    const result = await service.search({ q: 'test' });

    expect(result.contacts).toHaveLength(1);
    expect(result.contacts[0].title).toBe('John Doe');
    expect(result.companies).toHaveLength(1);
    expect(result.companies[0].title).toBe('Acme');
    expect(result.deals).toHaveLength(1);
    expect(result.deals[0].title).toBe('Big Deal');
    expect(result.tickets).toHaveLength(1);
    expect(result.tickets[0].title).toBe('Login issue');
  });

  it('should filter by entity type when specified', async () => {
    mockPrisma.$queryRaw.mockResolvedValueOnce([
      { id: 'c1', firstName: 'Jane', lastName: 'Smith', email: 'jane@test.com' },
    ]);

    const result = await service.search({ q: 'jane', type: 'contacts' });

    expect(mockPrisma.$queryRaw).toHaveBeenCalledTimes(1);
    expect(result.contacts).toHaveLength(1);
    expect(result.companies).toHaveLength(0);
    expect(result.deals).toHaveLength(0);
    expect(result.tickets).toHaveLength(0);
  });

  it('should use provided limit', async () => {
    mockPrisma.$queryRaw
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);

    await service.search({ q: 'test', limit: '5' });

    expect(mockPrisma.$queryRaw).toHaveBeenCalledTimes(4);
  });

  it('should return empty arrays when no matches', async () => {
    mockPrisma.$queryRaw
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);

    const result = await service.search({ q: 'nonexistent' });

    expect(result.contacts).toHaveLength(0);
    expect(result.companies).toHaveLength(0);
    expect(result.deals).toHaveLength(0);
    expect(result.tickets).toHaveLength(0);
  });
});
