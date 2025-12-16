import { Controller, Get, Post } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CurrentUser } from '@app/common';
import { User } from '../../generated/prisma';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  create(@CurrentUser() user: User) {
    return this.paymentService.createPayment(user.id);
  }

  @Get()
  checkStatus(@CurrentUser() user: User) {
    return this.paymentService.capturePayment(user.id);
  }
}
