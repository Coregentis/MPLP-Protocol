/**
 * Context模块BDD测试步骤定义
 * 基于MPLP智能体构建框架协议标准
 * 
 * @version 1.0.0
 * @created 2025-08-14
 */

import { Given, When, Then, Before, After } from '@cucumber/cucumber';
import { expect } from 'chai';
import { ContextController } from '../../../../src/modules/context/api/controllers/context.controller';
import { ContextManagementService } from '../../../../src/modules/context/application/services/context-management.service';
import { CreateContextHandler } from '../../../../src/modules/context/application/commands/create-context.handler';
import { GetContextByIdHandler } from '../../../../src/modules/context/application/queries/get-context-by-id.handler';
import { ContextRepository } from '../../../../src/modules/context/infrastructure/repositories/context.repository';
import { Context } from '../../../../src/modules/context/domain/entities/context.entity';
import { ContextMapper } from '../../../../src/modules/context/api/mappers/context.mapper';
import { ContextStatus, ContextLifecycleStage } from '../../../../src/modules/context/types';
import { UUID } from '../../../../src/public/shared/types';

// 测试上下文存储
interface TestContext {
  contextController: ContextController;
  contextManagementService: ContextManagementService;
  createdContexts: Map<string, Context>;
  lastResponse: any;
  lastError: any;
  testData: any;
}

let testContext: TestContext;

// 测试前置条件
Before(async function() {
  // 初始化测试环境
  const contextRepository = new ContextRepository();
  const createContextHandler = new CreateContextHandler(contextRepository);
  const getContextByIdHandler = new GetContextByIdHandler(contextRepository);
  const contextManagementService = new ContextManagementService(contextRepository);
  
  testContext = {
    contextController: new ContextController(
      createContextHandler,
      getContextByIdHandler,
      contextManagementService
    ),
    contextManagementService,
    createdContexts: new Map(),
    lastResponse: null,
    lastError: null,
    testData: {}
  };
});

// 测试后清理
After(async function() {
  // 清理测试数据
  for (const context of testContext.createdContexts.values()) {
    try {
      await testContext.contextManagementService.deleteContext(context.contextId);
    } catch (error) {
      // 忽略清理错误
    }
  }
  testContext.createdContexts.clear();
});

// ===== Background步骤 =====

Given('MPLP智能体构建框架协议已初始化', async function() {
  // 验证MPLP协议栈已初始化
  expect(testContext.contextController).to.not.be.undefined;
  expect(testContext.contextManagementService).to.not.be.undefined;
});

Given('Context模块已加载并可用', async function() {
  // 验证Context模块可用性
  const healthCheck = await testContext.contextManagementService.healthCheck();
  expect(healthCheck.isHealthy).to.be.true;
});

Given('系统处于健康状态', async function() {
  // 验证系统健康状态
  const systemHealth = await testContext.contextManagementService.getSystemHealth();
  expect(systemHealth.status).to.equal('healthy');
});

// ===== 生命周期管理场景步骤 =====

Given('我有一个有效的Context创建请求', function() {
  testContext.testData.createRequest = {
    name: 'Test Context',
    description: 'BDD测试用Context',
    lifecycleStage: ContextLifecycleStage.INITIALIZATION,
    status: ContextStatus.ACTIVE,
    configuration: {
      timeoutSettings: {
        defaultTimeout: 30000,
        maxTimeout: 300000
      }
    },
    metadata: {
      testType: 'BDD',
      createdBy: 'automated-test'
    }
  };
});

When('我调用创建Context的API', async function() {
  try {
    const mockReq = {
      body: testContext.testData.createRequest,
      params: {},
      query: {}
    };
    
    const mockRes = {
      status: function(code: number) {
        this.statusCode = code;
        return this;
      },
      json: function(data: any) {
        testContext.lastResponse = data;
        return this;
      },
      statusCode: 200
    };
    
    await testContext.contextController.createContext(mockReq as any, mockRes as any);
  } catch (error) {
    testContext.lastError = error;
  }
});

Then('应该成功创建Context实例', function() {
  expect(testContext.lastResponse).to.not.be.null;
  expect(testContext.lastResponse.success).to.be.true;
  expect(testContext.lastResponse.data).to.not.be.undefined;
  
  // 保存创建的Context用于后续测试
  const contextData = testContext.lastResponse.data;
  testContext.createdContexts.set('main', contextData);
});

