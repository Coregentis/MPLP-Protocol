# Plan API 参考

> **🌐 语言导航**: [English](../../en/api-reference/plan-api.md) | [中文](plan-api.md)



**协作规划和目标分解 - MPLP v1.0 Alpha**

[![API](https://img.shields.io/badge/api-Plan%20模块-blue.svg)](../modules/plan/README.md)
[![Schema](https://img.shields.io/badge/schema-mplp--plan.json-green.svg)](../schemas/README.md)
[![状态](https://img.shields.io/badge/status-企业级-green.svg)](../../../ALPHA-RELEASE-NOTES.md)
[![测试](https://img.shields.io/badge/tests-170%2F170%20通过-green.svg)](../modules/plan/testing-guide.md)
[![语言](https://img.shields.io/badge/language-简体中文-red.svg)](../../en/api-reference/plan-api.md)

---

## 🎯 概述

Plan API为多智能体系统提供全面的规划和任务编排功能。它使智能体能够创建协作计划、将复杂目标分解为可管理的任务，并在分布式环境中协调执行。此API基于MPLP v1.0 Alpha的实际实现。

## 📦 导入

```typescript
import { 
  PlanController,
  PlanManagementService,
  CreatePlanDto,
  UpdatePlanDto,
  PlanResponseDto
} from 'mplp/modules/plan';

// 或使用模块接口
import { MPLP } from 'mplp';
const mplp = new MPLP();
const planModule = mplp.getModule('plan');
```

## 🏗️ 核心接口

### **PlanResponseDto** (响应接口)

```typescript
interface PlanResponseDto {
  // 基础协议字段
  protocolVersion: string;        // 协议版本 "1.0.0"
  timestamp: string;              // ISO 8601时间戳
  planId: string;                 // 唯一计划标识符
  contextId: string;              // 关联的上下文ID
  name: string;                   // 计划名称
  description?: string;           // 计划描述
  status: PlanStatus;             // 计划状态
  priority: Priority;             // 计划优先级
  
  // 核心功能字段
  tasks: Task[];                  // 任务列表
  milestones?: Milestone[];       // 里程碑定义
  resources?: ResourceAllocation[]; // 资源分配
  risks?: RiskItem[];             // 风险评估
  executionConfig?: ExecutionConfig; // 执行配置
  optimizationConfig?: OptimizationConfig; // 优化设置
  
  // 企业级功能
  auditTrail: AuditTrail;        // 审计跟踪信息
  monitoringIntegration: Record<string, unknown>; // 监控集成
  performanceMetrics: Record<string, unknown>;   // 性能指标
  versionHistory?: Record<string, unknown>;      // 版本历史
  
  // 元数据
  metadata?: Record<string, any>; // 自定义元数据
  createdAt?: string;            // 创建时间戳
  updatedAt?: string;            // 最后更新时间戳
}
```

### **CreatePlanDto** (创建请求接口)

```typescript
interface CreatePlanDto {
  contextId: string;              // 必需：关联的上下文ID
  name: string;                   // 必需：计划名称
  description?: string;           // 可选：计划描述
  priority?: Priority;            // 可选：计划优先级
  
  // 任务和里程碑定义
  tasks?: Partial<Task>[];        // 初始任务列表
  milestones?: Partial<Milestone>[]; // 里程碑定义
  
  // 配置
  executionConfig?: Partial<ExecutionConfig>;
  optimizationConfig?: Partial<OptimizationConfig>;
  
  // 元数据
  metadata?: Record<string, any>;
}
```

### **UpdatePlanDto** (更新请求接口)

```typescript
interface UpdatePlanDto {
  name?: string;                  // 可选：更新名称
  description?: string;           // 可选：更新描述
  status?: PlanStatus;            // 可选：更新状态
  priority?: Priority;            // 可选：更新优先级
  
  // 部分更新
  tasks?: Partial<Task>[];
  milestones?: Partial<Milestone>[];
  executionConfig?: Partial<ExecutionConfig>;
  optimizationConfig?: Partial<OptimizationConfig>;
  
  // 元数据更新
  metadata?: Record<string, any>;
}
```

## 🔧 核心枚举类型

### **PlanStatus** (计划状态)

```typescript
enum PlanStatus {
  DRAFT = 'draft',                // 草稿状态
  ACTIVE = 'active',              // 活跃状态
  EXECUTING = 'executing',        // 执行状态
  COMPLETED = 'completed',        // 已完成状态
  FAILED = 'failed',              // 失败状态
  SUSPENDED = 'suspended',        // 暂停状态
  ARCHIVED = 'archived'           // 已归档状态
}
```

### **TaskType** (任务类型)

```typescript
enum TaskType {
  ATOMIC = 'atomic',              // 原子任务
  COMPOSITE = 'composite',        // 复合任务
  MILESTONE = 'milestone',        // 里程碑任务
  CHECKPOINT = 'checkpoint'       // 检查点任务
}
```

### **Priority** (优先级)

```typescript
enum Priority {
  LOW = 'low',                    // 低优先级
  MEDIUM = 'medium',              // 中等优先级
  HIGH = 'high',                  // 高优先级
  CRITICAL = 'critical'           // 关键优先级
}
```

## 🎮 控制器API

### **PlanController**

主要的REST API控制器，提供HTTP端点访问。

#### **创建计划**
```typescript
async createPlan(dto: CreatePlanDto): Promise<PlanOperationResultDto>
```

**HTTP端点**: `POST /api/plans`

**请求示例**:
```json
{
  "contextId": "ctx-12345678-abcd-efgh",
  "name": "多智能体协作计划",
  "description": "AI智能体协作的综合计划",
  "priority": "high",
  "tasks": [
    {
      "name": "初始化上下文",
      "description": "设置协作上下文",
      "type": "atomic",
      "priority": "critical"
    },
    {
      "name": "分配角色",
      "description": "为参与的智能体分配角色",
      "type": "composite",
      "priority": "high"
    }
  ]
}
```

**响应示例**:
```json
{
  "success": true,
  "planId": "plan-87654321-wxyz-1234",
  "message": "计划创建成功",
  "metadata": {
    "name": "多智能体协作计划",
    "status": "draft",
    "priority": "high",
    "taskCount": 2
  }
}
```

#### **获取计划**
```typescript
async getPlan(planId: string): Promise<PlanResponseDto | null>
```

**HTTP端点**: `GET /api/plans/{planId}`

#### **更新计划**
```typescript
async updatePlan(planId: string, dto: UpdatePlanDto): Promise<PlanOperationResultDto>
```

**HTTP端点**: `PUT /api/plans/{planId}`

#### **删除计划**
```typescript
async deletePlan(planId: string): Promise<void>
```

**HTTP端点**: `DELETE /api/plans/{planId}`

#### **执行计划**
```typescript
async executePlan(planId: string, dto?: PlanExecutionDto): Promise<PlanOperationResultDto>
```

**HTTP端点**: `POST /api/plans/{planId}/execute`

**请求示例**:
```json
{
  "strategy": "balanced",
  "dryRun": false,
  "validateDependencies": true
}
```

#### **优化计划**
```typescript
async optimizePlan(planId: string, dto?: PlanOptimizationDto): Promise<PlanOperationResultDto>
```

**HTTP端点**: `POST /api/plans/{planId}/optimize`

**请求示例**:
```json
{
  "targets": ["time", "resource", "quality"],
  "constraints": {
    "maxDuration": 3600,
    "resourceLimits": {
      "cpu": 80,
      "memory": 4096
    }
  },
  "algorithm": "genetic",
  "iterations": 100
}
```

#### **查询计划**
```typescript
async queryPlans(query: PlanQueryDto, pagination?: PaginationParams): Promise<PaginatedPlanResponseDto>
```

**HTTP端点**: `GET /api/plans`

**查询参数**:
- `status`: 按状态过滤
- `priority`: 按优先级过滤
- `contextId`: 按上下文ID过滤
- `createdAfter`: 按创建日期过滤
- `limit`: 限制结果数量
- `offset`: 分页偏移量

## 🔧 服务层API

### **PlanManagementService**

核心业务逻辑服务，提供计划管理功能。

#### **主要方法**

```typescript
class PlanManagementService {
  // 基础CRUD操作
  async createPlan(params: PlanCreationParams): Promise<PlanEntityData>;
  async getPlan(planId: string): Promise<PlanEntityData | null>;
  async updatePlan(params: UpdatePlanParams): Promise<PlanEntityData>;
  async deletePlan(planId: string): Promise<boolean>;
  
  // 高级操作
  async executePlan(planId: string, options?: PlanExecutionOptions): Promise<ExecutionResult>;
  async optimizePlan(planId: string, params?: PlanOptimizationParams): Promise<OptimizationResult>;
  async validatePlan(planId: string): Promise<ValidationResult>;
  
  // 任务管理
  async addTask(planId: string, task: Partial<Task>): Promise<Task>;
  async updateTask(planId: string, taskId: string, updates: Partial<Task>): Promise<Task>;
  async removeTask(planId: string, taskId: string): Promise<void>;
  
  // 里程碑管理
  async addMilestone(planId: string, milestone: Partial<Milestone>): Promise<Milestone>;
  async updateMilestone(planId: string, milestoneId: string, updates: Partial<Milestone>): Promise<Milestone>;
  
  // 分析和监控
  async getPlanMetrics(planId: string): Promise<PlanMetrics>;
  async getPlanHealth(planId: string): Promise<PlanHealth>;
}
```

## 📊 数据结构

### **Task** (任务定义)

```typescript
interface Task {
  taskId: string;                 // 唯一任务标识符
  name: string;                   // 任务名称
  description?: string;           // 任务描述
  type: TaskType;                 // 任务类型
  status: TaskStatus;             // 任务状态
  priority: Priority;             // 任务优先级
  dependencies?: string[];        // 任务依赖
  estimatedDuration?: number;     // 预估持续时间（分钟）
  assignedTo?: string;           // 分配的智能体/用户
  resources?: ResourceRequirement[]; // 资源需求
}
```

### **Milestone** (里程碑定义)

```typescript
interface Milestone {
  milestoneId: string;           // 唯一里程碑标识符
  name: string;                  // 里程碑名称
  description?: string;          // 里程碑描述
  targetDate?: string;           // 目标完成日期
  status: MilestoneStatus;       // 里程碑状态
  criteria: string[];            // 完成标准
  dependencies?: string[];       // 里程碑依赖
}
```

### **ExecutionConfig** (执行配置)

```typescript
interface ExecutionConfig {
  strategy: 'time_optimal' | 'resource_optimal' | 'cost_optimal' | 'quality_optimal' | 'balanced';
  parallelism: {
    enabled: boolean;
    maxConcurrentTasks: number;
  };
  retryPolicy: {
    enabled: boolean;
    maxRetries: number;
    backoffStrategy: 'linear' | 'exponential';
  };
  timeout: {
    taskTimeout: number;        // 任务超时（秒）
    planTimeout: number;        // 整体计划超时（秒）
  };
}
```

---

## 🔗 相关文档

- **[实现指南](../modules/plan/implementation-guide.md)**: 详细实现说明
- **[配置指南](../modules/plan/configuration-guide.md)**: 配置选项参考
- **[集成示例](../modules/plan/integration-examples.md)**: 实际使用示例
- **[协议规范](../modules/plan/protocol-specification.md)**: 底层协议规范

---

**最后更新**: 2025年9月4日  
**API版本**: v1.0.0  
**状态**: 企业级生产就绪  
**语言**: 简体中文
