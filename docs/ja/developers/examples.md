# MPLPコード例

> **🌐 言語ナビゲーション**: [English](../../en/developers/examples.md) | [中文](../../zh-CN/developers/examples.md) | [日本語](examples.md)



**Multi-Agent Protocol Lifecycle Platform - コード例 v1.0.0-alpha**

[![Examples](https://img.shields.io/badge/examples-Working%20Code-green.svg)](./README.md)
[![Runnable](https://img.shields.io/badge/runnable-Copy%20%26%20Paste-blue.svg)](./tutorials.md)
[![Use Cases](https://img.shields.io/badge/use%20cases-Real%20World-orange.svg)](./quick-start.md)
[![Language](https://img.shields.io/badge/language-日本語-blue.svg)](../../en/developers/examples.md)

---

## 🎯 例の概要

このコレクションは、シンプルな単一モジュール操作から複雑なマルチエージェント調整シナリオまで、一般的なMPLPユースケースの動作するコード例を提供します。すべての例は本番環境対応で、エラー処理、ログ記録、ベストプラクティスが含まれています。

### **例のカテゴリ**
- **シンプルな例**: 基本的な単一モジュール操作
- **統合例**: マルチモジュールワークフローと外部統合
- **高度な例**: 複雑なマルチエージェント調整と最適化
- **本番環境例**: 完全な可観測性を備えたエンタープライズグレードの実装

### **例の使用方法**
1. **コピー＆ペースト**: すべての例は自己完結型で実行可能
2. **変更＆拡張**: 独自の実装の出発点として使用
3. **学習＆理解**: パターンとベストプラクティスを学習
4. **テスト＆検証**: 例を実行して動作を理解

---

## 🚀 シンプルな例

### **例1: 基本的なコンテキスト管理**

#### **コンテキストの作成と取得**
```typescript
// examples/simple/context-management.ts
import { MPLPClient } from '@mplp/core';

async function contextManagementExample() {
  const client = new MPLPClient({
    core: { protocolVersion: '1.0.0-alpha', environment: 'development' },
    modules: { context: { enabled: true } }
  });

  await client.initialize();

  try {
    // コンテキストを作成
    const context = await client.context.createContext({
      contextId: 'example-context-001',
      contextType: 'user_session',
      contextData: {
        userId: 'user-123',
        sessionId: 'session-456',
        preferences: {
          language: 'en',
          theme: 'dark',
          notifications: true
        },
        metadata: {
          userAgent: 'Mozilla/5.0...',
          ipAddress: '192.168.1.100',
          location: 'New York, NY'
        }
      },
      createdBy: 'example-app'
    });

    console.log('✅ コンテキストが作成されました:', context.contextId);

    // コンテキストを取得
    const retrievedContext = await client.context.getContext(context.contextId);
    console.log('📋 取得されたコンテキスト:', retrievedContext?.contextType);

    // コンテキストデータを更新
    const updatedContext = await client.context.updateContext(context.contextId, {
      contextData: {
        ...context.contextData,
        preferences: {
          ...context.contextData.preferences,
          theme: 'light' // ユーザーがテーマを変更
        },
        lastActivity: new Date().toISOString()
      },
      updatedBy: 'example-app'
    });

    console.log('🔄 コンテキストが更新されました:', updatedContext.updatedAt);

    // コンテキストを検索
    const searchResults = await client.context.searchContexts({
      contextType: 'user_session',
      limit: 10
    });

    console.log(`🔍 ${searchResults.totalCount}個のユーザーセッションが見つかりました`);

  } catch (error) {
    console.error('❌ コンテキスト管理が失敗しました:', error);
  }
}

// 例を実行
contextManagementExample();
```

### **例2: シンプルなプラン実行**

#### **順次ワークフロー**
```typescript
// examples/simple/plan-execution.ts
import { MPLPClient } from '@mplp/core';

async function planExecutionExample() {
  const client = new MPLPClient({
    core: { protocolVersion: '1.0.0-alpha', environment: 'development' },
    modules: { context: { enabled: true }, plan: { enabled: true } }
  });

  await client.initialize();

  try {
    // ワークフロー用のコンテキストを作成
    const context = await client.context.createContext({
      contextId: 'workflow-context-001',
      contextType: 'data_processing',
      contextData: {
        inputData: [1, 2, 3, 4, 5],
        processingType: 'mathematical_operations',
        expectedOutput: 'statistics'
      },
      createdBy: 'plan-example'
    });

    // 順次プランを作成
    const plan = await client.plan.createPlan({
      planId: 'math-processing-plan',
      contextId: context.contextId,
      planType: 'sequential_workflow',
      planSteps: [
        {
          stepId: 'validate-input',
          operation: 'validate_data',
          parameters: {
            dataType: 'number_array',
            minLength: 1,
            maxLength: 1000
          },
          estimatedDuration: 10
        },
        {
          stepId: 'calculate-sum',
          operation: 'calculate_sum',
          parameters: { data: context.contextData.inputData },
          estimatedDuration: 5
        },
        {
          stepId: 'calculate-average',
          operation: 'calculate_average',
          parameters: { data: context.contextData.inputData },
          estimatedDuration: 5
        },
        {
          stepId: 'find-min-max',
          operation: 'find_min_max',
          parameters: { data: context.contextData.inputData },
          estimatedDuration: 5
        },
        {
          stepId: 'generate-report',
          operation: 'generate_statistics_report',
          parameters: { format: 'json' },
          estimatedDuration: 15
        }
      ],
      createdBy: 'plan-example'
    });

    console.log('📝 プランが作成されました:', plan.planId);

    // プランを実行
    const executionResult = await client.plan.executePlan(plan.planId, {
      executionMode: 'sequential',
      timeoutSeconds: 60
    });

    if (executionResult.executionStatus === 'completed') {
      console.log('✅ プランが正常に実行されました');
      console.log('📊 結果:', executionResult.executionResult);
      console.log(`⏱️ 合計時間: ${executionResult.totalDuration}ms`);
      console.log(`📈 成功率: ${executionResult.successRate * 100}%`);
    } else {
      console.log('❌ プラン実行が失敗しました:', executionResult.error);
    }

  } catch (error) {
    console.error('❌ プラン実行例が失敗しました:', error);
  }
}

// 例を実行
planExecutionExample();
```

### **例3: ロールベースアクセス制御**

#### **ユーザーとロール管理**
```typescript
// examples/simple/rbac-example.ts
import { MPLPClient } from '@mplp/core';

async function rbacExample() {
  const client = new MPLPClient({
    core: { protocolVersion: '1.0.0-alpha', environment: 'development' },
    modules: { role: { enabled: true }, context: { enabled: true } }
  });

  await client.initialize();

  try {
    // ロールを作成
    const adminRole = await client.role.createRole({
      roleId: 'admin',
      roleName: 'Administrator',
      permissions: [
        'context:create',
        'context:read',
        'context:update',
        'context:delete',
        'plan:create',
        'plan:execute',
        'role:assign',
        'system:configure'
      ],
      createdBy: 'rbac-example'
    });

    const userRole = await client.role.createRole({
      roleId: 'user',
      roleName: 'Regular User',
      permissions: [
        'context:create:own',
        'context:read:own',
        'context:update:own',
        'plan:create:own',
        'plan:execute:own'
      ],
      createdBy: 'rbac-example'
    });

    console.log('👥 ロールが作成されました:', adminRole.roleId, userRole.roleId);

    // ユーザーを作成してロールを割り当て
    const adminUser = await client.role.createUser({
      userId: 'admin-001',
      username: 'admin',
      email: 'admin@example.com',
      roles: [adminRole.roleId],
      createdBy: 'rbac-example'
    });

    const regularUser = await client.role.createUser({
      userId: 'user-001',
      username: 'john_doe',
      email: 'john@example.com',
      roles: [userRole.roleId],
      createdBy: 'rbac-example'
    });

    console.log('👤 ユーザーが作成されました:', adminUser.userId, regularUser.userId);

    // 権限をテスト
    const adminPermissions = await client.role.checkPermission({
      userId: adminUser.userId,
      permission: 'system:configure'
    });

    const userPermissions = await client.role.checkPermission({
      userId: regularUser.userId,
      permission: 'system:configure'
    });

    console.log('🔐 管理者はシステムを設定できます:', adminPermissions.allowed);
    console.log('🔐 ユーザーはシステムを設定できます:', userPermissions.allowed);

    // 所有権付きでコンテキストを作成
    const userContext = await client.context.createContext({
      contextId: 'user-owned-context',
      contextType: 'personal_workspace',
      contextData: { owner: regularUser.userId },
      createdBy: regularUser.userId
    });

    // アクセス制御をテスト
    const userCanRead = await client.role.checkPermission({
      userId: regularUser.userId,
      permission: 'context:read:own',
      resourceId: userContext.contextId,
      resourceOwner: regularUser.userId
    });

    console.log('📖 ユーザーは自分のコンテキストを読むことができます:', userCanRead.allowed);

  } catch (error) {
    console.error('❌ RBAC例が失敗しました:', error);
  }
}

// 例を実行
rbacExample();
```

---

## 🔧 統合例

### **例4: 外部API統合**

#### **エラー処理付きREST API統合**
```typescript
// examples/integration/external-api.ts
import { MPLPClient } from '@mplp/core';
import axios from 'axios';

class ExternalAPIService {
  private client: MPLPClient;

  constructor(client: MPLPClient) {
    this.client = client;
  }

  async integrateWithWeatherAPI(city: string): Promise<any> {
    // 統合コンテキストを作成
    const context = await this.client.context.createContext({
      contextId: `weather-integration-${city}-${Date.now()}`,
      contextType: 'external_api_integration',
      contextData: {
        apiType: 'weather',
        city: city,
        integrationStarted: new Date().toISOString()
      },
      createdBy: 'weather-service'
    });

    // 統合プランを作成
    const plan = await this.client.plan.createPlan({
      planId: `weather-plan-${city}-${Date.now()}`,
      contextId: context.contextId,
      planType: 'external_integration',
      planSteps: [
        {
          stepId: 'validate-city',
          operation: 'validate_city_name',
          parameters: { city },
          estimatedDuration: 5
        },
        {
          stepId: 'fetch-weather',
          operation: 'fetch_weather_data',
          parameters: {
            city,
            apiKey: process.env.WEATHER_API_KEY,
            units: 'metric'
          },
          estimatedDuration: 2000,
          retryPolicy: {
            maxRetries: 3,
            retryDelay: 1000,
            exponentialBackoff: true
          }
        },
        {
          stepId: 'process-data',
          operation: 'process_weather_data',
          parameters: { includeForcast: true },
          estimatedDuration: 100
        },
        {
          stepId: 'cache-result',
          operation: 'cache_weather_data',
          parameters: { ttl: 300 }, // 5分
          estimatedDuration: 50
        }
      ],
      createdBy: 'weather-service'
    });

    // カスタムステップ実装で実行
    const result = await this.client.plan.executePlan(plan.planId, {
      stepImplementations: {
        'validate_city_name': async (params) => {
          if (!params.city || params.city.length < 2) {
            throw new Error('無効な都市名');
          }
          return { valid: true, normalizedCity: params.city.trim() };
        },

        'fetch_weather_data': async (params) => {
          try {
            const response = await axios.get(
              `https://api.openweathermap.org/data/2.5/weather`,
              {
                params: {
                  q: params.city,
                  appid: params.apiKey,
                  units: params.units
                },
                timeout: 5000
              }
            );
            return response.data;
          } catch (error) {
            if (error.response?.status === 404) {
              throw new Error(`都市が見つかりません: ${params.city}`);
            }
            throw new Error(`天気APIエラー: ${error.message}`);
          }
        },

        'process_weather_data': async (params, stepResult) => {
          const weatherData = stepResult.previousStepResults['fetch-weather'];
          return {
            city: weatherData.name,
            country: weatherData.sys.country,
            temperature: weatherData.main.temp,
            description: weatherData.weather[0].description,
            humidity: weatherData.main.humidity,
            windSpeed: weatherData.wind.speed,
            processedAt: new Date().toISOString()
          };
        },

        'cache_weather_data': async (params, stepResult) => {
          const processedData = stepResult.previousStepResults['process-data'];
          // キャッシュ実装はここに入ります
          return { cached: true, cacheKey: `weather:${processedData.city}` };
        }
      }
    });

    if (result.executionStatus === 'completed') {
      console.log(`✅ ${city}の天気データを取得しました`);
      return result.executionResult;
    } else {
      throw new Error(`天気統合が失敗しました: ${result.error}`);
    }
  }
}

