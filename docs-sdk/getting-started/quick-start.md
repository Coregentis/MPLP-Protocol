# MPLP SDK 快速开始

## 🎯 **30分钟构建第一个多智能体应用**

本指南将带您在30分钟内从零开始构建一个完整的多智能体应用。

## 📋 **准备工作**

确保您已经：
- ✅ 安装了Node.js 18+
- ✅ 安装了MPLP SDK（参考[安装指南](installation.md)）
- ✅ 有基本的TypeScript/JavaScript知识

## 🚀 **第1步: 创建项目（5分钟）**

### **使用CLI创建项目**
```bash
# 创建新项目
mplp create hello-mplp-app

# 进入项目目录
cd hello-mplp-app

# 安装依赖
npm install
```

### **手动创建项目**
```bash
# 创建项目目录
mkdir hello-mplp-app
cd hello-mplp-app

# 初始化npm项目
npm init -y

# 安装MPLP SDK
npm install @mplp/sdk-core @mplp/agent-builder @mplp/orchestrator

# 安装TypeScript开发依赖
npm install --save-dev typescript @types/node ts-node
```

### **项目结构**
```
hello-mplp-app/
├── src/
│   ├── index.ts          # 应用入口
│   ├── agents/           # Agent定义
│   └── workflows/        # 工作流定义
├── package.json
├── tsconfig.json
└── README.md
```

## 🤖 **第2步: 创建第一个Agent（10分钟）**

创建 `src/agents/GreetingAgent.ts`：

```typescript
import { AgentBuilder } from '@mplp/agent-builder';

export class GreetingAgent {
  private agent: any;

  constructor() {
    this.agent = new AgentBuilder('GreetingAgent')
      .withDescription('一个友好的问候Agent')
      .withCapability('greeting', {
        handler: this.greet.bind(this)
      })
      .withCapability('farewell', {
        handler: this.farewell.bind(this)
      })
      .build();
  }

  async greet(name: string): Promise<string> {
    return `你好，${name}！欢迎使用MPLP！`;
  }

  async farewell(name: string): Promise<string> {
    return `再见，${name}！感谢使用MPLP！`;
  }

  getAgent() {
    return this.agent;
  }
}
```

## 🔄 **第3步: 创建工作流（10分钟）**

创建 `src/workflows/GreetingWorkflow.ts`：

```typescript
import { MultiAgentOrchestrator } from '@mplp/orchestrator';
import { GreetingAgent } from '../agents/GreetingAgent';

export class GreetingWorkflow {
  private orchestrator: MultiAgentOrchestrator;
  private greetingAgent: GreetingAgent;

  constructor() {
    this.orchestrator = new MultiAgentOrchestrator();
    this.greetingAgent = new GreetingAgent();
    
    // 注册Agent
    this.orchestrator.registerAgent(this.greetingAgent.getAgent());
  }

  async createWorkflow() {
    return this.orchestrator
      .createWorkflow('greeting_workflow')
      .step('greet_user', async (input: { name: string }) => {
        const greeting = await this.greetingAgent.greet(input.name);
        console.log('问候:', greeting);
        return { greeting, name: input.name };
      })
      .step('process_greeting', async (input: { greeting: string, name: string }) => {
        // 模拟一些处理逻辑
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('处理完成，准备告别...');
        return input;
      })
      .step('farewell_user', async (input: { name: string }) => {
        const farewell = await this.greetingAgent.farewell(input.name);
        console.log('告别:', farewell);
        return { farewell };
      })
      .build();
  }

  async execute(userName: string) {
    const workflow = await this.createWorkflow();
    return await this.orchestrator.executeWorkflow('greeting_workflow', { name: userName });
  }
}
```

## 🏗️ **第4步: 创建应用入口（5分钟）**

创建 `src/index.ts`：

```typescript
import { MPLPApplication } from '@mplp/sdk-core';
import { GreetingWorkflow } from './workflows/GreetingWorkflow';

async function main() {
  console.log('🚀 启动MPLP应用...');

  try {
    // 创建MPLP应用
    const app = new MPLPApplication('HelloMPLPApp', {
      logLevel: 'info',
      enableHealthCheck: true
    });

    // 初始化应用
    await app.initialize();
    console.log('✅ 应用初始化成功');

    // 启动应用
    await app.start();
    console.log('✅ 应用启动成功');

    // 创建并执行工作流
    const workflow = new GreetingWorkflow();
    console.log('🤖 执行问候工作流...');
    
    const result = await workflow.execute('MPLP开发者');
    console.log('🎉 工作流执行完成:', result);

    // 优雅关闭
    await app.stop();
    console.log('✅ 应用已停止');

  } catch (error) {
    console.error('❌ 应用执行失败:', error);
    process.exit(1);
  }
}

// 处理未捕获的异常
process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error);
  process.exit(1);
});

// 启动应用
main().catch(console.error);
```

## ⚙️ **第5步: 配置和运行**

### **配置TypeScript**
创建 `tsconfig.json`：
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
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### **配置package.json脚本**
在 `package.json` 中添加：
```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "ts-node src/index.ts",
    "clean": "rm -rf dist"
  }
}
```

### **运行应用**
```bash
# 开发模式运行
npm run dev

# 或构建后运行
npm run build
npm start
```

## 🎉 **预期输出**

运行成功后，您应该看到类似输出：
```
🚀 启动MPLP应用...
✅ 应用初始化成功
✅ 应用启动成功
🤖 执行问候工作流...
问候: 你好，MPLP开发者！欢迎使用MPLP！
处理完成，准备告别...
告别: 再见，MPLP开发者！感谢使用MPLP！
🎉 工作流执行完成: { farewell: '再见，MPLP开发者！感谢使用MPLP！' }
✅ 应用已停止
```

## 🔧 **扩展应用**

### **添加更多Agent**
```typescript
// 创建计算Agent
const mathAgent = new AgentBuilder('MathAgent')
  .withCapability('add', (a: number, b: number) => a + b)
  .withCapability('multiply', (a: number, b: number) => a * b)
  .build();
```

### **添加平台集成**
```bash
# 安装Twitter适配器
npm install @mplp/adapter-twitter

# 在代码中使用
import { TwitterAdapter } from '@mplp/adapter-twitter';

const twitterAgent = new AgentBuilder('TwitterBot')
  .withPlatform(new TwitterAdapter({
    apiKey: process.env.TWITTER_API_KEY,
    apiSecret: process.env.TWITTER_API_SECRET
  }))
  .build();
```

## 📚 **下一步**

恭喜！您已经成功创建了第一个MPLP应用。接下来可以：

1. **深入学习**: [创建第一个Agent](first-agent.md)
2. **查看示例**: [示例应用](../examples/)
3. **阅读指南**: [开发指南](../guides/)
4. **API参考**: [API文档](../api-reference/)

## 🆘 **遇到问题？**

- 查看[故障排除指南](../guides/troubleshooting.md)
- 访问[社区讨论](https://github.com/mplp-org/mplp/discussions)
- 提交[问题反馈](https://github.com/mplp-org/mplp/issues)

---

**恭喜您完成了MPLP SDK快速开始！** 🎉
