# 简单Agent示例

> **🎯 目标**: 通过完整示例学习MPLP Agent开发  
> **⏱️ 完成时间**: 20分钟  
> **🌐 语言**: [English](../../docs-sdk-en/examples/simple-agent.md) | 中文

---

## 📋 **示例概览**

本示例展示一个简单但完整的MPLP Agent，实现以下功能：
- ✅ 问候用户
- ✅ 执行简单任务
- ✅ 管理任务状态
- ✅ 错误处理

---

## 🚀 **完整代码**

### **项目结构**

```
simple-agent-example/
├── src/
│   ├── index.ts
│   └── SimpleAgent.ts
├── package.json
└── tsconfig.json
```

### **package.json**

```json
{
  "name": "simple-agent-example",
  "version": "1.0.0",
  "description": "Simple MPLP Agent Example",
  "main": "dist/index.js",
  "scripts": {
    "start": "ts-node src/index.ts",
    "build": "tsc",
    "dev": "ts-node --watch src/index.ts"
  },
  "dependencies": {
    "mplp": "^1.1.0-beta"
  },
  "devDependencies": {
    "@types/node": "^18.0.0",
    "typescript": "^5.0.0",
    "ts-node": "^10.0.0"
  }
}
```

### **tsconfig.json**

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

### **src/SimpleAgent.ts**

