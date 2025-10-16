# @mplp/studio API参考文档

> **🌐 语言导航**: [English](../../../en/sdk-api/studio/README.md) | [中文](README.md)


> **包名**: @mplp/studio  
> **版本**: v1.1.0-beta  
> **更新时间**: 2025-09-20  
> **状态**: ✅ 生产就绪  

## 📚 **包概览**

`@mplp/studio`包为MPLP应用程序提供全面的可视化开发环境。它具有用于构建智能代理和工作流的拖拽界面、实时协作工具和集成开发功能，具有企业级特性。

### **🎯 关键功能**

- **🎨 可视化代理构建器**: 用于创建智能代理的拖拽界面
- **🔄 工作流设计器**: 带实时预览的可视化工作流设计
- **📁 项目管理**: 带模板的完整项目生命周期管理
- **🏢 工作区管理**: 带文件操作的多项目工作区
- **👥 团队协作**: 实时编辑、评论、版本控制、访问控制
- **⚡ 代码生成**: 自动TypeScript/JavaScript代码生成
- **🐛 调试工具**: 集成调试和性能监控
- **🌐 Web界面**: 现代化的基于Web的IDE，响应式设计

### **📦 安装**

```bash
# 本地安装
npm install @mplp/studio

# 全局安装CLI
npm install -g @mplp/studio

# 验证安装
mplp-studio --version
```

### **🏗️ 架构**

```
┌─────────────────────────────────────────┐
│            MPLP Studio                  │
│        (可视化开发IDE)                  │
├─────────────────────────────────────────┤
│  StudioApplication | ProjectManager    │
│  WorkspaceManager | StudioServer       │
├─────────────────────────────────────────┤
│         可视化构建器                    │
│  AgentBuilder | WorkflowDesigner       │
│  ComponentLibrary | PropertyEditor     │
├─────────────────────────────────────────┤
│         UI组件                          │
│  Canvas | Toolbar | Sidebar | Panel    │
│  ThemeManager | ComponentSystem        │
└─────────────────────────────────────────┘
```

## 🚀 **快速开始**

### **启动Studio**

```bash
# 启动Studio服务器
mplp-studio start

# 或直接运行
npx @mplp/studio

# 访问 http://localhost:3000
```

### **编程使用**

```typescript
import { createStudioApplication, StudioConfig } from '@mplp/studio';

// 创建Studio应用程序
const config: StudioConfig = {
  version: '1.1.0-beta',
  environment: 'development',
  server: {
    port: 3000,
    host: 'localhost',
    cors: {
      enabled: true,
      origins: ['http://localhost:3000']
    }
  },
  workspace: {
    defaultPath: './workspace',
    maxRecentFiles: 10,
    autoSave: true,
    autoSaveInterval: 30000
  }
};

const studio = createStudioApplication(config);
await studio.initialize();
await studio.start();

console.log('🎨 MPLP Studio已在 http://localhost:3000 启动');
```

## 📋 **核心类**

### **StudioApplication**

管理整个Studio环境的主应用程序类。

#### **构造函数**

```typescript
constructor(config: StudioConfig)
```

#### **核心方法**

##### `initialize(): Promise<void>`

初始化Studio应用程序和所有子系统。

```typescript
const studio = new StudioApplication(config);
await studio.initialize();
console.log('🎨 Studio已初始化');
```

##### `start(): Promise<void>`

启动Studio服务器和Web界面。

```typescript
await studio.start();
console.log('🚀 Studio服务器已启动');
```

##### `shutdown(): Promise<void>`

优雅地关闭Studio应用程序。

```typescript
await studio.shutdown();
console.log('🛑 Studio已关闭');
```

##### `getStatus(): StudioState`

获取当前Studio应用程序状态。

```typescript
const status = studio.getStatus();
console.log(`Studio运行中: ${status.isRunning}`);
console.log(`当前项目: ${status.currentProject?.name}`);
```

#### **事件**

```typescript
studio.on('initialized', () => {
  console.log('Studio已初始化');
});

studio.on('started', () => {
  console.log('Studio服务器已启动');
});

studio.on('projectOpened', (project) => {
  console.log(`项目已打开: ${project.name}`);
});

studio.on('error', (error) => {
  console.error('Studio错误:', error);
});
```

### **ProjectManager**

管理项目创建、加载、保存和生命周期操作。

