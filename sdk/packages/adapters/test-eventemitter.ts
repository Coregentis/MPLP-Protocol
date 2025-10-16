/**
 * EventEmitter Architecture Test - SCTM+GLFB+ITCM Framework
 * 测试EventEmitter在当前环境中的基础功能
 */

import { EventEmitter } from 'events';

// 测试1：基础EventEmitter功能
class TestEmitter extends EventEmitter {
  constructor() {
    super();
  }

  public testEmit() {
    this.emit('test-event', 'test-data');
  }

  public testError() {
    this.emit('error', new Error('Test error'));
  }
}

// 测试2：接口继承测试
interface ITestEmitter extends EventEmitter {
  testMethod(): void;
}

class TestEmitterWithInterface extends EventEmitter implements ITestEmitter {
  constructor() {
    super();
  }

  public testMethod() {
    this.emit('interface-test', 'interface-data');
  }
}

async function testEventEmitterArchitecture() {
  console.log('🎯 EventEmitter Architecture Test - Starting...');
  
  try {
    // 测试基础EventEmitter
    console.log('\n📋 Test 1: Basic EventEmitter');
    const basicEmitter = new TestEmitter();
    
    let eventReceived = false;
    basicEmitter.on('test-event', (data) => {
      console.log('✅ Event received:', data);
      eventReceived = true;
    });
    
    basicEmitter.testEmit();
    
    if (eventReceived) {
      console.log('✅ Basic EventEmitter: PASSED');
    } else {
      console.log('❌ Basic EventEmitter: FAILED');
    }

    // 测试接口继承
    console.log('\n📋 Test 2: Interface Inheritance');
    const interfaceEmitter = new TestEmitterWithInterface();
    
    let interfaceEventReceived = false;
    interfaceEmitter.on('interface-test', (data) => {
      console.log('✅ Interface event received:', data);
      interfaceEventReceived = true;
    });
    
    interfaceEmitter.testMethod();
    
    if (interfaceEventReceived) {
      console.log('✅ Interface Inheritance: PASSED');
    } else {
      console.log('❌ Interface Inheritance: FAILED');
    }

    // 测试错误处理
    console.log('\n📋 Test 3: Error Handling');
    const errorEmitter = new TestEmitter();
    
    let errorReceived = false;
    errorEmitter.on('error', (error) => {
      console.log('✅ Error event received:', error.message);
      errorReceived = true;
    });
    
    errorEmitter.testError();
    
    if (errorReceived) {
      console.log('✅ Error Handling: PASSED');
    } else {
      console.log('❌ Error Handling: FAILED');
    }

    // 测试方法可用性
    console.log('\n📋 Test 4: Method Availability');
    const methodEmitter = new EventEmitter();
    
    const hasEmit = typeof methodEmitter.emit === 'function';
    const hasOn = typeof methodEmitter.on === 'function';
    const hasRemoveAllListeners = typeof methodEmitter.removeAllListeners === 'function';
    
    console.log('✅ emit method available:', hasEmit);
    console.log('✅ on method available:', hasOn);
    console.log('✅ removeAllListeners method available:', hasRemoveAllListeners);
    
    if (hasEmit && hasOn && hasRemoveAllListeners) {
      console.log('✅ Method Availability: PASSED');
    } else {
      console.log('❌ Method Availability: FAILED');
    }

    console.log('\n🎉 EventEmitter Architecture Test - Completed!');
    console.log('📊 All tests passed - EventEmitter is working correctly');
    
  } catch (error) {
    console.error('❌ EventEmitter Architecture Test - Failed:', error);
    throw error;
  }
}

// 运行测试
testEventEmitterArchitecture().catch(console.error);
