# MPLP CLI - 完整使用指南

> **🌐 语言导航**: [English](../../../en/development-tools/cli/README.md) | [中文](README.md)


> **包名**: @mplp/cli  
> **版本**: v1.1.0-beta  
> **更新时间**: 2025-09-20  
> **状态**: ✅ 生产就绪  

## 📚 **概览**

MPLP CLI是多智能体协议生命周期平台的综合命令行界面。它提供了强大的项目创建、开发工作流管理、代码生成、测试和部署工具，具有企业级功能和广泛的自定义选项。

### **📦 包关系说明**

**重要**: MPLP CLI (`@mplp/cli`) 是一个**独立的开发工具**，用于项目脚手架和管理。对于大多数MPLP应用程序，您需要：

1. **MPLP核心包** (`mplp@beta`): 包含L1-L3协议栈和所有10个核心模块的主包
2. **MPLP CLI** (`@mplp/cli`): 可选的CLI工具，用于项目脚手架和开发工作流

**快速开始**:
```bash
# 安装MPLP核心包（所有项目必需）
npm install mplp@beta

# 全局安装MPLP CLI（可选，用于项目脚手架）
npm install -g @mplp/cli
```

### **🎯 关键功能**

- **🚀 项目脚手架**: 使用多种模板创建新的MPLP项目（基础、高级、企业级）
- **📋 代码生成**: 生成智能体、工作流、配置和其他组件
- **🔧 开发服务器**: 内置开发服务器，支持热重载和调试
- **🏗️ 构建系统**: 生产就绪的构建和优化工具
- **🧪 测试集成**: 全面的测试实用程序和覆盖率报告
- **📊 代码质量**: 代码质量检查、代码检查和自动格式化
- **📦 包管理器**: 支持npm、yarn和pnpm，具有自动检测功能
- **🌐 Git集成**: 自动Git仓库初始化和工作流支持
- **📚 模板系统**: 可扩展的模板系统，支持自定义项目结构
- **🔍 项目分析**: 详细的项目信息和依赖分析

### **📦 安装**

#### **步骤1: 安装MPLP核心包** ⚡

```bash
# 安装MPLP核心包（必需）
npm install mplp@beta

# 验证安装
node -e "const mplp = require('mplp'); console.log('MPLP版本:', mplp.MPLP_VERSION);"
# 预期输出: MPLP版本: 1.1.0-beta
```

#### **步骤2: 安装MPLP CLI（可选）**

```bash
# 全局安装（推荐用于CLI使用）
npm install -g @mplp/cli

# 使用yarn
yarn global add @mplp/cli

# 使用pnpm
pnpm add -g @mplp/cli

# 验证CLI安装
mplp --version
# 预期输出: @mplp/cli/1.1.0-beta
```

## 🚀 **快速开始**

### **创建第一个项目**

```bash
# 创建基础项目
mplp init my-first-agent

# 进入项目目录
cd my-first-agent

# 启动开发
mplp dev

# 构建生产版本
mplp build
```

### **使用不同模板**

```bash
# 基础模板（默认）
mplp init simple-agent --template basic

# 高级模板，包含编排功能
mplp init complex-system --template advanced

# 企业模板，包含完整工具链
mplp init production-system --template enterprise
```

## 📋 **命令参考**

### **mplp init**

使用可自定义的模板和配置创建新的MPLP项目。

#### **语法**

```bash
mplp init <项目名称> [选项]
```

#### **选项**

- `--template, -t <模板>`: 项目模板（basic, advanced, enterprise）
- `--description, -d <描述>`: 项目描述
- `--author, -a <作者>`: 项目作者
- `--license, -l <许可证>`: 项目许可证（MIT, Apache-2.0等）
- `--package-manager, -pm <管理器>`: 包管理器（npm, yarn, pnpm）
- `--git, -g`: 初始化Git仓库（默认：true）
- `--install, -i`: 创建后安装依赖（默认：true）
- `--typescript, -ts`: 使用TypeScript（默认：true）
- `--eslint`: 添加ESLint配置（默认：true）
- `--prettier`: 添加Prettier配置（默认：true）
- `--jest`: 添加Jest测试框架（默认：true）
- `--force, -f`: 覆盖现有目录
- `--dry-run`: 显示将要创建的内容而不实际创建

#### **示例**

```bash
# 基础项目创建
mplp init my-agent

# 高级项目，自定义设置
mplp init enterprise-bot \
  --template enterprise \
  --description "企业聊天机器人系统" \
  --author "您的姓名" \
  --license MIT \
  --package-manager yarn

# 快速设置，无提示
mplp init quick-agent --template basic --force --no-git

# 预览结构的试运行
mplp init test-project --template advanced --dry-run
```

### **mplp generate**

生成代码组件、配置和样板代码。

#### **语法**

```bash
mplp generate <类型> <名称> [选项]
```

