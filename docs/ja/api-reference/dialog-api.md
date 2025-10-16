# Dialog APIリファレンス

> **🌐 言語ナビゲーション**: [English](../../en/api-reference/dialog-api.md) | [中文](../../zh-CN/api-reference/dialog-api.md) | [日本語](dialog-api.md)



**インテリジェント対話管理とコンテキスト認識 - MPLP v1.0 Alpha**

[![API](https://img.shields.io/badge/api-Dialog%20Module-blue.svg)](../modules/dialog/README.md)
[![Schema](https://img.shields.io/badge/schema-mplp--dialog.json-green.svg)](../schemas/README.md)
[![Status](https://img.shields.io/badge/status-Enterprise%20Grade-green.svg)](../../../ALPHA-RELEASE-NOTES.md)
[![Tests](https://img.shields.io/badge/tests-121%2F121%20passing-green.svg)](../modules/dialog/testing-guide.md)
[![Language](https://img.shields.io/badge/language-日本語-blue.svg)](../../en/api-reference/dialog-api.md)

---

## 🎯 概要

Dialog APIは、マルチエージェントシステムのための包括的な対話管理機能を提供します。インテリジェントな会話フロー、コンテキスト認識、マルチターン対話、エンタープライズグレードの対話管理を可能にします。このAPIは、MPLP v1.0 Alphaの実際の実装に基づいています。

## 📦 インポート

```typescript
import { 
  DialogController,
  DialogManagementService,
  CreateDialogDto,
  UpdateDialogDto,
  DialogResponseDto
} from 'mplp/modules/dialog';

// またはモジュールインターフェースを使用
import { MPLP } from 'mplp';
const mplp = new MPLP();
const dialogModule = mplp.getModule('dialog');
```

## 🏗️ コアインターフェース

### **DialogResponseDto** (レスポンスインターフェース)

```typescript
interface DialogResponseDto {
  // 基本プロトコルフィールド
  protocolVersion: string;        // プロトコルバージョン "1.0.0"
  timestamp: string;              // ISO 8601タイムスタンプ
  dialogId: string;               // 一意の対話識別子
  contextId: string;              // 関連するコンテキストID
  sessionId: string;              // セッションID
  status: DialogStatus;           // 対話ステータス
  
  // 参加者情報
  participants: Participant[];    // 参加者リスト
  
  // 対話履歴
  turns: DialogTurn[];            // 対話ターンリスト
  currentTurn: number;            // 現在のターン番号
  
  // コンテキストと状態
  dialogContext: {
    intent: string;               // 現在のインテント
    entities: Entity[];           // 抽出されたエンティティ
    sentiment?: string;           // センチメント
    confidence: number;           // 信頼度スコア
  };
  
  // 対話管理
  flowControl: {
    currentNode: string;          // 現在のフローノード
    availableActions: Action[];   // 利用可能なアクション
    nextSteps: string[];          // 次のステップ候補
  };
  
  // メタデータ
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

// ステータス列挙型
type DialogStatus = 'active' | 'paused' | 'completed' | 'abandoned';
```

### **DialogTurn** (対話ターン構造)

```typescript
interface DialogTurn {
  turnId: string;                 // ターンID
  turnNumber: number;             // ターン番号
  timestamp: string;              // タイムスタンプ
  speaker: string;                // 発話者ID
  speakerType: 'user' | 'agent' | 'system';
  
  // メッセージ内容
  message: {
    text: string;                 // テキストメッセージ
    type: MessageType;            // メッセージタイプ
    format?: string;              // フォーマット（markdown, html等）
    attachments?: Attachment[];   // 添付ファイル
  };
  
  // 理解と処理
  understanding: {
    intent: string;               // 認識されたインテント
    entities: Entity[];           // 抽出されたエンティティ
    confidence: number;           // 信頼度
    alternatives?: Alternative[]; // 代替解釈
  };
  
  // 応答生成
  response?: {
    text: string;                 // 応答テキスト
    suggestions?: string[];       // 提案
    actions?: Action[];           // アクション
  };
}

type MessageType = 'text' | 'command' | 'query' | 'response' | 'notification';
```

### **Entity** (エンティティ構造)

```typescript
interface Entity {
  entityId: string;               // エンティティID
  type: string;                   // エンティティタイプ
  value: any;                     // エンティティ値
  confidence: number;             // 信頼度
  source: string;                 // ソース（テキスト内の位置等）
  metadata?: Record<string, any>;
}
```

## 🚀 REST APIエンドポイント

### **POST /dialogs** - 対話を作成

新しい対話セッションを作成します。

```typescript
const dialogController = new DialogController(dialogManagementService);

const result = await dialogController.createDialog({
  contextId: 'ctx-123',
  sessionId: 'session-456',
  participants: [
    {
      participantId: 'user-001',
      participantType: 'user',
      role: 'customer',
      name: '田中太郎'
    },
    {
      participantId: 'agent-001',
      participantType: 'agent',
      role: 'assistant',
      name: 'サポートエージェント'
    }
  ],
  initialContext: {
    intent: 'customer_support',
    entities: [],
    confidence: 1.0
  },
  metadata: {
    channel: 'web-chat',
    language: 'ja'
  }
});

console.log('対話が作成されました:', result.dialogId);
```

**レスポンス**: `DialogResponseDto`

### **GET /dialogs/:id** - 対話を取得

IDで対話を取得します。

```typescript
const dialog = await dialogController.getDialog('dialog-123');
console.log('対話:', dialog.dialogId);
console.log('ターン数:', dialog.turns.length);
console.log('現在のインテント:', dialog.dialogContext.intent);
```

**レスポンス**: `DialogResponseDto`

### **POST /dialogs/:id/turns** - ターンを追加

対話に新しいターンを追加します。

```typescript
const turn = await dialogController.addTurn('dialog-123', {
  speaker: 'user-001',
  speakerType: 'user',
  message: {
    text: '注文の配送状況を確認したいです',
    type: 'query'
  }
});

console.log('ターンが追加されました:', turn.turnId);
console.log('認識されたインテント:', turn.understanding.intent);
```

**レスポンス**: `DialogTurn`

### **POST /dialogs/:id/respond** - 応答を生成

エージェントの応答を生成します。

```typescript
const response = await dialogController.generateResponse('dialog-123', {
  turnId: 'turn-001',
  responseStrategy: 'informative',
  includeActions: true
});

console.log('応答:', response.text);
console.log('提案:', response.suggestions);
```

**レスポンス**: `Response`

### **PUT /dialogs/:id/context** - コンテキストを更新

対話コンテキストを更新します。

```typescript
await dialogController.updateContext('dialog-123', {
  intent: 'order_tracking',
  entities: [
    {
      entityId: 'entity-001',
      type: 'order_id',
      value: 'ORD-12345',
      confidence: 0.95,
      source: 'user_input'
    }
  ]
});

console.log('コンテキストが更新されました');
```

**レスポンス**: `DialogResponseDto`

## 📚 使用例

### **例1: カスタマーサポート対話**

```typescript
// 対話を作成
const dialog = await dialogController.createDialog({
  contextId: 'ctx-support',
  sessionId: 'session-001',
  participants: [
    { participantId: 'customer-001', participantType: 'user', role: 'customer' },
    { participantId: 'support-agent', participantType: 'agent', role: 'assistant' }
  ]
});

// ユーザーメッセージを追加
const userTurn = await dialogController.addTurn(dialog.dialogId, {
  speaker: 'customer-001',
  speakerType: 'user',
  message: {
    text: '商品が届きません',
    type: 'query'
  }
});

// エージェント応答を生成
const agentResponse = await dialogController.generateResponse(dialog.dialogId, {
  turnId: userTurn.turnId,
  responseStrategy: 'empathetic'
});

// エージェント応答を追加
await dialogController.addTurn(dialog.dialogId, {
  speaker: 'support-agent',
  speakerType: 'agent',
  message: {
    text: agentResponse.text,
    type: 'response'
  }
});
```

### **例2: マルチターン対話フロー**

```typescript
// 対話を作成
const dialog = await dialogController.createDialog({
  contextId: 'ctx-booking',
  sessionId: 'session-002',
  participants: [
    { participantId: 'user-002', participantType: 'user', role: 'customer' }
  ]
});

// ターン1: 予約リクエスト
await dialogController.addTurn(dialog.dialogId, {
  speaker: 'user-002',
  speakerType: 'user',
  message: { text: 'レストランを予約したいです', type: 'query' }
});

// ターン2: 日時確認
await dialogController.addTurn(dialog.dialogId, {
  speaker: 'system',
  speakerType: 'system',
  message: { text: 'ご希望の日時を教えてください', type: 'query' }
});

// ターン3: 日時提供
await dialogController.addTurn(dialog.dialogId, {
  speaker: 'user-002',
  speakerType: 'user',
  message: { text: '明日の19時でお願いします', type: 'response' }
});

// ターン4: 人数確認
await dialogController.addTurn(dialog.dialogId, {
  speaker: 'system',
  speakerType: 'system',
  message: { text: '何名様ですか？', type: 'query' }
});

// 対話フローを完了
await dialogController.updateDialog(dialog.dialogId, {
  status: 'completed'
});
```

---

**APIバージョン**: 1.0.0-alpha  
**最終更新**: 2025年9月4日  
**ステータス**: エンタープライズグレード  
**テスト**: 121/121テスト合格 ✅