async function externalAPIExample() {
  const client = new MPLPClient({
    core: { protocolVersion: '1.0.0-alpha', environment: 'development' },
    modules: { context: { enabled: true }, plan: { enabled: true } }
  });

  await client.initialize();

  const weatherService = new ExternalAPIService(client);

  try {
    const weatherData = await weatherService.integrateWithWeatherAPI('London');
    console.log('🌤️ 天気データ:', weatherData);
  } catch (error) {
    console.error('❌ 天気統合が失敗しました:', error);
  }
}

// 例を実行
externalAPIExample();
```

### **例5: データベース統合**

#### **マルチデータベース同期**
```typescript
// examples/integration/database-sync.ts
import { MPLPClient } from '@mplp/core';

interface DatabaseRecord {
  id: string;
  data: any;
  lastModified: Date;
  source: string;
}

class DatabaseSyncService {
  private client: MPLPClient;

  constructor(client: MPLPClient) {
    this.client = client;
  }

  async syncBetweenDatabases(
    sourceDB: string,
    targetDB: string,
    tableName: string
  ): Promise<void> {
    const syncId = `sync-${sourceDB}-${targetDB}-${Date.now()}`;

    // 同期コンテキストを作成
    const context = await this.client.context.createContext({
      contextId: syncId,
      contextType: 'database_synchronization',
      contextData: {
        sourceDB,
        targetDB,
        tableName,
        syncStarted: new Date().toISOString(),
        syncType: 'incremental'
      },
      createdBy: 'database-sync-service'
    });

    // 同期プランを作成
    const plan = await this.client.plan.createPlan({
      planId: `sync-plan-${syncId}`,
      contextId: context.contextId,
      planType: 'parallel_workflow',
      planSteps: [
        {
          stepId: 'fetch-source-data',
          operation: 'fetch_database_records',
          parameters: { database: sourceDB, table: tableName },
          estimatedDuration: 5000
        },
        {
          stepId: 'fetch-target-data',
          operation: 'fetch_database_records',
          parameters: { database: targetDB, table: tableName },
          estimatedDuration: 5000
        },
        {
          stepId: 'compare-data',
          operation: 'compare_database_records',
          parameters: { comparisonStrategy: 'timestamp' },
          estimatedDuration: 2000,
          dependencies: ['fetch-source-data', 'fetch-target-data']
        },
        {
          stepId: 'sync-changes',
          operation: 'apply_database_changes',
          parameters: { batchSize: 100 },
          estimatedDuration: 10000,
          dependencies: ['compare-data']
        },
        {
          stepId: 'verify-sync',
          operation: 'verify_synchronization',
          parameters: { verificationLevel: 'full' },
          estimatedDuration: 3000,
          dependencies: ['sync-changes']
        }
      ],
      createdBy: 'database-sync-service'
    });

    // 監視付きで同期を実行
    const result = await this.client.plan.executePlan(plan.planId, {
      executionMode: 'dependency_aware',
      stepImplementations: {
        'fetch_database_records': async (params) => {
          // モックデータベース取得
          console.log(`📊 ${params.database}.${params.table}からレコードを取得中`);
          await new Promise(resolve => setTimeout(resolve, 1000));

          return {
            records: Array.from({ length: 100 }, (_, i) => ({
              id: `record-${i}`,
              data: { value: Math.random() },
              lastModified: new Date(),
              source: params.database
            })),
            totalCount: 100
          };
        },

        'compare_database_records': async (params, stepResult) => {
          const sourceRecords = stepResult.previousStepResults['fetch-source-data'].records;
          const targetRecords = stepResult.previousStepResults['fetch-target-data'].records;

          console.log(`🔍 ${sourceRecords.length}個のソースレコードと${targetRecords.length}個のターゲットレコードを比較中`);

          // モック比較ロジック
          const toInsert = sourceRecords.slice(0, 10);
          const toUpdate = sourceRecords.slice(10, 20);
          const toDelete = targetRecords.slice(90, 100);

          return {
            toInsert: toInsert.length,
            toUpdate: toUpdate.length,
            toDelete: toDelete.length,
            changes: { toInsert, toUpdate, toDelete }
          };
        },

        'apply_database_changes': async (params, stepResult) => {
          const changes = stepResult.previousStepResults['compare-data'].changes;
          console.log(`💾 変更を適用中: ${changes.toInsert.length}件挿入, ${changes.toUpdate.length}件更新, ${changes.toDelete.length}件削除`);

          await new Promise(resolve => setTimeout(resolve, 2000));

          return {
            inserted: changes.toInsert.length,
            updated: changes.toUpdate.length,
            deleted: changes.toDelete.length,
            totalChanges: changes.toInsert.length + changes.toUpdate.length + changes.toDelete.length
          };
        },

        'verify_synchronization': async (params, stepResult) => {
          console.log('✅ 同期を検証中...');
          await new Promise(resolve => setTimeout(resolve, 1000));

          return {
            verified: true,
            verificationLevel: params.verificationLevel,
            verifiedAt: new Date().toISOString()
          };
        }
      }
    });

    if (result.executionStatus === 'completed') {
      console.log(`✅ データベース同期が完了しました: ${sourceDB} → ${targetDB}`);
    } else {
      throw new Error(`データベース同期が失敗しました: ${result.error}`);
    }
  }
}

