# MPLP Schema 集成指南

## 📋 **概述**

本指南提供MPLP Schema在实际项目中的集成方法，包括TypeScript集成、数据验证、错误处理和最佳实践。

**版本**: v1.0.0  
**适用范围**: 所有使用MPLP Schema的项目  
**技术栈**: TypeScript, Node.js, JSON Schema

## 🚀 **快速集成**

### **1. 安装依赖**

```bash
# 安装MPLP Schema包
npm install @mplp/schemas @mplp/schema-validator

# 安装类型定义
npm install --save-dev @types/json-schema
```

### **2. 基础配置**

```typescript
// schema-config.ts
import { SchemaValidatorConfig } from '@mplp/schema-validator';

export const schemaConfig: SchemaValidatorConfig = {
  schemaPath: './src/schemas',
  strictMode: true,
  enableWarnings: true,
  outputFormat: 'json',
  customRules: [],
  ignoredSchemas: []
};
```

### **3. 初始化验证器**

```typescript
// validator-setup.ts
import { createSchemaValidator } from '@mplp/schema-validator';
import { schemaConfig } from './schema-config';

export const validator = createSchemaValidator(schemaConfig);

// 预加载所有Schema
await validator.loadAllSchemas();
```

## 🔧 **TypeScript集成**

### **1. 类型定义导入**

```typescript
// types/mplp.ts
import {
  ContextSchema,
  ContextData,
  PlanSchema,
  PlanData,
  ConfirmSchema,
  ConfirmData,
  TraceSchema,
  TraceData,
  RoleSchema,
  RoleData
} from '@mplp/schemas';

// 导出统一类型
export type {
  ContextSchema,
  ContextData,
  PlanSchema,
  PlanData,
  ConfirmSchema,
  ConfirmData,
  TraceSchema,
  TraceData,
  RoleSchema,
  RoleData
};
```

### **2. Mapper类使用**

```typescript
// services/context-service.ts
import { ContextMapper, ContextData, ContextSchema } from '@mplp/schemas';

export class ContextService {
  async createContext(data: Partial<ContextData>): Promise<ContextData> {
    // 转换为Schema格式进行验证
    const schemaData: ContextSchema = ContextMapper.toSchema({
      contextId: data.contextId || generateUUID(),
      name: data.name || '',
      description: data.description || '',
      protocolVersion: '1.0.0',
      timestamp: new Date().toISOString(),
      ...data
    } as ContextData);

    // 验证Schema数据
    const validationResult = await validator.validateData('mplp-context', schemaData);
    if (!validationResult.isValid) {
      throw new ValidationError('Context data validation failed', validationResult.errors);
    }

    // 转换回TypeScript格式
    return ContextMapper.fromSchema(schemaData);
  }

  async getContext(contextId: string): Promise<ContextData | null> {
    // 从数据库获取Schema格式数据
    const schemaData = await this.repository.findById(contextId);
    if (!schemaData) return null;

    // 转换为TypeScript格式
    return ContextMapper.fromSchema(schemaData);
  }
}
```

### **3. 批量数据处理**

```typescript
// services/batch-processor.ts
import { ContextMapper, ContextSchema, ContextData } from '@mplp/schemas';

export class BatchProcessor {
  async processContextBatch(contexts: ContextSchema[]): Promise<ContextData[]> {
    // 批量验证
    const validationResults = await Promise.all(
      contexts.map(context => validator.validateData('mplp-context', context))
    );

    // 检查验证结果
    const errors = validationResults
      .filter(result => !result.isValid)
      .map(result => result.errors)
      .flat();

    if (errors.length > 0) {
      throw new BatchValidationError('Batch validation failed', errors);
    }

    // 批量转换
    return ContextMapper.fromSchemaArray(contexts);
  }
}
```

## 🔍 **数据验证**

### **1. 实时验证**

