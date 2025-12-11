import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
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

  @Get('my')
  findAllMy(@CurrentUser() user: User, @Query('text') text?: string) {
    return this.taskService.findAllMy(user.id, text);
  }

  @Get('my/:id')
  findAllMyByProject(
    @Param('id') projectId: string,
    @Query('text') text?: string,
  ) {
    return this.taskService.findAllByProject(projectId, text);
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
