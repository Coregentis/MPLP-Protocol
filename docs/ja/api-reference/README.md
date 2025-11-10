# MPLP v1.0 Alpha - APIリファレンス

> **🌐 言語ナビゲーション**: [English](../../en/api-reference/README.md) | [中文](../../zh-CN/api-reference/README.md) | [日本語](README.md)



**Multi-Agent Protocol Lifecycle Platformの完全なAPIドキュメント**

## 📚 **APIドキュメント概要**

このセクションは、MPLP v1.0 Alphaプロトコルスタックのすべての層の包括的なAPIドキュメントを提供します。**すべての10モジュールが100%完成**し、エンタープライズグレードのAPIを備え、**2,902テスト（2,899合格、3失敗）= 99.9%合格率**、**ゼロ技術債務**です。APIは、簡単なナビゲーションのために層とモジュールごとに整理されています。

## 🏗️ **APIアーキテクチャ**

```
┌─────────────────────────────────────────────────────────────┐
│                    L4 エージェント層                         │
│              （あなたのエージェント実装）                    │
├─────────────────────────────────────────────────────────────┤
│                 L3 実行層                                    │
│              CoreOrchestrator API                           │
├─────────────────────────────────────────────────────────────┤
│                L2 調整層                                     │
│  Context │ Plan │ Role │ Confirm │ Trace │ Extension │...   │
├─────────────────────────────────────────────────────────────┤
│                 L1 プロトコル層                              │
│           スキーマ検証と横断的API                            │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 **クイックナビゲーション**

### **コアAPI**
- **[MPLPCore API](core-api.md)** - メインMPLP初期化と管理
- **[CoreOrchestrator API](orchestrator-api.md)** - L3ワークフローオーケストレーション
- **[Schema Validation API](schema-api.md)** - L1プロトコル検証

### **L2調整モジュールAPI**

#### **コアプロトコルモジュール**（すべてエンタープライズグレード完成）
- **[Context API](context-api.md)** - 共有状態とコンテキスト管理 ✅ **(499/499テスト)**
- **[Plan API](plan-api.md)** - 協調計画と目標分解 ✅ **(170/170テスト)**
- **[Role API](role-api.md)** - ロールベースアクセス制御と機能 ✅ **(323/323テスト)**
- **[Confirm API](confirm-api.md)** - マルチパーティ承認とコンセンサス ✅ **(265/265テスト)**
- **[Trace API](trace-api.md)** - 実行監視とパフォーマンス追跡 ✅ **(107/107テスト)**
- **[Extension API](extension-api.md)** - プラグインシステムとカスタム機能 ✅ **(92/92テスト)**

#### **コラボレーションモジュール**（すべてエンタープライズグレード完成）
- **[Dialog API](dialog-api.md)** - エージェント間通信と会話 ✅ **(121/121テスト)**
- **[Collab API](collab-api.md)** - マルチエージェント協調と調整 ✅ **(146/146テスト)**
- **[Network API](network-api.md)** - 分散通信とサービス発見 ✅ **(190/190テスト)**
- **[Core API](core-api.md)** - 中央調整とシステム管理 ✅ **(584/584テスト)**

### **横断的関心事API**
- **[Event Bus API](event-bus-api.md)** - イベント駆動通信
- **[Error Handling API](error-handling-api.md)** - 標準化されたエラー管理
- **[Logging API](logging-api.md)** - 構造化ログとトレース
- **[Caching API](caching-api.md)** - マルチティアキャッシング戦略
- **[Security API](security-api.md)** - 認証と認可

## 🚀 **APIの使用開始**

### **基本的なAPI使用パターン**

```typescript
import { MPLPCore } from 'mplp';

// 1. MPLPを初期化
const mplp = new MPLPCore({
  version: '1.0.0-alpha',
  environment: 'development'
});

await mplp.initialize();

// 2. モジュールAPIを取得
const contextAPI = mplp.getModule('context');
const planAPI = mplp.getModule('plan');
const orchestratorAPI = mplp.getCoreOrchestrator();

// 3. APIを使用
const context = await contextAPI.createContext({
  name: 'my-context',
  type: 'project'
});

const plan = await planAPI.createPlan({
  contextId: context.id,
  objectives: ['objective-1', 'objective-2']
});

const workflow = await orchestratorAPI.executeWorkflow({
  stages: ['context', 'plan', 'execute']
});
```

### **エラー処理パターン**

```typescript
import { MPLPError, ErrorCode } from 'mplp';

