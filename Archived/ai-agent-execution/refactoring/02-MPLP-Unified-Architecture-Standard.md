# MPLP统一架构标准

## 🏗️ **架构标准概述**

本文档定义了MPLP v1.0所有模块必须遵循的统一架构标准，基于Context和Plan模块重构的实际经验，确保：
- **架构一致性**: 所有模块使用IDENTICAL的DDD分层架构
- **协议边界清晰**: 严格区分L1-L3协议层与L4应用层
- **接口标准化**: 统一的IMLPPProtocol实现和横切关注点集成
- **质量保证**: 统一的代码质量和测试标准
- **技术债务清零**: 严格的阶段性技术债务检查机制

## 🚨 **Context和Plan模块重构经验集成**

### **技术债务清零原则**
```markdown
✅ 基于实际重构经验的强化要求：

严格禁止的类型使用：
- any类型：绝对禁止，必须定义具体类型
- unknown类型：禁止使用，必须根据实际业务需求定义具体类型
- console类型：禁止在生产代码中使用，必须使用统一的日志系统

阶段性技术债务清零：
- Schema定义完成后：立即进行TypeScript编译检查
- 字段映射完成后：立即进行类型定义和ESLint检查
- 双重命名完成后：立即进行命名约定合规性检查
- 每个功能模块完成后：立即进行完整技术债务检查
```

### **Schema驱动开发强化流程**
```markdown
✅ 严格执行的开发顺序：

第一步：Schema定义和验证
- 基于实际业务需求定义JSON Schema
- 验证Schema的完整性和正确性
- 确保Schema符合双重命名约定

第二步：字段映射实现
- 实现Schema到TypeScript的完整映射
- 创建双向转换函数（toSchema, fromSchema）
- 验证映射的一致性和正确性

第三步：双重命名约定实施
- Schema层严格使用snake_case
- TypeScript层严格使用camelCase
- 实现批量转换和验证函数

第四步：开发实现
- 基于完成的Schema和映射进行开发
- 每个开发阶段完成后立即进行技术债务检查
```

### **测试驱动源代码完善机制**
```markdown
✅ 测试与源代码双向完善闭环：

测试文件构建原则：
- 根据实际源代码结构构建测试文件
- 测试用例必须覆盖所有实际实现的功能
- 测试数据必须符合实际Schema定义

源代码完善驱动：
- 测试过程中发现的源代码问题立即修复
- 测试失败时优先修复源代码而不是修改测试
- 建立测试通过率100%的强制要求
- 通过测试驱动完善源代码的功能和质量
```

## 🎯 **核心架构原则**

### **1. 协议最小化原则**
```markdown
✅ 每个模块只提供核心协议能力
- 避免过度复杂的业务逻辑实现
- 专注于协议接口的标准化和简洁性
- 将复杂业务逻辑推向L4应用层

❌ 禁止的复杂化行为：
- 在协议层实现复杂的业务规则
- 创建过多的专业化服务（如Context的17个服务）
- 在协议层包含AI决策算法（如Plan模块的AI算法）
```

### **2. 功能分层原则**
```markdown
✅ 严格的分层职责定义：

L1 协议层（基础协议）：
- 定义基本的数据结构和接口规范
- 提供Schema定义和验证机制
- 实现基础的序列化和反序列化

L2 协调层（模块协议）：
- 实现具体的协议逻辑和路由
- 提供模块间的协调接口
- 管理模块状态和生命周期

L3 执行层（CoreOrchestrator）：
- 协调和编排L2模块
- 提供统一的Agent构建接口
- 管理系统级的资源和性能

L4 应用层（Agent实现）：
- 实现具体的AI决策算法
- 构建特定领域的Agent应用
- 提供用户交互和业务逻辑
```

### **3. 接口标准化原则**
```markdown
✅ 统一的接口规范：
- 所有模块必须实现IMLPPProtocol接口
- 统一的请求/响应格式和错误处理
- 标准化的性能监控和日志记录
- 一致的横切关注点集成模式
```

## 📁 **统一目录结构标准**

