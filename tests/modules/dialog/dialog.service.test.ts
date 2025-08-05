/**
 * MPLP Dialog Service Tests
 * 
 * @version v1.0.0
 * @created 2025-08-02T02:05:00+08:00
 * @description Dialog服务的单元测试，基于实际实现编写
 */

import { DialogService } from '../../../src/modules/dialog/application/services/dialog.service';
import { Dialog } from '../../../src/modules/dialog/domain/entities/dialog.entity';
import { DialogRepository, MessageRepository } from '../../../src/modules/dialog/domain/repositories/dialog.repository';
import { EventBus } from '../../../src/core/event-bus';
import { 
  CreateDialogRequest, 
  UpdateDialogRequest, 
  SendMessageRequest,
  DialogQueryParams,
  MessageQueryParams,
  AddParticipantRequest,
  RemoveParticipantRequest,
  UpdateParticipantRequest,
  DialogMessage,
  MessageFormat,
  ConversationContext,
  SecurityPolicy,
  ParticipantStatus,
  Permission,
  MessageType,
  MessagePriority,
  MessageStatus
} from '../../../src/modules/dialog/types';

// Mock dependencies
const mockDialogRepository: jest.Mocked<DialogRepository> = {
  save: jest.fn(),
  findById: jest.fn(),
  findBySessionId: jest.fn(),
  findByContextId: jest.fn(),
  findByParticipantId: jest.fn(),
  findByCreatedBy: jest.fn(),
  findByQuery: jest.fn(),
  exists: jest.fn(),
  delete: jest.fn(),
  deleteBatch: jest.fn(),
  updateStatus: jest.fn(),
  getStatistics: jest.fn()
};

const mockMessageRepository: jest.Mocked<MessageRepository> = {
  saveMessage: jest.fn(),
  findMessageById: jest.fn(),
  findMessagesByDialogId: jest.fn(),
  findMessagesByQuery: jest.fn(),
  deleteMessage: jest.fn(),
  deleteMessagesByDialogId: jest.fn(),
  updateMessageStatus: jest.fn(),
  markMessageAsRead: jest.fn(),
  getUnreadMessageCount: jest.fn()
};

const mockEventBus = {
  publish: jest.fn(),
  subscribe: jest.fn(),
  unsubscribe: jest.fn(),
  publishAsync: jest.fn(),
  clear: jest.fn(),
  getEventTypes: jest.fn(),
  getSubscriberCount: jest.fn(),
  getTotalSubscriptions: jest.fn(),
  hasSubscribers: jest.fn(),
  addErrorHandler: jest.fn(),
  removeErrorHandler: jest.fn(),
  getEventHistory: jest.fn(),
  clearEventHistory: jest.fn()
} as unknown as EventBus;

