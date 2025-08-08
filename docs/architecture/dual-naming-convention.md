# MPLP双重命名约定架构设计文档

## 📋 **文档信息**

**文档版本**: v1.0.0  
**创建日期**: 2025年8月6日  
**最后更新**: 2025年8月6日  
**负责人**: MPLP架构团队  
**状态**: 生效中  
**重要性**: 🚨 **核心架构决策** - 影响整个项目设计

## 🎯 **概述**

MPLP (Multi-Agent Project Lifecycle Protocol) 采用了独特的**双重命名约定**架构设计：
- **Schema层**: 使用 `snake_case` 命名 (符合JSON/API标准)
- **TypeScript层**: 使用 `camelCase` 命名 (符合JavaScript标准)

这是一个经过深思熟虑的架构决策，旨在平衡技术标准合规性、跨语言兼容性和开发者体验。

## 🏗️ **设计原理**

### **1. 技术标准遵循**

#### **Schema层 - snake_case**
```json
// 符合以下标准:
// - RFC 7159: JSON数据交换格式标准
// - REST API最佳实践
// - OpenAPI规范推荐
// - 数据库命名约定

{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "properties": {
    "context_id": {"type": "string"},
    "session_id": {"type": "string"},
    "created_at": {"type": "string", "format": "date-time"},
    "lifecycle_stage": {"type": "string"},
    "protocol_version": {"type": "string"}
  }
}
```

#### **TypeScript层 - camelCase**
```typescript
// 符合以下标准:
// - ECMAScript规范
// - TypeScript官方风格指南
// - JavaScript社区约定
// - Node.js生态系统

interface ContextEntity {
  contextId: string;
  sessionId: string;
  createdAt: Date;
  lifecycleStage: ContextLifecycleStage;
  protocolVersion: string;
}
```

### **2. 跨语言互操作性**

#### **多语言原生支持**
```python
# Python - 原生snake_case
context_data = {
    "context_id": "123",
    "session_id": "abc",
    "created_at": "2025-01-01"
}
```

```java
// Java - 通过注解映射
public class ContextData {
    @JsonProperty("context_id")
    private String contextId;
    
    @JsonProperty("session_id")
    private String sessionId;
}
```

```go
// Go - 通过struct tag
type ContextData struct {
    ContextID string `json:"context_id"`
    SessionID string `json:"session_id"`
}
```

```rust
// Rust - 通过serde
#[derive(Serialize, Deserialize)]
struct ContextData {
    #[serde(rename = "context_id")]
    context_id: String,
    #[serde(rename = "session_id")]
    session_id: String,
}
```

## 📊 **优势分析**

### **✅ 显著优势**

#### **1. 标准合规性 (9/10)**
- **JSON/API层**: 100%符合REST API最佳实践
- **TypeScript层**: 100%符合JavaScript生态标准
- **数据库层**: 符合SQL命名约定
- **文档层**: 符合OpenAPI规范

#### **2. 跨语言兼容性 (9/10)**
- **无缝集成**: 每种语言使用其原生命名约定
- **降低学习成本**: 开发者使用熟悉的命名风格
- **生态系统友好**: 符合各语言生态的期望

#### **3. 生态系统集成 (8/10)**
- **数据库ORM**: 大多数ORM期望snake_case
- **API文档**: Swagger/OpenAPI推荐snake_case
- **配置文件**: YAML/JSON配置通常使用snake_case
- **日志系统**: 结构化日志通常使用snake_case

#### **4. 开发者体验 (7/10)**
- **前端开发者**: 熟悉camelCase，降低学习成本
- **后端开发者**: 熟悉snake_case，符合数据库习惯
- **API消费者**: 符合REST API期望
- **多语言团队**: 每种语言都使用其原生约定

## ⚠️ **挑战与成本**

### **❌ 潜在问题**

#### **1. 映射复杂性 (4/10)**
```typescript
// 需要在序列化/反序列化时进行转换
class SchemaMapper {
  static toSchema(entity: ContextEntity): ContextSchema {
    return {
      context_id: entity.contextId,        // 手动映射
      session_id: entity.sessionId,        // 手动映射
      created_at: entity.createdAt.toISOString(),
      lifecycle_stage: entity.lifecycleStage,
      protocol_version: entity.protocolVersion
    };
  }
  
  static fromSchema(schema: ContextSchema): ContextEntity {
    return new ContextEntity({
      contextId: schema.context_id,        // 反向映射
      sessionId: schema.session_id,
      createdAt: new Date(schema.created_at),
      lifecycleStage: schema.lifecycle_stage,
      protocolVersion: schema.protocol_version
    });
  }
}
```

