import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { addSeconds } from 'date-fns';
import { JwtService } from '@nestjs/jwt';
import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

import {
  TOKEN_REPOSITORY,
  TokenRepositoryPort,
} from '../ports/token.repository';
import { Tokens } from '../../domain/interfaces/tokens.interface';
import { GetUserByEmailUseCase } from '../../../user/application/use-cases/get-user-by-email.use-case';
import { RefreshToken } from '../../domain/entities/refresh-token.entity';
import {
  convertExpToSecond,
  EnvService,
  ExpType,
  HashService,
} from '@app/common';

export const LoginSchema = z.object({
  email: z.string(),
  password: z.string().min(6),
});

export class LoginDto extends createZodDto(LoginSchema) {}

@Injectable()
export class LoginUserUseCase {
  constructor(
    @Inject(TOKEN_REPOSITORY)
    private readonly tokenRepository: TokenRepositoryPort,
    private readonly hashService: HashService,
    private readonly jwtService: JwtService,
    private readonly getUserByEmailUseCase: GetUserByEmailUseCase,
    private readonly envService: EnvService,
  ) {}

  async execute({ email, password }: LoginDto): Promise<Tokens> {
    const user = await this.getUserByEmailUseCase.execute(email);
    if (!user) throw new BadRequestException('Invalid credentials');

    const valid = await this.hashService.verify(
      password,
      user.getPasswordHash(),
    );
    if (!valid) throw new BadRequestException('Invalid credentials');

    const accessPayload = {
      useId: user.getId().getValue(),
    };

    const accessToken = await this.jwtService.signAsync(accessPayload);
    const refreshToken = RefreshToken.create(
      user.getId().getValue(),
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
