import { UserService } from './user.service';
import { Test } from '@nestjs/testing';
import { $Enums, User } from '../../generated/prisma';
import RoleUser = $Enums.RoleUser;
import { PrismaService } from '../prisma/prisma.service';

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

const db = {
  user: {
    findMany: jest.fn().mockResolvedValue(userArray),
    findUnique: jest.fn().mockResolvedValue(oneUser),
    update: jest.fn().mockResolvedValue(oneUser),
    delete: jest.fn().mockResolvedValue(undefined),
  },
};

describe('User Service', () => {
  let userService: UserService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: db,
        },
      ],
    }).compile();
    userService = module.get<UserService>(UserService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('when getting all users', () => {
    it('should return an array of users', async () => {
      const users = await userService.getAll();
      expect(users).toEqual(userArray);
    });
  });

  describe('when getting user by id', () => {
    describe('and the user is matched', () => {
      it('should return return the user', async () => {
        const fetchedUser = await userService.getById('1');
        expect(fetchedUser).toEqual(oneUser);
      });
    });
    describe('and the user is not matched', () => {
      beforeEach(() => {
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(undefined);
      });
      it('should throw an error', async () => {
        await expect(userService.getById('3')).rejects.toThrow();
      });
    });
  });

  describe('when update user by id', () => {
    describe('and the user is matched', () => {
      beforeEach(() => {
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(oneUser);
        oneUser.name = 'artem2';
      });
      it('should return return the user', async () => {
        const updatedUser = await userService.update('1', {
          name: 'artem2',
        });
        expect(updatedUser).toEqual(oneUser);
      });
    });
    describe('and the user is not matched', () => {
      beforeEach(() => {
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(undefined);
      });
      it('should throw an error', async () => {
        await expect(
          userService.update('3', {
            name: 'artem2',
          }),
        ).rejects.toThrow();
      });
    });
  });

  describe('when delete user by id', () => {
    describe('and the user is matched', () => {
      beforeEach(() => {
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(oneUser);
      });
      it('should return return the user', async () => {
        const deletedUser = await userService.delete('1');
        expect(deletedUser).toEqual(undefined);
      });
    });
    describe('and the user is not matched', () => {
      beforeEach(() => {
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(undefined);
      });
      it('should throw an error', async () => {
        await expect(userService.delete('3')).rejects.toThrow();
      });
    });
  });
});