### **标准模块目录结构**
```
src/modules/{module-name}/
├── api/                    # API层 - 对外接口
│   ├── controllers/        # 控制器 - 处理HTTP请求
│   ├── dto/               # 数据传输对象 - 接口数据结构
│   └── mappers/           # 映射器 - Schema↔TypeScript转换
├── application/           # 应用层 - 业务逻辑协调
│   └── services/          # 应用服务 - 业务流程编排
├── domain/               # 领域层 - 核心业务逻辑
│   ├── entities/         # 实体 - 核心业务对象
│   ├── repositories/     # 仓储接口 - 数据访问抽象
│   └── services/         # 领域服务 - 核心业务规则（可选）
├── infrastructure/       # 基础设施层 - 技术实现
│   ├── adapters/         # 适配器 - 外部系统集成
│   ├── factories/        # 工厂 - 对象创建和配置
│   ├── protocols/        # 协议实现 - IMLPPProtocol实现
│   └── repositories/     # 仓储实现 - 具体数据访问
├── index.ts             # 模块导出 - 公共接口定义
└── module.ts            # 模块配置 - 依赖注入和配置
```

### **标准测试目录结构**
```
tests/modules/{module-name}/
├── unit/                 # 单元测试
│   ├── {module}.entity.test.ts
│   ├── {module}.mapper.test.ts
│   ├── {module}.controller.test.ts
│   ├── {module}.protocol.test.ts
│   └── {module}-*.service.test.ts
├── integration/          # 集成测试
│   ├── {module}.integration.test.ts
│   └── {module}-enterprise.integration.test.ts
├── performance/          # 性能测试
│   └── {module}.performance.test.ts
└── security/            # 安全测试
    └── {module}.security.test.ts
```

## 🔧 **统一DDD架构实现标准**

### **1. API层标准**
```typescript
// 控制器标准实现
export class {Module}Controller {
  constructor(
    private readonly {module}Service: {Module}ManagementService,
    private readonly mapper: {Module}Mapper
  ) {}

  async create{Module}(request: Create{Module}Request): Promise<{Module}Response> {
    // 1. 请求验证和转换
    const {module}Data = this.mapper.fromCreateRequest(request);
    
    // 2. 业务逻辑调用
    const {module} = await this.{module}Service.create{Module}({module}Data);
    
    // 3. 响应转换和返回
    return this.mapper.toResponse({module});
  }
}

// 映射器标准实现
export class {Module}Mapper {
  // Schema → TypeScript
  static fromSchema(schema: {Module}Schema): {Module}Entity {
    return new {Module}Entity({
      {module}Id: schema.{module}_id,
      createdAt: new Date(schema.created_at),
      // ... 其他字段映射
    });
  }

  // TypeScript → Schema
  static toSchema(entity: {Module}Entity): {Module}Schema {
    return {
      {module}_id: entity.{module}Id,
      created_at: entity.createdAt.toISOString(),
      // ... 其他字段映射
    };
  }

  // 批量转换方法
  static fromSchemaArray(schemas: {Module}Schema[]): {Module}Entity[] {
    return schemas.map(schema => this.fromSchema(schema));
  }

  static toSchemaArray(entities: {Module}Entity[]): {Module}Schema[] {
    return entities.map(entity => this.toSchema(entity));
  }

  // Schema验证
  static validateSchema(data: unknown): {Module}Schema {
    // 使用JSON Schema验证
    // 返回验证后的Schema对象
  }
}
```

### **2. 应用层标准**
```typescript
// 应用服务标准实现
export class {Module}ManagementService {
  constructor(
    private readonly {module}Repository: I{Module}Repository,
    private readonly logger: ILogger
  ) {}

  async create{Module}(data: Create{Module}Data): Promise<{Module}Entity> {
    try {
      // 1. 业务规则验证
      await this.validate{Module}Data(data);
      
      // 2. 创建实体
      const {module} = new {Module}Entity(data);
      
      // 3. 持久化
      const saved{Module} = await this.{module}Repository.save({module});
      
      // 4. 事件发布（如需要）
      await this.publishEvent('{module}.created', saved{Module});
      
      return saved{Module};
    } catch (error) {
      this.logger.error('Failed to create {module}', error);
      throw error;
    }
  }

  private async validate{Module}Data(data: Create{Module}Data): Promise<void> {
    // 业务规则验证逻辑
  }
}

// 标准企业级服务（每个模块3个）
export class {Module}AnalyticsService {
  // 分析和洞察服务
}

export class {Module}MonitoringService {
  // 监控和性能服务
}

export class {Module}SecurityService {
  // 安全和合规服务
}
```

