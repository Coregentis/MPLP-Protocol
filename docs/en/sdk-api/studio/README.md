# @mplp/studio API Reference

> **🌐 Language Navigation**: [English](README.md) | [中文](../../../zh-CN/sdk-api/studio/README.md)


> **Package**: @mplp/studio  
> **Version**: v1.1.0  
> **Last Updated**: 2025-09-20  
> **Status**: ✅ Production Ready  

## 📚 **Package Overview**

The `@mplp/studio` package provides a comprehensive visual development environment for MPLP applications. It features a drag-and-drop interface for building intelligent agents and workflows, real-time collaboration tools, and integrated development capabilities with enterprise-grade features.

### **🎯 Key Features**

- **🎨 Visual Agent Builder**: Drag-and-drop interface for creating intelligent agents
- **🔄 Workflow Designer**: Visual workflow design with real-time preview
- **📁 Project Management**: Complete project lifecycle management with templates
- **🏢 Workspace Management**: Multi-project workspace with file operations
- **👥 Team Collaboration**: Real-time editing, comments, version control, access control
- **⚡ Code Generation**: Automatic TypeScript/JavaScript code generation
- **🐛 Debugging Tools**: Integrated debugging and performance monitoring
- **🌐 Web Interface**: Modern web-based IDE with responsive design

### **📦 Installation**

```bash
# Local installation
npm install @mplp/studio

# Global installation for CLI
npm install -g @mplp/studio

# Verify installation
mplp-studio --version
```

### **🏗️ Architecture**

```
┌─────────────────────────────────────────┐
│            MPLP Studio                  │
│      (Visual Development IDE)          │
├─────────────────────────────────────────┤
│  StudioApplication | ProjectManager    │
│  WorkspaceManager | StudioServer       │
├─────────────────────────────────────────┤
│         Visual Builders                 │
│  AgentBuilder | WorkflowDesigner       │
│  ComponentLibrary | PropertyEditor     │
├─────────────────────────────────────────┤
│         UI Components                   │
│  Canvas | Toolbar | Sidebar | Panel    │
│  ThemeManager | ComponentSystem        │
└─────────────────────────────────────────┘
```

## 🚀 **Quick Start**

### **Launch Studio**

```bash
# Start Studio server
mplp-studio start

# Or run directly
npx @mplp/studio

# Access at http://localhost:3000
```

### **Programmatic Usage**

```typescript
import { createStudioApplication, StudioConfig } from '@mplp/studio';

// Create Studio application
const config: StudioConfig = {
  version: '1.1.0',
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

console.log('🎨 MPLP Studio started at http://localhost:3000');
```

## 📋 **Core Classes**

### **StudioApplication**

Main application class that manages the entire Studio environment.

#### **Constructor**

```typescript
constructor(config: StudioConfig)
```

#### **Core Methods**

##### `initialize(): Promise<void>`

Initializes the Studio application and all subsystems.

```typescript
const studio = new StudioApplication(config);
await studio.initialize();
console.log('🎨 Studio initialized');
```

##### `start(): Promise<void>`

Starts the Studio server and web interface.

```typescript
await studio.start();
console.log('🚀 Studio server started');
```

##### `shutdown(): Promise<void>`

Gracefully shuts down the Studio application.

```typescript
await studio.shutdown();
console.log('🛑 Studio shut down');
```

##### `getStatus(): StudioState`

Gets the current Studio application status.

```typescript
const status = studio.getStatus();
console.log(`Studio running: ${status.isRunning}`);
console.log(`Current project: ${status.currentProject?.name}`);
```

#### **Events**

```typescript
studio.on('initialized', () => {
  console.log('Studio initialized');
});

studio.on('started', () => {
  console.log('Studio server started');
});

studio.on('projectOpened', (project) => {
  console.log(`Project opened: ${project.name}`);
});

studio.on('error', (error) => {
  console.error('Studio error:', error);
});
```

### **ProjectManager**

Manages project creation, loading, saving, and lifecycle operations.

#### **Constructor**

```typescript
constructor(config: StudioConfig)
```

#### **Project Operations**

##### `createProject(options: CreateProjectOptions): Promise<Project>`

Creates a new MPLP project with specified template and configuration.

```typescript
const project = await projectManager.createProject({
  name: 'MyAgentSystem',
  description: 'Multi-agent customer service system',
  template: 'enterprise',
  path: './projects/my-agent-system',
  author: 'John Doe',
  license: 'MIT'
});

console.log(`Project created: ${project.id}`);
```

