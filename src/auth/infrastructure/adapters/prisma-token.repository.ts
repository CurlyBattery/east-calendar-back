import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../prisma/prisma.service';
import { RefreshToken } from '../../domain/entities/refresh-token.entity';
import { TokenRepositoryPort } from '../../application/ports/token.repository';
import { PrismaTokenMapper } from './prisma-token.mapper';

@Injectable()
export class PrismaTokenRepository implements TokenRepositoryPort {
  constructor(
    private readonly prisma: PrismaService,
    private readonly prismaTokenMapper: PrismaTokenMapper,
  ) {}

  async findRefreshToken(userId: string): Promise<RefreshToken> {
    const findToken = await this.prisma.refreshToken.findUnique({
      where: { userId },
    });
    if (!findToken) return null;
    return this.prismaTokenMapper.toDomain(findToken);
  }

  async save(token: RefreshToken) {
    const data = {
      uuid: token.getUuid(),
      userId: token.getUserId(),
      expiresAt: token.getExpiresAt(),
      revoked: token.getRevoked(),
      createdAt: token.getCreatedAt(),
    };
    console.log(data);

    await this.prisma.refreshToken.upsert({
      where: { userId: data.userId },
      create: data,
      update: data,
    });

    return token;
  }
}
