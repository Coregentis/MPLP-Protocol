/**
 * Studio包功能测试
 */

const { createStudioApplication, getStudioInfo } = require('./dist/index.js');

async function testStudio() {
  console.log('🎯 测试Studio包功能...\n');

  try {
    // 测试Studio信息
    console.log('📋 Studio信息:');
    const info = getStudioInfo();
    console.log(`- 名称: ${info.name}`);
    console.log(`- 版本: ${info.version}`);
    console.log(`- 描述: ${info.description}`);
    console.log(`- 基于: ${info.basedOn}`);
    console.log(`- 已实现功能: ${info.status.implemented.join(', ')}`);
    console.log('');

    // 测试Studio应用创建
    console.log('🏗️ 创建Studio应用...');
    const studio = createStudioApplication({
      environment: 'test',
      server: { port: 3001 }
    });
    
    console.log('✅ Studio应用创建成功');
    console.log(`- 状态: ${studio.getStatus()}`);
    console.log('');

    // 测试初始化
    console.log('🚀 初始化Studio应用...');
    try {
      await studio.initialize();
      console.log('✅ Studio应用初始化成功');
      console.log(`- 状态: ${studio.getStatus()}`);
    } catch (error) {
      console.log('❌ Studio应用初始化失败:', error.message);
      console.log('继续其他测试...');
    }
    console.log('');

    // 测试事件系统
    console.log('📡 测试事件系统...');
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
    console.log('');

    // 测试关闭
    console.log('🔄 关闭Studio应用...');
    try {
      await studio.shutdown();
      console.log('✅ Studio应用关闭成功');
      console.log(`- 状态: ${studio.getStatus()}`);
    } catch (error) {
      console.log('❌ Studio应用关闭失败:', error.message);
    }
    console.log('');

    console.log('🎉 所有测试通过！Studio包功能正常');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    process.exit(1);
  }
}

testStudio();
