/**
 * Dialog集成测试
 * 
 * @description Dialog模块的集成测试套件，验证模块间协作
 * @version 1.0.0
 * @schema 基于 mplp-dialog.json Schema驱动测试
 * @naming Schema层(snake_case) ↔ TypeScript层(camelCase)
 */

import { DialogModule, createDialogModule } from '../../../../src/modules/dialog/module';
import { DialogTestFactory } from '../dialog-test.factory';

describe('Dialog集成测试', () => {
  let dialogModule: DialogModule;

  beforeAll(async () => {
    const result = await createDialogModule({
      enableWebSocket: true,
      enableRealTimeUpdates: true,
      enablePerformanceMonitoring: true,
      maxConcurrentDialogs: 100
    });

    if (!result.success || !result.module) {
      throw new Error(`Failed to create dialog module: ${result.error}`);
    }

    dialogModule = result.module;
  });

  afterAll(async () => {
    if (dialogModule) {
      await dialogModule.destroy();
    }
  });

  describe('CQRS集成测试', () => {
    it('应该通过命令和查询处理器协作完成完整流程', async () => {
      const components = dialogModule.getComponents();
      const dialogData = DialogTestFactory.createDialogEntityData();

      // 1. 通过命令处理器创建对话
      const createdDialog = await components.commandHandler.createDialog(dialogData);
      expect(createdDialog).toBeDefined();
      expect(createdDialog.dialogId).toBe(dialogData.dialogId);

      // 2. 通过查询处理器验证创建结果
      const retrievedDialog = await components.queryHandler.getDialogById(createdDialog.dialogId);
      expect(retrievedDialog).toBeDefined();
      expect(retrievedDialog!.dialogId).toBe(createdDialog.dialogId);
      expect(retrievedDialog!.name).toBe(createdDialog.name);

      // 3. 通过命令处理器更新对话
      const updateData = { name: 'Updated Dialog Name' };
      const updatedDialog = await components.commandHandler.updateDialog(createdDialog.dialogId, updateData);
      expect(updatedDialog.name).toBe(updateData.name);

      // 4. 通过查询处理器验证更新结果
      const retrievedUpdatedDialog = await components.queryHandler.getDialogById(createdDialog.dialogId);
      expect(retrievedUpdatedDialog!.name).toBe(updateData.name);

      // 5. 通过命令处理器删除对话
      await components.commandHandler.deleteDialog(createdDialog.dialogId);

      // 6. 通过查询处理器验证删除结果
      const deletedDialog = await components.queryHandler.getDialogById(createdDialog.dialogId);
      expect(deletedDialog).toBeNull();
    });

    it('应该正确处理命令和查询的数据一致性', async () => {
      const components = dialogModule.getComponents();
      const dialogCount = 10;
      const createdDialogs = [];

      // 创建多个对话
      for (let i = 0; i < dialogCount; i++) {
        const dialogData = DialogTestFactory.createDialogEntityData({
          name: `Integration Test Dialog ${i}`
        });
        const dialog = await components.commandHandler.createDialog(dialogData);
        createdDialogs.push(dialog);
      }

      // 通过查询验证所有对话都已创建
      const listResult = await components.queryHandler.listDialogs({ limit: dialogCount + 5 });
      expect(listResult.dialogs.length).toBeGreaterThanOrEqual(dialogCount);

      // 验证每个对话都能被查询到
      for (const createdDialog of createdDialogs) {
        const retrievedDialog = await components.queryHandler.getDialogById(createdDialog.dialogId);
        expect(retrievedDialog).toBeDefined();
        expect(retrievedDialog!.dialogId).toBe(createdDialog.dialogId);
      }

      // 批量删除
      const dialogIds = createdDialogs.map(d => d.dialogId);
      const batchResult = await components.commandHandler.batchDeleteDialogs(dialogIds);
      expect(batchResult.successful).toHaveLength(dialogCount);

      // 验证删除结果
      for (const dialogId of dialogIds) {
        const deletedDialog = await components.queryHandler.getDialogById(dialogId);
        expect(deletedDialog).toBeNull();
      }
    });
  });

  describe('API控制器集成测试', () => {
    it('应该通过API控制器完成完整的CRUD操作', async () => {
      const components = dialogModule.getComponents();
      const controller = components.controller;
      const dialogSchema = DialogTestFactory.createDialogSchemaData();

      // 1. 创建对话
      const createRequest = {
        params: {},
        query: {},
        body: dialogSchema,
        headers: {},
        user: { id: 'test-user', roles: ['user'] }
      };

      const createResponse = await controller.createDialog(createRequest);
      expect(createResponse.status).toBe(201);
      expect(createResponse.data).toBeDefined();

      const dialogId = createResponse.data.dialog_id;

      // 2. 获取对话
      const getRequest = {
        params: { id: dialogId },
        query: {},
        body: null,
        headers: {},
        user: { id: 'test-user', roles: ['user'] }
      };

      const getResponse = await controller.getDialog(getRequest);
      expect(getResponse.status).toBe(200);
      expect(getResponse.data.dialog_id).toBe(dialogId);

      // 3. 更新对话
      const updateRequest = {
        params: { id: dialogId },
        query: {},
        body: { name: 'Updated Dialog Name' },
        headers: {},
        user: { id: 'test-user', roles: ['user'] }
      };

      const updateResponse = await controller.updateDialog(updateRequest);
      expect(updateResponse.status).toBe(200);
      expect(updateResponse.data.name).toBe('Updated Dialog Name');

      // 4. 列出对话
      const listRequest = {
        params: {},
        query: { limit: '10' },
        body: null,
        headers: {},
        user: { id: 'test-user', roles: ['user'] }
      };

      const listResponse = await controller.listDialogs(listRequest);
      expect(listResponse.status).toBe(200);
      expect(listResponse.data.dialogs).toBeDefined();
      expect(Array.isArray(listResponse.data.dialogs)).toBe(true);

      // 5. 删除对话
      const deleteRequest = {
        params: { id: dialogId },
        query: {},
        body: null,
        headers: {},
        user: { id: 'test-user', roles: ['user'] }
      };

      const deleteResponse = await controller.deleteDialog(deleteRequest);
      expect(deleteResponse.status).toBe(200);

      // 6. 验证删除
      const getDeletedResponse = await controller.getDialog(getRequest);
      expect(getDeletedResponse.status).toBe(404);
    });

    it('应该正确处理对话操作流程', async () => {
      const components = dialogModule.getComponents();
      const controller = components.controller;
      const dialogSchema = DialogTestFactory.createDialogSchemaData();

      // 创建对话
      const createRequest = {
        params: {},
        query: {},
        body: dialogSchema,
        headers: {},
        user: { id: 'test-user', roles: ['user'] }
      };

      const createResponse = await controller.createDialog(createRequest);
      const dialogId = createResponse.data.dialog_id;

      // 启动对话
      const startRequest = {
        params: { id: dialogId },
        query: {},
        body: null,
        headers: {},
        user: { id: 'test-user', roles: ['user'] }
      };

      const startResponse = await controller.startDialog(startRequest);
      expect(startResponse.status).toBe(200);
      expect(startResponse.data.dialog_operation).toBe('start');

      // 暂停对话
      const pauseResponse = await controller.pauseDialog(startRequest);
      expect(pauseResponse.status).toBe(200);
      expect(pauseResponse.data.dialog_operation).toBe('pause');

      // 恢复对话
      const resumeResponse = await controller.resumeDialog(startRequest);
      expect(resumeResponse.status).toBe(200);
      expect(resumeResponse.data.dialog_operation).toBe('resume');

      // 结束对话
      const endResponse = await controller.endDialog(startRequest);
      expect(endResponse.status).toBe(200);
      expect(endResponse.data.dialog_operation).toBe('end');
    });
  });

  describe('WebSocket集成测试', () => {
    it('应该支持WebSocket连接和消息处理', async () => {
      const components = dialogModule.getComponents();
      const webSocketHandler = components.webSocketHandler!;

      // 模拟WebSocket连接
      const mockConnection = {
        id: 'test-connection-1',
        userId: 'test-user',
        send: jest.fn(),
        close: jest.fn()
      };

      // 添加连接
      await webSocketHandler.addConnection(mockConnection);

      // 获取状态
      const status = await webSocketHandler.getStatus();
      expect(status.connections).toBe(1);

      // 处理消息
      const message = {
        type: 'dialog_subscribe',
        data: { dialogId: 'test-dialog-id' }
      };

      await webSocketHandler.handleMessage(mockConnection, message);

      // 广播消息
      const broadcastMessage = {
        type: 'dialog_updated',
        data: { dialogId: 'test-dialog-id', changes: { name: 'New Name' } }
      };

      await webSocketHandler.broadcast(broadcastMessage);
      expect(mockConnection.send).toHaveBeenCalledWith(JSON.stringify(broadcastMessage));

      // 移除连接
      await webSocketHandler.removeConnection(mockConnection.id);

      const finalStatus = await webSocketHandler.getStatus();
      expect(finalStatus.connections).toBe(0);
    });
  });

  describe('模块适配器集成测试', () => {
    it('应该正确实现MPLP模块接口', async () => {
      const components = dialogModule.getComponents();
      const adapter = components.moduleAdapter;

      // 验证模块接口
      expect(adapter.name).toBe('dialog');
      expect(adapter.version).toBe('1.0.0');
      expect(adapter.isInitialized()).toBe(true);

      // 获取健康状态
      const health = await adapter.getHealthStatus();
      expect(health.status).toBe('healthy');
      expect(health.adapter).toBeDefined();
      expect(health.adapter.initialized).toBe(true);

      // 获取统计信息
      const stats = await adapter.getStatistics();
      expect(stats.adapter).toBeDefined();
      expect(stats.adapter.eventBusConnected).toBeDefined();
      expect(stats.adapter.coordinatorRegistered).toBeDefined();

      // 验证模块接口状态
      const interfaceStatus = adapter.getModuleInterfaceStatus();
      expect(interfaceStatus.context).toBe('pending');
      expect(interfaceStatus.plan).toBe('pending');
      expect(interfaceStatus.role).toBe('pending');
    });

    it('应该支持事件发布和处理', async () => {
      const components = dialogModule.getComponents();
      const adapter = components.moduleAdapter;

      // 发布Dialog事件
      const eventData = {
        dialogId: 'test-dialog-id',
        action: 'created',
        timestamp: new Date()
      };

      // 这应该不会抛出错误
      await expect(adapter.publishDialogEvent('created', eventData)).resolves.not.toThrow();
    });
  });

  describe('领域服务集成测试', () => {
    it('应该与其他组件协作进行复杂业务逻辑处理', async () => {
      const components = dialogModule.getComponents();
      const domainService = components.domainService;
      const dialogData = DialogTestFactory.createDialogEntityData();

      // 创建对话
      const dialog = await components.commandHandler.createDialog(dialogData);

      // 验证对话创建
      const createValidation = domainService.validateDialogCreation(dialogData);
      expect(createValidation.isValid).toBe(true);

      // 计算对话复杂度
      const complexity = domainService.calculateDialogComplexity(dialog);
      expect(complexity).toBeGreaterThan(0);
      expect(complexity).toBeLessThanOrEqual(1);

      // 评估对话质量
      const quality = domainService.assessDialogQuality(dialog);
      expect(quality.score).toBeGreaterThan(0);
      expect(quality.score).toBeLessThanOrEqual(1);
      expect(quality.factors).toBeDefined();
      expect(quality.recommendations).toBeDefined();

      // 验证对话更新
      const updateData = { name: 'Updated Name' };
      const updateValidation = domainService.validateDialogUpdate(dialog.dialogId, updateData);
      expect(updateValidation.isValid).toBe(true);

      // 验证对话删除
      const deleteValidation = domainService.validateDialogDeletion(dialog.dialogId);
      expect(deleteValidation.isValid).toBe(true);
    });
  });

  describe('端到端集成测试', () => {
    it('应该支持完整的对话生命周期管理', async () => {
      const components = dialogModule.getComponents();
      const dialogData = DialogTestFactory.createDialogEntityData({
        participants: ['user-1', 'user-2']
      });

      // 1. 创建对话
      const createdDialog = await components.commandHandler.createDialog(dialogData);
      expect(createdDialog.isActive()).toBe(true);

      // 2. 添加参与者
      const dialogWithNewParticipant = await components.commandHandler.addParticipant(
        createdDialog.dialogId, 
        'user-3'
      );
      expect(dialogWithNewParticipant.getParticipantCount()).toBe(3);

      // 3. 暂停对话
      const pausedDialog = await components.commandHandler.pauseDialog(createdDialog.dialogId);
      expect(pausedDialog.isPaused()).toBe(true);

      // 4. 恢复对话
      const resumedDialog = await components.commandHandler.resumeDialog(createdDialog.dialogId);
      expect(resumedDialog.isActive()).toBe(true);

      // 5. 移除参与者
      const dialogWithRemovedParticipant = await components.commandHandler.removeParticipant(
        createdDialog.dialogId, 
        'user-1'
      );
      expect(dialogWithRemovedParticipant.getParticipantCount()).toBe(2);

      // 6. 结束对话
      const endedDialog = await components.commandHandler.endDialog(createdDialog.dialogId);
      expect(endedDialog.isEnded()).toBe(true);

      // 7. 验证最终状态
      const finalDialog = await components.queryHandler.getDialogById(createdDialog.dialogId);
      expect(finalDialog!.isEnded()).toBe(true);
      expect(finalDialog!.getParticipantCount()).toBe(2);
    });

    it('应该支持复杂的搜索和统计场景', async () => {
      const components = dialogModule.getComponents();

      // 创建不同类型的对话
      const dialogs = [];
      for (let i = 0; i < 20; i++) {
        const dialogData = DialogTestFactory.createDialogEntityData({
          name: `Test Dialog ${i}`,
          description: i % 2 === 0 ? 'Even dialog' : 'Odd dialog',
          participants: i < 10 ? ['user-1'] : ['user-1', 'user-2']
        });
        
        // 启用不同的能力
        if (i < 5) {
          dialogData.capabilities.intelligentControl = { enabled: true };
        }
        if (i >= 5 && i < 10) {
          dialogData.capabilities.criticalThinking = { enabled: true };
        }
        if (i >= 10 && i < 15) {
          dialogData.capabilities.knowledgeSearch = { enabled: true };
        }
        if (i >= 15) {
          dialogData.capabilities.multimodal = { enabled: true };
        }

        const dialog = await components.commandHandler.createDialog(dialogData);
        dialogs.push(dialog);
      }

      // 搜索测试
      const searchResult = await components.queryHandler.searchDialogs({
        query: 'Even dialog',
        fields: ['description'],
        limit: 20
      });
      expect(searchResult.dialogs.length).toBe(10);

      // 按参与者查询 - 检查至少包含我们创建的20个对话
      const singleParticipantDialogs = await components.queryHandler.getDialogsByParticipant('user-1');
      expect(singleParticipantDialogs.dialogs.length).toBeGreaterThanOrEqual(20);

      // 按能力查询 - 检查至少有一些具有智能控制能力的对话
      const intelligentDialogs = await components.queryHandler.getDialogsByCapability('intelligent_control');
      expect(intelligentDialogs.dialogs.length).toBeGreaterThanOrEqual(1);

      // 统计信息
      const stats = await components.queryHandler.getDialogStatistics();
      expect(stats.totalDialogs).toBeGreaterThanOrEqual(20);
      expect(stats.averageParticipants).toBeGreaterThan(1);

      // 详细统计
      const detailedStats = await components.queryHandler.getDetailedDialogStatistics();
      expect(detailedStats.overview.total).toBeGreaterThanOrEqual(20);
      expect(detailedStats.capabilities).toBeDefined();
      expect(detailedStats.participants.averagePerDialog).toBeGreaterThan(1);
    });
  });
});
