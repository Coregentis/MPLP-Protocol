# Schema驱动测试指南

## 🚀 测试工作最高原则

**测试的根本目的是发现并修复源代码问题，确保项目在生产环境中稳定运行**

### 核心理念
- 测试是为了发现源代码中的功能实现或逻辑设计缺陷
- 发现问题后应该修复源代码，而不是绕过问题
- 测试应该模拟真实生产环境的各种情况
- 最终目标是确保项目能够顺利上线并稳定运行
- **切勿为了测试而测试！**

## 🎯 Schema驱动原则

**所有测试必须基于项目实际实现编写，避免假设性测试**

## 📋 测试编写标准流程

### 第一步：深入了解实际实现
```typescript
// ❌ 错误方式：假设接口存在
// expect(someModule.nonExistentMethod()).toBe(true);

// ✅ 正确方式：先查看实际实现
import { WorkflowManager } from '../src/core/workflow/workflow-manager';
// 查看实际的类定义、方法签名、返回类型
```

### 第二步：确认技术栈版本
- 确认TypeScript版本和配置
- 确认Jest版本和配置  
- 确认Schema验证器版本
- 确认项目依赖版本

### 第三步：基于实际实现编写测试
```typescript
// ✅ 使用实际的接口和类型
import { IWorkflowContext, WorkflowStatus } from '../src/types';
import { WorkflowManager } from '../src/core/workflow/workflow-manager';

describe('WorkflowManager', () => {
  it('应该基于实际接口创建工作流', async () => {
    const manager = new WorkflowManager(/* 实际依赖 */);
    
    // 使用实际的接口定义
    const context: IWorkflowContext = {
      // 符合实际Schema的数据
    };
    
    // 调用实际存在的方法
    const result = await manager.initializeWorkflow(context);
    
    // 验证实际的返回类型和格式
    expect(result.workflow_id).toMatch(/^workflow_\d+_[a-z0-9]+$/);
  });
});
```

## 🔍 四大驱动原则

### 1. Schema定义驱动

#### ✅ 正确做法
```typescript
// 使用实际的Schema定义
import { contextSchema } from '../src/schemas/context.schema';
import { SchemaValidator } from '../src/core/schema/schema-validator';

const validator = new SchemaValidator();
const testData = {
  // 符合实际Schema的数据结构
  user_id: 'test-user',
  session_id: 'test-session',
  // ...
};

const result = validator.validate('context', testData);
expect(result.valid).toBe(true);
```

#### ❌ 错误做法
```typescript
// 假设Schema结构
const fakeData = {
  // 不存在的字段
  nonExistentField: 'value'
};
```

### 2. TypeScript类型驱动

#### ✅ 正确做法
```typescript
// 使用实际的TypeScript接口
import { IEventBus, EventSubscriptionOptions } from '../src/core/event-bus';

const eventBus: IEventBus = new EventBus();
const options: EventSubscriptionOptions = {
  once: true,
  priority: 1
};

// TypeScript编译器会确保类型安全
const subscriptionId = eventBus.subscribe('test-event', handler, options);
```

#### ❌ 错误做法
```typescript
// 使用any类型或假设的接口
const eventBus: any = new EventBus();
const fakeOptions = { nonExistentOption: true };
```

### 3. 实际接口驱动

#### ✅ 正确做法
```typescript
// 调用实际存在的方法
import { AdapterRegistry } from '../src/core/adapter-registry';

const registry = new AdapterRegistry();

// 使用实际的方法签名
registry.register('test-adapter', mockAdapter);
const adapter = registry.get('test-adapter');
expect(adapter).toBeDefined();
```

#### ❌ 错误做法
```typescript
// 调用不存在的方法
// registry.nonExistentMethod();
```

### 4. 功能实现驱动

#### ✅ 正确做法
```typescript
// 测试实际的业务逻辑
it('应该正确处理一次性订阅', () => {
  const handler = jest.fn();
  
  // 基于实际实现的测试逻辑
  eventBus.subscribe('once-event', handler, { once: true });
  
  // 第一次发布
  const count1 = eventBus.publish('once-event', { data: 'first' });
  expect(count1).toBe(1); // 基于实际实现的期望值
  
  // 第二次发布，一次性订阅应该被移除
  const count2 = eventBus.publish('once-event', { data: 'second' });
  expect(count2).toBe(0); // 基于实际实现的期望值
});
```

## 🚫 常见反模式

### 1. 假设接口存在
```typescript
// ❌ 错误：假设方法存在
expect(module.assumedMethod()).toBe(true);

// ✅ 正确：先确认方法存在
import { module } from '../src/module';
expect(typeof module.actualMethod).toBe('function');
```

### 2. 脱离Schema定义
```typescript
// ❌ 错误：使用不符合Schema的数据
const invalidData = { invalidField: 'value' };

// ✅ 正确：使用符合Schema的数据
const validData = { user_id: 'test', session_id: 'test' };
```

### 3. 忽略类型定义
```typescript
// ❌ 错误：忽略TypeScript类型
const result: any = someFunction();

// ✅ 正确：使用实际类型
const result: ActualReturnType = someFunction();
```

### 4. Mock不存在的依赖
```typescript
// ❌ 错误：Mock假设的依赖
jest.mock('../src/nonExistentModule');

// ✅ 正确：Mock实际存在的依赖
jest.mock('../src/core/actual-module');
```

## 📝 测试编写检查清单

### 编写前检查
- [ ] 查看目标功能的实际实现
- [ ] 确认所有依赖的接口和类型
- [ ] 检查Schema定义和验证规则
- [ ] 确认技术栈版本兼容性

### 编写中检查
- [ ] 使用实际的TypeScript接口
- [ ] 调用真实存在的方法
- [ ] 测试数据符合Schema定义
- [ ] 期望值基于实际实现

### 编写后检查
- [ ] TypeScript编译无错误
- [ ] 测试能够正常运行
- [ ] 测试覆盖实际代码路径
- [ ] 测试结果符合实际行为

## 🎯 最佳实践

### 1. 实现优先
- 先理解实现，再编写测试
- 测试应该验证实际行为
- 避免测试驱动假设

### 2. 类型安全
- 充分利用TypeScript类型系统
- 让编译器帮助发现问题
- 避免使用any类型

### 3. Schema一致性
- 测试数据必须符合Schema
- 使用实际的验证器
- 保持数据格式一致

### 4. 持续验证
- 定期检查测试与实现的一致性
- 实现变更时同步更新测试
- 保持测试的时效性

---

**指南版本**: v1.0  
**最后更新**: 2025-07-28  
**适用范围**: 所有MPLP测试编写