```typescript
// middleware/validation-middleware.ts
import { Request, Response, NextFunction } from 'express';
import { validator } from '../validator-setup';

export function validateSchema(schemaName: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validationResult = await validator.validateData(schemaName, req.body);
      
      if (!validationResult.isValid) {
        return res.status(400).json({
          error: 'Validation failed',
          details: validationResult.errors,
          warnings: validationResult.warnings
        });
      }

      // 将验证后的数据附加到请求对象
      req.validatedData = validationResult.validatedData;
      next();
    } catch (error) {
      next(error);
    }
  };
}

// 使用示例
app.post('/api/context', 
  validateSchema('mplp-context'),
  contextController.createContext
);
```

### **2. 批量验证**

```typescript
// services/validation-service.ts
export class ValidationService {
  async validateBatch<T>(
    schemaName: string, 
    data: T[]
  ): Promise<BatchValidationResult<T>> {
    const results = await Promise.allSettled(
      data.map(item => validator.validateData(schemaName, item))
    );

    const successful: T[] = [];
    const failed: ValidationError[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.isValid) {
        successful.push(data[index]);
      } else {
        failed.push({
          index,
          data: data[index],
          errors: result.status === 'fulfilled' 
            ? result.value.errors 
            : [{ message: result.reason.message }]
        });
      }
    });

    return {
      successful,
      failed,
      totalCount: data.length,
      successCount: successful.length,
      failureCount: failed.length
    };
  }
}
```

### **3. 自定义验证规则**

```typescript
// validators/custom-validators.ts
import { CustomValidator } from '@mplp/schema-validator';

export const customValidators: Record<string, CustomValidator> = {
  // 验证用户ID格式
  validateUserId: (value: unknown): boolean => {
    if (typeof value !== 'string') return false;
    return /^user-[a-zA-Z0-9]{8,}$/.test(value);
  },

  // 验证时间范围
  validateTimeRange: (value: unknown): boolean => {
    if (typeof value !== 'object' || !value) return false;
    const range = value as { start: string; end: string };
    const start = new Date(range.start);
    const end = new Date(range.end);
    return start < end && start > new Date('2020-01-01');
  },

  // 验证权限级别
  validatePermissionLevel: (value: unknown): boolean => {
    if (typeof value !== 'number') return false;
    return value >= 0 && value <= 10 && Number.isInteger(value);
  }
};

// 注册自定义验证器
validator.registerCustomValidators(customValidators);
```

## 🔄 **错误处理**

### **1. 错误类型定义**

```typescript
// errors/validation-errors.ts
export class ValidationError extends Error {
  constructor(
    message: string,
    public errors: ValidationErrorDetail[],
    public warnings: ValidationWarning[] = []
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class BatchValidationError extends Error {
  constructor(
    message: string,
    public errors: ValidationErrorDetail[]
  ) {
    super(message);
    this.name = 'BatchValidationError';
  }
}

export class SchemaNotFoundError extends Error {
  constructor(schemaName: string) {
    super(`Schema not found: ${schemaName}`);
    this.name = 'SchemaNotFoundError';
  }
}
```

### **2. 错误处理中间件**

```typescript
// middleware/error-handler.ts
import { Request, Response, NextFunction } from 'express';
import { ValidationError, BatchValidationError, SchemaNotFoundError } from '../errors';

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (error instanceof ValidationError) {
    return res.status(400).json({
      type: 'validation_error',
      message: error.message,
      errors: error.errors,
      warnings: error.warnings
    });
  }

  if (error instanceof BatchValidationError) {
    return res.status(400).json({
      type: 'batch_validation_error',
      message: error.message,
      errors: error.errors
    });
  }

  if (error instanceof SchemaNotFoundError) {
    return res.status(404).json({
      type: 'schema_not_found',
      message: error.message
    });
  }

  // 默认错误处理
  res.status(500).json({
    type: 'internal_error',
    message: 'Internal server error'
  });
}
```

## 🔧 **高级集成模式**

### **1. 事件驱动集成**

