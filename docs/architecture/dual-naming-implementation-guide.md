# MPLP双重命名约定实施指南

## 📋 **文档信息**

**文档版本**: v1.0.0  
**创建日期**: 2025年8月6日  
**最后更新**: 2025年8月6日  
**负责人**: MPLP开发团队  
**状态**: 生效中  
**前置文档**: [双重命名约定架构设计](./dual-naming-convention.md)

## 🎯 **实施概述**

本文档提供MPLP双重命名约定的具体实施指南，包括代码示例、工具使用、常见问题解决方案和最佳实践。

## 🛠️ **实施步骤**

### **步骤1: Schema定义 (snake_case)**

#### **标准Schema模板**
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://mplp.dev/schemas/v1.0/mplp-{module}.json",
  "title": "MPLP {Module} Protocol v1.0",
  "description": "{Module}模块协议Schema",
  "type": "object",
  "properties": {
    "protocol_version": {
      "type": "string",
      "const": "1.0"
    },
    "timestamp": {
      "type": "string",
      "format": "date-time"
    },
    "context_id": {
      "type": "string",
      "format": "uuid"
    },
    "{module}_id": {
      "type": "string",
      "format": "uuid"
    },
    "created_at": {
      "type": "string",
      "format": "date-time"
    },
    "updated_at": {
      "type": "string",
      "format": "date-time"
    }
  },
  "required": ["protocol_version", "timestamp", "context_id"],
  "additionalProperties": false
}
```

#### **字段命名规则**
```json
// ✅ 正确的snake_case命名
{
  "context_id": "string",
  "session_id": "string", 
  "agent_id": "string",
  "created_at": "string",
  "updated_at": "string",
  "lifecycle_stage": "string",
  "execution_status": "string",
  "protocol_version": "string",
  "performance_metrics": "object",
  "error_information": "object"
}

// ❌ 错误的命名
{
  "contextId": "string",        // 应该是 context_id
  "sessionID": "string",        // 应该是 session_id
  "createdAt": "string",        // 应该是 created_at
  "protocolVer": "string"       // 应该是 protocol_version
}
```

### **步骤2: TypeScript接口定义 (camelCase)**

#### **标准接口模板**
```typescript
/**
 * {Module} 实体接口
 * 对应Schema: mplp-{module}.json
 */
export interface {Module}Entity {
  /**
   * 协议版本 (对应 protocol_version)
   */
  protocolVersion: string;
  
  /**
   * 时间戳 (对应 timestamp)
   */
  timestamp: Date;
  
  /**
   * 上下文ID (对应 context_id)
   */
  contextId: string;
  
  /**
   * {Module}ID (对应 {module}_id)
   */
  {module}Id: string;
  
  /**
   * 创建时间 (对应 created_at)
   */
  createdAt: Date;
  
  /**
   * 更新时间 (对应 updated_at)
   */
  updatedAt: Date;
}

/**
 * 创建{Module}请求接口
 */
export interface Create{Module}Request {
  contextId: string;
  // 其他必需字段...
}

/**
 * {Module}查询过滤器
 */
export interface {Module}Filter {
  contextId?: string;
  {module}Id?: string;
  createdAfter?: Date;
  createdBefore?: Date;
}
```

#### **字段映射对照表**
```typescript
// Schema字段 → TypeScript字段映射
const FIELD_MAPPING = {
  // 基础字段
  'context_id': 'contextId',
  'session_id': 'sessionId',
  'agent_id': 'agentId',
  'user_id': 'userId',
  
  // 时间字段
  'created_at': 'createdAt',
  'updated_at': 'updatedAt',
  'started_at': 'startedAt',
  'completed_at': 'completedAt',
  
  // 状态字段
  'lifecycle_stage': 'lifecycleStage',
  'execution_status': 'executionStatus',
  'approval_status': 'approvalStatus',
  
  // 配置字段
  'protocol_version': 'protocolVersion',
  'timeout_ms': 'timeoutMs',
  'retry_count': 'retryCount',
  
  // 复杂字段
  'performance_metrics': 'performanceMetrics',
  'error_information': 'errorInformation',
  'validation_rules': 'validationRules'
} as const;
```

### **步骤3: 映射层实现**

#### **基础映射类**
```typescript
/**
 * Schema-Entity映射基类
 */
export abstract class BaseMapper<TEntity, TSchema> {
  /**
   * 实体转Schema
   */
  abstract toSchema(entity: TEntity): TSchema;
  
  /**
   * Schema转实体
   */
  abstract fromSchema(schema: TSchema): TEntity;
  
  /**
   * 验证映射一致性
   */
  validateMapping(entity: TEntity, schema: TSchema): boolean {
    const convertedSchema = this.toSchema(entity);
    return this.deepEqual(convertedSchema, schema);
  }
  
  /**
   * 深度比较对象
   */
  private deepEqual(obj1: any, obj2: any): boolean {
    // 实现深度比较逻辑
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  }
}
```

#### **具体映射实现示例**
```typescript
/**
 * Context模块映射器
 */
