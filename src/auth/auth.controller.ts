import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Express } from 'express';

import {
  convertExpToSecond,
  Cookie,
  cookieLib,
  EnvService,
  ExpType,
  UserAgent,
  Public,
  CurrentUser,
} from '@app/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { FileUploadInterceptor } from '../shared/file-upload/file-upload.interceptor';
import { QrStatus, User } from '../../generated/prisma';
import { ConfirmQrDto } from './dtos/confirm-qr.dto';
import { LogoutDto } from './dtos/logout.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly envService: EnvService,
  ) {}

  @Public()
  @Post('register')
  @UseInterceptors(FileUploadInterceptor)
  async register(
    @Body() dto: RegisterDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @UserAgent() userAgent: string,
  ) {
    if (file) {
      dto.avatarPath = `uploads/${file.filename}`;
    }

    const { accessToken, refreshToken, user } = await this.authService.register(
      dto,
      userAgent,
    );

    this.setTokensToCookie(req, res, accessToken, refreshToken);

    return user;
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
    const { accessToken, refreshToken, user } = await this.authService.login(
      dto,
      userAgent,
    );
    this.setTokensToCookie(req, res, accessToken, refreshToken);

    return user;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Cookie('refreshToken') token: string,
    @UserAgent() userAgent: string,
  ) {
    if (!token) {
      throw new UnauthorizedException();
    }
    const cookieFactory = cookieLib(req, res);

    cookieFactory.remove('accessToken');
    cookieFactory.remove('refreshToken');

    await this.authService.removeToken(token, userAgent);

    return { message: 'Logged out' };
  }

  @Post('logout/agent')
  @HttpCode(HttpStatus.OK)
  async logoutAgent(
    @CurrentUser() user: User,
    @Body() logoutAgentDto: LogoutDto,
  ) {
    await this.authService.removeTokenByAgent(
      user.id,
      logoutAgentDto.userAgent,
    );

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

  @Public()
  @Get('/qr')
  async getGeneratedQR(@Res() res: Response, @UserAgent() userAgent: string) {
    const { qrCode, token } = await this.authService.generateQrCode(userAgent);

    res.status(200);
    res.type('png');
    res.setHeader('X-QR-Session-Token', token);
    res.send(qrCode);
  }

  @Post('/qr/confirm')
  async confirmQr(@Body() dto: ConfirmQrDto, @CurrentUser() user: User) {
    await this.authService.confirmQr(dto, user.id);
  }

  @Public()
  @Get('/qr/check')
  async checkStatusQr(
    @Query('token') token: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const check = await this.authService.checkStatusQr(token);
    switch (check.session.status) {
      case QrStatus.SUCCESS: {
        this.setTokensToCookie(
          req,
          res,
          check.tokens.accessToken,
          check.tokens.refreshToken,
        );
        return {
          session: check.session,
          accessToken: check.tokens.accessToken,
        };
      }
      case QrStatus.REJECT: {
        return check;
      }
      default: {
        return check;
      }
    }
  }

  @Get('/devices')
  async getAllDevices(@CurrentUser() user: User) {
    return this.authService.getAllDevices(user.id);
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
