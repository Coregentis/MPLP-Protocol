# MPLP SDKドキュメント

> **🌐 言語ナビゲーション**: [English](../../en/developers/sdk.md) | [中文](../../zh-CN/developers/sdk.md) | [日本語](sdk.md)



**Multi-Agent Protocol Lifecycle Platform - SDKドキュメント v1.0.0-alpha**

[![SDK](https://img.shields.io/badge/sdk-Multi%20Language-green.svg)](./README.md)
[![Languages](https://img.shields.io/badge/languages-6%2B%20Supported-blue.svg)](../implementation/multi-language-support.md)
[![API](https://img.shields.io/badge/api-Type%20Safe-orange.svg)](./examples.md)
[![Language](https://img.shields.io/badge/language-日本語-blue.svg)](../../en/developers/sdk.md)

---

## 🎯 SDK概要

MPLP SDKは、Multi-Agent Protocol Lifecycle Platformでマルチエージェントシステムを構築するための言語固有のライブラリとツールを提供します。各SDKは、言語固有の機能と規則を活用しながら、一貫したAPIを維持します。

### **サポートされている言語**
- **プライマリSDK**: TypeScript、Python、Java、Go
- **セカンダリSDK**: C#、Rust、PHP、Ruby
- **コミュニティSDK**: Kotlin、Swift、Dart、Scala

### **SDK機能**
- **型安全性**: 完全な型定義とコンパイル時検証
- **プロトコル準拠**: 自動L1-L3プロトコル準拠
- **二重命名規則**: シームレスなsnake_case ↔ camelCaseマッピング
- **エラー処理**: 包括的なエラー処理と回復
- **パフォーマンス最適化**: 言語固有の最適化
- **テストサポート**: 組み込みテストユーティリティとモック

---

## 📦 TypeScript SDK

### **インストール**
```bash
# コアSDKをインストール
npm install @mplp/sdk-typescript

# 特定のモジュールをインストール
npm install @mplp/context @mplp/plan @mplp/role @mplp/confirm @mplp/trace

# 開発ツールをインストール
npm install -D @mplp/dev-tools @mplp/testing
```

### **基本的な使用方法**
```typescript
// 基本的なTypeScript SDK使用方法
import { MPLPClient, MPLPConfiguration } from '@mplp/sdk-typescript';
import { ContextService, PlanService, RoleService } from '@mplp/sdk-typescript';

// 設定
const config: MPLPConfiguration = {
  core: {
    protocolVersion: '1.0.0-alpha',
    environment: 'development',
    logLevel: 'info'
  },
  modules: {
    context: { enabled: true },
    plan: { enabled: true },
    role: { enabled: true },
    confirm: { enabled: true },
    trace: { enabled: true }
  },
  transport: {
    type: 'http',
    baseUrl: 'http://localhost:3000',
    timeout: 30000
  }
};

// クライアントを初期化
const client = new MPLPClient(config);
await client.initialize();

// サービスを使用
const contextService = client.getService<ContextService>('context');
const planService = client.getService<PlanService>('plan');
const roleService = client.getService<RoleService>('role');

// コンテキストを作成
const context = await contextService.createContext({
  contextId: 'example-context',
  contextType: 'user_workflow',
  contextData: { userId: 'user-123', workflowType: 'onboarding' },
  createdBy: 'typescript-sdk'
});

// プランを作成して実行
const plan = await planService.createPlan({
  planId: 'example-plan',
  contextId: context.contextId,
  planType: 'sequential_workflow',
  planSteps: [
    {
      stepId: 'step-001',
      operation: 'validate_user',
      parameters: { userId: 'user-123' },
      estimatedDuration: 1000
    },
    {
      stepId: 'step-002',
      operation: 'send_welcome_email',
      parameters: { template: 'welcome' },
      estimatedDuration: 2000
    }
  ],
  createdBy: 'typescript-sdk'
});

const result = await planService.executePlan(plan.planId);
console.log('プラン実行結果:', result);
```

### **高度な機能**
```typescript
// 高度なTypeScript SDK機能
import {
  MPLPClient,
  ContextService,
  PlanService,
  TraceService,
  EventEmitter,
  RetryPolicy,
  CircuitBreaker
} from '@mplp/sdk-typescript';

// 高度な設定
const advancedConfig: MPLPConfiguration = {
  // ... 基本設定
  resilience: {
    retryPolicy: {
      maxRetries: 3,
      retryDelay: 1000,
      exponentialBackoff: true,
      jitter: true
    },
    circuitBreaker: {
      failureThreshold: 5,
      recoveryTimeout: 30000,
      monitoringPeriod: 10000
    },
    timeout: {
      default: 30000,
      context: 10000,
      plan: 60000
    }
  },
  monitoring: {
    metrics: true,
    tracing: true,
    logging: {
      level: 'info',
      format: 'json',
      destination: 'console'
    }
  }
};

// イベント駆動プログラミング
class EventDrivenAgent {
  private client: MPLPClient;
  private eventEmitter: EventEmitter;

  constructor(config: MPLPConfiguration) {
    this.client = new MPLPClient(config);
    this.eventEmitter = this.client.getEventEmitter();
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    // コンテキストイベント
    this.eventEmitter.on('context.created', (event) => {
      console.log('コンテキストが作成されました:', event.contextId);
    });

    this.eventEmitter.on('context.updated', (event) => {
      console.log('コンテキストが更新されました:', event.contextId);
    });

    // プランイベント
    this.eventEmitter.on('plan.started', (event) => {
      console.log('プランが開始されました:', event.planId);
    });

    this.eventEmitter.on('plan.completed', (event) => {
      console.log('プランが完了しました:', event.planId, event.result);
    });

    this.eventEmitter.on('plan.failed', (event) => {
      console.error('プランが失敗しました:', event.planId, event.error);
    });

    // ステップイベント
    this.eventEmitter.on('step.started', (event) => {
      console.log('ステップが開始されました:', event.stepId);
    });

    this.eventEmitter.on('step.completed', (event) => {
      console.log('ステップが完了しました:', event.stepId);
    });
  }

  async processWorkflow(workflowData: any): Promise<any> {
    // イベント発行付きでコンテキストを作成
    const context = await this.client.context.createContext({
      contextId: `workflow-${Date.now()}`,
      contextType: 'event_driven_workflow',
      contextData: workflowData,
      createdBy: 'event-driven-agent'
    });

    // イベント発行付きでプランを作成
    const plan = await this.client.plan.createPlan({
      planId: `plan-${Date.now()}`,
      contextId: context.contextId,
      planType: 'event_driven',
      planSteps: this.generateSteps(workflowData),
      createdBy: 'event-driven-agent'
    });

    // 自動イベント発行で実行
    return await this.client.plan.executePlan(plan.planId);
  }

  private generateSteps(workflowData: any): PlanStep[] {
    // ワークフローデータに基づいてステップを生成
    return [
      {
        stepId: 'validate-input',
        operation: 'validate_workflow_data',
        parameters: { data: workflowData },
        estimatedDuration: 500
      },
      {
        stepId: 'process-data',
        operation: 'process_workflow_data',
        parameters: { processingType: workflowData.type },
        estimatedDuration: 2000
      },
      {
        stepId: 'generate-output',
        operation: 'generate_workflow_output',
        parameters: { outputFormat: 'json' },
        estimatedDuration: 1000
      }
    ];
  }
}
```

---

## 🐍 Python SDK

### **インストール**
```bash
# コアSDKをインストール
pip install mplp-sdk-python

# 特定のモジュールをインストール
pip install mplp-context mplp-plan mplp-role mplp-confirm mplp-trace

# 開発ツールをインストール
pip install mplp-dev-tools mplp-testing
```

### **基本的な使用方法**
```python
# 基本的なPython SDK使用方法
from mplp_sdk import MPLPClient, MPLPConfiguration
from mplp_context import ContextService
from mplp_plan import PlanService
from mplp_role import RoleService
import asyncio

# 設定
config = MPLPConfiguration(
    core={
        'protocol_version': '1.0.0-alpha',
        'environment': 'development',
        'log_level': 'info'
    },
    modules={
        'context': {'enabled': True},
        'plan': {'enabled': True},
        'role': {'enabled': True},
        'confirm': {'enabled': True},
        'trace': {'enabled': True}
    },
    transport={
        'type': 'http',
        'base_url': 'http://localhost:3000',
        'timeout': 30.0
    }
)

async def main():
    # クライアントを初期化
    client = MPLPClient(config)
    await client.initialize()

    # サービスを取得
    context_service = client.get_service('context')
    plan_service = client.get_service('plan')
    role_service = client.get_service('role')

    # コンテキストを作成
    context = await context_service.create_context({
        'context_id': 'python-example-context',
        'context_type': 'data_processing',
        'context_data': {
            'input_file': 'data.csv',
            'processing_type': 'analysis',
            'output_format': 'json'
        },
        'created_by': 'python-sdk'
    })

    # プランを作成
    plan = await plan_service.create_plan({
        'plan_id': 'python-example-plan',
        'context_id': context['context_id'],
        'plan_type': 'data_processing_workflow',
        'plan_steps': [
            {
                'step_id': 'load-data',
                'operation': 'load_csv_data',
                'parameters': {'file_path': 'data.csv'},
                'estimated_duration': 2000
            },
            {
                'step_id': 'analyze-data',
                'operation': 'perform_analysis',
                'parameters': {'analysis_type': 'statistical'},
                'estimated_duration': 5000
            },
            {
                'step_id': 'export-results',
                'operation': 'export_results',
                'parameters': {'format': 'json'},
                'estimated_duration': 1000
            }
        ],
        'created_by': 'python-sdk'
    })

    # プランを実行
    result = await plan_service.execute_plan(plan['plan_id'])
    print(f"プラン実行結果: {result}")

# 非同期mainを実行
if __name__ == "__main__":
    asyncio.run(main())
```

### **高度な機能**
```python
# 高度なPython SDK機能
from mplp_sdk import MPLPClient, EventHandler, RetryPolicy, CircuitBreaker
from typing import Dict, Any, List, Optional
import logging

class AdvancedPythonAgent:
    def __init__(self, config: MPLPConfiguration):
        self.client = MPLPClient(config)
        self.logger = logging.getLogger(__name__)
        self.setup_event_handlers()

    def setup_event_handlers(self):
        """様々なMPLPイベントのイベントハンドラーを設定"""

        @self.client.on('context.created')
        async def on_context_created(event: Dict[str, Any]):
            self.logger.info(f"コンテキストが作成されました: {event['context_id']}")

        @self.client.on('plan.started')
        async def on_plan_started(event: Dict[str, Any]):
            self.logger.info(f"プランが開始されました: {event['plan_id']}")

        @self.client.on('plan.completed')
        async def on_plan_completed(event: Dict[str, Any]):
            self.logger.info(f"プランが完了しました: {event['plan_id']}")

        @self.client.on('plan.failed')
        async def on_plan_failed(event: Dict[str, Any]):
            self.logger.error(f"プランが失敗しました: {event['plan_id']} - {event['error']}")

    async def process_batch_data(self, data_batch: List[Dict[str, Any]]) -> Dict[str, Any]:
        """MPLPワークフローを使用してデータのバッチを処理"""

        # バッチ処理用のコンテキストを作成
        context = await self.client.context.create_context({
            'context_id': f'batch-{len(data_batch)}-{int(time.time())}',
            'context_type': 'batch_processing',
            'context_data': {
                'batch_size': len(data_batch),
                'processing_started': datetime.utcnow().isoformat(),
                'data_types': list(set(item.get('type') for item in data_batch))
            },
            'created_by': 'advanced-python-agent'
        })

        # 並列処理プランを作成
        plan_steps = []
        chunk_size = max(1, len(data_batch) // 4)  # 4つのチャンクで処理

        for i in range(0, len(data_batch), chunk_size):
            chunk = data_batch[i:i + chunk_size]
            plan_steps.append({
                'step_id': f'process-chunk-{i // chunk_size}',
                'operation': 'process_data_chunk',
                'parameters': {
                    'chunk_index': i // chunk_size,
                    'chunk_data': chunk,
                    'chunk_size': len(chunk)
                },
                'estimated_duration': len(chunk) * 100  # アイテムあたり100ms
            })

        # 集約ステップを追加
        plan_steps.append({
            'step_id': 'aggregate-results',
            'operation': 'aggregate_chunk_results',
            'parameters': {'aggregation_method': 'merge'},
            'estimated_duration': 1000,
            'dependencies': [f'process-chunk-{i}' for i in range(len(plan_steps))]
        })

        plan = await self.client.plan.create_plan({
            'plan_id': f'batch-plan-{context["context_id"]}',
            'context_id': context['context_id'],
            'plan_type': 'parallel_batch_processing',
            'plan_steps': plan_steps,
            'created_by': 'advanced-python-agent'
        })

        # カスタムステップ実装で実行
        result = await self.client.plan.execute_plan(
            plan['plan_id'],
            step_implementations={
                'process_data_chunk': self._process_chunk,
                'aggregate_chunk_results': self._aggregate_results
            }
        )

        return result

    async def _process_chunk(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """データのチャンクを処理"""
        chunk_data = parameters['chunk_data']
        chunk_index = parameters['chunk_index']

        # データ処理をシミュレート
        processed_items = []
        for item in chunk_data:
            processed_item = {
                'id': item.get('id'),
                'processed_value': item.get('value', 0) * 2,
                'processing_timestamp': datetime.utcnow().isoformat(),
                'chunk_index': chunk_index
            }
            processed_items.append(processed_item)

        return {
            'chunk_index': chunk_index,
            'processed_items': processed_items,
            'processing_time': len(chunk_data) * 100
        }

    async def _aggregate_results(self, parameters: Dict[str, Any], step_result: Dict[str, Any]) -> Dict[str, Any]:
        """すべてのチャンクから結果を集約"""
        chunk_results = [
            result for result in step_result['previous_step_results'].values()
            if 'chunk_index' in result
        ]

        all_processed_items = []
        total_processing_time = 0

        for chunk_result in chunk_results:
            all_processed_items.extend(chunk_result['processed_items'])
            total_processing_time += chunk_result['processing_time']

        return {
            'total_items': len(all_processed_items),
            'processed_items': all_processed_items,
            'total_processing_time': total_processing_time,
            'chunks_processed': len(chunk_results),
            'aggregation_completed': datetime.utcnow().isoformat()
        }
```

---

## ☕ Java SDK

### **インストール**
```xml
<!-- Maven依存関係 -->
<dependency>
    <groupId>dev.mplp</groupId>
    <artifactId>mplp-sdk-java</artifactId>
    <version>1.0.0-alpha</version>
</dependency>

<!-- 個別モジュール -->
<dependency>
    <groupId>dev.mplp</groupId>
    <artifactId>mplp-context</artifactId>
    <version>1.0.0-alpha</version>
</dependency>
<dependency>
    <groupId>dev.mplp</groupId>
    <artifactId>mplp-plan</artifactId>
    <version>1.0.0-alpha</version>
</dependency>
```

### **基本的な使用方法**
```java
// 基本的なJava SDK使用方法
import dev.mplp.sdk.MPLPClient;
import dev.mplp.sdk.MPLPConfiguration;
import dev.mplp.context.ContextService;
import dev.mplp.plan.PlanService;
import dev.mplp.role.RoleService;

import java.util.concurrent.CompletableFuture;
import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.ArrayList;

public class BasicJavaExample {
    public static void main(String[] args) {
        // 設定
        MPLPConfiguration config = MPLPConfiguration.builder()
            .core(CoreConfiguration.builder()
                .protocolVersion("1.0.0-alpha")
                .environment("development")
                .logLevel("info")
                .build())
            .modules(ModuleConfiguration.builder()
                .context(ModuleConfig.enabled())
                .plan(ModuleConfig.enabled())
                .role(ModuleConfig.enabled())
                .confirm(ModuleConfig.enabled())
                .trace(ModuleConfig.enabled())
                .build())
            .transport(TransportConfiguration.builder()
                .type("http")
                .baseUrl("http://localhost:3000")
                .timeout(30000)
                .build())
            .build();

        // クライアントを初期化
        MPLPClient client = new MPLPClient(config);

        CompletableFuture.runAsync(() -> {
            try {
                client.initialize().get();

                // サービスを取得
                ContextService contextService = client.getService(ContextService.class);
                PlanService planService = client.getService(PlanService.class);
                RoleService roleService = client.getService(RoleService.class);

                // コンテキストを作成
                Map<String, Object> contextData = new HashMap<>();
                contextData.put("userId", "user-123");
                contextData.put("workflowType", "order_processing");

                CreateContextRequest contextRequest = CreateContextRequest.builder()
                    .contextId("java-example-context")
                    .contextType("order_workflow")
                    .contextData(contextData)
                    .createdBy("java-sdk")
                    .build();

                ContextEntity context = contextService.createContext(contextRequest).get();
                System.out.println("コンテキストが作成されました: " + context.getContextId());

                // プランを作成
                List<PlanStep> planSteps = new ArrayList<>();
                planSteps.add(PlanStep.builder()
                    .stepId("validate-order")
                    .operation("validate_order_data")
                    .parameters(Map.of("orderId", "order-123"))
                    .estimatedDuration(1000)
                    .build());

                planSteps.add(PlanStep.builder()
                    .stepId("process-payment")
                    .operation("process_payment")
                    .parameters(Map.of("amount", 99.99, "currency", "USD"))
                    .estimatedDuration(3000)
                    .build());

                planSteps.add(PlanStep.builder()
                    .stepId("fulfill-order")
                    .operation("fulfill_order")
                    .parameters(Map.of("fulfillmentType", "standard"))
                    .estimatedDuration(2000)
                    .build());

                CreatePlanRequest planRequest = CreatePlanRequest.builder()
                    .planId("java-example-plan")
                    .contextId(context.getContextId())
                    .planType("order_processing_workflow")
                    .planSteps(planSteps)
                    .createdBy("java-sdk")
                    .build();

                PlanEntity plan = planService.createPlan(planRequest).get();
                System.out.println("プランが作成されました: " + plan.getPlanId());

                // プランを実行
                ExecutePlanRequest executeRequest = ExecutePlanRequest.builder()
                    .planId(plan.getPlanId())
                    .executionMode("sequential")
                    .timeoutSeconds(60)
                    .build();

                PlanExecutionResult result = planService.executePlan(executeRequest).get();
                System.out.println("プラン実行結果: " + result.getExecutionStatus());

            } catch (Exception e) {
                e.printStackTrace();
            }
        }).join();
    }
}
```

---

## 🐹 Go SDK

### **インストール**
```bash
# Go SDKをインストール
go get github.com/mplp/mplp-sdk-go

# 特定のモジュールをインストール
go get github.com/mplp/mplp-context-go
go get github.com/mplp/mplp-plan-go
go get github.com/mplp/mplp-role-go
```

### **基本的な使用方法**
```go
// 基本的なGo SDK使用方法
package main

import (
    "context"
    "fmt"
    "log"
    "time"

    "github.com/mplp/mplp-sdk-go/client"
    "github.com/mplp/mplp-sdk-go/config"
    "github.com/mplp/mplp-context-go"
    "github.com/mplp/mplp-plan-go"
    "github.com/mplp/mplp-role-go"
)

func main() {
    // 設定
    cfg := &config.MPLPConfiguration{
        Core: config.CoreConfiguration{
            ProtocolVersion: "1.0.0-alpha",
            Environment:     "development",
            LogLevel:        "info",
        },
        Modules: config.ModuleConfiguration{
            Context: config.ModuleConfig{Enabled: true},
            Plan:    config.ModuleConfig{Enabled: true},
            Role:    config.ModuleConfig{Enabled: true},
            Confirm: config.ModuleConfig{Enabled: true},
            Trace:   config.ModuleConfig{Enabled: true},
        },
        Transport: config.TransportConfiguration{
            Type:    "http",
            BaseURL: "http://localhost:3000",
            Timeout: 30 * time.Second,
        },
    }

    // クライアントを初期化
    mplpClient, err := client.NewMPLPClient(cfg)
    if err != nil {
        log.Fatalf("MPLPクライアントの作成に失敗しました: %v", err)
    }

    ctx := context.Background()
    if err := mplpClient.Initialize(ctx); err != nil {
        log.Fatalf("MPLPクライアントの初期化に失敗しました: %v", err)
    }

    // サービスを取得
    contextService := mplpClient.GetContextService()
    planService := mplpClient.GetPlanService()
    roleService := mplpClient.GetRoleService()

    // コンテキストを作成
    contextReq := &mplpcontext.CreateContextRequest{
        ContextID:   "go-example-context",
        ContextType: "file_processing",
        ContextData: map[string]interface{}{
            "inputFile":     "data.txt",
            "outputFormat":  "json",
            "processingType": "text_analysis",
        },
        CreatedBy: "go-sdk",
    }

    contextEntity, err := contextService.CreateContext(ctx, contextReq)
    if err != nil {
        log.Fatalf("コンテキストの作成に失敗しました: %v", err)
    }
    fmt.Printf("コンテキストが作成されました: %s\n", contextEntity.ContextID)

    // プランを作成
    planSteps := []*mplpplan.PlanStep{
        {
            StepID:            "read-file",
            Operation:         "read_text_file",
            Parameters:        map[string]interface{}{"filePath": "data.txt"},
            EstimatedDuration: 1000,
        },
        {
            StepID:            "analyze-text",
            Operation:         "perform_text_analysis",
            Parameters:        map[string]interface{}{"analysisType": "sentiment"},
            EstimatedDuration: 5000,
        },
        {
            StepID:            "export-results",
            Operation:         "export_analysis_results",
            Parameters:        map[string]interface{}{"format": "json"},
            EstimatedDuration: 1000,
        },
    }

    planReq := &mplpplan.CreatePlanRequest{
        PlanID:      "go-example-plan",
        ContextID:   contextEntity.ContextID,
        PlanType:    "text_processing_workflow",
        PlanSteps:   planSteps,
        CreatedBy:   "go-sdk",
    }

    planEntity, err := planService.CreatePlan(ctx, planReq)
    if err != nil {
        log.Fatalf("プランの作成に失敗しました: %v", err)
    }
    fmt.Printf("プランが作成されました: %s\n", planEntity.PlanID)

    // プランを実行
    executeReq := &mplpplan.ExecutePlanRequest{
        PlanID:         planEntity.PlanID,
        ExecutionMode:  "sequential",
        TimeoutSeconds: 60,
    }

    result, err := planService.ExecutePlan(ctx, executeReq)
    if err != nil {
        log.Fatalf("プランの実行に失敗しました: %v", err)
    }
    fmt.Printf("プラン実行結果: %s\n", result.ExecutionStatus)
}
```

---

## 🔗 関連リソース

- **[開発者リソース概要](./README.md)** - 完全な開発者ガイド
- **[クイックスタートガイド](./quick-start.md)** - すぐに始める
- **[包括的なチュートリアル](./tutorials.md)** - ステップバイステップの学習
- **[コード例](./examples.md)** - 動作するコードサンプル
- **[開発ツール](./tools.md)** - CLIツールとユーティリティ

---

**SDKドキュメントバージョン**: 1.0.0-alpha
**最終更新**: 2025年9月4日
**次回レビュー**: 2025年12月4日
**ステータス**: マルチ言語対応

**⚠️ アルファ版の注意**: これらのSDKは、MPLP v1.0 Alphaの包括的なマルチ言語サポートを提供します。追加の言語バインディングとSDK機能は、開発者のフィードバックとコミュニティの貢献に基づいて、ベータリリースで追加される予定です。
