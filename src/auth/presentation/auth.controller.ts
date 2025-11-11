import { Body, Controller, Post } from '@nestjs/common';
import {
  LoginDto,
  LoginUserUseCase,
} from '../application/use-cases/login-user.use-case';
import {
  RegisterDto,
  RegisterUserUseCase,
} from '../application/use-cases/register-user.use-case';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase,
  ) {}

  @Post('register')
  register(@Body() request: RegisterDto) {
    return this.registerUserUseCase.execute(request);
  }

  @Post('login')
  login(@Body() request: LoginDto) {
    return this.loginUserUseCase.execute(request);
  }
}
