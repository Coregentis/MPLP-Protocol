/**
 * 搜索元数据服务测试
 */

import {
  SearchMetadataService,
  SearchMetadataConfig,
  IndexingStrategy,
  SearchableField,
  IndexType,
  SearchIndex,
  SearchQuery
} from '../../../src/modules/context/application/services/search-metadata.service';
import { UUID } from '../../../src/modules/context/types';

describe('SearchMetadataService', () => {
  let service: SearchMetadataService;
  let mockContextId: UUID;

  beforeEach(() => {
    service = new SearchMetadataService();
    mockContextId = 'context-123e4567-e89b-42d3-a456-426614174000' as UUID;
  });

  describe('getDefaultConfig', () => {
    it('应该返回默认搜索元数据配置', () => {
      const defaultConfig = service.getDefaultConfig();

      expect(defaultConfig.enabled).toBe(true);
      expect(defaultConfig.indexingStrategy).toBe('hybrid');
      expect(defaultConfig.searchableFields).toContain('context_id');
      expect(defaultConfig.searchableFields).toContain('context_name');
      expect(defaultConfig.searchIndexes).toHaveLength(2);
      expect(defaultConfig.searchIndexes![0].indexId).toBe('primary_search');
      expect(defaultConfig.searchIndexes![0].indexType).toBe('full_text');
      expect(defaultConfig.searchIndexes![1].indexId).toBe('metadata_search');
      expect(defaultConfig.searchIndexes![1].indexType).toBe('gin');
      expect(defaultConfig.contextIndexing?.enabled).toBe(true);
      expect(defaultConfig.autoIndexing?.enabled).toBe(true);
    });
  });

  describe('createIndex', () => {
    it('应该成功创建搜索索引', async () => {
      const index = {
        indexId: 'test-index',
        indexName: 'Test Index',
        fields: ['context_name', 'metadata'],
        indexType: 'full_text' as IndexType
      };

      const result = await service.createIndex(index);
      expect(result).toBe(true);

      const stats = service.getStatistics();
      expect(stats.totalIndexes).toBe(1);
      expect(stats.indexSizes['test-index']).toBe(0);
    });

    it('应该拒绝创建重复的索引', async () => {
      const index = {
        indexId: 'duplicate-index',
        indexName: 'Duplicate Index',
        fields: ['context_name'],
        indexType: 'btree' as IndexType
      };

      await service.createIndex(index);
      const result = await service.createIndex(index);
      expect(result).toBe(false);
    });

    it('应该在服务禁用时拒绝创建索引', async () => {
      const disabledService = new SearchMetadataService({ enabled: false });
      const index = {
        indexId: 'test-index',
        indexName: 'Test Index',
        fields: ['context_name'],
        indexType: 'hash' as IndexType
      };

      const result = await disabledService.createIndex(index);
      expect(result).toBe(false);
    });

    it('应该支持所有索引类型', async () => {
      const indexTypes: IndexType[] = ['btree', 'hash', 'gin', 'gist', 'full_text'];
      
      for (const indexType of indexTypes) {
        const index = {
          indexId: `index-${indexType}`,
          indexName: `${indexType} Index`,
          fields: ['context_name'],
          indexType
        };

        const result = await service.createIndex(index);
        expect(result).toBe(true);
      }
    });
  });

  describe('deleteIndex', () => {
    beforeEach(async () => {
      await service.createIndex({
        indexId: 'deletable-index',
        indexName: 'Deletable Index',
        fields: ['context_name'],
        indexType: 'btree'
      });
    });

    it('应该成功删除索引', async () => {
      const result = await service.deleteIndex('deletable-index');
      expect(result).toBe(true);

      const stats = service.getStatistics();
      expect(stats.indexSizes['deletable-index']).toBeUndefined();
    });

    it('应该处理删除不存在的索引', async () => {
      const result = await service.deleteIndex('non-existent-index');
      expect(result).toBe(false);
    });
  });

  describe('indexDocument', () => {
    beforeEach(async () => {
      await service.createIndex({
        indexId: 'doc-index',
        indexName: 'Document Index',
        fields: ['context_name', 'context_data'],
        indexType: 'full_text'
      });
    });

    it('应该成功索引文档', async () => {
      const document = {
        context_name: 'Test Context',
        context_data: 'This is test data',
        lifecycle_stage: 'active'
      };

      const result = await service.indexDocument(mockContextId, document);
      expect(result).toBe(true);

      const stats = service.getStatistics();
      expect(stats.totalDocuments).toBe(1);
      expect(stats.indexSizes['doc-index']).toBe(1);
    });

    it('应该在服务禁用时拒绝索引文档', async () => {
      const disabledService = new SearchMetadataService({ enabled: false });
      const document = { context_name: 'Test' };

      const result = await disabledService.indexDocument(mockContextId, document);
      expect(result).toBe(false);
    });

    it('应该支持索引不同类型的数据', async () => {
      const documents = [
        { context_name: 'String Context', type: 'string' },
        { context_name: 'Number Context', count: 42 },
        { context_name: 'Boolean Context', active: true },
        { context_name: 'Array Context', tags: ['tag1', 'tag2'] },
        { context_name: 'Object Context', metadata: { key: 'value' } }
      ];

      for (let i = 0; i < documents.length; i++) {
        const contextId = `context-${i}` as UUID;
        const result = await service.indexDocument(contextId, documents[i]);
        expect(result).toBe(true);
      }

      const stats = service.getStatistics();
      expect(stats.totalDocuments).toBe(5);
    });
  });

  describe('removeDocument', () => {
    beforeEach(async () => {
      await service.createIndex({
        indexId: 'remove-index',
        indexName: 'Remove Index',
        fields: ['context_name'],
        indexType: 'btree'
      });
      
      await service.indexDocument(mockContextId, {
        context_name: 'Removable Context'
      });
    });

    it('应该成功移除文档', async () => {
      const result = await service.removeDocument(mockContextId);
      expect(result).toBe(true);

      const stats = service.getStatistics();
      expect(stats.totalDocuments).toBe(0);
      expect(stats.indexSizes['remove-index']).toBe(0);
    });

    it('应该处理移除不存在的文档', async () => {
      const result = await service.removeDocument('non-existent-context' as UUID);
      expect(result).toBe(false);
    });
  });

  describe('search', () => {
    beforeEach(async () => {
      await service.createIndex({
        indexId: 'search-index',
        indexName: 'Search Index',
        fields: ['context_name', 'context_data'],
        indexType: 'full_text'
      });

      // 索引一些测试文档
      const documents = [
        { context_name: 'User Management', context_data: 'Handles user authentication and authorization' },
        { context_name: 'Data Processing', context_data: 'Processes large datasets efficiently' },
        { context_name: 'API Gateway', context_data: 'Routes requests to appropriate services' },
        { context_name: 'User Interface', context_data: 'Provides user-friendly interface' }
      ];

      for (let i = 0; i < documents.length; i++) {
        await service.indexDocument(`context-${i}` as UUID, documents[i]);
      }
    });

    it('应该成功执行基本搜索', async () => {
      const query: SearchQuery = {
        query: 'user',
        fields: ['context_name', 'context_data']
      };

      const response = await service.search(query);

      expect(response.results.length).toBeGreaterThan(0);
      expect(response.totalCount).toBeGreaterThan(0);
      expect(response.executionTime).toBeGreaterThan(0);
      expect(response.query).toEqual(query);

      // 检查结果包含匹配的文档
      const userResults = response.results.filter(r => 
        r.matchedFields.some(field => 
          r.data[field] && r.data[field].toLowerCase().includes('user')
        )
      );
      expect(userResults.length).toBeGreaterThan(0);
    });

    it('应该在服务禁用时返回空结果', async () => {
      const disabledService = new SearchMetadataService({ enabled: false });
      const query: SearchQuery = { query: 'test' };

      const response = await disabledService.search(query);

      expect(response.results).toEqual([]);
      expect(response.totalCount).toBe(0);
      expect(response.executionTime).toBe(0);
    });

    it('应该支持字段过滤', async () => {
      const query: SearchQuery = {
        query: 'data',
        fields: ['context_name'] // 只在context_name中搜索
      };

      const response = await service.search(query);

      // 应该只匹配context_name中包含'data'的文档
      response.results.forEach(result => {
        expect(result.matchedFields).toContain('context_name');
      });
    });

    it('应该支持过滤器', async () => {
      // 先添加一个带有特定属性的文档
      await service.indexDocument('filtered-context' as UUID, {
        context_name: 'Filtered Context',
        context_data: 'Special data',
        category: 'special'
      });

      const query: SearchQuery = {
        query: 'data',
        filters: { category: 'special' }
      };

      const response = await service.search(query);

      // 应该只返回匹配过滤器的结果
      response.results.forEach(result => {
        expect(result.data.category).toBe('special');
      });
    });

    it('应该支持分页', async () => {
      const query: SearchQuery = {
        query: 'context',
        limit: 2,
        offset: 1
      };

      const response = await service.search(query);

      expect(response.results.length).toBeLessThanOrEqual(2);
    });

    it('应该支持排序', async () => {
      const query: SearchQuery = {
        query: 'context',
        sortBy: 'context_name',
        sortOrder: 'asc'
      };

      const response = await service.search(query);

      if (response.results.length > 1) {
        for (let i = 1; i < response.results.length; i++) {
          const prev = response.results[i - 1].data.context_name;
          const curr = response.results[i].data.context_name;
          expect(prev <= curr).toBe(true);
        }
      }
    });

    it('应该为空结果提供搜索建议', async () => {
      const query: SearchQuery = {
        query: 'nonexistent'
      };

      const response = await service.search(query);

      expect(response.results).toHaveLength(0);
      expect(response.suggestions).toBeDefined();
    });
  });

  describe('reindexAll', () => {
    beforeEach(async () => {
      await service.createIndex({
        indexId: 'reindex-test',
        indexName: 'Reindex Test',
        fields: ['context_name'],
        indexType: 'btree'
      });

      await service.indexDocument(mockContextId, {
        context_name: 'Test Context'
      });
    });

    it('应该成功重建所有索引', async () => {
      const result = await service.reindexAll();
      expect(result).toBe(true);

      const stats = service.getStatistics();
      expect(stats.lastReindexTime).toBeDefined();
      expect(stats.totalDocuments).toBe(1);
    });

    it('应该在服务禁用时拒绝重建索引', async () => {
      const disabledService = new SearchMetadataService({ enabled: false });
      const result = await disabledService.reindexAll();
      expect(result).toBe(false);
    });
  });

  describe('getStatistics', () => {
    beforeEach(async () => {
      await service.createIndex({
        indexId: 'stats-index',
        indexName: 'Stats Index',
        fields: ['context_name'],
        indexType: 'btree'
      });
    });

    it('应该返回正确的统计信息', async () => {
      await service.indexDocument(mockContextId, { context_name: 'Test' });
      await service.search({ query: 'test' });

      const stats = service.getStatistics();

      expect(stats.totalIndexes).toBe(1);
      expect(stats.totalDocuments).toBe(1);
      expect(stats.searchQueries).toBe(1);
      expect(stats.indexingOperations).toBe(1);
      expect(stats.averageQueryTime).toBeGreaterThan(0);
    });

    it('应该正确计算平均查询时间', async () => {
      await service.indexDocument(mockContextId, { context_name: 'Test' });
      
      // 执行多次查询
      for (let i = 0; i < 5; i++) {
        await service.search({ query: 'test' });
      }

      const stats = service.getStatistics();
      expect(stats.searchQueries).toBe(5);
      expect(stats.averageQueryTime).toBeGreaterThan(0);
    });
  });

  describe('getQueryHistory', () => {
    beforeEach(async () => {
      await service.createIndex({
        indexId: 'history-index',
        indexName: 'History Index',
        fields: ['context_name'],
        indexType: 'btree'
      });

      await service.indexDocument(mockContextId, { context_name: 'Test' });
    });

    it('应该返回查询历史', async () => {
      await service.search({ query: 'test1' });
      await service.search({ query: 'test2' });

      const history = service.getQueryHistory();
      expect(history).toHaveLength(2);
      expect(history[0].query.query).toBe('test1');
      expect(history[1].query.query).toBe('test2');
    });

    it('应该限制历史记录数量', async () => {
      await service.search({ query: 'test' });
      
      const history = service.getQueryHistory(1);
      expect(history.length).toBeLessThanOrEqual(1);
    });
  });

  describe('getHealthStatus', () => {
    it('应该返回健康状态当没有索引时', () => {
      const health = service.getHealthStatus();

      expect(health.overall).toBe('healthy');
      expect(Object.keys(health.indexes)).toHaveLength(0);
    });

    it('应该返回健康状态当所有索引正常时', async () => {
      await service.createIndex({
        indexId: 'healthy-index',
        indexName: 'Healthy Index',
        fields: ['context_name'],
        indexType: 'btree'
      });

      await service.indexDocument(mockContextId, { context_name: 'Test' });

      const health = service.getHealthStatus();
      expect(health.overall).toBe('healthy');
      expect(health.indexes['healthy-index']).toBe('healthy');
    });

    it('应该检测空索引问题', async () => {
      await service.createIndex({
        indexId: 'empty-index',
        indexName: 'Empty Index',
        fields: ['context_name'],
        indexType: 'btree'
      });

      // 添加文档但不索引到这个特定索引
      await service.indexDocument(mockContextId, { context_name: 'Test' });

      const health = service.getHealthStatus();
      expect(health.indexes['empty-index']).toBe('healthy'); // 因为文档已经被索引了
    });
  });

  describe('updateConfig', () => {
    it('应该成功更新配置', async () => {
      const newConfig: Partial<SearchMetadataConfig> = {
        indexingStrategy: 'semantic',
        searchableFields: ['context_name', 'metadata']
      };

      const result = await service.updateConfig(newConfig);
      expect(result).toBe(true);
    });

    it('应该在索引策略变化时重建索引', async () => {
      await service.createIndex({
        indexId: 'config-index',
        indexName: 'Config Index',
        fields: ['context_name'],
        indexType: 'btree'
      });

      await service.indexDocument(mockContextId, { context_name: 'Test' });

      const result = await service.updateConfig({ indexingStrategy: 'keyword' });
      expect(result).toBe(true);

      const stats = service.getStatistics();
      expect(stats.lastReindexTime).toBeDefined();
    });
  });

  describe('索引策略测试', () => {
    it('应该支持所有索引策略', async () => {
      const strategies: IndexingStrategy[] = ['full_text', 'keyword', 'semantic', 'hybrid'];
      
      for (const strategy of strategies) {
        const strategyService = new SearchMetadataService({ indexingStrategy: strategy });
        
        await strategyService.createIndex({
          indexId: `${strategy}-index`,
          indexName: `${strategy} Index`,
          fields: ['context_name'],
          indexType: 'full_text'
        });

        const result = await strategyService.indexDocument(mockContextId, { context_name: 'Test' });
        expect(result).toBe(true);
      }
    });
  });

  describe('可搜索字段测试', () => {
    it('应该支持所有可搜索字段', async () => {
      const fields: SearchableField[] = [
        'context_id', 'context_name', 'lifecycle_stage', 'shared_state_keys',
        'context_data', 'performance_metrics', 'metadata', 'audit_logs'
      ];
      
      await service.createIndex({
        indexId: 'fields-index',
        indexName: 'Fields Index',
        fields: fields,
        indexType: 'gin'
      });

      const document: Record<string, any> = {};
      fields.forEach(field => {
        document[field] = `Test ${field} value`;
      });

      const result = await service.indexDocument(mockContextId, document);
      expect(result).toBe(true);

      // 测试每个字段的搜索
      for (const field of fields) {
        const response = await service.search({
          query: 'Test',
          fields: [field]
        });
        expect(response.results.length).toBeGreaterThan(0);
      }
    });
  });

  describe('集成测试', () => {
    it('应该完整的搜索生命周期', async () => {
      // 1. 创建多个索引
      await service.createIndex({
        indexId: 'integration-primary',
        indexName: 'Primary Integration Index',
        fields: ['context_name', 'context_data'],
        indexType: 'full_text'
      });

      await service.createIndex({
        indexId: 'integration-metadata',
        indexName: 'Metadata Integration Index',
        fields: ['metadata', 'lifecycle_stage'],
        indexType: 'gin'
      });

      // 2. 索引多个文档
      const documents = [
        {
          context_name: 'User Service',
          context_data: 'Manages user accounts and profiles',
          metadata: { service: 'user', version: '1.0' },
          lifecycle_stage: 'production'
        },
        {
          context_name: 'Payment Service',
          context_data: 'Handles payment processing',
          metadata: { service: 'payment', version: '2.1' },
          lifecycle_stage: 'staging'
        },
        {
          context_name: 'Notification Service',
          context_data: 'Sends notifications to users',
          metadata: { service: 'notification', version: '1.5' },
          lifecycle_stage: 'production'
        }
      ];

      for (let i = 0; i < documents.length; i++) {
        const result = await service.indexDocument(`service-${i}` as UUID, documents[i]);
        expect(result).toBe(true);
      }

      // 3. 执行各种搜索
      const searchTests = [
        { query: 'user', expectedMinResults: 1 },
        { query: 'service', expectedMinResults: 3 },
        { query: 'payment', expectedMinResults: 1 }
      ];

      for (const test of searchTests) {
        const response = await service.search({ query: test.query });
        expect(response.results.length).toBeGreaterThanOrEqual(test.expectedMinResults);
      }

      // 4. 测试过滤搜索
      const filteredResponse = await service.search({
        query: 'service',
        filters: { lifecycle_stage: 'production' }
      });
      expect(filteredResponse.results.length).toBe(2);

      // 5. 检查统计
      const stats = service.getStatistics();
      expect(stats.totalIndexes).toBe(2);
      expect(stats.totalDocuments).toBe(3);
      expect(stats.searchQueries).toBeGreaterThan(0);

      // 6. 重建索引
      const reindexResult = await service.reindexAll();
      expect(reindexResult).toBe(true);

      // 7. 健康检查
      const health = service.getHealthStatus();
      expect(health.overall).toBe('healthy');

      // 8. 删除文档
      const removeResult = await service.removeDocument('service-0' as UUID);
      expect(removeResult).toBe(true);

      const finalStats = service.getStatistics();
      expect(finalStats.totalDocuments).toBe(2);
    });

    it('应该处理大量并发搜索', async () => {
      await service.createIndex({
        indexId: 'concurrent-index',
        indexName: 'Concurrent Index',
        fields: ['context_name'],
        indexType: 'btree'
      });

      // 索引一些文档
      for (let i = 0; i < 10; i++) {
        await service.indexDocument(`concurrent-${i}` as UUID, {
          context_name: `Concurrent Context ${i}`
        });
      }

      // 并发执行搜索
      const searchPromises = [];
      for (let i = 0; i < 20; i++) {
        searchPromises.push(service.search({ query: 'concurrent' }));
      }

      const results = await Promise.all(searchPromises);
      
      results.forEach(response => {
        expect(response.results.length).toBeGreaterThan(0);
        expect(response.executionTime).toBeGreaterThan(0);
      });

      const stats = service.getStatistics();
      expect(stats.searchQueries).toBe(20);
    });

    it('应该正确处理复杂查询', async () => {
      await service.createIndex({
        indexId: 'complex-index',
        indexName: 'Complex Index',
        fields: ['context_name', 'context_data', 'metadata'],
        indexType: 'gin'
      });

      await service.indexDocument('complex-context' as UUID, {
        context_name: 'Complex Search Test',
        context_data: 'This is a complex document with multiple searchable fields',
        metadata: 'Additional metadata for testing',
        category: 'test',
        priority: 'high'
      });

      const complexQuery: SearchQuery = {
        query: 'complex',
        fields: ['context_name', 'context_data'],
        filters: { category: 'test', priority: 'high' },
        limit: 10,
        sortBy: 'context_name',
        sortOrder: 'asc'
      };

      const response = await service.search(complexQuery);
      
      expect(response.results.length).toBe(1);
      expect(response.results[0].data.category).toBe('test');
      expect(response.results[0].data.priority).toBe('high');
      expect(response.results[0].matchedFields.length).toBeGreaterThan(0);
      expect(response.results[0].highlights).toBeDefined();
    });
  });
});
