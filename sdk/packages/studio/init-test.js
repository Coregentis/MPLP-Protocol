/**
 * 初始化测试 - 调试初始化问题
 */

console.log('开始初始化测试...');

async function testInit() {
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

    console.log('3. 开始初始化...');
    console.log('初始化前状态:', studio.getStatus());
    
    // 设置超时
    const initPromise = studio.initialize();
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('初始化超时')), 5000);
    });
    
    await Promise.race([initPromise, timeoutPromise]);
    
    console.log('✅ 初始化成功');
    console.log('初始化后状态:', studio.getStatus());

    console.log('4. 关闭应用...');
    await studio.shutdown();
    console.log('✅ 关闭成功');

    console.log('🎉 初始化测试完成！');

  } catch (error) {
    console.error('❌ 初始化测试失败:', error.message);
    console.error('错误堆栈:', error.stack);
  }
}

testInit();
