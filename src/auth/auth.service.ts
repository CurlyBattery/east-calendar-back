import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { HashService } from '@app/common';
import { SubscriptionPlan, User } from '../../generated/prisma';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { JwtPayload, Tokens } from './types';
import { PrismaService } from '../prisma/prisma.service';
import { v4 } from 'uuid';
import { QRService } from '../qr/qr.service';
import { addHours } from 'date-fns';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hashService: HashService,
    private readonly jwtService: JwtService,
    private readonly qrService: QRService,
  ) {}

  async register(
    dto: RegisterDto,
    userAgent: string,
  ): Promise<Tokens & { user: User }> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (user) throw new BadRequestException('User with email already exists');

    const passwordHash = await this.hashService.hash(dto.password);

    const newUser = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        passwordHash,
        avatarPath: dto.avatarPath,
        plan: {
          create: {
            subscriptionPlan: SubscriptionPlan.FREE,
          },
        },
      },
      include: {
        plan: true,
      },
    });
    const { accessToken, refreshToken } = await this.getTokens(
      newUser,
      userAgent,
    );

    return {
      accessToken,
      refreshToken,
      user: newUser,
    };
  }

  async login(
    dto: LoginDto,
    userAgent: string,
  ): Promise<Tokens & { user: User }> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) throw new BadRequestException('Invalid credentials');

    const valid = await this.hashService.verify(
      dto.password,
      user.passwordHash,
    );
    if (!valid) throw new BadRequestException('Invalid credentials');

    const { accessToken, refreshToken } = await this.getTokens(user, userAgent);

    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  async refresh(token: string, userAgent: string): Promise<Tokens> {
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { token },
      include: {
        user: true,
      },
    });

    if (!storedToken) throw new UnauthorizedException('Invalid refresh token');

    await this.prisma.refreshToken.delete({ where: { token } });

    return this.getTokens(storedToken.user, userAgent);
  }

  async removeToken(token: string) {
    const refreshToken = await this.prisma.refreshToken.findUnique({
      where: { token },
    });
    if (!refreshToken) throw new UnauthorizedException('Invalid refresh token');

    await this.prisma.refreshToken.delete({
      where: { token },
    });
  }

  async getTokens(user: User, userAgent: string): Promise<Tokens> {
    const jwtPayload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };

    const accessToken = await this.jwtService.signAsync(jwtPayload);

    const refreshToken = await this.getRefreshToken(user.id, userAgent);

    return {
      accessToken,
      refreshToken: refreshToken.token,
    };
  }

  async getRefreshToken(userId: string, userAgent: string) {
    const refreshToken = await this.prisma.refreshToken.findFirst({
      where: {
        userId,
        userAgent,
      },
    });
    const token = refreshToken?.token ?? '';
    return this.prisma.refreshToken.upsert({
      where: { token },
      update: {
        token: v4(),
      },
      create: {
        token: v4(),
        userId,
        userAgent,
      },
    });
  }

  // получить сгенерированный qr code
  async generateQrCode(userAgent: string) {
    const token = v4();
    await this.prisma.qrCodeSession.upsert({
      where: { userAgent },
      create: {
        token,
        expired: addHours(new Date(), 1),
        userAgent,
      },
      update: {
        token,
        expired: addHours(new Date(), 1),
      },
    });
    return this.qrService.generateQR(token);
  }
}
