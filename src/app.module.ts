import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EnvModule, envSchema, HashModule } from '@app/common';
import { APP_PIPE } from '@nestjs/core';
import { ZodValidationPipe } from 'nestjs-zod';
import { AuthModule } from './auth/auth.module';
import { TaskModule } from './task/task.module';
import { ProjectModule } from './project/project.module';
import { SeedModule } from './seed/seed.module';
import { FileUploadModule } from './shared/file-upload/file-upload.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PaymentModule } from './payment/payment.module';
import { YookassaModule } from 'nestjs-yookassa';
import { QRModule } from './qr/qr.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
    }),
    PrismaModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    FileUploadModule,
    SeedModule,
    UserModule,
    HashModule,
    EnvModule,
    AuthModule,
    TaskModule,
    ProjectModule,
    PaymentModule,
    YookassaModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        shopId: configService.get('YOOKASSA_SHOP_ID'),
        apiKey: configService.get('YOOKASSA_SECRET_KEY'),
      }),
    }),
    QRModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
  ],
})
export class AppModule {}
