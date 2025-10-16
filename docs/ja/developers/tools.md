# MPLP開発ツール

> **🌐 言語ナビゲーション**: [English](../../en/developers/tools.md) | [中文](../../zh-CN/developers/tools.md) | [日本語](tools.md)



**Multi-Agent Protocol Lifecycle Platform - 開発ツール v1.0.0-alpha**

[![Tools](https://img.shields.io/badge/tools-CLI%20%26%20Utilities-green.svg)](./README.md)
[![CLI](https://img.shields.io/badge/cli-Command%20Line-blue.svg)](./quick-start.md)
[![Utilities](https://img.shields.io/badge/utilities-Developer%20Friendly-orange.svg)](./examples.md)
[![Language](https://img.shields.io/badge/language-日本語-blue.svg)](../../en/developers/tools.md)

---

## 🎯 開発ツール概要

MPLPは、マルチエージェントシステムの開発、テスト、デプロイを効率化するために設計された包括的な開発ツールスイートを提供します。これらのツールには、CLIユーティリティ、開発サーバー、デバッグツール、生産性向上ツールが含まれます。

### **ツールカテゴリ**
- **CLIツール**: プロジェクト管理と自動化のためのコマンドラインユーティリティ
- **開発サーバー**: デバッグ機能付きホットリロード開発環境
- **コード生成**: 自動化されたコードスキャフォールディングとボイラープレート生成
- **テストツール**: 自動化されたテストと検証ユーティリティ
- **デバッグツール**: リアルタイムデバッグと監視機能
- **デプロイツール**: 本番環境へのデプロイと管理ユーティリティ

### **インストール**
```bash
# MPLP CLIをグローバルにインストール
npm install -g @mplp/cli

# 開発ツールをインストール
npm install -g @mplp/dev-tools

# デバッグユーティリティをインストール
npm install -g @mplp/debug-tools

# インストールを確認
mplp --version
mplp-dev --version
mplp-debug --version
```

---

## 🛠️ MPLP CLI

### **プロジェクト管理コマンド**

#### **プロジェクトの作成と初期化**
```bash
# 新しいMPLPプロジェクトを作成
mplp create <project-name> [options]

# 利用可能なテンプレート
mplp create my-agent --template=basic          # 基本的な単一エージェントプロジェクト
mplp create my-system --template=multi-agent  # マルチエージェント調整
mplp create my-api --template=api-server      # MPLPを使用したAPIサーバー
mplp create my-integration --template=integration # 外部システム統合

# 既存のプロジェクトを初期化
mplp init [options]

# プロジェクト構造オプション
mplp create my-project --structure=monorepo    # モノレポ構造
mplp create my-project --structure=microservices # マイクロサービス構造
```

#### **開発サーバー**
```bash
# 開発サーバーを起動
mplp dev [options]

# 開発サーバーオプション
mplp dev --port=3000                    # カスタムポート
mplp dev --hot-reload                   # ホットリロードを有効化
mplp dev --debug                        # デバッグモードを有効化
mplp dev --trace                        # リクエストトレースを有効化
mplp dev --mock-external                # 外部サービスをモック

# 開発サーバー機能:
# - コード変更時のホットリロード
# - リアルタイムプロトコル検証
# - インタラクティブAPIエクスプローラー
# - ライブトレース可視化
# - パフォーマンス監視ダッシュボード
# - 外部サービスレスポンスのモック
```

#### **コード生成**
```bash
# モジュールコンポーネントを生成
mplp generate context <name>           # コンテキストサービスを生成
mplp generate plan <name>              # プランサービスを生成
mplp generate role <name>              # ロールサービスを生成
mplp generate agent <name>             # エージェントテンプレートを生成

# 統合コンポーネントを生成
mplp generate api <name>               # APIエンドポイントを生成
mplp generate client <name>            # クライアントライブラリを生成
mplp generate adapter <name>           # 外部アダプターを生成

# テストファイルを生成
mplp generate test <component>         # テストスイートを生成
mplp generate mock <service>           # モックサービスを生成

# 例: 完全なモジュールを生成
mplp generate module user-management --include=context,plan,role,tests
```

### **テストと検証コマンド**

#### **テスト実行**
```bash
# すべてのテストを実行
mplp test [options]

# 特定のテストタイプを実行
mplp test --unit                       # 単体テストのみ
mplp test --integration                # 統合テストのみ
mplp test --e2e                        # エンドツーエンドテストのみ
mplp test --performance                # パフォーマンステストのみ
mplp test --security                   # セキュリティテストのみ

# カバレッジ付きテスト
mplp test --coverage                   # カバレッジレポートを生成
mplp test --coverage --threshold=90    # 90%のカバレッジを要求

# 特定のモジュールをテスト
mplp test --module=context             # コンテキストモジュールのみテスト
mplp test --module=plan,role           # 複数のモジュールをテスト
```

#### **プロトコル検証**
```bash
# プロトコル準拠を検証
mplp validate [options]

# 検証タイプ
mplp validate --protocol               # プロトコル準拠
mplp validate --schema                 # スキーマ検証
mplp validate --naming                 # 命名規則
mplp validate --performance            # パフォーマンス要件
mplp validate --security               # セキュリティ要件

# 特定のファイルを検証
mplp validate --file=src/services/context.ts
mplp validate --directory=src/modules/
```

#### **パフォーマンスベンチマーク**
```bash
# パフォーマンスベンチマークを実行
mplp benchmark [options]

# ベンチマークタイプ
mplp benchmark --load                  # 負荷テスト
mplp benchmark --stress                # ストレステスト
mplp benchmark --scalability           # スケーラビリティテスト
mplp benchmark --memory                # メモリ使用量テスト

# カスタムベンチマーク設定
mplp benchmark --duration=300          # 5分間
mplp benchmark --concurrency=100       # 100同時ユーザー
mplp benchmark --rps=1000              # 1秒あたり1000リクエスト
```

### **デプロイコマンド**

#### **ビルドとパッケージ**
```bash
# 本番環境用にビルド
mplp build [options]

# ビルドオプション
mplp build --target=node               # Node.jsターゲット
mplp build --target=browser            # ブラウザターゲット
mplp build --target=docker             # Dockerコンテナ
mplp build --optimize                  # 最適化を有効化
mplp build --minify                    # 出力を最小化

# 配布用にパッケージ
mplp package [options]
mplp package --format=npm              # NPMパッケージ
mplp package --format=docker           # Dockerイメージ
mplp package --format=zip              # ZIPアーカイブ
```

#### **デプロイ**
```bash
# 環境にデプロイ
mplp deploy <environment> [options]

# デプロイターゲット
mplp deploy staging                    # ステージングにデプロイ
mplp deploy production                 # 本番環境にデプロイ
mplp deploy local                      # ローカルにデプロイ

# デプロイオプション
mplp deploy staging --strategy=rolling # ローリングデプロイ
mplp deploy staging --strategy=blue-green # ブルーグリーンデプロイ
mplp deploy staging --dry-run          # ドライランデプロイ
```

---

## 🔧 開発サーバー

### **インタラクティブ開発環境**

#### **開発サーバー機能**
```typescript
// mplp.dev.config.ts
export default {
  server: {
    port: 3000,
    host: '0.0.0.0',
    https: false
  },

  features: {
    hotReload: true,
    autoRestart: true,
    liveReload: true,
    sourceMap: true
  },

  debugging: {
    enabled: true,
    logLevel: 'debug',
    traceRequests: true,
    profilePerformance: true
  },

  mocking: {
    externalServices: true,
    database: true,
    messageQueue: true
  },

  monitoring: {
    metrics: true,
    healthCheck: true,
    dashboard: true
  }
};
```

#### **インタラクティブAPIエクスプローラー**
```bash
# APIエクスプローラーにアクセス
# http://localhost:3000/api-explorer

# 機能:
# - インタラクティブAPIドキュメント
# - リクエスト/レスポンステスト
# - スキーマ検証
# - リアルタイムプロトコル準拠チェック
# - パフォーマンスメトリクス
# - エラーデバッグ
```

#### **ライブトレース可視化**
```bash
# トレースダッシュボードにアクセス
# http://localhost:3000/traces

# 機能:
# - リアルタイムトレース可視化
# - モジュール間の分散トレース
# - パフォーマンスボトルネックの特定
# - エラー追跡とデバッグ
# - カスタムトレースフィルタリング
# - トレースデータのエクスポート
```

---

## 🐛 デバッグツール

### **MPLP Debug CLI**

#### **リアルタイムデバッグ**
```bash
# デバッグセッションを開始
mplp-debug connect <target> [options]

# デバッグターゲット
mplp-debug connect localhost:3000      # ローカル開発サーバー
mplp-debug connect staging.mplp.dev    # リモートステージング環境
mplp-debug connect production.mplp.dev # 本番環境（読み取り専用）

# デバッグセッション機能
mplp-debug inspect context <contextId> # コンテキスト状態を検査
mplp-debug inspect plan <planId>       # プラン実行を検査
mplp-debug inspect trace <traceId>     # トレース詳細を検査
mplp-debug inspect agent <agentId>     # エージェントステータスを検査
```

#### **パフォーマンスプロファイリング**
```bash
# パフォーマンスプロファイリングを開始
mplp-debug profile start [options]

# プロファイリングオプション
mplp-debug profile start --duration=60    # 60秒間プロファイル
mplp-debug profile start --memory         # メモリプロファイリングを含む
mplp-debug profile start --cpu            # CPUプロファイリングを含む
mplp-debug profile start --network        # ネットワークプロファイリングを含む

# プロファイリング結果を表示
mplp-debug profile view <profileId>
mplp-debug profile export <profileId> --format=json
```

#### **ログ分析**
```bash
# リアルタイムでログを分析
mplp-debug logs follow [options]

# ログフィルタリング
mplp-debug logs follow --level=error     # エラーログのみ
mplp-debug logs follow --module=context  # コンテキストモジュールログ
mplp-debug logs follow --trace=<traceId> # 特定のトレースログ

# ログ検索と分析
mplp-debug logs search "error" --last=1h
mplp-debug logs analyze --pattern="timeout"
```

### **インタラクティブデバッガー**

#### **ブレークポイントデバッグ**
```typescript
// コード内でインタラクティブデバッグを有効化
import { MPLPDebugger } from '@mplp/debug-tools';

const debugger = new MPLPDebugger({
  enabled: process.env.NODE_ENV === 'development',
  breakpoints: true,
  stepThrough: true,
  variableInspection: true
});

// ブレークポイントを設定
debugger.breakpoint('context-creation', async (context) => {
  // インタラクティブデバッグセッション
  console.log('コンテキスト作成ブレークポイントヒット:', context.contextId);

  // 変数を検査
  await debugger.inspect('context', context);

  // 実行をステップスルー
  await debugger.stepThrough();
});

// サービスで使用
export class ContextService {
  async createContext(request: CreateContextRequest): Promise<ContextEntity> {
    // 作成前のブレークポイント
    await debugger.breakpoint('context-creation', request);

    const context = await this.repository.create(request);

    // 作成後のブレークポイント
    await debugger.breakpoint('context-created', context);

    return context;
  }
}
```

---

## 🧪 テストツール

### **自動テスト生成**

#### **テストスキャフォールディング**
```bash
# 包括的なテストスイートを生成
mplp-test generate <component> [options]

# テスト生成オプション
mplp-test generate context-service --unit        # 単体テスト
mplp-test generate context-service --integration # 統合テスト
mplp-test generate context-service --e2e         # エンドツーエンドテスト
mplp-test generate context-service --all         # すべてのテストタイプ

# テストデータを生成
mplp-test generate-data <schema> --count=100     # 100件のテストレコードを生成
mplp-test generate-mocks <service>               # モック実装を生成
```

#### **テスト実行とレポート**
```bash
# 詳細なレポート付きでテストを実行
mplp-test run [options]

# テスト実行オプション
mplp-test run --parallel                # 並列実行
mplp-test run --watch                   # ウォッチモード
mplp-test run --coverage                # カバレッジレポート
mplp-test run --reporter=html           # HTMLレポート

# テスト結果分析
mplp-test analyze --failures            # テスト失敗を分析
mplp-test analyze --performance         # パフォーマンス分析
mplp-test analyze --trends              # テストトレンド分析
```

### **モックサービスジェネレーター**

#### **外部サービスモック**
```typescript
// モックサービスを生成
import { MockGenerator } from '@mplp/dev-tools';

const mockGenerator = new MockGenerator();

// 外部API用のモックを生成
const weatherAPIMock = mockGenerator.generateAPIMock({
  name: 'WeatherAPI',
  baseUrl: 'https://api.weather.com',
  endpoints: [
    {
      path: '/current',
      method: 'GET',
      response: {
        temperature: () => Math.random() * 40,
        humidity: () => Math.random() * 100,
        description: () => ['sunny', 'cloudy', 'rainy'][Math.floor(Math.random() * 3)]
      }
    }
  ]
});

// テストでモックを使用
describe('Weather Integration', () => {
  beforeEach(() => {
    weatherAPIMock.start();
  });

  afterEach(() => {
    weatherAPIMock.stop();
  });

  it('should fetch weather data', async () => {
    const result = await weatherService.getCurrentWeather('London');
    expect(result.temperature).toBeDefined();
  });
});
```

---

## 📊 監視と分析ツール

### **パフォーマンス監視**

#### **リアルタイムメトリクスダッシュボード**
```bash
# 監視ダッシュボードを起動
mplp-monitor dashboard [options]

# ダッシュボード機能:
# - リアルタイムパフォーマンスメトリクス
# - リクエスト/レスポンス監視
# - エラー率追跡
# - リソース使用率
# - カスタムメトリクス可視化
# - アラート設定
```

#### **カスタムメトリクス収集**
```typescript
// アプリケーション内のカスタムメトリクス
import { MetricsCollector } from '@mplp/monitoring';

const metrics = new MetricsCollector({
  namespace: 'my-agent-system',
  tags: {
    environment: process.env.NODE_ENV,
    version: process.env.APP_VERSION
  }
});

// カスタムメトリクスを収集
metrics.counter('context.created').increment();
metrics.histogram('plan.execution.duration').observe(executionTime);
metrics.gauge('agent.active.count').set(activeAgentCount);

// メトリクスをエクスポート
app.get('/metrics', (req, res) => {
  res.set('Content-Type', metrics.contentType);
  res.end(metrics.register.metrics());
});
```

---

## 🔗 関連リソース

- **[開発者リソース概要](./README.md)** - 完全な開発者ガイド
- **[クイックスタートガイド](./quick-start.md)** - すぐに始める
- **[包括的なチュートリアル](./tutorials.md)** - ステップバイステップの学習
- **[コード例](./examples.md)** - 動作するコードサンプル
- **[SDKドキュメント](./sdk.md)** - 言語固有のガイド

---

**開発ツールバージョン**: 1.0.0-alpha
**最終更新**: 2025年9月4日
**次回レビュー**: 2025年12月4日
**ステータス**: 本番環境対応

**⚠️ アルファ版の注意**: これらの開発ツールは、MPLP v1.0 Alpha開発の包括的なサポートを提供します。追加のツールとIDE統合は、開発者のフィードバックと生産性要件に基づいて、ベータリリースで追加される予定です。



**Multi-Agent Protocol Lifecycle Platform - 開発ツール v1.0.0-alpha**

[![Tools](https://img.shields.io/badge/tools-CLI%20%26%20Utilities-green.svg)](./README.md)
[![CLI](https://img.shields.io/badge/cli-Command%20Line-blue.svg)](./quick-start.md)
[![Utilities](https://img.shields.io/badge/utilities-Developer%20Friendly-orange.svg)](./examples.md)
[![Language](https://img.shields.io/badge/language-日本語-blue.svg)](../../en/developers/tools.md)

---

## 🎯 開発ツール概要

MPLPは、マルチエージェントシステムの開発、テスト、デプロイメントを効率化するために設計された包括的な開発ツールスイートを提供します。これらのツールには、CLIユーティリティ、開発サーバー、デバッグツール、生産性向上ツールが含まれます。

### **ツールカテゴリ**
- **CLIツール**: プロジェクト管理と自動化のためのコマンドラインユーティリティ
- **開発サーバー**: デバッグ機能付きホットリロード開発環境
- **コード生成**: 自動コードスキャフォールディングとボイラープレート生成
- **テストツール**: 自動テストと検証ユーティリティ
- **デバッグツール**: リアルタイムデバッグと監視機能
- **デプロイメントツール**: 本番環境デプロイメントと管理ユーティリティ

### **インストール**
```bash
# MPLP CLIをグローバルにインストール
npm install -g @mplp/cli

# 開発ツールをインストール
npm install -g @mplp/dev-tools

# デバッグユーティリティをインストール
npm install -g @mplp/debug-tools

# インストールを確認
mplp --version
mplp-dev --version
mplp-debug --version
```

---

## 🛠️ MPLP CLI

### **プロジェクト管理コマンド**

#### **プロジェクト作成と初期化**
```bash
# 新しいMPLPプロジェクトを作成
mplp create <project-name> [options]

# 利用可能なテンプレート
mplp create my-agent --template=basic          # 基本的なシングルエージェントプロジェクト
mplp create my-system --template=multi-agent  # マルチエージェント調整
mplp create my-api --template=api-server      # MPLPを使用したAPIサーバー
mplp create my-integration --template=integration # 外部システム統合

# 既存プロジェクトを初期化
mplp init [options]

# プロジェクト構造オプション
mplp create my-project --structure=monorepo    # モノレポ構造
mplp create my-project --structure=microservices # マイクロサービス構造
```

#### **開発サーバー**
```bash
# 開発サーバーを起動
mplp dev [options]

# 開発サーバーオプション
mplp dev --port=3000                    # カスタムポート
mplp dev --hot-reload                   # ホットリロードを有効化
mplp dev --debug                        # デバッグモードを有効化
mplp dev --trace                        # リクエストトレースを有効化
mplp dev --mock-external                # 外部サービスをモック

# 開発サーバー機能:
# - コード変更時のホットリロード
# - リアルタイムプロトコル検証
# - インタラクティブAPIエクスプローラー
# - ライブトレース可視化
# - パフォーマンス監視ダッシュボード
# - 外部サービスレスポンスのモック
```

#### **コード生成**
```bash
# モジュールコンポーネントを生成
mplp generate context <name>           # コンテキストサービスを生成
mplp generate plan <name>              # プランサービスを生成
mplp generate role <name>              # ロールサービスを生成
mplp generate agent <name>             # エージェントテンプレートを生成

# 統合コンポーネントを生成
mplp generate api <name>               # APIエンドポイントを生成
mplp generate schema <name>            # JSON Schemaを生成
mplp generate mapper <name>            # マッパー関数を生成
mplp generate test <name>              # テストスイートを生成

# 完全なモジュールスタックを生成
mplp generate module <name> --full     # 完全なモジュール実装
```

---

## 🔧 開発ユーティリティ

### **スキーマ検証ツール**
```bash
# スキーマを検証
mplp validate schema <schema-file>

# すべてのスキーマを検証
mplp validate schemas --all

# スキーマ互換性をチェック
mplp validate compatibility --from v1.0.0 --to v1.1.0
```

### **テストランナー**
```bash
# すべてのテストを実行
mplp test

# 特定のモジュールをテスト
mplp test context
mplp test plan
mplp test role

# カバレッジ付きでテスト
mplp test --coverage

# ウォッチモードでテスト
mplp test --watch
```

### **デバッグツール**
```bash
# デバッグモードで起動
mplp debug [options]

# リクエストをトレース
mplp trace <request-id>

# パフォーマンスをプロファイル
mplp profile <operation>

# ログを分析
mplp logs analyze --from 2025-01-01 --to 2025-01-31
```

---

## 📊 監視とオブザーバビリティ

### **メトリクスダッシュボード**
```bash
# メトリクスダッシュボードを起動
mplp metrics dashboard

# メトリクスをエクスポート
mplp metrics export --format prometheus
mplp metrics export --format grafana
```

### **トレース可視化**
```bash
# トレースビューアーを起動
mplp trace viewer

# 分散トレースを分析
mplp trace analyze <trace-id>
```

---

## 🚀 デプロイメントツール

### **ビルドとパッケージング**
```bash
# 本番環境用にビルド
mplp build --production

# Dockerイメージを作成
mplp docker build

# Kubernetesマニフェストを生成
mplp k8s generate
```

### **デプロイメント**
```bash
# 本番環境にデプロイ
mplp deploy production

# ステージング環境にデプロイ
mplp deploy staging

# ロールバック
mplp rollback <version>
```

---

## 🔌 統合ツール

### **外部システム統合**
```bash
# 統合を生成
mplp integrate <system-type>

# 利用可能な統合
mplp integrate slack          # Slack統合
mplp integrate discord        # Discord統合
mplp integrate github         # GitHub統合
mplp integrate jira           # Jira統合
```

---

**ドキュメントバージョン**: 1.0
**最終更新**: 2025年9月4日
**ツールバージョン**: v1.0.0-alpha
**言語**: 日本語
