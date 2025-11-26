import {
  ConfirmationEnum,
  CreatePaymentRequest,
  CurrencyEnum,
  PaymentMethodsEnum,
  YookassaService,
} from 'nestjs-yookassa';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubscriptionPlan } from '../../generated/prisma';

@Injectable()
export class PaymentService {
  constructor(
    private readonly yookassaService: YookassaService,
    private readonly prisma: PrismaService,
  ) {}

  async createPayment(userId: string) {
    const paymentData: CreatePaymentRequest = {
      amount: {
        value: 100,
        currency: CurrencyEnum.RUB,
      },
      description: 'Test payment',
      payment_method_data: {
        type: PaymentMethodsEnum.BANK_CARD,
      },
      capture: false,
      confirmation: {
        type: ConfirmationEnum.REDIRECT,
        return_url: 'https://example.com/thanks',
      },
      metadata: {
        order_id: '12345678',
      },
    };

    const payment = await this.yookassaService.payments.create(paymentData);
    console.log(payment.id);

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
    });

    if (!dbPayment) throw new Error('Payment not found');

    const result = await this.yookassaService.payments.capture(
      dbPayment.paymentId,
    );

    if (result.status === 'succeeded') {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          plan: SubscriptionPlan.PRO,
        },
      });
    }

    return result;
  }
}
