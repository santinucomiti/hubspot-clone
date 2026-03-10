import { HttpException, HttpStatus } from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;
  let mockResponse: any;
  let mockContext: any;

  beforeEach(() => {
    filter = new HttpExceptionFilter();
    mockResponse = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    mockContext = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => ({ url: '/api/test' }),
      }),
    } as any;
  });

  it('should format HttpException into error envelope', () => {
    const exception = new HttpException('Not Found', HttpStatus.NOT_FOUND);
    filter.catch(exception, mockContext);
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: { code: 'NOT_FOUND', message: 'Not Found' },
    });
  });

  it('should handle validation errors with field-level details', () => {
    const exception = new HttpException(
      { statusCode: 422, message: ['email must be an email', 'password is too short'], error: 'Unprocessable Entity' },
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
    filter.catch(exception, mockContext);
    expect(mockResponse.status).toHaveBeenCalledWith(422);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: { validation: ['email must be an email', 'password is too short'] },
      },
    });
  });
});
