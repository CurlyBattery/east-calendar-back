import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as argon2 from 'argon2';

import { PrismaService } from '../prisma/prisma.service';
import { HashService } from '@app/common';
import { RoleUser, SubscriptionPlan } from '../../generated/prisma';
import { addYears } from 'date-fns';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly hashService: HashService,
  ) {}

  async onModuleInit() {
    await this.seedAdmin();
  }

  async seedAdmin() {
    const passwordHash = await this.hashService.hash('kosar54321');
    const user = {
      email: 'rar@gmail.com',
      passwordHash,
      name: 'Rar',
      role: RoleUser.ADMIN,
    };

    await this.prisma.user.upsert({
      where: { email: user.email },
      create: {
        ...user,
        plan: {
          create: {
            subscriptionPlan: SubscriptionPlan.PRO,
            isExpired: addYears(new Date(), 2),
          },
        },
      },
      update: {
        ...user,
        plan: {
          update: {
            subscriptionPlan: SubscriptionPlan.PRO,
            isExpired: addYears(new Date(), 2),
          }
        }
      },
    });
    this.logger.log('Admin successfully created');
  }
}
