import { Module } from '@nestjs/common';
import { USER_REPOSITORY } from './application/ports/user.repository.port';
import { PrismaUserRepository } from './infrastructure/adapters/prisma-user.repository';
import { CreateUserUseCase } from './application/use-cases/create-user.use-case';
import { UserController } from './presentation/user.controller';
import { ListUsersUseCase } from './application/use-cases/list-users.use-case';
import { GetUserByIdUseCase } from './application/use-cases/get-user-by-id.use-case';
import { UpdateUserUseCase } from './application/use-cases/update-user.use-case';
import { DeleteUserUseCase } from './application/use-cases/delete-user.use-case';
import { PrismaUserMapper } from './infrastructure/adapters/prisma-user.mapper';
import { GetUserByEmailUseCase } from './application/use-cases/get-user-by-email.use-case';

@Module({
  controllers: [UserController],
  providers: [
    CreateUserUseCase,
    ListUsersUseCase,
    GetUserByIdUseCase,
    GetUserByEmailUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
    PrismaUserMapper,
  ],
  exports: [CreateUserUseCase, GetUserByIdUseCase, GetUserByEmailUseCase],
})
export class UserModule {}
