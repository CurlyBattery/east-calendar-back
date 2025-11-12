import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { EnvModule, EnvService, HashModule } from '@app/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AccessTokenStrategy } from './strategies/access-token.strategy';
import { AccessTokenGuard } from './guards/access-token.guard';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    EnvModule,
    HashModule,
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
    AuthService,
    AccessTokenStrategy,
    {
      provide: APP_GUARD,
      useClass: AccessTokenGuard,
    },
  ],
  controllers: [AuthController],
})
export class AuthModule {}