```typescript
import { MPLP, MPLPConfig, createMPLP } from 'mplp';

/**
 * 简单Agent示例
 * 展示MPLP的基本使用方法
 */
export class SimpleAgent {
  private mplp?: MPLP;
  private initialized: boolean = false;
  private taskCount: number = 0;

  /**
   * 初始化Agent
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      console.log('⚠️  Agent已经初始化');
      return;
    }

    try {
      console.log('🚀 正在初始化SimpleAgent...');
      
      // 创建MPLP实例，只加载需要的模块
      this.mplp = await createMPLP({
        environment: 'development',
        logLevel: 'info',
        modules: ['context', 'plan', 'role']
      });

      this.initialized = true;
      console.log('✅ SimpleAgent初始化成功');
      console.log(`📦 已加载模块: ${this.mplp.getLoadedModules().join(', ')}`);
      
    } catch (error) {
      console.error('❌ 初始化失败:', error);
      throw error;
    }
  }

  /**
   * 问候用户
   */
  async greet(name: string): Promise<string> {
    this.ensureInitialized();

    console.log(`\n👋 问候: ${name}`);
    
    // 使用Context模块（如果可用）
    const contextModule = this.mplp!.getModule('context');
    if (contextModule) {
      console.log('🔧 使用Context模块创建上下文');
    }

    const greeting = `你好, ${name}! 我是SimpleAgent，基于MPLP v${this.mplp!.getVersion()}构建。`;
    console.log(`💬 ${greeting}`);
    
    return greeting;
  }

  /**
   * 执行任务
   */
  async executeTask(taskName: string, taskData?: any): Promise<{
    success: boolean;
    taskId: number;
    result?: any;
    error?: string;
  }> {
    this.ensureInitialized();

    const taskId = ++this.taskCount;
    console.log(`\n📋 执行任务 #${taskId}: ${taskName}`);

    try {
      // 使用Plan模块创建执行计划
      const planModule = this.mplp!.getModule('plan');
      if (planModule) {
        console.log('📝 使用Plan模块创建执行计划');
      }

      // 模拟任务执行
      console.log('⏳ 处理中...');
      await this.delay(1000);

      const result = {
        taskName,
        taskData,
        completedAt: new Date().toISOString()
      };

      console.log('✅ 任务完成');
      
      return {
        success: true,
        taskId,
        result
      };

    } catch (error) {
      console.error('❌ 任务失败:', error);
      
      return {
        success: false,
        taskId,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * 获取Agent状态
   */
  getStatus(): {
    initialized: boolean;
    version: string;
    modules: string[];
    tasksExecuted: number;
  } {
    return {
      initialized: this.initialized,
      version: this.mplp?.getVersion() || 'N/A',
      modules: this.mplp?.getLoadedModules() || [],
      tasksExecuted: this.taskCount
    };
  }

  /**
   * 关闭Agent
   */
  async shutdown(): Promise<void> {
    console.log('\n🛑 正在关闭SimpleAgent...');
    
    this.initialized = false;
    this.taskCount = 0;
    
    console.log('✅ SimpleAgent已关闭');
  }

  /**
   * 确保已初始化
   */
  private ensureInitialized(): void {
    if (!this.initialized || !this.mplp) {
      throw new Error('Agent未初始化，请先调用initialize()');
    }
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

### **src/index.ts**

```typescript
import { SimpleAgent } from './SimpleAgent';

/**
 * 主函数 - 演示SimpleAgent的使用
 */
async function main() {
  console.log('='.repeat(60));
  console.log('🎯 SimpleAgent示例');
  console.log('='.repeat(60));

  // 创建Agent实例
  const agent = new SimpleAgent();

  try {
    // 1. 初始化Agent
    await agent.initialize();

    // 2. 显示Agent状态
    console.log('\n📊 Agent状态:');
    const status = agent.getStatus();
    console.log(JSON.stringify(status, null, 2));

    // 3. 问候用户
    await agent.greet('开发者');
    await agent.greet('MPLP用户');

    // 4. 执行任务
    const task1 = await agent.executeTask('数据处理', {
      type: 'process',
      data: [1, 2, 3, 4, 5]
    });
    console.log('任务1结果:', task1);

    const task2 = await agent.executeTask('报告生成', {
      type: 'report',
      format: 'PDF'
    });
    console.log('任务2结果:', task2);

    const task3 = await agent.executeTask('邮件发送', {
      to: 'user@example.com',
      subject: '测试邮件'
    });
    console.log('任务3结果:', task3);

    // 5. 显示最终状态
    console.log('\n📊 最终状态:');
    const finalStatus = agent.getStatus();
    console.log(JSON.stringify(finalStatus, null, 2));

    // 6. 关闭Agent
    await agent.shutdown();

    console.log('\n' + '='.repeat(60));
    console.log('✅ 示例执行完成');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ 错误:', error);
    process.exit(1);
  }
}

// 运行主函数
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
```

---

## 🏃 **运行示例**

### **1. 安装依赖**

```bash
npm install
```

### **2. 运行示例**

```bash
# 开发模式（自动重载）
npm run dev

# 或直接运行
npm start

# 或构建后运行
npm run build
node dist/index.js
```

### **3. 预期输出**

```
============================================================
🎯 SimpleAgent示例
============================================================
🚀 正在初始化SimpleAgent...
✅ SimpleAgent初始化成功
📦 已加载模块: context, plan, role

📊 Agent状态:
{
  "initialized": true,
  "version": "1.1.0-beta",
  "modules": ["context", "plan", "role"],
  "tasksExecuted": 0
}

👋 问候: 开发者
🔧 使用Context模块创建上下文
💬 你好, 开发者! 我是SimpleAgent，基于MPLP v1.1.0-beta构建。

👋 问候: MPLP用户
🔧 使用Context模块创建上下文
💬 你好, MPLP用户! 我是SimpleAgent，基于MPLP v1.1.0-beta构建。

📋 执行任务 #1: 数据处理
📝 使用Plan模块创建执行计划
⏳ 处理中...
✅ 任务完成
任务1结果: {
  success: true,
  taskId: 1,
  result: {
    taskName: '数据处理',
    taskData: { type: 'process', data: [1, 2, 3, 4, 5] },
    completedAt: '2025-10-22T...'
  }
}

📋 执行任务 #2: 报告生成
📝 使用Plan模块创建执行计划
⏳ 处理中...
✅ 任务完成
任务2结果: {
  success: true,
  taskId: 2,
  result: {
    taskName: '报告生成',
    taskData: { type: 'report', format: 'PDF' },
    completedAt: '2025-10-22T...'
  }
}

📋 执行任务 #3: 邮件发送
📝 使用Plan模块创建执行计划
⏳ 处理中...
✅ 任务完成
任务3结果: {
  success: true,
  taskId: 3,
  result: {
    taskName: '邮件发送',
    taskData: { to: 'user@example.com', subject: '测试邮件' },
    completedAt: '2025-10-22T...'
  }
}

📊 最终状态:
{
  "initialized": true,
  "version": "1.1.0-beta",
  "modules": ["context", "plan", "role"],
  "tasksExecuted": 3
}

🛑 正在关闭SimpleAgent...
✅ SimpleAgent已关闭

============================================================
✅ 示例执行完成
============================================================
```

---

## 🎓 **学习要点**

### **1. Agent初始化**
```typescript
const agent = new SimpleAgent();
await agent.initialize();
```

### **2. 模块使用**
```typescript
const contextModule = this.mplp!.getModule('context');
const planModule = this.mplp!.getModule('plan');
```

### **3. 错误处理**
```typescript
try {
  // 执行操作
} catch (error) {
  console.error('错误:', error);
  return { success: false, error: error.message };
}
```

### **4. 状态管理**
```typescript
getStatus() {
  return {
    initialized: this.initialized,
    version: this.mplp?.getVersion(),
    modules: this.mplp?.getLoadedModules(),
    tasksExecuted: this.taskCount
  };
}
```

---

## 🔧 **扩展建议**

### **1. 添加更多模块**
```typescript
modules: ['context', 'plan', 'role', 'trace', 'confirm']
```

### **2. 实现真实业务逻辑**
```typescript
async executeTask(taskName: string, taskData?: any) {
  // 替换模拟逻辑为真实业务逻辑
  const result = await this.processRealTask(taskData);
  return result;
}
```

### **3. 添加持久化**
```typescript
async saveTaskResult(result: TaskResult) {
  // 保存到数据库
  await database.save(result);
}
```

---

## 📚 **下一步**

- [基础Agent教程](../tutorials/basic-agent.md)
- [多Agent协作](../tutorials/multi-agent-workflow.md)
- [最佳实践](../guides/best-practices.md)
- [API参考](../api-reference/sdk-core.md)

---

**版本**: v1.1.0-beta  
**更新时间**: 2025-10-22  
**作者**: MPLP Team

