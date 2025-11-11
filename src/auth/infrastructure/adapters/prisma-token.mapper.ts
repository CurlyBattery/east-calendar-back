import { Injectable } from '@nestjs/common';
import { Mapper } from '@app/common';
import { RefreshToken } from '../../domain/entities/refresh-token.entity';
import { RefreshToken as DbRefreshToken } from 'generated/prisma';

@Injectable()
export class PrismaTokenMapper implements Mapper<RefreshToken, DbRefreshToken> {
  toDomain(record: DbRefreshToken): RefreshToken {
    return new RefreshToken(
      record.uuid,
      record.userId,
      record.expiresAt,
      record.revoked,
      record.createdAt,
    );
  }

  toPersistence(entity: RefreshToken): DbRefreshToken {
    return {
      uuid: entity.getUuid(),
      userId: entity.getUserId(),
      expiresAt: entity.getExpiresAt(),
      revoked: entity.getRevoked(),
      createdAt: entity.getCreatedAt(),
    };
  }
}
