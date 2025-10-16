# MPLP CLI 使用示例

本目录包含MPLP CLI工具的使用示例和最佳实践。

## 🚀 快速开始

### 1. 安装CLI工具

```bash
# 从SDK根目录安装
cd sdk
npm install
npm run build

# 全局安装CLI工具
cd packages/cli
npm link
```

### 2. 创建新项目

```bash
# 创建基础项目
mplp init my-agent --template basic

# 创建高级项目（包含编排器）
mplp init my-advanced-agent --template advanced

# 创建企业级项目（包含完整功能）
mplp init my-enterprise-agent --template enterprise
```

### 3. 项目结构

创建的项目将包含以下结构：

```
my-agent/
├── src/
│   ├── agents/          # Agent实现
│   ├── config/          # 配置文件
│   ├── types/           # TypeScript类型定义
│   ├── utils/           # 工具函数
│   └── index.ts         # 主入口文件
├── tests/               # 测试文件
├── package.json         # 项目配置
├── tsconfig.json        # TypeScript配置
├── jest.config.js       # Jest测试配置
└── README.md            # 项目文档
```

## 📋 可用模板

### 基础模板 (basic)
- 简单的Agent示例
- 基础项目结构
- 单元测试配置
- TypeScript支持

### 高级模板 (advanced)
- 多个专业化Agent
- 工作流编排
- HTTP API服务器
- 环境配置管理
- 高级错误处理

### 企业级模板 (enterprise)
- 完整的企业级功能
- Docker支持
- 环境配置
- 监控和日志
- 完整的开发工具链

## 🛠️ CLI命令

### 项目创建
```bash
# 基本用法
mplp init <project-name>

# 指定模板
mplp init <project-name> --template <template-name>

# 指定目录
mplp init <project-name> --directory <path>

# 完整选项
mplp init my-agent \
  --template advanced \
  --description "My awesome MPLP agent" \
  --author "Your Name" \
  --license MIT \
  --typescript \
  --eslint \
  --prettier
```

### 代码生成
```bash
# 生成新Agent
mplp generate agent MyNewAgent

# 生成工作流
mplp generate workflow MyWorkflow

# 生成配置文件
mplp generate config MyConfig
```

### 开发服务器
```bash
# 启动开发服务器
mplp dev

# 指定端口
mplp dev --port 8080

# 指定主机
mplp dev --host 0.0.0.0

# 禁用自动打开浏览器
mplp dev --no-open
```

### 帮助信息
```bash
# 查看帮助
mplp --help

# 查看版本
mplp --version

# 查看命令帮助
mplp init --help
mplp generate --help
mplp dev --help
```

## 🎯 最佳实践

### 1. 项目命名
- 使用kebab-case命名：`my-awesome-agent`
- 避免特殊字符和空格
- 保持名称简洁明了

### 2. 模板选择
- **基础模板**: 适合学习和简单项目
- **高级模板**: 适合生产级应用
- **企业级模板**: 适合大型企业项目

### 3. 开发流程
1. 使用CLI创建项目
2. 安装依赖：`npm install`
3. 启动开发模式：`npm run dev`
4. 编写Agent逻辑
5. 运行测试：`npm test`
6. 构建项目：`npm run build`

## 🔧 故障排除

### 常见问题

**Q: CLI命令找不到**
```bash
# 确保已正确安装和链接
npm link
# 或者使用npx
npx @mplp/cli init my-agent
```

**Q: 模板创建失败**
```bash
# 检查目录权限
# 确保目标目录不存在或为空
# 检查网络连接（如果需要下载依赖）
```

**Q: TypeScript编译错误**
```bash
# 检查Node.js版本 (需要 >= 18.0.0)
node --version

# 清理并重新安装依赖
rm -rf node_modules package-lock.json
npm install
```

## 📚 更多资源

- [MPLP SDK文档](../README.md)
- [Agent Builder指南](../packages/agent-builder/README.md)
- [编排器文档](../packages/orchestrator/README.md)
- [平台适配器](../packages/adapters/README.md)
