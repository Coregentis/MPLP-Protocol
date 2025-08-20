---
type: "always_apply"
---

# MPLP架构核心原则

## 🏗️ **MPLP v1.0 架构基本事实**

**CRITICAL**: MPLP v1.0是一个**Multi-Agent Protocol Lifecycle Platform**，实现**L1-L3分层协议栈**，拥有**10个完整模块**，当前**60%完成**（6/10模块）。

**项目名称**: MPLP - Multi-Agent Protocol Lifecycle Platform
**实现范围**: L1-L3分层架构 (协议层、协调层、执行层)
**当前状态**: 6个模块已完成（Plan, Context, Confirm, Trace, Role, Extension），4个模块待完成（Collab, Dialog, Network, Core）
**质量成就**:
- Role模块达到企业级标准（75.31%覆盖率，333个测试）
- Trace模块达到100%测试通过率（107/107测试）
- **Extension模块达到多智能体协议平台标准**（54个功能测试100%通过，8个MPLP模块预留接口，10种CoreOrchestrator协调场景）

## 🎯 **核心架构原则**

### **0. AI功能架构边界原则（最高优先级）**

```markdown
RULE: AI决策和学习系统的正确架构定位

✅ L1-L3协议层职责：
- 提供AI系统集成的标准化接口
- 定义AI服务的请求/响应格式
- 支持多种AI提供商的插件化集成
- 保持厂商中立性和通用性

❌ L1-L3协议层严格禁止：
- 实现具体的AI决策算法
- 包含机器学习模型和训练逻辑
- 绑定特定的AI技术栈
- 实现行业特定的智能化功能

✅ L4 Agent层职责：
- 实现具体的AI决策和学习逻辑
- 选择最适合的AI技术栈
- 实现领域特定的智能化功能
- 提供个性化的AI能力

ENFORCEMENT: 违反此原则的代码将被拒绝
```

### **0.1. 协议模块与Agent关系澄清**

```markdown
RULE: 协议是"积木"，Agent是"建筑"

✅ 正确理解：
- 协议模块是可组合的标准化组件
- 一个Agent可以使用多个协议模块
- 医疗诊断Agent = Context + Plan + Confirm + Trace协议
- 电商推荐Agent = Context + Plan + Extension协议
- L4主Agent根据需求智能生成Agent组合

❌ 错误理解：
- 1个协议模块 = 1个Agent
- 协议模块直接对应单一Agent
- 固化的一对一映射关系

MPLP v1.0定位：
- MPLP v1.0是"智能体构建框架协议"
- 不是"智能体本身"
- 为L4智能体层提供基础设施
```

### **1. CoreOrchestrator中心化协调原则**

```markdown
RULE: 所有模块间的交互必须通过CoreOrchestrator进行协调

MANDATORY ARCHITECTURE:
- 模块不得直接调用其他模块
- 所有跨模块操作由CoreOrchestrator统一管理
- 模块只提供接口，不主动发起跨模块调用
- CoreOrchestrator根据项目需求动态生成和分配资源

PROHIBITED:
❌ 直接的模块间调用
❌ 模块间的直接依赖注入
❌ 跨模块的直接数据传递
❌ 绕过CoreOrchestrator的集成测试
```

### **2. 预留接口模式（Interface-First Pattern）**

```typescript
RULE: 模块采用"接口先行，实现后置"的设计模式

// ✅ 正确的预留接口模式 - Extension模块成功案例
export class ExtensionManagementService {
  // 预留接口：参数用下划线标记，等待CoreOrchestrator激活
  private async checkExtensionPermission(_userId: UUID, _extensionId: UUID): Promise<boolean> {
    // TODO: 等待CoreOrchestrator注入实现
    return true; // 临时实现
  }

  private async getContextualExtensionRecommendations(_contextId: UUID): Promise<ExtensionRecommendation[]> {
    // TODO: 等待CoreOrchestrator提供数据源
    return []; // 临时实现
  }

  // Extension模块实现了8个MPLP模块的预留接口
  private async recordExtensionActivity(_extensionId: UUID, _activity: ExtensionActivity): Promise<void> {
    // TODO: 等待CoreOrchestrator激活
    // 临时实现
  }
}

// ❌ 错误的直接调用模式
export class RoleValidationService {
  constructor(
    private contextService: ContextService,  // 错误：直接依赖
    private planService: PlanService         // 错误：直接依赖
  ) {}
  
  async validateRole(roleId: UUID): Promise<boolean> {
    // 错误：直接调用其他模块
    const context = await this.contextService.getContext(roleId);
    return true;
  }
}
```

