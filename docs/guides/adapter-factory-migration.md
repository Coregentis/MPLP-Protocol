# 适配器工厂迁移指南

> **项目**: Multi-Agent Project Lifecycle Protocol (MPLP)  
> **版本**: v1.0.0  
> **创建时间**: 2025-07-16  
> **更新时间**: 2025-07-16T14:30:00+08:00  
> **作者**: MPLP团队

## 📖 概述

本指南提供了从旧的`MCPAdapterFactory`（现在重命名为`LegacyAdapterFactory`）迁移到新的厂商中立适配器工厂的详细步骤。为了符合MPLP项目的厂商中立原则，我们强烈建议所有开发者尽快完成迁移。

## 🔄 迁移步骤

### 1. 更新导入语句

#### 旧代码

```typescript
import { MCPAdapterFactory } from '../../src/mcp/adapter-factory';
// 或
import { AdapterFactory } from '../../src/mcp/adapter-factory';
```

#### 新代码

```typescript
// 推荐: 直接使用厂商中立的适配器工厂
import { TraceAdapterFactory } from '../../src/adapters/trace/adapter-factory';

// 如果需要向后兼容:
import { LegacyAdapterFactory } from '../../src/adapters/legacy-adapter-factory';
// 或
import { AdapterFactory } from '../../src/adapters/legacy-adapter-factory';
```

### 2. 更新适配器创建代码

#### 旧代码

```typescript
// 使用MCPAdapterFactory创建适配器
const adapter = MCPAdapterFactory.createTraceAdapter({
  type: 'enhanced',
  api_endpoint: 'https://api.example.com',
  api_key: 'your-api-key',
  organization_id: 'org-id',
  batch_size: 100,
  enhanced_features: {
    ai_diagnostics: true,
    failure_prediction: true,
    auto_recovery: false
  }
});
```

#### 新代码

```typescript
// 推荐: 使用厂商中立的适配器工厂
const adapterFactory = TraceAdapterFactory.getInstance();
const adapter = adapterFactory.createAdapter('enhanced', {
  name: 'enhanced-trace-adapter',
  version: '1.0.1',
  batchSize: 100,
  enableAdvancedAnalytics: true,
  enableDevelopmentIssueDetection: true,
  enableRecoverySuggestions: false
});

// 如果需要向后兼容:
const adapter = LegacyAdapterFactory.createTraceAdapter({
  type: 'enhanced',
  api_endpoint: 'https://api.example.com',
  api_key: 'your-api-key',
  organization_id: 'org-id',
  batch_size: 100,
  features: {
    advanced_analytics: true,
    failure_prediction: true,
    auto_recovery: false
  }
});
```

### 3. 更新适配器获取代码

#### 旧代码

```typescript
// 使用MCPAdapterFactory获取适配器
const adapter = MCPAdapterFactory.getTraceAdapter();
```

#### 新代码

```typescript
// 推荐: 使用适配器注册表
import { adapterRegistry } from '../../src/core/adapter-registry';
const adapter = adapterRegistry.getTraceAdapter();

// 如果需要向后兼容:
const adapter = LegacyAdapterFactory.getTraceAdapter();
```

## 🔧 配置转换参考

为了帮助开发者理解配置转换，下面提供了旧配置到新配置的映射关系：

| 旧配置字段 | 新配置字段 | 说明 |
|------------|------------|------|
| `type` | 适配器类型参数 | 'enhanced' → 'enhanced', 'basic' → 'base' |
| `api_endpoint` | 无需显式指定 | 由适配器内部处理 |
| `api_key` | 无需显式指定 | 由适配器内部处理 |
| `organization_id` | 无需显式指定 | 由适配器内部处理 |
| `batch_size` | `batchSize` | 直接映射 |
| `enhanced_features.ai_diagnostics` | `enableAdvancedAnalytics` | 功能映射 |
| `enhanced_features.failure_prediction` | `enableDevelopmentIssueDetection` | 功能映射 |
| `enhanced_features.auto_recovery` | `enableRecoverySuggestions` | 功能映射 |

## ⚠️ 注意事项

1. `LegacyAdapterFactory`仅作为过渡方案，未来版本可能会完全移除
2. 新的厂商中立适配器提供了更好的性能和更丰富的功能
3. 所有新开发的代码应直接使用厂商中立的适配器工厂
4. 迁移后请进行充分测试，确保功能正常

## 📅 迁移时间表

- **立即**: 所有新代码必须使用厂商中立适配器工厂
- **1个月内**: 完成所有现有代码的迁移
- **3个月后**: `LegacyAdapterFactory`将标记为废弃
- **6个月后**: `LegacyAdapterFactory`可能被完全移除

## 🔍 相关资源

- [厂商中立设计指南](./vendor-neutral-design.md) - 厂商中立设计原则
- [适配器模式最佳实践](./adapter-pattern-best-practices.md) - 适配器模式实现指南
- [API文档](../api/adapter-factory-api.md) - 适配器工厂API文档

---

**维护团队**: MPLP项目团队  
**联系方式**: mplp-support@coregentis.com 