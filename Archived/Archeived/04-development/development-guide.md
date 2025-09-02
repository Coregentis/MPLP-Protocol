# MPLP v1.0 开发指南

<!--
文档元数据
版本: v1.0.0
创建时间: 2025-08-06T00:35:06Z
最后更新: 2025-08-06T00:35:06Z
文档状态: 已完成
-->

## 🎯 **开发环境设置**

### **前置要求**
- Node.js >= 18.0.0
- npm >= 8.0.0 或 yarn >= 1.22.0
- Git >= 2.30.0
- TypeScript >= 5.0.0
- Docker >= 20.0.0 (可选)

### **IDE推荐配置**
- **VS Code** (推荐)
  - 扩展: TypeScript, ESLint, Prettier, Jest
  - 配置: `.vscode/settings.json`
- **WebStorm** (备选)
- **Vim/Neovim** (高级用户)

### **环境变量配置**
```bash
# .env.development
NODE_ENV=development
LOG_LEVEL=debug
MPLP_PORT=3000
MPLP_HOST=localhost

# 数据库配置
DB_TYPE=memory
REDIS_URL=redis://localhost:6379

# 安全配置
JWT_SECRET=your-development-secret
API_KEY_PREFIX=mplp_dev_
```

## 🏗️ **项目结构**

### **源码组织**
```
src/
├── core/                    # 核心引擎
│   ├── protocol-engine.ts   # 协议引擎
│   ├── workflow-manager.ts  # 工作流管理
│   ├── event-bus.ts        # 事件总线
│   └── schema-validator.ts  # Schema验证
├── modules/                 # 协议模块
│   ├── context/            # 上下文协议
│   ├── plan/               # 计划协议
│   ├── confirm/            # 确认协议
│   ├── trace/              # 追踪协议
│   ├── role/               # 角色协议
│   └── extension/          # 扩展协议
├── adapters/               # 适配器
├── types/                  # 类型定义
├── utils/                  # 工具函数
└── schemas/                # JSON Schema
```

### **模块结构 (DDD模式)**
```
src/modules/{protocol}/
├── api/                    # 接口层
│   ├── controllers/        # 控制器
│   ├── dto/               # 数据传输对象
│   └── validators/        # 输入验证
├── application/           # 应用层
│   ├── commands/          # 命令处理
│   ├── queries/           # 查询处理
│   ├── services/          # 应用服务
│   └── handlers/          # 事件处理
├── domain/                # 领域层
│   ├── entities/          # 实体
│   ├── value-objects/     # 值对象
│   ├── repositories/      # 仓储接口
│   ├── services/          # 领域服务
│   └── events/           # 领域事件
├── infrastructure/        # 基础设施层
│   ├── repositories/      # 仓储实现
│   ├── adapters/          # 外部适配器
│   └── persistence/       # 持久化
├── index.ts              # 模块导出
├── module.ts             # 模块定义
└── types.ts              # 模块类型
```

## 🔧 **开发工作流**

### **1. 功能开发流程**
```bash
# 1. 创建功能分支
git checkout -b feature/new-protocol-feature

# 2. 开发和测试
npm run dev                 # 启动开发服务器
npm run test:watch         # 监听测试
npm run typecheck          # 类型检查

# 3. 代码质量检查
npm run lint               # ESLint检查
npm run lint:fix           # 自动修复
npm run test:coverage      # 测试覆盖率

# 4. 提交代码
git add .
git commit -m "feat: add new protocol feature"

# 5. 推送和创建PR
git push origin feature/new-protocol-feature
```

### **2. 测试驱动开发 (TDD)**
```typescript
// 1. 编写测试 (Red)
describe('ContextProtocol', () => {
  it('should create context with valid parameters', async () => {
    const params = {
      projectId: 'test-project',
      agentId: 'test-agent'
    };
    
    const context = await ContextProtocol.create(params);
    
    expect(context.id).toBeDefined();
    expect(context.projectId).toBe(params.projectId);
  });
});

// 2. 实现功能 (Green)
export class ContextProtocol {
  static async create(params: ContextCreateParams): Promise<Context> {
    // 实现逻辑
  }
}

// 3. 重构优化 (Refactor)
// 优化代码结构和性能
```

### **3. Schema驱动开发**
```typescript
// 1. 定义Schema
const contextSchema = {
  type: 'object',
  properties: {
    projectId: { type: 'string', minLength: 1 },
    agentId: { type: 'string', minLength: 1 },
    metadata: { type: 'object' }
  },
  required: ['projectId', 'agentId']
};

// 2. 生成TypeScript类型
interface ContextCreateParams {
  projectId: string;
  agentId: string;
  metadata?: Record<string, any>;
}

// 3. 实现验证逻辑
export function validateContextParams(params: any): ContextCreateParams {
  const result = schemaValidator.validate(contextSchema, params);
  if (!result.valid) {
    throw new ValidationError(result.errors);
  }
  return params as ContextCreateParams;
}
```

## 📝 **编码规范**

