/**
 * Dialog功能测试
 * 
 * @description Dialog模块的功能测试套件，验证完整的业务流程
 * @version 1.0.0
 * @schema 基于 mplp-dialog.json Schema驱动测试
 * @naming Schema层(snake_case) ↔ TypeScript层(camelCase)
 */

import { EnterpriseDialogModule, initializeDialogModule } from '../../../../src/modules/dialog/module';
import { DialogTestFactory } from '../dialog-test.factory';
import { DialogEntity } from '../../../../src/modules/dialog/domain/entities/dialog.entity';

describe('Dialog功能测试', () => {
  let dialogModule: EnterpriseDialogModule;

  beforeEach(async () => {
    dialogModule = await initializeDialogModule();
  });

  afterEach(async () => {
    await dialogModule.destroy();
  });

  describe('对话生命周期管理', () => {
    it('应该支持完整的对话生命周期', async () => {
      const components = dialogModule.getComponents();
      const dialogData = DialogTestFactory.createDialogEntityData();

      // 1. 创建对话
      const createdDialog = await components.commandHandler.createDialog(dialogData);
      expect(createdDialog.dialogOperation).toBe('start');
      expect(createdDialog.isActive()).toBe(true);

      // 2. 暂停对话
      const pausedDialog = await components.commandHandler.pauseDialog(createdDialog.dialogId);
      expect(pausedDialog.dialogOperation).toBe('pause');
      expect(pausedDialog.isPaused()).toBe(true);

      // 3. 恢复对话
      const resumedDialog = await components.commandHandler.resumeDialog(createdDialog.dialogId);
      expect(resumedDialog.dialogOperation).toBe('resume');
      expect(resumedDialog.isActive()).toBe(true);

      // 4. 结束对话
      const endedDialog = await components.commandHandler.endDialog(createdDialog.dialogId);
      expect(endedDialog.dialogOperation).toBe('end');
      expect(endedDialog.isEnded()).toBe(true);
    });

    it('应该正确处理对话状态转换', async () => {
      const components = dialogModule.getComponents();
      const dialogData = DialogTestFactory.createDialogEntityData();

      const dialog = await components.commandHandler.createDialog(dialogData);

      // 测试状态检查方法
      expect(dialog.canPause()).toBe(true);
      expect(dialog.canEnd()).toBe(true);
      expect(dialog.canResume()).toBe(false); // 未暂停时不能恢复

      // 暂停后的状态
      const pausedDialog = await components.commandHandler.pauseDialog(dialog.dialogId);
      expect(pausedDialog.canResume()).toBe(true);
      expect(pausedDialog.canPause()).toBe(false); // 已暂停时不能再暂停

      // 结束后的状态
      const endedDialog = await components.commandHandler.endDialog(pausedDialog.dialogId);
      expect(endedDialog.canStart()).toBe(false);
      expect(endedDialog.canPause()).toBe(false);
      expect(endedDialog.canResume()).toBe(false);
      expect(endedDialog.canEnd()).toBe(false);
    });
  });

  describe('参与者管理功能', () => {
    it('应该支持动态参与者管理', async () => {
      const components = dialogModule.getComponents();
      const dialogData = DialogTestFactory.createDialogEntityData({
        participants: ['user-1', 'user-2']
      });

      const dialog = await components.commandHandler.createDialog(dialogData);
      expect(dialog.getParticipantCount()).toBe(2);

      // 添加参与者
      const dialogWithNewParticipant = await components.commandHandler.addParticipant(
        dialog.dialogId, 
        'user-3'
      );
      expect(dialogWithNewParticipant.getParticipantCount()).toBe(3);
      expect(dialogWithNewParticipant.hasParticipant('user-3')).toBe(true);

      // 移除参与者
      const dialogWithRemovedParticipant = await components.commandHandler.removeParticipant(
        dialog.dialogId, 
        'user-1'
      );
      expect(dialogWithRemovedParticipant.getParticipantCount()).toBe(2);
      expect(dialogWithRemovedParticipant.hasParticipant('user-1')).toBe(false);
    });

    it('应该验证参与者操作的业务规则', async () => {
      const components = dialogModule.getComponents();
      const dialogData = DialogTestFactory.createDialogEntityData({
        participants: ['user-1']
      });

      const dialog = await components.commandHandler.createDialog(dialogData);

      // 不能添加重复参与者
      await expect(
        components.commandHandler.addParticipant(dialog.dialogId, 'user-1')
      ).rejects.toThrow();

      // 不能移除不存在的参与者
      await expect(
        components.commandHandler.removeParticipant(dialog.dialogId, 'user-999')
      ).rejects.toThrow();

      // 不能移除最后一个参与者
      await expect(
        components.commandHandler.removeParticipant(dialog.dialogId, 'user-1')
      ).rejects.toThrow();
    });
  });

  describe('对话能力配置', () => {
    it('应该支持智能控制能力', async () => {
      const components = dialogModule.getComponents();
      const dialogData = DialogTestFactory.createDialogEntityData();

      // 确保智能控制能力已启用
      dialogData.capabilities.intelligentControl = {
        enabled: true,
        adaptiveRounds: true,
        dynamicStrategy: true,
        completenessEvaluation: true
      };

      const dialog = await components.commandHandler.createDialog(dialogData);
      
      expect(dialog.capabilities.intelligentControl?.enabled).toBe(true);
      expect(dialog.capabilities.intelligentControl?.adaptiveRounds).toBe(true);
      expect(dialog.capabilities.intelligentControl?.dynamicStrategy).toBe(true);
    });

    it('应该支持批判性思维能力', async () => {
      const components = dialogModule.getComponents();
      const dialogData = DialogTestFactory.createDialogEntityData();

      dialogData.capabilities.criticalThinking = {
        enabled: true,
        analysisDepth: 'deep',
        questionGeneration: true,
        logicValidation: true
      };

      const dialog = await components.commandHandler.createDialog(dialogData);
      
      expect(dialog.capabilities.criticalThinking?.enabled).toBe(true);
      expect(dialog.capabilities.criticalThinking?.analysisDepth).toBe('deep');
      expect(dialog.capabilities.criticalThinking?.questionGeneration).toBe(true);
    });

    it('应该支持知识搜索能力', async () => {
      const components = dialogModule.getComponents();
      const dialogData = DialogTestFactory.createDialogEntityData();

      dialogData.capabilities.knowledgeSearch = {
        enabled: true,
        realTimeSearch: true,
        knowledgeValidation: true,
        sourceVerification: true
      };

      const dialog = await components.commandHandler.createDialog(dialogData);
      
      expect(dialog.capabilities.knowledgeSearch?.enabled).toBe(true);
      expect(dialog.capabilities.knowledgeSearch?.realTimeSearch).toBe(true);
      expect(dialog.capabilities.knowledgeSearch?.sourceVerification).toBe(true);
    });

    it('应该支持多模态能力', async () => {
      const components = dialogModule.getComponents();
      const dialogData = DialogTestFactory.createDialogEntityData();

      dialogData.capabilities.multimodal = {
        enabled: true,
        supportedModalities: ['text', 'audio', 'image', 'video'],
        crossModalTranslation: true
      };

      const dialog = await components.commandHandler.createDialog(dialogData);
      
      expect(dialog.capabilities.multimodal?.enabled).toBe(true);
      expect(dialog.capabilities.multimodal?.supportedModalities).toContain('text');
      expect(dialog.capabilities.multimodal?.supportedModalities).toContain('audio');
      expect(dialog.capabilities.multimodal?.crossModalTranslation).toBe(true);
    });
  });

  describe('对话策略管理', () => {
    it('应该支持自适应策略', async () => {
      const components = dialogModule.getComponents();
      const dialogData = DialogTestFactory.createDialogEntityData();

      dialogData.strategy = {
        type: 'adaptive',
        rounds: {
          min: 2,
          max: 10,
          target: 5
        },
        exitCriteria: {
          completenessThreshold: 0.8,
          userSatisfactionThreshold: 0.85,
          timeLimit: 3600
        }
      };

      const dialog = await components.commandHandler.createDialog(dialogData);
      
      expect(dialog.strategy?.type).toBe('adaptive');
      expect(dialog.strategy?.rounds?.min).toBe(2);
      expect(dialog.strategy?.rounds?.max).toBe(10);
      expect(dialog.strategy?.exitCriteria?.completenessThreshold).toBe(0.8);
    });

    it('应该验证策略配置的有效性', async () => {
      const components = dialogModule.getComponents();
      const dialogData = DialogTestFactory.createDialogEntityData();

      const dialog = await components.commandHandler.createDialog(dialogData);

      // 测试有效策略
      const validStrategy = {
        type: 'goal_driven' as const,
        rounds: { min: 1, max: 5, target: 3 },
        exitCriteria: { completenessThreshold: 0.7 }
      };
      expect(dialog.validateStrategy(validStrategy)).toBe(true);

      // 测试无效策略
      const invalidStrategy = {
        type: 'adaptive' as const,
        rounds: { min: -1, max: 5 }, // 无效的最小轮次
        exitCriteria: { completenessThreshold: 1.5 } // 无效的阈值
      };
      expect(dialog.validateStrategy(invalidStrategy)).toBe(false);
    });
  });

  describe('对话搜索和查询', () => {
    it('应该支持基本搜索功能', async () => {
      const components = dialogModule.getComponents();
      
      // 创建多个对话
      const dialogs = [];
      for (let i = 0; i < 5; i++) {
        const dialogData = DialogTestFactory.createDialogEntityData({
          name: `Test Dialog ${i}`,
          description: `Description for dialog ${i}`
        });
        const dialog = await components.commandHandler.createDialog(dialogData);
        dialogs.push(dialog);
      }

      // 搜索对话
      const searchResult = await components.queryHandler.searchDialogs({
        query: 'Test Dialog',
        fields: ['name', 'description'],
        limit: 10
      });

      expect(searchResult.dialogs.length).toBeGreaterThan(0);
      expect(searchResult.total).toBeGreaterThan(0);
      expect(searchResult.searchMetadata.query).toBe('Test Dialog');
    });

    it('应该支持按参与者查询', async () => {
      const components = dialogModule.getComponents();
      const participantId = 'test-participant';
      
      // 创建包含特定参与者的对话
      const dialogData = DialogTestFactory.createDialogEntityData({
        participants: [participantId, 'other-participant']
      });
      await components.commandHandler.createDialog(dialogData);

      // 按参与者查询
      const result = await components.queryHandler.getDialogsByParticipant(participantId);
      
      expect(result.dialogs.length).toBeGreaterThan(0);
      expect(result.dialogs[0].participants).toContain(participantId);
    });

    it('应该支持按状态查询', async () => {
      const components = dialogModule.getComponents();
      
      // 创建并暂停对话
      const dialogData = DialogTestFactory.createDialogEntityData();
      const dialog = await components.commandHandler.createDialog(dialogData);
      await components.commandHandler.pauseDialog(dialog.dialogId);

      // 按状态查询
      const pausedDialogs = await components.queryHandler.getDialogsByStatus('pause');
      
      expect(pausedDialogs.dialogs.length).toBeGreaterThan(0);
      expect(pausedDialogs.dialogs[0].dialogOperation).toBe('pause');
    });

    it('应该支持按能力查询', async () => {
      const components = dialogModule.getComponents();
      
      // 创建启用智能控制的对话
      const dialogData = DialogTestFactory.createDialogEntityData();
      dialogData.capabilities.intelligentControl = { enabled: true };
      await components.commandHandler.createDialog(dialogData);

      // 按能力查询
      const result = await components.queryHandler.getDialogsByCapability('intelligent_control');
      
      expect(result.dialogs.length).toBeGreaterThan(0);
      expect(result.dialogs[0].capabilities.intelligentControl?.enabled).toBe(true);
    });
  });

  describe('批量操作功能', () => {
    it('应该支持批量删除对话', async () => {
      const components = dialogModule.getComponents();
      
      // 创建多个对话
      const dialogIds = [];
      for (let i = 0; i < 3; i++) {
        const dialogData = DialogTestFactory.createDialogEntityData();
        const dialog = await components.commandHandler.createDialog(dialogData);
        dialogIds.push(dialog.dialogId);
      }

      // 批量删除
      const result = await components.commandHandler.batchDeleteDialogs(dialogIds);
      
      expect(result.successful).toHaveLength(3);
      expect(result.failed).toHaveLength(0);

      // 验证对话已删除
      for (const dialogId of dialogIds) {
        const dialog = await components.queryHandler.getDialogById(dialogId);
        expect(dialog).toBeNull();
      }
    });

    it('应该支持批量状态更新', async () => {
      const components = dialogModule.getComponents();
      
      // 创建多个对话
      const dialogIds = [];
      for (let i = 0; i < 3; i++) {
        const dialogData = DialogTestFactory.createDialogEntityData();
        const dialog = await components.commandHandler.createDialog(dialogData);
        dialogIds.push(dialog.dialogId);
      }

      // 批量暂停
      const result = await components.commandHandler.batchUpdateDialogStatus(dialogIds, 'pause');
      
      expect(result.successful).toHaveLength(3);
      expect(result.failed).toHaveLength(0);

      // 验证状态已更新
      for (const dialogId of dialogIds) {
        const dialog = await components.queryHandler.getDialogById(dialogId);
        expect(dialog?.dialogOperation).toBe('pause');
      }
    });
  });

  describe('统计和分析功能', () => {
    it('应该提供基本统计信息', async () => {
      const components = dialogModule.getComponents();
      
      // 创建一些对话
      for (let i = 0; i < 5; i++) {
        const dialogData = DialogTestFactory.createDialogEntityData();
        await components.commandHandler.createDialog(dialogData);
      }

      const stats = await components.queryHandler.getDialogStatistics();
      
      expect(stats.totalDialogs).toBeGreaterThanOrEqual(5);
      expect(stats.activeDialogs).toBeGreaterThanOrEqual(0);
      expect(stats.averageParticipants).toBeGreaterThan(0);
      expect(stats.dialogsByCapability).toBeDefined();
      expect(stats.recentActivity).toBeDefined();
    });

    it('应该提供详细统计信息', async () => {
      const components = dialogModule.getComponents();
      
      const detailedStats = await components.queryHandler.getDetailedDialogStatistics();
      
      expect(detailedStats.overview).toBeDefined();
      expect(detailedStats.capabilities).toBeDefined();
      expect(detailedStats.participants).toBeDefined();
      expect(detailedStats.performance).toBeDefined();
      expect(detailedStats.trends).toBeDefined();
    });
  });

  describe('错误处理和恢复', () => {
    it('应该正确处理无效操作', async () => {
      const components = dialogModule.getComponents();
      
      // 尝试操作不存在的对话
      await expect(
        components.commandHandler.startDialog('non-existent-id')
      ).rejects.toThrow();

      await expect(
        components.queryHandler.getDialogById('non-existent-id')
      ).resolves.toBeNull();
    });

    it('应该正确处理并发冲突', async () => {
      const components = dialogModule.getComponents();
      const dialogData = DialogTestFactory.createDialogEntityData();
      
      const dialog = await components.commandHandler.createDialog(dialogData);

      // 并发暂停操作
      const pausePromises = [
        components.commandHandler.pauseDialog(dialog.dialogId),
        components.commandHandler.pauseDialog(dialog.dialogId)
      ];

      // 第一个应该成功，第二个应该失败
      const results = await Promise.allSettled(pausePromises);
      
      expect(results[0].status).toBe('fulfilled');
      expect(results[1].status).toBe('rejected');
    });
  });
});