export class ContextMapper extends BaseMapper<ContextEntity, ContextSchema> {
  toSchema(entity: ContextEntity): ContextSchema {
    return {
      protocol_version: entity.protocolVersion,
      timestamp: entity.timestamp.toISOString(),
      context_id: entity.contextId,
      session_id: entity.sessionId,
      agent_id: entity.agentId,
      created_at: entity.createdAt.toISOString(),
      updated_at: entity.updatedAt.toISOString(),
      lifecycle_stage: entity.lifecycleStage,
      configuration: entity.configuration,
      shared_state: entity.sharedState,
      access_control: entity.accessControl
    };
  }
  
  fromSchema(schema: ContextSchema): ContextEntity {
    return new ContextEntity({
      protocolVersion: schema.protocol_version,
      timestamp: new Date(schema.timestamp),
      contextId: schema.context_id,
      sessionId: schema.session_id,
      agentId: schema.agent_id,
      createdAt: new Date(schema.created_at),
      updatedAt: new Date(schema.updated_at),
      lifecycleStage: schema.lifecycle_stage,
      configuration: schema.configuration,
      sharedState: schema.shared_state,
      accessControl: schema.access_control
    });
  }
}
```

### **步骤4: 自动化工具集成**

#### **验证脚本使用**
```bash
# 验证所有模块的映射一致性
npm run validate:mapping

# 验证特定模块
npm run validate:mapping -- --module=context

# 生成映射报告
npm run validate:mapping -- --report

# 修复字段名问题
npm run fix:naming

# 完整质量检查
npm run quality:check
```

#### **CI/CD集成**
```yaml
# .github/workflows/quality-check.yml
name: Quality Check
on: [push, pull_request]

jobs:
  mapping-validation:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Validate Schema-TypeScript mapping
        run: npm run validate:mapping
      
      - name: Check naming consistency
        run: npm run check:naming
      
      - name: TypeScript compilation
        run: npm run typecheck
```

## 🔧 **开发工作流**

### **新功能开发流程**

#### **1. Schema优先设计**
```bash
# 1. 创建或更新Schema文件
vim src/schemas/mplp-{module}.json

# 2. 验证Schema格式
npm run validate:schemas

# 3. 生成TypeScript类型定义
npm run generate:types
```

#### **2. TypeScript实现**
```bash
# 1. 创建或更新TypeScript接口
vim src/modules/{module}/types.ts

# 2. 实现映射函数
vim src/modules/{module}/mappers/{module}.mapper.ts

# 3. 验证映射一致性
npm run validate:mapping -- --module={module}
```

#### **3. 测试验证**
```bash
# 1. 运行单元测试
npm test -- src/modules/{module}

# 2. 运行集成测试
npm run test:integration

# 3. 完整质量检查
npm run quality:check
```

### **字段修改流程**

#### **添加新字段**
```markdown
1. 在Schema中添加字段定义 (snake_case)
2. 在TypeScript接口中添加对应字段 (camelCase)
3. 更新映射函数 (toSchema/fromSchema)
4. 添加字段验证测试
5. 更新相关文档
6. 运行完整验证
```

#### **重命名字段**
```markdown
1. 同时更新Schema和TypeScript定义
2. 更新所有映射函数
3. 更新测试用例
4. 考虑向后兼容性
5. 更新文档
6. 运行完整验证
```

#### **删除字段**
```markdown
1. 标记字段为deprecated (先保留)
2. 更新文档说明废弃原因
3. 提供迁移指南
4. 在下个主版本中移除
5. 更新所有相关代码
```

## 🚨 **常见问题解决**

### **问题1: 映射不一致错误**
```bash
# 错误信息
Error: Schema field 'context_id' not found in TypeScript entity

# 解决方案
1. 检查TypeScript接口是否有对应的camelCase字段
2. 运行自动修复工具: npm run fix:naming
3. 手动添加缺失字段
4. 验证修复结果: npm run validate:mapping
```

### **问题2: TypeScript编译错误**
```bash
# 错误信息
Property 'context_id' does not exist on type 'ContextEntity'

# 解决方案
1. 确认使用camelCase: contextId 而不是 context_id
2. 检查导入的类型定义
3. 运行类型检查: npm run typecheck
4. 使用IDE的自动修复功能
```

### **问题3: 测试失败**
```bash
# 错误信息
Expected 'contextId' but received 'context_id'

# 解决方案
1. 检查测试数据是否使用正确的命名约定
2. 确认测试是针对Schema还是Entity
3. 使用正确的映射函数
4. 更新测试期望值
```

## 📚 **参考资源**

### **代码示例**
- [Context模块完整示例](../examples/context-module-example.md)
- [映射函数示例](../examples/mapping-functions.md)
- [测试用例示例](../examples/test-cases.md)

### **工具文档**
- [验证工具使用指南](../tools/validation-tools.md)
- [自动修复工具指南](../tools/auto-fix-tools.md)
- [IDE插件配置](../tools/ide-plugins.md)

### **最佳实践**
- [命名约定最佳实践](../best-practices/naming-conventions.md)
- [代码审查检查清单](../best-practices/code-review-checklist.md)
- [性能优化指南](../best-practices/performance-optimization.md)

---

**📅 文档状态**: ✅ 生效中  
**🔄 下次审查**: 2025年11月6日  
**📝 变更记录**: 初始版本创建  
**👥 审查人员**: MPLP开发团队  
**🎯 适用范围**: 所有MPLP模块开发
