# @mplp/cli API参考文档

> **🌐 语言导航**: [English](../../../en/sdk-api/cli/README.md) | [中文](README.md)


> **包名**: @mplp/cli  
> **版本**: v1.1.0-beta  
> **更新时间**: 2025-09-20  
> **状态**: ✅ 生产就绪  

## 📚 **包概览**

`@mplp/cli`包为MPLP（多智能体协议生命周期平台）提供了全面的命令行界面。它提供了强大的项目初始化、代码生成、开发工作流管理和部署实用程序工具，具有企业级功能。

### **🎯 关键功能**

- **项目初始化**: 使用多种模板创建新的MPLP项目（基础、高级、企业级）
- **代码生成**: 生成代理、工作流、配置和其他组件
- **开发服务器**: 内置开发服务器，支持热重载和调试
- **构建系统**: 生产就绪的构建和优化工具
- **测试集成**: 全面的测试实用程序和覆盖率报告
- **代码检查和质量**: 代码质量检查和自动格式化
- **模板系统**: 可扩展的模板系统，支持自定义项目结构
- **包管理器支持**: 支持npm、yarn和pnpm

### **📦 安装**

```bash
# 全局安装（推荐）
npm install -g @mplp/cli

# 本地安装
npm install @mplp/cli --save-dev

# 验证安装
mplp --version
```

### **🏗️ CLI架构**

```
┌─────────────────────────────────────────┐
│              MPLP CLI                   │
│           (命令路由器)                  │
├─────────────────────────────────────────┤
│  InitCommand | GenerateCommand         │
│  DevCommand  | BuildCommand            │
│  TestCommand | LintCommand             │
│  HelpCommand | InfoCommand             │
├─────────────────────────────────────────┤
│         核心组件                        │
│  Logger | Spinner | TemplateManager    │
│  GitOps | PackageManager | FileSystem  │
└─────────────────────────────────────────┘
```

## 🚀 **快速开始**

### **创建您的第一个项目**

```bash
# 交互式项目创建
mplp init

# 使用特定模板创建项目
mplp init my-agent --template advanced

# 创建具有完整功能的企业级项目
mplp init enterprise-bot --template enterprise --author "您的姓名" --license MIT
```

### **开发工作流**

```bash
# 导航到项目
cd my-agent

# 启动开发服务器
mplp dev

# 生成新组件
mplp generate agent GreetingAgent
mplp generate workflow ProcessingWorkflow

# 运行测试
mplp test

# 生产构建
mplp build --production
```

## 📋 **核心命令**

### **mplp init**

使用可定制的模板和配置初始化新的MPLP项目。

#### **语法**

```bash
mplp init [项目名称] [选项]
```

#### **选项**

- `--template, -t <模板>`: 项目模板（basic, advanced, enterprise）
- `--author <作者>`: 项目作者姓名
- `--description <描述>`: 项目描述
- `--license <许可证>`: 项目许可证（MIT, Apache-2.0, GPL-3.0等）
- `--no-git`: 跳过Git仓库初始化
- `--no-install`: 跳过依赖安装
- `--package-manager <pm>`: 包管理器（npm, yarn, pnpm）
- `--typescript`: 启用TypeScript（默认: true）
- `--directory <目录>`: 项目创建的目标目录

#### **示例**

```bash
# 基础项目
mplp init simple-bot --template basic

# 带编排的高级项目
mplp init complex-system --template advanced --author "张三"

# 具有完整工具链的企业级项目
mplp init production-system --template enterprise --license Apache-2.0

# 自定义目录和包管理器
mplp init my-project --directory ./projects --package-manager yarn
```

#### **模板**

**基础模板:**
- 简单的代理结构
- 基本配置
- 必要依赖
- 开发脚本

**高级模板:**
- 多智能体编排
- 工作流管理
- 平台适配器
- 测试框架
- CI/CD配置

**企业级模板:**
- 完整的MPLP功能集
- Docker支持
- 监控和日志
- 安全配置
- 生产部署脚本

