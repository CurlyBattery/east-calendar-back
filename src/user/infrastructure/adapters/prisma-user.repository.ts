import { Injectable } from '@nestjs/common';

import { UserRepositoryPort } from '../../application/ports/user.repository.port';
import { PrismaService } from '../../../prisma/prisma.service';
import { User } from '../../domain/entities/user.entity';
import { PrismaUserMapper } from './prisma-user.mapper';

@Injectable()
export class PrismaUserRepository implements UserRepositoryPort {
  constructor(
    private readonly prisma: PrismaService,
    private readonly prismaUserMapper: PrismaUserMapper,
  ) {}

  async save(user: User) {
    const data = {
      id: user.getId().getValue(),
      email: user.getEmail().getValue(),
      name: user.getName(),
      passwordHash: user.getPasswordHash(),
      avatarUrl: user.getAvatarUrl(),
      createdAt: user.getCreatedAt(),
    };

    await this.prisma.user.upsert({
      where: { id: data.id },
      update: data,
      create: data,
    });

    return user;
  }

  async findById(id: string) {
    const findUser = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!findUser) return null;
    return this.prismaUserMapper.toDomain(findUser);
  }

  async findByEmail(email: string) {
    const findUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!findUser) return null;
    return this.prismaUserMapper.toDomain(findUser);
  }

  async findAll() {
    const users = await this.prisma.user.findMany();
    return users.map((u) => this.prismaUserMapper.toDomain(u));
  }

  async delete(id: string) {
    await this.prisma.user.delete({ where: { id } });
  }
}
