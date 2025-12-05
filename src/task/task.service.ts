import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dtos/create-task.dto';
import { UpdateTaskDto } from './dtos/update-task.dto';
import { TasksSearchService } from './task-search.service';

@Injectable()
export class TaskService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tasksSearchService: TasksSearchService,
  ) {}

  async create(dto: CreateTaskDto, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: dto.projectId },
      include: { projectMembers: true },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (dto?.assigneeId) {
      if (
        !project.projectMembers.some(
          (member) => member.userId === dto?.assigneeId,
        )
      ) {
        throw new ForbiddenException('Member not found in project');
      }
    } else {
      if (!project.projectMembers.some((member) => member.userId === userId)) {
        throw new ForbiddenException('Member not found in project');
      }
    }
    const task = await this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        priority: dto.priority,
        assigneeId: dto.assigneeId ?? userId,
        start: dto.start,
        end: dto.end,
        createdBy: userId,
        projectId: dto.projectId,
      },
      include: {
        assignee: true,
        creator: true,
        project: true,
      },
    });
    await this.tasksSearchService.indexTask(task);
    return task;
  }

  async findAllMy(userId: string, text?: string) {
    if (!text) {
      return this.prisma.task.findMany({
        where: {
          assigneeId: userId,
        },
        include: {
          assignee: true,
          creator: true,
          project: true,
        },
      });
    }
    const results = await this.tasksSearchService.search(text);
    const ids = results.map((task) => task.id);
    if (!ids.length) {
      return [];
    }
    const tasks = await this.prisma.task.findMany({
      where: { id: { in: ids }, assigneeId: userId },
      include: {
        assignee: true,
        creator: true,
        project: true,
      },
    });
    return tasks;
  }

  findAllMyByProject(projectId: string, userId: string) {
    return this.prisma.task.findMany({
      where: { projectId: projectId, assigneeId: userId },
      include: {
        assignee: true,
        creator: true,
      },
    });
  }

  async findOne(id: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        assignee: true,
        creator: true,
        project: true,
      },
    });
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async update(id: string, dto: UpdateTaskDto) {
    const task = await this.prisma.task.findUnique({
      where: { id },
    });
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return this.prisma.task.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        start: dto.start,
        status: dto.status,
        end: dto.end,
      },
      include: {
        creator: true,
        assignee: true,
        project: true,
      },
    });
  }

  async delete(id: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
    });
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    await this.prisma.task.delete({ where: { id } });
  }
}
