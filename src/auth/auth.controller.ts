import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';

import {
  convertExpToSecond,
  Cookie,
  cookieLib,
  EnvService,
  ExpType,
  UserAgent,
  Public,
} from '@app/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly envService: EnvService,
  ) {}

  @Public()
  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @UserAgent() userAgent: string,
  ) {
    const { accessToken, refreshToken } = await this.authService.register(
      dto,
      userAgent,
    );

    this.setTokensToCookie(req, res, accessToken, refreshToken);

    return {
      accessToken,
    };
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @UserAgent() userAgent: string,
  ) {
    const { accessToken, refreshToken } = await this.authService.login(
      dto,
      userAgent,
    );

    this.setTokensToCookie(req, res, accessToken, refreshToken);

    return {
      accessToken,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Cookie('refreshToken') token: string,
  ) {
    if (!token) {
      throw new UnauthorizedException();
    }
    const cookieFactory = cookieLib(req, res);

    cookieFactory.remove('accessToken');
    cookieFactory.remove('refreshToken');

    await this.authService.removeToken(token);

    return { message: 'Logged out' };
  }

  @Public()
  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Cookie('refreshToken') token: string,
    @UserAgent() userAgent: string,
  ) {
    if (!token) {
      throw new UnauthorizedException();
    }
    const { accessToken, refreshToken } = await this.authService.refresh(
      token,
      userAgent,
    );

    this.setTokensToCookie(req, res, accessToken, refreshToken);

    return {
      accessToken,
    };
  }

  @Get()
  me(@Req() req: Request) {
    return req.user;
  }

  setTokensToCookie(
    req: Request,
    res: Response,
    accessToken: string,
    refreshToken: string,
  ) {
    const cookieFactory = cookieLib(req, res);

    cookieFactory.set('accessToken', accessToken, {
      maxAge:
        convertExpToSecond(this.envService.get('ACCESS_EXP') as ExpType) * 1000,
    });
    cookieFactory.set('refreshToken', refreshToken, {
      maxAge:
        convertExpToSecond(this.envService.get('REFRESH_EXP') as ExpType) *
        1000,
    });
  }
}