### **mplp generate**

使用内置模板和模式生成代码组件。

#### **语法**

```bash
mplp generate <类型> [名称] [选项]
mplp gen <类型> [名称] [选项]    # 短别名
mplp g <类型> [名称] [选项]      # 更短别名
```

#### **类型**

- `agent`: 生成智能代理类
- `workflow`: 生成工作流定义
- `config`: 生成配置文件
- `adapter`: 生成平台适配器
- `test`: 生成测试文件

#### **选项**

- `--template, -t <模板>`: 生成模板（basic, advanced, enterprise）
- `--capabilities <能力>`: 代理能力（逗号分隔）
- `--steps <步骤>`: 工作流步骤（逗号分隔）
- `--directory <目录>`: 输出目录
- `--typescript`: 生成TypeScript文件（默认: true）
- `--overwrite`: 覆盖现有文件

#### **示例**

```bash
# 生成基础代理
mplp generate agent GreetingAgent

# 生成具有能力的高级代理
mplp generate agent CustomerService --capabilities "greet,help,escalate" --template advanced

# 生成具有步骤的工作流
mplp generate workflow ContentWorkflow --steps "validate,process,publish"

# 生成配置
mplp generate config DatabaseConfig --template enterprise
```

### **mplp dev**

启动具有热重载和调试功能的开发服务器。

#### **语法**

```bash
mplp dev [选项]
```

#### **选项**

- `--port, -p <端口>`: 开发服务器端口（默认: 3000）
- `--host <主机>`: 开发服务器主机（默认: localhost）
- `--no-open`: 不自动打开浏览器
- `--debug`: 启用调试模式
- `--watch <模式>`: 监视特定文件模式
- `--env <环境>`: 环境配置文件

#### **示例**

```bash
# 启动开发服务器
mplp dev

# 自定义端口和主机
mplp dev --port 8080 --host 0.0.0.0

# 调试模式与特定环境
mplp dev --debug --env development
```

### **mplp build**

为生产部署构建项目。

#### **语法**

```bash
mplp build [选项]
```

#### **选项**

- `--production`: 带优化的生产构建
- `--output, -o <目录>`: 输出目录（默认: dist）
- `--clean`: 构建前清理输出目录
- `--analyze`: 分析包大小和依赖
- `--source-map`: 生成源映射
- `--env <环境>`: 环境配置

#### **示例**

```bash
# 生产构建
mplp build --production

# 带分析的构建
mplp build --production --analyze --clean

# 自定义输出目录
mplp build --output ./build --source-map
```

### **mplp test**

运行具有全面覆盖率和报告的测试。

#### **语法**

```bash
mplp test [选项]
```

#### **选项**

- `--watch`: 在监视模式下运行测试
- `--coverage`: 生成覆盖率报告
- `--verbose`: 详细测试输出
- `--pattern <模式>`: 测试文件模式
- `--timeout <毫秒>`: 测试超时时间（毫秒）

#### **示例**

```bash
# 运行所有测试
mplp test

# 监视模式与覆盖率
mplp test --watch --coverage

# 运行特定测试模式
mplp test --pattern "**/*.agent.test.ts"
```

### **mplp lint**

运行代码质量检查和自动格式化。

#### **语法**

```bash
mplp lint [选项]
```

#### **选项**

- `--fix`: 自动修复代码检查问题
- `--format <格式>`: 输出格式（stylish, json, junit）
- `--pattern <模式>`: 要检查的文件模式
- `--config <配置>`: 自定义检查配置文件

#### **示例**

```bash
# 运行代码检查
mplp lint

# 自动修复问题
mplp lint --fix

# 检查特定文件
mplp lint --pattern "src/**/*.ts" --fix
```

### **mplp info**

显示项目和环境信息。

#### **语法**

```bash
mplp info [选项]
```

#### **选项**

