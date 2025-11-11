import { Module } from '@nestjs/common';
import { HashService } from '@app/common/hash/hash.service';

@Module({
  providers: [HashService],
  exports: [HashService],
})
export class HashModule {}
