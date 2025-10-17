# MPLP v1.1.0-beta 测试策略

## 🎯 **测试战略框架**

### **SCTM测试分析应用**
- **系统性测试**: 从单元到端到端的完整测试体系
- **关联性验证**: 确保各组件间的集成测试覆盖
- **时间维度**: 持续测试和回归测试策略
- **风险控制**: 基于风险的测试优先级和覆盖策略
- **批判性评估**: 测试有效性和质量保证机制

### **测试原则**
- **质量优先**: 测试质量比测试数量更重要
- **早期测试**: 在开发过程中尽早发现和修复问题
- **自动化优先**: 最大化自动化测试覆盖率
- **用户导向**: 测试以用户体验和需求为导向

## 🏗️ **测试架构设计**

### **测试金字塔**
```
                /\
               /  \
              / E2E \      <- 20% (端到端测试)
             /______\
            /        \
           /Integration\ <- 30% (集成测试)
          /____________\
         /              \
        /   Unit Tests   \ <- 50% (单元测试)
       /________________\
```

### **测试分层策略**
```markdown
🔬 单元测试 (50% - 快速反馈层):
- 目标: 验证单个函数/方法的正确性
- 范围: 所有公开API和核心逻辑
- 工具: Jest + TypeScript
- 执行时间: <10秒 (全部)
- 覆盖率要求: ≥90%

🔗 集成测试 (30% - 协作验证层):
- 目标: 验证模块间的协作和接口
- 范围: SDK模块间、适配器集成、数据库集成
- 工具: Jest + Supertest + Test Containers
- 执行时间: <2分钟 (全部)
- 覆盖率要求: ≥80%

🌐 端到端测试 (20% - 用户体验层):
- 目标: 验证完整的用户场景和工作流
- 范围: 关键用户路径、跨平台集成
- 工具: Puppeteer + Jest
- 执行时间: <10分钟 (全部)
- 覆盖率要求: 核心场景100%
```

## 🧪 **Phase 1: 核心SDK测试策略**

### **@mplp/sdk-core 测试规划**

#### **单元测试规划**
```typescript
// MPLPApplication类测试
describe('MPLPApplication', () => {
  describe('初始化测试', () => {
    it('应该成功初始化应用', async () => {
      const app = new MPLPApplication(validConfig);
      await expect(app.initialize()).resolves.toBeUndefined();
    });

    it('应该在无效配置时抛出错误', async () => {
      const app = new MPLPApplication(invalidConfig);
      await expect(app.initialize()).rejects.toThrow();
    });
  });

  describe('模块管理测试', () => {
    it('应该成功注册模块', async () => {
      const app = new MPLPApplication(validConfig);
      const mockModule = createMockModule();
      await expect(app.registerModule('test', mockModule)).resolves.toBeUndefined();
    });

    it('应该能够获取已注册的模块', () => {
      const app = new MPLPApplication(validConfig);
      const module = app.getModule('test');
      expect(module).toBeDefined();
    });
  });
});
```

#### **集成测试规划**
```typescript
// SDK核心集成测试
describe('SDK核心集成测试', () => {
  it('应该完整的应用生命周期', async () => {
    const app = new MPLPApplication(testConfig);
    
    // 初始化
    await app.initialize();
    
    // 注册模块
    await app.registerModule('context', new ContextModule());
    await app.registerModule('plan', new PlanModule());
    
    // 启动应用
    await app.start();
    
    // 验证健康状态
    const health = await app.getHealthStatus();
    expect(health.status).toBe('healthy');
    
    // 停止应用
    await app.stop();
  });
});
```

### **@mplp/agent-builder 测试规划**

#### **链式API测试**
```typescript
describe('AgentBuilder链式API', () => {
  it('应该支持完整的链式配置', () => {
    const agent = new AgentBuilder('TestAgent')
      .withCapability('test_capability')
      .withPlatform('test_platform', { apiKey: 'test' })
      .withBehavior({ onMessage: jest.fn() })
      .build();
    
    expect(agent.name).toBe('TestAgent');
    expect(agent.capabilities).toContain('test_capability');
    expect(agent.platforms).toHaveProperty('test_platform');
  });

  it('应该验证必需的配置项', () => {
    expect(() => {
      new AgentBuilder('TestAgent').build();
    }).toThrow('Missing required configuration');
  });
});
```