- `--project`: 显示项目特定信息
- `--env`: 显示环境信息
- `--json`: 以JSON格式输出
- `--verbose`: 显示详细信息

#### **示例**

```bash
# 一般信息
mplp info

# 项目详情
mplp info --project --verbose

# JSON格式的环境信息
mplp info --env --json
```

### **mplp help**

显示命令的帮助信息。

#### **语法**

```bash
mplp help [命令]
mplp --help
mplp -h
```

#### **示例**

```bash
# 一般帮助
mplp help

# 特定命令帮助
mplp help init
mplp help generate

# 所有可用命令
mplp help --all
```

## 🔧 **编程API**

### **CLIApplication**

用于编程使用的主CLI应用程序类。

```typescript
import { CLIApplication, CLIConfig, CLIContext } from '@mplp/cli';

const config: CLIConfig = {
  name: 'mplp',
  version: '1.1.0-beta',
  description: 'MPLP CLI工具'
};

const app = new CLIApplication(config);
await app.run(['init', 'my-project', '--template', 'advanced']);
```

### **命令**

用于自定义CLI应用程序的单个命令类。

```typescript
import { InitCommand, GenerateCommand, DevCommand } from '@mplp/cli';

const context: CLIContext = {
  config,
  logger,
  spinner,
  templateManager
};

const initCommand = new InitCommand(context);
await initCommand.execute({
  projectName: 'my-project',
  template: 'advanced',
  author: '张三'
});
```

### **模板系统**

自定义模板创建和管理。

```typescript
import { ProjectTemplateManager } from '@mplp/cli';

const templateManager = new ProjectTemplateManager();

// 注册自定义模板
templateManager.registerTemplate({
  name: 'custom',
  description: '自定义项目模板',
  files: [
    // 模板文件配置
  ]
});

// 使用模板
await templateManager.generateProject('my-project', 'custom', options);
```

## 🎯 **高级使用示例**

### **企业级项目设置**

```bash
# 创建具有完整配置的企业级项目
mplp init enterprise-system \
  --template enterprise \
  --author "企业团队" \
  --description "生产就绪的多智能体系统" \
  --license Apache-2.0 \
  --package-manager yarn

cd enterprise-system

# 生成核心组件
mplp generate agent UserManager --capabilities "authenticate,authorize,profile" --template enterprise
mplp generate agent OrderProcessor --capabilities "validate,process,notify" --template enterprise
mplp generate workflow OrderWorkflow --steps "receive,validate,process,fulfill,notify"

# 启动带调试的开发
mplp dev --debug --port 3000
```

### **CI/CD集成**

```bash
#!/bin/bash
# CI/CD管道脚本

# 安装CLI
npm install -g @mplp/cli

# 创建测试项目
mplp init test-project --template basic --no-git --no-install

cd test-project

# 安装依赖
npm install

# 运行质量检查
mplp lint
mplp test --coverage

# 生产构建
mplp build --production --clean

# 部署（自定义部署逻辑）
npm run deploy
```

### **自定义开发工作流**

```bash
# 使用自定义配置的开发工作流
mplp init my-workflow-project --template advanced

cd my-workflow-project

# 生成多个代理
for agent in "DataCollector" "DataProcessor" "DataValidator" "ReportGenerator"; do
  mplp generate agent $agent --template advanced
done

# 生成编排工作流
mplp generate workflow DataPipeline --steps "collect,process,validate,report"

# 使用自定义环境启动开发
mplp dev --env development --port 4000 --debug
```

## 🔗 **相关文档**

- [SDK Core API](../sdk-core/README.md) - 应用框架和生命周期管理
- [Agent Builder API](../agent-builder/README.md) - 构建智能代理
- [Orchestrator API](../orchestrator/README.md) - 多智能体工作流编排
- [Platform Adapters API](../adapters/README.md) - 平台集成和通信

---

**包维护者**: MPLP CLI团队  
**最后审查**: 2025-09-20  
**Node.js要求**: >=18.0.0  
**状态**: ✅ 生产就绪
