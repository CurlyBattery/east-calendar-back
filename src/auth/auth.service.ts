import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { EnvService, HashService } from '@app/common';
import { QrStatus, SubscriptionPlan, User } from '../../generated/prisma';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { JwtPayload, Tokens } from './types';
import { PrismaService } from '../prisma/prisma.service';
import { v4 } from 'uuid';
import { QRService } from '../qr/qr.service';
import { addHours } from 'date-fns';
import { ConfirmQrDto } from './dtos/confirm-qr.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hashService: HashService,
    private readonly jwtService: JwtService,
    private readonly qrService: QRService,
    private readonly envService: EnvService,
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
      include: {
        plan: true,
      },
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

  async removeToken(token: string, userAgent: string) {
    const refreshToken = await this.prisma.refreshToken.findUnique({
      where: { token },
      include: {
        user: {
          select: {
            qrCodeSessions: true,
          },
        },
      },
    });
    if (!refreshToken) throw new UnauthorizedException('Invalid refresh token');

    const qrSession = await this.prisma.qrCodeSession.findUnique({
      where: {
        userId: refreshToken.userId,
        userAgent,
      },
    });
    if (qrSession) {
      await this.prisma.qrCodeSession.delete({
        where: {
          userId: refreshToken.userId,
          userAgent,
        },
      });
    }

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
    const session = await this.prisma.qrCodeSession.upsert({
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
    const urlForQr =
      this.envService.get('FRONTEND_URL') + `/scan/${session.id}`;
    const qrCode = await this.qrService.generateQR(urlForQr);
    return { qrCode, token };
  }

  async getAllDevices(userId: string) {
    const { refreshTokens } = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        refreshTokens: {
          select: {
            userAgent: true,
          },
        },
      },
    });
    return refreshTokens;
  }

  async confirmQr(confirmQrDto: ConfirmQrDto, userId: string) {
    const session = await this.prisma.qrCodeSession.findUnique({
      where: { id: confirmQrDto.sessionId },
    });
    if (!session) {
      throw new NotFoundException('Session Not Found');
    }
    if (session.expired < new Date()) {
      throw new BadRequestException('Session Expired');
    }
    if (session.status !== QrStatus.PENDING) {
      throw new BadRequestException('Session Complete');
    }

    switch (confirmQrDto.status) {
      case QrStatus.SUCCESS: {
        await this.prisma.qrCodeSession.update({
          where: { id: confirmQrDto.sessionId },
          data: {
            status: QrStatus.SUCCESS,
            userId,
          },
        });
        break;
      }
      case QrStatus.REJECT: {
        await this.prisma.qrCodeSession.update({
          where: { id: confirmQrDto.sessionId },
          data: {
            status: QrStatus.REJECT,
          },
        });
        break;
      }
    }
  }

  async checkStatusQr(token: string) {
    const session = await this.prisma.qrCodeSession.findUnique({
      where: { token },
    });
    if (!session) {
      throw new NotFoundException('Not Found Session');
    }
    switch (session.status) {
      case QrStatus.SUCCESS: {
        const user = await this.prisma.user.findUnique({
          where: { id: session.userId! },
        });
        const tokens = await this.getTokens(user, session.userAgent);
        return { session, tokens };
      }
      case QrStatus.REJECT: {
        return { session, message: 'Отменено' };
      }
      default: {
        return { session };
      }
    }
  }
}
