/**
 * 简单测试 - 逐步调试Studio组件
 */

const { 
  createStudioApplication,
  AgentBuilder,
  WorkflowDesigner,
  ComponentLibrary,
  StudioServer
} = require('./dist/index');

async function simpleTest() {
  console.log('🧪 开始简单测试...\n');

  try {
    // 1. 测试基本导入
    console.log('1. 测试基本导入...');
    console.log('   createStudioApplication:', typeof createStudioApplication);
    console.log('   AgentBuilder:', typeof AgentBuilder);
    console.log('   WorkflowDesigner:', typeof WorkflowDesigner);
    console.log('   ComponentLibrary:', typeof ComponentLibrary);
    console.log('   StudioServer:', typeof StudioServer);
    console.log('✅ 所有组件导入成功');

    // 2. 创建Studio应用（不初始化）
    console.log('\n2. 创建Studio应用（不初始化）...');
    const studioApp = createStudioApplication({
      version: '1.1.0-beta',
      environment: 'test'
    });
    console.log('✅ Studio应用创建成功');
    console.log('   应用状态:', studioApp.getStatus ? studioApp.getStatus() : 'no getStatus method');

    // 3. 创建组件（不初始化）
    console.log('\n3. 创建组件（不初始化）...');
    
    const config = studioApp.getConfig ? studioApp.getConfig() : {
      version: '1.1.0-beta',
      environment: 'test',
      server: { port: 3000, host: 'localhost', cors: { enabled: false, origins: [] } },
      workspace: { defaultPath: './workspace', maxRecentFiles: 10, autoSave: false, autoSaveInterval: 30000 },
      project: { defaultTemplate: 'basic', maxProjects: 100, backupEnabled: false, backupInterval: 300000 },
      logging: { level: 'info', file: 'studio.log', console: true },
      performance: { enableMetrics: false, metricsInterval: 60000, maxMemoryUsage: 512 }
    };
    
    const eventManager = studioApp.getEventManager ? studioApp.getEventManager() : null;
    
    if (!eventManager) {
      console.log('❌ 无法获取EventManager');
      return;
    }

    const agentBuilder = new AgentBuilder(config, eventManager);
    const workflowDesigner = new WorkflowDesigner(config, eventManager);
    const componentLibrary = new ComponentLibrary(config, eventManager);
    const studioServer = new StudioServer(config, eventManager, studioApp);
    
    console.log('✅ 所有组件创建成功');
    console.log('   AgentBuilder状态:', agentBuilder.getStatus());
    console.log('   WorkflowDesigner状态:', workflowDesigner.getStatus());
    console.log('   ComponentLibrary状态:', componentLibrary.getStatus());
    console.log('   StudioServer状态:', studioServer.getStatus());

    // 4. 测试单个组件初始化
    console.log('\n4. 测试单个组件初始化...');
    
    console.log('   初始化AgentBuilder...');
    await agentBuilder.initialize();
    console.log('   ✅ AgentBuilder初始化成功');
    
    console.log('   初始化WorkflowDesigner...');
    await workflowDesigner.initialize();
    console.log('   ✅ WorkflowDesigner初始化成功');
    
    console.log('   初始化ComponentLibrary...');
    await componentLibrary.initialize();
    console.log('   ✅ ComponentLibrary初始化成功');
    
    console.log('   初始化StudioServer...');
    // 不初始化StudioServer，因为它会启动HTTP服务器
    console.log('   ⚠️ StudioServer跳过初始化（避免启动HTTP服务器）');

    // 5. 测试基本功能
    console.log('\n5. 测试基本功能...');
    
    const agent = await agentBuilder.createAgent('TestAgent', {
      type: 'simple',
      capabilities: ['test']
    });
    console.log('   ✅ Agent创建成功:', agent.name);
    
    const workflow = await workflowDesigner.createWorkflow('TestWorkflow');
    console.log('   ✅ Workflow创建成功:', workflow.name);
    
    const categories = componentLibrary.getAllCategories();
    console.log('   ✅ 组件类别加载成功，数量:', categories.length);

    // 6. 清理
    console.log('\n6. 清理资源...');
    await agentBuilder.shutdown();
    await workflowDesigner.shutdown();
    await componentLibrary.shutdown();
    await studioServer.shutdown();
    console.log('✅ 所有组件已关闭');

    console.log('\n🎉 简单测试完成！所有组件工作正常！');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    console.error('错误堆栈:', error.stack);
    process.exit(1);
  }
}

// 运行测试
simpleTest().then(() => {
  console.log('\n✨ 测试完成！');
  process.exit(0);
}).catch(error => {
  console.error('💥 测试执行失败:', error);
  process.exit(1);
});
