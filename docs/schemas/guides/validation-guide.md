# MPLP Schema 验证指南

## 📋 **概述**

本指南详细介绍MPLP Schema的验证工具使用方法、验证策略和最佳实践，确保数据质量和协议合规性。

**版本**: v1.0.0  
**验证工具**: MPLP Schema Validator v1.0.0  
**支持格式**: JSON Schema Draft-07

## 🛠️ **验证工具概览**

### **工具架构**
```
MPLP Schema Validator
├── 语法验证器 (Syntax Validator)
├── 兼容性验证器 (Compatibility Validator)  
├── 数据验证器 (Data Validator)
├── 报告生成器 (Report Generator)
└── CLI工具 (Command Line Interface)
```

### **核心功能**
- **Schema语法验证**: 检查Schema文件的语法正确性
- **数据验证**: 验证数据是否符合Schema规范
- **兼容性检查**: 检查Schema版本间的兼容性
- **批量验证**: 支持大量数据的批量验证
- **报告生成**: 生成详细的验证报告

## 🚀 **快速开始**

### **1. 安装验证工具**
```bash
# 全局安装CLI工具
npm install -g @mplp/schema-validator-cli

# 项目依赖安装
npm install @mplp/schema-validator
```

### **2. 基础验证命令**
```bash
# 验证所有Schema文件
mplp-validator check-syntax --path src/schemas

# 验证特定Schema
mplp-validator check-syntax --path src/schemas/mplp-context.json

# 验证数据
mplp-validator validate --schema mplp-context --data context-data.json

# 生成HTML报告
mplp-validator check-syntax --format html --output validation-report.html
```

## 🔍 **语法验证**

### **Schema文件验证**
```bash
# 验证单个Schema文件
mplp-validator check-syntax --path src/schemas/mplp-context.json --verbose

# 验证所有Schema文件
mplp-validator check-syntax --path src/schemas --format json --output results.json

# 严格模式验证
mplp-validator check-syntax --path src/schemas --strict
```

### **验证结果示例**
```json
{
  "isValid": true,
  "schemaFile": "mplp-context.json",
  "validationTime": "2025-08-13T10:30:00.000Z",
  "errors": [],
  "warnings": [
    {
      "code": "MISSING_EXAMPLE",
      "message": "建议为复杂字段添加示例",
      "path": "properties.business_context",
      "severity": "info"
    }
  ],
  "metadata": {
    "schemaVersion": "draft-07",
    "fieldCount": 25,
    "requiredFields": 6,
    "optionalFields": 19
  }
}
```

### **常见语法错误**
```typescript
// 错误示例和修复方法
const commonSyntaxErrors = {
  // 1. 缺少必需字段
  missingRequired: {
    error: "Missing required property: $schema",
    fix: "添加 $schema 字段指定JSON Schema版本"
  },

  // 2. 无效的正则表达式
  invalidRegex: {
    error: "Invalid regex pattern in 'pattern' property",
    fix: "检查并修正正则表达式语法"
  },

  // 3. 循环引用
  circularReference: {
    error: "Circular reference detected",
    fix: "重构Schema结构，避免循环引用"
  },

  // 4. 类型不匹配
  typeMismatch: {
    error: "Type mismatch: expected string, got number",
    fix: "确保字段类型定义与实际值匹配"
  }
};
```

## 📊 **数据验证**

### **单条数据验证**
```typescript
import { validateData } from '@mplp/schema-validator';

// 验证Context数据
const contextData = {
  protocol_version: "1.0.0",
  timestamp: "2025-08-13T10:30:00.000Z",
  context_id: "550e8400-e29b-41d4-a716-446655440000",
  name: "测试上下文",
  status: "active",
  priority: "high"
};

const result = await validateData('mplp-context', contextData);

if (result.isValid) {
  console.log('✅ 数据验证通过');
  console.log('验证耗时:', result.metadata.validationTimeMs, 'ms');
} else {
  console.error('❌ 数据验证失败:');
  result.errors.forEach(error => {
    console.error(`  - ${error.errorPath}: ${error.errorMessage}`);
  });
}
```