### **3. 领域层标准**
```typescript
// 实体标准实现
export class {Module}Entity {
  private readonly _{module}Id: string;
  private _status: {Module}Status;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(data: {Module}EntityData) {
    this._{module}Id = data.{module}Id || this.generateId();
    this._status = data.status || '{Module}Status.ACTIVE';
    this._createdAt = data.createdAt || new Date();
    this._updatedAt = data.updatedAt || new Date();
    
    // 业务规则验证
    this.validate();
  }

  // Getter方法
  get {module}Id(): string { return this._{module}Id; }
  get status(): {Module}Status { return this._status; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }

  // 业务方法
  public activate(): void {
    this._status = '{Module}Status.ACTIVE';
    this._updatedAt = new Date();
  }

  public deactivate(): void {
    this._status = '{Module}Status.INACTIVE';
    this._updatedAt = new Date();
  }

  private validate(): void {
    if (!this._{module}Id) {
      throw new Error('{Module} ID is required');
    }
    // 其他业务规则验证
  }

  private generateId(): string {
    return `{module}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// 仓储接口标准定义
export interface I{Module}Repository {
  findById(id: string): Promise<{Module}Entity | null>;
  findAll(): Promise<{Module}Entity[]>;
  save(entity: {Module}Entity): Promise<{Module}Entity>;
  update(entity: {Module}Entity): Promise<{Module}Entity>;
  delete(id: string): Promise<void>;
  
  // 查询方法
  findByStatus(status: {Module}Status): Promise<{Module}Entity[]>;
  count(): Promise<number>;
  exists(id: string): Promise<boolean>;
}
```

### **4. 基础设施层标准**
```typescript
// 协议实现标准
export class {Module}Protocol implements IMLPPProtocol {
  constructor(
    private readonly {module}Service: {Module}ManagementService,
    private readonly analyticsService: {Module}AnalyticsService,
    private readonly monitoringService: {Module}MonitoringService,
    private readonly securityService: {Module}SecurityService,
    // 横切关注点管理器
    private readonly securityManager: SecurityManager,
    private readonly performanceMonitor: PerformanceMonitor,
    private readonly eventBusManager: EventBusManager,
    private readonly errorHandler: ErrorHandler,
    private readonly coordinationManager: CoordinationManager,
    private readonly orchestrationManager: OrchestrationManager,
    private readonly stateSyncManager: StateSyncManager,
    private readonly transactionManager: TransactionManager,
    private readonly protocolVersionManager: ProtocolVersionManager
  ) {}

  async processRequest(request: MLPPRequest): Promise<MLPPResponse> {
    try {
      // 1. 请求验证
      await this.securityManager.validateRequest(request);
      
      // 2. 性能监控开始
      const startTime = Date.now();
      
      // 3. 请求路由和处理
      const result = await this.routeRequest(request);
      
      // 4. 性能监控结束
      await this.performanceMonitor.recordMetric(
        '{module}.request.duration',
        Date.now() - startTime
      );
      
      // 5. 事件发布
      await this.eventBusManager.publish('{module}.request.processed', {
        requestId: request.requestId,
        operation: request.operation,
        duration: Date.now() - startTime
      });
      
      return {
        requestId: request.requestId,
        status: 'success',
        result,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      await this.errorHandler.handleError(error, request);
      throw error;
    }
  }

  private async routeRequest(request: MLPPRequest): Promise<any> {
    switch (request.operation) {
      case 'create_{module}':
        return await this.{module}Service.create{Module}(request.payload);
      case 'get_{module}':
        return await this.{module}Service.get{Module}(request.payload.id);
      case 'analyze_{module}':
        return await this.analyticsService.analyze{Module}(request.payload.id);
      case 'monitor_{module}':
        return await this.monitoringService.getMetrics(request.payload.id);
      case 'secure_{module}':
        return await this.securityService.performAudit(request.payload.id);
      default:
        throw new Error(`Unsupported operation: ${request.operation}`);
    }
  }

  async initialize(config: {Module}Config): Promise<void> {
    // 协议初始化逻辑
  }

  async shutdown(): Promise<void> {
    // 协议关闭逻辑
  }
}

// 仓储实现标准
export class {Module}Repository implements I{Module}Repository {
  constructor(
    private readonly dataSource: DataSource,
    private readonly logger: ILogger
  ) {}

