import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';

@Injectable()
export class HashService {
  async hash(raw: string): Promise<string> {
    if (!raw) {
      throw new Error('Raw is required');
    }

    try {
      return argon2.hash(raw);
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
      return argon2.verify(hashed, raw);
    } catch (err: unknown) {
      console.log('Failed to verify ', err);
      throw new Error('Failed to verify');
    }
  }
}
