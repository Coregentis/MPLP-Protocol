# 创建你的第一个Agent

> **🎯 目标**: 30分钟内构建一个完整的MPLP Agent应用
> **📚 前置要求**: 已完成[安装指南](installation.md)
> **🌐 语言**: [English](../../docs-sdk-en/getting-started/first-agent.md) | 中文

---

## 📋 **概览**

本教程将指导你创建一个简单但功能完整的MPLP Agent，涵盖：
- ✅ 基础Agent配置
- ✅ 模块集成（Context, Plan, Role）
- ✅ 工作流编排
- ✅ 实际运行和测试

---

## 🚀 **第1步：项目初始化**

### **创建项目目录**

```bash
# 创建项目目录
mkdir my-first-agent
cd my-first-agent

# 初始化npm项目
npm init -y

# 安装MPLP
npm install mplp@beta

# 安装TypeScript（推荐）
npm install -D typescript @types/node ts-node
npx tsc --init
```

### **项目结构**

```
my-first-agent/
├── src/
│   ├── index.ts          # 主入口文件
│   ├── agent.ts          # Agent定义
│   └── config.ts         # 配置文件
├── package.json
└── tsconfig.json
```

---

## 💻 **第2步：创建基础Agent**

### **src/config.ts - 配置文件**

```typescript
import { MPLPConfig } from 'mplp';

export const agentConfig: MPLPConfig = {
  // 协议版本
  protocolVersion: '1.1.0-beta',
  
  // 运行环境
  environment: 'development',
  
  // 日志级别
  logLevel: 'info',
  
  // 要加载的模块
  modules: ['context', 'plan', 'role'],
  
  // 自定义配置
  customConfig: {
    agentName: 'MyFirstAgent',
    agentType: 'assistant',
    capabilities: ['greeting', 'task-execution']
  }
};
```

### **src/agent.ts - Agent定义**

```typescript
import { MPLP, MPLPConfig } from 'mplp';
import { agentConfig } from './config';

/**
 * MyFirstAgent类
 * 一个简单的MPLP Agent示例
 */
export class MyFirstAgent {
  private mplp: MPLP;
  private initialized: boolean = false;

  constructor(config: MPLPConfig = agentConfig) {
    this.mplp = new MPLP(config);
  }

  /**
   * 初始化Agent
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      console.log('⚠️  Agent已经初始化');
      return;
    }

    console.log('🚀 正在初始化Agent...');
    await this.mplp.initialize();
    this.initialized = true;
    console.log('✅ Agent初始化成功');
  }

  /**
   * 执行问候任务
   */
  async greet(name: string): Promise<string> {
    if (!this.initialized) {
      throw new Error('Agent未初始化，请先调用initialize()');
    }

    // 使用Context模块创建上下文
    const contextModule = this.mplp.getModule('context');
    if (!contextModule) {
      throw new Error('Context模块未加载');
    }

    console.log(`👋 你好, ${name}!`);
    return `Hello, ${name}! I'm MyFirstAgent, powered by MPLP v1.1.0-beta`;
  }

  /**
   * 执行简单任务
   */
  async executeTask(taskDescription: string): Promise<void> {
    if (!this.initialized) {
      throw new Error('Agent未初始化');
    }

    console.log(`📋 执行任务: ${taskDescription}`);
    
    // 使用Plan模块创建计划
    const planModule = this.mplp.getModule('plan');
    if (!planModule) {
      throw new Error('Plan模块未加载');
    }

    console.log('✅ 任务执行完成');
  }

  /**
   * 获取Agent信息
   */
  getInfo(): object {
    return {
      name: 'MyFirstAgent',
      version: this.mplp.getVersion(),
      status: this.initialized ? 'ready' : 'not-initialized',
      modules: this.mplp.getLoadedModules()
    };
  }

  /**
   * 关闭Agent
   */
  async shutdown(): Promise<void> {
    console.log('🛑 正在关闭Agent...');
    // 清理资源
    this.initialized = false;
    console.log('✅ Agent已关闭');
  }
}
```

### **src/index.ts - 主入口**

```typescript
import { MyFirstAgent } from './agent';

/**
 * 主函数
 */
async function main() {
  // 创建Agent实例
  const agent = new MyFirstAgent();

  try {
    // 初始化Agent
    await agent.initialize();

    // 显示Agent信息
    console.log('\n📊 Agent信息:');
    console.log(JSON.stringify(agent.getInfo(), null, 2));

    // 执行问候
    console.log('\n👋 执行问候:');
    const greeting = await agent.greet('开发者');
    console.log(greeting);

    // 执行任务
    console.log('\n📋 执行任务:');
    await agent.executeTask('处理用户请求');

    // 关闭Agent
    await agent.shutdown();

  } catch (error) {
    console.error('❌ 错误:', error);
    process.exit(1);
  }
}

// 运行主函数
main().catch(console.error);
```

---

## 🏃 **第3步：运行Agent**

### **添加运行脚本**

在`package.json`中添加：

```json
{
  "scripts": {
    "start": "ts-node src/index.ts",
    "build": "tsc",
    "dev": "ts-node --watch src/index.ts"
  }
}
```

### **运行Agent**

```bash
# 开发模式运行
npm run dev

# 或直接运行
npm start
```

### **预期输出**

```
🚀 正在初始化Agent...
✅ Agent初始化成功

📊 Agent信息:
{
  "name": "MyFirstAgent",
  "version": "1.1.0-beta",
  "status": "ready",
  "modules": ["context", "plan", "role"]
}

👋 执行问候:
👋 你好, 开发者!
Hello, 开发者! I'm MyFirstAgent, powered by MPLP v1.1.0-beta

📋 执行任务:
📋 执行任务: 处理用户请求
✅ 任务执行完成

🛑 正在关闭Agent...
✅ Agent已关闭
```

---

## 🎯 **第4步：扩展Agent功能**

### **添加更多模块**

```typescript
// 在config.ts中添加更多模块
export const agentConfig: MPLPConfig = {
  modules: [
    'context',   // 上下文管理
    'plan',      // 计划编排
    'role',      // 角色权限
    'confirm',   // 确认审批
    'trace'      // 执行追踪
  ]
};
```

### **使用工厂函数快速创建**

```typescript
import { quickStart } from 'mplp';

async function quickDemo() {
  // 使用quickStart快速创建MPLP实例
  const mplp = await quickStart();
  
  console.log('MPLP版本:', mplp.getVersion());
  console.log('已加载模块:', mplp.getLoadedModules());
}
```

---

## 📚 **下一步**

恭喜！你已经成功创建了第一个MPLP Agent。接下来可以：

1. **深入学习**: 阅读[API参考文档](../api-reference/sdk-core.md)
2. **高级教程**: 学习[多Agent协作](../tutorials/multi-agent-workflow.md)
3. **最佳实践**: 查看[开发最佳实践](../guides/best-practices.md)
4. **示例代码**: 浏览[完整示例](../examples/)

---

## 🔗 **相关资源**

- [MPLP核心API](../api-reference/sdk-core.md)
- [模块文档](../../docs/en/modules/)
- [GitHub仓库](https://github.com/Coregentis/MPLP-Protocol)
- [问题反馈](https://github.com/Coregentis/MPLP-Protocol/issues)

---

**版本**: v1.1.0-beta  
**更新时间**: 2025-10-22  
**作者**: MPLP Team

