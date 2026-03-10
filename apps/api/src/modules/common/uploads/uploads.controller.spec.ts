import { Test, TestingModule } from '@nestjs/testing';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';

const mockService = {
  createAttachment: jest.fn(),
  findByEntity: jest.fn(),
  deleteAttachment: jest.fn(),
};

describe('UploadsController', () => {
  let controller: UploadsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UploadsController],
      providers: [{ provide: UploadsService, useValue: mockService }],
    }).compile();

    controller = module.get<UploadsController>(UploadsController);
    jest.clearAllMocks();
  });

  it('should upload a file', async () => {
    const file = {
      originalname: 'test.pdf',
      mimetype: 'application/pdf',
      size: 1024,
      buffer: Buffer.from('test'),
    } as any;
    const expected = { id: 'att1', fileName: 'test.pdf' };
    mockService.createAttachment.mockResolvedValue(expected);

    const result = await controller.upload(file, 'CONTACT', 'c1', 'u1');

    expect(mockService.createAttachment).toHaveBeenCalledWith(
      file,
      'CONTACT',
      'c1',
      'u1',
    );
    expect(result).toEqual(expected);
  });

  it('should find attachments by entity', async () => {
    const attachments = [{ id: 'att1' }];
    mockService.findByEntity.mockResolvedValue(attachments);

    const result = await controller.findByEntity({
      entityType: 'CONTACT',
      entityId: 'c1',
    });

    expect(mockService.findByEntity).toHaveBeenCalledWith('CONTACT', 'c1');
    expect(result).toEqual(attachments);
  });

  it('should delete an attachment', async () => {
    const expected = { id: 'att1' };
    mockService.deleteAttachment.mockResolvedValue(expected);

    const result = await controller.delete('att1', 'u1');

    expect(mockService.deleteAttachment).toHaveBeenCalledWith('att1', 'u1');
    expect(result).toEqual(expected);
  });
});
