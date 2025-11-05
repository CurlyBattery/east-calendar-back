import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';

import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '../ports/user.repository.port';
import { User } from '../../domain/entities/user.entity';

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  avatarUrl: string;
}

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async execute(dto: CreateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(dto.email);

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const passwordHash = await argon2.hash(dto.password);
    const user = User.create(dto.name, dto.email, passwordHash, dto.avatarUrl);
    const savedUser = await this.userRepository.save(user);

    return savedUser;
  }
}
