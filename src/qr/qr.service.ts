import { Injectable } from '@nestjs/common';
import * as qrcode from 'qrcode';

@Injectable()
export class QRService {
  async generateQR(data: string) {
    try {
      const qrCodeBuff = await qrcode.toBuffer(data, {
        width: 512,
      });
      return qrCodeBuff;
    } catch (error) {
      throw new Error('Failed to generate QR code.');
    }
  }
}