#### **2. 开发复杂度增加 (5/10)**
- 需要维护两套命名约定
- 容易出现映射错误
- 增加了代码审查的复杂性
- 新开发者需要理解双重约定

#### **3. 工具链复杂性 (5/10)**
- 需要专门的验证脚本
- IDE可能无法自动检测不一致
- 代码生成工具需要特殊配置
- 测试需要验证两层映射

#### **4. 维护成本 (4/10)**
- 字段名变更需要同时修改两处
- 重构工具可能无法自动处理
- 文档需要说明映射关系
- 错误排查更加困难

## 🛠️ **实施策略**

### **1. 自动化工具支持**

#### **验证工具**
```bash
# Schema-TypeScript映射验证
node scripts/validate-schema-mapping.js

# 字段名标准化检查
node scripts/check-naming-consistency.js

# 自动修复工具
node scripts/fix-entity-field-names.js
```

#### **开发工具集成**
```json
// package.json
{
  "scripts": {
    "validate:mapping": "node scripts/validate-schema-mapping.js",
    "fix:naming": "node scripts/fix-entity-field-names.js",
    "check:consistency": "npm run validate:mapping && npm run typecheck"
  }
}
```

### **2. 映射层实现**

#### **标准映射接口**
```typescript
interface SchemaMapper<TEntity, TSchema> {
  toSchema(entity: TEntity): TSchema;
  fromSchema(schema: TSchema): TEntity;
  validateMapping(entity: TEntity, schema: TSchema): boolean;
}
```

#### **自动映射装饰器**
```typescript
class ContextEntity {
  @SchemaField('context_id')
  contextId: string;
  
  @SchemaField('session_id')
  sessionId: string;
  
  @SchemaField('created_at')
  createdAt: Date;
}
```

### **3. 开发流程规范**

#### **强制检查点**
1. **代码提交前**: 运行映射验证
2. **Pull Request**: 自动检查命名一致性
3. **CI/CD流程**: 集成验证脚本
4. **发布前**: 完整的映射测试

#### **开发指南**
```markdown
## 字段命名规则

### Schema定义 (snake_case)
- 所有字段使用snake_case: context_id, session_id
- 符合JSON Schema标准
- 与REST API保持一致

### TypeScript实现 (camelCase)
- 所有属性使用camelCase: contextId, sessionId
- 符合JavaScript约定
- 提供良好的IDE支持

### 映射关系
- context_id ↔ contextId
- session_id ↔ sessionId
- created_at ↔ createdAt
```

## 📋 **最佳实践**

### **1. 新字段添加流程**
```markdown
1. 在Schema中定义字段 (snake_case)
2. 在TypeScript接口中添加对应字段 (camelCase)
3. 更新映射函数
4. 添加验证测试
5. 更新文档
```

### **2. 字段重命名流程**
```markdown
1. 同时更新Schema和TypeScript定义
2. 更新所有映射函数
3. 运行完整的验证测试
4. 更新相关文档
5. 考虑向后兼容性
```

### **3. 错误排查指南**
```markdown
常见问题:
1. 映射不一致 → 运行 validate-schema-mapping.js
2. 字段名错误 → 运行 fix-entity-field-names.js
3. TypeScript错误 → 检查camelCase使用
4. API测试失败 → 检查snake_case使用
```

## 🎯 **决策依据**

### **综合评估结果**

| 维度 | 评分 (1-10) | 权重 | 加权分 |
|------|-------------|------|--------|
| **标准合规性** | 9 | 20% | 1.8 |
| **跨语言兼容** | 9 | 20% | 1.8 |
| **开发体验** | 6 | 15% | 0.9 |
| **维护复杂度** | 4 | 15% | 0.6 |
| **工具支持** | 5 | 10% | 0.5 |
| **团队协作** | 5 | 10% | 0.5 |
| **长期可持续** | 6 | 10% | 0.6 |

