# Confirm APIリファレンス

> **🌐 言語ナビゲーション**: [English](../../en/api-reference/confirm-api.md) | [中文](../../zh-CN/api-reference/confirm-api.md) | [日本語](confirm-api.md)



**マルチパーティ承認とコンセンサスメカニズム - MPLP v1.0 Alpha**

[![API](https://img.shields.io/badge/api-Confirm%20Module-blue.svg)](../modules/confirm/README.md)
[![Schema](https://img.shields.io/badge/schema-mplp--confirm.json-green.svg)](../schemas/README.md)
[![Status](https://img.shields.io/badge/status-Enterprise%20Grade-green.svg)](../../../ALPHA-RELEASE-NOTES.md)
[![Tests](https://img.shields.io/badge/tests-265%2F265%20passing-green.svg)](../modules/confirm/testing-guide.md)
[![Language](https://img.shields.io/badge/language-日本語-blue.svg)](../../en/api-reference/confirm-api.md)

---

## 🎯 概要

Confirm APIは、マルチエージェントシステムのための包括的な承認ワークフローとコンセンサス管理機能を提供します。高度な承認プロセス、リスク評価、コンプライアンス追跡、エンタープライズグレードのワークフロー管理を可能にします。このAPIは、MPLP v1.0 Alphaの実際の実装に基づいています。

## 📦 インポート

```typescript
import { 
  ConfirmController,
  ConfirmManagementService,
  CreateConfirmRequestDTO,
  UpdateConfirmRequestDTO,
  ConfirmResponseDTO
} from 'mplp/modules/confirm';

// またはモジュールインターフェースを使用
import { MPLP } from 'mplp';
const mplp = new MPLP();
const confirmModule = mplp.getModule('confirm');
```

## 🏗️ コアインターフェース

### **ConfirmResponseDTO** (レスポンスインターフェース)

```typescript
interface ConfirmResponseDTO {
  // 基本プロトコルフィールド
  protocolVersion: string;        // プロトコルバージョン "1.0.0"
  timestamp: string;              // ISO 8601タイムスタンプ
  confirmId: string;              // 一意の確認識別子
  contextId: string;              // 関連するコンテキストID
  planId?: string;                // 関連するプランID（オプション）
  confirmationType: ConfirmationType; // 確認タイプ
  status: ConfirmationStatus;     // 確認ステータス
  priority: Priority;             // 優先度レベル
  
  // 要求者情報
  requester: {
    userId: string;
    role: string;
    department?: string;
    requestReason: string;
  };
  
  // 承認ワークフロー
  approvalWorkflow: {
    workflowType: WorkflowType;
    steps: ApprovalStep[];
    currentStep: number;
    completionCriteria: CompletionCriteria;
  };
  
  // 件名とリスク評価
  subject: {
    title: string;
    description: string;
    impactAssessment: ImpactAssessment;
    attachments?: Attachment[];
  };
  riskAssessment: RiskAssessment;
  
  // エンタープライズ機能
  auditTrail: AuditTrail;
  complianceTracking: ComplianceTracking;
  
  // メタデータ
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

// 列挙型
type ConfirmationType = 'approval' | 'consensus' | 'notification' | 'escalation';
type ConfirmationStatus = 'pending' | 'approved' | 'rejected' | 'cancelled' | 'expired';
type WorkflowType = 'sequential' | 'parallel' | 'conditional' | 'hybrid';
type Priority = 'low' | 'medium' | 'high' | 'critical';
```

### **ApprovalStep** (承認ステップ構造)

```typescript
interface ApprovalStep {
  stepId: string;                 // ステップID
  stepNumber: number;             // ステップ番号
  approvers: Approver[];          // 承認者リスト
  requiredApprovals: number;      // 必要な承認数
  currentApprovals: number;       // 現在の承認数
  status: StepStatus;             // ステップステータス
  deadline?: string;              // 期限
  escalationPolicy?: EscalationPolicy; // エスカレーションポリシー
}

interface Approver {
  userId: string;                 // ユーザーID
  role: string;                   // ロール
  status: 'pending' | 'approved' | 'rejected';
  decision?: {
    timestamp: string;
    comment?: string;
    conditions?: string[];
  };
}

type StepStatus = 'pending' | 'in_progress' | 'completed' | 'rejected' | 'expired';
```

### **RiskAssessment** (リスク評価構造)

```typescript
interface RiskAssessment {
  overallRiskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskFactors: RiskFactor[];
  mitigationStrategies: MitigationStrategy[];
  residualRisk: string;
}

interface RiskFactor {
  factorId: string;
  category: string;
  description: string;
  likelihood: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  score: number;
}

interface MitigationStrategy {
  strategyId: string;
  description: string;
  effectiveness: 'low' | 'medium' | 'high';
  implementationStatus: 'planned' | 'in_progress' | 'implemented';
}
```

## 🚀 REST APIエンドポイント

### **POST /confirmations** - 確認を作成

新しい確認リクエストを作成します。

```typescript
const confirmController = new ConfirmController(confirmManagementService);

const result = await confirmController.createConfirmation({
  contextId: 'ctx-123',
  planId: 'plan-456',
  confirmationType: 'approval',
  priority: 'high',
  requester: {
    userId: 'user-789',
    role: 'project-manager',
    department: 'engineering',
    requestReason: '本番環境へのデプロイ承認が必要'
  },
  subject: {
    title: '本番環境デプロイ承認',
    description: 'バージョン2.0.0を本番環境にデプロイ',
    impactAssessment: {
      scope: 'organization-wide',
      affectedSystems: ['api-gateway', 'database', 'cache'],
      estimatedDowntime: '5分',
      rollbackPlan: '利用可能'
    }
  },
  approvalWorkflow: {
    workflowType: 'sequential',
    steps: [
      {
        stepId: 'step-001',
        stepNumber: 1,
        approvers: [
          { userId: 'tech-lead-001', role: 'technical-lead', status: 'pending' }
        ],
        requiredApprovals: 1,
        currentApprovals: 0,
        status: 'pending',
        deadline: '2025-09-05T17:00:00Z'
      },
      {
        stepId: 'step-002',
        stepNumber: 2,
        approvers: [
          { userId: 'ops-manager-001', role: 'operations-manager', status: 'pending' }
        ],
        requiredApprovals: 1,
        currentApprovals: 0,
        status: 'pending',
        deadline: '2025-09-06T17:00:00Z'
      }
    ],
    completionCriteria: {
      type: 'all-steps-approved',
      minimumApprovals: 2
    }
  },
  riskAssessment: {
    overallRiskLevel: 'medium',
    riskFactors: [
      {
        factorId: 'risk-001',
        category: 'technical',
        description: 'データベーススキーマの変更',
        likelihood: 'medium',
        impact: 'high',
        score: 6
      }
    ],
    mitigationStrategies: [
      {
        strategyId: 'mit-001',
        description: 'ブルーグリーンデプロイメント戦略',
        effectiveness: 'high',
        implementationStatus: 'implemented'
      }
    ],
    residualRisk: '低'
  }
});

console.log('確認が作成されました:', result.confirmId);
```

**レスポンス**: `ConfirmResponseDTO`

### **GET /confirmations/:id** - 確認を取得

IDで確認を取得します。

```typescript
const confirmation = await confirmController.getConfirmation('confirm-123');
console.log('確認:', confirmation.subject.title);
console.log('ステータス:', confirmation.status);
```

**レスポンス**: `ConfirmResponseDTO`

### **POST /confirmations/:id/approve** - 承認

確認リクエストを承認します。

```typescript
const result = await confirmController.approveConfirmation('confirm-123', {
  approverId: 'tech-lead-001',
  comment: 'すべての技術要件が満たされています。承認します。',
  conditions: ['デプロイ後の監視を24時間実施']
});

console.log('承認が記録されました:', result.timestamp);
```

**レスポンス**: `ApprovalResult`

### **POST /confirmations/:id/reject** - 拒否

確認リクエストを拒否します。

```typescript
const result = await confirmController.rejectConfirmation('confirm-123', {
  approverId: 'ops-manager-001',
  reason: 'パフォーマンステストが不完全',
  requiredActions: ['負荷テストを完了', 'パフォーマンスレポートを提出']
});

console.log('拒否が記録されました:', result.timestamp);
```

**レスポンス**: `RejectionResult`

## 📚 使用例

### **例1: シンプルな承認ワークフロー**

```typescript
// 承認リクエストを作成
const confirmation = await confirmController.createConfirmation({
  contextId: 'ctx-123',
  confirmationType: 'approval',
  priority: 'medium',
  requester: {
    userId: 'developer-001',
    role: 'developer',
    requestReason: 'コード変更の承認が必要'
  },
  subject: {
    title: 'プルリクエスト #123',
    description: 'ユーザー認証機能の実装'
  },
  approvalWorkflow: {
    workflowType: 'sequential',
    steps: [
      {
        stepId: 'review',
        stepNumber: 1,
        approvers: [{ userId: 'senior-dev-001', role: 'senior-developer', status: 'pending' }],
        requiredApprovals: 1,
        currentApprovals: 0,
        status: 'pending'
      }
    ]
  }
});

// 承認
await confirmController.approveConfirmation(confirmation.confirmId, {
  approverId: 'senior-dev-001',
  comment: 'コードレビュー完了。LGTM!'
});
```

---

**APIバージョン**: 1.0.0-alpha  
**最終更新**: 2025年9月4日  
**ステータス**: エンタープライズグレード  
**テスト**: 265/265テスト合格 ✅

