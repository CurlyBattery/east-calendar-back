import { Module } from '@nestjs/common';

import { ProjectMemberService } from './project-member.service';
import { ProjectMemberController } from './project-member.controller';

@Module({
  imports: [],
  providers: [ProjectMemberService],
  controllers: [ProjectMemberController],
})
export class ProjectMemberModule {}
