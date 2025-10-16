# MPLP SDK 快速开始 - 30分钟构建您的第一个智能体

> **🌐 语言导航**: [English](../../../en/sdk/getting-started/quick-start.md) | [中文](quick-start.md)


> **⏱️ 预计时间**: 30分钟  
> **💡 难度**: 初学者  
> **🎯 目标**: 创建一个可工作的多智能体应用  

## 🚀 **您将构建什么**

在本教程中，您将创建一个**社交媒体管理智能体**，它可以：
- 监控多个平台上的提及
- 自动回复用户互动
- 安排和发布内容
- 生成参与度报告

## 📋 **前置条件**

开始之前，请确保您已：
- ✅ [安装了MPLP SDK](installation.md)
- ✅ Node.js 18+ 和 npm 8+
- ✅ 基础的TypeScript/JavaScript知识
- ✅ 代码编辑器（推荐VS Code）

## 🏗️ **步骤1: 创建您的项目（5分钟）**

### **初始化项目**

```bash
# 创建新的MPLP项目
mplp create social-media-manager --template agent-app
cd social-media-manager

# 安装依赖
npm install

# 验证设置
npm run test
```

### **项目结构**
```
social-media-manager/
├── src/
│   ├── agents/          # 智能体定义
│   ├── config/          # 配置文件
│   ├── services/        # 业务逻辑
│   └── index.ts         # 应用入口点
├── tests/               # 测试文件
├── .env.example         # 环境变量模板
└── package.json         # 项目配置
```

## 🤖 **步骤2: 创建您的第一个智能体（10分钟）**

### **定义智能体**

创建 `src/agents/social-media-agent.ts`:

```typescript
import { Agent, AgentBuilder } from '@mplp/agent-builder';
import { TwitterAdapter, LinkedInAdapter } from '@mplp/adapters';

export class SocialMediaAgent extends Agent {
  private twitterAdapter: TwitterAdapter;
  private linkedinAdapter: LinkedInAdapter;

  constructor() {
    super('social-media-manager');
    
    // 初始化平台适配器
    this.twitterAdapter = new TwitterAdapter({
      apiKey: process.env.TWITTER_API_KEY!,
      apiSecret: process.env.TWITTER_API_SECRET!,
      accessToken: process.env.TWITTER_ACCESS_TOKEN!,
      accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET!
    });

    this.linkedinAdapter = new LinkedInAdapter({
      clientId: process.env.LINKEDIN_CLIENT_ID!,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
      accessToken: process.env.LINKEDIN_ACCESS_TOKEN!
    });
  }

  async initialize(): Promise<void> {
    // 设置事件监听器
    this.setupEventHandlers();
    
    // 开始监控
    await this.startMonitoring();
    
    console.log('🤖 社交媒体智能体初始化成功！');
  }

  private setupEventHandlers(): void {
    // 处理Twitter提及
    this.twitterAdapter.on('mention', async (mention) => {
      await this.handleMention('twitter', mention);
    });

    // 处理LinkedIn消息
    this.linkedinAdapter.on('message', async (message) => {
      await this.handleMessage('linkedin', message);
    });
  }

  private async startMonitoring(): Promise<void> {
    // 开始实时监控
    await this.twitterAdapter.startStream(['mention', 'direct_message']);
    await this.linkedinAdapter.startMonitoring();
  }

  private async handleMention(platform: string, mention: any): Promise<void> {
    console.log(`📱 ${platform}上的新提及:`, mention.text);
    
    // 使用AI生成回复（占位符）
    const response = await this.generateResponse(mention.text);
    
    // 回复提及
    if (platform === 'twitter') {
      await this.twitterAdapter.reply(mention.id, response);
    }
  }

  private async handleMessage(platform: string, message: any): Promise<void> {
    console.log(`💬 ${platform}上的新消息:`, message.content);
    
    // 处理并回复消息
    const response = await this.generateResponse(message.content);
    
    if (platform === 'linkedin') {
      await this.linkedinAdapter.sendMessage(message.senderId, response);
    }
  }

  private async generateResponse(input: string): Promise<string> {
    // 简单的回复生成（您可以集成AI服务）
    const responses = [
      "感谢您的联系！我们会尽快回复您。",
      "感谢您的关注！今天我们能为您做些什么？",
      "我们感谢您的消息！我们的团队会很快回复。",
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }

  async publishContent(content: string, platforms: string[]): Promise<void> {
    for (const platform of platforms) {
      try {
        if (platform === 'twitter' && content.length <= 280) {
          await this.twitterAdapter.tweet(content);
        } else if (platform === 'linkedin') {
          await this.linkedinAdapter.post(content);
        }
        
        console.log(`✅ 内容已发布到${platform}`);
      } catch (error) {
        console.error(`❌ 发布到${platform}失败:`, error);
      }
    }
  }
}
```

## ⚙️ **步骤3: 配置您的应用（5分钟）**

### **环境设置**

复制 `.env.example` 到 `.env` 并添加您的API密钥：