### **@mplp/orchestrator 测试规划**

#### **工作流执行测试**
```typescript
describe('工作流执行测试', () => {
  it('应该正确执行串行工作流', async () => {
    const orchestrator = new MultiAgentOrchestrator();
    const mockAgent = createMockAgent();
    orchestrator.registerAgent(mockAgent);

    const workflow = new WorkflowBuilder()
      .step('step1', async () => ({ result: 'step1' }))
      .step('step2', async (input) => ({ result: 'step2', input }))
      .build();

    const result = await orchestrator.executeWorkflow(workflow, {});
    expect(result.steps).toHaveLength(2);
    expect(result.steps[1].input.result).toBe('step1');
  });

  it('应该正确执行并行工作流', async () => {
    const orchestrator = new MultiAgentOrchestrator();
    const workflow = new WorkflowBuilder()
      .parallel([
        { agent: 'agent1', action: 'action1' },
        { agent: 'agent2', action: 'action2' }
      ])
      .build();

    const result = await orchestrator.executeWorkflow(workflow, {});
    expect(result.parallelResults).toHaveLength(2);
  });
});
```

## 🧪 **Phase 2: CLI工具测试策略**

### **CLI命令测试**
```typescript
describe('CLI命令测试', () => {
  describe('项目创建命令', () => {
    it('应该创建完整的项目结构', async () => {
      const tempDir = await createTempDir();
      await runCLI(['create', 'test-project', '--template', 'basic'], {
        cwd: tempDir
      });

      // 验证项目结构
      expect(fs.existsSync(path.join(tempDir, 'test-project', 'package.json'))).toBe(true);
      expect(fs.existsSync(path.join(tempDir, 'test-project', 'src', 'index.ts'))).toBe(true);
    });

    it('应该正确安装依赖', async () => {
      const tempDir = await createTempDir();
      await runCLI(['create', 'test-project'], { cwd: tempDir });
      
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(tempDir, 'test-project', 'package.json'), 'utf8')
      );
      expect(packageJson.dependencies).toHaveProperty('@mplp/sdk-core');
    });
  });

  describe('代码生成命令', () => {
    it('应该生成正确的Agent代码', async () => {
      const projectDir = await createTestProject();
      await runCLI(['generate', 'agent', 'TestAgent'], { cwd: projectDir });

      const agentFile = path.join(projectDir, 'src', 'agents', 'TestAgent.ts');
      expect(fs.existsSync(agentFile)).toBe(true);
      
      const content = fs.readFileSync(agentFile, 'utf8');
      expect(content).toContain('class TestAgent');
    });
  });
});
```

### **开发服务器测试**
```typescript
describe('开发服务器测试', () => {
  it('应该启动开发服务器', async () => {
    const projectDir = await createTestProject();
    const server = await startDevServer(projectDir);
    
    expect(server.listening).toBe(true);
    expect(server.address().port).toBeGreaterThan(0);
    
    await server.close();
  });

  it('应该支持热重载', async () => {
    const projectDir = await createTestProject();
    const server = await startDevServer(projectDir);
    
    // 修改文件
    const testFile = path.join(projectDir, 'src', 'index.ts');
    fs.writeFileSync(testFile, 'console.log("updated");');
    
    // 等待重载
    await waitForReload(server);
    
    // 验证重载成功
    expect(server.reloadCount).toBeGreaterThan(0);
    
    await server.close();
  });
});
```

## 🧪 **Phase 3: 平台适配器测试策略**

