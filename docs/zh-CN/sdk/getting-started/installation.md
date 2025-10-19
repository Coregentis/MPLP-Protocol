# MPLP SDK 安装指南

> **🌐 语言导航**: [English](../../../en/sdk/getting-started/installation.md) | [中文](installation.md)


> **SDK版本**: v1.1.0-beta  
> **基础协议**: MPLP v1.0 Alpha  
> **更新时间**: 2025-09-20  

## 🎯 **安装概览**

MPLP SDK提供了构建多智能体应用的完整开发环境。本指南将引导您完成安装过程并帮助您设置开发环境。

### **系统要求**
- **Node.js**: 18.0.0或更高版本
- **npm**: 8.0.0或更高版本（或yarn 1.22.0+）
- **TypeScript**: 5.0.0或更高版本
- **Git**: 2.0.0或更高版本

### **支持的平台**
- ✅ **Windows**: Windows 10/11 (x64)
- ✅ **macOS**: macOS 10.15+ (Intel/Apple Silicon)
- ✅ **Linux**: Ubuntu 18.04+, CentOS 7+, Debian 10+

## 📦 **安装方法**

### **方法1: 安装MPLP核心包（推荐）** ⚡

安装包含所有核心功能的主MPLP包：

```bash
# 安装最新的beta版本
npm install mplp@beta

# 或安装指定版本
npm install mplp@1.1.0-beta
```

**验证安装**:
```bash
# 检查MPLP版本
node -e "const mplp = require('mplp'); console.log('MPLP版本:', mplp.MPLP_VERSION);"
# 预期输出: MPLP版本: 1.1.0-beta
```

**包含内容**:
- ✅ 完整的L1-L3协议栈
- ✅ 所有10个核心模块（Context、Plan、Role、Confirm、Trace、Extension、Dialog、Collab、Core、Network）
- ✅ TypeScript类型定义
- ✅ 生产就绪构建

### **方法2: 安装CLI工具**

用于项目脚手架和开发工具：

```bash
# 安装MPLP核心包
npm install mplp@beta

# 全局安装MPLP CLI（可选，用于项目脚手架）
npm install -g @mplp/cli

# 验证CLI安装
mplp --version
# 预期输出: @mplp/cli/1.1.0-beta

# 创建您的第一个项目
mplp create my-agent-app
cd my-agent-app

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### **方法3: 安装SDK包**

为高级用例安装单个SDK包：

```bash
# 核心SDK包（如果您需要SDK特定功能）
npm install @mplp/sdk-core @mplp/agent-builder @mplp/orchestrator

# 开发工具
npm install -D @mplp/dev-tools

# 平台适配器（选择您需要的）
npm install @mplp/adapters

# 注意：对于大多数用户，'npm install mplp@beta'就足够了
```

### **方法4: 开发安装**

适用于贡献者和高级用户：

```bash
# 克隆仓库
git clone https://github.com/Coregentis/MPLP-Protocol.git
cd MPLP-Protocol

# 安装依赖
npm install

# 构建所有包
npm run build

# 本地链接包
npm link

# 运行测试
npm test
```

## 🔧 **包详情**

### **核心包**

#### **@mplp/sdk-core**
所有MPLP应用的基础。

```bash
npm install @mplp/sdk-core
```

**功能特性:**
- 应用框架和生命周期管理
- 事件系统和配置管理
- 健康监控和错误处理
- 模块注册和依赖注入

#### **@mplp/agent-builder**
创建和配置智能体的工具。

```bash
npm install @mplp/agent-builder
```

**功能特性:**
- 智能体创建的流式API
- 智能体模板和预设
- 生命周期管理
- 平台适配器集成

#### **@mplp/orchestrator**
多智能体协调和工作流管理。

```bash
npm install @mplp/orchestrator
```

**功能特性:**
- 工作流引擎和任务调度
- 资源管理和监控
- 多智能体协调
- 性能优化

### **开发工具**

#### **@mplp/cli**
项目管理的命令行界面。

```bash
npm install -g @mplp/cli
```

**命令:**
- `mplp create <name>` - 创建新项目
- `mplp dev` - 启动开发服务器
- `mplp build` - 构建生产版本
- `mplp test` - 运行测试
- `mplp deploy` - 部署到云端

#### **@mplp/dev-tools**
开发和调试实用工具。

```bash
npm install -D @mplp/dev-tools
```

**功能特性:**
- 实时调试界面
- 性能监控和分析
- 日志聚合和分析
- 支持热重载的开发服务器

### **平台适配器**

#### **@mplp/adapters**
完整的平台集成生态系统。

```bash
npm install @mplp/adapters
```

**包含的适配器:**
- **Twitter**: 社交媒体自动化
- **LinkedIn**: 专业网络
- **GitHub**: 代码协作
- **Discord**: 社区管理
- **Slack**: 团队沟通
- **Reddit**: 社区参与
- **Medium**: 内容发布

## 🚀 **验证**

### **安装验证**

使用这些命令验证您的安装：

```bash
# 检查Node.js版本
node --version
# 应该是18.0.0或更高版本

