import { Controller, Get, Param, Res, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';
import { existsSync } from 'fs';

@Controller('proto')
export class ProtoController {
  @Get(':fileName')
  getProtoFile(@Param('fileName') fileName: string, @Res() res: Response) {
    const protoDir = process.env.NODE_ENV === 'production'
      ? join(process.cwd(), 'dist/protos')
      : join(process.cwd(), 'src/protos');

    const filePath = join(protoDir, fileName);

    // Kiểm tra xem file có tồn tại hay không
    if (!existsSync(filePath)) {
      throw new HttpException('File not found', HttpStatus.NOT_FOUND);
    }

    // Gửi file .proto về client
    res.sendFile(filePath);
  }
}