#### **构造函数**

```typescript
constructor(config: StudioConfig)
```

#### **项目操作**

##### `createProject(options: CreateProjectOptions): Promise<Project>`

使用指定模板和配置创建新的MPLP项目。

```typescript
const project = await projectManager.createProject({
  name: 'MyAgentSystem',
  description: '多智能体客户服务系统',
  template: 'enterprise',
  path: './projects/my-agent-system',
  author: '张三',
  license: 'MIT'
});

console.log(`项目已创建: ${project.id}`);
```

##### `loadProject(projectPath: string): Promise<Project>`

从指定路径加载现有项目。

```typescript
const project = await projectManager.loadProject('./projects/existing-project');
console.log(`已加载项目: ${project.name}`);
```

##### `saveProject(project: Project): Promise<void>`

将当前项目状态保存到磁盘。

```typescript
await projectManager.saveProject(currentProject);
console.log('项目保存成功');
```

##### `getRecentProjects(): Project[]`

获取最近打开的项目列表。

```typescript
const recentProjects = projectManager.getRecentProjects();
console.log(`最近项目: ${recentProjects.length}个`);
```

#### **模板管理**

##### `getAvailableTemplates(): ProjectTemplate[]`

获取所有可用的项目模板。

```typescript
const templates = projectManager.getAvailableTemplates();
templates.forEach(template => {
  console.log(`模板: ${template.name} - ${template.description}`);
});
```

##### `createFromTemplate(templateName: string, projectOptions: ProjectOptions): Promise<Project>`

从特定模板创建新项目。

```typescript
const project = await projectManager.createFromTemplate('social-media-bot', {
  name: 'TwitterBot',
  path: './projects/twitter-bot',
  customization: {
    platforms: ['twitter', 'linkedin'],
    features: ['auto-reply', 'sentiment-analysis']
  }
});
```

### **WorkspaceManager**

管理工作区配置、文件操作和多项目环境。

#### **构造函数**

```typescript
constructor(config: StudioConfig)
```

#### **工作区操作**

##### `initializeWorkspace(path: string): Promise<WorkspaceConfig>`

在指定路径初始化新工作区。

```typescript
const workspace = await workspaceManager.initializeWorkspace('./my-workspace');
console.log(`工作区已初始化: ${workspace.name}`);
```

##### `openWorkspace(path: string): Promise<WorkspaceConfig>`

打开现有工作区。

```typescript
const workspace = await workspaceManager.openWorkspace('./existing-workspace');
console.log(`工作区已打开: ${workspace.name}`);
```

##### `getWorkspaceProjects(): Project[]`

获取当前工作区中的所有项目。

```typescript
const projects = workspaceManager.getWorkspaceProjects();
console.log(`工作区包含 ${projects.length} 个项目`);
```

#### **文件操作**

##### `createFile(path: string, content: string): Promise<void>`

在工作区中创建新文件。

```typescript
await workspaceManager.createFile('./agents/GreetingAgent.ts', agentCode);
console.log('代理文件已创建');
```

##### `readFile(path: string): Promise<string>`

从工作区读取文件。

```typescript
const content = await workspaceManager.readFile('./config/app.json');
const config = JSON.parse(content);
```

##### `watchFiles(pattern: string, callback: FileWatchCallback): void`

监视文件更改并触发回调。

```typescript
workspaceManager.watchFiles('**/*.ts', (event, path) => {
  console.log(`文件 ${event}: ${path}`);
  // 触发重新编译或热重载
});
```

### **AgentBuilder**

带组件库集成的可视化拖拽代理构建器。

#### **构造函数**

```typescript
constructor(config: AgentBuilderConfig)
```

#### **代理创建**

##### `createAgent(definition: AgentDefinition): Promise<Agent>`

从可视化定义创建新代理。

```typescript
const agent = await agentBuilder.createAgent({
  name: 'CustomerServiceAgent',
  type: 'complex',
  capabilities: ['chat', 'ticket-management', 'escalation'],
  platforms: ['discord', 'slack'],
  components: [
    { type: 'nlp-processor', config: { model: 'gpt-4' } },
    { type: 'sentiment-analyzer', config: { threshold: 0.7 } },
    { type: 'ticket-router', config: { rules: 'priority-based' } }
  ]
});

console.log(`代理已创建: ${agent.id}`);
```

##### `generateAgentCode(agent: Agent): Promise<string>`