// 例を実行
async function databaseSyncExample() {
  const client = new MPLPClient({
    core: { protocolVersion: '1.0.0-alpha', environment: 'development' },
    modules: { context: { enabled: true }, plan: { enabled: true } }
  });

  await client.initialize();

  const syncService = new DatabaseSyncService(client);

  try {
    await syncService.syncBetweenDatabases('production-db', 'analytics-db', 'users');
    console.log('🎉 データベース同期が正常に完了しました');
  } catch (error) {
    console.error('❌ データベース同期が失敗しました:', error);
  }
}

databaseSyncExample();
```

---

## 🎯 高度な例

### **例6: マルチエージェント調整**

#### **分散データ処理**
```typescript
// examples/advanced/multi-agent-coordination.ts
import { MPLPClient } from '@mplp/core';

interface Agent {
  agentId: string;
  agentType: string;
  capabilities: string[];
  status: 'idle' | 'busy' | 'offline';
  currentLoad: number;
}

class MultiAgentOrchestrator {
  private client: MPLPClient;
  private agents: Map<string, Agent> = new Map();

  constructor(client: MPLPClient) {
    this.client = client;
  }

  async registerAgent(agent: Agent): Promise<void> {
    this.agents.set(agent.agentId, agent);
    console.log(`🤖 エージェントが登録されました: ${agent.agentId} (${agent.agentType})`);
  }