```typescript
// services/event-driven-service.ts
import { EventEmitter } from 'events';
import { validator } from '../validator-setup';

export class EventDrivenService extends EventEmitter {
  async processEvent(eventType: string, eventData: unknown) {
    // 根据事件类型选择Schema
    const schemaName = this.getSchemaForEvent(eventType);
    
    // 验证事件数据
    const validationResult = await validator.validateData(schemaName, eventData);
    
    if (!validationResult.isValid) {
      this.emit('validation_failed', {
        eventType,
        errors: validationResult.errors
      });
      return;
    }

    // 发出验证成功事件
    this.emit('validation_success', {
      eventType,
      validatedData: validationResult.validatedData
    });

    // 处理业务逻辑
    await this.handleValidatedEvent(eventType, validationResult.validatedData);
  }

  private getSchemaForEvent(eventType: string): string {
    const eventSchemaMap: Record<string, string> = {
      'context.created': 'mplp-context',
      'plan.updated': 'mplp-plan',
      'role.assigned': 'mplp-role',
      'trace.started': 'mplp-trace'
    };

    return eventSchemaMap[eventType] || 'mplp-core';
  }
}
```

### **2. 缓存集成**

```typescript
// services/cached-validation-service.ts
import { LRUCache } from 'lru-cache';
import { validator } from '../validator-setup';

export class CachedValidationService {
  private validationCache = new LRUCache<string, ValidationResult>({
    max: 1000,
    ttl: 1000 * 60 * 5 // 5分钟缓存
  });

  async validateWithCache(
    schemaName: string, 
    data: unknown
  ): Promise<ValidationResult> {
    // 生成缓存键
    const cacheKey = this.generateCacheKey(schemaName, data);
    
    // 检查缓存
    const cached = this.validationCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // 执行验证
    const result = await validator.validateData(schemaName, data);
    
    // 缓存结果（仅缓存成功的验证）
    if (result.isValid) {
      this.validationCache.set(cacheKey, result);
    }

    return result;
  }

  private generateCacheKey(schemaName: string, data: unknown): string {
    return `${schemaName}:${JSON.stringify(data)}`;
  }
}
```

## 📊 **性能优化**

### **1. 预编译Schema**

```typescript
// utils/schema-precompiler.ts
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

export class SchemaPrecompiler {
  private ajv: Ajv;
  private compiledSchemas = new Map<string, ValidateFunction>();

  constructor() {
    this.ajv = new Ajv({
      allErrors: true,
      verbose: true,
      strict: false
    });
    addFormats(this.ajv);
  }

  async precompileAllSchemas(): Promise<void> {
    const schemaFiles = await this.loadSchemaFiles();
    
    for (const [name, schema] of schemaFiles) {
      try {
        const validate = this.ajv.compile(schema);
        this.compiledSchemas.set(name, validate);
        console.log(`✅ Precompiled schema: ${name}`);
      } catch (error) {
        console.error(`❌ Failed to precompile schema ${name}:`, error);
      }
    }
  }

  getCompiledSchema(schemaName: string): ValidateFunction | undefined {
    return this.compiledSchemas.get(schemaName);
  }
}
```

### **2. 并行验证**

```typescript
// services/parallel-validation-service.ts
export class ParallelValidationService {
  async validateParallel<T>(
    items: Array<{ schemaName: string; data: T }>
  ): Promise<ValidationResult[]> {
    const validationPromises = items.map(async ({ schemaName, data }) => {
      try {
        return await validator.validateData(schemaName, data);
      } catch (error) {
        return {
          isValid: false,
          errors: [{ message: error.message }],
          warnings: [],
          metadata: { schemaName, error: true }
        };
      }
    });

    return Promise.all(validationPromises);
  }
}
```

## ✅ **集成检查清单**

### **开发阶段**
- [ ] 安装必要的依赖包
- [ ] 配置Schema验证器
- [ ] 实现Mapper类集成
- [ ] 添加验证中间件
- [ ] 实现错误处理
- [ ] 编写单元测试

### **测试阶段**
- [ ] 验证所有Schema文件
- [ ] 测试数据转换功能
- [ ] 测试错误处理逻辑
- [ ] 性能基准测试
- [ ] 集成测试

### **生产部署**
- [ ] 预编译所有Schema
- [ ] 配置监控和日志
- [ ] 设置缓存策略
- [ ] 准备回滚方案

---

**维护团队**: MPLP集成团队  
**最后更新**: 2025-08-13  
**文档状态**: ✅ 完成
