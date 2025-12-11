import { Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { EnvModule, EnvService } from '@app/common';

@Module({
  imports: [
    EnvModule,
    ElasticsearchModule.registerAsync({
      imports: [EnvModule],
      inject: [EnvService],
      useFactory: async (envService: EnvService) => ({
        node: envService.get('ELASTICSEARCH_NODE'),
        auth: {
          username: 'elastic',
          password: 'changeme',
        },
      }),
    }),
  ],
  exports: [ElasticsearchModule],
})
export class SearchModule {}
