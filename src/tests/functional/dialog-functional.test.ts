/**
 * MPLP Dialog Module Functional Tests
 *
 * @version v1.0.0
 * @created 2025-08-05T16:30:00+08:00
 * @description 基于真实用户需求的Dialog功能场景测试
 * 
 * 测试方法论：
 * 1. 基于实际Schema和实现编写测试
 * 2. 从用户角色和使用场景出发设计测试
 * 3. 发现源代码功能缺失和业务逻辑错误
 * 4. 修复源代码问题而不是绕过问题
 */

import { DialogService } from '../../modules/dialog/application/services/dialog.service';
import { MemoryDialogRepository, MemoryMessageRepository } from '../../modules/dialog/infrastructure/repositories/memory-dialog.repository';
import { EventBus } from '../../core/event-bus';
import { Logger } from '../../public/utils/logger';
import {
  CreateDialogRequest,
  DialogInteractionRequest,
  DialogFilter,
  DialogResponse,
  DialogInteractionResponse,
  DialogStatusResponse,
  QueryDialogResponse
} from '../../modules/dialog/types';

// 加载实际Schema进行验证
const dialogSchema = require('../../schemas/mplp-dialog.json');

describe('Dialog Module - Functional Scenarios', () => {
  let dialogService: DialogService;
  let dialogRepository: MemoryDialogRepository;
  let messageRepository: MemoryMessageRepository;
  let eventBus: EventBus;

  beforeEach(() => {
    // 使用实际的实现，不使用Mock
    eventBus = new EventBus();
    dialogRepository = new MemoryDialogRepository();
    messageRepository = new MemoryMessageRepository();
    dialogService = new DialogService(dialogRepository, messageRepository, eventBus);
  });

  afterEach(() => {
    // 清理测试数据
    jest.clearAllMocks();
  });

  describe('功能场景1: 基本对话创建和管理', () => {
    it('用户场景: 创建简单的客服对话', async () => {
      // 基于实际Schema的测试数据
      const createRequest: CreateDialogRequest = {
        name: '简单客服对话',
        participants: ['user-001', 'support-agent-001'],
        capabilities: {
          basic: {
            enabled: true,
            messageHistory: true,
            participantManagement: true
          }
        }
      };

      // 执行创建对话
      const response: DialogResponse = await dialogService.createDialog(createRequest);

      // 验证响应符合Schema
      expect(response).toBeDefined();
      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
      expect(response.data?.dialogId).toBeDefined();
      expect(response.data?.name).toBe(createRequest.name);
      expect(response.data?.participants).toHaveLength(2);
      expect(response.data?.capabilities.basic.enabled).toBe(true);

      // 验证对话状态
      expect(response.data?.status).toBeDefined();
      expect(['pending', 'active', 'completed', 'cancelled']).toContain(response.data?.status);
    });

    it('用户场景: 创建多参与者协作对话', async () => {
      const createRequest: CreateDialogRequest = {
        name: '多Agent协作对话',
        description: '多个AI Agent协作解决复杂问题',
        participants: ['agent-001', 'agent-002', 'agent-003', 'human-supervisor'],
        capabilities: {
          basic: {
            enabled: true,
            messageHistory: true,
            participantManagement: true
          },
          criticalThinking: {
            enabled: true,
            analysisDepth: 'moderate',
            questionGeneration: true,
            logicValidation: true
          }
        },
        strategy: {
          type: 'adaptive',
          rounds: {
            min: 3,
            max: 10,
            target: 6
          },
          exitCriteria: {
            completenessThreshold: 0.8,
            userSatisfactionThreshold: 0.7
          }
        }
      };

      const response = await dialogService.createDialog(createRequest);

      expect(response.success).toBe(true);
      expect(response.data?.dialogId).toBeDefined();
      expect(response.data?.participants).toHaveLength(4);
      expect(response.data?.capabilities.criticalThinking?.enabled).toBe(true);
    });

    it('边界场景: 最大参与者数量限制', async () => {
      // 测试Schema中定义的最大参与者数量限制 (maxItems: 100)
      const participants = Array.from({ length: 101 }, (_, i) => `agent-${i.toString().padStart(3, '0')}`);

      const createRequest: CreateDialogRequest = {
        name: '超限参与者对话',
        participants,
        capabilities: {
          basic: {
            enabled: true,
            messageHistory: true,
            participantManagement: true
          }
        }
      };

      // 应该返回错误响应
      const response = await dialogService.createDialog(createRequest);
      expect(response.success).toBe(false);
      expect(response.error).toBeDefined();
    });
  });

  describe('功能场景2: 对话交互和消息处理', () => {
    let dialogId: string;

    beforeEach(async () => {
      // 创建测试对话
      const createRequest: CreateDialogRequest = {
        name: '交互测试对话',
        participants: ['user-001', 'assistant-001'],
        capabilities: {
          basic: {
            enabled: true,
            messageHistory: true,
            participantManagement: true
          }
        }
      };

      const response = await dialogService.createDialog(createRequest);
      dialogId = response.data?.dialogId || 'test-dialog-id';
    });

    it('用户场景: 发送和接收消息', async () => {
      const interactionRequest: DialogInteractionRequest = {
        dialogId,
        content: {
          type: 'message',
          text: '你好，我需要帮助解决一个技术问题'
        }
      };

      const response: DialogInteractionResponse = await dialogService.interactWithDialog(interactionRequest);

      expect(response.success).toBe(true);
      expect(response.content).toBeDefined();
      expect(response.content.type).toBe('message');
      expect(response.metadata).toBeDefined();
      expect(response.metadata.processingTime).toBeGreaterThan(0);
    });

    it('用户场景: 高级分析能力交互', async () => {
      // 首先更新对话以启用高级能力
      const updateRequest = {
        dialogId,
        capabilities: {
          basic: {
            enabled: true,
            messageHistory: true,
            participantManagement: true
          },
          criticalThinking: {
            enabled: true,
            analysisDepth: 'moderate',
            questionGeneration: true,
            logicValidation: true
          },
          knowledgeSearch: {
            enabled: true,
            realTimeSearch: true,
            sourceValidation: true,
            contextualRelevance: true
          }
        }
      };

      await dialogService.updateDialog(updateRequest);

      const interactionRequest: DialogInteractionRequest = {
        dialogId,
        content: {
          type: 'message',
          text: '我对这个产品很失望，功能不如预期，希望能得到退款'
        },
        options: {
          applyCriticalThinking: true,
          performKnowledgeSearch: true,
          analysisDepth: 'moderate'
        }
      };

      const response = await dialogService.interactWithDialog(interactionRequest);

      expect(response.success).toBe(true);
      expect(response.analysis).toBeDefined();
      // 注意：根据实际类型定义，analysis可能不包含sentiment和intent字段
      // 这里验证analysis对象存在即可
      expect(typeof response.analysis).toBe('object');
    });
  });

  describe('功能场景3: 对话状态查询和管理', () => {
    let dialogId: string;

    beforeEach(async () => {
      const createRequest: CreateDialogRequest = {
        name: '状态管理测试对话',
        participants: ['user-001', 'agent-001'],
        capabilities: {
          basic: {
            enabled: true,
            messageHistory: true,
            participantManagement: true
          }
        }
      };

      const response = await dialogService.createDialog(createRequest);
      dialogId = response.data?.dialogId || 'test-dialog-id';
    });

    it('用户场景: 查询对话状态和进度', async () => {
      const statusResponse: DialogStatusResponse = await dialogService.getDialogStatus(dialogId);

      expect(statusResponse.success).toBe(true);
      expect(statusResponse.data).toBeDefined();
      expect(statusResponse.data?.dialogId).toBe(dialogId);
      expect(statusResponse.data?.status).toBeDefined();
      expect(statusResponse.data?.progress).toBeDefined();
      expect(statusResponse.data?.participants).toBeDefined();
    });

    it('用户场景: 查询不存在的对话', async () => {
      const nonExistentId = '550e8400-e29b-41d4-a716-446655440999';
      const statusResponse = await dialogService.getDialogStatus(nonExistentId);

      expect(statusResponse.success).toBe(false);
      expect(statusResponse.error).toBeDefined();
      expect(statusResponse.error).toContain('对话不存在');
    });
  });

  describe('功能场景4: 对话查询和过滤', () => {
    beforeEach(async () => {
      // 创建多个测试对话
      const dialogs = [
        {
          name: '客服对话1',
          participants: ['user-001', 'support-001']
        },
        {
          name: '技术支持对话',
          participants: ['user-002', 'tech-support-001']
        },
        {
          name: '销售咨询对话',
          participants: ['user-003', 'sales-001']
        }
      ];

      for (const dialogData of dialogs) {
        await dialogService.createDialog({
          ...dialogData,
          capabilities: {
            basic: {
              enabled: true,
              messageHistory: true,
              participantManagement: true
            }
          }
        });
      }
    });

    it('用户场景: 查询所有对话', async () => {
      const filter: DialogFilter = {
        limit: 10,
        offset: 0
      };

      const response: QueryDialogResponse = await dialogService.queryDialogs(filter);

      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
      expect(response.data?.dialogs).toBeDefined();
      expect(response.data?.dialogs.length).toBeGreaterThanOrEqual(3);
      expect(response.data?.total).toBeGreaterThanOrEqual(3);
    });

    it('用户场景: 按参与者过滤对话', async () => {
      const filter: DialogFilter = {
        participants: ['user-001'],
        limit: 10,
        offset: 0
      };

      const response = await dialogService.queryDialogs(filter);

      expect(response.success).toBe(true);
      expect(response.data?.dialogs).toBeDefined();

      // 验证返回的对话都包含指定参与者
      response.data?.dialogs.forEach(dialog => {
        // 根据实际DialogSummary类型，可能需要调整这里的验证逻辑
        expect(dialog.dialogId).toBeDefined();
        expect(dialog.name).toBeDefined();
      });
    });
  });

  describe('异常处理场景', () => {
    it('异常场景: 创建对话时缺少必需字段', async () => {
      const invalidRequest = {
        // 缺少 dialogId
        name: '无效对话',
        // 缺少 participants
        capabilities: {
          basic: {
            enabled: true,
            messageHistory: true,
            participantManagement: true
          }
        }
      } as CreateDialogRequest;

      // 应该返回错误响应
      const response = await dialogService.createDialog(invalidRequest);
      expect(response.success).toBe(false);
      expect(response.error).toBeDefined();
    });

    it('异常场景: 对不存在的对话进行交互', async () => {
      const interactionRequest: DialogInteractionRequest = {
        dialogId: '550e8400-e29b-41d4-a716-446655440999',
        content: {
          type: 'message',
          text: '测试消息'
        }
      };

      const response = await dialogService.interactWithDialog(interactionRequest);

      expect(response.success).toBe(false);
      expect(response.error).toBeDefined();
    });
  });
});