### **TypeScript规范**
```typescript
// ✅ 好的实践
export interface ContextConfig {
  readonly projectId: string;
  readonly agentId: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export class ContextService {
  private readonly repository: ContextRepository;
  
  constructor(repository: ContextRepository) {
    this.repository = repository;
  }
  
  public async createContext(config: ContextConfig): Promise<Context> {
    // 实现逻辑
  }
}

// ❌ 避免的实践
export class ContextService {
  public repository: any; // 避免使用any
  
  createContext(config: any): any { // 避免缺少类型
    // 实现逻辑
  }
}
```

### **命名规范**
- **文件名**: kebab-case (`context-service.ts`)
- **类名**: PascalCase (`ContextService`)
- **接口名**: PascalCase (`ContextRepository`)
- **变量名**: camelCase (`contextId`)
- **常量名**: SCREAMING_SNAKE_CASE (`MAX_CONTEXT_COUNT`)
- **枚举名**: PascalCase (`ContextStatus`)

### **注释规范**
```typescript
/**
 * 创建新的上下文实例
 * 
 * @param config - 上下文配置参数
 * @returns Promise<Context> - 创建的上下文实例
 * @throws {ValidationError} 当配置参数无效时
 * @throws {DuplicateError} 当上下文已存在时
 * 
 * @example
 * ```typescript
 * const context = await ContextService.create({
 *   projectId: 'my-project',
 *   agentId: 'agent-001'
 * });
 * ```
 */
public async createContext(config: ContextConfig): Promise<Context> {
  // 实现逻辑
}
```

## 🧪 **测试策略**

### **测试层次**
1. **单元测试**: 测试单个函数/类
2. **集成测试**: 测试模块间交互
3. **端到端测试**: 测试完整工作流
4. **性能测试**: 测试性能指标

### **测试文件组织**
```
tests/
├── unit/                   # 单元测试
│   ├── core/
│   └── modules/
├── integration/            # 集成测试
│   ├── protocols/
│   └── workflows/
├── e2e/                   # 端到端测试
│   ├── scenarios/
│   └── performance/
├── fixtures/              # 测试数据
├── mocks/                 # Mock对象
└── utils/                 # 测试工具
```

### **测试最佳实践**
```typescript
describe('ContextProtocol', () => {
  let contextService: ContextService;
  let mockRepository: jest.Mocked<ContextRepository>;
  
  beforeEach(() => {
    mockRepository = createMockRepository();
    contextService = new ContextService(mockRepository);
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  describe('createContext', () => {
    it('should create context successfully with valid params', async () => {
      // Arrange
      const params = createValidContextParams();
      const expectedContext = createExpectedContext(params);
      mockRepository.save.mockResolvedValue(expectedContext);
      
      // Act
      const result = await contextService.createContext(params);
      
      // Assert
      expect(result).toEqual(expectedContext);
      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining(params)
      );
    });
    
    it('should throw ValidationError for invalid params', async () => {
      // Arrange
      const invalidParams = { projectId: '' }; // 无效参数
      
      // Act & Assert
      await expect(contextService.createContext(invalidParams))
        .rejects.toThrow(ValidationError);
    });
  });
});
```

## 🔍 **调试技巧**

### **日志调试**
```typescript
import { Logger } from '../utils/logger';

export class ContextService {
  private readonly logger = Logger.getLogger('ContextService');
  
  public async createContext(config: ContextConfig): Promise<Context> {
    this.logger.debug('Creating context', { config });
    
    try {
      const context = await this.repository.save(config);
      this.logger.info('Context created successfully', { 
        contextId: context.id 
      });
      return context;
    } catch (error) {
      this.logger.error('Failed to create context', { 
        config, 
        error: error.message 
      });
      throw error;
    }
  }
}
```

### **性能调试**
```typescript
import { performance } from 'perf_hooks';

export class PerformanceMonitor {
  public static async measure<T>(
    name: string, 
    fn: () => Promise<T>
  ): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;
      console.log(`${name} took ${duration.toFixed(2)}ms`);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      console.log(`${name} failed after ${duration.toFixed(2)}ms`);
      throw error;
    }
  }
}

// 使用示例
const context = await PerformanceMonitor.measure(
  'ContextCreation',
  () => contextService.createContext(params)
);
```

## 🚀 **部署准备**

### **构建优化**
```bash
# 生产构建
npm run build

# 构建分析
npm run build:analyze

# 类型检查
npm run typecheck

# 测试覆盖率
npm run test:coverage
```

### **环境配置**
```typescript
// config/production.ts
export const productionConfig = {
  server: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || '0.0.0.0'
  },
  database: {
    type: 'mongodb',
    url: process.env.DATABASE_URL
  },
  cache: {
    type: 'redis',
    url: process.env.REDIS_URL
  },
  logging: {
    level: 'info',
    format: 'json'
  }
};
```

## 📚 **学习资源**

### **内部文档**
- [架构设计](../02-architecture/system-architecture.md)
- [协议文档](../03-protocols/protocol-overview.md)
- [API文档](../07-api/api-overview.md)

### **外部资源**
- [TypeScript官方文档](https://www.typescriptlang.org/docs/)
- [Jest测试框架](https://jestjs.io/docs/getting-started)
- [DDD实践指南](https://martinfowler.com/tags/domain%20driven%20design.html)

---

**下一步**: 查看 [编码标准](./coding-standards.md) 和 [贡献指南](./contribution-guide.md)
