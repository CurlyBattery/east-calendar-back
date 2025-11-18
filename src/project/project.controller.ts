import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dtos/create-project.dto';
import { CurrentUser } from '@app/common';
import { User } from '../../generated/prisma';
import { AddMemberDto } from './dtos/add-member.dto';
import { SubscriptionGuard } from './guards/subscription.guard';
import { DeleteMemberDto } from './dtos/delete-member.dto';
import { UpdateMemberDto } from './dtos/update-member.dto';

@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  create(
    @Body() createProjectDto: CreateProjectDto,
    @CurrentUser() user: User,
  ) {
    return this.projectService.create(createProjectDto, user.id);
  }

  @Get()
  myProjects(@CurrentUser() user: User) {
    return this.projectService.getAllMyProjects(user.id);
  }

  @Get(':id')
  getOneProject(@Param('id') id: string, @CurrentUser() user: User) {
    return this.projectService.getById(id, user.id);
  }

  @UseGuards(SubscriptionGuard)
  @Post(':id/members')
  addMember(
    @Param('id') projectId: string,
    @Body() addMemberDto: AddMemberDto,
    @CurrentUser() user: User,
  ) {
    return this.projectService.addMember(projectId, addMemberDto, user.id);
  }

  @UseGuards(SubscriptionGuard)
  @Patch(':id/members')
  updateMember(
    @Param('id') projectId: string,
    @Body() updateMemberDto: UpdateMemberDto,
    @CurrentUser() user: User,
  ) {
    return this.projectService.updateRoleMember(
      projectId,
      updateMemberDto,
      user.id,
    );
  }

  @UseGuards(SubscriptionGuard)
  @Delete(':id/members')
  deleteMember(
    @Param('id') projectId: string,
    @Body() deleteMemberDto: DeleteMemberDto,
    @CurrentUser() user: User,
  ) {
    return this.projectService.deleteMember(
      projectId,
      deleteMemberDto,
      user.id,
    );
  }
}
