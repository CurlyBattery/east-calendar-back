import { randomUUID } from 'node:crypto';

export class RefreshToken {
  constructor(
    private readonly uuid: string,
    private userId: string,
    private expiresAt: Date,
    private revoked: boolean = false,
    private readonly createdAt: Date = new Date(),
  ) {}

  static create(userId: string, expiresAt: Date) {
    return new RefreshToken(randomUUID(), userId, expiresAt);
  }

  getUuid(): string {
    return this.uuid;
  }

  getUserId(): string {
    return this.userId;
  }

  getExpiresAt(): Date {
    return this.expiresAt;
  }

  getRevoked(): boolean {
    return this.revoked;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  isExpires(): boolean {
    return this.expiresAt < new Date();
  }

  revoke() {
    this.revoked = true;
  }
}
