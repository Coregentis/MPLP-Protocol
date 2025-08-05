# Context协议统一标准接口设计

## 🎯 **设计目标**

### **协议统一性原则**
重新设计Context协议的完整统一标准接口，确保：
- ✅ **只有一套标准接口**：整合上下文管理和知识库管理为统一接口
- ✅ **参数化配置**：通过配置参数支持从基础上下文到复杂知识库的所有需求
- ✅ **厂商中立性**：接口抽象通用，不绑定特定知识库实现或存储
- ✅ **向后兼容性**：现有上下文管理功能通过新接口的基础配置实现

### **支持的应用场景**
通过统一接口和参数配置支持：
- **基础上下文管理**：项目状态、变量管理（现有功能）
- **知识库集成**：多层次知识存储、检索（TracePilot需求）
- **版本控制**：知识版本管理、冲突解决（TracePilot需求）
- **访问权限**：知识访问控制、共享机制（TracePilot需求）

## 📋 **Context协议统一标准接口**

### **核心上下文管理接口**

```typescript
/**
 * Context协议统一标准接口
 * 整合上下文管理和知识库管理为一套完整接口
 */
export interface ContextProtocol {
  
  /**
   * 创建上下文空间
   * 支持从简单上下文到复杂知识库的所有类型
   */
  createContext(request: CreateContextRequest): Promise<ContextResponse>;
  
  /**
   * 更新上下文配置
   * 支持动态调整上下文策略和知识库配置
   */
  updateContext(request: UpdateContextRequest): Promise<ContextResponse>;
  
  /**
   * 管理上下文内容
   * 统一的内容管理接口，支持数据存储、知识管理等
   */
  manageContent(request: ContentManagementRequest): Promise<ContentResponse>;
  
  /**
   * 查询上下文内容
   * 统一的查询接口，根据配置提供不同查询能力
   */
  queryContent(request: ContentQueryRequest): Promise<ContentQueryResponse>;
  
  /**
   * 获取上下文状态
   * 查询上下文健康度、知识库状态、版本信息等
   */
  getContextStatus(contextId: string, options?: StatusOptions): Promise<ContextStatusResponse>;
  
  /**
   * 同步上下文
   * 统一的同步接口，支持上下文同步和知识库同步
   */
  synchronizeContext(request: SynchronizationRequest): Promise<SynchronizationResponse>;
  
  /**
   * 删除上下文
   * 标准的上下文删除接口
   */
  deleteContext(contextId: string, options?: DeleteOptions): Promise<DeleteResponse>;
  
  /**
   * 查询上下文列表
   * 支持多种过滤和排序条件
   */
  queryContexts(filter: ContextFilter): Promise<QueryContextResponse>;
}
```

### **统一数据类型定义**

