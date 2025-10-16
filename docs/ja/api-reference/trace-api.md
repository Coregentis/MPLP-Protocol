# Trace APIリファレンス

> **🌐 言語ナビゲーション**: [English](../../en/api-reference/trace-api.md) | [中文](../../zh-CN/api-reference/trace-api.md) | [日本語](trace-api.md)



**実行監視とパフォーマンス追跡 - MPLP v1.0 Alpha**

[![API](https://img.shields.io/badge/api-Trace%20Module-blue.svg)](../modules/trace/README.md)
[![Schema](https://img.shields.io/badge/schema-mplp--trace.json-green.svg)](../schemas/README.md)
[![Status](https://img.shields.io/badge/status-Enterprise%20Grade-green.svg)](../../../ALPHA-RELEASE-NOTES.md)
[![Tests](https://img.shields.io/badge/tests-107%2F107%20passing-green.svg)](../modules/trace/testing-guide.md)
[![Language](https://img.shields.io/badge/language-日本語-blue.svg)](../../en/api-reference/trace-api.md)

---

## 🎯 概要

Trace APIは、マルチエージェントシステムのための包括的な実行監視とパフォーマンス追跡機能を提供します。分散操作全体でのリアルタイム監視、詳細なパフォーマンスメトリクス、エラー追跡、診断機能を可能にします。このAPIは、MPLP v1.0 Alphaの実際の実装に基づいています。

## 📦 インポート

```typescript
import { 
  TraceController,
  TraceManagementService,
  CreateTraceDto,
  UpdateTraceDto,
  TraceResponseDto
} from 'mplp/modules/trace';

// またはモジュールインターフェースを使用
import { MPLP } from 'mplp';
const mplp = new MPLP();
const traceModule = mplp.getModule('trace');
```

## 🏗️ コアインターフェース

### **TraceResponseDto** (レスポンスインターフェース)

```typescript
interface TraceResponseDto {
  // 基本プロトコルフィールド
  protocolVersion: string;        // プロトコルバージョン "1.0.0"
  timestamp: string;              // ISO 8601タイムスタンプ
  traceId: string;                // 一意のトレース識別子
  contextId: string;              // 関連するコンテキストID
  planId?: string;                // 関連するプランID（オプション）
  name: string;                   // トレース名
  status: TraceStatus;            // トレースステータス
  
  // 実行情報
  execution: {
    startTime: string;            // 開始時刻
    endTime?: string;             // 終了時刻
    duration?: number;            // 期間（ミリ秒）
    agentId: string;              // 実行エージェントID
    environment: string;          // 実行環境
  };
  
  // パフォーマンスメトリクス
  performanceMetrics: {
    cpuUsage?: number;            // CPU使用率（%）
    memoryUsage?: number;         // メモリ使用量（MB）
    networkIO?: number;           // ネットワークI/O（KB）
    diskIO?: number;              // ディスクI/O（KB）
    latency?: number;             // レイテンシ（ms）
    throughput?: number;          // スループット（ops/sec）
  };
  
  // スパンとイベント
  spans: Span[];                  // スパンリスト
  events: TraceEvent[];           // イベントリスト
  errors: ErrorRecord[];          // エラーレコード
  
  // メタデータ
  metadata?: Record<string, any>;
  tags?: string[];
}

// ステータス列挙型
type TraceStatus = 'active' | 'completed' | 'failed' | 'cancelled';
```

### **Span** (スパン構造)

```typescript
interface Span {
  spanId: string;                 // スパンID
  parentSpanId?: string;          // 親スパンID
  name: string;                   // スパン名
  startTime: string;              // 開始時刻
  endTime?: string;               // 終了時刻
  duration?: number;              // 期間（ミリ秒）
  status: 'active' | 'completed' | 'failed';
  attributes?: Record<string, any>; // スパン属性
  events?: SpanEvent[];           // スパンイベント
}

interface SpanEvent {
  timestamp: string;              // イベントタイムスタンプ
  name: string;                   // イベント名
  attributes?: Record<string, any>;
}
```

### **TraceEvent** (トレースイベント構造)

```typescript
interface TraceEvent {
  eventId: string;                // イベントID
  timestamp: string;              // タイムスタンプ
  type: EventType;                // イベントタイプ
  severity: 'debug' | 'info' | 'warning' | 'error' | 'critical';
  message: string;                // イベントメッセージ
  source: string;                 // イベントソース
  metadata?: Record<string, any>;
}

type EventType = 'execution' | 'state_change' | 'error' | 'metric' | 'custom';
```

## 🚀 REST APIエンドポイント

### **POST /traces** - トレースを作成

新しいトレースを開始します。

```typescript
const traceController = new TraceController(traceManagementService);

const result = await traceController.createTrace({
  contextId: 'ctx-123',
  planId: 'plan-456',
  name: 'データ処理パイプライン実行',
  execution: {
    startTime: new Date().toISOString(),
    agentId: 'agent-789',
    environment: 'production'
  },
  metadata: {
    version: '2.0.0',
    deploymentId: 'deploy-001'
  },
  tags: ['data-processing', 'etl', 'production']
});

console.log('トレースが開始されました:', result.traceId);
```

**レスポンス**: `TraceResponseDto`

### **GET /traces/:id** - トレースを取得

IDでトレースを取得します。

```typescript
const trace = await traceController.getTrace('trace-123');
console.log('トレース:', trace.name);
console.log('期間:', trace.execution.duration, 'ms');
console.log('スパン数:', trace.spans.length);
```

**レスポンス**: `TraceResponseDto`

### **POST /traces/:id/spans** - スパンを追加

トレースに新しいスパンを追加します。

```typescript
const span = await traceController.addSpan('trace-123', {
  name: 'データベースクエリ',
  startTime: new Date().toISOString(),
  attributes: {
    query: 'SELECT * FROM users WHERE active = true',
    database: 'postgresql',
    table: 'users'
  }
});

console.log('スパンが追加されました:', span.spanId);
```

**レスポンス**: `Span`

### **POST /traces/:id/events** - イベントを記録

トレースにイベントを記録します。

```typescript
await traceController.recordEvent('trace-123', {
  type: 'metric',
  severity: 'info',
  message: 'データ処理が完了しました',
  source: 'data-processor',
  metadata: {
    recordsProcessed: 10000,
    processingTime: 5000
  }
});

console.log('イベントが記録されました');
```

**レスポンス**: `TraceEvent`

### **PUT /traces/:id/complete** - トレースを完了

トレースを完了としてマークします。

```typescript
const completed = await traceController.completeTrace('trace-123', {
  endTime: new Date().toISOString(),
  finalStatus: 'completed',
  performanceMetrics: {
    cpuUsage: 45.2,
    memoryUsage: 512,
    latency: 150,
    throughput: 2000
  }
});

console.log('トレースが完了しました:', completed.execution.duration, 'ms');
```

**レスポンス**: `TraceResponseDto`

### **GET /traces** - トレースを検索

フィルター条件でトレースを検索します。

```typescript
const results = await traceController.searchTraces({
  contextId: 'ctx-123',
  status: 'completed',
  startTimeFrom: '2025-09-01T00:00:00Z',
  startTimeTo: '2025-09-30T23:59:59Z',
  limit: 50
});

console.log(`${results.total}個のトレースが見つかりました`);
```

**レスポンス**: `{ items: TraceResponseDto[], total: number }`

## 📚 使用例

### **例1: 基本的なトレース**

```typescript
// トレースを開始
const trace = await traceController.createTrace({
  contextId: 'ctx-123',
  name: 'API リクエスト処理',
  execution: {
    startTime: new Date().toISOString(),
    agentId: 'api-gateway',
    environment: 'production'
  }
});

// スパンを追加
const authSpan = await traceController.addSpan(trace.traceId, {
  name: '認証',
  startTime: new Date().toISOString()
});

// スパンを完了
await traceController.completeSpan(trace.traceId, authSpan.spanId, {
  endTime: new Date().toISOString(),
  status: 'completed'
});

// トレースを完了
await traceController.completeTrace(trace.traceId, {
  endTime: new Date().toISOString(),
  finalStatus: 'completed'
});
```

### **例2: 分散トレース**

```typescript
// 親トレースを作成
const parentTrace = await traceController.createTrace({
  contextId: 'ctx-123',
  name: 'マイクロサービス調整',
  execution: {
    startTime: new Date().toISOString(),
    agentId: 'orchestrator',
    environment: 'production'
  }
});

// 子スパンを作成（サービスA）
const serviceASpan = await traceController.addSpan(parentTrace.traceId, {
  name: 'サービスA呼び出し',
  startTime: new Date().toISOString(),
  attributes: {
    service: 'service-a',
    endpoint: '/api/v1/process'
  }
});

// 子スパンを作成（サービスB）
const serviceBSpan = await traceController.addSpan(parentTrace.traceId, {
  name: 'サービスB呼び出し',
  startTime: new Date().toISOString(),
  attributes: {
    service: 'service-b',
    endpoint: '/api/v1/validate'
  }
});

// すべてのスパンを完了
await traceController.completeSpan(parentTrace.traceId, serviceASpan.spanId, {
  endTime: new Date().toISOString(),
  status: 'completed'
});

await traceController.completeSpan(parentTrace.traceId, serviceBSpan.spanId, {
  endTime: new Date().toISOString(),
  status: 'completed'
});

// 親トレースを完了
await traceController.completeTrace(parentTrace.traceId, {
  endTime: new Date().toISOString(),
  finalStatus: 'completed'
});
```

---

**APIバージョン**: 1.0.0-alpha  
**最終更新**: 2025年9月4日  
**ステータス**: エンタープライズグレード  
**テスト**: 107/107テスト合格 ✅

