# MPLP 相互運用性テスト

> **🌐 言語ナビゲーション**: [English](../../en/testing/interoperability-testing.md) | [中文](../../zh-CN/testing/interoperability-testing.md) | [日本語](interoperability-testing.md) | [한국어](../../ko/testing/interoperability-testing.md) | [Español](../../es/testing/interoperability-testing.md) | [Français](../../fr/testing/interoperability-testing.md) | [Русский](../../ru/testing/interoperability-testing.md) | [Deutsch](../../de/testing/interoperability-testing.md)



**マルチエージェントプロトコルライフサイクルプラットフォーム - 相互運用性テスト v1.0.0-alpha**

[![相互運用性](https://img.shields.io/badge/interoperability-本番対応-brightgreen.svg)](./README.md)
[![互換性](https://img.shields.io/badge/compatibility-10%2F10%20モジュール-brightgreen.svg)](../implementation/multi-language-support.md)
[![テスト](https://img.shields.io/badge/testing-2869%2F2869%20合格-brightgreen.svg)](./performance-benchmarking.md)
[![実装](https://img.shields.io/badge/implementation-クロスプラットフォーム-brightgreen.svg)](./test-suites.md)
[![言語](https://img.shields.io/badge/language-日本語-blue.svg)](../../en/testing/interoperability-testing.md)

---

## 🎯 相互運用性テスト概要

このガイドは、異なるプラットフォーム、プログラミング言語、バージョン、サードパーティシステム間でのMPLP相互運用性を検証するための包括的なテスト戦略を提供します。多様なMPLP実装間のシームレスな統合と通信を保証します。

### **相互運用性テストスコープ**
- **クロスプラットフォームテスト**: Windows, Linux, macOS, コンテナ環境
- **多言語テスト**: TypeScript, Python, Java, Go, C#, Rust
- **バージョン互換性**: 後方および前方互換性検証
- **プロトコル相互運用性**: HTTP/HTTPS, WebSocket, gRPC, TCP/UDP
- **データフォーマット互換性**: JSON, Protocol Buffers, MessagePack
- **サードパーティ統合**: 外部システムとサービス統合

### **相互運用性標準**
- **プロトコル準拠**: 完全なL1-L3プロトコルスタック互換性
- **スキーマ互換性**: 言語間デュアル命名規約
- **メッセージフォーマット**: 一貫したメッセージシリアライゼーション/デシリアライゼーション
- **トランスポートプロトコル**: マルチプロトコル通信サポート
- **バージョン管理**: セマンティックバージョニングと互換性マトリックス

---

## 🌐 クロスプラットフォーム相互運用性テスト

### **プラットフォーム互換性マトリックス**

#### **オペレーティングシステム互換性テスト**
```typescript
// クロスプラットフォーム互換性テストスイート
describe('クロスプラットフォーム相互運用性', () => {
  const platforms = [
    { name: 'Windows', version: '10/11', architecture: 'x64' },
    { name: 'Linux', version: 'Ubuntu 20.04/22.04', architecture: 'x64/arm64' },
    { name: 'macOS', version: '12.0+', architecture: 'x64/arm64' },
    { name: 'Container', version: 'Docker/Kubernetes', architecture: 'multi-arch' }
  ];

  platforms.forEach(platform => {
    describe(`${platform.name} プラットフォーム`, () => {
      let mplpClient: MPLPClient;

      beforeEach(async () => {
        mplpClient = new MPLPClient({
          platform: platform.name.toLowerCase(),
          architecture: platform.architecture,
          version: platform.version
        });
        await mplpClient.initialize();
      });

      afterEach(async () => {
        await mplpClient.cleanup();
      });

      it('基本的なMPLP操作を実行できる', async () => {
        // Context作成テスト
        const context = await mplpClient.context.createContext({
          contextId: `platform-test-${platform.name.toLowerCase()}`,
          contextType: 'platform_compatibility_test',
          contextData: { 
            platform: platform.name,
            architecture: platform.architecture,
            version: platform.version
          },
          createdBy: 'platform-compatibility-test'
        });

        expect(context.contextId).toBeDefined();
        expect(context.contextType).toBe('platform_compatibility_test');

        // Plan作成テスト
        const plan = await mplpClient.plan.createPlan({
          planId: `plan-${platform.name.toLowerCase()}`,
          planType: 'platform_test_plan',
          planData: {
            targetPlatform: platform.name,
            testObjectives: ['basic_operations', 'performance', 'compatibility']
          },
          contextId: context.contextId
        });

        expect(plan.planId).toBeDefined();
        expect(plan.planType).toBe('platform_test_plan');
      });

      it('プラットフォーム間でネットワーク接続を検証する', async () => {
        const networkTest = await mplpClient.network.performConnectivityTest({
          protocols: ['http', 'https', 'websocket', 'grpc'],
          endpoints: [
            'http://localhost:3000',
            'https://api.mplp.dev',
            'ws://localhost:3001',
            'grpc://localhost:50051'
          ]
        });

        expect(networkTest.overallConnectivity).toBe(true);
        
        networkTest.protocolResults.forEach(result => {
          expect(result.connected).toBe(true);
          expect(result.latency).toBeLessThan(1000); // 最大1秒
          expect(result.errors).toHaveLength(0);
        });
      });
    });
  });
});
```

### **コンテナ環境テスト**

#### **Docker相互運用性テスト**
```yaml
# docker-compose.interop-test.yml
version: '3.8'

services:
  mplp-node:
    image: mplp/node:1.0.0-alpha
    environment:
      - NODE_ENV=test
      - MPLP_PROTOCOL_VERSION=1.0.0
    ports:
      - "3000:3000"
    networks:
      - mplp-test-network

  mplp-python:
    image: mplp/python:1.0.0-alpha
    environment:
      - PYTHON_ENV=test
      - MPLP_PROTOCOL_VERSION=1.0.0
    ports:
      - "3001:3001"
    networks:
      - mplp-test-network

  mplp-java:
    image: mplp/java:1.0.0-alpha
    environment:
      - JAVA_ENV=test
      - MPLP_PROTOCOL_VERSION=1.0.0
    ports:
      - "3002:3002"
    networks:
      - mplp-test-network

  test-runner:
    image: mplp/test-runner:latest
    depends_on:
      - mplp-node
      - mplp-python
      - mplp-java
    environment:
      - TEST_TYPE=interoperability
      - TARGET_SERVICES=mplp-node,mplp-python,mplp-java
    networks:
      - mplp-test-network
    command: npm run test:interop

networks:
  mplp-test-network:
    driver: bridge
```

#### **Kubernetes相互運用性テスト**
```yaml
# k8s-interop-test.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: mplp-interop-test
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mplp-node-service
  namespace: mplp-interop-test
spec:
  replicas: 2
  selector:
    matchLabels:
      app: mplp-node
  template:
    metadata:
      labels:
        app: mplp-node
    spec:
      containers:
      - name: mplp-node
        image: mplp/node:1.0.0-alpha
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "test"
        - name: MPLP_PROTOCOL_VERSION
          value: "1.0.0"
---
apiVersion: v1
kind: Service
metadata:
  name: mplp-node-service
  namespace: mplp-interop-test
spec:
  selector:
    app: mplp-node
  ports:
  - port: 3000
    targetPort: 3000
  type: ClusterIP
```

---

## 🔤 多言語相互運用性テスト

### **言語実装互換性マトリックス**

#### **TypeScript ↔ Python 相互運用性**
```typescript
// TypeScript-Python相互運用性テスト
describe('TypeScript-Python相互運用性', () => {
  let tsClient: MPLPClient;
  let pyClient: PythonMPLPClient;

  beforeAll(async () => {
    // TypeScriptクライアント初期化
    tsClient = new MPLPClient({
      language: 'typescript',
      protocolVersion: '1.0.0',
      endpoint: 'http://localhost:3000'
    });

    // Pythonクライアント初期化
    pyClient = new PythonMPLPClient({
      language: 'python',
      protocolVersion: '1.0.0',
      endpoint: 'http://localhost:3001'
    });

    await Promise.all([
      tsClient.initialize(),
      pyClient.initialize()
    ]);
  });

  afterAll(async () => {
    await Promise.all([
      tsClient.cleanup(),
      pyClient.cleanup()
    ]);
  });

  it('TypeScriptで作成したContextをPythonで取得できる', async () => {
    // TypeScriptでContext作成
    const contextData = {
      contextId: 'ts-py-interop-test',
      contextType: 'language_interop_test',
      contextData: {
        sourceLanguage: 'typescript',
        targetLanguage: 'python',
        testData: { message: 'Hello from TypeScript!' }
      },
      createdBy: 'typescript-client'
    };

    const tsContext = await tsClient.context.createContext(contextData);
    expect(tsContext.contextId).toBe(contextData.contextId);

    // PythonでContext取得
    const pyContext = await pyClient.context.getContext(contextData.contextId);
    expect(pyContext.contextId).toBe(contextData.contextId);
    expect(pyContext.contextType).toBe(contextData.contextType);
    expect(pyContext.contextData.sourceLanguage).toBe('typescript');
  });

  it('Pythonで作成したPlanをTypeScriptで実行できる', async () => {
    // PythonでPlan作成
    const planData = {
      planId: 'py-ts-plan-test',
      planType: 'cross_language_plan',
      planData: {
        sourceLanguage: 'python',
        targetLanguage: 'typescript',
        tasks: [
          { id: 'task1', type: 'data_processing', language: 'python' },
          { id: 'task2', type: 'ui_rendering', language: 'typescript' }
        ]
      },
      contextId: 'ts-py-interop-test'
    };

    const pyPlan = await pyClient.plan.createPlan(planData);
    expect(pyPlan.planId).toBe(planData.planId);

    // TypeScriptでPlan実行
    const executionResult = await tsClient.plan.executePlan(planData.planId);
    expect(executionResult.success).toBe(true);
    expect(executionResult.completedTasks).toHaveLength(2);
  });
});
```

#### **C# ↔ Rust 相互運用性**
```csharp
// C#-Rust相互運用性テスト
[TestClass]
public class CSharpRustInteroperabilityTest
{
    private MPLPClient csharpClient;
    private RustMPLPClient rustClient;

    [TestInitialize]
    public async Task SetUp()
    {
        // C#クライアント初期化
        csharpClient = new MPLPClient(new MPLPConfig
        {
            Language = "csharp",
            ProtocolVersion = "1.0.0",
            Endpoint = "http://localhost:3004"
        });

        // Rustクライアント初期化
        rustClient = new RustMPLPClient(new RustMPLPConfig
        {
            Language = "rust",
            ProtocolVersion = "1.0.0",
            Endpoint = "http://localhost:3005"
        });

        await Task.WhenAll(
            csharpClient.InitializeAsync(),
            rustClient.InitializeAsync()
        );
    }

    [TestCleanup]
    public async Task TearDown()
    {
        await Task.WhenAll(
            csharpClient.CleanupAsync(),
            rustClient.CleanupAsync()
        );
    }

    [TestMethod]
    public async Task TestCSharpRustDialogInteroperability()
    {
        // C#でDialog作成
        var dialogData = new DialogData
        {
            DialogId = "csharp-rust-dialog-test",
            DialogType = "cross_language_dialog",
            DialogData = new Dictionary<string, object>
            {
                ["sourceLanguage"] = "csharp",
                ["targetLanguage"] = "rust",
                ["participants"] = new[] { "csharp-agent", "rust-agent" }
            },
            CreatedBy = "csharp-client"
        };

        var csharpDialog = await csharpClient.Dialog.CreateDialogAsync(dialogData);
        Assert.AreEqual(dialogData.DialogId, csharpDialog.DialogId);

        // RustでDialog参加
        var rustParticipation = await rustClient.Dialog.JoinDialogAsync(
            dialogData.DialogId, "rust-agent"
        );
        Assert.IsTrue(rustParticipation.Success);

        // C#からメッセージ送信
        var messageResult = await csharpClient.Dialog.SendMessageAsync(
            dialogData.DialogId,
            new DialogMessage
            {
                MessageId = "msg-csharp-to-rust",
                Content = "Hello from C#!",
                Sender = "csharp-agent",
                Timestamp = DateTime.UtcNow
            }
        );
        Assert.IsTrue(messageResult.Success);

        // Rustでメッセージ受信確認
        var receivedMessages = await rustClient.Dialog.GetMessagesAsync(
            dialogData.DialogId, limit: 1
        );
        Assert.AreEqual(1, receivedMessages.Count);
        Assert.AreEqual("Hello from C#!", receivedMessages[0].Content);
    }
}
```

#### **Python ↔ TypeScript リアルタイム通信**
```python
# Python-TypeScript リアルタイム相互運用性テスト
import asyncio
import pytest
from mplp_python import MPLPClient as PythonMPLPClient
from mplp_typescript import MPLPClient as TypeScriptMPLPClient

class TestPythonTypeScriptRealtime:
    async def setup_method(self):
        # Pythonクライアント初期化
        self.py_client = PythonMPLPClient({
            'language': 'python',
            'protocol_version': '1.0.0',
            'endpoint': 'ws://localhost:3001',
            'realtime': True
        })

        # TypeScriptクライアント初期化
        self.ts_client = TypeScriptMPLPClient({
            'language': 'typescript',
            'protocol_version': '1.0.0',
            'endpoint': 'ws://localhost:3000',
            'realtime': True
        })

        await asyncio.gather(
            self.py_client.initialize(),
            self.ts_client.initialize()
        )

    async def teardown_method(self):
        await asyncio.gather(
            self.py_client.cleanup(),
            self.ts_client.cleanup()
        )

    @pytest.mark.asyncio
    async def test_realtime_context_synchronization(self):
        # Pythonでリアルタイムイベントリスナー設定
        received_events = []

        def on_context_updated(event):
            received_events.append(event)

        await self.py_client.events.subscribe('context.updated', on_context_updated)

        # TypeScriptでContext作成と更新
        context_data = {
            'context_id': 'realtime-sync-test',
            'context_type': 'realtime_sync_test',
            'context_data': {
                'source_language': 'typescript',
                'target_language': 'python',
                'realtime': True
            },
            'created_by': 'typescript-client'
        }

        ts_context = await self.ts_client.context.create_context(context_data)
        assert ts_context['context_id'] == context_data['context_id']

        # Context更新
        update_data = {
            'context_data': {
                **context_data['context_data'],
                'updated_at': '2025-09-04T12:00:00Z',
                'status': 'synchronized'
            }
        }

        await self.ts_client.context.update_context(
            context_data['context_id'],
            update_data
        )

        # Pythonでリアルタイム更新受信確認
        await asyncio.sleep(0.1)  # イベント伝播待機
        assert len(received_events) == 1
        assert received_events[0]['context_id'] == context_data['context_id']
        assert received_events[0]['context_data']['status'] == 'synchronized'

    @pytest.mark.asyncio
    async def test_bidirectional_realtime_communication(self):
        # 双方向リアルタイム通信テスト
        py_received = []
        ts_received = []

        # イベントリスナー設定
        await self.py_client.events.subscribe(
            'custom.message',
            lambda event: py_received.append(event)
        )
        await self.ts_client.events.subscribe(
            'custom.message',
            lambda event: ts_received.append(event)
        )

        # PythonからTypeScriptへメッセージ送信
        await self.py_client.events.publish('custom.message', {
            'message_id': 'py-to-ts-msg',
            'content': 'Hello from Python!',
            'sender': 'python-client',
            'timestamp': '2025-09-04T12:00:00Z'
        })

        # TypeScriptからPythonへメッセージ送信
        await self.ts_client.events.publish('custom.message', {
            'message_id': 'ts-to-py-msg',
            'content': 'Hello from TypeScript!',
            'sender': 'typescript-client',
            'timestamp': '2025-09-04T12:00:01Z'
        })

        # 双方向通信確認
        await asyncio.sleep(0.2)  # イベント伝播待機

        assert len(py_received) == 1
        assert py_received[0]['content'] == 'Hello from TypeScript!'
        assert py_received[0]['sender'] == 'typescript-client'

        assert len(ts_received) == 1
        assert ts_received[0]['content'] == 'Hello from Python!'
        assert ts_received[0]['sender'] == 'python-client'
```

#### **Java ↔ Go 相互運用性**
```java
// Java-Go相互運用性テスト
@Test
public class JavaGoInteroperabilityTest {
    private MPLPClient javaClient;
    private GoMPLPClient goClient;

    @BeforeEach
    public void setUp() throws Exception {
        // Javaクライアント初期化
        javaClient = new MPLPClient(MPLPConfig.builder()
            .language("java")
            .protocolVersion("1.0.0")
            .endpoint("http://localhost:3002")
            .build());

        // Goクライアント初期化
        goClient = new GoMPLPClient(GoMPLPConfig.builder()
            .language("go")
            .protocolVersion("1.0.0")
            .endpoint("http://localhost:3003")
            .build());

        javaClient.initialize();
        goClient.initialize();
    }

    @AfterEach
    public void tearDown() throws Exception {
        javaClient.cleanup();
        goClient.cleanup();
    }

    @Test
    public void testJavaGoRoleInteroperability() throws Exception {
        // JavaでRole作成
        RoleData roleData = RoleData.builder()
            .roleId("java-go-role-test")
            .roleType("cross_language_role")
            .roleData(Map.of(
                "sourceLanguage", "java",
                "targetLanguage", "go",
                "permissions", List.of("read", "write", "execute")
            ))
            .createdBy("java-client")
            .build();

        Role javaRole = javaClient.role().createRole(roleData);
        assertThat(javaRole.getRoleId()).isEqualTo(roleData.getRoleId());

        // GoでRole取得と権限検証
        Role goRole = goClient.role().getRole(roleData.getRoleId());
        assertThat(goRole.getRoleId()).isEqualTo(roleData.getRoleId());
        assertThat(goRole.getRoleType()).isEqualTo(roleData.getRoleType());

        // 権限検証
        boolean hasPermission = goClient.role().checkPermission(
            roleData.getRoleId(), "execute"
        );
        assertThat(hasPermission).isTrue();
    }
}
```

---

## 🔄 プロトコルバージョン互換性テスト

### **バージョン互換性マトリックス**

#### **後方互換性テスト**
```typescript
// 後方互換性テストスイート
describe('MPLP後方互換性テスト', () => {
  const versionPairs = [
    { current: '1.0.0', previous: '1.0.0-alpha' },
    { current: '1.0.0', previous: '1.0.0-beta' },
    { current: '1.1.0', previous: '1.0.0' },
    { current: '1.1.0', previous: '1.0.0-beta' }
  ];

  versionPairs.forEach(({ current, previous }) => {
    describe(`バージョン ${current} → ${previous} 後方互換性`, () => {
      let currentClient: MPLPClient;
      let previousClient: MPLPClient;

      beforeEach(async () => {
        currentClient = new MPLPClient({ 
          protocolVersion: current 
        });
        previousClient = new MPLPClient({ 
          protocolVersion: previous 
        });

        await Promise.all([
          currentClient.initialize(),
          previousClient.initialize()
        ]);
      });

      afterEach(async () => {
        await Promise.all([
          currentClient.cleanup(),
          previousClient.cleanup()
        ]);
      });

      it('新しいバージョンが古いバージョンのデータを読み取れる', async () => {
        // 古いバージョンでデータ作成
        const contextData = {
          contextId: `backward-compat-${previous}-${current}`,
          contextType: 'backward_compatibility_test',
          contextData: { 
            createdWithVersion: previous,
            testData: 'backward compatibility test data'
          },
          createdBy: `client-${previous}`
        };

        const oldContext = await previousClient.context.createContext(contextData);
        expect(oldContext.contextId).toBe(contextData.contextId);

        // 新しいバージョンでデータ取得
        const newContext = await currentClient.context.getContext(contextData.contextId);
        expect(newContext.contextId).toBe(contextData.contextId);
        expect(newContext.contextType).toBe(contextData.contextType);
        expect(newContext.contextData.createdWithVersion).toBe(previous);
      });

      it('古いバージョンが新しいバージョンの基本データを読み取れる', async () => {
        // 新しいバージョンで基本データ作成（後方互換性を保つ）
        const contextData = {
          contextId: `forward-compat-${current}-${previous}`,
          contextType: 'forward_compatibility_test',
          contextData: { 
            createdWithVersion: current,
            testData: 'forward compatibility test data'
          },
          createdBy: `client-${current}`
        };

        const newContext = await currentClient.context.createContext(contextData);
        expect(newContext.contextId).toBe(contextData.contextId);

        // 古いバージョンでデータ取得
        const oldContext = await previousClient.context.getContext(contextData.contextId);
        expect(oldContext.contextId).toBe(contextData.contextId);
        expect(oldContext.contextType).toBe(contextData.contextType);
      });
    });
  });
});
```

---

## 🌍 サードパーティ統合テスト

### **外部システム統合**

#### **データベース統合テスト**
```typescript
// データベース統合相互運用性テスト
describe('データベース統合相互運用性', () => {
  const databases = [
    { type: 'postgresql', version: '13+', driver: 'pg' },
    { type: 'mysql', version: '8.0+', driver: 'mysql2' },
    { type: 'mongodb', version: '5.0+', driver: 'mongodb' },
    { type: 'redis', version: '6.0+', driver: 'redis' }
  ];

  databases.forEach(db => {
    describe(`${db.type} 統合`, () => {
      let mplpClient: MPLPClient;
      let dbConnection: any;

      beforeEach(async () => {
        mplpClient = new MPLPClient({
          database: {
            type: db.type,
            version: db.version,
            driver: db.driver
          }
        });

        dbConnection = await mplpClient.database.connect();
        await mplpClient.initialize();
      });

      afterEach(async () => {
        await mplpClient.cleanup();
        await dbConnection.close();
      });

      it(`${db.type}でMPLPデータを永続化できる`, async () => {
        // Context作成とDB保存
        const context = await mplpClient.context.createContext({
          contextId: `db-integration-${db.type}`,
          contextType: 'database_integration_test',
          contextData: { 
            databaseType: db.type,
            testTimestamp: new Date().toISOString()
          },
          createdBy: 'database-integration-test'
        });

        // データベースから直接検証
        const dbResult = await dbConnection.query(
          'SELECT * FROM contexts WHERE context_id = ?',
          [context.contextId]
        );

        expect(dbResult.rows).toHaveLength(1);
        expect(dbResult.rows[0].context_id).toBe(context.contextId);
      });
    });
  });
});
```

#### **メッセージキュー統合テスト**
```typescript
// メッセージキュー統合テスト
describe('メッセージキュー統合相互運用性', () => {
  const messageQueues = [
    { type: 'rabbitmq', version: '3.8+' },
    { type: 'apache-kafka', version: '2.8+' },
    { type: 'redis-streams', version: '6.0+' },
    { type: 'aws-sqs', version: 'latest' }
  ];

  messageQueues.forEach(mq => {
    describe(`${mq.type} 統合`, () => {
      let mplpClient: MPLPClient;
      let mqConnection: any;

      beforeEach(async () => {
        mplpClient = new MPLPClient({
          messageQueue: {
            type: mq.type,
            version: mq.version
          }
        });

        mqConnection = await mplpClient.messageQueue.connect();
        await mplpClient.initialize();
      });

      afterEach(async () => {
        await mplpClient.cleanup();
        await mqConnection.close();
      });

      it(`${mq.type}でMPLPイベントを配信できる`, async () => {
        const eventData = {
          eventId: `mq-integration-${mq.type}`,
          eventType: 'context.created',
          eventData: {
            contextId: 'test-context',
            messageQueueType: mq.type
          },
          timestamp: new Date().toISOString()
        };

        // イベント発行
        await mplpClient.events.publish(eventData);

        // メッセージキューから受信確認
        const receivedMessage = await mqConnection.consume('mplp.events');
        expect(receivedMessage.eventId).toBe(eventData.eventId);
        expect(receivedMessage.eventType).toBe(eventData.eventType);
      });
    });
  });
});
```

---

## 🔄 リアルタイム通信テスト

### **WebSocket相互運用性**

#### **リアルタイムイベント配信テスト**
```typescript
// WebSocket相互運用性テスト
describe('WebSocket相互運用性', () => {
  let wsServer: WebSocketServer;
  let wsClient1: WebSocketClient;
  let wsClient2: WebSocketClient;

  beforeAll(async () => {
    wsServer = new WebSocketServer({ port: 8080 });
    await wsServer.start();
  });

  afterAll(async () => {
    await wsServer.stop();
  });

  beforeEach(async () => {
    wsClient1 = new WebSocketClient('ws://localhost:8080');
    wsClient2 = new WebSocketClient('ws://localhost:8080');

    await Promise.all([
      wsClient1.connect(),
      wsClient2.connect()
    ]);
  });

  afterEach(async () => {
    await Promise.all([
      wsClient1.disconnect(),
      wsClient2.disconnect()
    ]);
  });

  it('複数クライアント間でリアルタイムイベントを配信できる', async () => {
    const eventPromise = new Promise((resolve) => {
      wsClient2.on('context.updated', resolve);
    });

    // クライアント1からイベント送信
    await wsClient1.emit('context.update', {
      contextId: 'realtime-test-context',
      updateData: { status: 'updated' },
      timestamp: new Date().toISOString()
    });

    // クライアント2でイベント受信確認
    const receivedEvent = await eventPromise;
    expect(receivedEvent.contextId).toBe('realtime-test-context');
    expect(receivedEvent.updateData.status).toBe('updated');
  });
});
```

### **gRPC相互運用性**

#### **高性能通信テスト**
```typescript
// gRPC相互運用性テスト
describe('gRPC相互運用性', () => {
  let grpcServer: GRPCServer;
  let grpcClient: GRPCClient;

  beforeAll(async () => {
    grpcServer = new GRPCServer({
      port: 50051,
      protoPath: './proto/mplp.proto'
    });
    await grpcServer.start();
  });

  afterAll(async () => {
    await grpcServer.stop();
  });

  beforeEach(async () => {
    grpcClient = new GRPCClient({
      endpoint: 'localhost:50051',
      protoPath: './proto/mplp.proto'
    });
    await grpcClient.connect();
  });

  afterEach(async () => {
    await grpcClient.disconnect();
  });

  it('gRPCでMPLP操作を高性能実行できる', async () => {
    const startTime = Date.now();

    // 大量のContext作成テスト
    const contextPromises = Array.from({ length: 100 }, (_, i) => 
      grpcClient.context.createContext({
        contextId: `grpc-perf-test-${i}`,
        contextType: 'performance_test',
        contextData: { index: i },
        createdBy: 'grpc-performance-test'
      })
    );

    const contexts = await Promise.all(contextPromises);
    const endTime = Date.now();

    expect(contexts).toHaveLength(100);
    expect(endTime - startTime).toBeLessThan(5000); // 5秒以内

    // 全てのContextが正しく作成されていることを確認
    contexts.forEach((context, index) => {
      expect(context.contextId).toBe(`grpc-perf-test-${index}`);
      expect(context.contextType).toBe('performance_test');
    });
  });
});
```

---

## 🔄 データフォーマット互換性テスト

### **シリアライゼーション互換性**

#### **JSON ↔ Protocol Buffers 互換性**
```typescript
// データフォーマット互換性テスト
describe('データフォーマット互換性', () => {
  let jsonClient: MPLPClient;
  let protobufClient: MPLPClient;

  beforeEach(async () => {
    jsonClient = new MPLPClient({
      dataFormat: 'json',
      protocolVersion: '1.0.0'
    });

    protobufClient = new MPLPClient({
      dataFormat: 'protobuf',
      protocolVersion: '1.0.0'
    });

    await Promise.all([
      jsonClient.initialize(),
      protobufClient.initialize()
    ]);
  });

  afterEach(async () => {
    await Promise.all([
      jsonClient.cleanup(),
      protobufClient.cleanup()
    ]);
  });

  it('JSONで作成したデータをProtocol Buffersで読み取れる', async () => {
    // JSONクライアントでContext作成
    const contextData = {
      contextId: 'json-protobuf-test',
      contextType: 'format_compatibility_test',
      contextData: {
        sourceFormat: 'json',
        targetFormat: 'protobuf',
        complexData: {
          nested: { value: 42 },
          array: [1, 2, 3],
          boolean: true
        }
      },
      createdBy: 'json-client'
    };

    const jsonContext = await jsonClient.context.createContext(contextData);
    expect(jsonContext.contextId).toBe(contextData.contextId);

    // Protocol BuffersクライアントでContext取得
    const protobufContext = await protobufClient.context.getContext(contextData.contextId);
    expect(protobufContext.contextId).toBe(contextData.contextId);
    expect(protobufContext.contextData.sourceFormat).toBe('json');
    expect(protobufContext.contextData.complexData.nested.value).toBe(42);
  });
});
```

---

## 🧪 統合テストシナリオ

### **エンドツーエンド相互運用性テスト**

#### **マルチ言語・マルチプラットフォーム統合テスト**
```typescript
// 包括的統合テストシナリオ
describe('エンドツーエンド相互運用性', () => {
  let tsClient: MPLPClient;    // TypeScript on Windows
  let pyClient: PythonClient;  // Python on Linux
  let javaClient: JavaClient;  // Java on macOS
  let goClient: GoClient;      // Go on Container

  beforeAll(async () => {
    // 異なるプラットフォームでの複数言語クライアント初期化
    tsClient = new MPLPClient({
      language: 'typescript',
      platform: 'windows',
      endpoint: 'http://windows-host:3000'
    });

    pyClient = new PythonClient({
      language: 'python',
      platform: 'linux',
      endpoint: 'http://linux-host:3001'
    });

    javaClient = new JavaClient({
      language: 'java',
      platform: 'macos',
      endpoint: 'http://macos-host:3002'
    });

    goClient = new GoClient({
      language: 'go',
      platform: 'container',
      endpoint: 'http://container-host:3003'
    });

    await Promise.all([
      tsClient.initialize(),
      pyClient.initialize(),
      javaClient.initialize(),
      goClient.initialize()
    ]);
  });

  afterAll(async () => {
    await Promise.all([
      tsClient.cleanup(),
      pyClient.cleanup(),
      javaClient.cleanup(),
      goClient.cleanup()
    ]);
  });

  it('複雑なマルチ言語ワークフローを実行できる', async () => {
    // 1. TypeScript (Windows) でContext作成
    const context = await tsClient.context.createContext({
      contextId: 'multi-lang-workflow',
      contextType: 'cross_platform_workflow',
      contextData: { 
        workflow: 'multi-language-integration',
        platforms: ['windows', 'linux', 'macos', 'container']
      },
      createdBy: 'typescript-client'
    });

    // 2. Python (Linux) でPlan作成
    const plan = await pyClient.plan.createPlan({
      planId: 'multi-lang-plan',
      planType: 'cross_platform_plan',
      planData: {
        tasks: [
          { id: 'task1', assignedTo: 'typescript', platform: 'windows' },
          { id: 'task2', assignedTo: 'python', platform: 'linux' },
          { id: 'task3', assignedTo: 'java', platform: 'macos' },
          { id: 'task4', assignedTo: 'go', platform: 'container' }
        ]
      },
      contextId: context.contextId
    });

    // 3. Java (macOS) でRole作成と権限設定
    const role = await javaClient.role.createRole({
      roleId: 'multi-lang-executor',
      roleType: 'cross_platform_executor',
      roleData: {
        permissions: ['execute', 'read', 'write'],
        platforms: ['windows', 'linux', 'macos', 'container']
      },
      contextId: context.contextId
    });

    // 4. Go (Container) でワークフロー実行
    const execution = await goClient.core.executeWorkflow({
      workflowId: 'multi-lang-workflow',
      planId: plan.planId,
      roleId: role.roleId,
      contextId: context.contextId
    });

    // 5. 全クライアントで結果検証
    const [tsResult, pyResult, javaResult, goResult] = await Promise.all([
      tsClient.trace.getExecutionTrace(execution.executionId),
      pyClient.trace.getExecutionTrace(execution.executionId),
      javaClient.trace.getExecutionTrace(execution.executionId),
      goClient.trace.getExecutionTrace(execution.executionId)
    ]);

    // 全ての結果が一致することを確認
    expect(tsResult.executionId).toBe(execution.executionId);
    expect(pyResult.executionId).toBe(execution.executionId);
    expect(javaResult.executionId).toBe(execution.executionId);
    expect(goResult.executionId).toBe(execution.executionId);

    expect(execution.success).toBe(true);
    expect(execution.completedTasks).toHaveLength(4);
  });
});
```

---

## 🔄 継続的統合テスト

### **CI/CD パイプライン統合**

#### **GitHub Actions 相互運用性テスト**
```yaml
# .github/workflows/interoperability-test.yml
name: MPLP Interoperability Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]
  schedule:
    - cron: '0 2 * * *'  # 毎日午前2時に実行

env:
  NODE_VERSION: '18'
  PYTHON_VERSION: '3.9'
  JAVA_VERSION: '11'
  GO_VERSION: '1.19'

jobs:
  cross-platform-test:
    name: Cross-Platform Interoperability
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        node-version: [16, 18, 20]
    runs-on: ${{ matrix.os }}
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run cross-platform tests
        run: npm run test:interop:platform
        env:
          CI: true
          PLATFORM: ${{ matrix.os }}
          NODE_VERSION: ${{ matrix.node-version }}

  multi-language-test:
    name: Multi-Language Interoperability
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_PASSWORD: test_password
          POSTGRES_DB: mplp_interop_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
      
      redis:
        image: redis:6
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: ${{ env.PYTHON_VERSION }}
      
      - name: Setup Java
        uses: actions/setup-java@v3
        with:
          java-version: ${{ env.JAVA_VERSION }}
          distribution: 'temurin'
      
      - name: Setup Go
        uses: actions/setup-go@v4
        with:
          go-version: ${{ env.GO_VERSION }}
      
      - name: Install Node.js dependencies
        run: npm ci
      
      - name: Install Python dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements-interop.txt
      
      - name: Install Java dependencies
        run: ./gradlew build -x test
      
      - name: Install Go dependencies
        run: go mod download
      
      - name: Start test services
        run: docker-compose -f docker-compose.interop-test.yml up -d
      
      - name: Wait for services
        run: npm run wait-for-services
      
      - name: Run multi-language interoperability tests
        run: npm run test:interop:multilang
        env:
          CI: true
          DATABASE_URL: postgresql://postgres:test_password@localhost:5432/mplp_interop_test
          REDIS_URL: redis://localhost:6379
      
      - name: Cleanup test services
        if: always()
        run: docker-compose -f docker-compose.interop-test.yml down

  version-compatibility-test:
    name: Version Compatibility
    runs-on: ubuntu-latest
    strategy:
      matrix:
        version: ['1.0.0-alpha', '1.0.0-beta', '1.0.0']
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run version compatibility tests
        run: npm run test:interop:version
        env:
          CI: true
          TARGET_VERSION: ${{ matrix.version }}
          CURRENT_VERSION: '1.0.0-alpha'

  third-party-integration-test:
    name: Third-Party Integration
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Start third-party services
        run: docker-compose -f docker-compose.third-party.yml up -d
      
      - name: Run third-party integration tests
        run: npm run test:interop:third-party
        env:
          CI: true
      
      - name: Cleanup third-party services
        if: always()
        run: docker-compose -f docker-compose.third-party.yml down

  performance-interop-test:
    name: Performance Interoperability
    runs-on: ubuntu-latest
    if: github.event_name == 'schedule' || contains(github.event.head_commit.message, '[perf-interop]')
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run performance interoperability tests
        run: npm run test:interop:performance
        env:
          CI: true
          PERFORMANCE_TEST_DURATION: 300 # 5分間
          PERFORMANCE_TEST_CONCURRENCY: 50
      
      - name: Upload performance report
        uses: actions/upload-artifact@v3
        with:
          name: interop-performance-report
          path: reports/interop-performance/
```

---

## 🔄 プロトコルバージョン互換性テスト

### **バージョン互換性マトリックス**

#### **プロトコルバージョン互換性テスト**
```typescript
// プロトコルバージョン互換性テストスイート
describe('MPLPバージョン互換性テスト', () => {
  const versionMatrix = [
    { version: '1.0.0-alpha', compatible: ['1.0.0-alpha'] },
    { version: '1.0.0-beta', compatible: ['1.0.0-alpha', '1.0.0-beta'] },
    { version: '1.0.0', compatible: ['1.0.0-alpha', '1.0.0-beta', '1.0.0'] },
    { version: '1.1.0', compatible: ['1.0.0', '1.1.0'] }
  ];

  versionMatrix.forEach(currentVersion => {
    describe(`バージョン ${currentVersion.version} 互換性`, () => {
      currentVersion.compatible.forEach(compatibleVersion => {
        it(`バージョン ${compatibleVersion} と互換性がある`, async () => {
          const currentClient = new MPLPClient({ 
            protocolVersion: currentVersion.version 
          });
          const compatibleClient = new MPLPClient({ 
            protocolVersion: compatibleVersion 
          });

          // 基本通信テスト
          const context = await currentClient.context.createContext({
            contextId: `ctx-version-test-${currentVersion.version}-${compatibleVersion}`,
            contextType: 'version_compatibility_test',
            contextData: { 
              currentVersion: currentVersion.version,
              compatibleVersion: compatibleVersion
            },
            createdBy: 'version-compatibility-test'
          });

          const retrievedContext = await compatibleClient.context.getContext(context.contextId);
          expect(retrievedContext.contextId).toBe(context.contextId);

          // プロトコルネゴシエーションテスト
          const negotiationResult = await currentClient.core.negotiateProtocolVersion(compatibleVersion);
          expect(negotiationResult.negotiated).toBe(true);
          expect(negotiationResult.agreedVersion).toBeDefined();
        });
      });
    });
  });
});
```

---

## 🔗 関連ドキュメント

- [テストフレームワーク概要](./README.md) - テストフレームワーク概要
- [プロトコル準拠テスト](./protocol-compliance-testing.md) - L1-L3プロトコル検証
- [パフォーマンスベンチマーク](./performance-benchmarking.md) - パフォーマンス検証
- [セキュリティテスト](./security-testing.md) - セキュリティ検証
- [多言語サポート](../implementation/multi-language-support.md) - 言語実装

---

**相互運用性テストバージョン**: 1.0.0-alpha  
**最終更新**: 2025年9月4日  
**次回レビュー**: 2025年12月4日  
**ステータス**: エンタープライズ検証済み  

**⚠️ Alphaお知らせ**: この相互運用性テストガイドは、MPLP v1.0 Alphaに対する包括的なクロスプラットフォームおよび多言語検証を提供します。統合フィードバックとプラットフォームの進化に基づいて、Betaリリースで追加の相互運用性テストと互換性機能が追加される予定です。
