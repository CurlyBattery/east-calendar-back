import { UserId } from '../value-objects/user-id.vo';
import { Email } from '../value-objects/email.vo';

export class User {
  constructor(
    private readonly id: UserId,
    private email: Email,
    private passwordHash: string,
    private avatarUrl: string | null,
    private name: string,
    private readonly createdAt: Date,
  ) {}

  static create(
    name: string,
    email: string,
    passwordHash: string,
    avatarUrl?: string,
  ) {
    if (!name || name.trim().length < 2) {
      throw new Error('Name must be at least 2 characters long');
    }

    return new User(
      new UserId(),
      new Email(email),
      passwordHash,
      avatarUrl ?? null,
      name.trim(),
      new Date(),
    );
  }

  getId(): UserId {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getEmail(): Email {
    return this.email;
  }

  getAvatarUrl(): string | null {
    return this.avatarUrl;
  }

  getPasswordHash(): string {
    return this.passwordHash;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  updateName(name: string) {
    if (!name || name.trim().length < 2) {
      throw new Error('Name must be at least 2 characters long');
    }

    this.name = name;
  }

  updateEmail(email: string) {
    this.email = new Email(email);
  }

  getAccountAge(): number {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - this.createdAt.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