### **批量数据验证**
```typescript
import { validateBatch } from '@mplp/schema-validator';

// 批量验证多个上下文
const contextDataArray = [
  { /* context 1 */ },
  { /* context 2 */ },
  { /* context 3 */ }
];

const batchResult = await validateBatch('mplp-context', contextDataArray);

console.log(`批量验证完成:`);
console.log(`  总数: ${batchResult.totalCount}`);
console.log(`  成功: ${batchResult.successCount}`);
console.log(`  失败: ${batchResult.failureCount}`);

// 处理失败的数据
batchResult.failed.forEach(failure => {
  console.error(`数据 ${failure.index} 验证失败:`, failure.errors);
});
```

### **流式验证**
```typescript
import { createValidationStream } from '@mplp/schema-validator';

// 创建验证流
const validationStream = createValidationStream('mplp-context', {
  batchSize: 100,
  concurrency: 4
});

// 处理验证结果
validationStream.on('valid', (data, index) => {
  console.log(`数据 ${index} 验证通过`);
});

validationStream.on('invalid', (data, errors, index) => {
  console.error(`数据 ${index} 验证失败:`, errors);
});

validationStream.on('complete', (summary) => {
  console.log('流式验证完成:', summary);
});

// 写入数据进行验证
largeDataArray.forEach(data => {
  validationStream.write(data);
});

validationStream.end();
```

## 🔄 **兼容性验证**

### **版本兼容性检查**
```bash
# 检查两个Schema版本的兼容性
mplp-validator check-compatibility \
  --source mplp-context-v1.0.json \
  --target mplp-context-v1.1.json

# 生成兼容性矩阵
mplp-validator check-compatibility --path src/schemas --format html
```

### **兼容性规则**
```typescript
const compatibilityRules = {
  // 向后兼容的变更
  backwardCompatible: [
    'ADD_OPTIONAL_FIELD',      // 添加可选字段
    'RELAX_VALIDATION',        // 放宽验证规则
    'ADD_ENUM_VALUE',          // 添加枚举值
    'INCREASE_MAX_LENGTH'      // 增加最大长度
  ],

  // 破坏性变更
  breakingChanges: [
    'REMOVE_REQUIRED_FIELD',   // 删除必需字段
    'CHANGE_FIELD_TYPE',       // 改变字段类型
    'REMOVE_ENUM_VALUE',       // 删除枚举值
    'DECREASE_MAX_LENGTH'      // 减少最大长度
  ],

  // 需要注意的变更
  warningChanges: [
    'ADD_REQUIRED_FIELD',      // 添加必需字段
    'DEPRECATE_FIELD',         // 废弃字段
    'CHANGE_DEFAULT_VALUE'     // 改变默认值
  ]
};
```

### **兼容性报告示例**
```json
{
  "compatibilityCheck": {
    "sourceVersion": "1.0.0",
    "targetVersion": "1.1.0",
    "isCompatible": true,
    "compatibilityLevel": "backward_compatible",
    "changes": [
      {
        "type": "ADD_OPTIONAL_FIELD",
        "path": "properties.extended_metadata",
        "description": "添加了可选的扩展元数据字段",
        "impact": "low"
      }
    ],
    "recommendations": [
      "新字段为可选，不影响现有数据",
      "建议更新文档说明新字段用途"
    ]
  }
}
```

## 🎯 **自定义验证规则**

### **业务规则验证**
```typescript
import { addCustomValidator } from '@mplp/schema-validator';

// 添加自定义验证器
addCustomValidator('validateBusinessId', (value: unknown): boolean => {
  if (typeof value !== 'string') return false;
  return /^BIZ-[A-Z0-9]{8}$/.test(value);
});

addCustomValidator('validateTimeRange', (value: unknown): boolean => {
  if (typeof value !== 'object' || !value) return false;
  const range = value as { start: string; end: string };
  const start = new Date(range.start);
  const end = new Date(range.end);
  return start < end && (end.getTime() - start.getTime()) <= 86400000; // 最多24小时
});

// 在Schema中使用自定义验证器
const schemaWithCustomValidation = {
  "properties": {
    "business_id": {
      "type": "string",
      "customValidator": "validateBusinessId"
    },
    "time_range": {
      "type": "object",
      "customValidator": "validateTimeRange"
    }
  }
};
```

### **异步验证规则**
```typescript
import { addAsyncValidator } from '@mplp/schema-validator';

// 添加异步验证器（如数据库唯一性检查）
addAsyncValidator('validateUniqueContextName', async (value: unknown): Promise<boolean> => {
  if (typeof value !== 'string') return false;
  
  const existingContext = await contextRepository.findByName(value);
  return !existingContext;
});

// 使用异步验证
const result = await validateDataAsync('mplp-context', contextData, {
  enableAsyncValidation: true,
  asyncTimeout: 5000 // 5秒超时
});
```

