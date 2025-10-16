# Network APIリファレンス

> **🌐 言語ナビゲーション**: [English](../../en/api-reference/network-api.md) | [中文](../../zh-CN/api-reference/network-api.md) | [日本語](network-api.md)



**分散通信とメッセージング - MPLP v1.0 Alpha**

[![API](https://img.shields.io/badge/api-Network%20Module-blue.svg)](../modules/network/README.md)
[![Schema](https://img.shields.io/badge/schema-mplp--network.json-green.svg)](../schemas/README.md)
[![Status](https://img.shields.io/badge/status-Enterprise%20Grade-green.svg)](../../../ALPHA-RELEASE-NOTES.md)
[![Tests](https://img.shields.io/badge/tests-190%2F190%20passing-green.svg)](../modules/network/testing-guide.md)
[![Language](https://img.shields.io/badge/language-日本語-blue.svg)](../../en/api-reference/network-api.md)

---

## 🎯 概要

Network APIは、マルチエージェントシステムのための包括的な分散通信とメッセージング機能を提供します。信頼性の高いメッセージ配信、ルーティング、ネットワークトポロジー管理、エンタープライズグレードの通信インフラストラクチャを可能にします。このAPIは、MPLP v1.0 Alphaの実際の実装に基づいています。

## 📦 インポート

```typescript
import { 
  NetworkController,
  NetworkManagementService,
  CreateNetworkDto,
  SendMessageDto,
  NetworkResponseDto
} from 'mplp/modules/network';

// またはモジュールインターフェースを使用
import { MPLP } from 'mplp';
const mplp = new MPLP();
const networkModule = mplp.getModule('network');
```

## 🏗️ コアインターフェース

### **NetworkResponseDto** (レスポンスインターフェース)

```typescript
interface NetworkResponseDto {
  // 基本プロトコルフィールド
  protocolVersion: string;        // プロトコルバージョン "1.0.0"
  timestamp: string;              // ISO 8601タイムスタンプ
  networkId: string;              // 一意のネットワーク識別子
  name: string;                   // ネットワーク名
  status: NetworkStatus;          // ネットワークステータス
  
  // トポロジー
  topology: {
    type: TopologyType;           // トポロジータイプ
    nodes: NetworkNode[];         // ネットワークノード
    connections: Connection[];    // 接続リスト
  };
  
  // ルーティング
  routing: {
    strategy: RoutingStrategy;    // ルーティング戦略
    tables: RoutingTable[];       // ルーティングテーブル
  };
  
  // メッセージング
  messaging: {
    protocol: MessagingProtocol;  // メッセージングプロトコル
    qos: QoSLevel;                // サービス品質レベル
    encryption: boolean;          // 暗号化有効
  };
  
  // パフォーマンスメトリクス
  metrics: {
    messagesSent: number;         // 送信メッセージ数
    messagesReceived: number;     // 受信メッセージ数
    averageLatency: number;       // 平均レイテンシ（ms）
    throughput: number;           // スループット（msg/sec）
    errorRate: number;            // エラー率
  };
  
  // メタデータ
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

// ステータス列挙型
type NetworkStatus = 'initializing' | 'active' | 'degraded' | 'offline';
type TopologyType = 'mesh' | 'star' | 'ring' | 'tree' | 'hybrid';
type RoutingStrategy = 'direct' | 'broadcast' | 'multicast' | 'intelligent';
type MessagingProtocol = 'http' | 'websocket' | 'grpc' | 'mqtt' | 'amqp';
type QoSLevel = 'at-most-once' | 'at-least-once' | 'exactly-once';
```

### **NetworkNode** (ネットワークノード構造)

```typescript
interface NetworkNode {
  nodeId: string;                 // ノードID
  agentId: string;                // 関連するエージェントID
  address: string;                // ネットワークアドレス
  port: number;                   // ポート番号
  status: NodeStatus;             // ノードステータス
  capabilities: string[];         // ノード機能
  metadata?: Record<string, any>;
}

type NodeStatus = 'online' | 'offline' | 'connecting' | 'error';
```

### **Message** (メッセージ構造)

```typescript
interface Message {
  messageId: string;              // メッセージID
  timestamp: string;              // タイムスタンプ
  sender: string;                 // 送信者ノードID
  recipients: string[];           // 受信者ノードID
  
  // メッセージ内容
  type: MessageType;              // メッセージタイプ
  payload: any;                   // ペイロード
  headers?: Record<string, string>; // ヘッダー
  
  // 配信設定
  priority: Priority;             // 優先度
  ttl?: number;                   // 生存時間（秒）
  qos: QoSLevel;                  // サービス品質
  
  // ルーティング
  route?: string[];               // ルート（ノードID）
  hops: number;                   // ホップ数
  
  // ステータス
  status: MessageStatus;          // メッセージステータス
  deliveryStatus?: DeliveryStatus[]; // 配信ステータス
}

type MessageType = 'request' | 'response' | 'event' | 'command' | 'notification';
type MessageStatus = 'pending' | 'sent' | 'delivered' | 'failed' | 'expired';
type Priority = 'low' | 'medium' | 'high' | 'critical';
```

## 🚀 REST APIエンドポイント

### **POST /networks** - ネットワークを作成

新しいネットワークを作成します。

```typescript
const networkController = new NetworkController(networkManagementService);

const result = await networkController.createNetwork({
  name: 'マルチエージェント通信ネットワーク',
  topology: {
    type: 'mesh',
    nodes: [
      {
        nodeId: 'node-001',
        agentId: 'agent-001',
        address: '192.168.1.10',
        port: 8080,
        capabilities: ['messaging', 'routing']
      },
      {
        nodeId: 'node-002',
        agentId: 'agent-002',
        address: '192.168.1.11',
        port: 8080,
        capabilities: ['messaging']
      },
      {
        nodeId: 'node-003',
        agentId: 'agent-003',
        address: '192.168.1.12',
        port: 8080,
        capabilities: ['messaging', 'gateway']
      }
    ]
  },
  routing: {
    strategy: 'intelligent'
  },
  messaging: {
    protocol: 'websocket',
    qos: 'at-least-once',
    encryption: true
  }
});

console.log('ネットワークが作成されました:', result.networkId);
```

**レスポンス**: `NetworkResponseDto`

### **GET /networks/:id** - ネットワークを取得

IDでネットワークを取得します。

```typescript
const network = await networkController.getNetwork('network-123');
console.log('ネットワーク:', network.name);
console.log('ノード数:', network.topology.nodes.length);
console.log('平均レイテンシ:', network.metrics.averageLatency, 'ms');
```

**レスポンス**: `NetworkResponseDto`

### **POST /networks/:id/messages** - メッセージを送信

ネットワーク経由でメッセージを送信します。

```typescript
const message = await networkController.sendMessage('network-123', {
  sender: 'node-001',
  recipients: ['node-002', 'node-003'],
  type: 'request',
  payload: {
    action: 'process_data',
    data: { records: 1000 }
  },
  priority: 'high',
  qos: 'at-least-once',
  ttl: 300 // 5分
});

console.log('メッセージが送信されました:', message.messageId);
```

**レスポンス**: `Message`

### **GET /networks/:id/messages/:messageId** - メッセージを取得

メッセージとその配信ステータスを取得します。

```typescript
const message = await networkController.getMessage('network-123', 'msg-456');
console.log('メッセージステータス:', message.status);
console.log('配信ステータス:', message.deliveryStatus);
```

**レスポンス**: `Message`

### **POST /networks/:id/nodes** - ノードを追加

ネットワークに新しいノードを追加します。

```typescript
const node = await networkController.addNode('network-123', {
  nodeId: 'node-004',
  agentId: 'agent-004',
  address: '192.168.1.13',
  port: 8080,
  capabilities: ['messaging', 'processing']
});

console.log('ノードが追加されました:', node.nodeId);
```

**レスポンス**: `NetworkNode`

### **DELETE /networks/:id/nodes/:nodeId** - ノードを削除

ネットワークからノードを削除します。

```typescript
await networkController.removeNode('network-123', 'node-004');
console.log('ノードが削除されました');
```

**レスポンス**: `void`

## 📚 使用例

### **例1: ポイントツーポイント通信**

```typescript
// ネットワークを作成
const network = await networkController.createNetwork({
  name: 'P2P通信',
  topology: { type: 'mesh', nodes: [] },
  routing: { strategy: 'direct' },
  messaging: { protocol: 'websocket', qos: 'exactly-once', encryption: true }
});

// ノードを追加
await networkController.addNode(network.networkId, {
  nodeId: 'sender',
  agentId: 'agent-sender',
  address: '192.168.1.10',
  port: 8080
});

await networkController.addNode(network.networkId, {
  nodeId: 'receiver',
  agentId: 'agent-receiver',
  address: '192.168.1.11',
  port: 8080
});

// メッセージを送信
const message = await networkController.sendMessage(network.networkId, {
  sender: 'sender',
  recipients: ['receiver'],
  type: 'request',
  payload: { message: 'Hello, Agent!' },
  priority: 'medium',
  qos: 'exactly-once'
});

console.log('メッセージが送信されました:', message.messageId);
```

### **例2: ブロードキャスト通信**

```typescript
// メッシュネットワークを作成
const network = await networkController.createNetwork({
  name: 'ブロードキャストネットワーク',
  topology: { type: 'mesh', nodes: [] },
  routing: { strategy: 'broadcast' }
});

// 複数のノードを追加
const nodeIds = [];
for (let i = 1; i <= 5; i++) {
  const node = await networkController.addNode(network.networkId, {
    nodeId: `node-${i}`,
    agentId: `agent-${i}`,
    address: `192.168.1.${10 + i}`,
    port: 8080
  });
  nodeIds.push(node.nodeId);
}

// すべてのノードにブロードキャスト
const message = await networkController.sendMessage(network.networkId, {
  sender: 'node-1',
  recipients: nodeIds.slice(1), // node-2からnode-5
  type: 'notification',
  payload: { event: 'system_update', version: '2.0.0' },
  priority: 'high',
  qos: 'at-least-once'
});

console.log('ブロードキャストメッセージが送信されました');
```

---

**APIバージョン**: 1.0.0-alpha  
**最終更新**: 2025年9月4日  
**ステータス**: エンタープライズグレード  
**テスト**: 190/190テスト合格 ✅

