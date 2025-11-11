import { BadRequestException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { z } from 'zod';

import { Tokens } from '../../domain/interfaces/tokens.interface';
import {
  convertExpToSecond,
  EnvService,
  ExpType,
  HashService,
} from '@app/common';
import {
  TOKEN_REPOSITORY,
  TokenRepositoryPort,
} from '../ports/token.repository';
import { createZodDto } from 'nestjs-zod';
import { RefreshToken } from '../../domain/entities/refresh-token.entity';
import { addSeconds } from 'date-fns';
import { GetUserByEmailUseCase } from '../../../user/application/use-cases/get-user-by-email.use-case';
import { CreateUserUseCase } from '../../../user/application/use-cases/create-user.use-case';

export const RegisterSchema = z.object({
  email: z.string(),
  password: z.string(),
  name: z.string(),
  avatarUrl: z.string(),
});

export class RegisterDto extends createZodDto(RegisterSchema) {}

export class RegisterUserUseCase {
  constructor(
    @Inject(TOKEN_REPOSITORY)
    private readonly tokenRepository: TokenRepositoryPort,
    private readonly hashService: HashService,
    private readonly envService: EnvService,
    private readonly jwtService: JwtService,
    private readonly getUserByEmailUseCase: GetUserByEmailUseCase,
    private readonly createUserUseCase: CreateUserUseCase,
  ) {}

  async execute(dto: RegisterDto): Promise<Tokens> {
    const user = await this.getUserByEmailUseCase.execute(dto.email);
    if (user) throw new BadRequestException('User with email already exists');

    const passwordHash = await this.hashService.hash(dto.password);

    const newUser = await this.createUserUseCase.execute({
      ...dto,
      password: passwordHash,
    });

    const accessPayload = {
      useId: newUser.getId().getValue(),
    };

    const accessToken = await this.jwtService.signAsync(accessPayload);
    const refreshToken = RefreshToken.create(
      newUser.getId().getValue(),
      addSeconds(
        new Date(),
        convertExpToSecond(this.envService.get('REFRESH_EXP') as ExpType),
      ),
    );
    await this.tokenRepository.save(refreshToken);

    return {
      accessToken,
      refreshToken: refreshToken.getUuid(),
    };
  }
}
