# 追踪适配器配置迁移指南

> **项目**: Multi-Agent Project Lifecycle Protocol (MPLP)  
> **版本**: v1.0.0  
> **创建时间**: 2025-07-16  
> **更新时间**: 2025-07-16T16:00:00+08:00  
> **作者**: MPLP团队

## 📖 概述

本指南提供了从厂商特定配置（TracePilot）迁移到厂商中立配置（TraceAdapter）的详细步骤。为了符合MPLP项目的厂商中立原则，我们强烈建议所有开发者尽快完成迁移。

## 🔄 迁移步骤

### 1. 更新导入语句

#### 旧代码

```typescript
import { tracePilotConfig } from '../../src/config/tracepilot';
// 或
import { createTracePilotConfig } from '../../src/config/tracepilot';
```

#### 新代码

```typescript
// 推荐: 直接使用厂商中立的配置
import { traceAdapterConfig } from '../../src/config/trace-adapter.config';
// 或
import { createTraceAdapterConfig } from '../../src/config/trace-adapter.config';

// 如果需要向后兼容:
import { tracePilotConfig } from '../../src/config/tracepilot';
```

### 2. 更新配置访问

#### 旧代码

```typescript
// 直接使用TracePilot配置
const apiUrl = config.tracepilot.apiUrl;
const batchSize = config.tracepilot.batchSize;
const enabled = config.tracepilot.integration.enabled;
```

#### 新代码

```typescript
// 使用厂商中立配置
const apiUrl = config.traceAdapter.apiUrl;
const batchSize = config.traceAdapter.batchSize;
const enabled = config.traceAdapter.integration.enabled;
```

### 3. 更新环境变量

#### 旧环境变量

```
TRACEPILOT_API_URL=https://api.example.com
TRACEPILOT_API_KEY=your-api-key
TRACEPILOT_TIMEOUT=10000
TRACEPILOT_BATCH_SIZE=100
TRACEPILOT_ENABLED=true
TRACEPILOT_ENHANCED=true
```

#### 新环境变量

```
TRACE_ADAPTER_API_URL=https://api.example.com
TRACE_ADAPTER_API_KEY=your-api-key
TRACE_ADAPTER_TIMEOUT=10000
TRACE_ADAPTER_BATCH_SIZE=100
TRACE_ADAPTER_ENABLED=true
TRACE_ADAPTER_ENHANCED=true
```

> **注意**: 为了向后兼容，旧的环境变量仍然有效，但建议尽快迁移到新的环境变量。

### 4. 更新接口类型

#### 旧类型

```typescript
import { TracePilotConfig, TracePilotConnectionConfig } from '../../src/config/tracepilot';

function setupTracing(config: TracePilotConfig): void {
  // ...
}
```

#### 新类型

```typescript
import { TraceAdapterConfig, TraceAdapterConnectionConfig } from '../../src/config/trace-adapter.config';

function setupTracing(config: TraceAdapterConfig): void {
  // ...
}
```

## 📋 配置映射表

| 旧配置 (TracePilot) | 新配置 (TraceAdapter) |
|-------------------|---------------------|
| `tracePilotConfig` | `traceAdapterConfig` |
| `TracePilotConfig` | `TraceAdapterConfig` |
| `TracePilotConnectionConfig` | `TraceAdapterConnectionConfig` |
| `TracePilotPerformanceConfig` | `TraceAdapterPerformanceConfig` |
| `TracePilotIntegrationConfig` | `TraceAdapterIntegrationConfig` |
| `createTracePilotConfig()` | `createTraceAdapterConfig()` |
| `getTracePilotHealthConfig()` | `getTraceAdapterHealthConfig()` |
| `getTracePilotMetricsConfig()` | `getTraceAdapterMetricsConfig()` |

## ⚠️ 注意事项

1. **重定向文件**: `src/config/tracepilot.ts` 现在是一个重定向文件，它会导入新的厂商中立配置并重新导出。虽然现有代码仍然可以工作，但会显示废弃警告。

2. **环境变量优先级**: 新的厂商中立环境变量（`TRACE_ADAPTER_*`）优先于旧的厂商特定环境变量（`TRACEPILOT_*`）。

3. **配置结构**: 配置结构保持不变，只是重命名了接口和变量名称。

4. **日志警告**: 如果继续使用旧的配置文件，系统会记录废弃警告日志。

## 🔍 迁移验证

迁移完成后，可以运行以下命令验证配置是否正确：

```bash
# 验证环境变量
echo $TRACE_ADAPTER_API_URL

# 验证配置
node -e "const { traceAdapterConfig } = require('./dist/config/trace-adapter.config'); console.log(traceAdapterConfig);"

# 验证服务器启动
npm start
```

## 📅 迁移时间表

- **立即**: 新项目应直接使用厂商中立配置
- **3个月内**: 现有项目应完成迁移
- **6个月后**: 旧的厂商特定配置将被移除

---

**状态**: 已发布 ✅  
**审核**: 已通过 ✅  
**最后更新**: 2025-07-16T16:00:00+08:00 