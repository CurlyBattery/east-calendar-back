import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dtos/create-project.dto';
import { CurrentUser } from '@app/common';
import { User } from '../../generated/prisma';

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
}
