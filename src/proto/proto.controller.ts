import { Controller, Get, Param, Res, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';
import { existsSync, readdirSync } from 'fs';
import * as archiver from 'archiver';
import * as fs from 'fs/promises';


@Controller('proto')
export class ProtoController {
  
  @Get('/file/:fileName')
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

  @Get('all')
  async downloadAllProtos(@Res() res: Response) {
    const protoDir = process.env.NODE_ENV === 'production'
      ? join(process.cwd(), 'dist/protos')
      : join(process.cwd(), 'src/protos');

    if (!existsSync(protoDir)) {
      throw new HttpException('Protos directory not found', HttpStatus.NOT_FOUND);
    }

    // Cài đặt header trả về file ZIP
    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': 'attachment; filename=protos.zip',
    });

    // Tạo file ZIP
    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.pipe(res);

    // Đệ quy thêm tất cả file và thư mục vào file ZIP
    await this.addFilesToArchive(protoDir, archive);

    // Kết thúc quá trình nén
    archive.finalize();
  }

  private async addFilesToArchive(dirPath: string, archive: archiver.Archiver, basePath: string = ''): Promise<void> {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dirPath, entry.name);
      const relativePath = basePath ? `${basePath}/${entry.name}` : entry.name;

      if (entry.isDirectory()) {
        // Nếu là thư mục, tiếp tục đệ quy
        await this.addFilesToArchive(fullPath, archive, relativePath);
      } else if (entry.isFile() && entry.name.endsWith('.proto')) {
        // Nếu là file .proto, thêm vào archive
        archive.file(fullPath, { name: relativePath });
      }
    }
  }
}