# 检查npm版本
npm --version
# 应该是8.0.0或更高版本

# 检查MPLP CLI
mplp --version
# 应该显示@mplp/cli/1.1.0-beta

# 检查TypeScript（如果全局安装）
tsc --version
# 应该是5.0.0或更高版本
```

### **快速测试**

创建并运行一个简单的测试应用：

```bash
# 创建测试项目
mplp create test-app --template minimal
cd test-app

# 安装依赖
npm install

# 运行测试
npm test
# 应该显示所有测试通过

# 启动开发服务器
npm run dev
# 应该在http://localhost:3000启动服务器
```

## 🛠️ **开发环境设置**

### **IDE配置**

#### **Visual Studio Code（推荐）**

安装MPLP扩展包：

```bash
# 安装VS Code扩展
code --install-extension mplp.mplp-extension-pack
```

**包含的扩展:**
- MPLP语言支持
- TypeScript和JavaScript
- ESLint和Prettier
- GitLens和Git Graph
- REST Client用于API测试

#### **WebStorm/IntelliJ IDEA**

配置TypeScript和Node.js支持：

1. 启用TypeScript服务
2. 配置Node.js解释器
3. 从市场安装MPLP插件
4. 设置ESLint和Prettier

### **环境变量**

在项目根目录创建`.env`文件：

```bash
# 开发环境
NODE_ENV=development
MPLP_LOG_LEVEL=debug

# API密钥（替换为您的实际密钥）
TWITTER_API_KEY=your_twitter_api_key
TWITTER_API_SECRET=your_twitter_api_secret
LINKEDIN_CLIENT_ID=your_linkedin_client_id
GITHUB_TOKEN=your_github_token

# 数据库（如果使用）
DATABASE_URL=postgresql://localhost:5432/mplp_dev

# Redis（用于缓存）
REDIS_URL=redis://localhost:6379
```

### **Docker设置（可选）**

使用Docker获得一致的开发环境：

```bash
# 拉取MPLP开发镜像
docker pull mplp/dev-environment:latest

# 运行开发容器
docker run -it -v $(pwd):/workspace mplp/dev-environment:latest

# 或使用docker-compose
docker-compose up -d
```

## 🔍 **故障排除**

### **常见问题**

#### **Node.js版本问题**
```bash
# 错误: Node.js版本过旧
# 解决方案: 更新Node.js
nvm install 18
nvm use 18
```

#### **权限问题（macOS/Linux）**
```bash
# 错误: EACCES权限被拒绝
# 解决方案: 修复npm权限
sudo chown -R $(whoami) ~/.npm
```

#### **Windows路径问题**
```bash
# 错误: 找不到命令
# 解决方案: 添加到PATH或使用完整路径
npm config set prefix %APPDATA%\npm
```

#### **TypeScript编译错误**
```bash
# 错误: TypeScript编译失败
# 解决方案: 检查TypeScript版本和配置
npm install -D typescript@^5.0.0
npx tsc --init
```

### **获取帮助**

如果遇到问题：

1. **查看文档**: [MPLP文档](../../README.md)
2. **搜索问题**: [GitHub Issues](https://github.com/mplp-org/mplp/issues)
3. **社区支持**: [Discord服务器](https://discord.gg/mplp)
4. **专业支持**: support@mplp.dev

## 📚 **下一步**

成功安装后：

1. **[快速开始教程](quick-start.md)** - 30分钟构建您的第一个智能体
2. **[第一个智能体指南](first-agent.md)** - 详细的智能体创建演练
3. **API参考 (开发中)** - 完整的API文档
4. **示例 (开发中)** - 示例应用和用例

## 🔗 **相关资源**

- [MPLP协议文档](../../protocol/README.md)
- [SDK架构指南](../guides/architecture.md)
- [最佳实践](../guides/best-practices.md)
- [性能指南](../guides/performance.md)

---

**安装支持**: installation-support@mplp.dev  
**文档团队**: MPLP SDK团队  
**最后更新**: 2025-09-20  
**下次审查**: 2025-10-20