  async processLargeDataset(data: any[]): Promise<any> {
    const jobId = `job-${Date.now()}`;

    // ジョブコンテキストを作成
    const context = await this.client.context.createContext({
      contextId: jobId,
      contextType: 'distributed_processing',
      contextData: {
        totalRecords: data.length,
        processingStarted: new Date().toISOString(),
        chunkSize: 100
      },
      createdBy: 'multi-agent-orchestrator'
    });

    // データをチャンクに分割
    const chunkSize = 100;
    const chunks = [];
    for (let i = 0; i < data.length; i += chunkSize) {
      chunks.push(data.slice(i, i + chunkSize));
    }

    // 利用可能なプロセッサエージェントを取得
    const processors = Array.from(this.agents.values())
      .filter(a => a.agentType === 'processor' && a.status === 'idle');

    const validators = Array.from(this.agents.values())
      .filter(a => a.agentType === 'validator' && a.status === 'idle');

    const reporters = Array.from(this.agents.values())
      .filter(a => a.agentType === 'reporter' && a.status === 'idle');

    // 分散処理プランを作成
    const planSteps = [];

    // 各チャンクの処理ステップ
    chunks.forEach((chunk, index) => {
      const assignedAgent = processors[index % processors.length];
      planSteps.push({
        stepId: `process-chunk-${index}`,
        operation: 'process_data_chunk',
        parameters: {
          chunkIndex: index,
          data: chunk,
          assignedAgent: assignedAgent.agentId
        },
        estimatedDuration: 2000
      });
    });

    // 検証ステップ
    planSteps.push({
      stepId: 'validate-results',
      operation: 'validate_processed_data',
      parameters: {
        assignedAgent: validators[0].agentId
      },
      estimatedDuration: 1500,
      dependencies: planSteps.map(s => s.stepId)
    });

    // レポート生成ステップ
    planSteps.push({
      stepId: 'generate-report',
      operation: 'generate_processing_report',
      parameters: {
        assignedAgent: reporters[0].agentId
      },
      estimatedDuration: 1000,
      dependencies: ['validate-results']
    });

    const plan = await this.client.plan.createPlan({
      planId: `plan-${jobId}`,
      contextId: context.contextId,
      planType: 'multi_agent_workflow',
      planSteps,
      createdBy: 'multi-agent-orchestrator'
    });

    // プランを実行
    const result = await this.client.plan.executePlan(plan.planId, {
      executionMode: 'dependency_aware',
      maxParallelSteps: processors.length,
      stepImplementations: {
        'process_data_chunk': async (params) => {
          console.log(`📊 エージェント ${params.assignedAgent} がチャンク ${params.chunkIndex} を処理中`);

          const agent = this.agents.get(params.assignedAgent);
          if (agent) {
            agent.status = 'busy';
            agent.currentLoad += 1;
          }

          // 処理をシミュレート
          await new Promise(resolve => setTimeout(resolve, 2000));

          // エージェントをアイドルにマーク
          if (agent) {
            agent.status = 'idle';
            agent.currentLoad -= 1;
          }

          return {
            chunkIndex: params.chunkIndex,
            processedRecords: params.data.length,
            processingTime: 2000,
            agentId: params.assignedAgent
          };
        },

        'validate_processed_data': async (params, stepResult) => {
          console.log(`✅ エージェント ${params.assignedAgent} が結果を検証中`);

          const processedChunks = Object.values(stepResult.previousStepResults)
            .filter(result => result.chunkIndex !== undefined);

          await new Promise(resolve => setTimeout(resolve, 1500));

          return {
            validatedChunks: processedChunks.length,
            totalRecords: processedChunks.reduce((sum, chunk) => sum + chunk.processedRecords, 0),
            validationPassed: true,
            agentId: params.assignedAgent
          };
        },

        'generate_processing_report': async (params, stepResult) => {
          console.log(`📋 エージェント ${params.assignedAgent} がレポートを生成中`);

          const validationResult = stepResult.previousStepResults['validate-results'];

          await new Promise(resolve => setTimeout(resolve, 1000));

          return {
            reportId: `report-${jobId}`,
            totalRecords: validationResult.totalRecords,
            processingTime: Date.now() - new Date(context.contextData.processingStarted).getTime(),
            agentsUsed: {
              processors: processors.length,
              validators: 1,
              reporters: 1
            },
            reportGeneratedBy: params.assignedAgent,
            reportGeneratedAt: new Date().toISOString()
          };
        }
      }
    });

    if (result.executionStatus === 'completed') {
      console.log(`✅ ジョブの分散処理が完了しました: ${jobId}`);
      return result.executionResult;
    } else {
      throw new Error(`分散処理が失敗しました: ${result.error}`);
    }
  }
}

