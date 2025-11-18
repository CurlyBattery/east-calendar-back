import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { HashModule } from '@app/common';

@Module({
  imports: [HashModule],
  providers: [SeedService],
})
export class SeedModule {}