#### **类型**

- `agent`: 生成新的智能体类
- `workflow`: 生成工作流配置
- `adapter`: 生成平台适配器
- `config`: 生成配置文件
- `test`: 生成测试文件
- `component`: 生成自定义组件

#### **选项**

- `--output, -o <路径>`: 输出目录
- `--template, -t <模板>`: 生成模板
- `--overwrite, -w`: 覆盖现有文件
- `--dry-run`: 预览生成的代码

#### **示例**

```bash
# 生成新智能体
mplp generate agent ChatBot --output src/agents

# 生成工作流
mplp generate workflow DataProcessing --template advanced

# 生成平台适配器
mplp generate adapter CustomPlatform --output src/adapters

# 生成测试文件
mplp generate test ChatBot --output tests/agents
```

### **mplp dev**

启动开发服务器，支持热重载和调试。

#### **语法**

```bash
mplp dev [选项]
```

#### **选项**

- `--port, -p <端口>`: 开发服务器端口（默认：3000）
- `--host, -h <主机>`: 开发服务器主机（默认：localhost）
- `--open, -o`: 自动打开浏览器
- `--watch, -w <路径>`: 要监视的额外路径
- `--ignore, -i <模式>`: 要忽略的模式
- `--debug, -d`: 启用调试模式
- `--verbose, -v`: 详细日志记录
- `--no-reload`: 禁用热重载
- `--inspect`: 启用Node.js检查器

#### **示例**

```bash
# 启动开发服务器
mplp dev

# 自定义端口和主机
mplp dev --port 8080 --host 0.0.0.0

# 调试模式，带检查器
mplp dev --debug --inspect

# 监视额外目录
mplp dev --watch "config/**" --watch "templates/**"
```

### **mplp build**

构建项目用于生产，包含优化和打包。

#### **语法**

```bash
mplp build [选项]
```

#### **选项**

- `--output, -o <目录>`: 输出目录（默认：dist）
- `--mode, -m <模式>`: 构建模式（production, development）
- `--target, -t <目标>`: 构建目标（node, browser, both）
- `--minify`: 压缩输出（生产模式默认：true）
- `--sourcemap`: 生成源映射
- `--analyze`: 分析包大小
- `--clean`: 构建前清理输出目录
- `--watch, -w`: 开发的监视模式

#### **示例**

```bash
# 生产构建
mplp build

# 开发构建，带源映射
mplp build --mode development --sourcemap

# 同时构建Node.js和浏览器版本
mplp build --target both --analyze

# 监视模式构建
mplp build --watch --mode development
```

### **mplp test**

运行测试，包含全面的测试实用程序和覆盖率报告。

#### **语法**

```bash
mplp test [选项] [模式]
```

#### **选项**

- `--watch, -w`: 监视模式
- `--coverage, -c`: 生成覆盖率报告
- `--verbose, -v`: 详细输出
- `--silent, -s`: 静默模式
- `--bail, -b`: 首次失败时停止
- `--parallel, -p`: 并行运行测试
- `--max-workers <数量>`: 最大工作进程数
- `--timeout <毫秒>`: 测试超时
- `--setup <文件>`: 设置文件
- `--config <文件>`: 自定义Jest配置

#### **示例**

```bash
# 运行所有测试
mplp test

# 运行测试并生成覆盖率
mplp test --coverage

# 监视模式
mplp test --watch

# 运行特定测试文件
mplp test src/agents --verbose

# 并行执行
mplp test --parallel --max-workers 4
```

### **mplp lint**

运行代码质量检查和自动格式化。

#### **语法**

```bash
mplp lint [选项] [文件]
```

#### **选项**

- `--fix, -f`: 自动修复问题
- `--format <格式器>`: 输出格式（stylish, json, table）
- `--quiet, -q`: 仅报告错误
- `--max-warnings <数量>`: 允许的最大警告数
- `--cache`: 使用缓存以加快检查速度
- `--no-eslintrc`: 禁用ESLint配置文件

#### **示例**

```bash
# 检查所有文件
mplp lint

# 检查并修复问题
mplp lint --fix

# 检查特定文件
mplp lint src/agents/*.ts --format table

# 静默模式（仅错误）
mplp lint --quiet --max-warnings 0
```

### **mplp clean**

清理构建产物和临时文件。

#### **语法**

```bash
mplp clean [选项]
```

#### **选项**

- `--all, -a`: 清理所有产物，包括node_modules
- `--cache, -c`: 清理缓存文件
- `--logs, -l`: 清理日志文件
- `--force, -f`: 强制清理，无需确认

#### **示例**

```bash
# 清理构建目录
mplp clean

# 清理所有内容
mplp clean --all

# 清理缓存和日志
mplp clean --cache --logs
```

### **mplp info**

显示项目和环境信息。

#### **语法**