async function multiAgentExample() {
  const client = new MPLPClient({
    core: { protocolVersion: '1.0.0-alpha', environment: 'development' },
    modules: {
      context: { enabled: true },
      plan: { enabled: true },
      trace: { enabled: true }
    }
  });

  await client.initialize();

  const orchestrator = new MultiAgentOrchestrator(client);

  // エージェントを登録
  await orchestrator.registerAgent({
    agentId: 'processor-001',
    agentType: 'processor',
    capabilities: ['data_processing', 'mathematical_operations'],
    status: 'idle',
    currentLoad: 0
  });

  await orchestrator.registerAgent({
    agentId: 'processor-002',
    agentType: 'processor',
    capabilities: ['data_processing', 'text_analysis'],
    status: 'idle',
    currentLoad: 0
  });

  await orchestrator.registerAgent({
    agentId: 'validator-001',
    agentType: 'validator',
    capabilities: ['data_validation', 'quality_assurance'],
    status: 'idle',
    currentLoad: 0
  });

  await orchestrator.registerAgent({
    agentId: 'reporter-001',
    agentType: 'reporter',
    capabilities: ['report_generation', 'data_visualization'],
    status: 'idle',
    currentLoad: 0
  });

  try {
    // 大規模データセットを処理
    const dataset = Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      value: Math.random() * 100,
      category: ['A', 'B', 'C'][i % 3]
    }));

    const result = await orchestrator.processLargeDataset(dataset);
    console.log('🎉 マルチエージェント処理が完了しました:', result);

  } catch (error) {
    console.error('❌ マルチエージェント調整が失敗しました:', error);
  }
}

