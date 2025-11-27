import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { EnvModule } from '@app/common';

@Module({
  imports: [EnvModule],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}
