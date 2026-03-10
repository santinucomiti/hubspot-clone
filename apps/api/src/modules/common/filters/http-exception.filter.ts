import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      let code: string;
      let message: string;
      let details: Record<string, string[]> | undefined;

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const resp = exceptionResponse as any;
        if (Array.isArray(resp.message)) {
          code = 'VALIDATION_ERROR';
          message = 'Validation failed';
          details = { validation: resp.message };
        } else {
          code = this.statusToCode(status);
          message = resp.message || exception.message;
        }
      } else {
        code = this.statusToCode(status);
        message = exceptionResponse as string;
      }

      const body: any = { error: { code, message } };
      if (details) {
        body.error.details = details;
      }
      response.status(status).json(body);
    } else {
      // Non-HTTP exceptions: return generic 500 without leaking details
      response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error',
        },
      });
    }
  }

  private statusToCode(status: number): string {
    const map: Record<number, string> = {
      [HttpStatus.BAD_REQUEST]: 'BAD_REQUEST',
      [HttpStatus.UNAUTHORIZED]: 'UNAUTHORIZED',
      [HttpStatus.FORBIDDEN]: 'FORBIDDEN',
      [HttpStatus.NOT_FOUND]: 'NOT_FOUND',
      [HttpStatus.CONFLICT]: 'CONFLICT',
      [HttpStatus.UNPROCESSABLE_ENTITY]: 'VALIDATION_ERROR',
      [HttpStatus.INTERNAL_SERVER_ERROR]: 'INTERNAL_ERROR',
    };
    return map[status] || 'ERROR';
  }
}