```typescript
/**
 * 上下文创建请求
 * 通过type和capabilities配置控制上下文类型和能力
 */
export interface CreateContextRequest {
  name: string;
  description?: string;
  
  // 上下文类型 - 核心区分参数
  type: ContextType;
  
  // 上下文能力配置
  capabilities: ContextCapabilities;
  
  // 初始内容
  initialContent?: ContextContent;
  
  // 上下文配置
  configuration?: ContextConfiguration;
  
  metadata?: Record<string, any>;
}

/**
 * 上下文类型
 */
export type ContextType = 
  | 'simple'           // 简单上下文
  | 'project'          // 项目上下文
  | 'session'          // 会话上下文
  | 'knowledge_base'   // 知识库上下文
  | 'collaborative'    // 协作上下文
  | 'persistent'       // 持久化上下文
  | 'distributed';     // 分布式上下文

/**
 * 上下文能力配置
 * 根据上下文类型提供不同的能力配置
 */
export interface ContextCapabilities {
  // 基础存储能力（所有类型都有）
  storage: {
    persistence: boolean;
    encryption: boolean;
    compression: boolean;
    backup: boolean;
  };
  
  // 知识库能力（知识库类型启用）
  knowledgeBase?: {
    // 多层次结构
    hierarchical: boolean;
    
    // 知识类型支持
    supportedTypes: ('text' | 'structured' | 'multimedia' | 'code' | 'model')[];
    
    // 搜索能力
    search: {
      fullText: boolean;
      semantic: boolean;
      vector: boolean;
      fuzzy: boolean;
    };
    
    // 知识验证
    validation: {
      schemaValidation: boolean;
      contentValidation: boolean;
      qualityAssessment: boolean;
    };
  };
  
  // 版本控制能力（可选）
  versionControl?: {
    enabled: boolean;
    strategy: 'linear' | 'branching' | 'distributed';
    conflictResolution: 'manual' | 'automatic' | 'hybrid';
    historyRetention: number; // 保留版本数
  };
  
  // 访问控制能力（可选）
  accessControl?: {
    enabled: boolean;
    authentication: boolean;
    authorization: boolean;
    auditLogging: boolean;
    sharing: {
      readOnly: boolean;
      collaborative: boolean;
      publicAccess: boolean;
    };
  };
  
  // 同步能力（协作/分布式类型启用）
  synchronization?: {
    realTime: boolean;
    conflictDetection: boolean;
    mergeStrategies: string[];
    distributedConsistency: boolean;
  };
}

/**
 * 上下文配置
 */
export interface ContextConfiguration {
  // 性能配置
  performance: {
    cacheSize: number;
    indexing: boolean;
    preloading: boolean;
    lazyLoading: boolean;
  };
  
  // 存储配置
  storage: {
    provider: string;
    location?: string;
    replication?: number;
    sharding?: boolean;
  };
  
  // 安全配置
  security: {
    encryptionKey?: string;
    accessTokens?: string[];
    ipWhitelist?: string[];
  };
  
  // 生命周期配置
  lifecycle: {
    ttl?: number; // 生存时间（秒）
    autoCleanup: boolean;
    archiving: boolean;
  };
}

/**
 * 内容管理请求
 */
export interface ContentManagementRequest {
  contextId: string;
  operation: 'create' | 'update' | 'delete' | 'move' | 'copy';
  
  // 内容路径
  path: string;
  
  // 内容数据
  content?: ContextContent;
  
  // 操作选项
  options?: {
    // 版本控制选项
    versionControl?: {
      createVersion: boolean;
      versionMessage?: string;
      parentVersion?: string;
    };
    
    // 访问控制选项
    accessControl?: {
      permissions?: Permission[];
      visibility?: 'private' | 'shared' | 'public';
    };
    
    // 验证选项
    validation?: {
      schema?: string;
      rules?: ValidationRule[];
    };
  };
  
  metadata?: Record<string, any>;
}

/**
 * 内容查询请求
 */
export interface ContentQueryRequest {
  contextId: string;
  
  // 查询条件
  query: {
    // 路径查询
    path?: string;
    pattern?: string;
    
    // 内容查询
    content?: {
      text?: string;
      semantic?: string;
      vector?: number[];
      filters?: QueryFilter[];
    };
    
    // 元数据查询
    metadata?: Record<string, any>;
    
    // 版本查询
    version?: {
      specific?: string;
      range?: VersionRange;
      latest?: boolean;
    };
  };
  
  // 查询选项
  options?: {
    // 分页
    pagination?: {
      limit?: number;
      offset?: number;
      cursor?: string;
    };
    
    // 排序
    sorting?: {
      field: string;
      order: 'asc' | 'desc';
    }[];
    
    // 返回格式
    format?: {
      includeContent: boolean;
      includeMetadata: boolean;
      includeVersions: boolean;
    };
  };
}

/**
 * 同步请求
 */
export interface SynchronizationRequest {
  contextId: string;
  
  // 同步类型
  syncType: 'full' | 'incremental' | 'selective';
  
  // 同步目标
  targets?: {
    contexts?: string[];
    participants?: string[];
    external?: ExternalTarget[];
  };
  
  // 同步选项
  options?: {
    conflictResolution?: 'merge' | 'overwrite' | 'manual';
    validation?: boolean;
    notification?: boolean;
  };
  
  metadata?: Record<string, any>;
}
```

### **响应类型定义**

```typescript
/**
 * 上下文响应
 */
export interface ContextResponse {
  success: boolean;
  
  data?: {
    contextId: string;
    name: string;
    type: ContextType;
    status: ContextStatus;
    capabilities: ContextCapabilities;
    configuration: ContextConfiguration;
    createdAt: string;
    updatedAt: string;
  };
  
  error?: string;
}

/**
 * 上下文状态响应
 */
export interface ContextStatusResponse {
  success: boolean;
  
  data?: {
    contextId: string;
    status: ContextStatus;
    health: HealthStatus;
    
    // 存储状态
    storage: {
      size: number;
      usage: number;
      capacity: number;
      fragmentation: number;
    };
    
    // 知识库状态（如果适用）
    knowledgeBase?: {
      totalItems: number;
      categories: Record<string, number>;
      indexStatus: 'building' | 'ready' | 'error';
      lastUpdate: string;
    };
    
    // 版本状态（如果适用）
    versionControl?: {
      currentVersion: string;
      totalVersions: number;
      pendingConflicts: number;
      lastSync: string;
    };
    
    // 访问状态（如果适用）
    accessControl?: {
      activeUsers: number;
      permissions: PermissionSummary[];
      recentActivity: ActivityLog[];
    };
    
    // 性能指标
    performance: {
      responseTime: number;
      throughput: number;
      cacheHitRate: number;
      errorRate: number;
    };
  };
  
  error?: string;
}

/**
 * 内容查询响应
 */
export interface ContentQueryResponse {
  success: boolean;
  
  data?: {
    results: ContentItem[];
    total: number;
    hasMore: boolean;
    searchTime: number;
    
    // 聚合信息
    aggregations?: {
      categories: Record<string, number>;
      types: Record<string, number>;
      versions: Record<string, number>;
    };
    
    // 建议
    suggestions?: {
      relatedQueries: string[];
      recommendations: ContentItem[];
    };
  };
  
  error?: string;
}

/**
 * 同步响应
 */
export interface SynchronizationResponse {
  success: boolean;
  
  data?: {
    syncId: string;
    status: 'initiated' | 'in_progress' | 'completed' | 'failed';
    progress: number; // 0-1
    
    // 同步统计
    statistics: {
      totalItems: number;
      syncedItems: number;
      conflictItems: number;
      errorItems: number;
    };
    
    // 冲突信息
    conflicts?: ConflictInfo[];
    
    // 错误信息
    errors?: SyncError[];
    
    timeline: SyncTimeline;
  };
  
  error?: string;
}
```

