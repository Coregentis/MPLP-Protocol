# Core APIリファレンス

> **🌐 言語ナビゲーション**: [English](../../en/api-reference/core-api.md) | [中文](../../zh-CN/api-reference/core-api.md) | [日本語](core-api.md)



**中央オーケストレーションとシステム管理 - MPLP v1.0 Alpha**

[![API](https://img.shields.io/badge/api-Core%20Module-blue.svg)](../modules/core/README.md)
[![Schema](https://img.shields.io/badge/schema-mplp--core.json-green.svg)](../schemas/README.md)
[![Status](https://img.shields.io/badge/status-Enterprise%20Grade-green.svg)](../../../ALPHA-RELEASE-NOTES.md)
[![Tests](https://img.shields.io/badge/tests-584%2F584%20passing-green.svg)](../modules/core/testing-guide.md)
[![Language](https://img.shields.io/badge/language-日本語-blue.svg)](../../en/api-reference/core-api.md)

---

## 🎯 概要

Core APIは、MPLPシステムの中央オーケストレーションとシステム管理機能を提供します。すべてのモジュールの調整、ライフサイクル管理、リソース管理、エンタープライズグレードのシステム制御を可能にします。このAPIは、MPLP v1.0 Alphaの実際の実装に基づいています。

## 📦 インポート

```typescript
import { 
  CoreOrchestrator,
  SystemManagementService,
  InitializeSystemDto,
  SystemStatusDto,
  ModuleConfigDto
} from 'mplp/modules/core';

// またはモジュールインターフェースを使用
import { MPLP } from 'mplp';
const mplp = new MPLP();
const coreModule = mplp.getModule('core');
```

## 🏗️ コアインターフェース

### **SystemStatusDto** (システムステータスインターフェース)

```typescript
interface SystemStatusDto {
  // 基本プロトコルフィールド
  protocolVersion: string;        // プロトコルバージョン "1.0.0"
  timestamp: string;              // ISO 8601タイムスタンプ
  systemId: string;               // システムID
  status: SystemStatus;           // システムステータス
  
  // モジュールステータス
  modules: {
    context: ModuleStatus;        // Contextモジュール
    plan: ModuleStatus;           // Planモジュール
    role: ModuleStatus;           // Roleモジュール
    confirm: ModuleStatus;        // Confirmモジュール
    trace: ModuleStatus;          // Traceモジュール
    extension: ModuleStatus;      // Extensionモジュール
    dialog: ModuleStatus;         // Dialogモジュール
    collab: ModuleStatus;         // Collabモジュール
    network: ModuleStatus;        // Networkモジュール
  };
  
  // リソース使用状況
  resources: {
    cpu: ResourceMetrics;         // CPU使用状況
    memory: ResourceMetrics;      // メモリ使用状況
    disk: ResourceMetrics;        // ディスク使用状況
    network: ResourceMetrics;     // ネットワーク使用状況
  };
  
  // パフォーマンスメトリクス
  performance: {
    uptime: number;               // 稼働時間（秒）
    requestsPerSecond: number;    // リクエスト/秒
    averageResponseTime: number;  // 平均応答時間（ms）
    errorRate: number;            // エラー率
  };
  
  // ヘルスチェック
  health: {
    overall: HealthStatus;        // 全体的な健全性
    checks: HealthCheck[];        // 個別ヘルスチェック
  };
}

// ステータス列挙型
type SystemStatus = 'initializing' | 'running' | 'degraded' | 'maintenance' | 'shutdown';
type HealthStatus = 'healthy' | 'degraded' | 'unhealthy';
```

### **ModuleStatus** (モジュールステータス構造)

```typescript
interface ModuleStatus {
  moduleId: string;               // モジュールID
  name: string;                   // モジュール名
  version: string;                // モジュールバージョン
  status: 'active' | 'inactive' | 'error' | 'initializing';
  health: HealthStatus;           // 健全性ステータス
  
  // パフォーマンス
  metrics: {
    requestCount: number;         // リクエスト数
    errorCount: number;           // エラー数
    averageLatency: number;       // 平均レイテンシ（ms）
  };
  
  // 依存関係
  dependencies: {
    moduleId: string;             // 依存モジュールID
    status: 'satisfied' | 'missing' | 'error';
  }[];
  
  // 設定
  configuration: Record<string, any>;
}
```

### **ResourceMetrics** (リソースメトリクス構造)

```typescript
interface ResourceMetrics {
  current: number;                // 現在の使用量
  maximum: number;                // 最大容量
  percentage: number;             // 使用率（%）
  trend: 'increasing' | 'stable' | 'decreasing';
  alerts?: Alert[];               // アラート
}

interface Alert {
  alertId: string;                // アラートID
  severity: 'info' | 'warning' | 'critical';
  message: string;                // アラートメッセージ
  timestamp: string;              // タイムスタンプ
}
```

## 🚀 REST APIエンドポイント

### **POST /system/initialize** - システムを初期化

MPLPシステムを初期化します。

```typescript
const coreOrchestrator = new CoreOrchestrator(systemManagementService);

const result = await coreOrchestrator.initializeSystem({
  systemId: 'mplp-system-001',
  environment: 'production',
  modules: {
    context: { enabled: true, config: {} },
    plan: { enabled: true, config: {} },
    role: { enabled: true, config: {} },
    confirm: { enabled: true, config: {} },
    trace: { enabled: true, config: {} },
    extension: { enabled: true, config: {} },
    dialog: { enabled: true, config: {} },
    collab: { enabled: true, config: {} },
    network: { enabled: true, config: {} }
  },
  resources: {
    maxCpuUsage: 80,              // 最大CPU使用率（%）
    maxMemoryUsage: 4096,         // 最大メモリ使用量（MB）
    maxDiskUsage: 10240           // 最大ディスク使用量（MB）
  }
});

console.log('システムが初期化されました:', result.systemId);
```

**レスポンス**: `SystemStatusDto`

### **GET /system/status** - システムステータスを取得

現在のシステムステータスを取得します。

```typescript
const status = await coreOrchestrator.getSystemStatus();
console.log('システムステータス:', status.status);
console.log('稼働時間:', status.performance.uptime, '秒');
console.log('全体的な健全性:', status.health.overall);
```

**レスポンス**: `SystemStatusDto`

### **GET /system/modules/:moduleId** - モジュールステータスを取得

特定のモジュールのステータスを取得します。

```typescript
const moduleStatus = await coreOrchestrator.getModuleStatus('context');
console.log('Contextモジュール:', moduleStatus.status);
console.log('リクエスト数:', moduleStatus.metrics.requestCount);
console.log('平均レイテンシ:', moduleStatus.metrics.averageLatency, 'ms');
```

**レスポンス**: `ModuleStatus`

### **POST /system/modules/:moduleId/restart** - モジュールを再起動

特定のモジュールを再起動します。

```typescript
await coreOrchestrator.restartModule('plan');
console.log('Planモジュールが再起動されました');
```

**レスポンス**: `ModuleStatus`

### **GET /system/health** - ヘルスチェックを実行

システム全体のヘルスチェックを実行します。

```typescript
const health = await coreOrchestrator.performHealthCheck();
console.log('全体的な健全性:', health.overall);
console.log('チェック結果:');
health.checks.forEach(check => {
  console.log(`  ${check.name}: ${check.status}`);
});
```

**レスポンス**: `HealthCheckResult`

### **GET /system/metrics** - メトリクスを取得

システムパフォーマンスメトリクスを取得します。

```typescript
const metrics = await coreOrchestrator.getMetrics({
  timeRange: 'last-hour',
  granularity: 'minute'
});

console.log('平均応答時間:', metrics.averageResponseTime, 'ms');
console.log('リクエスト/秒:', metrics.requestsPerSecond);
console.log('エラー率:', metrics.errorRate, '%');
```

**レスポンス**: `MetricsData`

### **POST /system/shutdown** - システムをシャットダウン

システムを正常にシャットダウンします。

```typescript
await coreOrchestrator.shutdownSystem({
  graceful: true,
  timeout: 30000 // 30秒
});

console.log('システムがシャットダウンされました');
```

**レスポンス**: `ShutdownResult`

## 📚 使用例

### **例1: システム初期化と監視**

```typescript
// システムを初期化
const system = await coreOrchestrator.initializeSystem({
  systemId: 'mplp-prod-001',
  environment: 'production',
  modules: {
    context: { enabled: true },
    plan: { enabled: true },
    role: { enabled: true },
    confirm: { enabled: true },
    trace: { enabled: true },
    extension: { enabled: true },
    dialog: { enabled: true },
    collab: { enabled: true },
    network: { enabled: true }
  }
});

// システムステータスを定期的に監視
setInterval(async () => {
  const status = await coreOrchestrator.getSystemStatus();
  
  if (status.health.overall !== 'healthy') {
    console.warn('システムの健全性が低下しています:', status.health.overall);
    
    // 問題のあるモジュールを特定
    for (const [moduleName, moduleStatus] of Object.entries(status.modules)) {
      if (moduleStatus.health !== 'healthy') {
        console.warn(`  ${moduleName}モジュール: ${moduleStatus.health}`);
        
        // 必要に応じてモジュールを再起動
        if (moduleStatus.status === 'error') {
          await coreOrchestrator.restartModule(moduleName);
          console.log(`  ${moduleName}モジュールを再起動しました`);
        }
      }
    }
  }
}, 60000); // 1分ごと
```

### **例2: リソース管理**

```typescript
// システムステータスを取得
const status = await coreOrchestrator.getSystemStatus();

// リソース使用状況をチェック
if (status.resources.cpu.percentage > 80) {
  console.warn('CPU使用率が高い:', status.resources.cpu.percentage, '%');
  
  // 負荷の高いモジュールを特定
  const modules = Object.entries(status.modules)
    .sort((a, b) => b[1].metrics.requestCount - a[1].metrics.requestCount);
  
  console.log('最も負荷の高いモジュール:');
  modules.slice(0, 3).forEach(([name, module]) => {
    console.log(`  ${name}: ${module.metrics.requestCount}リクエスト`);
  });
}

if (status.resources.memory.percentage > 90) {
  console.error('メモリ使用率が危険なレベル:', status.resources.memory.percentage, '%');
  
  // メモリクリーンアップをトリガー
  await coreOrchestrator.triggerMemoryCleanup();
  console.log('メモリクリーンアップを実行しました');
}
```

### **例3: モジュール間調整**

```typescript
// すべてのモジュールのステータスを取得
const status = await coreOrchestrator.getSystemStatus();

// モジュール間の依存関係をチェック
for (const [moduleName, moduleStatus] of Object.entries(status.modules)) {
  console.log(`${moduleName}モジュール:`);
  
  for (const dep of moduleStatus.dependencies) {
    if (dep.status !== 'satisfied') {
      console.warn(`  依存関係の問題: ${dep.moduleId} - ${dep.status}`);
    }
  }
}

// 特定のモジュール間でイベントを調整
await coreOrchestrator.coordinateModules({
  sourceModule: 'context',
  targetModule: 'plan',
  event: 'context_updated',
  payload: { contextId: 'ctx-123' }
});

console.log('モジュール間調整が完了しました');
```

---

**APIバージョン**: 1.0.0-alpha  
**最終更新**: 2025年9月4日  
**ステータス**: エンタープライズグレード  
**テスト**: 584/584テスト合格 ✅