##### `loadProject(projectPath: string): Promise<Project>`

Loads an existing project from the specified path.

```typescript
const project = await projectManager.loadProject('./projects/existing-project');
console.log(`Loaded project: ${project.name}`);
```

##### `saveProject(project: Project): Promise<void>`

Saves the current project state to disk.

```typescript
await projectManager.saveProject(currentProject);
console.log('Project saved successfully');
```

##### `getRecentProjects(): Project[]`

Gets a list of recently opened projects.

```typescript
const recentProjects = projectManager.getRecentProjects();
console.log(`Recent projects: ${recentProjects.length}`);
```

#### **Template Management**

##### `getAvailableTemplates(): ProjectTemplate[]`

Gets all available project templates.

```typescript
const templates = projectManager.getAvailableTemplates();
templates.forEach(template => {
  console.log(`Template: ${template.name} - ${template.description}`);
});
```

##### `createFromTemplate(templateName: string, projectOptions: ProjectOptions): Promise<Project>`

Creates a new project from a specific template.

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

Manages workspace configuration, file operations, and multi-project environments.

#### **Constructor**

```typescript
constructor(config: StudioConfig)
```

#### **Workspace Operations**

##### `initializeWorkspace(path: string): Promise<WorkspaceConfig>`

Initializes a new workspace at the specified path.

```typescript
const workspace = await workspaceManager.initializeWorkspace('./my-workspace');
console.log(`Workspace initialized: ${workspace.name}`);
```

##### `openWorkspace(path: string): Promise<WorkspaceConfig>`

Opens an existing workspace.

```typescript
const workspace = await workspaceManager.openWorkspace('./existing-workspace');
console.log(`Workspace opened: ${workspace.name}`);
```

##### `getWorkspaceProjects(): Project[]`

Gets all projects in the current workspace.

```typescript
const projects = workspaceManager.getWorkspaceProjects();
console.log(`Workspace contains ${projects.length} projects`);
```

#### **File Operations**

##### `createFile(path: string, content: string): Promise<void>`

Creates a new file in the workspace.

```typescript
await workspaceManager.createFile('./agents/GreetingAgent.ts', agentCode);
console.log('Agent file created');
```

##### `readFile(path: string): Promise<string>`

Reads a file from the workspace.

```typescript
const content = await workspaceManager.readFile('./config/app.json');
const config = JSON.parse(content);
```

##### `watchFiles(pattern: string, callback: FileWatchCallback): void`

Watches files for changes and triggers callbacks.

```typescript
workspaceManager.watchFiles('**/*.ts', (event, path) => {
  console.log(`File ${event}: ${path}`);
  // Trigger recompilation or hot reload
});
```

### **AgentBuilder**

Visual drag-and-drop agent builder with component library integration.

#### **Constructor**

```typescript
constructor(config: AgentBuilderConfig)
```

#### **Agent Creation**

##### `createAgent(definition: AgentDefinition): Promise<Agent>`

Creates a new agent from a visual definition.

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

