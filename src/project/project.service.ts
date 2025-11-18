import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dtos/create-project.dto';
import { AddMemberDto } from './dtos/add-member.dto';
import { RoleMember } from '../../generated/prisma';
import { DeleteMemberDto } from './dtos/delete-member.dto';
import { UpdateMemberDto } from './dtos/update-member.dto';

@Injectable()
export class ProjectService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProjectDto, userId: string) {
    return this.prisma.project.create({
      data: {
        name: dto.name,
        description: dto.description,
        ownerId: userId,
        projectMembers: {
          create: {
            userId: userId,
            role: RoleMember.OWNER,
          },
        },
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
      where: { id },
      include: {
        projectMembers: true,
      },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.projectMembers.some((member) => member.userId === userId)) {
      return project;
    } else {
      throw new ForbiddenException();
    }
  }

  async addMember(projectId: string, dto: AddMemberDto, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { projectMembers: true },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const role = await this.roleIsThisProject(projectId, userId);
    if (role !== RoleMember.OWNER) {
      throw new ForbiddenException();
    }

    const existsProjectMember = await this.prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: dto.userId,
        },
      },
    });

    if (existsProjectMember) {
      throw new ConflictException('Member in project already exists');
    }

    return this.prisma.projectMember.create({
      data: {
        projectId,
        userId: dto.userId,
        role: dto.role,
      },
    });
  }

  async updateRoleMember(
    projectId: string,
    dto: UpdateMemberDto,
    userId: string,
  ) {
    const role = await this.roleIsThisProject(projectId, userId);
    if (role !== RoleMember.OWNER) {
      throw new ForbiddenException();
    }

    return this.prisma.projectMember.update({
      where: {
        projectId_userId: {
          projectId,
          userId: dto.memberId,
        },
      },
      data: {
        role: dto.role,
      },
    });
  }

  async deleteMember(projectId: string, dto: DeleteMemberDto, ownerId: string) {
    const role = await this.roleIsThisProject(projectId, ownerId);
    if (role !== RoleMember.OWNER) {
      throw new ForbiddenException();
    }

    if (dto.memberId !== ownerId) {
      await this.prisma.projectMember.delete({
        where: {
          projectId_userId: {
            projectId,
            userId: dto.memberId,
          },
        },
      });
      return { message: 'Member successfully deleted' };
    } else {
      throw new BadRequestException('You cannot delete yourself');
    }
  }

  async roleIsThisProject(projectId: string, memberId: string) {
    const member = await this.prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: memberId } },
    });
    if (!member) throw new ForbiddenException();
    return member.role;
  }
}
