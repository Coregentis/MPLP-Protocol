/**
 * 搜索元数据服务
 * 
 * 基于Schema字段: search_metadata (indexing_strategy, searchable_fields, search_indexes, context_indexing, auto_indexing)
 * 实现搜索索引管理、查询执行、自动索引等功能
 */

import { UUID } from '../../types';

/**
 * 索引策略类型
 */
export type IndexingStrategy = 'full_text' | 'keyword' | 'semantic' | 'hybrid';

/**
 * 可搜索字段类型
 */
export type SearchableField = 
  | 'context_id' 
  | 'context_name' 
  | 'lifecycle_stage' 
  | 'shared_state_keys' 
  | 'context_data' 
  | 'performance_metrics' 
  | 'metadata' 
  | 'audit_logs';

/**
 * 索引类型
 */
export type IndexType = 'btree' | 'hash' | 'gin' | 'gist' | 'full_text';

/**
 * 搜索索引接口
 */
export interface SearchIndex {
  indexId: string;
  indexName: string;
  fields: string[];
  indexType: IndexType;
  createdAt: Date;
  lastUpdated: Date;
}

/**
 * 上下文索引配置接口
 */
export interface ContextIndexingConfig {
  enabled: boolean;
  indexContextData: boolean;
  indexPerformanceMetrics: boolean;
  indexAuditLogs: boolean;
}

/**
 * 自动索引配置接口
 */
export interface AutoIndexingConfig {
  enabled: boolean;
  indexNewContexts: boolean;
  reindexIntervalHours: number;
}

/**
 * 搜索元数据配置接口
 */
export interface SearchMetadataConfig {
  enabled: boolean;
  indexingStrategy: IndexingStrategy;
  searchableFields?: SearchableField[];
  searchIndexes?: SearchIndex[];
  contextIndexing?: ContextIndexingConfig;
  autoIndexing?: AutoIndexingConfig;
}

/**
 * 搜索查询接口
 */
export interface SearchQuery {
  query: string;
  fields?: SearchableField[];
  filters?: Record<string, unknown>;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * 搜索结果接口
 */
export interface SearchResult {
  contextId: UUID;
  score: number;
  highlights: Record<string, string[]>;
  matchedFields: SearchableField[];
  data: Record<string, unknown>;
}

/**
 * 搜索响应接口
 */
export interface SearchResponse {
  results: SearchResult[];
  totalCount: number;
  query: SearchQuery;
  executionTime: number;
  suggestions?: string[];
}

/**
 * 索引统计接口
 */
export interface IndexStatistics {
  totalIndexes: number;
  totalDocuments: number;
  indexSizes: Record<string, number>;
  searchQueries: number;
  averageQueryTime: number;
  indexingOperations: number;
  lastReindexTime?: Date;
}

/**
 * 搜索元数据服务
 */
export class SearchMetadataService {
  private config: SearchMetadataConfig;
  private statistics: IndexStatistics;
  private documentStore = new Map<UUID, Record<string, unknown>>();
  private indexedDocuments = new Map<string, Set<UUID>>();
  private queryHistory: Array<{ query: SearchQuery; timestamp: Date; executionTime: number }> = [];

  constructor(config?: Partial<SearchMetadataConfig>) {
    this.config = {
      enabled: true,
      indexingStrategy: 'full_text',
      searchableFields: ['context_id', 'context_name', 'lifecycle_stage'],
      searchIndexes: [],
      contextIndexing: {
        enabled: true,
        indexContextData: true,
        indexPerformanceMetrics: false,
        indexAuditLogs: false
      },
      autoIndexing: {
        enabled: true,
        indexNewContexts: true,
        reindexIntervalHours: 24
      },
      ...config
    };

    this.statistics = {
      totalIndexes: 0,
      totalDocuments: 0,
      indexSizes: {},
      searchQueries: 0,
      averageQueryTime: 0,
      indexingOperations: 0
    };

    this.initializeIndexes();
  }