### **适配器通用测试框架**
```typescript
// 适配器测试基类
abstract class AdapterTestSuite<T extends PlatformAdapter> {
  protected adapter: T;
  protected mockAPI: jest.MockedObject<any>;

  abstract createAdapter(): T;
  abstract createMockAPI(): jest.MockedObject<any>;

  beforeEach() {
    this.mockAPI = this.createMockAPI();
    this.adapter = this.createAdapter();
  }

  // 通用测试用例
  testBasicFunctionality() {
    it('应该成功初始化', async () => {
      await expect(this.adapter.initialize()).resolves.toBeUndefined();
    });

    it('应该正确处理API错误', async () => {
      this.mockAPI.post.mockRejectedValue(new Error('API Error'));
      await expect(this.adapter.publishContent('test')).rejects.toThrow();
    });

    it('应该正确处理速率限制', async () => {
      this.mockAPI.post.mockRejectedValue(new RateLimitError());
      await expect(this.adapter.publishContent('test')).resolves.toBeUndefined();
    });
  }
}
```

### **Twitter适配器测试**
```typescript
class TwitterAdapterTest extends AdapterTestSuite<TwitterAdapter> {
  createAdapter() {
    return new TwitterAdapter({
      apiKey: 'test_key',
      apiSecret: 'test_secret',
      accessToken: 'test_token',
      accessTokenSecret: 'test_token_secret'
    });
  }

  createMockAPI() {
    return {
      post: jest.fn(),
      get: jest.fn(),
      delete: jest.fn()
    };
  }

  // Twitter特定测试
  testTwitterSpecificFeatures() {
    it('应该正确发布推文', async () => {
      this.mockAPI.post.mockResolvedValue({ id: '123', text: 'test tweet' });
      
      const result = await this.adapter.publishContent('test tweet');
      expect(result.id).toBe('123');
      expect(this.mockAPI.post).toHaveBeenCalledWith('statuses/update', {
        status: 'test tweet'
      });
    });

    it('应该正确处理推文长度限制', async () => {
      const longTweet = 'a'.repeat(300);
      const result = await this.adapter.publishContent(longTweet);
      
      expect(result.truncated).toBe(true);
      expect(result.content.length).toBeLessThanOrEqual(280);
    });
  }
}
```

## 🧪 **Phase 4: 示例应用测试策略**

### **CoregentisBot端到端测试**
```typescript
describe('CoregentisBot端到端测试', () => {
  let bot: CoregentisBot;
  let mockAdapters: MockAdapters;

  beforeEach(async () => {
    mockAdapters = createMockAdapters();
    bot = new CoregentisBot({
      adapters: mockAdapters,
      config: testConfig
    });
    await bot.initialize();
  });

  it('应该执行完整的营销工作流', async () => {
    const campaign = {
      content: 'Test marketing content',
      platforms: ['twitter', 'linkedin', 'github'],
      schedule: new Date()
    };

    const result = await bot.executeCampaign(campaign);

    expect(result.success).toBe(true);
    expect(result.platforms).toHaveLength(3);
    expect(mockAdapters.twitter.publishContent).toHaveBeenCalled();
    expect(mockAdapters.linkedin.publishContent).toHaveBeenCalled();
    expect(mockAdapters.github.updateRepository).toHaveBeenCalled();
  });

  it('应该正确处理部分失败', async () => {
    mockAdapters.twitter.publishContent.mockRejectedValue(new Error('Twitter API Error'));

    const campaign = {
      content: 'Test content',
      platforms: ['twitter', 'linkedin']
    };

    const result = await bot.executeCampaign(campaign);

    expect(result.success).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].platform).toBe('twitter');
    expect(result.successfulPlatforms).toContain('linkedin');
  });
});
```

### **用户验收测试**
```typescript
describe('用户验收测试', () => {
  it('新用户应该能在30分钟内完成第一个应用', async () => {
    // 模拟新用户流程
    const userJourney = new UserJourney();
    
    // 1. 安装CLI
    await userJourney.installCLI();
    
    // 2. 创建项目
    await userJourney.createProject('my-first-bot');
    
    // 3. 配置适配器
    await userJourney.configureAdapter('twitter', {
      apiKey: 'test_key'
    });
    
    // 4. 运行应用
    const result = await userJourney.runApplication();
    
    expect(result.success).toBe(true);
    expect(userJourney.totalTime).toBeLessThan(30 * 60 * 1000); // 30分钟
  });
});
```

