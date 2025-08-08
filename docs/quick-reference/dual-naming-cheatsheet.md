# MPLP双重命名约定快速参考

## 🎯 **核心原则**

```
Schema层:     snake_case  (JSON/API标准)
TypeScript层: camelCase   (JavaScript标准)
映射机制:     自动转换    (序列化/反序列化)
```

## 📋 **常用字段映射表**

| Schema (snake_case) | TypeScript (camelCase) | 类型 |
|-------------------|----------------------|------|
| `context_id` | `contextId` | string |
| `session_id` | `sessionId` | string |
| `agent_id` | `agentId` | string |
| `plan_id` | `planId` | string |
| `trace_id` | `traceId` | string |
| `role_id` | `roleId` | string |
| `extension_id` | `extensionId` | string |
| `dialog_id` | `dialogId` | string |
| `network_id` | `networkId` | string |
| `created_at` | `createdAt` | Date |
| `updated_at` | `updatedAt` | Date |
| `started_at` | `startedAt` | Date |
| `completed_at` | `completedAt` | Date |
| `lifecycle_stage` | `lifecycleStage` | string |
| `execution_status` | `executionStatus` | string |
| `protocol_version` | `protocolVersion` | string |
| `timeout_ms` | `timeoutMs` | number |
| `retry_count` | `retryCount` | number |
| `performance_metrics` | `performanceMetrics` | object |
| `error_information` | `errorInformation` | object |
| `validation_rules` | `validationRules` | object |
| `access_control` | `accessControl` | object |
| `shared_state` | `sharedState` | object |
| `task_dependencies` | `taskDependencies` | array |
| `approval_criteria` | `approvalCriteria` | object |
| `notification_settings` | `notificationSettings` | object |
| `audit_trail` | `auditTrail` | array |
| `decision_mechanism` | `decisionMechanism` | object |
| `message_history` | `messageHistory` | array |
| `network_topology` | `networkTopology` | object |

## 🔧 **快速命令**

```bash
# 验证映射一致性
npm run validate:mapping

# 修复字段名问题
npm run fix:naming

# 检查命名一致性
npm run check:naming

# 完整质量检查
npm run quality:check

# TypeScript编译检查
npm run typecheck

# ESLint检查
npm run lint
```

## 📝 **代码模板**

### Schema定义模板
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://mplp.dev/schemas/v1.0/mplp-{module}.json",
  "title": "MPLP {Module} Protocol v1.0",
  "description": "{Module}模块协议Schema",
  "type": "object",
  "properties": {
    "protocol_version": {"type": "string"},
    "timestamp": {"type": "string", "format": "date-time"},
    "context_id": {"type": "string", "format": "uuid"},
    "{module}_id": {"type": "string", "format": "uuid"}
  },
  "required": ["protocol_version", "timestamp", "context_id"],
  "additionalProperties": false
}
```

### TypeScript接口模板
```typescript
export interface {Module}Entity {
  protocolVersion: string;
  timestamp: Date;
  contextId: string;
  {module}Id: string;
}

export interface Create{Module}Request {
  contextId: string;
  // 其他字段...
}
```

### 映射函数模板
```typescript
export class {Module}Mapper {
  static toSchema(entity: {Module}Entity): {Module}Schema {
    return {
      protocol_version: entity.protocolVersion,
      timestamp: entity.timestamp.toISOString(),
      context_id: entity.contextId,
      {module}_id: entity.{module}Id
    };
  }
  
  static fromSchema(schema: {Module}Schema): {Module}Entity {
    return new {Module}Entity({
      protocolVersion: schema.protocol_version,
      timestamp: new Date(schema.timestamp),
      contextId: schema.context_id,
      {module}Id: schema.{module}_id
    });
  }
}
```

## ✅ **检查清单**

### 新字段添加
- [ ] Schema中使用snake_case
- [ ] TypeScript中使用camelCase
- [ ] 更新映射函数
- [ ] 添加类型定义
- [ ] 运行验证工具
- [ ] 更新测试用例

### 字段重命名
- [ ] 同时更新Schema和TypeScript
- [ ] 更新所有映射函数
- [ ] 更新测试数据
- [ ] 考虑向后兼容性
- [ ] 运行完整验证
- [ ] 更新文档

### 代码审查
- [ ] 字段命名符合约定
- [ ] 映射函数正确实现
- [ ] 类型定义完整
- [ ] 测试覆盖充分
- [ ] 文档同步更新

## 🚨 **常见错误**

### ❌ 错误示例
```typescript
// 错误：在TypeScript中使用snake_case
interface Context {
  context_id: string;  // 应该是 contextId
  session_id: string;  // 应该是 sessionId
}

// 错误：在Schema中使用camelCase
{
  "contextId": "string",  // 应该是 context_id
  "sessionId": "string"   // 应该是 session_id
}

// 错误：映射不一致
entity.context_id = schema.contextId;  // 类型不匹配
```

### ✅ 正确示例
```typescript
// 正确：TypeScript使用camelCase
interface Context {
  contextId: string;
  sessionId: string;
}

// 正确：Schema使用snake_case
{
  "context_id": "string",
  "session_id": "string"
}

// 正确：映射一致
entity.contextId = schema.context_id;
```

## 🔗 **相关链接**

- [完整架构文档](../architecture/dual-naming-convention.md)
- [实施指南](../architecture/dual-naming-implementation-guide.md)
- [架构文档索引](../architecture/README.md)
- [开发工具指南](../tools/automation-tools.md)

## 💡 **记忆技巧**

```
Schema = API = External = snake_case
TypeScript = Code = Internal = camelCase

JSON API 标准 → snake_case
JavaScript 标准 → camelCase
```

---

**📅 最后更新**: 2025年8月6日  
**📝 版本**: v1.0.0  
**🎯 适用**: 所有MPLP模块开发