describe('DialogService', () => {
  let dialogService: DialogService;
  let validCreateRequest: CreateDialogRequest;
  let mockDialog: Dialog;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    dialogService = new DialogService(
      mockDialogRepository,
      mockMessageRepository,
      mockEventBus
    );

    validCreateRequest = {
      session_id: 'test-session-001',
      context_id: 'test-context-001',
      name: 'Test Dialog',
      description: 'A test dialog for unit testing',
      participants: [
        {
          agent_id: 'agent-001',
          role_id: 'role-moderator',
          status: 'active' as ParticipantStatus,
          permissions: ['read', 'write', 'moderate'] as Permission[]
        },
        {
          agent_id: 'agent-002',
          role_id: 'role-participant',
          status: 'active' as ParticipantStatus,
          permissions: ['read', 'write'] as Permission[]
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
      metadata: {
        test: true,
        environment: 'unit-test'
      }
    };

    mockDialog = new Dialog({
      dialog_id: 'test-dialog-001',
      session_id: validCreateRequest.session_id,
      context_id: validCreateRequest.context_id,
      name: validCreateRequest.name,
      description: validCreateRequest.description,
      participants: validCreateRequest.participants.map(p => ({
        ...p,
        participant_id: `participant-${p.agent_id}`,
        joined_at: '2025-08-02T02:00:00.000Z'
      })),
      message_format: validCreateRequest.message_format,
      conversation_context: validCreateRequest.conversation_context,
      security_policy: validCreateRequest.security_policy,
      created_by: validCreateRequest.context_id,
      metadata: validCreateRequest.metadata
    });
  });

  describe('createDialog', () => {
    it('should create dialog successfully', async () => {
      mockDialogRepository.save.mockResolvedValue();

      const result = await dialogService.createDialog(validCreateRequest);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.dialog_id).toBeDefined();
      expect(result.data?.name).toBe(validCreateRequest.name);
      expect(result.data?.participants).toHaveLength(2);
      expect(mockDialogRepository.save).toHaveBeenCalledTimes(1);
      expect(mockEventBus.publish).toHaveBeenCalledWith('dialog_created', expect.any(Object));
    });

    it('should return error for invalid request', async () => {
      const invalidRequest = {
        ...validCreateRequest,
        name: '' // 空名称
      };

      const result = await dialogService.createDialog(invalidRequest);

      expect(result.success).toBe(false);
      expect(result.error).toContain('name是必需的');
      expect(mockDialogRepository.save).not.toHaveBeenCalled();
    });

    it('should create dialog with single participant', async () => {
      const requestWithOneParticipant = {
        ...validCreateRequest,
        participants: [validCreateRequest.participants[0]] // 只有一个参与者
      };

      mockDialogRepository.save.mockResolvedValue();

      const result = await dialogService.createDialog(requestWithOneParticipant);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.participants).toHaveLength(1);
      expect(mockDialogRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should handle repository save error', async () => {
      mockDialogRepository.save.mockRejectedValue(new Error('Database error'));

      const result = await dialogService.createDialog(validCreateRequest);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Database error');
      expect(mockEventBus.publish).not.toHaveBeenCalled();
    });
  });

  describe('getDialog', () => {
    it('should get dialog successfully', async () => {
      mockDialogRepository.findById.mockResolvedValue(mockDialog);

      const result = await dialogService.getDialog('test-dialog-001');

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.dialog_id).toBe('test-dialog-001');
      expect(mockDialogRepository.findById).toHaveBeenCalledWith('test-dialog-001');
    });

    it('should return error when dialog not found', async () => {
      mockDialogRepository.findById.mockResolvedValue(null);

      const result = await dialogService.getDialog('non-existent-id');

      expect(result.success).toBe(false);
      expect(result.error).toBe('对话不存在');
    });

    it('should handle repository error', async () => {
      mockDialogRepository.findById.mockRejectedValue(new Error('Database error'));

      const result = await dialogService.getDialog('test-dialog-001');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Database error');
    });
  });

  describe('updateDialog', () => {
    const updateRequest: UpdateDialogRequest = {
      dialog_id: 'test-dialog-001',
      name: 'Updated Dialog Name',
      description: 'Updated description'
    };

    it('should update dialog successfully', async () => {
      mockDialogRepository.findById.mockResolvedValue(mockDialog);
      mockDialogRepository.save.mockResolvedValue();

      const result = await dialogService.updateDialog(updateRequest);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(mockDialogRepository.save).toHaveBeenCalledTimes(1);
      expect(mockEventBus.publish).toHaveBeenCalledWith('dialog_updated', expect.any(Object));
    });

    it('should return error when dialog not found', async () => {
      mockDialogRepository.findById.mockResolvedValue(null);

      const result = await dialogService.updateDialog(updateRequest);

      expect(result.success).toBe(false);
      expect(result.error).toBe('对话不存在');
      expect(mockDialogRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('deleteDialog', () => {
    it('should delete dialog successfully', async () => {
      mockDialogRepository.findById.mockResolvedValue(mockDialog);
      mockDialogRepository.delete.mockResolvedValue();
      mockMessageRepository.deleteMessagesByDialogId.mockResolvedValue();

      const result = await dialogService.deleteDialog('test-dialog-001');

      expect(result.success).toBe(true);
      expect(mockDialogRepository.delete).toHaveBeenCalledWith('test-dialog-001');
      expect(mockMessageRepository.deleteMessagesByDialogId).toHaveBeenCalledWith('test-dialog-001');
    });

    it('should return error when dialog not found', async () => {
      mockDialogRepository.findById.mockResolvedValue(null);

      const result = await dialogService.deleteDialog('non-existent-id');

      expect(result.success).toBe(false);
      expect(result.error).toBe('对话不存在');
      expect(mockDialogRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('sendMessage', () => {
    const sendMessageRequest: SendMessageRequest = {
      dialog_id: 'test-dialog-001',
      sender_id: 'agent-001',
      recipient_ids: ['agent-002'],
      type: 'text' as MessageType,
      content: {
        text: 'Hello, this is a test message'
      },
      priority: 'normal' as MessagePriority,
      metadata: {
        test: true
      }
    };

    it('should send message successfully', async () => {
      mockDialogRepository.findById.mockResolvedValue(mockDialog);
      mockMessageRepository.saveMessage.mockResolvedValue();

      const result = await dialogService.sendMessage(sendMessageRequest);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.message_id).toBeDefined();
      expect(result.data?.content).toEqual(sendMessageRequest.content);
      expect(mockMessageRepository.saveMessage).toHaveBeenCalledTimes(1);
      expect(mockEventBus.publish).toHaveBeenCalledWith('message_sent', expect.any(Object));
    });

    it('should return error when dialog not found', async () => {
      mockDialogRepository.findById.mockResolvedValue(null);

      const result = await dialogService.sendMessage(sendMessageRequest);

      expect(result.success).toBe(false);
      expect(result.error).toBe('对话不存在');
      expect(mockMessageRepository.saveMessage).not.toHaveBeenCalled();
    });

    it('should return error when sender not participant', async () => {
      const requestWithInvalidSender = {
        ...sendMessageRequest,
        sender_id: 'non-participant-agent'
      };

      mockDialogRepository.findById.mockResolvedValue(mockDialog);

      const result = await dialogService.sendMessage(requestWithInvalidSender);

      expect(result.success).toBe(false);
      expect(result.error).toBe('发送者没有写入权限');
      expect(mockMessageRepository.saveMessage).not.toHaveBeenCalled();
    });
  });

  describe('addParticipant', () => {
    const addParticipantRequest: AddParticipantRequest = {
      dialog_id: 'test-dialog-001',
      agent_id: 'agent-003',
      role_id: 'role-participant',
      permissions: ['read', 'write'] as Permission[]
    };

    it('should add participant successfully', async () => {
      mockDialogRepository.findById.mockResolvedValue(mockDialog);
      mockDialogRepository.save.mockResolvedValue();

      const result = await dialogService.addParticipant(addParticipantRequest);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(mockDialogRepository.save).toHaveBeenCalledTimes(1);
      expect(mockEventBus.publish).toHaveBeenCalledWith('participant_added', expect.any(Object));
    });

    it('should return error when dialog not found', async () => {
      mockDialogRepository.findById.mockResolvedValue(null);

      const result = await dialogService.addParticipant(addParticipantRequest);

      expect(result.success).toBe(false);
      expect(result.error).toBe('对话不存在');
      expect(mockDialogRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('removeParticipant', () => {
    const removeParticipantRequest: RemoveParticipantRequest = {
      dialog_id: 'test-dialog-001',
      participant_id: 'participant-agent-002'
    };

    it('should remove participant successfully', async () => {
      mockDialogRepository.findById.mockResolvedValue(mockDialog);
      mockDialogRepository.save.mockResolvedValue();

      const result = await dialogService.removeParticipant(removeParticipantRequest);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(mockDialogRepository.save).toHaveBeenCalledTimes(1);
      expect(mockEventBus.publish).toHaveBeenCalledWith('participant_removed', expect.any(Object));
    });

    it('should return error when dialog not found', async () => {
      mockDialogRepository.findById.mockResolvedValue(null);

      const result = await dialogService.removeParticipant(removeParticipantRequest);

      expect(result.success).toBe(false);
      expect(result.error).toBe('对话不存在');
      expect(mockDialogRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('listDialogs', () => {
    const queryParams: DialogQueryParams = {
      session_id: 'test-session-001',
      limit: 10,
      offset: 0
    };

    it('should list dialogs successfully', async () => {
      const mockDialogs = [mockDialog];
      mockDialogRepository.findByQuery.mockResolvedValue({
        dialogs: mockDialogs,
        total: 1
      });

      const result = await dialogService.listDialogs(queryParams);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.dialogs).toHaveLength(1);
      expect(result.data?.total).toBe(1);
      expect(mockDialogRepository.findByQuery).toHaveBeenCalledWith(queryParams);
    });

    it('should handle repository error', async () => {
      mockDialogRepository.findByQuery.mockRejectedValue(new Error('Database error'));

      const result = await dialogService.listDialogs(queryParams);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Database error');
    });
  });
});
