/**
 * MPLP Dialog Entity Tests
 * 
 * @version v1.0.0
 * @created 2025-08-02T02:00:00+08:00
 * @description Dialog实体的单元测试，基于实际实现编写
 */

import { Dialog } from '../../../src/modules/dialog/domain/entities/dialog.entity';
import {
  DialogEntity,
  DialogParticipant,
  MessageFormat,
  ConversationContext,
  SecurityPolicy,
  DialogStatus,
  ParticipantStatus,
  Permission,
  MessageType,
  MessageContent,
  MessagePriority
} from '../../../src/modules/dialog/types';

describe('Dialog Entity', () => {
  let validDialogData: Partial<DialogEntity>;

  beforeEach(() => {
    validDialogData = {
      session_id: 'test-session-001',
      context_id: 'test-context-001',
      name: 'Test Dialog',
      description: 'A test dialog for unit testing',
      participants: [
        {
          participant_id: 'participant-001',
          agent_id: 'agent-001',
          role_id: 'role-moderator',
          status: 'active' as ParticipantStatus,
          permissions: ['read', 'write', 'moderate'] as Permission[],
          joined_at: '2025-08-02T02:00:00.000Z'
        },
        {
          participant_id: 'participant-002',
          agent_id: 'agent-002',
          role_id: 'role-participant',
          status: 'active' as ParticipantStatus,
          permissions: ['read', 'write'] as Permission[],
          joined_at: '2025-08-02T02:00:00.000Z'
        }
      ],
      message_format: {
        type: 'structured',
        schema: {
          type: 'object',
          properties: {
            content: { type: 'string' },
            priority: { type: 'string', enum: ['low', 'normal', 'high', 'urgent'] }
          },
          required: ['content']
        },
        encoding: 'utf-8',
        max_size: 10240
      } as MessageFormat,
      conversation_context: {
        topic: 'Test Topic',
        purpose: 'Unit Testing',
        constraints: ['no_profanity', 'max_length_1000'],
        history_limit: 100
      } as ConversationContext,
      security_policy: {
        encryption_required: true,
        access_control: 'role_based',
        audit_logging: true,
        message_retention_days: 30
      } as SecurityPolicy,
      created_by: 'test-user-001',
      metadata: {
        test: true,
        environment: 'unit-test'
      }
    };
  });

  describe('Constructor', () => {
    it('should create dialog with valid data', () => {
      const dialog = new Dialog(validDialogData);

      expect(dialog.dialog_id).toBeDefined();
      expect(dialog.session_id).toBe(validDialogData.session_id);
      expect(dialog.context_id).toBe(validDialogData.context_id);
      expect(dialog.name).toBe(validDialogData.name);
      expect(dialog.description).toBe(validDialogData.description);
      expect(dialog.participants).toHaveLength(2);
      expect(dialog.status).toBe('pending');
      expect(dialog.created_at).toBeDefined();
      expect(dialog.updated_at).toBeDefined();
    });

    it('should generate unique dialog_id if not provided', () => {
      const dialog1 = new Dialog(validDialogData);
      const dialog2 = new Dialog(validDialogData);

      expect(dialog1.dialog_id).toBeDefined();
      expect(dialog2.dialog_id).toBeDefined();
      expect(dialog1.dialog_id).not.toBe(dialog2.dialog_id);
    });

    it('should use provided dialog_id if given', () => {
      const customId = 'custom-dialog-id';
      const dataWithId = { ...validDialogData, dialog_id: customId };
      const dialog = new Dialog(dataWithId);

      expect(dialog.dialog_id).toBe(customId);
    });

    it('should set default values correctly', () => {
      const minimalData = {
        session_id: 'test-session',
        context_id: 'test-context',
        name: 'Test Dialog',
        message_format: validDialogData.message_format!,
        created_by: 'test-user'
      };

      const dialog = new Dialog(minimalData);

      expect(dialog.version).toBe('1.0.0');
      expect(dialog.status).toBe('pending');
      expect(dialog.participants).toEqual([]);
      expect(dialog.timestamp).toBeDefined();
    });

    it('should throw error for missing required fields', () => {
      expect(() => new Dialog({})).toThrow();
      expect(() => new Dialog({ session_id: 'test' })).toThrow();
      expect(() => new Dialog({ 
        session_id: 'test', 
        context_id: 'test' 
      })).toThrow();
    });
  });

  describe('Business Methods', () => {
    let dialog: Dialog;

    beforeEach(() => {
      dialog = new Dialog(validDialogData);
    });

    describe('addParticipant', () => {
      it('should add participant successfully', () => {
        const newParticipant = {
          agent_id: 'agent-003',
          role_id: 'role-participant',
          status: 'active' as ParticipantStatus,
          permissions: ['read'] as Permission[]
        };

        const initialCount = dialog.participants.length;
        dialog.addParticipant(newParticipant);

        expect(dialog.participants).toHaveLength(initialCount + 1);
        const addedParticipant = dialog.participants[dialog.participants.length - 1];
        expect(addedParticipant.agent_id).toBe(newParticipant.agent_id);
        expect(addedParticipant.participant_id).toBeDefined();
        expect(addedParticipant.joined_at).toBeDefined();
      });

      it('should throw error when adding duplicate agent', () => {
        const duplicateParticipant = {
          agent_id: 'agent-001', // 已存在的agent
          role_id: 'role-participant',
          status: 'active' as ParticipantStatus,
          permissions: ['read'] as Permission[]
        };

        expect(() => dialog.addParticipant(duplicateParticipant))
          .toThrow('Agent已经是对话参与者');
      });

      it('should throw error when participant limit reached', () => {
        // 创建一个有很多参与者的对话来测试限制
        const manyParticipants: DialogParticipant[] = [];
        for (let i = 0; i < 100; i++) {
          manyParticipants.push({
            participant_id: `participant-${i}`,
            agent_id: `agent-${i}`,
            role_id: 'role-participant',
            status: 'active' as ParticipantStatus,
            permissions: ['read'] as Permission[],
            joined_at: new Date().toISOString()
          });
        }

        const dialogWithManyParticipants = new Dialog({
          ...validDialogData,
          participants: manyParticipants
        });

        const newParticipant = {
          agent_id: 'agent-new',
          role_id: 'role-participant',
          status: 'active' as ParticipantStatus,
          permissions: ['read'] as Permission[]
        };

        expect(() => dialogWithManyParticipants.addParticipant(newParticipant))
          .toThrow('对话参与者数量已达上限');
      });
    });

    describe('removeParticipant', () => {
      it('should remove participant successfully', () => {
        const participantToRemove = dialog.participants[0];
        const initialCount = dialog.participants.length;

        dialog.removeParticipant(participantToRemove.participant_id);

        expect(dialog.participants).toHaveLength(initialCount - 1);
        expect(dialog.participants.find(p => p.participant_id === participantToRemove.participant_id))
          .toBeUndefined();
      });

      it('should throw error when removing non-existent participant', () => {
        expect(() => dialog.removeParticipant('non-existent-id'))
          .toThrow('参与者不存在');
      });

      it('should throw error when trying to remove last participant', () => {
        // 移除除了一个参与者之外的所有参与者
        const participantsToRemove = dialog.participants.slice(1);
        participantsToRemove.forEach(p => dialog.removeParticipant(p.participant_id));

        // 尝试移除最后一个参与者
        const lastParticipant = dialog.participants[0];
        expect(() => dialog.removeParticipant(lastParticipant.participant_id))
          .toThrow('对话至少需要1个参与者');
      });
    });

    describe('updateParticipant', () => {
      it('should update participant successfully', () => {
        const participantToUpdate = dialog.participants[0];
        const updates = {
          role_id: 'role-admin',
          permissions: ['read', 'write', 'moderate', 'admin'] as Permission[]
        };

        dialog.updateParticipant(participantToUpdate.participant_id, updates);

        const updatedParticipant = dialog.participants.find(
          p => p.participant_id === participantToUpdate.participant_id
        );
        expect(updatedParticipant?.role_id).toBe(updates.role_id);
        expect(updatedParticipant?.permissions).toEqual(updates.permissions);
      });

      it('should throw error when updating non-existent participant', () => {
        expect(() => dialog.updateParticipant('non-existent-id', { role_id: 'role-admin' }))
          .toThrow('参与者不存在');
      });
    });

    describe('updateStatus', () => {
      it('should update status successfully', () => {
        dialog.updateStatus('active');
        expect(dialog.status).toBe('active');
      });

      it('should update timestamp when status changes', () => {
        const originalTimestamp = dialog.updated_at;
        
        // 等待一毫秒确保时间戳不同
        setTimeout(() => {
          dialog.updateStatus('active');
          expect(dialog.updated_at).not.toBe(originalTimestamp);
        }, 1);
      });
    });

    describe('updateBasicInfo', () => {
      it('should update basic info successfully', () => {
        const updates = {
          name: 'Updated Dialog Name',
          description: 'Updated description'
        };

        dialog.updateBasicInfo(updates);

        expect(dialog.name).toBe(updates.name);
        expect(dialog.description).toBe(updates.description);
      });

      it('should update timestamp when basic info changes', () => {
        const originalTimestamp = dialog.updated_at;
        
        setTimeout(() => {
          dialog.updateBasicInfo({ name: 'New Name' });
          expect(dialog.updated_at).not.toBe(originalTimestamp);
        }, 1);
      });
    });
  });

  describe('Getters', () => {
    let dialog: Dialog;

    beforeEach(() => {
      dialog = new Dialog(validDialogData);
    });

    it('should return correct property values', () => {
      expect(dialog.dialog_id).toBeDefined();
      expect(dialog.version).toBe('1.0.0');
      expect(dialog.session_id).toBe(validDialogData.session_id);
      expect(dialog.context_id).toBe(validDialogData.context_id);
      expect(dialog.name).toBe(validDialogData.name);
      expect(dialog.description).toBe(validDialogData.description);
      expect(dialog.participants).toEqual(validDialogData.participants);
      expect(dialog.message_format).toEqual(validDialogData.message_format);
      expect(dialog.conversation_context).toEqual(validDialogData.conversation_context);
      expect(dialog.security_policy).toEqual(validDialogData.security_policy);
      expect(dialog.status).toBe('pending');
      expect(dialog.created_by).toBe(validDialogData.created_by);
      expect(dialog.metadata).toEqual(validDialogData.metadata);
    });
  });

  describe('Object Conversion', () => {
    let dialog: Dialog;

    beforeEach(() => {
      dialog = new Dialog(validDialogData);
    });

    it('should convert to object correctly', () => {
      const obj = dialog.toObject();

      expect(obj.dialog_id).toBe(dialog.dialog_id);
      expect(obj.session_id).toBe(dialog.session_id);
      expect(obj.context_id).toBe(dialog.context_id);
      expect(obj.name).toBe(dialog.name);
      expect(obj.participants).toEqual(dialog.participants);
      expect(obj.status).toBe(dialog.status);
    });

    it('should create dialog from object correctly', () => {
      const obj = dialog.toObject();
      const newDialog = Dialog.fromObject(obj);

      expect(newDialog.dialog_id).toBe(obj.dialog_id);
      expect(newDialog.session_id).toBe(obj.session_id);
      expect(newDialog.context_id).toBe(obj.context_id);
      expect(newDialog.name).toBe(obj.name);
      expect(newDialog.participants).toEqual(obj.participants);
      expect(newDialog.status).toBe(obj.status);
    });
  });

  describe('Update Methods', () => {
    let dialog: Dialog;

    beforeEach(() => {
      dialog = new Dialog(validDialogData);
    });

    describe('updateMessageFormat', () => {
      it('应该成功更新消息格式', async () => {
        const originalUpdatedAt = dialog.updated_at;

        // 等待一毫秒确保时间戳不同
        await new Promise(resolve => setTimeout(resolve, 2));

        dialog.updateMessageFormat({
          max_length: 2000
        });

        expect(dialog.message_format.max_length).toBe(2000);
        expect(dialog.updated_at).not.toBe(originalUpdatedAt);
      });
    });

    describe('updateConversationContext', () => {
      it('应该成功更新对话上下文', async () => {
        const originalUpdatedAt = dialog.updated_at;

        // 等待一毫秒确保时间戳不同
        await new Promise(resolve => setTimeout(resolve, 2));

        dialog.updateConversationContext({
          shared_variables: { topic: 'New Topic' }
        });

        expect(dialog.conversation_context?.shared_variables?.topic).toBe('New Topic');
        expect(dialog.updated_at).not.toBe(originalUpdatedAt);
      });
    });

    describe('updateSecurityPolicy', () => {
      it('应该成功更新安全策略', async () => {
        const originalUpdatedAt = dialog.updated_at;

        // 等待一毫秒确保时间戳不同
        await new Promise(resolve => setTimeout(resolve, 2));

        dialog.updateSecurityPolicy({
          encryption: false
        });

        expect(dialog.security_policy?.encryption).toBe(false);
        expect(dialog.updated_at).not.toBe(originalUpdatedAt);
      });
    });

    describe('updateMetadata', () => {
      it('应该成功更新元数据', async () => {
        const originalUpdatedAt = dialog.updated_at;

        // 等待一毫秒确保时间戳不同
        await new Promise(resolve => setTimeout(resolve, 2));

        dialog.updateMetadata({
          new: 'metadata',
          version: '2.0'
        });

        expect(dialog.metadata?.test).toBe(true);
        expect(dialog.metadata?.new).toBe('metadata');
        expect(dialog.metadata?.version).toBe('2.0');
        expect(dialog.updated_at).not.toBe(originalUpdatedAt);
      });
    });
  });

  describe('Permission Management', () => {
    let dialog: Dialog;

    beforeEach(() => {
      dialog = new Dialog(validDialogData);
    });

    describe('hasPermission', () => {
      it('应该通过participant_id检查权限', () => {
        const participantId = dialog.participants[0].participant_id;
        expect(dialog.hasPermission(participantId, 'read')).toBe(true);
        expect(dialog.hasPermission(participantId, 'admin')).toBe(false);
      });

      it('应该通过agent_id检查权限', () => {
        expect(dialog.hasPermission('agent-001', 'write')).toBe(true);
        expect(dialog.hasPermission('agent-001', 'admin')).toBe(false);
      });

      it('应该对不存在的参与者返回false', () => {
        expect(dialog.hasPermission('non-existent', 'read')).toBe(false);
      });
    });
  });

  describe('Dialog State Management', () => {
    let dialog: Dialog;

    beforeEach(() => {
      dialog = new Dialog(validDialogData);
    });

    describe('start', () => {
      it('应该成功启动对话', () => {
        dialog.start();
        expect(dialog.status).toBe('active');
      });

      it('应该防止非pending状态启动对话', () => {
        dialog.start();
        expect(() => dialog.start()).toThrow('无法启动对话，当前状态: active');
      });

      it('应该防止没有活跃参与者时启动', () => {
        // 移除一个参与者，只剩1个
        const participantId = dialog.participants[0].participant_id;
        dialog.removeParticipant(participantId);

        expect(() => dialog.start()).toThrow('至少需要2个活跃参与者才能启动对话');
      });
    });

    describe('pause', () => {
      it('应该成功暂停对话', () => {
        dialog.start();
        dialog.pause();
        expect(dialog.status).toBe('inactive');
      });

      it('应该防止非active状态暂停对话', () => {
        expect(() => dialog.pause()).toThrow('无法暂停对话，当前状态: pending');
      });
    });

    describe('resume', () => {
      it('应该成功恢复对话', () => {
        dialog.start();
        dialog.pause();
        dialog.resume();
        expect(dialog.status).toBe('active');
      });

      it('应该防止非inactive状态恢复对话', () => {
        expect(() => dialog.resume()).toThrow('无法恢复对话，当前状态: pending');
      });
    });

    describe('complete', () => {
      it('应该成功完成对话 - 从active状态', () => {
        dialog.start();
        dialog.complete();
        expect(dialog.status).toBe('completed');
      });

      it('应该成功完成对话 - 从inactive状态', () => {
        dialog.start();
        dialog.pause();
        dialog.complete();
        expect(dialog.status).toBe('completed');
      });

      it('应该防止无效状态完成对话', () => {
        expect(() => dialog.complete()).toThrow('无法完成对话，当前状态: pending');
      });
    });

    describe('cancel', () => {
      it('应该成功取消对话', () => {
        dialog.cancel();
        expect(dialog.status).toBe('cancelled');
      });

      it('应该防止已完成的对话取消', () => {
        dialog.start();
        dialog.complete();
        expect(() => dialog.cancel()).toThrow('无法取消对话，当前状态: completed');
      });

      it('应该防止已取消的对话再次取消', () => {
        dialog.cancel();
        expect(() => dialog.cancel()).toThrow('无法取消对话，当前状态: cancelled');
      });
    });

    describe('fail', () => {
      it('应该成功标记对话失败并记录原因', () => {
        const reason = 'Network connection lost';
        dialog.fail(reason);
        expect(dialog.status).toBe('failed');
        expect(dialog.metadata?.failure_reason).toBe(reason);
      });

      it('应该成功标记对话失败但不记录原因', () => {
        dialog.fail();
        expect(dialog.status).toBe('failed');
      });
    });
  });

  describe('Message Validation Extended', () => {
    let dialog: Dialog;

    beforeEach(() => {
      dialog = new Dialog({
        session_id: 'session-001',
        context_id: 'context-001',
        name: 'Test Dialog',
        participants: [],
        message_format: {
          type: 'binary',
          encoding: 'utf-8',
          max_length: 1000,
          allowed_mime_types: ['image/jpeg', 'image/png', 'text/plain']
        },
        created_by: 'user-001'
      });
    });

    describe('validateMessageFormat with MIME types', () => {
      it('应该验证允许的MIME类型', () => {
        const validContent = {
          text: 'Valid',
          attachments: [{
            attachment_id: 'att-001',
            name: 'image.jpg',
            type: 'image/jpeg',
            size: 1024
          }]
        };

        const invalidContent = {
          text: 'Invalid',
          attachments: [{
            attachment_id: 'att-002',
            name: 'document.pdf',
            type: 'application/pdf',
            size: 2048
          }]
        };

        expect(dialog.validateMessageFormat(validContent, 'data')).toBe(true);
        expect(dialog.validateMessageFormat(invalidContent, 'data')).toBe(false);
      });

      it('应该验证多个附件的MIME类型', () => {
        const mixedContent = {
          text: 'Message with mixed attachments',
          attachments: [
            {
              attachment_id: 'att-001',
              name: 'image.jpg',
              type: 'image/jpeg',
              size: 1024
            },
            {
              attachment_id: 'att-002',
              name: 'document.pdf',
              type: 'application/pdf', // 不允许的类型
              size: 2048
            }
          ]
        };

        expect(dialog.validateMessageFormat(mixedContent, 'data')).toBe(false);
      });

      it('应该处理没有MIME类型限制的情况', () => {
        const dialogNoMimeLimit = new Dialog({
          session_id: 'session-001',
          context_id: 'context-001',
          name: 'Test Dialog',
          participants: [],
          message_format: {
            type: 'binary',
            encoding: 'utf-8'
          },
          created_by: 'user-001'
        });

        const contentWithAttachment = {
          text: 'Message with attachment',
          attachments: [{
            attachment_id: 'att-003',
            name: 'any-file.xyz',
            type: 'application/unknown',
            size: 512
          }]
        };

        expect(dialogNoMimeLimit.validateMessageFormat(contentWithAttachment, 'data')).toBe(true);
      });
    });
  });

  describe('Status Update Method Extended', () => {
    let dialog: Dialog;

    beforeEach(() => {
      dialog = new Dialog(validDialogData);
    });

    describe('updateStatus comprehensive coverage', () => {
      it('应该通过updateStatus从pending启动到active', () => {
        expect(dialog.status).toBe('pending');
        dialog.updateStatus('active');
        expect(dialog.status).toBe('active');
      });

      it('应该通过updateStatus从inactive恢复到active', () => {
        dialog.start();
        dialog.pause();
        expect(dialog.status).toBe('inactive');

        dialog.updateStatus('active');
        expect(dialog.status).toBe('active');
      });

      it('应该通过updateStatus从active暂停到inactive', () => {
        dialog.start();
        expect(dialog.status).toBe('active');

        dialog.updateStatus('inactive');
        expect(dialog.status).toBe('inactive');
      });

      it('应该通过updateStatus完成对话', () => {
        dialog.start();
        dialog.updateStatus('completed');
        expect(dialog.status).toBe('completed');
      });

      it('应该通过updateStatus取消对话', () => {
        dialog.updateStatus('cancelled');
        expect(dialog.status).toBe('cancelled');
      });

      it('应该通过updateStatus标记失败', () => {
        dialog.updateStatus('failed');
        expect(dialog.status).toBe('failed');
      });

      it('应该处理pending状态的直接设置', () => {
        dialog.start();
        dialog.updateStatus('pending');
        expect(dialog.status).toBe('pending');
      });
    });
  });
});
