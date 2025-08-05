/**
 * MPLP完整工作流集成测试
 * 
 * 测试所有9个模块的完整集成：
 * Context → Plan → Confirm → Trace → Role → Extension → Collab → Dialog → Network
 * 
 * @version 1.0.0
 * @created 2025-08-02
 */

import { ContextManagementService } from '../../../src/modules/context/application/services/context-management.service';
import { PlanManagementService } from '../../../src/modules/plan/application/services/plan-management.service';
import { ConfirmManagementService } from '../../../src/modules/confirm/application/services/confirm-management.service';
import { TraceManagementService } from '../../../src/modules/trace/application/services/trace-management.service';
import { RoleManagementService } from '../../../src/modules/role/application/services/role-management.service';
import { ExtensionManagementService } from '../../../src/modules/extension/application/services/extension-management.service';
import { CollabService } from '../../../src/modules/collab/application/services/collab.service';
import { DialogService } from '../../../src/modules/dialog/application/services/dialog.service';
import { NetworkService } from '../../../src/modules/network/application/services/network.service';

import { TestDataFactory } from '../test-utils/test-data-factory';
import { TestHelpers } from '../test-utils/test-helpers';
import { MockLogger } from '../test-utils/mock-logger';
import { MockSchemaValidator } from '../test-utils/mock-schema-validator';

