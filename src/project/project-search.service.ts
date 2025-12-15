import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { Project } from '../../generated/prisma';
import { ProjectSearch } from './interfaces/project-search.interface';

@Injectable()
export class ProjectSearchService {
  index = 'projects';

  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async indexProject(project: Project) {
    return this.elasticsearchService.index<ProjectSearch>({
      index: this.index,
      document: {
        id: project.id,
        name: project.name,
        description: project.description,
      },
    });
  }

  async search(text: string): Promise<ProjectSearch[]> {
    const { hits } = await this.elasticsearchService.search<ProjectSearch>({
      index: this.index,
      query: {
        bool: {
          should: [
            {
              wildcard: {
                name: {
                  value: `*${text.toLowerCase()}*`,
                },
              },
            },
            {
              wildcard: {
                description: {
                  value: `*${text.toLowerCase()}*`,
                },
              },
            },
          ],
        },
      },
    });

    return hits.hits.map((hit) => hit._source);
  }
}
