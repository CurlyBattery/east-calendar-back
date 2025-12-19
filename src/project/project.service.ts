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
import { ProjectSearchService } from './project-search.service';

@Injectable()
export class ProjectService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projectSearchService: ProjectSearchService,
  ) {}

  async create(dto: CreateProjectDto, userId: string) {
    const project = await this.prisma.project.create({
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
      include: {
        owner: true,
      },
    });
    await this.projectSearchService.indexProject(project);
    return project;
  }

  async findAllMy(userId: string, text?: string) {
    if (!text) {
      return this.prisma.project.findMany({
        where: {
          projectMembers: {
            some: {
              userId,
            },
          },
        },
        include: {
          owner: true,
        },
      });
    }
    const results = await this.projectSearchService.search(text);
    const ids = results.map((project) => project.id);
    if (!ids.length) {
      return [];
    }
    const projects = await this.prisma.project.findMany({
      where: {
        id: { in: ids },
        projectMembers: {
          some: {
            userId,
          },
        },
      },
      include: {
        owner: true,
      },
    });
    return projects;
  }

  async getById(id: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        projectMembers: {
          include: {
            user: true,
          },
        },
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

    const existsUser = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });
    if (!existsUser) {
      throw new NotFoundException('User not found');
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
      include: {
        user: {
          include: {
            plan: true,
          },
        },
      },
    });
  }

  findAllMembers(projectId: string) {
    return this.prisma.projectMember.findMany({
      where: {
        projectId,
      },
      include: {
        user: {
          include: {
            plan: true,
          },
        },
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
