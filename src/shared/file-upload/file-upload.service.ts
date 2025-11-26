import { Injectable } from '@nestjs/common';
import { join } from 'path';

@Injectable()
export class FileUploadService {
  getFilePath(filename: string): string {
    return join(process.cwd(), 'uploads', filename);
  }

  getPublicFilePath(filename: string): string {
    return '/uploads/' + filename;
  }
}