console.log(`Agent created: ${agent.id}`);
```

##### `generateAgentCode(agent: Agent): Promise<string>`

Generates TypeScript code for the visual agent definition.

```typescript
const code = await agentBuilder.generateAgentCode(myAgent);
console.log('Generated agent code:');
console.log(code);
```

##### `validateAgent(agent: Agent): ValidationResult`

Validates an agent definition for completeness and correctness.

```typescript
const validation = agentBuilder.validateAgent(myAgent);
if (validation.isValid) {
  console.log('✅ Agent is valid');
} else {
  console.log('❌ Validation errors:', validation.errors);
}
```

### **WorkflowDesigner**

Visual workflow designer for creating multi-agent workflows and orchestration.

#### **Constructor**

```typescript
constructor(config: WorkflowDesignerConfig)
```

#### **Workflow Creation**

##### `createWorkflow(definition: WorkflowDefinition): Promise<Workflow>`

Creates a new workflow from a visual definition.

```typescript
const workflow = await workflowDesigner.createWorkflow({
  name: 'CustomerSupportWorkflow',
  description: 'Automated customer support process',
  steps: [
    {
      id: 'receive-ticket',
      type: 'trigger',
      agent: 'ticket-receiver',
      config: { source: 'email', 'chat' }
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

console.log(`Workflow created: ${workflow.id}`);
```

##### `generateWorkflowCode(workflow: Workflow): Promise<string>`

Generates executable workflow code.

```typescript
const code = await workflowDesigner.generateWorkflowCode(myWorkflow);
console.log('Generated workflow code:');
console.log(code);
```

##### `simulateWorkflow(workflow: Workflow, input: any): Promise<SimulationResult>`

Simulates workflow execution with test data.

```typescript
const result = await workflowDesigner.simulateWorkflow(myWorkflow, {
  ticket: {
    id: 'T-001',
    subject: 'Login issue',
    content: 'I cannot log into my account',
    priority: 'medium'
  }
});

console.log(`Simulation completed in ${result.duration}ms`);
console.log(`Steps executed: ${result.stepsExecuted}`);
```

### **StudioServer**

HTTP server that provides the web interface and API endpoints.

#### **Constructor**

```typescript
constructor(config: StudioConfig)
```

#### **Server Operations**

##### `start(): Promise<void>`

Starts the Studio web server.

```typescript
const server = new StudioServer(config);
await server.start();
console.log(`🌐 Studio server running on http://localhost:${config.server.port}`);
```

##### `stop(): Promise<void>`

Stops the Studio web server.

```typescript
await server.stop();
console.log('🛑 Studio server stopped');
```

##### `addRoute(path: string, handler: RouteHandler): void`

Adds custom API routes to the server.

```typescript
server.addRoute('/api/custom/agents', async (req, res) => {
  const agents = await getCustomAgents();
  res.json(agents);
});
```

## 🎯 **Advanced Usage Examples**

### **Complete Studio Setup**

```typescript
import { 
  createStudioApplication, 
  ProjectManager, 
  WorkspaceManager,
  AgentBuilder,
  WorkflowDesigner 
} from '@mplp/studio';

// Create comprehensive Studio environment
const studio = createStudioApplication({
  version: '1.1.0',
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

// Initialize and start Studio
await studio.initialize();
await studio.start();

// Set up event handlers
studio.on('projectCreated', (project) => {
  console.log(`📁 New project created: ${project.name}`);
});

studio.on('agentBuilt', (agent) => {
  console.log(`🤖 Agent built: ${agent.name}`);
});

studio.on('workflowDesigned', (workflow) => {
  console.log(`🔄 Workflow designed: ${workflow.name}`);
});

console.log('🎨 MPLP Studio is ready for development!');
```

### **Enterprise Team Collaboration Setup**

```typescript
import { StudioApplication } from '@mplp/studio';

// Enterprise Studio configuration
const enterpriseStudio = new StudioApplication({
  version: '1.1.0',
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

console.log('🏢 Enterprise MPLP Studio is ready for team collaboration!');
```

### **Custom Agent Template Creation**

```typescript
import { ProjectManager, AgentBuilder } from '@mplp/studio';

// Create custom agent template
const projectManager = new ProjectManager(config);
const agentBuilder = new AgentBuilder(config);

// Define custom template
const customTemplate = {
  name: 'e-commerce-assistant',
  description: 'E-commerce customer assistant agent template',
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
          'pending': 'Your order is being processed',
          'shipped': 'Your order is on the way',
          'delivered': 'Your order has been delivered'
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
        // Generated product search logic
      }
      
      async trackOrder(orderId: string) {
        // Generated order tracking logic
      }
      
      async getRecommendations(userId: string) {
        // Generated recommendation logic
      }
    }
  `
};

// Register template
projectManager.registerTemplate(customTemplate);

// Create project from custom template
const project = await projectManager.createFromTemplate('e-commerce-assistant', {
  name: 'ShopBot',
  description: 'AI-powered shopping assistant',
  customization: {
    brandName: 'MyStore',
    primaryColor: '#007bff',
    supportedLanguages: ['en', 'es', 'fr']
  }
});

console.log(`🛍️ E-commerce assistant project created: ${project.name}`);
```

## 🔗 **Related Documentation**

- [SDK Core API](../sdk-core/README.md) - Application framework and lifecycle management
- [Agent Builder API](../agent-builder/README.md) - Building intelligent agents programmatically
- [Orchestrator API](../orchestrator/README.md) - Multi-agent workflow orchestration
- [CLI Tools](../cli/README.md) - Command-line development utilities

---

**Package Maintainer**: MPLP Studio Team  
**Last Review**: 2025-09-20  
**Test Coverage**: 100% (58/58 tests passing)  
**Status**: ✅ Production Ready