```bash
# 复制环境模板
cp .env.example .env
```

编辑 `.env`:
```bash
# Twitter API凭证
TWITTER_API_KEY=your_twitter_api_key
TWITTER_API_SECRET=your_twitter_api_secret
TWITTER_ACCESS_TOKEN=your_twitter_access_token
TWITTER_ACCESS_TOKEN_SECRET=your_twitter_access_token_secret

# LinkedIn API凭证
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
LINKEDIN_ACCESS_TOKEN=your_linkedin_access_token

# 应用设置
NODE_ENV=development
LOG_LEVEL=info
```

### **应用配置**

更新 `src/config/app.config.ts`:

```typescript
export const appConfig = {
  name: '社交媒体管理器',
  version: '1.0.0',
  agents: {
    socialMedia: {
      enabled: true,
      platforms: ['twitter', 'linkedin'],
      autoReply: true,
      responseDelay: 5000 // 5秒
    }
  },
  monitoring: {
    keywords: ['@yourbrand', '#yourbrand'],
    languages: ['zh', 'en'],
    sentiment: true
  }
};
```

## 🎮 **步骤4: 创建主应用（5分钟）**

### **应用入口点**

更新 `src/index.ts`:

```typescript
import { MPLPApplication } from '@mplp/sdk-core';
import { SocialMediaAgent } from './agents/social-media-agent';
import { appConfig } from './config/app.config';

async function main() {
  try {
    // 创建MPLP应用
    const app = new MPLPApplication({
      name: appConfig.name,
      version: appConfig.version,
      logLevel: process.env.LOG_LEVEL || 'info'
    });

    // 创建并注册社交媒体智能体
    const socialMediaAgent = new SocialMediaAgent();
    app.registerAgent('social-media', socialMediaAgent);

    // 初始化应用
    await app.initialize();
    
    console.log('🚀 社交媒体管理器启动成功！');
    console.log('📱 正在监控社交媒体平台...');

    // 示例：安排一个帖子
    setTimeout(async () => {
      await socialMediaAgent.publishContent(
        "来自我们MPLP驱动的社交媒体智能体的问候！🤖 #MPLP #MultiAgent",
        ['twitter', 'linkedin']
      );
    }, 10000); // 10秒后发布

    // 处理优雅关闭
    process.on('SIGINT', async () => {
      console.log('\n🛑 正在优雅关闭...');
      await app.shutdown();
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ 启动应用失败:', error);
    process.exit(1);
  }
}

// 启动应用
main().catch(console.error);
```

## 🧪 **步骤5: 测试您的智能体（5分钟）**

### **运行应用**

```bash
# 在开发模式下启动
npm run dev

# 预期输出:
# 🤖 社交媒体智能体初始化成功！
# 🚀 社交媒体管理器启动成功！
# 📱 正在监控社交媒体平台...
# ✅ 内容已发布到twitter
# ✅ 内容已发布到linkedin
```

### **测试功能**

1. **监控提及**: 智能体将自动检测提及
2. **自动回复**: 将自动发送回复
3. **内容发布**: 计划的帖子将被发布
4. **错误处理**: 检查日志中的任何问题

### **运行测试**

```bash
# 运行单元测试
npm test

# 运行集成测试
npm run test:integration

# 检查测试覆盖率
npm run test:coverage
```

## 🎉 **恭喜！**

您已成功创建了您的第一个MPLP多智能体应用！您的社交媒体管理智能体现在可以：

- ✅ 监控多个社交媒体平台
- ✅ 自动回复提及和消息
- ✅ 跨平台发布内容
- ✅ 优雅地处理错误

## 🚀 **下一步**

### **增强您的智能体**

1. **添加AI集成**:
   ```bash
   npm install @mplp/ai-services
   ```

2. **添加更多平台**:
   ```bash
   npm install @mplp/adapters-extended
   ```

3. **添加分析**:
   ```bash
   npm install @mplp/analytics
   ```

### **高级功能**

- **多智能体工作流 (开发中)** - 协调多个智能体
- **[自定义适配器](../guides/custom-adapters.md)** - 构建您自己的平台集成
- **AI集成 (开发中)** - 添加智能回复
- **[部署指南](../guides/deployment.md)** - 部署到生产环境

### **学习资源**

- **API参考 (开发中)** - 完整的API文档
- **示例 (开发中)** - 更多示例应用
- **[最佳实践](../guides/best-practices.md)** - 开发最佳实践
- **[社区](../../community/README.md)** - 加入MPLP社区

## 🆘 **需要帮助？**

- **文档**: [MPLP文档](../../README.md)
- **社区**: [Discord服务器](https://discord.gg/mplp)
- **问题**: [GitHub Issues](https://github.com/mplp-org/mplp/issues)
- **支持**: support@mplp.dev

---

**🎯 教程完成！** 您已经在30分钟内构建了一个可工作的多智能体应用。欢迎来到MPLP开发的世界！

**下一个教程**: 构建多智能体工作流 (开发中)
