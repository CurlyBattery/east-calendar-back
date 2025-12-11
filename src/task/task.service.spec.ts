import { $Enums, Project, Task } from '../../generated/prisma';
import TaskStatus = $Enums.TaskStatus;
import TaskPriority = $Enums.TaskPriority;
import TaskType = $Enums.TaskType;
import { TaskService } from './task.service';
import { PrismaService } from '../prisma/prisma.service';
import { Test } from '@nestjs/testing';
import { TasksSearchService } from './task-search.service';
import { CreateTaskDto } from './dtos/create-task.dto';
import { UpdateTaskDto } from './dtos/update-task.dto';

const projectArray: Project[] = [
  {
    id: '1',
    name: 'project 1',
    description: 'description 1',
    createdAt: new Date(),
    ownerId: '1',
  },
];

const oneProject = projectArray[0];

const taskArray: Task[] = [
  {
    id: '1',
    title: 'title 1',
    description: 'description 1',
    status: TaskStatus.DONE,
    priority: TaskPriority.HIGH,
    type: TaskType.COMPANY,
    createdBy: '1',
    assigneeId: '1',
    projectId: '1',
    start: new Date(),
    end: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    title: 'title 2',
    description: 'description 2',
    status: TaskStatus.DONE,
    priority: TaskPriority.HIGH,
    type: TaskType.COMPANY,
    createdBy: '2',
    assigneeId: '2',
    projectId: '2',
    start: new Date(),
    end: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const oneTask = taskArray[0];

const mockPrisma = {
  task: {
    create: jest.fn().mockResolvedValue(oneTask),
    findUnique: jest.fn().mockResolvedValue(oneTask),
    update: jest.fn().mockResolvedValue(oneTask),
    delete: jest.fn().mockResolvedValue(undefined),
    findMany: jest.fn().mockResolvedValue(taskArray),
  },
  project: {
    create: jest.fn().mockResolvedValue(oneProject),
    findUnique: jest.fn().mockResolvedValue(oneProject),
    update: jest.fn().mockResolvedValue(oneProject),
    delete: jest.fn().mockResolvedValue(undefined),
    findMany: jest.fn().mockResolvedValue(projectArray),
  },
};

const mockSearchTaskService = {
  indexTask: jest.fn().mockResolvedValue(undefined),
  search: jest.fn().mockResolvedValue([oneTask]),
};

describe('TaskService', () => {
  let taskService: TaskService;
  let taskSearchService: TasksSearchService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TaskService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
        {
          provide: TasksSearchService,
          useValue: mockSearchTaskService,
        },
      ],
    }).compile();
    taskService = module.get<TaskService>(TaskService);
    taskSearchService = module.get<TasksSearchService>(TasksSearchService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(taskService).toBeDefined();
  });

  describe('when creating a task', () => {
    const createTaskDto: CreateTaskDto = {
      title: 'title 3',
      description: 'description 3',
      start: new Date(),
      end: new Date(),
      projectId: '1',
      priority: TaskPriority.LOW,
    };

    describe('and project not found', () => {
      beforeEach(() => {
        mockPrisma.project.findUnique.mockResolvedValue(null);
      });
      it('should throw not found exception', async () => {
        await expect(taskService.create(createTaskDto, '1')).rejects.toThrow(
          'Project not found',
        );
      });
    });

    describe('and project found', () => {
      beforeEach(() => {
        mockPrisma.project.findUnique.mockResolvedValue({
          ...oneProject,
          projectMembers: [{ userId: '1' }],
        });
      });
      it('should return created task', async () => {
        const result = await taskService.create(createTaskDto, '1');
        expect(result).toEqual(oneTask);
      });
    });

    describe('when project found but user is not in project', () => {
      beforeEach(() => {
        mockPrisma.project.findUnique.mockResolvedValue({
          ...oneProject,
          projectMembers: [{ userId: '2' }],
        });
      });
      it('should throw forbidden exception', async () => {
        await expect(taskService.create(createTaskDto, '1')).rejects.toThrow(
          'Member not found in project',
        );
      });
    });

    describe('when project found and user in project', () => {
      beforeEach(() => {
        mockPrisma.project.findUnique.mockResolvedValue({
          ...oneProject,
          projectMembers: [{ userId: '1' }],
        });
      });
      it('should return created task', async () => {
        const result = await taskService.create(createTaskDto, '1');
        expect(result).toEqual(oneTask);
      });
    });
  });

  describe('when find all tasks by current user optional elastic', () => {
    describe('and task found and text is null', () => {
      it('should return all suitable tasks ', async () => {
        const result = await taskService.findAllMy('1');
        expect(result).toEqual(taskArray);
      });
    });

    describe('and task found and text is not null', () => {
      beforeEach(() => {
        mockPrisma.task.findMany.mockResolvedValue([oneTask]);
      });
      it('should return all elastic suitable tasks', async () => {
        const result = await taskService.findAllMy('1', 'text');
        expect(result).toEqual([oneTask]);
      });
    });
  });

  describe('when find one task', () => {
    describe('and task found', () => {
      it('should return one task', async () => {
        const result = await taskService.findOne('1');
        expect(result).toEqual(oneTask);
      });
    });

    describe('and task not found', () => {
      beforeEach(() => {
        mockPrisma.task.findUnique.mockResolvedValue(null);
      });
      it('should throw not found exception', async () => {
        await expect(taskService.findOne('1')).rejects.toThrow(
          'Task not found',
        );
      });
    });
  });

  describe('when update one task', () => {
    const updateTaskDto: UpdateTaskDto = {
      description: 'description new',
    };

    describe('and task not found', () => {
      beforeEach(() => {
        mockPrisma.task.findUnique.mockResolvedValue(null);
      });
      it('should throw not found exception', async () => {
        await expect(taskService.update('1', updateTaskDto)).rejects.toThrow(
          'Task not found',
        );
      });
    });

    describe('and task is found', () => {
      beforeEach(() => {
        mockPrisma.task.findUnique.mockResolvedValue(oneTask);

        mockPrisma.task.update.mockResolvedValue({
          ...oneTask,
          description: 'description new',
        });
      });
      it('should return updated task', async () => {
        const result = await taskService.update('1', updateTaskDto);
        expect(result).toEqual({
          ...oneTask,
          ...updateTaskDto,
        });
      });
    });
  });

  describe('when delete one task', () => {
    describe('and task not found', () => {
      beforeEach(() => {
        mockPrisma.task.findUnique.mockResolvedValue(null);
      });
      it('should throw not found exception', async () => {
        await expect(taskService.delete('1')).rejects.toThrow('Task not found');
      });
    });

    describe('and task is found', () => {
      beforeEach(() => {
        mockPrisma.task.findUnique.mockResolvedValue(oneTask);

        mockPrisma.task.delete.mockResolvedValue(undefined);
      });
      it('should return updated task', async () => {
        const result = await taskService.delete('1');
        expect(result).toBeUndefined();
      });
    });
  });
});
