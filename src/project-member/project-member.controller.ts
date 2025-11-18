import { Controller } from '@nestjs/common';

import { ProjectMemberService } from './project-member.service';

@Controller('project-members')
export class ProjectMemberController {
  constructor(private readonly projectMemberService: ProjectMemberService) {}
}
