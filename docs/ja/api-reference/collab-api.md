# Collab APIリファレンス

> **🌐 言語ナビゲーション**: [English](../../en/api-reference/collab-api.md) | [中文](../../zh-CN/api-reference/collab-api.md) | [日本語](collab-api.md)



**マルチエージェント協調と意思決定 - MPLP v1.0 Alpha**

[![API](https://img.shields.io/badge/api-Collab%20Module-blue.svg)](../modules/collab/README.md)
[![Schema](https://img.shields.io/badge/schema-mplp--collab.json-green.svg)](../schemas/README.md)
[![Status](https://img.shields.io/badge/status-Enterprise%20Grade-green.svg)](../../../ALPHA-RELEASE-NOTES.md)
[![Tests](https://img.shields.io/badge/tests-146%2F146%20passing-green.svg)](../modules/collab/testing-guide.md)
[![Language](https://img.shields.io/badge/language-日本語-blue.svg)](../../en/api-reference/collab-api.md)

---

## 🎯 概要

Collab APIは、マルチエージェントシステムのための包括的な協調と意思決定機能を提供します。エージェント間の調整、集団意思決定、タスク分配、エンタープライズグレードの協調メカニズムを可能にします。このAPIは、MPLP v1.0 Alphaの実際の実装に基づいています。

## 📦 インポート

```typescript
import { 
  CollabController,
  CollabManagementService,
  CreateCollabDto,
  UpdateCollabDto,
  CollabResponseDto
} from 'mplp/modules/collab';

// またはモジュールインターフェースを使用
import { MPLP } from 'mplp';
const mplp = new MPLP();
const collabModule = mplp.getModule('collab');
```

## 🏗️ コアインターフェース

### **CollabResponseDto** (レスポンスインターフェース)

```typescript
interface CollabResponseDto {
  // 基本プロトコルフィールド
  protocolVersion: string;        // プロトコルバージョン "1.0.0"
  timestamp: string;              // ISO 8601タイムスタンプ
  collabId: string;               // 一意の協調識別子
  contextId: string;              // 関連するコンテキストID
  planId?: string;                // 関連するプランID（オプション）
  name: string;                   // 協調セッション名
  status: CollabStatus;           // 協調ステータス
  
  // 参加エージェント
  participants: AgentParticipant[]; // 参加エージェントリスト
  coordinator?: string;           // コーディネーターエージェントID
  
  // 協調戦略
  strategy: {
    type: StrategyType;           // 協調戦略タイプ
    decisionMaking: DecisionMakingMethod; // 意思決定方法
    taskAllocation: TaskAllocationMethod; // タスク割り当て方法
    conflictResolution: ConflictResolutionMethod; // 競合解決方法
  };
  
  // 協調活動
  activities: CollabActivity[];   // 協調活動リスト
  decisions: Decision[];          // 意思決定リスト
  tasks: CollabTask[];            // 協調タスクリスト
  
  // パフォーマンスメトリクス
  metrics: {
    efficiency: number;           // 効率スコア
    coordination: number;         // 調整スコア
    consensus: number;            // コンセンサススコア
    taskCompletion: number;       // タスク完了率
  };
  
  // メタデータ
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

// ステータス列挙型
type CollabStatus = 'forming' | 'active' | 'paused' | 'completed' | 'dissolved';
type StrategyType = 'hierarchical' | 'peer-to-peer' | 'consensus' | 'hybrid';
type DecisionMakingMethod = 'voting' | 'consensus' | 'leader' | 'weighted';
```

### **AgentParticipant** (エージェント参加者構造)

```typescript
interface AgentParticipant {
  agentId: string;                // エージェントID
  agentType: string;              // エージェントタイプ
  role: string;                   // 協調内のロール
  capabilities: string[];         // 提供される機能
  status: ParticipantStatus;      // 参加ステータス
  contribution: {
    tasksCompleted: number;       // 完了したタスク数
    decisionsParticipated: number; // 参加した意思決定数
    contributionScore: number;    // 貢献スコア
  };
  joinedAt: string;               // 参加時刻
}

type ParticipantStatus = 'active' | 'idle' | 'busy' | 'offline';
```

### **Decision** (意思決定構造)

```typescript
interface Decision {
  decisionId: string;             // 意思決定ID
  timestamp: string;              // タイムスタンプ
  subject: string;                // 意思決定の件名
  description: string;            // 説明
  method: DecisionMakingMethod;   // 使用された方法
  
  // 投票/コンセンサス
  votes: Vote[];                  // 投票リスト
  result: {
    outcome: string;              // 結果
    confidence: number;           // 信頼度
    consensus: number;            // コンセンサスレベル
  };
  
  // 実装
  implementation: {
    status: 'pending' | 'in_progress' | 'completed';
    assignedTo?: string;          // 割り当て先エージェント
    deadline?: string;            // 期限
  };
}

interface Vote {
  agentId: string;                // 投票エージェントID
  choice: string;                 // 選択
  weight: number;                 // 投票の重み
  rationale?: string;             // 理由
  timestamp: string;              // 投票時刻
}
```

### **CollabTask** (協調タスク構造)

```typescript
interface CollabTask {
  taskId: string;                 // タスクID
  name: string;                   // タスク名
  description?: string;           // タスク説明
  status: TaskStatus;             // タスクステータス
  priority: Priority;             // 優先度
  
  // 割り当て
  assignedTo: string[];           // 割り当て先エージェントID
  allocationMethod: 'manual' | 'automatic' | 'negotiated';
  
  // 依存関係と調整
  dependencies: string[];         // 依存タスクID
  coordinationRequired: boolean;  // 調整が必要か
  
  // 進捗
  progress: number;               // 進捗率（0-100）
  startTime?: string;             // 開始時刻
  endTime?: string;               // 終了時刻
}

type TaskStatus = 'pending' | 'assigned' | 'in_progress' | 'completed' | 'blocked';
type Priority = 'low' | 'medium' | 'high' | 'critical';
```

## 🚀 REST APIエンドポイント

### **POST /collaborations** - 協調セッションを作成

新しい協調セッションを作成します。

```typescript
const collabController = new CollabController(collabManagementService);

const result = await collabController.createCollaboration({
  contextId: 'ctx-123',
  planId: 'plan-456',
  name: 'データ分析プロジェクト',
  participants: [
    {
      agentId: 'agent-001',
      agentType: 'data-analyst',
      role: 'lead-analyst',
      capabilities: ['data-analysis', 'visualization']
    },
    {
      agentId: 'agent-002',
      agentType: 'data-engineer',
      role: 'data-processor',
      capabilities: ['data-processing', 'etl']
    },
    {
      agentId: 'agent-003',
      agentType: 'ml-specialist',
      role: 'model-builder',
      capabilities: ['machine-learning', 'model-training']
    }
  ],
  coordinator: 'agent-001',
  strategy: {
    type: 'hierarchical',
    decisionMaking: 'leader',
    taskAllocation: 'capability-based',
    conflictResolution: 'coordinator-mediated'
  }
});

console.log('協調セッションが作成されました:', result.collabId);
```

**レスポンス**: `CollabResponseDto`

### **GET /collaborations/:id** - 協調セッションを取得

IDで協調セッションを取得します。

```typescript
const collab = await collabController.getCollaboration('collab-123');
console.log('協調セッション:', collab.name);
console.log('参加者数:', collab.participants.length);
console.log('効率スコア:', collab.metrics.efficiency);
```

**レスポンス**: `CollabResponseDto`

### **POST /collaborations/:id/decisions** - 意思決定を作成

協調セッション内で意思決定を作成します。

```typescript
const decision = await collabController.createDecision('collab-123', {
  subject: 'データモデル選択',
  description: 'プロジェクトに使用するデータモデルを選択',
  method: 'voting',
  options: ['モデルA', 'モデルB', 'モデルC'],
  deadline: '2025-09-10T17:00:00Z'
});

console.log('意思決定が作成されました:', decision.decisionId);
```

**レスポンス**: `Decision`

### **POST /collaborations/:id/decisions/:decisionId/vote** - 投票

意思決定に投票します。

```typescript
await collabController.vote('collab-123', 'decision-001', {
  agentId: 'agent-002',
  choice: 'モデルB',
  weight: 1.0,
  rationale: 'パフォーマンスと精度のバランスが最適'
});

console.log('投票が記録されました');
```

**レスポンス**: `VoteResult`

### **POST /collaborations/:id/tasks** - タスクを割り当て

協調タスクを作成して割り当てます。

```typescript
const task = await collabController.createTask('collab-123', {
  name: 'データクリーニング',
  description: 'データセットをクリーニングして前処理',
  priority: 'high',
  assignedTo: ['agent-002'],
  allocationMethod: 'automatic',
  coordinationRequired: false
});

console.log('タスクが割り当てられました:', task.taskId);
```

**レスポンス**: `CollabTask`

## 📚 使用例

### **例1: ピアツーピア協調**

```typescript
// ピアツーピア協調セッションを作成
const collab = await collabController.createCollaboration({
  contextId: 'ctx-p2p',
  name: 'ピアレビュー',
  participants: [
    { agentId: 'dev-001', agentType: 'developer', role: 'reviewer' },
    { agentId: 'dev-002', agentType: 'developer', role: 'reviewer' },
    { agentId: 'dev-003', agentType: 'developer', role: 'reviewer' }
  ],
  strategy: {
    type: 'peer-to-peer',
    decisionMaking: 'consensus',
    taskAllocation: 'self-organized',
    conflictResolution: 'discussion'
  }
});

// コンセンサス意思決定を作成
const decision = await collabController.createDecision(collab.collabId, {
  subject: 'コード変更の承認',
  method: 'consensus',
  minimumConsensus: 0.8 // 80%のコンセンサスが必要
});

// 各エージェントが投票
await collabController.vote(collab.collabId, decision.decisionId, {
  agentId: 'dev-001',
  choice: '承認',
  weight: 1.0
});

await collabController.vote(collab.collabId, decision.decisionId, {
  agentId: 'dev-002',
  choice: '承認',
  weight: 1.0
});

await collabController.vote(collab.collabId, decision.decisionId, {
  agentId: 'dev-003',
  choice: '承認',
  weight: 1.0
});
```

---

**APIバージョン**: 1.0.0-alpha  
**最終更新**: 2025年9月4日  
**ステータス**: エンタープライズグレード  
**テスト**: 146/146テスト合格 ✅

