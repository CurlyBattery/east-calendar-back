import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { TasksSearchService } from './task-search.service';
import { SearchModule } from '../search/search.module';

@Module({
  imports: [SearchModule],
  providers: [TaskService, TasksSearchService],
  controllers: [TaskController],
})
export class TaskModule {}