```bash
mplp info [选项]
```

#### **选项**

- `--project, -p`: 显示项目特定信息
- `--env, -e`: 显示环境信息
- `--json, -j`: 以JSON格式输出
- `--verbose, -v`: 显示详细信息

#### **示例**

```bash
# 一般信息
mplp info

# 项目详情
mplp info --project --verbose

# JSON格式的环境信息
mplp info --env --json
```

## 🔧 **配置**

### **项目配置**

在项目根目录创建`mplp.config.js`文件：

```javascript
module.exports = {
  // 构建配置
  build: {
    target: 'node',
    outDir: 'dist',
    minify: true,
    sourcemap: true
  },
  
  // 开发服务器配置
  dev: {
    port: 3000,
    host: 'localhost',
    open: true,
    watch: ['src/**/*', 'config/**/*']
  },
  
  // 测试配置
  test: {
    coverage: true,
    coverageThreshold: {
      global: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80
      }
    }
  },
  
  // 代码检查配置
  lint: {
    fix: true,
    cache: true,
    maxWarnings: 0
  },
  
  // 模板配置
  templates: {
    customTemplatesDir: './templates',
    defaultTemplate: 'basic'
  }
};
```

### **TypeScript配置**

CLI自动生成`tsconfig.json`：

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

### **Package.json脚本**

生成的项目包含这些npm脚本：

```json
{
  "scripts": {
    "build": "mplp build",
    "dev": "mplp dev",
    "test": "mplp test",
    "test:watch": "mplp test --watch",
    "test:coverage": "mplp test --coverage",
    "lint": "mplp lint",
    "lint:fix": "mplp lint --fix",
    "clean": "mplp clean",
    "start": "node dist/index.js"
  }
}
```

## 📋 **项目模板**

### **基础模板**

适合学习和简单项目：

```
my-project/
├── src/
│   ├── index.ts          # 主入口点
│   ├── agents/           # 智能体实现
│   └── config/           # 配置文件
├── tests/                # 测试文件
├── package.json
├── tsconfig.json
├── jest.config.js
└── README.md
```

**依赖**: `@mplp/sdk-core`, `@mplp/agent-builder`

### **高级模板**

包含编排和多个智能体：

```
my-project/
├── src/
│   ├── index.ts
│   ├── agents/           # 多种智能体类型
│   ├── workflows/        # 工作流定义
│   ├── orchestrator/     # 编排逻辑
│   ├── config/           # 环境配置
│   └── utils/            # 实用函数
├── tests/
│   ├── unit/             # 单元测试
│   ├── integration/      # 集成测试
│   └── fixtures/         # 测试夹具
├── docs/                 # 文档
├── scripts/              # 构建脚本
└── docker/               # Docker配置
```

**依赖**: `@mplp/sdk-core`, `@mplp/agent-builder`, `@mplp/orchestrator`

### **企业模板**

完整的生产设置，包含监控和部署：

```
my-project/
├── src/
│   ├── index.ts
│   ├── agents/
│   ├── workflows/
│   ├── orchestrator/
│   ├── adapters/         # 平台适配器
│   ├── middleware/       # 自定义中间件
│   ├── monitoring/       # 监控设置
│   ├── config/
│   └── utils/
├── tests/
├── docs/
├── scripts/
├── docker/
├── k8s/                  # Kubernetes清单
├── .github/              # GitHub Actions
├── monitoring/           # 监控配置
└── deployment/           # 部署脚本
```

**依赖**: 所有MPLP包 + 监控和部署工具

## 🛠️ **开发工作流程**

### **标准开发流程**

```bash
# 1. 创建项目
mplp init my-agent --template advanced

# 2. 进入项目
cd my-agent

# 3. 启动开发
mplp dev

# 4. 生成组件（在另一个终端）
mplp generate agent ChatBot
mplp generate workflow MessageProcessing

# 5. 运行测试
mplp test --watch

# 6. 构建生产版本
mplp build

# 7. 部署
npm run deploy
```

### **测试工作流程**

```bash
# 运行所有测试
mplp test

# 运行测试并生成覆盖率
mplp test --coverage

# 运行特定测试套件
mplp test src/agents --verbose

# 开发期间的监视模式
mplp test --watch

# 提交前运行测试
mplp test --bail --coverage
```

### **代码质量工作流程**

```bash
# 检查代码质量
mplp lint

# 自动修复问题
mplp lint --fix

# 同时运行测试和代码检查
npm run validate  # 结合两者的自定义脚本
```

## 🔗 **集成示例**

### **CI/CD集成**

```yaml
# .github/workflows/ci.yml
name: CI/CD流水线

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: 安装依赖
        run: npm ci
      
      - name: 运行代码检查
        run: mplp lint
      
      - name: 运行测试
        run: mplp test --coverage
      
      - name: 构建项目
        run: mplp build
```

