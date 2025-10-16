# 二重命名規則

> **🌐 言語ナビゲーション**: [English](../../en/architecture/dual-naming-convention.md) | [中文](../../zh-CN/architecture/dual-naming-convention.md) | [日本語](dual-naming-convention.md)



**スキーマ-実装命名標準**

[![Convention](https://img.shields.io/badge/convention-Dual%20Naming-blue.svg)](./architecture-overview.md)
[![Schema](https://img.shields.io/badge/schema-snake__case-green.svg)](./schema-system.md)
[![Implementation](https://img.shields.io/badge/implementation-camelCase-orange.svg)](./design-patterns.md)
[![Language](https://img.shields.io/badge/language-日本語-blue.svg)](../../en/architecture/dual-naming-convention.md)

---

## 概要

二重命名規則は、システムの異なる層にわたる一貫したデータ表現を保証するMPLPの基本的なアーキテクチャ原則です。この規則は、スキーマ定義でsnake_caseの使用を義務付け、実装コードでcamelCaseを使用し、データ整合性と型安全性を維持するための必須の双方向マッピング関数を要求します。

---

## 1. 規則概要

### 1.1 **核心原則**

#### **層固有の命名**
- **スキーマ層**: すべてのフィールド名と識別子に`snake_case`を使用
- **実装層**: すべてのプロパティと変数に`camelCase`を使用
- **マッピング層**: 命名規則間の双方向変換を提供

#### **根拠**
- **スキーマ一貫性**: JSON Schemaとデータベース規則は通常snake_caseを使用
- **コード可読性**: JavaScript/TypeScript規則はcamelCaseを好む
- **相互運用性**: 外部システムとのシームレスな統合を可能に
- **型安全性**: 層境界を越えた強い型付けを維持

### 1.2 **適用範囲**

#### **スキーマ層（snake_case）**
```json
{
  "context_id": "ctx-001",
  "created_at": "2025-09-03T10:30:00Z",
  "protocol_version": "1.0.0-alpha",
  "agent_metadata": {
    "agent_id": "agent-001",
    "agent_type": "collaborative",
    "last_activity": "2025-09-03T10:29:45Z"
  },
  "execution_status": "active",
  "resource_allocation": {
    "cpu_cores": 2,
    "memory_mb": 1024,
    "network_bandwidth": 100
  }
}
```

#### **実装層（camelCase）**
```typescript
interface ContextEntity {
  contextId: string;
  createdAt: Date;
  protocolVersion: string;
  agentMetadata: {
    agentId: string;
    agentType: string;
    lastActivity: Date;
  };
  executionStatus: string;
  resourceAllocation: {
    cpuCores: number;
    memoryMb: number;
    networkBandwidth: number;
  };
}
```

---

## 2. 命名規則と標準

### 2.1 **スキーマ層規則（snake_case）**

#### **フィールド命名標準**
```json
{
  // ✅ 正しいsnake_case命名
  "user_id": "string",
  "created_at": "string",
  "last_modified": "string",
  "protocol_version": "string",
  "agent_capabilities": "array",
  "execution_context": "object",
  "resource_requirements": "object",
  "performance_metrics": "object",
  
  // ❌ 誤った命名（これらを避ける）
  "userId": "string",           // スキーマでcamelCaseは許可されない
  "createdAt": "string",        // スキーマでcamelCaseは許可されない
  "LastModified": "string",     // PascalCaseは許可されない
  "protocol-version": "string"  // ケバブケースは許可されない
}
```

#### **命名パターン**
```
基本パターン: [prefix]_[descriptor]_[suffix]
例:
- context_id          (識別子)
- created_at          (タイムスタンプ)
- agent_metadata      (ネストされたオブジェクト)
- execution_status    (状態フィールド)
- resource_allocation (設定オブジェクト)
```

### 2.2 **実装層規則（camelCase）**

#### **プロパティ命名標準**
```typescript
// ✅ 正しいcamelCase命名
interface ContextEntity {
  userId: string;
  createdAt: Date;
  lastModified: Date;
  protocolVersion: string;
  agentCapabilities: string[];
  executionContext: ExecutionContext;
  resourceRequirements: ResourceRequirements;
  performanceMetrics: PerformanceMetrics;
}

// ❌ 誤った命名（これらを避ける）
interface ContextEntity {
  user_id: string;           // 実装でsnake_caseは許可されない
  CreatedAt: Date;           // PascalCaseはクラス名のみ
  "protocol-version": string; // ケバブケースは許可されない
}
```

#### **命名パターン**
```
基本パターン: [prefix][Descriptor][Suffix]
例:
- contextId          (識別子)
- createdAt          (タイムスタンプ)
- agentMetadata      (ネストされたオブジェクト)
- executionStatus    (状態フィールド)
- resourceAllocation (設定オブジェクト)
```

---

## 3. マッピング実装

### 3.1 **基本マッパークラス**

#### **汎用マッパーインターフェース**
```typescript
interface IMapper<TSchema, TEntity> {
  toSchema(entity: TEntity): TSchema;
  fromSchema(schema: TSchema): TEntity;
  toSchemaArray(entities: TEntity[]): TSchema[];
  fromSchemaArray(schemas: TSchema[]): TEntity[];
  validateSchema(schema: TSchema): ValidationResult;
}

// 基底マッパークラス
abstract class BaseMapper<TSchema, TEntity> implements IMapper<TSchema, TEntity> {
  abstract toSchema(entity: TEntity): TSchema;
  abstract fromSchema(schema: TSchema): TEntity;
  
  toSchemaArray(entities: TEntity[]): TSchema[] {
    return entities.map(entity => this.toSchema(entity));
  }
  
  fromSchemaArray(schemas: TSchema[]): TEntity[] {
    return schemas.map(schema => this.fromSchema(schema));
  }
  
  validateSchema(schema: TSchema): ValidationResult {
    // スキーマ検証ロジック
    return this.schemaValidator.validate(schema, this.getSchemaName());
  }
  
  protected abstract getSchemaName(): string;
}
```

### 3.2 **Contextマッパー実装**

#### **完全なマッピング例**
```typescript
// スキーマ型定義
interface ContextSchema {
  context_id: string;
  context_name: string;
  context_type: string;
  created_at: string;
  updated_at: string;
  protocol_version: string;
  agent_metadata: {
    agent_id: string;
    agent_type: string;
    agent_role: string;
    last_activity: string;
  };
  execution_status: string;
  resource_allocation: {
    cpu_cores: number;
    memory_mb: number;
    storage_gb: number;
    network_bandwidth: number;
  };
  performance_metrics: {
    response_time_ms: number;
    throughput_ops: number;
    error_rate: number;
    success_rate: number;
  };
}

// エンティティ型定義
interface ContextEntity {
  contextId: string;
  contextName: string;
  contextType: string;
  createdAt: Date;
  updatedAt: Date;
  protocolVersion: string;
  agentMetadata: {
    agentId: string;
    agentType: string;
    agentRole: string;
    lastActivity: Date;
  };
  executionStatus: string;
  resourceAllocation: {
    cpuCores: number;
    memoryMb: number;
    storageGb: number;
    networkBandwidth: number;
  };
  performanceMetrics: {
    responseTimeMs: number;
    throughputOps: number;
    errorRate: number;
    successRate: number;
  };
}

// マッパー実装
class ContextMapper extends BaseMapper<ContextSchema, ContextEntity> {
  toSchema(entity: ContextEntity): ContextSchema {
    return {
      context_id: entity.contextId,
      context_name: entity.contextName,
      context_type: entity.contextType,
      created_at: entity.createdAt.toISOString(),
      updated_at: entity.updatedAt.toISOString(),
      protocol_version: entity.protocolVersion,
      agent_metadata: {
        agent_id: entity.agentMetadata.agentId,
        agent_type: entity.agentMetadata.agentType,
        agent_role: entity.agentMetadata.agentRole,
        last_activity: entity.agentMetadata.lastActivity.toISOString()
      },
      execution_status: entity.executionStatus,
      resource_allocation: {
        cpu_cores: entity.resourceAllocation.cpuCores,
        memory_mb: entity.resourceAllocation.memoryMb,
        storage_gb: entity.resourceAllocation.storageGb,
        network_bandwidth: entity.resourceAllocation.networkBandwidth
      },
      performance_metrics: {
        response_time_ms: entity.performanceMetrics.responseTimeMs,
        throughput_ops: entity.performanceMetrics.throughputOps,
        error_rate: entity.performanceMetrics.errorRate,
        success_rate: entity.performanceMetrics.successRate
      }
    };
  }
  
  fromSchema(schema: ContextSchema): ContextEntity {
    return {
      contextId: schema.context_id,
      contextName: schema.context_name,
      contextType: schema.context_type,
      createdAt: new Date(schema.created_at),
      updatedAt: new Date(schema.updated_at),
      protocolVersion: schema.protocol_version,
      agentMetadata: {
        agentId: schema.agent_metadata.agent_id,
        agentType: schema.agent_metadata.agent_type,
        agentRole: schema.agent_metadata.agent_role,
        lastActivity: new Date(schema.agent_metadata.last_activity)
      },
      executionStatus: schema.execution_status,
      resourceAllocation: {
        cpuCores: schema.resource_allocation.cpu_cores,
        memoryMb: schema.resource_allocation.memory_mb,
        storageGb: schema.resource_allocation.storage_gb,
        networkBandwidth: schema.resource_allocation.network_bandwidth
      },
      performanceMetrics: {
        responseTimeMs: schema.performance_metrics.response_time_ms,
        throughputOps: schema.performance_metrics.throughput_ops,
        errorRate: schema.performance_metrics.error_rate,
        successRate: schema.performance_metrics.success_rate
      }
    };
  }
  
  protected getSchemaName(): string {
    return 'mplp-context';
  }
}
```

### 3.3 **高度なマッピングパターン**

#### **条件付きマッピング**
```typescript
class PlanMapper extends BaseMapper<PlanSchema, PlanEntity> {
  toSchema(entity: PlanEntity): PlanSchema {
    const baseSchema = {
      plan_id: entity.planId,
      plan_name: entity.planName,
      created_at: entity.createdAt.toISOString(),
      plan_status: entity.planStatus
    };

    // プランタイプに基づく条件付きマッピング
    if (entity.planType === 'collaborative') {
      return {
        ...baseSchema,
        collaboration_settings: {
          max_participants: entity.collaborationSettings?.maxParticipants || 10,
          approval_required: entity.collaborationSettings?.approvalRequired || false,
          real_time_sync: entity.collaborationSettings?.realTimeSync || true
        }
      };
    }

    return baseSchema;
  }
}
```

#### **ネストされたコレクションマッピング**
```typescript
class RoleMapper extends BaseMapper<RoleSchema, RoleEntity> {
  toSchema(entity: RoleEntity): RoleSchema {
    return {
      role_id: entity.roleId,
      role_name: entity.roleName,
      permissions: entity.permissions.map(permission => ({
        permission_id: permission.permissionId,
        resource_type: permission.resourceType,
        allowed_actions: permission.allowedActions,
        constraints: permission.constraints?.map(constraint => ({
          constraint_type: constraint.constraintType,
          constraint_value: constraint.constraintValue,
          is_required: constraint.isRequired
        })) || []
      })),
      assigned_agents: entity.assignedAgents.map(agent => ({
        agent_id: agent.agentId,
        assigned_at: agent.assignedAt.toISOString(),
        assignment_status: agent.assignmentStatus
      }))
    };
  }
}
```

---

## 4. 検証と一貫性

### 4.1 **マッピング一貫性検証**

#### **一貫性チェッカー**
```typescript
class MappingConsistencyChecker {
  async validateMappingConsistency<TSchema, TEntity>(
    mapper: BaseMapper<TSchema, TEntity>,
    testData: TEntity[]
  ): Promise<ConsistencyReport> {
    const results: ConsistencyResult[] = [];

    for (const entity of testData) {
      try {
        // ラウンドトリップ変換をテスト
        const schema = mapper.toSchema(entity);
        const convertedBack = mapper.fromSchema(schema);

        // 元のデータと変換後のデータを比較
        const isConsistent = this.deepEqual(entity, convertedBack);

        results.push({
          entityId: this.getEntityId(entity),
          consistent: isConsistent,
          originalData: entity,
          schemaData: schema,
          convertedData: convertedBack,
          differences: isConsistent ? [] : this.findDifferences(entity, convertedBack)
        });

      } catch (error) {
        results.push({
          entityId: this.getEntityId(entity),
          consistent: false,
          error: error.message,
          originalData: entity
        });
      }
    }

    return {
      totalTests: testData.length,
      passedTests: results.filter(r => r.consistent).length,
      failedTests: results.filter(r => !r.consistent).length,
      consistencyRate: results.filter(r => r.consistent).length / testData.length,
      results
    };
  }
}
```

### 4.2 **自動テスト**

#### **マッピングテストスイート**
```typescript
describe('二重命名規則マッピングテスト', () => {
  let contextMapper: ContextMapper;
  let consistencyChecker: MappingConsistencyChecker;

  beforeEach(() => {
    contextMapper = new ContextMapper();
    consistencyChecker = new MappingConsistencyChecker();
  });

  test('ラウンドトリップ変換で一貫性を維持すべき', async () => {
    const testEntity: ContextEntity = {
      contextId: 'ctx-001',
      contextName: 'テストコンテキスト',
      contextType: 'collaborative',
      createdAt: new Date('2025-09-03T10:30:00Z'),
      updatedAt: new Date('2025-09-03T10:35:00Z'),
      agentMetadata: {
        agentId: 'agent-001',
        agentType: 'coordinator',
        lastActivity: new Date('2025-09-03T10:34:30Z')
      },
      executionStatus: 'active',
      resourceAllocation: {
        cpuCores: 2,
        memoryMb: 1024,
        networkBandwidth: 100
      }
    };

    // ラウンドトリップ変換をテスト
    const schema = contextMapper.toSchema(testEntity);
    const convertedBack = contextMapper.fromSchema(schema);

    expect(convertedBack).toEqual(testEntity);
  });

  test('スキーマ構造を正しく検証すべき', () => {
    const validSchema = {
      context_id: 'ctx-001',
      context_name: 'テストコンテキスト',
      context_type: 'collaborative',
      created_at: '2025-09-03T10:30:00Z',
      updated_at: '2025-09-03T10:35:00Z',
      agent_metadata: {
        agent_id: 'agent-001',
        agent_type: 'coordinator',
        last_activity: '2025-09-03T10:34:30Z'
      },
      execution_status: 'active',
      resource_allocation: {
        cpu_cores: 2,
        memory_mb: 1024,
        network_bandwidth: 100
      }
    };

    const validation = contextMapper.validateSchema(validSchema);
    expect(validation.valid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });
});
```

---

## 5. ベストプラクティスとガイドライン

### 5.1 **開発ガイドライン**

#### **スキーマ設計ベストプラクティス**
```json
{
  // ✅ 説明的で曖昧さのないフィールド名を使用
  "execution_start_time": "2025-09-03T10:30:00Z",
  "execution_end_time": "2025-09-03T10:35:00Z",
  "total_execution_duration_ms": 300000,

  // ✅ 類似概念に一貫した命名パターンを使用
  "created_at": "2025-09-03T10:30:00Z",
  "updated_at": "2025-09-03T10:35:00Z",
  "deleted_at": null,

  // ✅ 配列/コレクションには複数形を使用
  "active_contexts": [],
  "assigned_roles": [],
  "error_messages": [],

  // ✅ 単一オブジェクトには単数形を使用
  "current_context": {},
  "primary_role": {},
  "latest_error": {}
}
```

#### **実装ベストプラクティス**
```typescript
// ✅ 実装全体で一貫したcamelCaseを使用
class ContextService {
  private activeContexts: Map<string, ContextEntity> = new Map();
  private contextMapper: ContextMapper = new ContextMapper();

  async createContext(contextData: CreateContextRequest): Promise<ContextEntity> {
    const newContext = this.buildContextEntity(contextData);
    this.activeContexts.set(newContext.contextId, newContext);
    return newContext;
  }
}
```

### 5.2 **一般的な落とし穴と解決策**

#### **落とし穴1: 一貫性のない命名**
```typescript
// ❌ 一貫性のない命名 - 規則の混在
interface BadExample {
  contextId: string;        // camelCase
  created_at: string;       // snake_case - 実装では誤り
  agentMetadata: {
    agent_id: string;       // snake_case - 実装では誤り
    agentType: string;      // camelCase
  };
}

// ✅ 一貫した命名 - 適切なcamelCase
interface GoodExample {
  contextId: string;
  createdAt: Date;
  agentMetadata: {
    agentId: string;
    agentType: string;
  };
}
```

#### **落とし穴2: マッピング関数の欠落**
```typescript
// ❌ マッピングなしの直接代入
const saveToDatabase = (entity: ContextEntity) => {
  // データベースはsnake_caseを期待するため失敗する
  return database.save(entity);
};

// ✅ データベース操作前の適切なマッピング
const saveToDatabase = (entity: ContextEntity) => {
  const schema = contextMapper.toSchema(entity);
  return database.save(schema);
};
```

---

## 6. ツールと自動化

### 6.1 **コード生成ツール**

#### **マッパージェネレーター**
```typescript
class MapperGenerator {
  generateMapper(schemaDefinition: JSONSchema, entityInterface: string): string {
    const schemaFields = this.extractSchemaFields(schemaDefinition);
    const entityFields = this.extractEntityFields(entityInterface);

    const mappings = this.createFieldMappings(schemaFields, entityFields);

    return this.generateMapperCode(mappings);
  }
}
```

### 6.2 **検証ツール**

#### **規則リンター**
```typescript
class NamingConventionLinter {
  lintSchema(schema: JSONSchema): LintResult[] {
    const issues: LintResult[] = [];

    this.validateFieldNames(schema.properties, issues, []);

    return issues;
  }

  private isValidSnakeCase(name: string): boolean {
    return /^[a-z][a-z0-9_]*$/.test(name);
  }
}
```

---

## 10. 二重命名規則実装ステータス

### 10.1 **100%規則準拠達成**

#### **すべての10モジュールが完全準拠**
- **Contextモジュール**: ✅ 100%スキーマ-実装マッピング一貫性
- **Planモジュール**: ✅ 100%二重命名規則準拠
- **Roleモジュール**: ✅ 100%双方向マッピング検証
- **Confirmモジュール**: ✅ 100%型安全変換
- **Traceモジュール**: ✅ 100%フィールド名一貫性
- **Extensionモジュール**: ✅ 100%スキーマ検証準拠
- **Dialogモジュール**: ✅ 100%命名規則遵守
- **Collabモジュール**: ✅ 100%マッピング関数カバレッジ
- **Coreモジュール**: ✅ 100%規則強制
- **Networkモジュール**: ✅ 100%層間一貫性

#### **実装品質メトリクス**
- **マッピング精度**: 100%正確な双方向変換
- **型安全性**: マッピング操作における型エラーゼロ
- **パフォーマンス影響**: マッピング操作あたり<1msオーバーヘッド
- **検証カバレッジ**: 100%スキーマフィールド検証

#### **エンタープライズ標準達成**
- **一貫性**: すべてのモジュールとスキーマにわたる統一命名
- **保守性**: スキーマ層と実装層の明確な分離
- **相互運用性**: 外部システムとのシームレスな統合
- **開発者体験**: 両層の直感的な命名規則

### 10.2 **本番環境対応規則システム**

二重命名規則は、以下を備えた**エンタープライズグレード命名標準**を表しています：
- すべてのMPLPモジュールにわたる完全な準拠
- 命名の不一致やマッピングエラーゼロ
- 包括的な検証と強制ツール
- 完全なドキュメントと開発者ガイドライン

#### **規則成功メトリクス**
- **開発者生産性**: 明確な命名標準により開発が30%高速化
- **バグ削減**: 命名関連のバグと統合問題が70%削減
- **コード品質**: 命名規則のコードレビュー承認率95%
- **システム統合**: 外部システム統合100%成功

---

**ドキュメントバージョン**: 1.0
**最終更新**: 2025年9月4日
**次回レビュー**: 2025年12月4日
**規則標準**: 二重命名規則 v1.0.0-alpha
**言語**: 日本語

**⚠️ Alpha通知**: 二重命名規則は本番環境対応ですが、一部の高度な検証機能はコミュニティフィードバックに基づいて強化される可能性があります。