## 📈 **性能优化**

### **验证性能配置**
```typescript
import { configureValidator } from '@mplp/schema-validator';

// 性能优化配置
configureValidator({
  // 缓存编译后的Schema
  enableSchemaCache: true,
  schemaCacheSize: 100,
  schemaCacheTTL: 300000, // 5分钟

  // 并行验证配置
  enableParallelValidation: true,
  maxConcurrency: 4,
  batchSize: 50,

  // 验证超时设置
  validationTimeout: 10000, // 10秒
  asyncValidationTimeout: 5000, // 5秒

  // 错误收集策略
  collectAllErrors: false, // 遇到第一个错误就停止
  maxErrorCount: 10
});
```

### **性能监控**
```typescript
import { ValidationPerformanceMonitor } from '@mplp/schema-validator';

const monitor = new ValidationPerformanceMonitor();

// 监控验证性能
monitor.on('validation_complete', (metrics) => {
  console.log(`验证完成: ${metrics.duration}ms`);
  console.log(`Schema: ${metrics.schemaName}`);
  console.log(`数据大小: ${metrics.dataSize} bytes`);
  console.log(`错误数量: ${metrics.errorCount}`);
});

// 获取性能统计
const stats = monitor.getStatistics();
console.log('验证性能统计:', {
  totalValidations: stats.totalCount,
  averageDuration: stats.averageDuration,
  successRate: stats.successRate,
  topSlowSchemas: stats.slowestSchemas
});
```

## 🔧 **高级验证技巧**

### **条件验证**
```json
{
  "if": {
    "properties": {
      "status": {"const": "active"}
    }
  },
  "then": {
    "required": ["activation_date"],
    "properties": {
      "activation_date": {
        "type": "string",
        "format": "date-time"
      }
    }
  },
  "else": {
    "not": {
      "required": ["activation_date"]
    }
  }
}
```

### **跨字段验证**
```typescript
// 自定义跨字段验证器
addCustomValidator('validateDateRange', (data: unknown): boolean => {
  if (typeof data !== 'object' || !data) return false;
  
  const obj = data as any;
  if (!obj.start_date || !obj.end_date) return true; // 如果字段不存在，跳过验证
  
  const startDate = new Date(obj.start_date);
  const endDate = new Date(obj.end_date);
  
  return startDate <= endDate;
});
```

### **动态Schema验证**
```typescript
import { createDynamicValidator } from '@mplp/schema-validator';

// 根据数据动态选择Schema
const dynamicValidator = createDynamicValidator({
  schemaSelector: (data: unknown) => {
    const obj = data as any;
    if (obj.type === 'user_context') return 'mplp-context-user';
    if (obj.type === 'system_context') return 'mplp-context-system';
    return 'mplp-context';
  }
});

const result = await dynamicValidator.validate(contextData);
```

## 📋 **验证最佳实践**

### **开发阶段**
- 在开发过程中持续验证Schema文件
- 使用严格模式捕获潜在问题
- 为复杂字段添加示例和描述

### **测试阶段**
- 创建全面的测试数据集
- 测试边界条件和异常情况
- 验证性能基准

### **生产部署**
- 预编译所有Schema以提高性能
- 配置适当的验证超时时间
- 监控验证性能和错误率

### **维护阶段**
- 定期检查Schema兼容性
- 更新验证规则以适应业务变化
- 清理过时的自定义验证器

## ✅ **验证检查清单**

### **Schema质量检查**
- [ ] 所有必需字段已定义
- [ ] 字段类型正确且一致
- [ ] 正则表达式语法正确
- [ ] 枚举值完整且有意义
- [ ] 添加了适当的描述和示例

### **数据验证检查**
- [ ] 验证通过率达到预期
- [ ] 错误信息清晰易懂
- [ ] 性能满足要求
- [ ] 异常情况处理正确

### **兼容性检查**
- [ ] 新版本向后兼容
- [ ] 破坏性变更已记录
- [ ] 迁移方案已准备
- [ ] 回滚计划已制定

---

**维护团队**: MPLP验证团队  
**最后更新**: 2025-08-13  
**文档状态**: ✅ 完成