  /**
   * 创建搜索索引
   */
  async createIndex(index: Omit<SearchIndex, 'createdAt' | 'lastUpdated'>): Promise<boolean> {
    if (!this.config.enabled) {
      return false;
    }

    try {
      // 检查索引是否已存在
      const existingIndexes = this.config.searchIndexes || [];
      const existingIndex = existingIndexes.find(i => i.indexId === index.indexId);
      
      if (existingIndex) {
        return false; // 索引已存在
      }

      // 创建新索引
      const newIndex: SearchIndex = {
        ...index,
        createdAt: new Date(),
        lastUpdated: new Date()
      };

      this.config.searchIndexes = [...existingIndexes, newIndex];
      
      // 初始化索引统计
      this.statistics.totalIndexes++;
      this.statistics.indexSizes[index.indexId] = 0;
      this.indexedDocuments.set(index.indexId, new Set());

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 删除搜索索引
   */
  async deleteIndex(indexId: string): Promise<boolean> {
    try {
      const indexes = this.config.searchIndexes || [];
      const filteredIndexes = indexes.filter(i => i.indexId !== indexId);
      
      if (filteredIndexes.length === indexes.length) {
        return false; // 索引不存在
      }

      this.config.searchIndexes = filteredIndexes;
      this.statistics.totalIndexes--;
      delete this.statistics.indexSizes[indexId];
      this.indexedDocuments.delete(indexId);

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 索引文档
   */
  async indexDocument(contextId: UUID, document: Record<string, unknown>): Promise<boolean> {
    if (!this.config.enabled) {
      return false;
    }

    try {
      // 存储文档
      this.documentStore.set(contextId, document);
      
      // 为每个索引添加文档
      for (const index of this.config.searchIndexes || []) {
        const indexedDocs = this.indexedDocuments.get(index.indexId) || new Set();
        indexedDocs.add(contextId);
        this.indexedDocuments.set(index.indexId, indexedDocs);
        
        // 更新索引大小
        this.statistics.indexSizes[index.indexId] = indexedDocs.size;
      }

      this.statistics.totalDocuments = this.documentStore.size;
      this.statistics.indexingOperations++;

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 移除文档索引
   */
  async removeDocument(contextId: UUID): Promise<boolean> {
    try {
      // 从文档存储中移除
      const removed = this.documentStore.delete(contextId);
      
      if (!removed) {
        return false; // 文档不存在
      }

      // 从所有索引中移除
      for (const index of this.config.searchIndexes || []) {
        const indexedDocs = this.indexedDocuments.get(index.indexId);
        if (indexedDocs) {
          indexedDocs.delete(contextId);
          this.statistics.indexSizes[index.indexId] = indexedDocs.size;
        }
      }

      this.statistics.totalDocuments = this.documentStore.size;

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 执行搜索
   */
  async search(query: SearchQuery): Promise<SearchResponse> {
    const startTime = Date.now();
    
    if (!this.config.enabled) {
      return {
        results: [],
        totalCount: 0,
        query,
        executionTime: 0
      };
    }

    try {
      const results = await this.performSearch(query);
      const executionTime = Date.now() - startTime;

      // 记录查询历史
      this.queryHistory.push({
        query,
        timestamp: new Date(),
        executionTime
      });

      // 限制历史记录数量
      if (this.queryHistory.length > 1000) {
        this.queryHistory.shift();
      }

      // 更新统计
      this.statistics.searchQueries++;
      this.updateAverageQueryTime(executionTime);

      const response: SearchResponse = {
        results,
        totalCount: results.length,
        query,
        executionTime
      };

      // 添加搜索建议
      if (results.length === 0) {
        response.suggestions = this.generateSuggestions(query.query);
      }

      return response;

    } catch (error) {
      return {
        results: [],
        totalCount: 0,
        query,
        executionTime: Date.now() - startTime
      };
    }
  }

  /**
   * 重建索引
   */
  async reindexAll(): Promise<boolean> {
    if (!this.config.enabled) {
      return false;
    }

    try {
      // 清空所有索引
      for (const index of this.config.searchIndexes || []) {
        this.indexedDocuments.set(index.indexId, new Set());
        this.statistics.indexSizes[index.indexId] = 0;
      }

      // 重新索引所有文档
      for (const [contextId, document] of this.documentStore.entries()) {
        await this.indexDocument(contextId, document);
      }

      this.statistics.lastReindexTime = new Date();
      return true;

    } catch (error) {
      return false;
    }
  }

  /**
   * 获取索引统计
   */
  getStatistics(): IndexStatistics {
    return { ...this.statistics };
  }

  /**
   * 获取查询历史
   */
  getQueryHistory(limit: number = 100): Array<{ query: SearchQuery; timestamp: Date; executionTime: number }> {
    return this.queryHistory.slice(-limit);
  }

  /**
   * 获取健康状态
   */
  getHealthStatus(): {
    overall: 'healthy' | 'degraded' | 'unhealthy';
    indexes: Record<string, 'healthy' | 'degraded' | 'unhealthy'>;
    issues: string[];
  } {
    const issues: string[] = [];
    const indexes: Record<string, 'healthy' | 'degraded' | 'unhealthy'> = {};
    
    let healthyIndexes = 0;
    let totalIndexes = 0;

    for (const index of this.config.searchIndexes || []) {
      totalIndexes++;
      const indexSize = this.statistics.indexSizes[index.indexId] || 0;
      const lastUpdated = index.lastUpdated;
      const hoursSinceUpdate = (Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60);

      if (indexSize === 0 && this.statistics.totalDocuments > 0) {
        indexes[index.indexId] = 'unhealthy';
        issues.push(`Index ${index.indexId} is empty but documents exist`);
      } else if (hoursSinceUpdate > 48) {
        indexes[index.indexId] = 'degraded';
        issues.push(`Index ${index.indexId} hasn't been updated for ${hoursSinceUpdate.toFixed(1)} hours`);
      } else {
        indexes[index.indexId] = 'healthy';
        healthyIndexes++;
      }
    }

    // 检查查询性能
    if (this.statistics.averageQueryTime > 1000) {
      issues.push(`Average query time is high: ${this.statistics.averageQueryTime}ms`);
    }

    let overall: 'healthy' | 'degraded' | 'unhealthy';
    if (totalIndexes === 0) {
      overall = 'healthy'; // 没有索引时认为是健康的
    } else if (healthyIndexes === totalIndexes) {
      overall = 'healthy';
    } else if (healthyIndexes > 0) {
      overall = 'degraded';
    } else {
      overall = 'unhealthy';
    }

    return { overall, indexes, issues };
  }

  /**
   * 更新配置
   */
  async updateConfig(newConfig: Partial<SearchMetadataConfig>): Promise<boolean> {
    try {
      this.config = { ...this.config, ...newConfig };
      
      // 如果索引策略发生变化，重建索引
      if (newConfig.indexingStrategy) {
        await this.reindexAll();
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 获取默认配置
   */
  getDefaultConfig(): SearchMetadataConfig {
    return {
      enabled: true,
      indexingStrategy: 'hybrid',
      searchableFields: [
        'context_id', 'context_name', 'lifecycle_stage', 
        'shared_state_keys', 'context_data', 'metadata'
      ],
      searchIndexes: [
        {
          indexId: 'primary_search',
          indexName: 'Primary Search Index',
          fields: ['context_name', 'context_data'],
          indexType: 'full_text',
          createdAt: new Date(),
          lastUpdated: new Date()
        },
        {
          indexId: 'metadata_search',
          indexName: 'Metadata Search Index',
          fields: ['metadata', 'lifecycle_stage'],
          indexType: 'gin',
          createdAt: new Date(),
          lastUpdated: new Date()
        }
      ],
      contextIndexing: {
        enabled: true,
        indexContextData: true,
        indexPerformanceMetrics: true,
        indexAuditLogs: false
      },
      autoIndexing: {
        enabled: true,
        indexNewContexts: true,
        reindexIntervalHours: 12
      }
    };
  }

  // 私有方法
  private initializeIndexes(): void {
    for (const index of this.config.searchIndexes || []) {
      this.indexedDocuments.set(index.indexId, new Set());
      this.statistics.indexSizes[index.indexId] = 0;
    }
    this.statistics.totalIndexes = (this.config.searchIndexes || []).length;
  }

  private async performSearch(query: SearchQuery): Promise<SearchResult[]> {
    // 添加小延迟以确保有执行时间
    await new Promise(resolve => setTimeout(resolve, 1));

    const results: SearchResult[] = [];
    const searchFields = query.fields || this.config.searchableFields || [];
    const queryText = query.query.toLowerCase();

    // 简单的搜索实现
    for (const [contextId, document] of this.documentStore.entries()) {
      let score = 0;
      const highlights: Record<string, string[]> = {};
      const matchedFields: SearchableField[] = [];

      // 在指定字段中搜索
      for (const field of searchFields) {
        const fieldValue = document[field];
        if (fieldValue && typeof fieldValue === 'string') {
          const fieldText = fieldValue.toLowerCase();
          
          if (fieldText.includes(queryText)) {
            score += this.calculateFieldScore(field, fieldText, queryText);
            matchedFields.push(field);
            highlights[field] = this.generateHighlights(fieldValue, query.query);
          }
        }
      }

      // 应用过滤器
      if (score > 0 && this.matchesFilters(document, query.filters)) {
        results.push({
          contextId,
          score,
          highlights,
          matchedFields,
          data: document
        });
      }
    }

    // 排序结果
    results.sort((a, b) => {
      if (query.sortBy) {
        const aValue = a.data[query.sortBy] as string | number;
        const bValue = b.data[query.sortBy] as string | number;
        const order = query.sortOrder === 'desc' ? -1 : 1;

        if (aValue < bValue) return -1 * order;
        if (aValue > bValue) return 1 * order;
        return 0;
      }
      
      return b.score - a.score; // 默认按分数降序
    });

    // 应用分页
    const offset = query.offset || 0;
    const limit = query.limit || 50;
    
    return results.slice(offset, offset + limit);
  }

  private calculateFieldScore(field: SearchableField, fieldText: string, queryText: string): number {
    // 根据字段类型和匹配程度计算分数
    const fieldWeights: Record<SearchableField, number> = {
      'context_id': 10,
      'context_name': 8,
      'lifecycle_stage': 6,
      'shared_state_keys': 5,
      'context_data': 4,
      'performance_metrics': 3,
      'metadata': 4,
      'audit_logs': 2
    };

    const weight = fieldWeights[field] || 1;
    
    // 精确匹配得分更高
    if (fieldText === queryText) {
      return weight * 10;
    }
    
    // 开头匹配得分较高
    if (fieldText.startsWith(queryText)) {
      return weight * 5;
    }
    
    // 包含匹配基础分数
    return weight;
  }

  private generateHighlights(text: string, query: string): string[] {
    const highlights: string[] = [];
    const queryLower = query.toLowerCase();
    const textLower = text.toLowerCase();
    
    let index = textLower.indexOf(queryLower);
    while (index !== -1) {
      const start = Math.max(0, index - 20);
      const end = Math.min(text.length, index + query.length + 20);
      const highlight = text.substring(start, end);
      highlights.push(highlight);
      
      index = textLower.indexOf(queryLower, index + 1);
      if (highlights.length >= 3) break; // 限制高亮数量
    }
    
    return highlights;
  }

  private matchesFilters(document: Record<string, unknown>, filters?: Record<string, unknown>): boolean {
    if (!filters) return true;
    
    for (const [key, value] of Object.entries(filters)) {
      const docValue = document[key];
      
      if (Array.isArray(value)) {
        if (!value.includes(docValue)) return false;
      } else if (docValue !== value) {
        return false;
      }
    }
    
    return true;
  }

  private generateSuggestions(query: string): string[] {
    const _suggestions: string[] = []; // TODO: 实现建议生成逻辑
    const queryLower = query.toLowerCase();
    
    // 基于现有文档生成建议
    const terms = new Set<string>();
    
    for (const document of this.documentStore.values()) {
      for (const field of this.config.searchableFields || []) {
        const value = document[field];
        if (typeof value === 'string') {
          const words = value.toLowerCase().split(/\s+/);
          words.forEach(word => {
            if (word.includes(queryLower) && word !== queryLower) {
              terms.add(word);
            }
          });
        }
      }
    }
    
    return Array.from(terms).slice(0, 5);
  }

  private updateAverageQueryTime(executionTime: number): void {
    const totalQueries = this.statistics.searchQueries;
    const currentAverage = this.statistics.averageQueryTime;
    
    this.statistics.averageQueryTime = 
      (currentAverage * (totalQueries - 1) + executionTime) / totalQueries;
  }
}
