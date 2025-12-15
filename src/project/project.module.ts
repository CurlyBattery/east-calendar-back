import { Module } from '@nestjs/common';

import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { ProjectSearchService } from './project-search.service';
import { SearchModule } from '../search/search.module';

@Module({
  imports: [SearchModule],
  providers: [ProjectService, ProjectSearchService],
  controllers: [ProjectController],
})
export class ProjectModule {}
