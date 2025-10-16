/**
 * BaseAdapter EventEmitter Test - SCTM+GLFB+ITCM Framework
 * 模拟BaseAdapter的EventEmitter继承问题
 */

import { EventEmitter } from 'events';

// 模拟IPlatformAdapter接口
interface ITestPlatformAdapter extends EventEmitter {
  readonly config: any;
  readonly capabilities: any;
  testMethod(): void;
}

// 模拟BaseAdapter类
abstract class TestBaseAdapter extends EventEmitter implements ITestPlatformAdapter {
  public readonly config: any;
  public readonly capabilities: any;

  constructor(config: any, capabilities: any) {
    super();
    this.config = config;
    this.capabilities = capabilities;
  }

  public abstract testMethod(): void;

  // 测试emit方法
  public testEmitMethod() {
    console.log('🔄 Testing emit method...');
    this.emit('test-event', 'test-data');
  }

  // 测试错误emit
  public testErrorEmit() {
    console.log('🔄 Testing error emit...');
    this.emit('error', new Error('Test error'));
  }
}

// 具体实现类
class ConcreteTestAdapter extends TestBaseAdapter {
  constructor() {
    super({ platform: 'test' }, { canPost: true });
  }

  public testMethod() {
    console.log('✅ Test method called');
    this.emit('method-called', 'test-method');
  }
}

async function testBaseAdapterEventEmitter() {
  console.log('🎯 BaseAdapter EventEmitter Test - Starting...');
  
  try {
    // 创建具体实现
    const adapter = new ConcreteTestAdapter();
    
    // 测试事件监听
    let eventReceived = false;
    let errorReceived = false;
    let methodEventReceived = false;

    adapter.on('test-event', (data) => {
      console.log('✅ Test event received:', data);
      eventReceived = true;
    });

    adapter.on('error', (error) => {
      console.log('✅ Error event received:', error.message);
      errorReceived = true;
    });

    adapter.on('method-called', (data) => {
      console.log('✅ Method event received:', data);
      methodEventReceived = true;
    });

    // 执行测试
    console.log('\n📋 Test 1: Basic emit');
    adapter.testEmitMethod();
    
    console.log('\n📋 Test 2: Error emit');
    adapter.testErrorEmit();
    
    console.log('\n📋 Test 3: Method emit');
    adapter.testMethod();

    // 等待事件处理
    await new Promise(resolve => setTimeout(resolve, 100));

    // 验证结果
    console.log('\n📊 Test Results:');
    console.log('✅ Basic event:', eventReceived ? 'PASSED' : 'FAILED');
    console.log('✅ Error event:', errorReceived ? 'PASSED' : 'FAILED');
    console.log('✅ Method event:', methodEventReceived ? 'PASSED' : 'FAILED');

    // 测试方法可用性
    console.log('\n📋 Test 4: Method Availability on Instance');
    console.log('✅ emit available:', typeof adapter.emit === 'function');
    console.log('✅ on available:', typeof adapter.on === 'function');
    console.log('✅ removeAllListeners available:', typeof adapter.removeAllListeners === 'function');

    if (eventReceived && errorReceived && methodEventReceived) {
      console.log('\n🎉 BaseAdapter EventEmitter Test - ALL PASSED!');
      console.log('📊 EventEmitter inheritance is working correctly');
    } else {
      console.log('\n❌ BaseAdapter EventEmitter Test - SOME FAILED!');
    }
    
  } catch (error) {
    console.error('❌ BaseAdapter EventEmitter Test - Failed:', error);
    throw error;
  }
}

// 运行测试
testBaseAdapterEventEmitter().catch(console.error);
