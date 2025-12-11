import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { $Enums, User } from '../../generated/prisma';
import RoleUser = $Enums.RoleUser;
import { Test } from '@nestjs/testing';
import SubscriptionPlan = $Enums.SubscriptionPlan;
import { EnvService, HashService } from '@app/common';
import { JwtService } from '@nestjs/jwt';
import { QRService } from '../qr/qr.service';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';

const userArray: User[] = [
  {
    id: '1',
    name: 'Artem',
    email: 'artem@gmail.com',
    passwordHash: 'kosar54321',
    role: RoleUser.USER,
    createdAt: new Date(),
    avatarPath: '123',
  },
  {
    id: '2',
    name: 'Islam',
    email: 'islam@gmail.com',
    passwordHash: 'kosar54321',
    role: RoleUser.USER,
    createdAt: new Date(),
    avatarPath: '1234',
  },
];

const oneUser = userArray[0];

const mockPrisma = {
  user: {
    findUnique: jest.fn().mockResolvedValue(oneUser),
    create: jest.fn().mockReturnValue(oneUser),
  },
  refreshToken: {
    findFirst: jest.fn(),
    upsert: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn(),
  },
};

const mockHashService = {
  hash: jest.fn(),
  verify: jest.fn(),
};

const mockJwtService = {
  signAsync: jest.fn(),
};

const mockQRService = {
  generateQR: jest.fn(),
};

const mockEnvService = {
  get: jest.fn().mockReturnValue('http://localhost:5000'),
};
const userAgent = 'Mozilla';

const foundUser = userArray[0];

describe('AuthService', () => {
  let authService: AuthService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
        {
          provide: HashService,
          useValue: mockHashService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: QRService,
          useValue: mockQRService,
        },
        {
          provide: EnvService,
          useValue: mockEnvService,
        },
      ],
    }).compile();
    authService = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('when create and authenticate user', () => {
    const registerDto: RegisterDto = {
      name: 'Nikita',
      email: 'nikita@gmail.com',
      password: 'kosar54321',
      confirmPassword: 'kosar54321',
      avatarPath: 'avatar.jpg',
    };

    const createdUser = {
      id: '3',
      name: 'Nikita',
      email: 'nikita@gmail.com',
      password: 'hashedPassword',
      avatarPath: 'avatar.jpg',
      plan: {
        subscriptionPlan: SubscriptionPlan.PRO,
      },
    };

    describe('and the user already exists', () => {
      beforeEach(() => {
        mockPrisma.user.findUnique.mockResolvedValue(createdUser);
      });
      it('should throw error if user already exists', async () => {
        await expect(
          authService.register(registerDto, userAgent),
        ).rejects.toThrow('User with email already exists');
      });
    });
    describe('and the user not exists', () => {
      beforeEach(() => {
        mockPrisma.user.findUnique.mockResolvedValue(null);
        mockHashService.hash.mockResolvedValue('hashedPassword');
        mockPrisma.user.create.mockResolvedValue(createdUser);
        mockJwtService.signAsync.mockResolvedValue('access');
        mockPrisma.refreshToken.upsert.mockResolvedValue({
          token: 'refresh',
        });
      });
      it('should create a new user and return tokens', async () => {
        const result = await authService.register(registerDto, userAgent);

        expect(result).toEqual({
          accessToken: 'access',
          refreshToken: 'refresh',
          user: createdUser,
        });
      });
    });
  });

  describe('when authenticate user', () => {
    const loginDto: LoginDto = {
      email: 'nikita@gmail.com',
      password: 'kosar54321',
    };

    describe('and the user not exists', () => {
      beforeEach(() => {
        mockPrisma.user.findUnique.mockResolvedValue(null);
      });
      it('should throw error', async () => {
        await expect(authService.login(loginDto, userAgent)).rejects.toThrow(
          'Invalid credentials',
        );
      });
    });
    describe('and the user exists', () => {
      beforeEach(() => {
        mockPrisma.user.findUnique.mockResolvedValue(foundUser);
        mockHashService.verify.mockResolvedValue(true);
        mockJwtService.signAsync.mockResolvedValue('access');
        mockPrisma.refreshToken.upsert.mockResolvedValue({
          token: 'refresh',
        });
      });
      it('should return tokens', async () => {
        const result = await authService.login(loginDto, userAgent);
        expect(result).toEqual({
          accessToken: 'access',
          refreshToken: 'refresh',
          user: result.user,
        });
      });
    });

    describe('and the password match', () => {
      beforeEach(() => {
        mockPrisma.user.findUnique.mockResolvedValue(foundUser);
        mockHashService.verify.mockResolvedValue(true);
        mockJwtService.signAsync.mockResolvedValue('access');
        mockPrisma.refreshToken.upsert.mockResolvedValue({
          token: 'refresh',
        });
      });
      it('should return tokens', async () => {
        const result = await authService.login(loginDto, userAgent);
        expect(result).toEqual({
          accessToken: 'access',
          refreshToken: 'refresh',
          user: result.user,
        });
      });
    });
    describe('and the password not match', () => {
      beforeEach(() => {
        mockPrisma.user.findUnique.mockResolvedValue(foundUser);
        mockHashService.verify.mockResolvedValue(false);
      });
      it('should throw invalid credentials', async () => {
        await expect(authService.login(loginDto, userAgent)).rejects.toThrow(
          'Invalid credentials',
        );
      });
    });
  });

  describe('when refresh tokens', () => {
    const token = 'refresh';

    describe('and refresh token is valid', () => {
      beforeEach(() => {
        mockPrisma.refreshToken.findUnique.mockResolvedValue({
          token,
          user: foundUser,
        });
        mockPrisma.refreshToken.delete.mockResolvedValue(undefined);
        mockJwtService.signAsync.mockResolvedValue('access');
        mockPrisma.refreshToken.upsert.mockResolvedValue({
          token: 'refresh',
        });
      });
      it('should return refresh tokens', async () => {
        const result = await authService.refresh(token, userAgent);
        expect(result).toEqual({
          accessToken: 'access',
          refreshToken: 'refresh',
        });
      });
    });

    describe('and refresh token is invalid', () => {
      beforeEach(() => {
        mockPrisma.refreshToken.findUnique.mockResolvedValue(null);
      });
      it('should throw error', async () => {
        await expect(authService.refresh(token, userAgent)).rejects.toThrow(
          'Invalid refresh token',
        );
      });
    });
  });
});