**总体评分**: **6.7/10** - 中等偏上，优势明显但需要投入

### **决策理由**

**✅ 选择双重命名约定的原因**:

1. **MPLP是协议标准**: 需要支持多语言实现
2. **跨平台集成需求**: 厂商中立和生态兼容
3. **技术团队能力**: 有能力维护复杂性
4. **长期价值**: 标准合规性带来的收益
5. **工具支持**: 已建立完整的自动化工具链

## 🔄 **持续改进计划**

### **短期目标 (1-3个月)**
- [ ] 完善自动化验证工具
- [ ] 建立详细的开发指南
- [ ] 集成到CI/CD流程
- [ ] 培训团队成员

### **中期目标 (3-6个月)**
- [ ] 开发IDE插件支持
- [ ] 建立代码生成工具
- [ ] 优化映射性能
- [ ] 扩展到更多语言

### **长期目标 (6-12个月)**
- [ ] 建立行业最佳实践
- [ ] 开源工具链
- [ ] 社区贡献指南
- [ ] 标准化推广

## 🚨 **风险管理**

### **高风险场景及应对**

#### **1. 大型团队开发**
**风险**: 不同开发者可能混用命名约定
**应对**:
- 强制代码审查检查
- 自动化验证工具
- 团队培训和文档

#### **2. 快速迭代开发**
**风险**: 时间压力下容易出现映射错误
**应对**:
- 集成到IDE中的实时检查
- 预提交钩子验证
- 快速修复工具

#### **3. 第三方集成**
**风险**: 外部开发者可能不理解双重约定
**应对**:
- 详细的集成文档
- 示例代码和最佳实践
- 社区支持和FAQ

### **监控指标**

```typescript
// 映射一致性监控
interface MappingMetrics {
  totalFields: number;
  consistentMappings: number;
  inconsistentMappings: number;
  consistencyRate: number;
  lastValidation: Date;
}

// 开发效率影响监控
interface DevelopmentMetrics {
  averageFeatureDevelopmentTime: number;
  mappingRelatedBugs: number;
  codeReviewTime: number;
  newDeveloperOnboardingTime: number;
}
```

## 🎓 **团队培训指南**

### **新开发者入门**

#### **必读材料**
1. 本架构设计文档
2. MPLP命名标准文档
3. 实际代码示例
4. 常见问题解答

#### **实践练习**
1. 创建一个简单的Schema定义
2. 实现对应的TypeScript接口
3. 编写映射函数
4. 运行验证工具

#### **检查清单**
- [ ] 理解双重命名约定的原理
- [ ] 能够正确创建Schema定义
- [ ] 能够实现TypeScript接口
- [ ] 熟悉自动化工具使用
- [ ] 通过实践测试

### **持续教育**

#### **定期培训**
- 每季度架构设计回顾
- 新工具和最佳实践分享
- 问题案例分析和改进

#### **知识分享**
- 内部技术分享会
- 文档更新通知
- 社区最佳实践收集

## 📚 **相关文档**

- [MPLP命名标准](../standards/MPLP-Naming-Standards-v2.0.0.md)
- [Schema驱动开发指南](../development/schema-driven-development.md)
- [跨语言集成指南](../integration/cross-language-integration.md)
- [自动化工具使用指南](../tools/automation-tools.md)
- [双重命名约定实施指南](./dual-naming-implementation-guide.md)

## 🔗 **快速链接**

### **工具脚本**
```bash
# 验证映射一致性
npm run validate:mapping

# 修复字段名问题
npm run fix:naming

# 完整质量检查
npm run quality:check

# 生成映射报告
npm run report:mapping
```

### **常用命令**
```bash
# 检查单个模块
node scripts/validate-schema-mapping.js --module=context

# 修复特定文件
node scripts/fix-entity-field-names.js --file=src/modules/context/types.ts

# 生成映射文档
node scripts/generate-mapping-docs.js
```

---

**📅 文档状态**: ✅ 生效中
**🔄 下次审查**: 2025年11月6日
**📝 变更记录**: 初始版本创建，包含风险管理和培训指南
**👥 审查人员**: MPLP架构团队
**🎯 重要性**: 🚨 **核心架构决策** - 所有开发者必读