// 例を実行
multiAgentExample();
```

---

## 🔗 関連リソース

- **[開発者リソース概要](./README.md)** - 完全な開発者ガイド
- **[クイックスタートガイド](./quick-start.md)** - すぐに始める
- **[包括的なチュートリアル](./tutorials.md)** - ステップバイステップの学習
- **[SDKドキュメント](./sdk.md)** - 言語固有のガイド
- **[コミュニティリソース](./community-resources.md)** - コミュニティサポート

---

**例のバージョン**: 1.0.0-alpha
**最終更新**: 2025年9月4日
**次回レビュー**: 2025年12月4日
**ステータス**: 本番環境対応

**⚠️ アルファ版の注意**: これらのコード例は、MPLP v1.0 Alphaの本番環境対応の実装を提供します。追加の例とユースケースは、開発者のフィードバックとコミュニティの貢献に基づいて、ベータリリースで追加される予定です。



**Multi-Agent Protocol Lifecycle Platform - コード例 v1.0.0-alpha**

[![Examples](https://img.shields.io/badge/examples-Working%20Code-green.svg)](./README.md)
[![Runnable](https://img.shields.io/badge/runnable-Copy%20%26%20Paste-blue.svg)](./tutorials.md)
[![Use Cases](https://img.shields.io/badge/use%20cases-Real%20World-orange.svg)](./quick-start.md)
[![Language](https://img.shields.io/badge/language-日本語-blue.svg)](../../en/developers/examples.md)

---

## 🎯 例の概要

このコレクションは、シンプルな単一モジュール操作から複雑なマルチエージェント調整シナリオまで、一般的なMPLPユースケースの動作するコード例を提供します。すべての例は本番環境対応で、エラー処理、ログ記録、ベストプラクティスが含まれています。

### **例のカテゴリ**
- **シンプルな例**: 基本的な単一モジュール操作
- **統合例**: マルチモジュールワークフローと外部統合
- **高度な例**: 複雑なマルチエージェント調整と最適化
- **本番環境例**: 完全なオブザーバビリティを備えたエンタープライズグレード実装

### **例の使用方法**
1. **コピー＆ペースト**: すべての例は自己完結型で実行可能
2. **修正＆拡張**: 独自の実装の出発点として使用
3. **学習＆理解**: パターンとベストプラクティスを学習
4. **テスト＆検証**: 例を実行して動作を理解

---

## 🚀 シンプルな例

### **例1: 基本的なコンテキスト管理**

#### **コンテキストの作成と取得**
```typescript
// examples/simple/context-management.ts
import { MPLPClient } from '@mplp/core';