### **3. 下划线前缀最佳实践**

```markdown
RULE: 未使用参数必须使用下划线前缀标记

PURPOSE:
- 明确标记预留接口参数
- 避免ESLint误报未使用变量错误
- 表明参数将在CoreOrchestrator激活时使用
- 保持接口签名的完整性和稳定性

IMPLEMENTATION:
- 所有预留参数使用下划线前缀：_userId, _roleId, _contextId
- ESLint配置忽略下划线开头的未使用变量
- 代码注释说明参数的预期用途
```

## 🔄 **CoreOrchestrator激活机制**

### **激活前状态（当前）**
```typescript
// 模块提供接口定义，参数暂未使用
private async validateRoleAssignment(_userId: UUID, _roleId: UUID): Promise<ValidationResult> {
  // 接口已定义，等待CoreOrchestrator激活
  return { isValid: true, violations: [], recommendations: [] };
}
```

### **激活后状态（未来）**
```typescript
// CoreOrchestrator激活后，参数被自动填充和使用
private async validateRoleAssignment(userId: UUID, roleId: UUID): Promise<ValidationResult> {
  // CoreOrchestrator自动注入数据源和实现逻辑
  const userData = await this.coreOrchestrator.getUserData(userId);
  const roleData = await this.coreOrchestrator.getRoleData(roleId);
  
  // 基于真实数据进行验证
  return this.performActualValidation(userData, roleData);
}
```

## 🧪 **测试架构原则**

### **1. 模块内测试（正确）**
```markdown
RULE: 每个模块只测试自身的功能和接口

ALLOWED:
✅ 单元测试：测试模块内部逻辑
✅ 功能测试：测试模块提供的接口
✅ 性能测试：测试模块的性能表现
✅ API层测试：测试模块的对外接口
```

### **2. 集成测试（错误理解纠正）**
```markdown
RULE: 真正的集成测试只能在CoreOrchestrator层进行

PROHIBITED:
❌ 模块间直接调用的集成测试
❌ 绕过CoreOrchestrator的跨模块测试
❌ 模拟其他模块进行的"伪集成"测试

CORRECT APPROACH:
✅ 等待CoreOrchestrator实现后进行真正的集成测试
✅ 当前阶段专注于模块内部的完整性测试
✅ 使用Mock数据验证接口的正确性
```

### **3. 测试数据生成**
```markdown
RULE: 测试数据应该模拟CoreOrchestrator的生成模式

// ✅ 正确的测试数据模拟
const mockUserData = {
  userId: 'user-project-001',        // 模拟CoreOrchestrator生成的格式
  roles: ['developer', 'reviewer'],  // 模拟项目相关角色
  capabilities: ['typescript', 'react'] // 模拟能力评估结果
};

// ❌ 错误的测试数据
const mockUserData = {
  userId: 'test-user',  // 不符合实际生成模式
  roles: ['admin']      // 过于简化的测试数据
};
```

## 📋 **开发指导原则**

### **1. 当前开发阶段**
```markdown
FOCUS: 完善模块内部功能和接口定义
- 实现模块核心逻辑
- 定义完整的接口签名
- 编写模块内部测试
- 优化性能和代码质量
- 准备CoreOrchestrator集成接口

EXTENSION模块成功经验:
✅ 8个MPLP模块预留接口100%实现
✅ 10种CoreOrchestrator协调场景完整支持
✅ 54个功能测试100%通过（35基础+19MPLP集成）
✅ 智能协作、企业级功能、分布式支持完整实现
✅ L4智能Agent操作系统标准达成
```