  async findById(id: string): Promise<{Module}Entity | null> {
    try {
      const schema = await this.dataSource.findOne('{module}s', { {module}_id: id });
      return schema ? {Module}Mapper.fromSchema(schema) : null;
    } catch (error) {
      this.logger.error(`Failed to find {module} by id: ${id}`, error);
      throw error;
    }
  }

  async save(entity: {Module}Entity): Promise<{Module}Entity> {
    try {
      const schema = {Module}Mapper.toSchema(entity);
      const savedSchema = await this.dataSource.save('{module}s', schema);
      return {Module}Mapper.fromSchema(savedSchema);
    } catch (error) {
      this.logger.error('Failed to save {module}', error);
      throw error;
    }
  }

  // 其他方法实现...
}
```

## 🔗 **横切关注点集成标准**

### **统一集成模式**
```typescript
// 所有模块必须集成的9个L3管理器
export interface CrossCuttingConcerns {
  securityManager: SecurityManager;           // 安全管理
  performanceMonitor: PerformanceMonitor;     // 性能监控
  eventBusManager: EventBusManager;           // 事件总线
  errorHandler: ErrorHandler;                 // 错误处理
  coordinationManager: CoordinationManager;   // 协调管理
  orchestrationManager: OrchestrationManager; // 编排管理
  stateSyncManager: StateSyncManager;         // 状态同步
  transactionManager: TransactionManager;     // 事务管理
  protocolVersionManager: ProtocolVersionManager; // 版本管理
}

// 标准集成方式
export class {Module}Protocol implements IMLPPProtocol {
  constructor(
    // 业务服务
    private readonly {module}Service: {Module}ManagementService,
    private readonly analyticsService: {Module}AnalyticsService,
    private readonly monitoringService: {Module}MonitoringService,
    private readonly securityService: {Module}SecurityService,
    // 横切关注点（统一注入）
    ...crossCuttingConcerns: CrossCuttingConcerns
  ) {}
}
```

## 📋 **架构合规性检查清单**

### **目录结构合规性**
- [ ] 使用标准的4层DDD目录结构
- [ ] API层包含controllers、dto、mappers
- [ ] 应用层包含标准的服务实现
- [ ] 领域层包含entities、repositories接口
- [ ] 基础设施层包含adapters、factories、protocols、repositories实现

### **接口实现合规性**
- [ ] 实现IMLPPProtocol接口
- [ ] 集成9个横切关注点管理器
- [ ] 实现标准的请求路由和处理逻辑
- [ ] 使用统一的错误处理和响应格式

### **代码质量合规性**
- [ ] 零any类型使用
- [ ] 100%TypeScript严格模式
- [ ] 统一的命名约定和代码风格
- [ ] 完整的类型定义和接口规范

### **测试标准合规性**
- [ ] 测试覆盖率≥95%
- [ ] 包含单元、集成、性能、安全测试
- [ ] 使用统一的测试数据工厂和Mock策略
- [ ] 遵循统一的测试命名规范

---

**版本**: v1.0  
**创建时间**: 2025-01-27  
**基于标准**: DDD + Clean Architecture + MPLP协议规范  
**维护者**: MPLP架构治理委员会
