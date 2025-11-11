import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class HashService {
  async hash(raw: string): Promise<string> {
    if (!raw) {
      throw new Error('Raw is required');
    }

    try {
      return bcrypt.hashSync(raw, 10);
    } catch (err: unknown) {
      console.log('Failed to hash ', err);
      throw new Error('Failed to hash');
    }
  }

  async verify(raw: string, hashed: string): Promise<boolean> {
    if (!raw || !hashed) {
      throw new Error('Raw and hashed is required');
    }

    try {
      return bcrypt.compare(raw, hashed);
    } catch (err: unknown) {
      console.log('Failed to verify ', err);
      throw new Error('Failed to verify');
    }
  }
}