## 🔧 **使用示例**

### **简单项目上下文示例**

```typescript
// 简单项目上下文，只需要基础存储功能
const simpleContextRequest: CreateContextRequest = {
  name: "项目开发上下文",
  type: "project",
  capabilities: {
    storage: {
      persistence: true,
      encryption: false,
      compression: false,
      backup: true
    }
    // 不启用知识库等高级功能
  },
  configuration: {
    performance: { cacheSize: 100, indexing: false, preloading: false, lazyLoading: true },
    storage: { provider: "local", replication: 1 },
    security: {},
    lifecycle: { autoCleanup: true, archiving: false }
  }
};

const simpleContext = await contextProtocol.createContext(simpleContextRequest);
```

### **TracePilot知识库上下文示例**

```typescript
// TracePilot需要完整的知识库管理能力
const knowledgeContextRequest: CreateContextRequest = {
  name: "TracePilot知识库",
  type: "knowledge_base",
  capabilities: {
    storage: {
      persistence: true,
      encryption: true,
      compression: true,
      backup: true
    },
    knowledgeBase: {
      hierarchical: true,
      supportedTypes: ['text', 'structured', 'multimedia', 'code'],
      search: {
        fullText: true,
        semantic: true,
        vector: true,
        fuzzy: true
      },
      validation: {
        schemaValidation: true,
        contentValidation: true,
        qualityAssessment: true
      }
    },
    versionControl: {
      enabled: true,
      strategy: "branching",
      conflictResolution: "hybrid",
      historyRetention: 100
    },
    accessControl: {
      enabled: true,
      authentication: true,
      authorization: true,
      auditLogging: true,
      sharing: {
        readOnly: true,
        collaborative: true,
        publicAccess: false
      }
    },
    synchronization: {
      realTime: true,
      conflictDetection: true,
      mergeStrategies: ["auto", "manual", "priority"],
      distributedConsistency: true
    }
  },
  configuration: {
    performance: { cacheSize: 1000, indexing: true, preloading: true, lazyLoading: false },
    storage: { provider: "distributed", replication: 3, sharding: true },
    security: { encryptionKey: "auto-generated", accessTokens: [], ipWhitelist: [] },
    lifecycle: { ttl: 31536000, autoCleanup: false, archiving: true } // 1年TTL
  }
};

const knowledgeContext = await contextProtocol.createContext(knowledgeContextRequest);
```

## 🔗 **链式影响分析**

### **直接影响的组件**
1. **Context协议Schema** - 需要更新为统一接口的数据结构
2. **Context协议类型定义** - 需要重新定义统一的TypeScript类型
3. **ContextController** - 需要实现统一接口的API端点
4. **ContextService** - 需要实现统一接口的业务逻辑
5. **Context测试用例** - 需要更新为统一接口的测试

### **间接影响的协议**
1. **Dialog协议** - 需要支持对话中的知识库集成
2. **Role协议** - 需要支持Agent的知识访问权限
3. **Extension协议** - 需要支持知识库的插件扩展
4. **Trace协议** - 需要追踪知识库的访问和更新

## 📝 **文档更新清单**

### **必须同步更新的文档**
- [ ] `schemas/context-protocol.json` - 更新为统一接口Schema
- [ ] `src/modules/context/types.ts` - 更新为统一接口类型定义
- [ ] `docs/protocols/context-protocol-specification.md` - 更新协议规范
- [ ] `docs/api/context-api-reference.md` - 更新API文档
- [ ] `tests/context/unified-interface.test.ts` - 新增统一接口测试

---

**设计版本**: v1.0.0  
**设计状态**: 设计完成  
**下一步**: Extension协议统一标准接口设计  
**负责人**: MPLP协议完善团队  
**最后更新**: 2025年8月3日