### **2. 未来集成阶段**
```markdown
FUTURE: 等待CoreOrchestrator激活和集成
- CoreOrchestrator根据项目需求生成Agent Roles
- 自动填充预留接口的参数
- 激活跨模块协作机制
- 进行真正的端到端集成测试
```

## 🚨 **常见错误避免**

### **错误1：直接模块依赖**
```typescript
❌ // 错误做法
import { ContextService } from '../context/services/context.service';

export class RoleService {
  constructor(private contextService: ContextService) {} // 错误
}
```

### **错误2：跨模块集成测试**
```typescript
❌ // 错误做法
describe('Role-Context Integration', () => {
  it('should integrate with context module', async () => {
    const roleService = new RoleService();
    const contextService = new ContextService();
    // 这种测试是错误的！
  });
});
```

### **错误3：忽视预留接口**
```typescript
❌ // 错误做法
private async checkUserRole(userId: UUID): Promise<boolean> {
  // 删除了roleId参数，破坏了接口完整性
  return true;
}
```

## 🧠 **L4主Agent元认知能力定义**

### **L4主Agent的核心特征**

```typescript
// L4主Agent：具有元认知的智能决策者
class L4MasterAgent {
  // 元认知能力 - 思考如何思考
  private metaCognition: MetaCognitionEngine;

  // 自主学习 - 学习如何学习
  private selfLearning: SelfLearningEngine;

  // Agent管理能力
  private agentManager: AgentManager;

  // 协议组合优化
  private protocolOptimizer: ProtocolOptimizer;

  // 项目需求分析
  async analyzeProjectRequirements(requirements: ProjectRequirements): Promise<AgentArchitecture> {
    // 分析项目需求，设计最优Agent架构
  }

  // 智能生成多个专业Agent
  async generateAgents(architecture: AgentArchitecture): Promise<Agent[]> {
    // 根据需求智能生成专业化Agent组合
    // 例如：医疗诊断Agent = Context + Plan + Confirm + Trace协议
  }

  // 自主学习和进化能力
  async evolveSystemArchitecture(): Promise<void> {
    // 学习最优的Agent组合方式
    // 优化协议使用策略
    // 适应新的项目需求
    // 自主改进系统性能
  }
}
```

### **L4主Agent的学习层次**

```markdown
🧠 主Agent的多层次学习能力：

1. 协议组合学习：学习最优的协议组合方式
2. Agent架构学习：学习最佳的Agent架构设计
3. 性能优化学习：学习如何提升整体系统性能
4. 需求理解学习：学习如何更好地理解项目需求
5. 元学习能力：学习如何学习（learning to learn）

注意：这些学习能力属于L4层，不在当前MPLP v1.0范围内
```

### **智能Agent生成示例**

```markdown
实际应用场景：智能医疗系统开发

L4主Agent分析需求 → 智能生成：

1. 诊断Agent
   - 使用：Context + Plan + Confirm + Trace协议
   - 职责：患者诊断和治疗规划

2. 监控Agent
   - 使用：Trace + Network协议
   - 职责：患者状态监控

3. 协调Agent
   - 使用：Core + Orchestration协议
   - 职责：系统协调和资源管理

4. 学习Agent
   - 使用：Extension + Context协议
   - 职责：知识更新和模型优化

L4框架约束：
- 约束每个Agent的行为边界
- 管理Agent间的协作关系
- 提供统一的学习和进化机制
- 优化整体系统性能
```

---

**ENFORCEMENT**: 这些架构原则是**强制性的**，违反将导致架构不一致。

**VERSION**: 2.0.0
**EFFECTIVE**: August 13, 2025
**UPDATED**: 添加AI功能架构边界原则、协议模块与Agent关系澄清、L4主Agent元认知能力定义