### **Docker集成**

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# 安装MPLP CLI
RUN npm install -g @mplp/cli

# 复制包文件
COPY package*.json ./
RUN npm ci --only=production

# 复制源代码
COPY . .

# 构建应用
RUN mplp build

# 启动应用
CMD ["npm", "start"]
```

### **VS Code集成**

```json
// .vscode/tasks.json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "MPLP: 启动开发服务器",
      "type": "shell",
      "command": "mplp dev",
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "shared"
      }
    },
    {
      "label": "MPLP: 运行测试",
      "type": "shell",
      "command": "mplp test",
      "group": "test"
    }
  ]
}
```

## 🚨 **故障排除**

### **常见问题**

#### **安装问题**

```bash
# 清理npm缓存
npm cache clean --force

# 重新安装CLI
npm uninstall -g @mplp/cli
npm install -g @mplp/cli

# 检查安装
mplp --version
mplp info --env
```

#### **项目创建问题**

```bash
# 强制覆盖现有目录
mplp init my-project --force

# 如果Git初始化有问题，跳过
mplp init my-project --no-git

# 使用特定包管理器
mplp init my-project --package-manager yarn
```

#### **构建问题**

```bash
# 清理并重新构建
mplp clean
mplp build

# 检查TypeScript配置
mplp info --project

# 详细构建输出
mplp build --verbose
```

### **调试模式**

启用调试模式以获得详细日志：

```bash
# 为所有命令启用调试
export DEBUG=mplp:*
mplp dev

# 为特定命令启用调试
mplp build --debug --verbose
```

## 📚 **最佳实践**

### **项目组织**

- 使用一致的命名约定
- 按功能而非文件类型组织代码
- 将配置文件保存在专用目录中
- 使用TypeScript获得更好的开发体验

### **开发工作流程**

- 使用`mplp dev`进行热重载开发
- 使用`mplp test --watch`频繁运行测试
- 使用代码检查维护代码质量
- 定期构建以尽早发现集成问题

### **性能优化**

- 使用`--parallel`标志加快测试速度
- 为代码检查和构建启用缓存
- 在开发期间高效使用`--watch`模式
- 定期清理构建产物

## 🎯 **高级功能**

### **交互模式**

MPLP CLI支持交互模式，提供增强的开发体验：

```bash
# 启动交互模式
mplp --interactive

# 交互式提示符
mplp> init my-project --template advanced
mplp> generate agent ChatBot
mplp> dev --port 8080
mplp> exit
```

**交互式命令特性：**
- 支持所有标准CLI命令
- 命令和选项的Tab自动补全
- 命令历史导航
- 内置帮助系统
- 会话持久化

### **性能监控**

CLI包含内置的性能监控和指标功能：

```bash
# 查看性能指标
mplp info --performance

# 命令执行历史
mplp history

# 性能分析
mplp analyze --performance
```

**跟踪的指标：**
- 命令执行时间
- 成功/失败率
- 资源使用模式
- 构建性能趋势
- 测试执行统计

### **插件系统**

通过自定义插件扩展CLI功能：

```bash
# 安装插件
mplp plugin install @mplp/plugin-docker

# 列出已安装的插件
mplp plugin list

# 创建自定义插件
mplp generate plugin MyCustomPlugin
```

**插件开发特性：**
- 基于TypeScript的插件架构
- 基于钩子的扩展点
- 自定义命令注册
- 配置管理
- 插件生命周期管理

### **企业级功能**

#### **配置管理**

```bash
# 全局配置目录：~/.mplp-cli/
# - config.json: 全局设置
# - history.json: 命令历史
# - plugins/: 已安装的插件
# - templates/: 自定义模板

# 查看配置
mplp config list

# 设置全局选项
mplp config set defaultTemplate advanced
mplp config set packageManager yarn
```

#### **命令历史**

```bash
# 查看命令历史
mplp history

# 重放之前的命令
mplp history replay 5

# 清除历史
mplp history clear
```

#### **高级错误处理**

- 详细的错误报告和堆栈跟踪
- 自动错误恢复建议
- 与错误跟踪服务集成
- 故障排除调试模式
- 全面的日志记录系统

## 🔗 **相关文档**

- [MPLP开发工具指南](../dev-tools/README.md) - 开发和调试实用程序
- [SDK核心文档](../../sdk-api/sdk-core/README.md) - 核心SDK功能
- [智能体构建器指南](../../sdk-api/agent-builder/README.md) - 构建智能代理
- [编排器文档](../../sdk-api/orchestrator/README.md) - 多智能体工作流

---

**CLI维护者**: MPLP平台团队
**最后审查**: 2025-09-20
**测试覆盖率**: 100% (193/193测试通过)
**性能**: 亚秒级命令执行
**企业级功能**: ✅ 完全支持
**状态**: ✅ 生产就绪