async function contextManagementExample() {
  const client = new MPLPClient({
    core: { protocolVersion: '1.0.0-alpha', environment: 'development' },
    modules: { context: { enabled: true } }
  });

  await client.initialize();

  try {
    // コンテキストを作成
    const context = await client.context.createContext({
      contextId: 'example-context-001',
      contextType: 'user_session',
      contextData: {
        userId: 'user-123',
        sessionId: 'session-456',
        preferences: {
          language: 'ja',
          theme: 'dark',
          notifications: true
        },
        metadata: {
          userAgent: 'Mozilla/5.0...',
          ipAddress: '192.168.1.100',
          location: 'Tokyo, Japan'
        }
      },
      createdBy: 'example-app'
    });

    console.log('✅ コンテキストが作成されました:', context.contextId);

    // コンテキストを取得
    const retrievedContext = await client.context.getContext(context.contextId);
    console.log('📋 取得したコンテキスト:', retrievedContext?.contextType);

    // コンテキストデータを更新
    const updatedContext = await client.context.updateContext(context.contextId, {
      contextData: {
        ...context.contextData,
        preferences: {
          ...context.contextData.preferences,
          theme: 'light' // ユーザーがテーマを変更
        },
        lastActivity: new Date().toISOString()
      },
      updatedBy: 'example-app'
    });

    console.log('🔄 コンテキストが更新されました:', updatedContext.updatedAt);

    // コンテキストを検索
    const searchResults = await client.context.searchContexts({
      contextType: 'user_session',
      limit: 10
    });

    console.log(`🔍 ${searchResults.totalCount}個のユーザーセッションが見つかりました`);

  } catch (error) {
    console.error('❌ エラー:', error);
  } finally {
    await client.disconnect();
  }
}

contextManagementExample();
```

### **例2: プラン作成と実行**

#### **シーケンシャルワークフロー**
```typescript
// examples/simple/plan-execution.ts
import { MPLPClient } from '@mplp/core';

async function planExecutionExample() {
  const client = new MPLPClient({
    core: { protocolVersion: '1.0.0-alpha', environment: 'development' },
    modules: { context: { enabled: true }, plan: { enabled: true } }
  });

  await client.initialize();

  try {
    // コンテキストを作成
    const context = await client.context.createContext({
      contextId: 'workflow-context-001',
      contextType: 'data_processing',
      contextData: {
        inputData: { records: 1000, format: 'json' },
        processingType: 'batch'
      },
      createdBy: 'plan-example'
    });

    // プランを作成
    const plan = await client.plan.createPlan({
      planId: 'data-processing-plan-001',
      contextId: context.contextId,
      planType: 'sequential_workflow',
      planSteps: [
        {
          stepId: 'step-001-validate',
          operation: 'validate_input_data',
          parameters: { 
            schema: 'data-schema-v1',
            strictMode: true 
          },
          estimatedDuration: 2000
        },
        {
          stepId: 'step-002-transform',
          operation: 'transform_data',
          parameters: { 
            transformationType: 'normalize',
            outputFormat: 'json' 
          },
          estimatedDuration: 5000
        },
        {
          stepId: 'step-003-store',
          operation: 'store_processed_data',
          parameters: { 
            destination: 'database',
            tableName: 'processed_records' 
          },
          estimatedDuration: 3000
        },
        {
          stepId: 'step-004-notify',
          operation: 'send_completion_notification',
          parameters: { 
            recipients: ['admin@example.com'],
            includeStats: true 
          },
          estimatedDuration: 1000
        }
      ],
      createdBy: 'plan-example'
    });

    console.log('✅ プランが作成されました:', plan.planId);

    // プランを実行
    console.log('🚀 プラン実行を開始...');
    const executionResult = await client.plan.executePlan(plan.planId);

    console.log('✅ プラン実行が完了しました');
    console.log('📊 実行結果:', {
      status: executionResult.status,
      duration: executionResult.duration,
      stepsCompleted: executionResult.stepsCompleted,
      stepsFailed: executionResult.stepsFailed
    });

    // 実行詳細を取得
    const executionDetails = await client.plan.getExecutionDetails(executionResult.executionId);
    console.log('📋 実行詳細:', executionDetails);

  } catch (error) {
    console.error('❌ エラー:', error);
  } finally {
    await client.disconnect();
  }
}

