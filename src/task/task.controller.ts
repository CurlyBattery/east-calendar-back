import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dtos/create-task.dto';
import { UpdateTaskDto } from './dtos/update-task.dto';
import { CurrentUser, Roles } from '@app/common';
import { RoleUser, User } from '../../generated/prisma';

@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  create(@Body() createTaskDto: CreateTaskDto, @CurrentUser() user: User) {
    return this.taskService.create(createTaskDto, user.id);
  }

  @Roles(RoleUser.ADMIN)
  @Get()
  findAll() {
    return this.taskService.findAll();
  }

  // @Get('my')
  // findAllMy(@CurrentUser() user: User) {
  //   return this.taskService.findAllMy();
  // }

  @Get('my/:id')
  findAllMyByProject(
    @Param('id') projectId: string,
    @CurrentUser() user: User,
  ) {
    return this.taskService.findAllMyByProject(projectId, user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.taskService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.taskService.update(id, updateTaskDto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.taskService.delete(id);
  }
}
