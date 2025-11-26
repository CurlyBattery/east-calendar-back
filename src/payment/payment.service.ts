import {
  ConfirmationEnum,
  CreatePaymentRequest,
  CurrencyEnum,
  PaymentMethodsEnum,
  YookassaService,
} from 'nestjs-yookassa';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PaymentService {
  constructor(private readonly yookassaService: YookassaService) {}

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

    const newPayment = await this.yookassaService.payments.create(paymentData);

    return newPayment;
  }
}