为可视化代理定义生成TypeScript代码。

```typescript
const code = await agentBuilder.generateAgentCode(myAgent);
console.log('生成的代理代码:');
console.log(code);
```

##### `validateAgent(agent: Agent): ValidationResult`

验证代理定义的完整性和正确性。

```typescript
const validation = agentBuilder.validateAgent(myAgent);
if (validation.isValid) {
  console.log('✅ 代理有效');
} else {
  console.log('❌ 验证错误:', validation.errors);
}
```

### **WorkflowDesigner**

用于创建多智能体工作流和编排的可视化工作流设计器。

#### **构造函数**

```typescript
constructor(config: WorkflowDesignerConfig)
```

#### **工作流创建**

##### `createWorkflow(definition: WorkflowDefinition): Promise<Workflow>`

从可视化定义创建新工作流。

```typescript
const workflow = await workflowDesigner.createWorkflow({
  name: 'CustomerSupportWorkflow',
  description: '自动化客户支持流程',
  steps: [
    {
      id: 'receive-ticket',
      type: 'trigger',
      agent: 'ticket-receiver',
      config: { source: ['email', 'chat'] }
    },
    {
      id: 'analyze-sentiment',
      type: 'process',
      agent: 'sentiment-analyzer',
      dependencies: ['receive-ticket']
    },
    {
      id: 'route-ticket',
      type: 'decision',
      agent: 'ticket-router',
      dependencies: ['analyze-sentiment'],
      conditions: [
        { if: 'sentiment.score < 0.3', then: 'escalate-to-human' },
        { else: 'auto-respond' }
      ]
    }
  ]
});

console.log(`工作流已创建: ${workflow.id}`);
```

##### `generateWorkflowCode(workflow: Workflow): Promise<string>`

生成可执行的工作流代码。

```typescript
const code = await workflowDesigner.generateWorkflowCode(myWorkflow);
console.log('生成的工作流代码:');
console.log(code);
```

##### `simulateWorkflow(workflow: Workflow, input: any): Promise<SimulationResult>`

使用测试数据模拟工作流执行。

```typescript
const result = await workflowDesigner.simulateWorkflow(myWorkflow, {
  ticket: {
    id: 'T-001',
    subject: '登录问题',
    content: '我无法登录我的账户',
    priority: 'medium'
  }
});

console.log(`模拟在 ${result.duration}ms 内完成`);
console.log(`执行步骤: ${result.stepsExecuted}`);
```

### **StudioServer**

提供Web界面和API端点的HTTP服务器。

#### **构造函数**

```typescript
constructor(config: StudioConfig)
```

#### **服务器操作**

##### `start(): Promise<void>`

启动Studio Web服务器。

```typescript
const server = new StudioServer(config);
await server.start();
console.log(`🌐 Studio服务器运行在 http://localhost:${config.server.port}`);
```

##### `stop(): Promise<void>`

停止Studio Web服务器。

```typescript
await server.stop();
console.log('🛑 Studio服务器已停止');
```

##### `addRoute(path: string, handler: RouteHandler): void`

向服务器添加自定义API路由。

```typescript
server.addRoute('/api/custom/agents', async (req, res) => {
  const agents = await getCustomAgents();
  res.json(agents);
});
```

## 🎯 **高级使用示例**

### **完整Studio设置**

```typescript
import { 
  createStudioApplication, 
  ProjectManager, 
  WorkspaceManager,
  AgentBuilder,
  WorkflowDesigner 
} from '@mplp/studio';

// 创建全面的Studio环境
const studio = createStudioApplication({
  version: '1.1.0-beta',
  environment: 'development',
  server: {
    port: 3000,
    host: '0.0.0.0',
    cors: {
      enabled: true,
      origins: ['*']
    }
  },
  workspace: {
    defaultPath: './studio-workspace',
    maxRecentFiles: 20,
    autoSave: true,
    autoSaveInterval: 15000
  },
  project: {
    defaultTemplate: 'advanced',
    maxProjects: 50,
    backupEnabled: true,
    backupInterval: 300000
  },
  logging: {
    level: 'info',
    file: './logs/studio.log',
    console: true
  }
});

// 初始化并启动Studio
await studio.initialize();
await studio.start();

// 设置事件处理器
studio.on('projectCreated', (project) => {
  console.log(`📁 新项目已创建: ${project.name}`);
});