## 🧪 **Phase 5: 高级工具测试策略**

### **MPLP Studio测试**
```typescript
describe('MPLP Studio测试', () => {
  let studio: MPLPStudio;
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    browser = await puppeteer.launch();
    page = await browser.newPage();
    studio = new MPLPStudio();
    await studio.start();
  });

  afterAll(async () => {
    await studio.stop();
    await browser.close();
  });

  it('应该加载可视化设计器', async () => {
    await page.goto('http://localhost:3000');
    await page.waitForSelector('.agent-designer');
    
    const designer = await page.$('.agent-designer');
    expect(designer).toBeTruthy();
  });

  it('应该支持拖拽创建Agent', async () => {
    await page.goto('http://localhost:3000');
    
    // 拖拽Agent组件
    await page.dragAndDrop('.component-agent', '.design-canvas');
    
    // 验证Agent已创建
    const agents = await page.$$('.design-canvas .agent');
    expect(agents).toHaveLength(1);
  });

  it('应该生成正确的代码', async () => {
    await page.goto('http://localhost:3000');
    
    // 创建简单的工作流
    await createSimpleWorkflow(page);
    
    // 生成代码
    await page.click('.generate-code-btn');
    
    // 验证生成的代码
    const code = await page.$eval('.generated-code', el => el.textContent);
    expect(code).toContain('new AgentBuilder');
    expect(code).toContain('new WorkflowBuilder');
  });
});
```

### **DevTools扩展测试**
```typescript
describe('DevTools扩展测试', () => {
  let extension: DevToolsExtension;
  let mockChrome: MockChrome;

  beforeEach(() => {
    mockChrome = createMockChrome();
    extension = new DevToolsExtension(mockChrome);
  });

  it('应该正确注入调试脚本', async () => {
    await extension.injectDebugScript();
    
    expect(mockChrome.tabs.executeScript).toHaveBeenCalledWith({
      file: 'debug-script.js'
    });
  });

  it('应该监控Agent状态', async () => {
    const mockAgent = createMockAgent();
    await extension.monitorAgent(mockAgent);
    
    // 模拟状态变化
    mockAgent.emit('statusChange', { status: 'running' });
    
    expect(extension.agentStatus.get(mockAgent.id)).toBe('running');
  });
});
```

## 📊 **测试质量保证**

### **测试覆盖率要求**
```markdown
📊 覆盖率目标:
- 单元测试覆盖率: ≥90%
- 集成测试覆盖率: ≥80%
- 端到端测试覆盖率: 核心场景100%
- 分支覆盖率: ≥85%
- 函数覆盖率: ≥95%

📋 覆盖率监控:
- 每次提交自动检查覆盖率
- 覆盖率下降时阻止合并
- 定期生成覆盖率报告
- 识别未覆盖的关键代码路径
```

### **测试质量指标**
```markdown
🎯 质量指标:
- 测试通过率: 100%
- 测试稳定性: 连续100次运行无随机失败
- 测试执行时间: 单元测试<10秒，集成测试<2分钟，E2E测试<10分钟
- 测试维护成本: 代码变更时测试修改比例<20%

📈 持续改进:
- 定期审查测试有效性
- 识别和删除冗余测试
- 优化测试执行性能
- 改进测试可读性和维护性
```

### **测试自动化流程**
```yaml
# GitHub Actions测试流程
name: Test Suite
on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run unit tests
        run: npm run test:unit
      - name: Upload coverage
        uses: codecov/codecov-action@v1

  integration-tests:
    runs-on: ubuntu-latest
    needs: unit-tests
    steps:
      - uses: actions/checkout@v2
      - name: Setup test environment
        run: docker-compose up -d
      - name: Run integration tests
        run: npm run test:integration

  e2e-tests:
    runs-on: ubuntu-latest
    needs: integration-tests
    steps:
      - uses: actions/checkout@v2
      - name: Run E2E tests
        run: npm run test:e2e
```

---

**文档版本**: v1.0  
**创建日期**: 2025-01-XX  
**最后更新**: 2025-01-XX  
**维护者**: 测试团队
