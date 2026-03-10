import { Test, TestingModule } from '@nestjs/testing';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

const mockService = {
  getOverview: jest.fn(),
};

describe('DashboardController', () => {
  let controller: DashboardController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [{ provide: DashboardService, useValue: mockService }],
    }).compile();

    controller = module.get<DashboardController>(DashboardController);
    jest.clearAllMocks();
  });

  it('should return dashboard overview', async () => {
    const expected = {
      totalContacts: 100,
      totalCompanies: 50,
      totalDeals: 30,
      openTickets: 12,
      dealsByStage: [],
      recentActivities: [],
    };
    mockService.getOverview.mockResolvedValue(expected);

    const result = await controller.getOverview();

    expect(mockService.getOverview).toHaveBeenCalled();
    expect(result).toEqual(expected);
  });
});