studio.on('agentBuilt', (agent) => {
  console.log(`🤖 代理已构建: ${agent.name}`);
});

studio.on('workflowDesigned', (workflow) => {
  console.log(`🔄 工作流已设计: ${workflow.name}`);
});

console.log('🎨 MPLP Studio已准备好进行开发！');
```

### **企业团队协作设置**

```typescript
import { StudioApplication } from '@mplp/studio';

// 企业Studio配置
const enterpriseStudio = new StudioApplication({
  version: '1.1.0-beta',
  environment: 'production',
  server: {
    port: 443,
    host: 'studio.company.com',
    cors: {
      enabled: true,
      origins: ['https://company.com', 'https://dev.company.com']
    }
  },
  collaboration: {
    realTimeEditing: true,
    commentSystem: true,
    versionControl: {
      enabled: true,
      provider: 'git',
      repository: 'https://github.com/company/mplp-projects'
    },
    accessControl: {
      enabled: true,
      roles: ['admin', 'developer', 'viewer'],
      permissions: {
        admin: ['create', 'edit', 'delete', 'deploy'],
        developer: ['create', 'edit', 'deploy'],
        viewer: ['view']
      }
    }
  },
  security: {
    authentication: {
      enabled: true,
      provider: 'oauth2',
      config: {
        clientId: process.env.OAUTH_CLIENT_ID,
        clientSecret: process.env.OAUTH_CLIENT_SECRET
      }
    },
    encryption: {
      enabled: true,
      algorithm: 'AES-256-GCM'
    }
  }
});

await enterpriseStudio.initialize();
await enterpriseStudio.start();

console.log('🏢 企业MPLP Studio已准备好进行团队协作！');
```

### **自定义代理模板创建**

```typescript
import { ProjectManager, AgentBuilder } from '@mplp/studio';

// 创建自定义代理模板
const projectManager = new ProjectManager(config);
const agentBuilder = new AgentBuilder(config);

// 定义自定义模板
const customTemplate = {
  name: 'e-commerce-assistant',
  description: '电商客户助手代理模板',
  category: 'business',
  components: [
    {
      type: 'product-search',
      config: {
        searchEngine: 'elasticsearch',
        indexName: 'products',
        maxResults: 10
      }
    },
    {
      type: 'order-tracker',
      config: {
        apiEndpoint: '/api/orders',
        statusMapping: {
          'pending': '您的订单正在处理中',
          'shipped': '您的订单正在配送中',
          'delivered': '您的订单已送达'
        }
      }
    },
    {
      type: 'recommendation-engine',
      config: {
        algorithm: 'collaborative-filtering',
        minSimilarity: 0.7
      }
    }
  ],
  defaultCapabilities: [
    'product-search',
    'order-tracking',
    'recommendations',
    'customer-support'
  ],
  platforms: ['web-chat', 'whatsapp', 'messenger'],
  codeTemplate: `
    import { Agent } from '@mplp/agent-builder';
    
    export class ECommerceAssistant extends Agent {
      async handleProductSearch(query: string) {
        // 生成的产品搜索逻辑
      }
      
      async trackOrder(orderId: string) {
        // 生成的订单跟踪逻辑
      }
      
      async getRecommendations(userId: string) {
        // 生成的推荐逻辑
      }
    }
  `
};

// 注册模板
projectManager.registerTemplate(customTemplate);

// 从自定义模板创建项目
const project = await projectManager.createFromTemplate('e-commerce-assistant', {
  name: 'ShopBot',
  description: 'AI驱动的购物助手',
  customization: {
    brandName: 'MyStore',
    primaryColor: '#007bff',
    supportedLanguages: ['zh', 'en', 'es']
  }
});

console.log(`🛍️ 电商助手项目已创建: ${project.name}`);
```

## 🔗 **相关文档**

- [SDK Core API](../sdk-core/README.md) - 应用框架和生命周期管理
- [Agent Builder API](../agent-builder/README.md) - 编程方式构建智能代理
- [Orchestrator API](../orchestrator/README.md) - 多智能体工作流编排
- [CLI Tools](../cli/README.md) - 命令行开发实用程序

---

**包维护者**: MPLP Studio团队  
**最后审查**: 2025-09-20  
**测试覆盖率**: 100% (58/58测试通过)  
**状态**: ✅ 生产就绪
