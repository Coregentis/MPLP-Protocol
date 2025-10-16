# Context APIリファレンス

> **🌐 言語ナビゲーション**: [English](../../en/api-reference/context-api.md) | [中文](../../zh-CN/api-reference/context-api.md) | [日本語](context-api.md)



**エージェント間の共有状態とコンテキスト管理 - MPLP v1.0 Alpha**

[![API](https://img.shields.io/badge/api-Context%20Module-blue.svg)](../modules/context/README.md)
[![Schema](https://img.shields.io/badge/schema-mplp--context.json-green.svg)](../schemas/README.md)
[![Status](https://img.shields.io/badge/status-Production%20Ready-green.svg)](../../../ALPHA-RELEASE-NOTES.md)
[![Language](https://img.shields.io/badge/language-日本語-blue.svg)](../../en/api-reference/context-api.md)

---

## 🎯 概要

Context APIは、マルチエージェントシステムのための包括的なコンテキスト管理機能を提供します。エージェントが状態を共有し、活動を調整し、分散操作全体で一貫したコンテキストを維持することを可能にします。このAPIは、MPLP v1.0 Alphaの実際の実装に基づいています。

## 📦 インポート

```typescript
import { 
  ContextController,
  ContextManagementService,
  CreateContextDto,
  UpdateContextDto,
  ContextResponseDto
} from 'mplp/modules/context';

// またはモジュールインターフェースを使用
import { MPLP } from 'mplp';
const mplp = new MPLP();
const contextModule = mplp.getModule('context');
```

## 🏗️ コアインターフェース

### **ContextResponseDto** (レスポンスインターフェース)

```typescript
interface ContextResponseDto {
  contextId: string;                    // 一意のコンテキスト識別子（UUID）
  name: string;                         // 人間が読める名前
  description?: string;                 // オプションの説明
  status: ContextStatus;                // 現在のステータス
  lifecycleStage: LifecycleStage;      // 現在のライフサイクルステージ
  protocolVersion: string;              // MPLPプロトコルバージョン（1.0.0）
  timestamp: string;                    // ISOタイムスタンプ
  sharedState: SharedState;             // 共有状態データ
  accessControl: AccessControl;         // アクセス制御設定
  configuration: Configuration;         // 設定データ
  auditTrail: AuditTrail;              // 監査情報
  monitoringIntegration: MonitoringIntegration; // 監視データ
  performanceMetrics: PerformanceMetrics; // パフォーマンスデータ
  versionHistory: VersionHistory;       // バージョン追跡
  searchMetadata: SearchMetadata;       // 検索メタデータ
  cachingPolicy: CachingPolicy;         // キャッシング設定
  syncConfiguration: SyncConfiguration; // 同期設定
  errorHandling: ErrorHandling;         // エラー処理設定
  integrationEndpoints: IntegrationEndpoints; // 統合エンドポイント
  eventIntegration: EventIntegration;   // イベント統合
}

// ステータス列挙型（実際の実装から）
type ContextStatus = 'active' | 'suspended' | 'completed' | 'terminated';
type LifecycleStage = 'planning' | 'executing' | 'monitoring' | 'completed';
```

### **CreateContextDto** (リクエストインターフェース)

```typescript
interface CreateContextDto {
  name: string;                         // 必須: コンテキスト名
  description?: string;                 // オプション: コンテキスト説明
  sharedState?: Partial<SharedState>;   // オプション: 初期共有状態
  accessControl?: Partial<AccessControl>; // オプション: アクセス制御設定
  configuration?: Partial<Configuration>; // オプション: 設定データ
}
```

### **UpdateContextDto** (更新インターフェース)

```typescript
interface UpdateContextDto {
  name?: string;                        // オプション: 名前を更新
  description?: string;                 // オプション: 説明を更新
  status?: ContextStatus;               // オプション: ステータスを更新
  lifecycleStage?: LifecycleStage;     // オプション: ライフサイクルステージを更新
  sharedState?: Partial<SharedState>;   // オプション: 共有状態を更新
  accessControl?: Partial<AccessControl>; // オプション: アクセス制御を更新
  configuration?: Partial<Configuration>; // オプション: 設定を更新
}
```

### **SharedState** (実際の構造)

```typescript
interface SharedState {
  variables: Record<string, any>;       // 共有変数
  resources: {
    allocated: Record<string, ResourceAllocation>;
    requirements: Record<string, ResourceRequirement>;
  };
  dependencies: Dependency[];           // コンテキスト依存関係
  goals: Goal[];                        // コンテキスト目標
}

interface ResourceAllocation {
  type: string;                         // リソースタイプ
  amount: number;                       // 割り当て量
  unit: string;                         // 測定単位
  status: 'available' | 'in-use' | 'reserved';
}

interface ResourceRequirement {
  minimum: number;                      // 最小必要量
  optimal: number;                      // 最適量
  unit: string;                         // 測定単位
}

interface Dependency {
  id: string;                          // 依存関係ID
  type: string;                        // 依存関係タイプ
  status: 'pending' | 'resolved' | 'failed';
}

interface Goal {
  id: string;                          // 目標ID
  name: string;                        // 目標名
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'defined' | 'active' | 'completed' | 'failed';
  description?: string;                // オプションの説明
}
```

### **AccessControl** (セキュリティ構造)

```typescript
interface AccessControl {
  owner: {
    userId: string;                     // 所有者ユーザーID
    role: string;                       // 所有者ロール
  };
  permissions: Permission[];            // 権限リスト
}

interface Permission {
  principal: string;                    // プリンシパルID（ユーザー/エージェント）
  principalType: 'user' | 'agent' | 'group';
  resource: string;                     // リソース識別子
  actions: string[];                    // 許可されたアクション
  conditions: Condition[];              // アクセス条件
}

interface Condition {
  type: string;                         // 条件タイプ
  value: any;                          // 条件値
}
```

## 🚀 REST APIエンドポイント

### **POST /contexts** - コンテキストを作成

指定された設定で新しいコンテキストを作成します。

```typescript
const contextController = new ContextController(contextManagementService);

const result = await contextController.createContext({
  name: 'マルチエージェントコラボレーション',
  description: 'マルチエージェント分析のための協調コンテキスト',
  sharedState: {
    variables: {
      currentPhase: 'planning',
      environment: 'production'
    },
    resources: {
      allocated: {
        cpu: { 
          type: 'compute', 
          amount: 2, 
          unit: 'cores', 
          status: 'available' 
        }
      },
      requirements: {
        memory: { 
          minimum: 1024, 
          optimal: 2048, 
          unit: 'MB' 
        }
      }
    },
    dependencies: [],
    goals: [
      {
        id: 'goal-001',
        name: '分析を完了',
        priority: 'high',
        status: 'defined',
        description: 'データ分析タスクを完了'
      }
    ]
  },
  accessControl: {
    owner: {
      userId: 'user-123',
      role: 'admin'
    },
    permissions: [
      {
        principal: 'agent-001',
        principalType: 'agent',
        resource: 'context',
        actions: ['read', 'write'],
        conditions: []
      }
    ]
  }
});

console.log('コンテキストが作成されました:', result.contextId);
```

**レスポンス**: `ContextResponseDto`

### **GET /contexts/:id** - コンテキストを取得

IDでコンテキストを取得します。

```typescript
const context = await contextController.getContext('ctx-123');
console.log('コンテキスト:', context.name);
```

**レスポンス**: `ContextResponseDto`

### **PUT /contexts/:id** - コンテキストを更新

既存のコンテキストを更新します。

```typescript
const updated = await contextController.updateContext('ctx-123', {
  status: 'active',
  lifecycleStage: 'executing',
  sharedState: {
    variables: {
      currentPhase: 'execution',
      progress: 50
    }
  }
});

console.log('コンテキストが更新されました:', updated.timestamp);
```

**レスポンス**: `ContextResponseDto`

### **DELETE /contexts/:id** - コンテキストを削除

コンテキストを削除します。

```typescript
await contextController.deleteContext('ctx-123');
console.log('コンテキストが削除されました');
```

**レスポンス**: `void`

### **GET /contexts** - コンテキストを検索

フィルター条件でコンテキストを検索します。

```typescript
const results = await contextController.searchContexts({
  status: 'active',
  lifecycleStage: 'executing',
  limit: 10,
  offset: 0
});

console.log(`${results.total}個のアクティブなコンテキストが見つかりました`);
```

**レスポンス**: `{ items: ContextResponseDto[], total: number }`

## 📚 使用例

### **例1: 基本的なコンテキスト管理**

```typescript
// コンテキストを作成
const context = await contextController.createContext({
  name: 'データ処理パイプライン',
  description: 'ETLパイプライン用のコンテキスト',
  sharedState: {
    variables: { stage: 'extract' },
    resources: { allocated: {}, requirements: {} },
    dependencies: [],
    goals: []
  }
});

// 共有状態を更新
await contextController.updateContext(context.contextId, {
  sharedState: {
    variables: { 
      stage: 'transform',
      recordsProcessed: 1000
    }
  }
});

// コンテキストを取得
const updated = await contextController.getContext(context.contextId);
console.log('現在のステージ:', updated.sharedState.variables.stage);
```

---

**APIバージョン**: 1.0.0-alpha  
**最終更新**: 2025年9月4日  
**ステータス**: 本番環境対応  
**テスト**: 499/499テスト合格 ✅

