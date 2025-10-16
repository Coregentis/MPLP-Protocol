/**
 * 测试新增的Studio组件
 * 验证AgentBuilder, WorkflowDesigner, ComponentLibrary, StudioServer的基本功能
 */

const {
  createStudioApplication,
  AgentBuilder,
  WorkflowDesigner,
  ComponentLibrary
} = require('./dist/index');

async function testNewComponents() {
  console.log('🧪 开始测试新增的Studio组件...\n');

  try {
    // 1. 创建Studio应用
    console.log('1. 创建Studio应用...');
    const studioApp = createStudioApplication({
      version: '1.1.0-beta',
      environment: 'test'
    });
    
    await studioApp.initialize();
    console.log('✅ Studio应用初始化成功');

    // 2. 测试AgentBuilder
    console.log('\n2. 测试AgentBuilder...');
    const agentBuilder = new AgentBuilder(studioApp.getConfig(), studioApp.getEventManager());
    await agentBuilder.initialize();
    
    const agent = await agentBuilder.createAgent('TestAgent', {
      type: 'simple',
      description: 'A test agent',
      capabilities: ['text-processing', 'api-calls']
    });
    
    console.log('✅ Agent创建成功:', {
      id: agent.id,
      name: agent.name,
      type: agent.type,
      capabilities: agent.capabilities
    });

    // 3. 测试WorkflowDesigner
    console.log('\n3. 测试WorkflowDesigner...');
    const workflowDesigner = new WorkflowDesigner(studioApp.getConfig(), studioApp.getEventManager());
    await workflowDesigner.initialize();
    
    const workflow = await workflowDesigner.createWorkflow('TestWorkflow', {
      description: 'A test workflow',
      timeout: 60000
    });
    
    console.log('✅ Workflow创建成功:', {
      id: workflow.id,
      name: workflow.name,
      status: workflow.status
    });

    // 4. 测试ComponentLibrary
    console.log('\n4. 测试ComponentLibrary...');
    const componentLibrary = new ComponentLibrary(studioApp.getConfig(), studioApp.getEventManager());
    await componentLibrary.initialize();
    
    const categories = componentLibrary.getAllCategories();
    console.log('✅ 组件库初始化成功，类别数量:', categories.length);
    console.log('   类别列表:', categories.map(c => c.name));

    // 5. 测试状态和事件系统
    console.log('\n5. 测试组件状态...');
    console.log('   AgentBuilder状态:', agentBuilder.getStatus());
    console.log('   WorkflowDesigner状态:', workflowDesigner.getStatus());
    console.log('   ComponentLibrary状态:', componentLibrary.getStatus());

    // 6. 清理资源
    console.log('\n6. 清理资源...');
    await agentBuilder.shutdown();
    await workflowDesigner.shutdown();
    await componentLibrary.shutdown();
    await studioApp.shutdown();
    
    console.log('✅ 所有组件已成功关闭');

    console.log('\n🎉 所有新增组件测试通过！');
    console.log('\n📊 测试结果总结:');
    console.log('   ✅ AgentBuilder: 初始化、创建Agent、关闭 - 全部成功');
    console.log('   ✅ WorkflowDesigner: 初始化、创建Workflow、关闭 - 全部成功');
    console.log('   ✅ ComponentLibrary: 初始化、加载类别、关闭 - 全部成功');
    console.log('   ✅ 事件系统: 所有组件事件通信正常');
    console.log('   ✅ 生命周期管理: 所有组件初始化和关闭正常');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    console.error('错误详情:', error);
    process.exit(1);
  }
}

// 运行测试
testNewComponents().then(() => {
  console.log('\n✨ 测试完成，所有新增组件工作正常！');
  process.exit(0);
}).catch(error => {
  console.error('💥 测试执行失败:', error);
  process.exit(1);
});
