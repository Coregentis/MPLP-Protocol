/**
 * 简单测试 - 逐步调试
 */

console.log('开始简单测试...');

try {
  console.log('1. 导入模块...');
  const { createStudioApplication } = require('./dist/index.js');
  console.log('✅ 模块导入成功');

  console.log('2. 创建应用...');
  const studio = createStudioApplication({
    environment: 'test',
    workspace: {
      defaultPath: require('path').join(__dirname, 'test-workspace')
    }
  });
  console.log('✅ 应用创建成功');

  console.log('3. 检查状态...');
  console.log('状态:', studio.getStatus());
  console.log('✅ 状态检查成功');

  console.log('4. 测试事件系统...');
  let eventReceived = false;
  studio.on('test', () => {
    eventReceived = true;
    console.log('✅ 事件接收成功');
  });
  
  studio.emit('test');
  if (eventReceived) {
    console.log('✅ 事件系统工作正常');
  } else {
    console.log('❌ 事件系统异常');
  }

  console.log('🎉 简单测试完成！');

} catch (error) {
  console.error('❌ 测试失败:', error);
  console.error('错误堆栈:', error.stack);
}
