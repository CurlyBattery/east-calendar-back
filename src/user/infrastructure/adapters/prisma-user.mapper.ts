import { Injectable } from '@nestjs/common';
import { Mapper } from '@app/common';

import { User } from '../../domain/entities/user.entity';
import { User as DbUser } from 'generated/prisma';
import { UserId } from '../../domain/value-objects/user-id.vo';
import { Email } from '../../domain/value-objects/email.vo';

@Injectable()
export class PrismaUserMapper implements Mapper<User, DbUser> {
  toDomain(record: DbUser): User {
    return new User(
      new UserId(record.id),
      new Email(record.email),
      record.passwordHash,
      record.avatarUrl,
      record.name,
      record.createdAt,
    );
  }
  toPersistence(entity: User): DbUser {
    return {
      id: entity.getId().getValue(),
      email: entity.getEmail().getValue(),
      name: entity.getName(),
      passwordHash: entity.getPasswordHash(),
      avatarUrl: entity.getAvatarUrl(),
      createdAt: entity.getCreatedAt(),
    };
  }
}
