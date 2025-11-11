import { Module } from '@nestjs/common';

import { UserModule } from '../user/user.module';
import { LoginUserUseCase } from './application/use-cases/login-user.use-case';
import { RegisterUserUseCase } from './application/use-cases/register-user.use-case';
import { TOKEN_REPOSITORY } from './application/ports/token.repository';
import { PrismaTokenRepository } from './infrastructure/adapters/prisma-token.repository';
import { PrismaTokenMapper } from './infrastructure/adapters/prisma-token.mapper';
import { JwtModule } from '@nestjs/jwt';
import { EnvModule, EnvService, HashModule } from '@app/common';
import { AuthController } from './presentation/auth.controller';

@Module({
  imports: [
    UserModule,
    HashModule,
    EnvModule,
    JwtModule.registerAsync({
      imports: [EnvModule],
      inject: [EnvService],
      useFactory: (envService: EnvService): any => ({
        global: true,
        secret: envService.get('ACCESS_SECRET'),
        signOptions: {
          expiresIn: envService.get('ACCESS_EXP'),
        },
      }),
    }),
  ],
  providers: [
    RegisterUserUseCase,
    LoginUserUseCase,
    {
      provide: TOKEN_REPOSITORY,
      useClass: PrismaTokenRepository,
    },
    PrismaTokenMapper,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