Then('返回的Context应该包含正确的生命周期阶段', function() {
  const contextData = testContext.lastResponse.data;
  expect(contextData.lifecycle_stage).to.equal('initialization');
});

Then('Context状态应该为{string}', function(expectedStatus: string) {
  const contextData = testContext.lastResponse.data;
  expect(contextData.status).to.equal(expectedStatus);
});

Then('应该生成唯一的context_id', function() {
  const contextData = testContext.lastResponse.data;
  expect(contextData.context_id).to.be.a('string');
  expect(contextData.context_id).to.have.length.greaterThan(0);
});

Then('应该记录创建时间戳', function() {
  const contextData = testContext.lastResponse.data;
  expect(contextData.timestamp).to.be.a('string');
  expect(new Date(contextData.timestamp)).to.be.a('Date');
});

// ===== 状态转换场景步骤 =====

Given('存在一个活跃的Context实例', async function() {
  // 如果还没有创建Context，先创建一个
  if (!testContext.createdContexts.has('main')) {
    await this.step('我有一个有效的Context创建请求');
    await this.step('我调用创建Context的API');
    await this.step('应该成功创建Context实例');
  }
});

When('我将Context状态从{string}更新为{string}', async function(fromStatus: string, toStatus: string) {
  const context = testContext.createdContexts.get('main');
  expect(context).to.not.be.undefined;
  
  try {
    const updateResult = await testContext.contextManagementService.updateContextStatus(
      context.context_id,
      toStatus as ContextStatus
    );
    testContext.lastResponse = updateResult;
  } catch (error) {
    testContext.lastError = error;
  }
});

Then('Context状态应该成功更新为{string}', async function(expectedStatus: string) {
  expect(testContext.lastResponse).to.not.be.null;
  expect(testContext.lastResponse.success).to.be.true;
  
  // 验证状态确实已更新
  const context = testContext.createdContexts.get('main');
  const updatedContext = await testContext.contextManagementService.getContextById(context.context_id);
  expect(updatedContext.status).to.equal(expectedStatus);
});

Then('应该记录状态变更的时间戳', function() {
  const response = testContext.lastResponse;
  expect(response.data.last_modified).to.be.a('string');
  expect(new Date(response.data.last_modified)).to.be.a('Date');
});

Then('应该保持其他属性不变', async function() {
  const context = testContext.createdContexts.get('main');
  const updatedContext = await testContext.contextManagementService.getContextById(context.context_id);
  
  expect(updatedContext.name).to.equal(context.name);
  expect(updatedContext.description).to.equal(context.description);
  expect(updatedContext.context_id).to.equal(context.context_id);
});

// ===== AI集成接口场景步骤 =====

Given('存在一个Context实例', async function() {
  await this.step('存在一个活跃的Context实例');
});

When('我通过AI集成接口查询Context状态', async function() {
  const context = testContext.createdContexts.get('main');
  
  try {
    const aiResponse = await testContext.contextManagementService.getContextForAI(context.context_id);
    testContext.lastResponse = aiResponse;
  } catch (error) {
    testContext.lastError = error;
  }
});

Then('应该返回标准化的AI接口响应格式', function() {
  expect(testContext.lastResponse).to.not.be.null;
  expect(testContext.lastResponse).to.have.property('context_id');
  expect(testContext.lastResponse).to.have.property('context_data');
  expect(testContext.lastResponse).to.have.property('metadata');
  expect(testContext.lastResponse).to.have.property('ai_hints');
  expect(testContext.lastResponse).to.have.property('schema_version');
});

Then('响应应该包含AI系统需要的上下文信息', function() {
  const response = testContext.lastResponse;
  expect(response.context_data).to.be.an('object');
  expect(response.ai_hints).to.be.an('object');
  expect(response.ai_hints).to.have.property('data_types');
  expect(response.ai_hints).to.have.property('processing_hints');
});

Then('不应该包含AI决策算法实现', function() {
  const response = testContext.lastResponse;
  expect(response).to.not.have.property('ai_algorithm');
  expect(response).to.not.have.property('ml_model');
  expect(response).to.not.have.property('decision_logic');
});

Then('应该保持厂商中立性', function() {
  const response = testContext.lastResponse;
  expect(response).to.not.have.property('openai_specific');
  expect(response).to.not.have.property('azure_specific');
  expect(response).to.not.have.property('google_specific');
  expect(response.schema_version).to.match(/^1\.\d+\.\d+$/); // 标准版本格式
});
