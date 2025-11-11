import { Module } from '@nestjs/common';
import { EnvService } from '@app/common/env/env.service';

@Module({
  providers: [EnvService],
  exports: [EnvService],
})
export class EnvModule {}
