import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { UploadsService } from './uploads.service';
import { UploadQueryDto } from './dto';

@Controller('uploads')
@UseGuards(JwtAuthGuard)
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @UploadedFile() file: any,
    @Body('entityType') entityType: string,
    @Body('entityId') entityId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.uploadsService.createAttachment(file, entityType, entityId, userId);
  }

  @Get()
  findByEntity(@Query() query: UploadQueryDto) {
    return this.uploadsService.findByEntity(query.entityType, query.entityId);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.uploadsService.deleteAttachment(id, userId);
  }
}
