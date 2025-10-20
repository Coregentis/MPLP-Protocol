/**
 * Dialog实体单元测试
 * 
 * @description Dialog实体的完整单元测试套件
 * @version 1.0.0
 * @schema 基于 mplp-dialog.json Schema驱动测试
 * @naming Schema层(snake_case) ↔ TypeScript层(camelCase)
 */

import { DialogValidationError, DialogOperationError } from '../../../../src/modules/dialog/types';
import { DialogEntity } from '../../../../src/modules/dialog/domain/entities/dialog.entity';
import { DialogTestFactory } from '../dialog-test.factory';

describe('DialogEntity单元测试', () => {
  describe('Dialog实体创建', () => {
    it('应该成功创建有效的Dialog实体', () => {
      const dialogData = DialogTestFactory.createDialogEntityData();
      
      const dialog = new DialogEntity(
        dialogData.dialogId,
        dialogData.name,
        dialogData.participants,
        dialogData.capabilities,
        dialogData.auditTrail,
        dialogData.monitoringIntegration,
        dialogData.performanceMetrics,
        dialogData.versionHistory,
        dialogData.searchMetadata,
        dialogData.dialogOperation,
        dialogData.eventIntegration,
        dialogData.protocolVersion,
        dialogData.timestamp,
        dialogData.description,
        dialogData.strategy,
        dialogData.context,
        dialogData.configuration,
        dialogData.metadata,
        dialogData.dialogDetails
      );

      expect(dialog).toBeDefined();
      expect(dialog.dialogId).toBe(dialogData.dialogId);
      expect(dialog.name).toBe(dialogData.name);
      expect(dialog.participants).toEqual(dialogData.participants);
      expect(dialog.capabilities).toEqual(dialogData.capabilities);
      expect(dialog.dialogOperation).toBe(dialogData.dialogOperation);
    });

    it('应该在缺少必需字段时抛出验证错误', () => {
      expect(() => {
        new DialogEntity(
          '', // 无效的dialogId
          'Test Dialog',
          ['user-1'],
          DialogTestFactory.createBasicCapabilities(),
          DialogTestFactory.createAuditTrail(),
          DialogTestFactory.createMonitoringIntegration(),
          DialogTestFactory.createPerformanceMetrics(),
          DialogTestFactory.createVersionHistory(),
          DialogTestFactory.createSearchMetadata(),
          'start',
          DialogTestFactory.createEventIntegration()
        );
      }).toThrow(DialogValidationError);
    });

    it('应该在名称为空时抛出验证错误', () => {
      expect(() => {
        new DialogEntity(
          DialogTestFactory.generateTestId(),
          '', // 无效的名称
          ['user-1'],
          DialogTestFactory.createBasicCapabilities(),
          DialogTestFactory.createAuditTrail(),
          DialogTestFactory.createMonitoringIntegration(),
          DialogTestFactory.createPerformanceMetrics(),
          DialogTestFactory.createVersionHistory(),
          DialogTestFactory.createSearchMetadata(),
          'start',
          DialogTestFactory.createEventIntegration()
        );
      }).toThrow(DialogValidationError);
    });

    it('应该在参与者列表为空时抛出验证错误', () => {
      expect(() => {
        new DialogEntity(
          DialogTestFactory.generateTestId(),
          'Test Dialog',
          [], // 无效的参与者列表
          DialogTestFactory.createBasicCapabilities(),
          DialogTestFactory.createAuditTrail(),
          DialogTestFactory.createMonitoringIntegration(),
          DialogTestFactory.createPerformanceMetrics(),
          DialogTestFactory.createVersionHistory(),
          DialogTestFactory.createSearchMetadata(),
          'start',
          DialogTestFactory.createEventIntegration()
        );
      }).toThrow(DialogValidationError);
    });

    it('应该在基础能力未启用时抛出验证错误', () => {
      const invalidCapabilities = DialogTestFactory.createBasicCapabilities();
      invalidCapabilities.basic.enabled = false;

      expect(() => {
        new DialogEntity(
          DialogTestFactory.generateTestId(),
          'Test Dialog',
          ['user-1'],
          invalidCapabilities,
          DialogTestFactory.createAuditTrail(),
          DialogTestFactory.createMonitoringIntegration(),
          DialogTestFactory.createPerformanceMetrics(),
          DialogTestFactory.createVersionHistory(),
          DialogTestFactory.createSearchMetadata(),
          'start',
          DialogTestFactory.createEventIntegration()
        );
      }).toThrow(DialogValidationError);
    });
  });

  describe('Dialog信息更新', () => {
    let dialog: DialogEntity;

    beforeEach(() => {
      const dialogData = DialogTestFactory.createDialogEntityData();
      dialog = new DialogEntity(
        dialogData.dialogId,
        dialogData.name,
        dialogData.participants,
        dialogData.capabilities,
        dialogData.auditTrail,
        dialogData.monitoringIntegration,
        dialogData.performanceMetrics,
        dialogData.versionHistory,
        dialogData.searchMetadata,
        dialogData.dialogOperation,
        dialogData.eventIntegration,
        dialogData.protocolVersion,
        dialogData.timestamp,
        dialogData.description,
        dialogData.strategy,
        dialogData.context,
        dialogData.configuration,
        dialogData.metadata,
        dialogData.dialogDetails
      );
    });

    it('应该成功更新Dialog名称', () => {
      const newName = 'Updated Dialog Name';
      dialog.updateDialog({ name: newName });
      
      expect(dialog.name).toBe(newName);
    });

    it('应该成功更新Dialog描述', () => {
      const newDescription = 'Updated description';
      dialog.updateDialog({ description: newDescription });
      
      expect(dialog.description).toBe(newDescription);
    });

    it('应该在更新为无效名称时抛出错误', () => {
      expect(() => {
        dialog.updateDialog({ name: '' });
      }).toThrow(DialogValidationError);
    });

    it('应该在名称过长时抛出错误', () => {
      const longName = 'A'.repeat(256);
      expect(() => {
        dialog.updateDialog({ name: longName });
      }).toThrow(DialogValidationError);
    });

    it('应该在描述过长时抛出错误', () => {
      const longDescription = 'A'.repeat(1025);
      expect(() => {
        dialog.updateDialog({ description: longDescription });
      }).toThrow(DialogValidationError);
    });
  });

  describe('参与者管理', () => {
    let dialog: DialogEntity;

    beforeEach(() => {
      const dialogData = DialogTestFactory.createDialogEntityData({
        participants: ['user-1', 'user-2']
      });
      dialog = new DialogEntity(
        dialogData.dialogId,
        dialogData.name,
        dialogData.participants,
        dialogData.capabilities,
        dialogData.auditTrail,
        dialogData.monitoringIntegration,
        dialogData.performanceMetrics,
        dialogData.versionHistory,
        dialogData.searchMetadata,
        dialogData.dialogOperation,
        dialogData.eventIntegration,
        dialogData.protocolVersion,
        dialogData.timestamp,
        dialogData.description,
        dialogData.strategy,
        dialogData.context,
        dialogData.configuration,
        dialogData.metadata,
        dialogData.dialogDetails
      );
    });

    it('应该成功添加新参与者', () => {
      const newParticipant = 'user-3';
      dialog.addParticipant(newParticipant);
      
      expect(dialog.participants).toContain(newParticipant);
      expect(dialog.getParticipantCount()).toBe(3);
    });

    it('应该在添加重复参与者时抛出错误', () => {
      expect(() => {
        dialog.addParticipant('user-1');
      }).toThrow(DialogValidationError);
    });

    it('应该成功移除参与者', () => {
      dialog.removeParticipant('user-1');
      
      expect(dialog.participants).not.toContain('user-1');
      expect(dialog.getParticipantCount()).toBe(1);
    });

    it('应该在移除不存在的参与者时抛出错误', () => {
      expect(() => {
        dialog.removeParticipant('user-999');
      }).toThrow(DialogValidationError);
    });

    it('应该在移除最后一个参与者时抛出错误', () => {
      dialog.removeParticipant('user-1');
      
      expect(() => {
        dialog.removeParticipant('user-2');
      }).toThrow(DialogValidationError);
    });

    it('应该正确检查参与者是否存在', () => {
      expect(dialog.hasParticipant('user-1')).toBe(true);
      expect(dialog.hasParticipant('user-999')).toBe(false);
    });
  });

  describe('Dialog状态管理', () => {
    let dialog: DialogEntity;

    beforeEach(() => {
      const dialogData = DialogTestFactory.createDialogEntityData({
        dialogOperation: 'start'
      });
      dialog = new DialogEntity(
        dialogData.dialogId,
        dialogData.name,
        dialogData.participants,
        dialogData.capabilities,
        dialogData.auditTrail,
        dialogData.monitoringIntegration,
        dialogData.performanceMetrics,
        dialogData.versionHistory,
        dialogData.searchMetadata,
        dialogData.dialogOperation,
        dialogData.eventIntegration,
        dialogData.protocolVersion,
        dialogData.timestamp,
        dialogData.description,
        dialogData.strategy,
        dialogData.context,
        dialogData.configuration,
        dialogData.metadata,
        dialogData.dialogDetails
      );
    });

    it('应该成功继续对话', () => {
      dialog.continueDialog();
      expect(dialog.dialogOperation).toBe('continue');
    });

    it('应该成功暂停对话', () => {
      dialog.pauseDialog();
      expect(dialog.dialogOperation).toBe('pause');
    });

    it('应该成功恢复暂停的对话', () => {
      dialog.pauseDialog();
      dialog.resumeDialog();
      expect(dialog.dialogOperation).toBe('resume');
    });

    it('应该成功结束对话', () => {
      dialog.endDialog();
      expect(dialog.dialogOperation).toBe('end');
    });

    it('应该在尝试恢复非暂停对话时抛出错误', () => {
      expect(() => {
        dialog.resumeDialog();
      }).toThrow(DialogOperationError);
    });

    it('应该在尝试暂停已结束对话时抛出错误', () => {
      dialog.endDialog();
      expect(() => {
        dialog.pauseDialog();
      }).toThrow(DialogOperationError);
    });

    it('应该正确检查对话状态', () => {
      expect(dialog.isActive()).toBe(true);
      expect(dialog.isPaused()).toBe(false);
      expect(dialog.isEnded()).toBe(false);

      dialog.pauseDialog();
      expect(dialog.isActive()).toBe(false);
      expect(dialog.isPaused()).toBe(true);
      expect(dialog.isEnded()).toBe(false);

      dialog.resumeDialog();
      expect(dialog.isActive()).toBe(true);
      expect(dialog.isPaused()).toBe(false);
      expect(dialog.isEnded()).toBe(false);

      dialog.endDialog();
      expect(dialog.isActive()).toBe(false);
      expect(dialog.isPaused()).toBe(false);
      expect(dialog.isEnded()).toBe(true);
    });
  });

  describe('Dialog能力管理', () => {
    let dialog: DialogEntity;

    beforeEach(() => {
      const dialogData = DialogTestFactory.createDialogEntityData();
      dialog = new DialogEntity(
        dialogData.dialogId,
        dialogData.name,
        dialogData.participants,
        dialogData.capabilities,
        dialogData.auditTrail,
        dialogData.monitoringIntegration,
        dialogData.performanceMetrics,
        dialogData.versionHistory,
        dialogData.searchMetadata,
        dialogData.dialogOperation,
        dialogData.eventIntegration,
        dialogData.protocolVersion,
        dialogData.timestamp,
        dialogData.description,
        dialogData.strategy,
        dialogData.context,
        dialogData.configuration,
        dialogData.metadata,
        dialogData.dialogDetails
      );
    });

    it('应该成功更新Dialog能力', () => {
      const newCapabilities = DialogTestFactory.createBasicCapabilities();
      newCapabilities.intelligentControl!.enabled = false;
      
      dialog.updateCapabilities(newCapabilities);
      
      expect(dialog.capabilities.intelligentControl?.enabled).toBe(false);
    });

    it('应该在禁用基础能力时抛出错误', () => {
      const invalidCapabilities = DialogTestFactory.createBasicCapabilities();
      invalidCapabilities.basic.enabled = false;
      
      expect(() => {
        dialog.updateCapabilities(invalidCapabilities);
      }).toThrow(DialogValidationError);
    });
  });

  describe('Dialog策略验证', () => {
    let dialog: DialogEntity;

    beforeEach(() => {
      const dialogData = DialogTestFactory.createDialogEntityData();
      dialog = new DialogEntity(
        dialogData.dialogId,
        dialogData.name,
        dialogData.participants,
        dialogData.capabilities,
        dialogData.auditTrail,
        dialogData.monitoringIntegration,
        dialogData.performanceMetrics,
        dialogData.versionHistory,
        dialogData.searchMetadata,
        dialogData.dialogOperation,
        dialogData.eventIntegration,
        dialogData.protocolVersion,
        dialogData.timestamp,
        dialogData.description,
        dialogData.strategy,
        dialogData.context,
        dialogData.configuration,
        dialogData.metadata,
        dialogData.dialogDetails
      );
    });

    it('应该验证有效的策略配置', () => {
      const validStrategy = DialogTestFactory.createDialogStrategy();
      expect(dialog.validateStrategy(validStrategy)).toBe(true);
    });

    it('应该拒绝无效的轮次配置', () => {
      const invalidStrategy = DialogTestFactory.createDialogStrategy();
      invalidStrategy.rounds!.min = -1;
      expect(dialog.validateStrategy(invalidStrategy)).toBe(false);
    });

    it('应该拒绝无效的退出条件', () => {
      const invalidStrategy = DialogTestFactory.createDialogStrategy();
      invalidStrategy.exitCriteria!.completenessThreshold = 1.5;
      expect(dialog.validateStrategy(invalidStrategy)).toBe(false);
    });
  });

  describe('Dialog快照功能', () => {
    it('应该创建正确的Dialog快照', () => {
      const dialogData = DialogTestFactory.createDialogEntityData();
      const dialog = new DialogEntity(
        dialogData.dialogId,
        dialogData.name,
        dialogData.participants,
        dialogData.capabilities,
        dialogData.auditTrail,
        dialogData.monitoringIntegration,
        dialogData.performanceMetrics,
        dialogData.versionHistory,
        dialogData.searchMetadata,
        dialogData.dialogOperation,
        dialogData.eventIntegration,
        dialogData.protocolVersion,
        dialogData.timestamp,
        dialogData.description,
        dialogData.strategy,
        dialogData.context,
        dialogData.configuration,
        dialogData.metadata,
        dialogData.dialogDetails
      );

      const snapshot = dialog.toSnapshot();

      expect(snapshot.dialogId).toBe(dialog.dialogId);
      expect(snapshot.name).toBe(dialog.name);
      expect(snapshot.participants).toEqual(dialog.participants);
      expect(snapshot.dialogOperation).toBe(dialog.dialogOperation);
      expect(snapshot.protocolVersion).toBe(dialog.protocolVersion);
    });
  });

  describe('领域事件', () => {
    it('应该在创建Dialog时生成创建事件', () => {
      const dialogData = DialogTestFactory.createDialogEntityData();
      const dialog = new DialogEntity(
        dialogData.dialogId,
        dialogData.name,
        dialogData.participants,
        dialogData.capabilities,
        dialogData.auditTrail,
        dialogData.monitoringIntegration,
        dialogData.performanceMetrics,
        dialogData.versionHistory,
        dialogData.searchMetadata,
        dialogData.dialogOperation,
        dialogData.eventIntegration,
        dialogData.protocolVersion,
        dialogData.timestamp,
        dialogData.description,
        dialogData.strategy,
        dialogData.context,
        dialogData.configuration,
        dialogData.metadata,
        dialogData.dialogDetails
      );

      const events = dialog.getDomainEvents();
      expect(events).toHaveLength(1);
      expect(events[0].aggregateId).toBe(dialog.dialogId);
    });

    it('应该在更新Dialog时生成更新事件', () => {
      const dialogData = DialogTestFactory.createDialogEntityData();
      const dialog = new DialogEntity(
        dialogData.dialogId,
        dialogData.name,
        dialogData.participants,
        dialogData.capabilities,
        dialogData.auditTrail,
        dialogData.monitoringIntegration,
        dialogData.performanceMetrics,
        dialogData.versionHistory,
        dialogData.searchMetadata,
        dialogData.dialogOperation,
        dialogData.eventIntegration,
        dialogData.protocolVersion,
        dialogData.timestamp,
        dialogData.description,
        dialogData.strategy,
        dialogData.context,
        dialogData.configuration,
        dialogData.metadata,
        dialogData.dialogDetails
      );

      dialog.clearDomainEvents();
      dialog.updateDialog({ name: 'Updated Name' });

      const events = dialog.getDomainEvents();
      expect(events).toHaveLength(1);
    });

    it('应该能够清除领域事件', () => {
      const dialogData = DialogTestFactory.createDialogEntityData();
      const dialog = new DialogEntity(
        dialogData.dialogId,
        dialogData.name,
        dialogData.participants,
        dialogData.capabilities,
        dialogData.auditTrail,
        dialogData.monitoringIntegration,
        dialogData.performanceMetrics,
        dialogData.versionHistory,
        dialogData.searchMetadata,
        dialogData.dialogOperation,
        dialogData.eventIntegration,
        dialogData.protocolVersion,
        dialogData.timestamp,
        dialogData.description,
        dialogData.strategy,
        dialogData.context,
        dialogData.configuration,
        dialogData.metadata,
        dialogData.dialogDetails
      );

      dialog.clearDomainEvents();
      expect(dialog.getDomainEvents()).toHaveLength(0);
    });
  });
});
