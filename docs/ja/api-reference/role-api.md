# Role APIリファレンス

> **🌐 言語ナビゲーション**: [English](../../en/api-reference/role-api.md) | [中文](../../zh-CN/api-reference/role-api.md) | [日本語](role-api.md)



**ロールベースアクセス制御と機能管理 - MPLP v1.0 Alpha**

[![API](https://img.shields.io/badge/api-Role%20Module-blue.svg)](../modules/role/README.md)
[![Schema](https://img.shields.io/badge/schema-mplp--role.json-green.svg)](../schemas/README.md)
[![Status](https://img.shields.io/badge/status-Enterprise%20Grade-green.svg)](../../../ALPHA-RELEASE-NOTES.md)
[![Tests](https://img.shields.io/badge/tests-323%2F323%20passing-green.svg)](../modules/role/testing-guide.md)
[![Language](https://img.shields.io/badge/language-日本語-blue.svg)](../../en/api-reference/role-api.md)

---

## 🎯 概要

Role APIは、マルチエージェントシステムのための包括的なロールベースアクセス制御（RBAC）と機能管理を提供します。きめ細かい権限制御、ロール継承、委任管理、エンタープライズグレードのセキュリティ機能を可能にします。このAPIは、MPLP v1.0 Alphaの実際の実装に基づいています。

## 📦 インポート

```typescript
import { 
  RoleController,
  RoleManagementService,
  CreateRoleRequestDTO,
  UpdateRoleRequestDTO,
  RoleResponseDTO,
  UnifiedSecurityAPI
} from 'mplp/modules/role';

// またはモジュールインターフェースを使用
import { MPLP } from 'mplp';
const mplp = new MPLP();
const roleModule = mplp.getModule('role');
```

## 🏗️ コアインターフェース

### **RoleResponseDTO** (レスポンスインターフェース)

```typescript
interface RoleResponseDTO {
  // 基本プロトコルフィールド
  protocolVersion: string;        // プロトコルバージョン "1.0.0"
  timestamp: string;              // ISO 8601タイムスタンプ
  roleId: string;                 // 一意のロール識別子
  name: string;                   // ロール名
  description?: string;           // ロール説明
  type: RoleType;                 // ロールタイプ
  status: RoleStatus;             // ロールステータス
  
  // 権限と機能フィールド
  permissions: Permission[];      // 権限リスト
  capabilities: Capability[];     // 機能リスト
  inheritance: RoleInheritance;   // ロール継承設定
  delegation: DelegationConfig;   // 委任設定
  
  // セキュリティと監査フィールド
  securityLevel: SecurityLevel;   // セキュリティレベル
  auditTrail: AuditTrail;        // 監査証跡情報
  
  // エンタープライズ機能
  complexityScore: number;        // ロール複雑度スコア
  agentAssignments: AgentAssignment[]; // エージェント割り当て
  
  // メタデータ
  metadata?: Record<string, any>; // カスタムメタデータ
  createdAt?: string;            // 作成タイムスタンプ
  updatedAt?: string;            // 最終更新タイムスタンプ
}

// 列挙型
type RoleType = 'system' | 'custom' | 'temporary';
type RoleStatus = 'active' | 'inactive' | 'suspended';
type SecurityLevel = 'public' | 'internal' | 'confidential' | 'restricted';
```

### **Permission** (権限構造)

```typescript
interface Permission {
  permissionId: string;           // 権限ID
  resource: string;               // リソース識別子
  actions: Action[];              // 許可されたアクション
  conditions?: Condition[];       // アクセス条件
  effect: 'allow' | 'deny';       // 効果
}

interface Action {
  name: string;                   // アクション名（例: 'read', 'write', 'delete'）
  scope?: string;                 // アクションスコープ
}

interface Condition {
  type: string;                   // 条件タイプ
  operator: string;               // 演算子
  value: any;                     // 条件値
}
```

### **Capability** (機能構造)

```typescript
interface Capability {
  capabilityId: string;           // 機能ID
  name: string;                   // 機能名
  description?: string;           // 機能説明
  category: string;               // 機能カテゴリ
  level: 'basic' | 'intermediate' | 'advanced' | 'expert';
  requirements?: string[];        // 前提条件
}
```

## 🚀 REST APIエンドポイント

### **POST /roles** - ロールを作成

新しいロールを作成します。

```typescript
const roleController = new RoleController(roleManagementService);

const result = await roleController.createRole({
  name: 'データアナリスト',
  description: 'データ分析と可視化のためのロール',
  type: 'custom',
  permissions: [
    {
      permissionId: 'perm-001',
      resource: 'data:analytics',
      actions: [
        { name: 'read', scope: 'all' },
        { name: 'analyze', scope: 'all' }
      ],
      effect: 'allow'
    },
    {
      permissionId: 'perm-002',
      resource: 'reports',
      actions: [
        { name: 'create', scope: 'own' },
        { name: 'read', scope: 'all' }
      ],
      effect: 'allow'
    }
  ],
  capabilities: [
    {
      capabilityId: 'cap-001',
      name: 'データ分析',
      category: 'analytics',
      level: 'advanced'
    },
    {
      capabilityId: 'cap-002',
      name: 'レポート作成',
      category: 'reporting',
      level: 'intermediate'
    }
  ],
  securityLevel: 'internal'
});

console.log('ロールが作成されました:', result.roleId);
```

**レスポンス**: `RoleResponseDTO`

### **GET /roles/:id** - ロールを取得

IDでロールを取得します。

```typescript
const role = await roleController.getRole('role-123');
console.log('ロール:', role.name);
console.log('権限数:', role.permissions.length);
```

**レスポンス**: `RoleResponseDTO`

### **PUT /roles/:id** - ロールを更新

既存のロールを更新します。

```typescript
const updated = await roleController.updateRole('role-123', {
  status: 'active',
  permissions: [
    {
      permissionId: 'perm-003',
      resource: 'dashboards',
      actions: [{ name: 'create', scope: 'own' }],
      effect: 'allow'
    }
  ]
});

console.log('ロールが更新されました:', updated.timestamp);
```

**レスポンス**: `RoleResponseDTO`

### **DELETE /roles/:id** - ロールを削除

ロールを削除します。

```typescript
await roleController.deleteRole('role-123');
console.log('ロールが削除されました');
```

**レスポンス**: `void`

### **POST /roles/:id/assign** - ロールを割り当て

エージェントにロールを割り当てます。

```typescript
await roleController.assignRole('role-123', {
  agentId: 'agent-456',
  effectiveFrom: new Date().toISOString(),
  expiresAt: '2025-12-31T23:59:59Z'
});

console.log('ロールが割り当てられました');
```

**レスポンス**: `AssignmentResult`

### **POST /roles/check-permission** - 権限をチェック

エージェントが特定のアクションを実行する権限を持っているかチェックします。

```typescript
const hasPermission = await roleController.checkPermission({
  agentId: 'agent-456',
  resource: 'data:analytics',
  action: 'read'
});

console.log('権限あり:', hasPermission.allowed);
```

**レスポンス**: `PermissionCheckResult`

## 📚 使用例

### **例1: 階層的ロール構造**

```typescript
// 親ロールを作成
const adminRole = await roleController.createRole({
  name: '管理者',
  type: 'system',
  permissions: [
    {
      permissionId: 'admin-all',
      resource: '*',
      actions: [{ name: '*', scope: 'all' }],
      effect: 'allow'
    }
  ],
  securityLevel: 'restricted'
});

// 子ロールを作成（継承付き）
const moderatorRole = await roleController.createRole({
  name: 'モデレーター',
  type: 'custom',
  parentRoles: [adminRole.roleId],
  permissions: [
    {
      permissionId: 'mod-content',
      resource: 'content',
      actions: [
        { name: 'read', scope: 'all' },
        { name: 'update', scope: 'all' },
        { name: 'delete', scope: 'flagged' }
      ],
      effect: 'allow'
    }
  ],
  securityLevel: 'internal'
});

console.log('階層的ロール構造が作成されました');
```

### **例2: 条件付きアクセス制御**

```typescript
// 時間ベースの条件付きロールを作成
const role = await roleController.createRole({
  name: '営業時間アクセス',
  type: 'custom',
  permissions: [
    {
      permissionId: 'business-hours',
      resource: 'sensitive-data',
      actions: [{ name: 'read', scope: 'all' }],
      conditions: [
        {
          type: 'time',
          operator: 'between',
          value: { start: '09:00', end: '17:00' }
        },
        {
          type: 'location',
          operator: 'in',
          value: ['office-network']
        }
      ],
      effect: 'allow'
    }
  ],
  securityLevel: 'confidential'
});
```

---

**APIバージョン**: 1.0.0-alpha  
**最終更新**: 2025年9月4日  
**ステータス**: エンタープライズグレード  
**テスト**: 323/323テスト合格 ✅