describe('MPLP完整工作流集成测试', () => {
  let contextService: ContextManagementService;
  let planService: PlanManagementService;
  let confirmService: ConfirmManagementService;
  let traceService: TraceManagementService;
  let roleService: RoleManagementService;
  let extensionService: ExtensionManagementService;
  let collabService: CollabService;
  let dialogService: DialogService;
  let networkService: NetworkService;

  let mockLogger: MockLogger;
  let mockValidator: MockSchemaValidator;

  beforeEach(() => {
    // 创建模拟依赖
    mockLogger = new MockLogger();
    mockValidator = new MockSchemaValidator();

    // 初始化所有服务
    contextService = new ContextManagementService(
      {} as any, // repository
      mockValidator,
      mockLogger
    );

    planService = new PlanManagementService(
      {} as any, // repository
      mockValidator,
      mockLogger
    );

    confirmService = new ConfirmManagementService(
      {} as any, // repository
      mockValidator,
      mockLogger
    );

    traceService = new TraceManagementService(
      {} as any, // repository
      mockValidator,
      mockLogger
    );

    roleService = new RoleManagementService(
      {} as any, // repository
      mockValidator,
      mockLogger
    );

    extensionService = new ExtensionManagementService(
      {} as any, // repository
      mockValidator,
      mockLogger
    );

    collabService = new CollabService(
      {} as any, // collabRepository
      {} as any  // eventBus
    );

    dialogService = new DialogService(
      {} as any, // dialogRepository
      {} as any, // messageRepository
      {} as any  // eventBus
    );

    networkService = new NetworkService(
      {} as any, // networkRepository
      {} as any, // nodeDiscoveryRepository
      {} as any, // routingRepository
      {} as any  // eventBus
    );
  });

  describe('核心工作流集成 (Context → Plan → Confirm → Trace)', () => {
    it('应该成功执行完整的核心工作流', async () => {
      // 1. 创建Context
      const contextRequest = TestDataFactory.createValidContextRequest();
      const contextResult = await contextService.createContext(contextRequest);
      
      expect(contextResult.success).toBe(true);
      expect(contextResult.data).toBeDefined();
      const contextId = contextResult.data!.id;

      // 2. 基于Context创建Plan
      const planRequest = TestDataFactory.createValidPlanRequest({
        contextId: contextId
      });
      const planResult = await planService.createPlan(planRequest);
      
      expect(planResult.success).toBe(true);
      expect(planResult.data).toBeDefined();
      const planId = planResult.data!.id;

      // 3. 确认Plan执行
      const confirmRequest = TestDataFactory.createValidConfirmRequest({
        planId: planId,
        contextId: contextId
      });
      const confirmResult = await confirmService.createConfirmation(confirmRequest);
      
      expect(confirmResult.success).toBe(true);
      expect(confirmResult.data).toBeDefined();
      const confirmId = confirmResult.data!.id;

      // 4. 追踪执行过程
      const traceRequest = TestDataFactory.createValidTraceRequest({
        contextId: contextId,
        planId: planId,
        confirmId: confirmId
      });
      const traceResult = await traceService.createTrace(traceRequest);
      
      expect(traceResult.success).toBe(true);
      expect(traceResult.data).toBeDefined();

      // 验证工作流完整性
      expect(mockLogger.getLogCount()).toBeGreaterThan(0);
      expect(mockValidator.getValidationCount()).toBeGreaterThan(0);
    });

    it('应该正确处理工作流中的错误', async () => {
      // 模拟Context创建失败
      mockValidator.setShouldFail(true);
      
      const contextRequest = TestDataFactory.createValidContextRequest();
      const contextResult = await contextService.createContext(contextRequest);
      
      expect(contextResult.success).toBe(false);
      expect(contextResult.error).toBeDefined();
      expect(mockLogger.getErrorCount()).toBeGreaterThan(0);
    });
  });

  describe('扩展模块集成 (Role → Extension)', () => {
    it('应该成功集成Role和Extension模块', async () => {
      // 1. 创建Role
      const roleRequest = TestDataFactory.createValidRoleRequest();
      const roleResult = await roleService.createRole(roleRequest);
      
      expect(roleResult.success).toBe(true);
      expect(roleResult.data).toBeDefined();
      const roleId = roleResult.data!.id;

      // 2. 基于Role创建Extension
      const extensionRequest = TestDataFactory.createValidExtensionRequest({
        roleId: roleId
      });
      const extensionResult = await extensionService.createExtension(extensionRequest);
      
      expect(extensionResult.success).toBe(true);
      expect(extensionResult.data).toBeDefined();

      // 验证Role-Extension关联
      expect(extensionResult.data!.roleId).toBe(roleId);
    });
  });

  describe('L4智能模块集成 (Collab → Dialog → Network)', () => {
    it('应该成功执行多智能体协作流程', async () => {
      // 1. 初始化协作
      const collabRequest = TestDataFactory.createValidCollabRequest();
      const collabResult = await collabService.createCollab(collabRequest);
      
      expect(collabResult.success).toBe(true);
      expect(collabResult.data).toBeDefined();
      const collabId = collabResult.data!.id;

      // 2. 创建对话会话
      const dialogRequest = TestDataFactory.createValidDialogRequest({
        collab_id: collabId
      });
      const dialogResult = await dialogService.createDialog(dialogRequest);

      expect(dialogResult.success).toBe(true);
      expect(dialogResult.data).toBeDefined();
      const dialogId = dialogResult.data!.id;

      // 3. 建立网络连接
      const networkRequest = TestDataFactory.createValidNetworkRequest({
        context_id: collabId // 使用context_id而不是collabId
      });
      const networkResult = await networkService.createNetwork(networkRequest);

      expect(networkResult.success).toBe(true);
      expect(networkResult.data).toBeDefined();

      // 验证L4智能协作
      expect(networkResult.data!.context_id).toBe(collabId);
    });

    it('应该正确处理智能模块间的通信', async () => {
      // 测试模块间消息传递
      const message = TestDataFactory.createValidMessage();

      // 创建对话来处理消息
      const dialogRequest = TestDataFactory.createValidDialogRequest();
      const dialogResult = await dialogService.createDialog(dialogRequest);
      expect(dialogResult.success).toBe(true);

      // 发送消息到对话
      const sendMessageRequest = {
        dialog_id: dialogResult.data!.id,
        content: message.content,
        sender: message.sender,
        message_type: message.type || 'text'
      };
      const messageResult = await dialogService.sendMessage(sendMessageRequest);
      expect(messageResult.success).toBe(true);

      // 创建网络来传播消息
      const networkRequest = TestDataFactory.createValidNetworkRequest();
      const networkResult = await networkService.createNetwork(networkRequest);
      expect(networkResult.success).toBe(true);

      // 创建协作来协调响应
      const collabRequest = TestDataFactory.createValidCollabRequest();
      const collabResult = await collabService.createCollab(collabRequest);
      expect(collabResult.success).toBe(true);
    });
  });

  describe('跨模块数据流验证', () => {
    it('应该正确传递数据在所有模块间', async () => {
      const startTime = Date.now();
      
      // 创建一个包含所有模块的完整流程
      const workflowData = TestDataFactory.createCompleteWorkflowData();
      
      // 执行完整流程
      const results = await executeCompleteWorkflow(workflowData);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // 验证所有步骤成功
      expect(results.context.success).toBe(true);
      expect(results.plan.success).toBe(true);
      expect(results.confirm.success).toBe(true);
      expect(results.trace.success).toBe(true);
      expect(results.role.success).toBe(true);
      expect(results.extension.success).toBe(true);
      expect(results.collab.success).toBe(true);
      expect(results.dialog.success).toBe(true);
      expect(results.network.success).toBe(true);
      
      // 验证性能要求
      expect(duration).toBeLessThan(5000); // 5秒内完成
      
      // 验证数据一致性
      expect(results.plan.data!.contextId).toBe(results.context.data!.id);
      expect(results.confirm.data!.planId).toBe(results.plan.data!.id);
      expect(results.trace.data!.contextId).toBe(results.context.data!.id);
    });
  });

  // 辅助函数
  async function executeCompleteWorkflow(workflowData: any) {
    const context = await contextService.createContext(workflowData.context);
    const plan = await planService.createPlan({
      ...workflowData.plan,
      contextId: context.data!.id
    });
    const confirm = await confirmService.createConfirmation({
      ...workflowData.confirm,
      planId: plan.data!.id,
      contextId: context.data!.id
    });
    const trace = await traceService.createTrace({
      ...workflowData.trace,
      contextId: context.data!.id,
      planId: plan.data!.id,
      confirmId: confirm.data!.id
    });
    const role = await roleService.createRole(workflowData.role);
    const extension = await extensionService.createExtension({
      ...workflowData.extension,
      roleId: role.data!.id
    });
    const collab = await collabService.createCollab(workflowData.collab);
    const dialog = await dialogService.createDialog({
      ...workflowData.dialog,
      context_id: collab.data!.id
    });
    const network = await networkService.createNetwork({
      ...workflowData.network,
      context_id: collab.data!.id
    });

    return {
      context, plan, confirm, trace, role, extension, collab, dialog, network
    };
  }
});
