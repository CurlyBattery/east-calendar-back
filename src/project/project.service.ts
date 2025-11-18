import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dtos/create-project.dto';

@Injectable()
export class ProjectService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateProjectDto, userId: string) {
    return this.prisma.project.create({
      data: {
        name: dto.name,
        description: dto.description,
        ownerId: userId,
      },
    });
  }

  getAllMyProjects(userId: string) {
    return this.prisma.project.findMany({
      where: {
        ownerId: userId,
      },
    });
  }

  async getById(id: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id, ownerId: userId },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }
}
