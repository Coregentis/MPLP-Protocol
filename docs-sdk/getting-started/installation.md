# MPLP SDK 安装指南

## 🎯 **系统要求**

### **必需环境**
- **Node.js**: 18.0.0 或更高版本
- **npm**: 8.0.0 或更高版本（或 yarn 1.22.0+）
- **TypeScript**: 5.0.0 或更高版本
- **操作系统**: Windows 10+, macOS 10.15+, Linux (Ubuntu 18.04+)

### **推荐环境**
- **IDE**: Visual Studio Code 1.70+
- **Git**: 2.30.0 或更高版本
- **内存**: 4GB RAM 或更多
- **存储**: 1GB 可用空间

## 📦 **安装方式**

### **方式1: 安装MPLP核心包（推荐）** ⚡

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

### **方式2: 使用CLI脚手架**

使用MPLP CLI快速创建项目：

```bash
# 安装MPLP核心包
npm install mplp@beta

# 全局安装CLI（可选，用于项目脚手架）
npm install -g @mplp/cli

# 创建新项目
mplp create my-agent-app

# 进入项目目录
cd my-agent-app

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### **方式3: 安装SDK包（高级用例）**

根据需要安装特定的SDK包：

**完整SDK安装**：
```bash
npm install @mplp/sdk-core @mplp/agent-builder @mplp/orchestrator @mplp/cli @mplp/dev-tools
```

**按需安装**：

**核心应用框架**：
```bash
npm install @mplp/sdk-core
```

**Agent构建器**：
```bash
npm install @mplp/agent-builder
```

**多Agent编排器**：
```bash
npm install @mplp/orchestrator
```

**CLI开发工具**：
```bash
npm install -g @mplp/cli
```

**开发调试工具**：
```bash
npm install --save-dev @mplp/dev-tools
```

**注意**: 对于大多数用户，`npm install mplp@beta`就足够了。SDK包适用于需要特定SDK功能的高级场景。

## 🔧 **平台适配器安装**

根据需要集成的平台安装对应适配器：

```bash
# Twitter集成
npm install @mplp/adapter-twitter

# LinkedIn集成
npm install @mplp/adapter-linkedin

# GitHub集成
npm install @mplp/adapter-github

# Discord集成
npm install @mplp/adapter-discord

# Slack集成
npm install @mplp/adapter-slack

# Reddit集成
npm install @mplp/adapter-reddit

# Medium集成
npm install @mplp/adapter-medium
```

## ✅ **安装验证**

### **验证安装**
创建测试文件 `test-installation.js`：

```javascript
const { MPLPApplication } = require('@mplp/sdk-core');
const { AgentBuilder } = require('@mplp/agent-builder');

console.log('MPLP SDK 安装验证...');

try {
  // 创建应用实例
  const app = new MPLPApplication('TestApp');
  console.log('✅ @mplp/sdk-core 安装成功');

  // 创建Agent构建器
  const builder = new AgentBuilder('TestAgent');
  console.log('✅ @mplp/agent-builder 安装成功');

  console.log('🎉 MPLP SDK 安装验证通过！');
} catch (error) {
  console.error('❌ 安装验证失败:', error.message);
  process.exit(1);
}
```

运行验证：
```bash
node test-installation.js
```

### **CLI验证**
```bash
# 检查CLI版本
mplp --version

# 查看可用命令
mplp --help

# 检查项目状态
mplp status
```

## 🚨 **常见问题**

### **Node.js版本问题**
```bash
# 检查Node.js版本
node --version

# 如果版本过低，请升级Node.js
# 推荐使用nvm管理Node.js版本
nvm install 18
nvm use 18
```

### **权限问题（Linux/macOS）**
```bash
# 如果遇到权限问题，使用sudo
sudo npm install -g @mplp/cli

# 或配置npm全局目录
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH
```

### **网络问题**
```bash
# 使用国内镜像源
npm config set registry https://registry.npmmirror.com

# 或使用yarn
yarn config set registry https://registry.npmmirror.com
```

### **TypeScript配置**
确保项目根目录有 `tsconfig.json`：
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
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

## 🔄 **更新SDK**

### **检查更新**
```bash
# 检查过时的包
npm outdated

# 或使用CLI检查
mplp check-updates
```

### **更新到最新版本**
```bash
# 更新所有MPLP包
npm update @mplp/sdk-core @mplp/agent-builder @mplp/orchestrator @mplp/cli @mplp/dev-tools

# 或使用CLI更新
mplp update
```

## 📞 **获取帮助**

如果遇到安装问题：

1. **查看文档**: [故障排除指南](../guides/troubleshooting.md)
2. **社区讨论**: [GitHub Discussions](https://github.com/mplp-org/mplp/discussions)
3. **问题反馈**: [GitHub Issues](https://github.com/mplp-org/mplp/issues)
4. **官方支持**: support@mplp.org

---

**下一步**: [快速开始](quick-start.md) | [创建第一个Agent](first-agent.md)
