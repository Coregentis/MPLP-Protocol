/**
 * 简单的组件测试 - 验证新增组件的基本功能
 */

const { 
  AgentBuilder,
  WorkflowDesigner,
  ComponentLibrary,
  MPLPEventManager
} = require('./dist/index');

async function simpleTest() {
  console.log('🧪 开始简单组件测试...\n');

  try {
    // 创建事件管理器
    const eventManager = new MPLPEventManager();
    
    // 创建基本配置
    const config = {
      version: '1.1.0-beta',
      environment: 'test',
      server: {
        port: 3000,
        host: 'localhost',
        cors: { enabled: false, origins: [] }
      },
      workspace: {
        defaultPath: './workspace',
        maxRecentFiles: 10,
        autoSave: true,
        autoSaveInterval: 30000
      },
      project: {
        defaultTemplate: 'basic',
        maxProjects: 50,
        backupEnabled: true,
        backupInterval: 300000
      },
      logging: {
        level: 'info',
        file: 'studio.log',
        console: true
      },
      performance: {
        enableMetrics: true,
        metricsInterval: 5000,
        maxMemoryUsage: 512
      }
    };

    // 1. 测试AgentBuilder
    console.log('1. 测试AgentBuilder...');
    const agentBuilder = new AgentBuilder(config, eventManager);
    console.log('   状态:', agentBuilder.getStatus());
    
    await agentBuilder.initialize();
    console.log('   初始化后状态:', agentBuilder.getStatus());
    
    const agent = await agentBuilder.createAgent('TestAgent', {
      type: 'simple',
      capabilities: ['text-processing']
    });
    console.log('   创建的Agent:', { id: agent.id, name: agent.name, type: agent.type });

    // 2. 测试WorkflowDesigner
    console.log('\n2. 测试WorkflowDesigner...');
    const workflowDesigner = new WorkflowDesigner(config, eventManager);
    console.log('   状态:', workflowDesigner.getStatus());
    
    await workflowDesigner.initialize();
    console.log('   初始化后状态:', workflowDesigner.getStatus());
    
    const workflow = await workflowDesigner.createWorkflow('TestWorkflow', {
      description: 'A test workflow'
    });
    console.log('   创建的Workflow:', { id: workflow.id, name: workflow.name, status: workflow.status });

    // 3. 测试ComponentLibrary
    console.log('\n3. 测试ComponentLibrary...');
    const componentLibrary = new ComponentLibrary(config, eventManager);
    console.log('   状态:', componentLibrary.getStatus());
    
    await componentLibrary.initialize();
    console.log('   初始化后状态:', componentLibrary.getStatus());
    
    const categories = componentLibrary.getAllCategories();
    console.log('   加载的类别数量:', categories.length);
    console.log('   类别名称:', categories.map(c => c.name));

    // 4. 清理
    console.log('\n4. 清理资源...');
    await agentBuilder.shutdown();
    await workflowDesigner.shutdown();
    await componentLibrary.shutdown();
    
    console.log('✅ 所有组件测试通过！');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    console.error('错误详情:', error.stack);
    process.exit(1);
  }
}

// 运行测试
simpleTest().then(() => {
  console.log('\n🎉 简单组件测试完成！');
  process.exit(0);
}).catch(error => {
  console.error('💥 测试执行失败:', error);
  process.exit(1);
});
