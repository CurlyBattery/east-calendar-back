import {
  ConfirmationEnum,
  CreatePaymentRequest,
  CurrencyEnum,
  PaymentMethodsEnum,
  YookassaService,
} from 'nestjs-yookassa';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubscriptionPlan } from '../../generated/prisma';
import { EnvService } from '@app/common';
import { addMonths } from 'date-fns';

@Injectable()
export class PaymentService {
  constructor(
    private readonly yookassaService: YookassaService,
    private readonly prisma: PrismaService,
    private readonly envService: EnvService,
  ) {}

  async createPayment(userId: string) {
    const paymentData: CreatePaymentRequest = {
      amount: {
        value: 499,
        currency: CurrencyEnum.RUB,
      },
      description: 'Test payment',
      payment_method_data: {
        type: PaymentMethodsEnum.BANK_CARD,
      },
      capture: false,
      confirmation: {
        type: ConfirmationEnum.REDIRECT,
        return_url: this.envService.get('YOOKASSA_CALLBACK'),
      },
      metadata: {
        order_id: userId,
      },
    };

    const payment = await this.yookassaService.payments.create(paymentData);

    await this.prisma.payment.create({
      data: {
        userId,
        paymentId: payment.id,
        status: payment.status,
      },
    });

    return payment;
  }

  async capturePayment(userId: string) {
    const dbPayment = await this.prisma.payment.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (!dbPayment) throw new NotFoundException('Payment not found');
    const result = await this.yookassaService.payments.capture(
      dbPayment.paymentId,
    );
    let user;
    if (result.status === 'succeeded') {
      user = await this.prisma.user.update({
        where: { id: userId },
        data: {
          plan: {
            update: {
              subscriptionPlan: SubscriptionPlan.PRO,
              isExpired: addMonths(new Date(), 1),
            },
          },
        },
        include: {
          plan: true,
        },
      });
    }

    return { ...result, user };
  }
}
