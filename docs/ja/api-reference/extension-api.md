# Extension APIリファレンス

> **🌐 言語ナビゲーション**: [English](../../en/api-reference/extension-api.md) | [中文](../../zh-CN/api-reference/extension-api.md) | [日本語](extension-api.md)



**プラグイン可能な拡張機能とモジュール管理 - MPLP v1.0 Alpha**

[![API](https://img.shields.io/badge/api-Extension%20Module-blue.svg)](../modules/extension/README.md)
[![Schema](https://img.shields.io/badge/schema-mplp--extension.json-green.svg)](../schemas/README.md)
[![Status](https://img.shields.io/badge/status-Enterprise%20Grade-green.svg)](../../../ALPHA-RELEASE-NOTES.md)
[![Tests](https://img.shields.io/badge/tests-92%2F92%20passing-green.svg)](../modules/extension/testing-guide.md)
[![Language](https://img.shields.io/badge/language-日本語-blue.svg)](../../en/api-reference/extension-api.md)

---

## 🎯 概要

Extension APIは、マルチエージェントシステムのための包括的な拡張機能とモジュール管理を提供します。プラグイン可能なアーキテクチャ、動的ロード、ライフサイクル管理、エンタープライズグレードの拡張機能エコシステムを可能にします。このAPIは、MPLP v1.0 Alphaの実際の実装に基づいています。

## 📦 インポート

```typescript
import { 
  ExtensionController,
  ExtensionManagementService,
  CreateExtensionDto,
  UpdateExtensionDto,
  ExtensionResponseDto
} from 'mplp/modules/extension';

// またはモジュールインターフェースを使用
import { MPLP } from 'mplp';
const mplp = new MPLP();
const extensionModule = mplp.getModule('extension');
```

## 🏗️ コアインターフェース

### **ExtensionResponseDto** (レスポンスインターフェース)

```typescript
interface ExtensionResponseDto {
  // 基本プロトコルフィールド
  protocolVersion: string;        // プロトコルバージョン "1.0.0"
  timestamp: string;              // ISO 8601タイムスタンプ
  extensionId: string;            // 一意の拡張機能識別子
  name: string;                   // 拡張機能名
  version: string;                // 拡張機能バージョン
  description?: string;           // 拡張機能説明
  status: ExtensionStatus;        // 拡張機能ステータス
  
  // 拡張機能メタデータ
  metadata: {
    author: string;               // 作成者
    license: string;              // ライセンス
    homepage?: string;            // ホームページURL
    repository?: string;          // リポジトリURL
    tags?: string[];              // タグ
  };
  
  // 機能と依存関係
  capabilities: Capability[];     // 提供される機能
  dependencies: Dependency[];     // 依存関係
  hooks: Hook[];                  // フック登録
  
  // ライフサイクル
  lifecycle: {
    installedAt: string;          // インストール時刻
    activatedAt?: string;         // アクティベーション時刻
    lastUpdated?: string;         // 最終更新時刻
    loadOrder: number;            // ロード順序
  };
  
  // 設定とリソース
  configuration: Record<string, any>; // 拡張機能設定
  resources: ResourceUsage;       // リソース使用状況
  
  // エンタープライズ機能
  auditTrail: AuditTrail;
  securityPolicy: SecurityPolicy;
}

// ステータス列挙型
type ExtensionStatus = 'installed' | 'active' | 'inactive' | 'error' | 'updating';
```

### **Capability** (機能構造)

```typescript
interface Capability {
  capabilityId: string;           // 機能ID
  name: string;                   // 機能名
  type: CapabilityType;           // 機能タイプ
  description?: string;           // 機能説明
  api: {
    methods: Method[];            // 提供されるメソッド
    events: Event[];              // 発行されるイベント
  };
}

type CapabilityType = 'service' | 'middleware' | 'transformer' | 'validator' | 'custom';

interface Method {
  name: string;                   // メソッド名
  signature: string;              // メソッドシグネチャ
  description?: string;           // メソッド説明
}
```

### **Hook** (フック構造)

```typescript
interface Hook {
  hookId: string;                 // フックID
  hookPoint: string;              // フックポイント
  priority: number;               // 優先度（低い値が先に実行）
  handler: string;                // ハンドラー関数名
  conditions?: Condition[];       // 実行条件
}

interface Condition {
  type: string;                   // 条件タイプ
  operator: string;               // 演算子
  value: any;                     // 条件値
}
```

## 🚀 REST APIエンドポイント

### **POST /extensions** - 拡張機能をインストール

新しい拡張機能をインストールします。

```typescript
const extensionController = new ExtensionController(extensionManagementService);

const result = await extensionController.installExtension({
  name: 'データ検証拡張機能',
  version: '1.0.0',
  description: '高度なデータ検証機能',
  metadata: {
    author: 'MPLP Team',
    license: 'MIT',
    repository: 'https://github.com/mplp/data-validator'
  },
  capabilities: [
    {
      capabilityId: 'cap-001',
      name: 'データ検証',
      type: 'validator',
      api: {
        methods: [
          {
            name: 'validateSchema',
            signature: '(data: any, schema: Schema) => ValidationResult'
          },
          {
            name: 'validateBusinessRules',
            signature: '(data: any, rules: Rule[]) => ValidationResult'
          }
        ],
        events: [
          { name: 'validation:success', payload: 'ValidationResult' },
          { name: 'validation:error', payload: 'ValidationError' }
        ]
      }
    }
  ],
  hooks: [
    {
      hookId: 'hook-001',
      hookPoint: 'before:plan:execute',
      priority: 10,
      handler: 'validatePlanData'
    }
  ],
  configuration: {
    strictMode: true,
    maxErrors: 10,
    customRules: []
  }
});

console.log('拡張機能がインストールされました:', result.extensionId);
```

**レスポンス**: `ExtensionResponseDto`

### **GET /extensions/:id** - 拡張機能を取得

IDで拡張機能を取得します。

```typescript
const extension = await extensionController.getExtension('ext-123');
console.log('拡張機能:', extension.name);
console.log('ステータス:', extension.status);
console.log('機能数:', extension.capabilities.length);
```

**レスポンス**: `ExtensionResponseDto`

### **POST /extensions/:id/activate** - 拡張機能をアクティベート

拡張機能をアクティベートします。

```typescript
const activated = await extensionController.activateExtension('ext-123');
console.log('拡張機能がアクティベートされました:', activated.lifecycle.activatedAt);
```

**レスポンス**: `ExtensionResponseDto`

### **POST /extensions/:id/deactivate** - 拡張機能を非アクティベート

拡張機能を非アクティベートします。

```typescript
await extensionController.deactivateExtension('ext-123');
console.log('拡張機能が非アクティベートされました');
```

**レスポンス**: `ExtensionResponseDto`

### **DELETE /extensions/:id** - 拡張機能をアンインストール

拡張機能をアンインストールします。

```typescript
await extensionController.uninstallExtension('ext-123');
console.log('拡張機能がアンインストールされました');
```

**レスポンス**: `void`

### **GET /extensions** - 拡張機能を検索

フィルター条件で拡張機能を検索します。

```typescript
const results = await extensionController.searchExtensions({
  status: 'active',
  capabilityType: 'validator',
  limit: 20
});

console.log(`${results.total}個のアクティブな検証拡張機能が見つかりました`);
```

**レスポンス**: `{ items: ExtensionResponseDto[], total: number }`

## 📚 使用例

### **例1: カスタム拡張機能の作成**

```typescript
// カスタム拡張機能をインストール
const extension = await extensionController.installExtension({
  name: 'カスタムロギング',
  version: '1.0.0',
  capabilities: [
    {
      capabilityId: 'logging',
      name: 'カスタムロギング',
      type: 'service',
      api: {
        methods: [
          { name: 'log', signature: '(level: string, message: string) => void' },
          { name: 'flush', signature: '() => Promise<void>' }
        ],
        events: []
      }
    }
  ],
  hooks: [
    {
      hookId: 'log-hook',
      hookPoint: 'after:*',
      priority: 100,
      handler: 'logOperation'
    }
  ]
});

// 拡張機能をアクティベート
await extensionController.activateExtension(extension.extensionId);

console.log('カスタムロギング拡張機能が準備完了');
```

### **例2: 拡張機能のライフサイクル管理**

```typescript
// すべての拡張機能を取得
const extensions = await extensionController.searchExtensions({});

// 各拡張機能のステータスをチェック
for (const ext of extensions.items) {
  console.log(`${ext.name}: ${ext.status}`);
  
  if (ext.status === 'error') {
    // エラー状態の拡張機能を再起動
    await extensionController.deactivateExtension(ext.extensionId);
    await extensionController.activateExtension(ext.extensionId);
    console.log(`${ext.name}が再起動されました`);
  }
}
```

---

**APIバージョン**: 1.0.0-alpha  
**最終更新**: 2025年9月4日  
**ステータス**: エンタープライズグレード  
**テスト**: 92/92テスト合格 ✅

