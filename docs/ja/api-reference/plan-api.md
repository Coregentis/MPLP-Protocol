# Plan APIリファレンス

> **🌐 言語ナビゲーション**: [English](../../en/api-reference/plan-api.md) | [中文](../../zh-CN/api-reference/plan-api.md) | [日本語](plan-api.md)



**協調的な計画と目標分解 - MPLP v1.0 Alpha**

[![API](https://img.shields.io/badge/api-Plan%20Module-blue.svg)](../modules/plan/README.md)
[![Schema](https://img.shields.io/badge/schema-mplp--plan.json-green.svg)](../schemas/README.md)
[![Status](https://img.shields.io/badge/status-Enterprise%20Grade-green.svg)](../../../ALPHA-RELEASE-NOTES.md)
[![Tests](https://img.shields.io/badge/tests-170%2F170%20passing-green.svg)](../modules/plan/testing-guide.md)
[![Language](https://img.shields.io/badge/language-日本語-blue.svg)](../../en/api-reference/plan-api.md)

---

## 🎯 概要

Plan APIは、マルチエージェントシステムのための包括的な計画とタスクオーケストレーション機能を提供します。エージェントが協調的な計画を作成し、複雑な目標を管理可能なタスクに分解し、分散環境全体で実行を調整することを可能にします。このAPIは、MPLP v1.0 Alphaの実際の実装に基づいています。

## 📦 インポート

```typescript
import { 
  PlanController,
  PlanManagementService,
  CreatePlanDto,
  UpdatePlanDto,
  PlanResponseDto
} from 'mplp/modules/plan';

// またはモジュールインターフェースを使用
import { MPLP } from 'mplp';
const mplp = new MPLP();
const planModule = mplp.getModule('plan');
```

## 🏗️ コアインターフェース

### **PlanResponseDto** (レスポンスインターフェース)

```typescript
interface PlanResponseDto {
  // 基本プロトコルフィールド
  protocolVersion: string;        // プロトコルバージョン "1.0.0"
  timestamp: string;              // ISO 8601タイムスタンプ
  planId: string;                 // 一意のプラン識別子
  contextId: string;              // 関連するコンテキストID
  name: string;                   // プラン名
  description?: string;           // プラン説明
  status: PlanStatus;             // プランステータス
  priority: Priority;             // プラン優先度
  
  // コア機能フィールド
  tasks: Task[];                  // タスクリスト
  milestones?: Milestone[];       // マイルストーン定義
  resources?: ResourceAllocation[]; // リソース割り当て
  risks?: RiskItem[];             // リスク評価
  executionConfig?: ExecutionConfig; // 実行設定
  optimizationConfig?: OptimizationConfig; // 最適化設定
  
  // エンタープライズ機能
  auditTrail: AuditTrail;        // 監査証跡情報
  monitoringIntegration: Record<string, unknown>; // 監視統合
  performanceMetrics: Record<string, unknown>;   // パフォーマンスメトリクス
  versionHistory?: Record<string, unknown>;      // バージョン履歴
  
  // メタデータ
  metadata?: Record<string, any>; // カスタムメタデータ
  createdAt?: string;            // 作成タイムスタンプ
  updatedAt?: string;            // 最終更新タイムスタンプ
}

// ステータス列挙型
type PlanStatus = 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
type Priority = 'low' | 'medium' | 'high' | 'critical';
```

### **CreatePlanDto** (作成リクエストインターフェース)

```typescript
interface CreatePlanDto {
  contextId: string;              // 必須: 関連するコンテキストID
  name: string;                   // 必須: プラン名
  description?: string;           // オプション: プラン説明
  priority?: Priority;            // オプション: プラン優先度
  
  // タスクとマイルストーン定義
  tasks?: Partial<Task>[];        // 初期タスクリスト
  milestones?: Partial<Milestone>[]; // マイルストーン定義
  
  // 設定
  executionConfig?: Partial<ExecutionConfig>;
  optimizationConfig?: Partial<OptimizationConfig>;
  
  // メタデータ
  metadata?: Record<string, any>;
}
```

### **Task** (タスク構造)

```typescript
interface Task {
  taskId: string;                 // タスクID
  name: string;                   // タスク名
  description?: string;           // タスク説明
  status: TaskStatus;             // タスクステータス
  priority: Priority;             // タスク優先度
  dependencies: string[];         // 依存タスクID
  assignedTo?: string;            // 割り当て先エージェントID
  estimatedDuration?: number;     // 推定期間（ミリ秒）
  actualDuration?: number;        // 実際の期間（ミリ秒）
  startTime?: string;             // 開始時刻
  endTime?: string;               // 終了時刻
  metadata?: Record<string, any>; // カスタムメタデータ
}

type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'blocked';
```

## 🚀 REST APIエンドポイント

### **POST /plans** - プランを作成

新しいプランを作成します。

```typescript
const planController = new PlanController(planManagementService);

const result = await planController.createPlan({
  contextId: 'ctx-123',
  name: 'データ処理パイプライン',
  description: 'ETLデータ処理の完全なパイプライン',
  priority: 'high',
  tasks: [
    {
      taskId: 'task-001',
      name: 'データ抽出',
      description: 'ソースシステムからデータを抽出',
      status: 'pending',
      priority: 'high',
      dependencies: [],
      estimatedDuration: 300000 // 5分
    },
    {
      taskId: 'task-002',
      name: 'データ変換',
      description: 'ビジネスルールを適用してデータを変換',
      status: 'pending',
      priority: 'high',
      dependencies: ['task-001'],
      estimatedDuration: 600000 // 10分
    },
    {
      taskId: 'task-003',
      name: 'データロード',
      description: 'ターゲットシステムにデータをロード',
      status: 'pending',
      priority: 'medium',
      dependencies: ['task-002'],
      estimatedDuration: 300000 // 5分
    }
  ],
  milestones: [
    {
      milestoneId: 'milestone-001',
      name: '抽出完了',
      description: 'すべてのデータが抽出されました',
      targetDate: '2025-09-10T12:00:00Z',
      criteria: ['task-001']
    }
  ]
});

console.log('プランが作成されました:', result.planId);
```

**レスポンス**: `PlanResponseDto`

### **GET /plans/:id** - プランを取得

IDでプランを取得します。

```typescript
const plan = await planController.getPlan('plan-123');
console.log('プラン:', plan.name);
console.log('タスク数:', plan.tasks.length);
```

**レスポンス**: `PlanResponseDto`

### **PUT /plans/:id** - プランを更新

既存のプランを更新します。

```typescript
const updated = await planController.updatePlan('plan-123', {
  status: 'active',
  tasks: [
    {
      taskId: 'task-001',
      status: 'in_progress',
      startTime: new Date().toISOString()
    }
  ]
});

console.log('プランが更新されました:', updated.timestamp);
```

**レスポンス**: `PlanResponseDto`

### **DELETE /plans/:id** - プランを削除

プランを削除します。

```typescript
await planController.deletePlan('plan-123');
console.log('プランが削除されました');
```

**レスポンス**: `void`

### **POST /plans/:id/execute** - プランを実行

プランの実行を開始します。

```typescript
const execution = await planController.executePlan('plan-123', {
  executionMode: 'sequential', // または 'parallel'
  maxConcurrentTasks: 3,
  timeoutSeconds: 3600
});

console.log('実行ステータス:', execution.status);
```

**レスポンス**: `ExecutionResult`

## 📚 使用例

### **例1: 順次タスク実行**

```typescript
// 順次実行プランを作成
const plan = await planController.createPlan({
  contextId: 'ctx-123',
  name: '順次データ処理',
  tasks: [
    { taskId: 'task-1', name: '検証', dependencies: [] },
    { taskId: 'task-2', name: '処理', dependencies: ['task-1'] },
    { taskId: 'task-3', name: '保存', dependencies: ['task-2'] }
  ]
});

// プランを実行
const result = await planController.executePlan(plan.planId, {
  executionMode: 'sequential'
});

console.log('すべてのタスクが完了しました:', result.status === 'completed');
```

### **例2: 並列タスク実行**

```typescript
// 並列実行プランを作成
const plan = await planController.createPlan({
  contextId: 'ctx-456',
  name: '並列データ処理',
  tasks: [
    { taskId: 'task-1', name: 'ソース1を処理', dependencies: [] },
    { taskId: 'task-2', name: 'ソース2を処理', dependencies: [] },
    { taskId: 'task-3', name: 'ソース3を処理', dependencies: [] },
    { taskId: 'task-4', name: '結果を統合', dependencies: ['task-1', 'task-2', 'task-3'] }
  ]
});

// 並列実行
const result = await planController.executePlan(plan.planId, {
  executionMode: 'parallel',
  maxConcurrentTasks: 3
});
```

---

**APIバージョン**: 1.0.0-alpha  
**最終更新**: 2025年9月4日  
**ステータス**: エンタープライズグレード  
**テスト**: 170/170テスト合格 ✅

