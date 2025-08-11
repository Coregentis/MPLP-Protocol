# MPLP协议模块标准化规范

## 🎯 **核心原则**

**MPLP作为协议簇，所有模块必须遵循统一的结构和实现标准，确保用户体验一致性。**

## 📁 **1. 统一目录结构标准**

### **强制目录结构**
```bash
src/modules/{module}/
├── api/                           # API层
│   ├── controllers/
│   │   └── {module}.controller.ts # 控制器
│   ├── dto/
│   │   └── {module}.dto.ts       # 数据传输对象
│   ├── mappers/
│   │   └── {module}.mapper.ts    # Schema-TypeScript映射器 (必须)
│   └── websocket/                # WebSocket支持 (可选)
├── application/                   # 应用层
│   ├── services/
│   │   └── {module}-management.service.ts
│   ├── commands/                  # CQRS命令
│   └── queries/                   # CQRS查询
├── domain/                        # 领域层
│   ├── entities/
│   │   └── {module}.entity.ts
│   ├── repositories/
│   │   └── {module}-repository.interface.ts
│   ├── services/
│   └── factories/
├── infrastructure/                # 基础设施层
│   ├── repositories/
│   │   └── {module}.repository.ts
│   └── adapters/
│       └── {module}-module.adapter.ts
├── types.ts                      # 模块类型定义 (必须)
├── index.ts                      # 统一导出入口 (必须)
└── module.ts                     # 模块初始化 (必须)
```

## 🔄 **2. 统一Mapper标准**

### **强制Mapper接口**
```typescript
// src/modules/{module}/api/mappers/{module}.mapper.ts
export interface {Module}Schema {
  {module}_id: string;
  // 所有字段使用snake_case
}

export interface {Module}EntityData {
  {module}Id: string;
  // 所有字段使用camelCase
}

export class {Module}Mapper {
  // TypeScript实体 → Schema格式 (camelCase → snake_case)
  static toSchema(entity: {Module}): {Module}Schema;
  
  // Schema格式 → TypeScript数据 (snake_case → camelCase)
  static fromSchema(schema: {Module}Schema): {Module}EntityData;
  
  // 验证Schema格式数据
  static validateSchema(data: unknown): data is {Module}Schema;
  
  // 批量转换方法
  static toSchemaArray(entities: {Module}[]): {Module}Schema[];
  static fromSchemaArray(schemas: {Module}Schema[]): {Module}EntityData[];
}
```

## 📤 **3. 统一导出标准**

### **强制导出格式**
```typescript
// src/modules/{module}/index.ts
/**
 * {Module}模块主入口
 * 
 * @version 1.0.0
 * @created 2025-08-09
 */

// ===== DDD架构层导出 =====

// API层
export * from './api/controllers/{module}.controller';
export * from './api/dto/{module}.dto';
export * from './api/mappers/{module}.mapper';

// 应用层
export * from './application/services/{module}-management.service';

// 领域层
export * from './domain/entities/{module}.entity';
export * from './domain/repositories/{module}-repository.interface';

// 基础设施层
export * from './infrastructure/repositories/{module}.repository';

// ===== 适配器导出 =====
export { {Module}ModuleAdapter } from './infrastructure/adapters/{module}-module.adapter';

// ===== 模块集成 =====
export * from './module';

// ===== 类型定义导出 =====
export * from './types';
```

## 🏗️ **4. 统一模块初始化标准**

### **强制初始化接口**
```typescript
// src/modules/{module}/module.ts
export interface {Module}ModuleOptions {
  enableLogging?: boolean;
  dataSource?: unknown;
  // 模块特定配置
}

export interface {Module}ModuleResult {
  {module}Controller: {Module}Controller;
  {module}ManagementService: {Module}ManagementService;
}

export async function initialize{Module}Module(
  options: {Module}ModuleOptions = {}
): Promise<{Module}ModuleResult> {
  // 标准初始化逻辑
}
```

## 🎯 **5. 统一API接口标准**

### **强制控制器接口**
```typescript
// 每个模块控制器必须实现的基础方法
export class {Module}Controller {
  async create{Module}(req: HttpRequest): Promise<HttpResponse>;
  async get{Module}ById(req: HttpRequest): Promise<HttpResponse>;
  async update{Module}(req: HttpRequest): Promise<HttpResponse>;
  async delete{Module}(req: HttpRequest): Promise<HttpResponse>;
  async query{Module}s(req: HttpRequest): Promise<HttpResponse>;
}
```

## ✅ **6. 质量检查标准**

### **强制质量门禁**
```bash
# 每个模块必须通过的检查
npm run typecheck:{module}     # TypeScript编译检查
npm run lint:{module}          # ESLint代码质量检查
npm run test:{module}          # 单元测试
npm run validate:mapping:{module}  # Schema映射一致性检查
npm run check:naming:{module}  # 双重命名约定检查
```

## 🚨 **7. 强制合规要求**

### **零容忍标准**
- ❌ **禁止使用any类型** (ZERO TOLERANCE)
- ❌ **禁止跳过Mapper实现** (ZERO TOLERANCE)
- ❌ **禁止不一致的目录结构** (ZERO TOLERANCE)
- ❌ **禁止不一致的导出格式** (ZERO TOLERANCE)
- ❌ **禁止不一致的命名约定** (ZERO TOLERANCE)

### **强制要求**
- ✅ **必须实现完整的Mapper类** (MANDATORY)
- ✅ **必须遵循统一目录结构** (MANDATORY)
- ✅ **必须使用统一导出格式** (MANDATORY)
- ✅ **必须通过所有质量检查** (MANDATORY)
- ✅ **必须遵循双重命名约定** (MANDATORY)

## 🔧 **8. 自动化检查机制**

### **强制检查脚本**
```bash
# 模块标准化检查脚本
npm run check:module-standards {module}

# 检查项目：
# 1. 目录结构合规性
# 2. Mapper实现完整性
# 3. 导出格式一致性
# 4. 命名约定合规性
# 5. TypeScript编译通过
# 6. Schema映射一致性
```

### **CI/CD集成**
```yaml
# .github/workflows/module-standards.yml
name: Module Standards Check
on: [push, pull_request]
jobs:
  check-standards:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Check Module Standards
        run: |
          npm run check:module-standards context
          npm run check:module-standards plan
          npm run check:module-standards confirm
          npm run check:module-standards trace
```

## 🚨 **9. 违规处理机制**

### **违规等级**
- **Level 1 - 警告：** 非关键不一致（文档格式等）
- **Level 2 - 错误：** 关键不一致（目录结构、Mapper缺失）
- **Level 3 - 阻断：** 严重违规（any类型、编译错误）

### **处理流程**
1. **自动检测：** CI/CD自动检查
2. **即时反馈：** 开发者立即收到违规报告
3. **强制修复：** Level 2/3违规阻止合并
4. **持续监控：** 定期全量检查

---

**ENFORCEMENT**: 此规范是**强制性的**，所有MPLP协议模块必须严格遵循。

**VERSION**: 1.0.0
**EFFECTIVE**: 2025-08-09
**COMPLIANCE**: 100%合规要求，零容忍违规

**REVIEW CYCLE**: 每季度评审和更新标准