try {
  const result = await mplp.context.createContext(contextData);
  return result;
} catch (error) {
  if (error instanceof MPLPError) {
    switch (error.code) {
      case ErrorCode.VALIDATION_ERROR:
        console.error('検証に失敗しました:', error.details);
        break;
      case ErrorCode.PERMISSION_DENIED:
        console.error('権限が拒否されました:', error.message);
        break;
      default:
        console.error('MPLPエラー:', error.message);
    }
  } else {
    console.error('予期しないエラー:', error);
  }
  throw error;
}
```

### **イベント処理パターン**

```typescript
// イベントを購読
mplp.eventBus.subscribe('context.created', (event) => {
  console.log('コンテキストが作成されました:', event.data);
});

mplp.eventBus.subscribe('workflow.completed', (event) => {
  console.log('ワークフローが完了しました:', event.data);
});

// イベントを公開
await mplp.eventBus.publish('custom.event', {
  source: 'my-agent',
  data: { message: 'こんにちは、MPLP！' }
});
```

## 📊 **API規則**

### **リクエスト/レスポンス形式**
すべてのAPIは一貫したリクエスト/レスポンスパターンに従います：

```typescript
// リクエスト形式
interface APIRequest<T = unknown> {
  data: T;
  metadata?: RequestMetadata;
  correlationId?: string;
}

// レスポンス形式
interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: APIError;
  metadata: ResponseMetadata;
  correlationId: string;
}

// エラー形式
interface APIError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: Date;
}
```

### **共通パラメータ**

#### **ページネーション**
```typescript
interface PaginationParams {
  page?: number;        // ページ番号（1ベース）
  limit?: number;       // ページあたりのアイテム数（デフォルト: 20、最大: 100）
  sortBy?: string;      // ソートフィールド
  sortOrder?: 'asc' | 'desc'; // ソート方向
}
```

#### **フィルタリング**
```typescript
interface FilterParams {
  filters?: Record<string, unknown>; // フィールドベースのフィルター
  search?: string;                   // テキスト検索
  dateRange?: {                      // 日付範囲フィルター
    from: Date;
    to: Date;
  };
}
```

#### **オプション**
```typescript
interface RequestOptions {
  timeout?: number;           // リクエストタイムアウト（ミリ秒）
  retryPolicy?: RetryPolicy;  // 再試行ポリシー
  cacheStrategy?: CacheStrategy; // キャッシング戦略
  traceEnabled?: boolean;     // トレースを有効化
}
```

## 🔐 **認証と認可**

### **API認証**
```typescript
// APIキー認証
const mplp = new MPLPCore({
  auth: {
    type: 'api-key',
    apiKey: process.env.MPLP_API_KEY
  }
});

// OAuth 2.0認証
const mplp = new MPLPCore({
  auth: {
    type: 'oauth2',
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    tokenUrl: 'https://auth.mplp.dev/token'
  }
});
```

### **権限チェック**
```typescript
// 権限を確認
const hasPermission = await mplp.role.checkPermission({
  userId: 'user-123',
  permission: 'context.create'
});

if (!hasPermission) {
  throw new MPLPError('権限が拒否されました', ErrorCode.PERMISSION_DENIED);
}
```

## 📈 **パフォーマンスとスケーリング**

### **バッチ操作**
```typescript
// 複数のコンテキストをバッチ作成
const contexts = await mplp.context.batchCreate([
  { name: 'context-1', type: 'project' },
  { name: 'context-2', type: 'task' },
  { name: 'context-3', type: 'workflow' }
]);
```

### **キャッシング**
```typescript
// キャッシング戦略を設定
const context = await mplp.context.getContext('ctx-123', {
  cacheStrategy: {
    enabled: true,
    ttl: 3600, // 1時間
    invalidateOn: ['context.updated', 'context.deleted']
  }
});
```

---

## 📚 **追加リソース**

- **[クイックスタートガイド](../developers/quick-start.md)** - MPLPを始める
- **[チュートリアル](../developers/tutorials.md)** - ステップバイステップガイド
- **[コード例](../developers/examples.md)** - 動作するコード例
- **[ベストプラクティス](../guides/best-practices.md)** - 推奨パターン

---

**ドキュメントバージョン**: 1.0
**最終更新**: 2025年9月4日
**APIバージョン**: v1.0.0-alpha
**言語**: 日本語