planExecutionExample();
```

### **例3: ロールベースアクセス制御**

#### **ロール管理**
```typescript
// examples/simple/role-management.ts
import { MPLPClient } from '@mplp/core';

async function roleManagementExample() {
  const client = new MPLPClient({
    core: { protocolVersion: '1.0.0-alpha', environment: 'development' },
    modules: { role: { enabled: true } }
  });

  await client.initialize();

  try {
    // ロールを定義
    const adminRole = await client.role.defineRole({
      roleId: 'admin-role',
      roleName: 'Administrator',
      permissions: [
        'context.create',
        'context.read',
        'context.update',
        'context.delete',
        'plan.create',
        'plan.execute',
        'role.manage',
        'system.configure'
      ],
      description: 'フルシステムアクセス権限を持つ管理者ロール',
      createdBy: 'role-example'
    });

    const userRole = await client.role.defineRole({
      roleId: 'user-role',
      roleName: 'Standard User',
      permissions: [
        'context.read',
        'plan.read',
        'plan.execute'
      ],
      description: '標準ユーザーロール',
      createdBy: 'role-example'
    });

    console.log('✅ ロールが定義されました');

    // ユーザーにロールを割り当て
    await client.role.assignRole({
      userId: 'user-001',
      roleId: adminRole.roleId,
      assignedBy: 'role-example'
    });

    await client.role.assignRole({
      userId: 'user-002',
      roleId: userRole.roleId,
      assignedBy: 'role-example'
    });

    console.log('✅ ロールが割り当てられました');

    // 権限をチェック
    const hasPermission = await client.role.checkPermission({
      userId: 'user-001',
      permission: 'context.delete'
    });

    console.log('🔐 権限チェック結果:', hasPermission);

  } catch (error) {
    console.error('❌ エラー:', error);
  } finally {
    await client.disconnect();
  }
}

roleManagementExample();
```

---

## 🔧 統合例

### **例4: 外部API統合**

#### **RESTful API統合**
```typescript
// examples/integration/external-api.ts
import { MPLPClient } from '@mplp/core';
import axios from 'axios';

async function externalApiIntegrationExample() {
  const client = new MPLPClient({
    core: { protocolVersion: '1.0.0-alpha', environment: 'development' },
    modules: { context: { enabled: true }, plan: { enabled: true } }
  });

  await client.initialize();

  try {
    // 外部APIデータ取得のコンテキストを作成
    const context = await client.context.createContext({
      contextId: 'api-integration-001',
      contextType: 'external_api_call',
      contextData: {
        apiEndpoint: 'https://api.example.com/data',
        apiKey: process.env.API_KEY
      },
      createdBy: 'integration-example'
    });

    // API呼び出しプランを作成
    const plan = await client.plan.createPlan({
      planId: 'api-call-plan-001',
      contextId: context.contextId,
      planType: 'sequential_workflow',
      planSteps: [
        {
          stepId: 'fetch-data',
          operation: 'call_external_api',
          parameters: { method: 'GET', endpoint: '/data' },
          estimatedDuration: 2000
        },
        {
          stepId: 'process-response',
          operation: 'process_api_response',
          parameters: { format: 'json' },
          estimatedDuration: 1000
        },
        {
          stepId: 'store-result',
          operation: 'store_processed_data',
          parameters: { destination: 'cache' },
          estimatedDuration: 500
        }
      ],
      createdBy: 'integration-example'
    });

    // プランを実行
    const result = await client.plan.executePlan(plan.planId);
    console.log('✅ API統合が完了しました:', result);

  } catch (error) {
    console.error('❌ エラー:', error);
  } finally {
    await client.disconnect();
  }
}

externalApiIntegrationExample();
```

---

**ドキュメントバージョン**: 1.0
**最終更新**: 2025年9月4日
**例バージョン**: v1.0.0-alpha
**言語**: 日本語
