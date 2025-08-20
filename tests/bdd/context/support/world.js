/**
 * Cucumber World配置
 * 为BDD测试提供共享的测试环境
 * 
 * @version 1.0.0
 * @created 2025-08-15
 */

const { setWorldConstructor, World } = require('@cucumber/cucumber');

class ContextBDDWorld extends World {
  constructor(options) {
    super(options);
    
    // 测试状态
    this.contextService = null;
    this.contextRepository = null;
    this.currentUser = null;
    this.currentContext = null;
    this.lastResponse = null;
    this.lastError = null;
    this.testData = {};
    
    // 测试配置
    this.config = {
      timeout: 10000,
      retryAttempts: 3,
      cleanupAfterTest: true
    };
  }

  // 初始化测试环境
  async initializeTestEnvironment() {
    // 这里会初始化实际的Context模块服务
    console.log('Initializing BDD test environment...');
  }

  // 清理测试环境
  async cleanupTestEnvironment() {
    if (this.config.cleanupAfterTest) {
      console.log('Cleaning up BDD test environment...');
      this.testData = {};
      this.lastResponse = null;
      this.lastError = null;
    }
  }

  // 设置测试用户
  setTestUser(userId, role, permissions = []) {
    this.currentUser = {
      userId,
      role,
      permissions
    };
  }

  // 记录测试响应
  recordResponse(response) {
    this.lastResponse = response;
    this.lastError = null;
  }

  // 记录测试错误
  recordError(error) {
    this.lastError = error;
    this.lastResponse = null;
  }

  // 验证响应
  validateResponse(expectedProperties = []) {
    if (!this.lastResponse) {
      throw new Error('No response to validate');
    }

    expectedProperties.forEach(prop => {
      if (!this.lastResponse.hasOwnProperty(prop)) {
        throw new Error(`Response missing expected property: ${prop}`);
      }
    });

    return true;
  }

  // 验证错误
  validateError(expectedCode, expectedMessage = null) {
    if (!this.lastError) {
      throw new Error('No error to validate');
    }

    if (this.lastError.code !== expectedCode) {
      throw new Error(`Expected error code ${expectedCode}, got ${this.lastError.code}`);
    }

    if (expectedMessage && !this.lastError.message.includes(expectedMessage)) {
      throw new Error(`Error message does not contain expected text: ${expectedMessage}`);
    }

    return true;
  }
}

// 设置World构造函数
setWorldConstructor(ContextBDDWorld);

module.exports = { ContextBDDWorld };
