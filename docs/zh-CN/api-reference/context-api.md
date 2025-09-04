# Context API 参考

**跨智能体的共享状态和上下文管理 - MPLP v1.0 Alpha**

[![API](https://img.shields.io/badge/api-Context%20模块-blue.svg)](../modules/context/README.md)
[![Schema](https://img.shields.io/badge/schema-mplp--context.json-green.svg)](../schemas/README.md)
[![状态](https://img.shields.io/badge/status-生产就绪-green.svg)](../../../ALPHA-RELEASE-NOTES.md)
[![语言](https://img.shields.io/badge/language-中文-red.svg)](../../en/api-reference/context-api.md)

---

## 🎯 概述

Context API为多智能体系统提供全面的上下文管理功能。它使智能体能够共享状态、协调活动，并在分布式操作中保持一致的上下文。此API基于MPLP v1.0 Alpha的实际实现。

## 📦 导入

```typescript
import { 
  ContextController,
  ContextManagementService,
  CreateContextDto,
  UpdateContextDto,
  ContextResponseDto
} from 'mplp/modules/context';

// 或使用模块接口
import { MPLP } from 'mplp';
const mplp = new MPLP();
const contextModule = mplp.getModule('context');
```

## 🏗️ 核心接口

### **ContextResponseDto** (响应接口)

```typescript
interface ContextResponseDto {
  contextId: string;                    // 唯一上下文标识符 (UUID)
  name: string;                         // 人类可读的名称
  description?: string;                 // 可选描述
  status: ContextStatus;                // 当前状态
  lifecycleStage: LifecycleStage;      // 当前生命周期阶段
  protocolVersion: string;              // MPLP协议版本 (1.0.0)
  timestamp: string;                    // ISO时间戳
  sharedState: SharedState;             // 共享状态数据
  accessControl: AccessControl;         // 访问控制设置
  configuration: Configuration;         // 配置数据
  auditTrail: AuditTrail;              // 审计信息
  monitoringIntegration: MonitoringIntegration; // 监控数据
  performanceMetrics: PerformanceMetrics; // 性能数据
  versionHistory: VersionHistory;       // 版本跟踪
  searchMetadata: SearchMetadata;       // 搜索元数据
  cachingPolicy: CachingPolicy;         // 缓存配置
  syncConfiguration: SyncConfiguration; // 同步设置
  errorHandling: ErrorHandling;         // 错误处理配置
  integrationEndpoints: IntegrationEndpoints; // 集成端点
  eventIntegration: EventIntegration;   // 事件集成
}

// 状态枚举 (来自实际实现)
type ContextStatus = 'active' | 'suspended' | 'completed' | 'terminated';
type LifecycleStage = 'planning' | 'executing' | 'monitoring' | 'completed';
```

### **CreateContextDto** (请求接口)

```typescript
interface CreateContextDto {
  name: string;                         // 必需：上下文名称
  description?: string;                 // 可选：上下文描述
  sharedState?: Partial<SharedState>;   // 可选：初始共享状态
  accessControl?: Partial<AccessControl>; // 可选：访问控制设置
  configuration?: Partial<Configuration>; // 可选：配置数据
}
```

### **UpdateContextDto** (更新接口)

```typescript
interface UpdateContextDto {
  name?: string;                        // 可选：更新名称
  description?: string;                 // 可选：更新描述
  status?: ContextStatus;               // 可选：更新状态
  lifecycleStage?: LifecycleStage;     // 可选：更新生命周期阶段
  sharedState?: Partial<SharedState>;   // 可选：更新共享状态
  accessControl?: Partial<AccessControl>; // 可选：更新访问控制
  configuration?: Partial<Configuration>; // 可选：更新配置
}
```

## 🚀 REST API 端点

### **POST /contexts** - 创建上下文

使用指定配置创建新的上下文。

```typescript
const contextController = new ContextController(contextManagementService);

const result = await contextController.createContext({
  name: '多智能体协作',
  description: '多智能体分析的协作上下文',
  sharedState: {
    variables: {
      currentPhase: 'planning',
      environment: 'production'
    },
    resources: {
      allocated: {
        cpu: { 
          type: 'compute', 
          amount: 2, 
          unit: 'cores', 
          status: 'available' 
        }
      },
      requirements: {
        memory: { 
          minimum: 1024, 
          optimal: 2048, 
          unit: 'MB' 
        }
      }
    },
    dependencies: [],
    goals: [
      {
        id: 'goal-001',
        name: '完成分析',
        priority: 'high',
        status: 'defined',
        description: '分析数据并提供洞察'
      }
    ]
  }
});

// 响应: ContextOperationResultDto
interface ContextOperationResultDto {
  success: boolean;
  contextId?: string;
  message?: string;
  metadata?: Record<string, any>;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}
```

### **GET /contexts/:id** - 根据ID获取上下文

通过唯一标识符检索上下文。

```typescript
const context = await contextController.getContextById('123e4567-e89b-42d3-a456-426614174000');

if (context) {
  console.log(`上下文: ${context.name}`);
  console.log(`状态: ${context.status}`);
  console.log(`生命周期阶段: ${context.lifecycleStage}`);
}

// 返回: ContextResponseDto | null
```

### **GET /contexts/by-name/:name** - 根据名称获取上下文

通过名称检索上下文。

```typescript
const context = await contextController.getContextByName('多智能体协作');

if (context) {
  console.log(`上下文ID: ${context.contextId}`);
  console.log(`状态: ${context.status}`);
}

// 返回: ContextResponseDto | null
```

### **PUT /contexts/:id** - 更新上下文

使用新数据更新现有上下文。

```typescript
const result = await contextController.updateContext('123e4567-e89b-42d3-a456-426614174000', {
  name: '更新的上下文名称',
  description: '更新的描述',
  status: 'active',
  lifecycleStage: 'executing',
  sharedState: {
    variables: {
      currentPhase: 'execution',
      environment: 'production'
    }
  }
});

// 返回: ContextOperationResultDto
```

### **DELETE /contexts/:id** - 删除上下文

从系统中移除上下文。

```typescript
const result = await contextController.deleteContext('123e4567-e89b-42d3-a456-426614174000');

// 返回: ContextOperationResultDto
```

### **GET /contexts** - 列出上下文

基于可选查询条件列出上下文。

```typescript
// 列出所有活跃上下文
const activeContexts = await contextController.listContexts({
  status: 'active'
});

// 带分页的上下文列表
const contexts = await contextController.listContexts({
  status: ['active', 'suspended'],
  lifecycleStage: 'executing',
  namePattern: 'collaboration',
  page: 1,
  limit: 10
});

// 返回: PaginatedContextResponseDto
```

## 📊 查询参数和分页

### **ContextQueryDto**

```typescript
interface ContextQueryDto {
  status?: ContextStatus | ContextStatus[];           // 按状态过滤
  lifecycleStage?: LifecycleStage | LifecycleStage[]; // 按生命周期阶段过滤
  owner?: string;                                     // 按所有者过滤
  createdAfter?: string;                             // 按创建日期过滤 (ISO字符串)
  createdBefore?: string;                            // 按创建日期过滤 (ISO字符串)
  namePattern?: string;                              // 按名称模式过滤
  page?: number;                                     // 页码 (默认: 1)
  limit?: number;                                    // 每页项目数 (默认: 10)
}
```

### **PaginatedContextResponseDto**

```typescript
interface PaginatedContextResponseDto {
  data: ContextResponseDto[];                        // 上下文数据数组
  total: number;                                     // 总数
  page: number;                                      // 当前页
  limit: number;                                     // 每页项目数
  totalPages: number;                                // 总页数
  hasNext: boolean;                                  // 是否有下一页
  hasPrevious: boolean;                              // 是否有上一页
}
```

---

## 🔗 相关文档

### **Context模块文档**
- **[Context模块概述](../modules/context/README.md)** - 完整的模块文档
- **[Context Schema](../schemas/README.md)** - JSON Schema规范
- **[Context类型](../modules/context/types.md)** - TypeScript类型定义

### **集成指南**
- **[多智能体集成](../implementation/multi-agent-integration.md)** - 集成模式
- **[状态管理](../implementation/state-management.md)** - 状态管理策略
- **[安全配置](../implementation/security-configuration.md)** - 安全设置

---

**Context API版本**: 1.0.0-alpha  
**最后更新**: 2025年9月4日  
**状态**: 生产就绪  

**⚠️ Alpha通知**: 此API参考基于实际的MPLP v1.0 Alpha实现。所有接口和示例都反映了真实的代码库结构，并已根据生产代码进行验证。
