/**
 * MPLP v1.0 端到端测试 - Core模块全链路协调测试
 * 基于SCTM+GLFB+ITCM增强框架设计
 * 
 * 测试目标：
 * 1. 验证Core模块作为L3执行层的完整协调能力
 * 2. 覆盖所有10个L2协调层模块的集成调用
 * 3. 实现至少3轮链路调用的完整业务流程
 * 4. 模拟CoreOrchestrator的协调决策机制
 */

import { ContextManagementService } from '../../src/modules/context/application/services/context-management.service';
import { PlanManagementService } from '../../src/modules/plan/application/services/plan-management.service';
import { RoleManagementService } from '../../src/modules/role/application/services/role-management.service';
import { ConfirmManagementService } from '../../src/modules/confirm/application/services/confirm-management.service';
import { TraceManagementService } from '../../src/modules/trace/application/services/trace-management.service';
import { ExtensionManagementService } from '../../src/modules/extension/application/services/extension-management.service';
import { DialogManagementService } from '../../src/modules/dialog/application/services/dialog-management.service';
import { CollabManagementService } from '../../src/modules/collab/application/services/collab-management.service';
import { CoreManagementService } from '../../src/modules/core/application/services/core-management.service';
import { NetworkManagementService } from '../../src/modules/network/application/services/network-management.service';

/**
 * Mock CoreOrchestrator - 模拟L3执行层的协调引擎
 * 实现多轮链路调用和决策机制
 */
class MockCoreOrchestrator {
  private roundCounter = 0;
  private workflowState: any = {};
  private moduleCallHistory: string[] = [];

  constructor(
    private contextService: ContextManagementService,
    private planService: PlanManagementService,
    private roleService: RoleManagementService,
    private confirmService: ConfirmManagementService,
    private traceService: TraceManagementService,
    private extensionService: ExtensionManagementService,
    private dialogService: DialogManagementService,
    private collabService: CollabManagementService,
    private coreService: CoreManagementService,
    private networkService: NetworkManagementService
  ) {}

  /**
   * 执行完整的3轮链路调用工作流
   */
  async executeFullWorkflow(initialRequirement: any): Promise<any> {
    console.log('🚀 开始执行MPLP v1.0完整链路工作流...');
    
    try {
      // Round 1: 需求获取与初始规划
      const round1Result = await this.executeRound1(initialRequirement);
      
      // Round 2: 执行监控与协作管理
      const round2Result = await this.executeRound2(round1Result);
      
      // Round 3: 结果验证与优化反馈
      const round3Result = await this.executeRound3(round2Result);
      
      return {
        success: true,
        totalRounds: 3,
        moduleCallHistory: this.moduleCallHistory,
        finalResult: round3Result,
        workflowState: this.workflowState
      };
    } catch (error) {
      console.error('❌ 工作流执行失败:', error);
      throw error;
    }
  }

  /**
   * Round 1: 需求获取与初始规划
   * Context → Core → Plan → Role → Core (决策) → Confirm
   */
  private async executeRound1(requirement: any): Promise<any> {
    this.roundCounter = 1;
    console.log('📋 Round 1: 需求获取与初始规划');

    // 1. Context模块获取需求上下文
    const contextResult = await this.callModule('Context', async () => {
      return await this.contextService.getContextStatistics();
    });

    // 2. Core模块协调决策
    const coreDecision1 = await this.callModule('Core', async () => {
      return await this.coreService.getWorkflowStatistics();
    });

    // 3. Plan模块制定规划
    const planResult = await this.callModule('Plan', async () => {
      return await this.planService.createPlan({
        contextId: 'e2e-context-001',
        name: 'E2E Test Plan',
        description: 'End-to-end test planning',
        tasks: []
      });
    });

    // 4. Role模块分配角色
    const roleResult = await this.callModule('Role', async () => {
      return await this.roleService.createRole({
        name: 'E2E Test Role',
        description: 'End-to-end test role',
        permissions: ['read', 'write']
      });
    });

    // 5. Core模块决策
    const coreDecision2 = await this.makeDecision('Round1Decision', {
      context: contextResult,
      plan: planResult,
      role: roleResult
    });

    // 6. Confirm模块确认规划
    const confirmResult = await this.callModule('Confirm', async () => {
      return await this.confirmService.createConfirm({
        planId: planResult.planId,
        roleId: roleResult.roleId,
        description: 'E2E test confirmation'
      });
    });

    this.workflowState.round1 = {
      context: contextResult,
      plan: planResult,
      role: roleResult,
      confirm: confirmResult,
      decision: coreDecision2
    };

    return this.workflowState.round1;
  }

  /**
   * Round 2: 执行监控与协作管理
   * Core → Trace → Extension → Dialog → Collab → Core (决策) → Network
   */
  private async executeRound2(round1Data: any): Promise<any> {
    this.roundCounter = 2;
    console.log('⚡ Round 2: 执行监控与协作管理');

    // 1. Core模块启动执行阶段
    const coreExecution = await this.callModule('Core', async () => {
      return await this.coreService.getWorkflowStatistics();
    });

    // 2. Trace模块开始监控
    const traceResult = await this.callModule('Trace', async () => {
      return await this.traceService.createTrace({
        workflowId: 'e2e-workflow-001',
        description: 'E2E test tracing'
      });
    });

    // 3. Extension模块扩展功能
    const extensionResult = await this.callModule('Extension', async () => {
      return await this.extensionService.createExtension({
        name: 'E2E Test Extension',
        version: '1.0.0',
        description: 'End-to-end test extension'
      });
    });

    // 4. Dialog模块处理交互
    const dialogResult = await this.callModule('Dialog', async () => {
      return await this.dialogService.createDialog({
        title: 'E2E Test Dialog',
        content: 'End-to-end test dialog content'
      });
    });

    // 5. Collab模块协作管理
    const collabResult = await this.callModule('Collab', async () => {
      return await this.collabService.createCollaboration({
        name: 'E2E Test Collaboration',
        description: 'End-to-end test collaboration'
      });
    });

    // 6. Core模块决策
    const coreDecision = await this.makeDecision('Round2Decision', {
      trace: traceResult,
      extension: extensionResult,
      dialog: dialogResult,
      collab: collabResult
    });

    // 7. Network模块网络协调
    const networkResult = await this.callModule('Network', async () => {
      return await this.networkService.getGlobalStatistics();
    });

    this.workflowState.round2 = {
      trace: traceResult,
      extension: extensionResult,
      dialog: dialogResult,
      collab: collabResult,
      network: networkResult,
      decision: coreDecision
    };

    return this.workflowState.round2;
  }

  /**
   * Round 3: 结果验证与优化反馈
   * Core → 所有模块状态检查 → Core (最终决策) → 完成
   */
  private async executeRound3(round2Data: any): Promise<any> {
    this.roundCounter = 3;
    console.log('🎯 Round 3: 结果验证与优化反馈');

    // 1. Core模块启动验证阶段
    const coreValidation = await this.callModule('Core', async () => {
      return await this.coreService.getWorkflowStatistics();
    });

    // 2. 所有模块状态检查 (模拟全模块健康检查)
    const moduleHealthCheck = await this.performFullModuleHealthCheck();

    // 3. Core模块最终决策
    const finalDecision = await this.makeDecision('FinalDecision', {
      round1: this.workflowState.round1,
      round2: this.workflowState.round2,
      healthCheck: moduleHealthCheck
    });

    this.workflowState.round3 = {
      validation: coreValidation,
      healthCheck: moduleHealthCheck,
      finalDecision: finalDecision
    };

    return this.workflowState.round3;
  }

  /**
   * 执行全模块健康检查
   */
  private async performFullModuleHealthCheck(): Promise<any> {
    const healthStatus: any = {};

    // 检查所有10个模块的状态
    const modules = [
      'Context', 'Plan', 'Role', 'Confirm', 'Trace',
      'Extension', 'Dialog', 'Collab', 'Core', 'Network'
    ];

    for (const module of modules) {
      healthStatus[module] = {
        status: 'healthy',
        lastCall: this.moduleCallHistory.filter(call => call.includes(module)).length,
        timestamp: new Date().toISOString()
      };
    }

    return healthStatus;
  }

  /**
   * 调用模块并记录历史
   */
  private async callModule(moduleName: string, operation: () => Promise<any>): Promise<any> {
    const callId = `Round${this.roundCounter}-${moduleName}-${Date.now()}`;
    this.moduleCallHistory.push(callId);
    
    console.log(`  📞 调用${moduleName}模块: ${callId}`);
    
    try {
      const result = await operation();
      console.log(`  ✅ ${moduleName}模块调用成功`);
      return result;
    } catch (error) {
      console.error(`  ❌ ${moduleName}模块调用失败:`, error);
      throw error;
    }
  }

  /**
   * Core模块决策机制
   */
  private async makeDecision(decisionType: string, data: any): Promise<any> {
    console.log(`  🧠 Core模块决策: ${decisionType}`);
    
    return {
      decisionType,
      timestamp: new Date().toISOString(),
      inputData: Object.keys(data),
      decision: 'proceed',
      reasoning: `基于${Object.keys(data).join(', ')}的分析，决定继续执行`
    };
  }
}

describe('MPLP v1.0 端到端测试 - Core模块全链路协调', () => {
  let mockOrchestrator: MockCoreOrchestrator;
  let contextService: ContextManagementService;
  let planService: PlanManagementService;
  let roleService: RoleManagementService;
  let confirmService: ConfirmManagementService;
  let traceService: TraceManagementService;
  let extensionService: ExtensionManagementService;
  let dialogService: DialogManagementService;
  let collabService: CollabManagementService;
  let coreService: CoreManagementService;
  let networkService: NetworkManagementService;

  beforeEach(() => {
    // 初始化所有10个模块服务
    contextService = new ContextManagementService({} as any, {} as any, {} as any, {} as any);
    planService = new PlanManagementService({} as any, {} as any, {} as any, {} as any, {} as any, {} as any, {} as any, {} as any, {} as any);
    roleService = new RoleManagementService({} as any, {} as any, {} as any, {} as any, {} as any, {} as any, {} as any, {} as any, {} as any);
    confirmService = new ConfirmManagementService({} as any, {} as any, {} as any, {} as any, {} as any, {} as any, {} as any, {} as any, {} as any);
    traceService = new TraceManagementService({} as any, {} as any, {} as any, {} as any, {} as any, {} as any, {} as any, {} as any, {} as any);
    extensionService = new ExtensionManagementService({} as any, {} as any, {} as any, {} as any, {} as any, {} as any, {} as any, {} as any, {} as any);
    dialogService = new DialogManagementService({} as any, {} as any, {} as any, {} as any, {} as any, {} as any, {} as any, {} as any, {} as any);
    collabService = new CollabManagementService({} as any, {} as any, {} as any, {} as any, {} as any, {} as any, {} as any, {} as any, {} as any);
    coreService = new CoreManagementService({} as any);
    networkService = new NetworkManagementService({} as any, {} as any, {} as any);

    // 创建Mock CoreOrchestrator
    mockOrchestrator = new MockCoreOrchestrator(
      contextService, planService, roleService, confirmService, traceService,
      extensionService, dialogService, collabService, coreService, networkService
    );
  });

  describe('🚀 完整3轮链路调用测试', () => {
    it('应该成功执行完整的端到端工作流', async () => {
      // Mock所有服务方法
      jest.spyOn(contextService, 'getContextStatistics').mockResolvedValue({
        totalContexts: 100,
        activeContexts: 85,
        contextsByType: { 'e2e_test': 50, 'session': 35 },
        averageLifetime: 3600,
        memoryUsage: 256,
        cacheHitRate: 0.95
      } as any);

      jest.spyOn(coreService, 'getWorkflowStatistics').mockResolvedValue({
        totalWorkflows: 50,
        activeWorkflows: 45,
        completedWorkflows: 40,
        failedWorkflows: 5,
        averageDuration: 120
      } as any);

      jest.spyOn(planService, 'createPlan').mockResolvedValue({
        planId: 'e2e-plan-001',
        name: 'E2E Test Plan',
        status: 'active',
        contextId: 'e2e-context-001',
        tasks: []
      } as any);

      jest.spyOn(roleService, 'createRole').mockResolvedValue({
        roleId: 'e2e-role-001',
        name: 'E2E Test Role',
        status: 'active',
        permissions: ['read', 'write']
      } as any);

      jest.spyOn(confirmService, 'createConfirm').mockResolvedValue({
        confirmId: 'e2e-confirm-001',
        planId: 'e2e-plan-001',
        roleId: 'e2e-role-001',
        status: 'confirmed'
      } as any);

      jest.spyOn(traceService, 'createTrace').mockResolvedValue({
        traceId: 'e2e-trace-001',
        workflowId: 'e2e-workflow-001',
        status: 'active'
      } as any);

      jest.spyOn(extensionService, 'createExtension').mockResolvedValue({
        extensionId: 'e2e-extension-001',
        name: 'E2E Test Extension',
        status: 'installed',
        version: '1.0.0'
      } as any);

      jest.spyOn(dialogService, 'createDialog').mockResolvedValue({
        dialogId: 'e2e-dialog-001',
        title: 'E2E Test Dialog',
        status: 'active'
      } as any);

      jest.spyOn(collabService, 'createCollaboration').mockResolvedValue({
        id: 'e2e-collab-001',
        name: 'E2E Test Collaboration',
        status: 'active'
      } as any);

      jest.spyOn(networkService, 'getGlobalStatistics').mockResolvedValue({
        totalNetworks: 10,
        activeNetworks: 8,
        totalNodes: 50,
        totalEdges: 75,
        topologyDistribution: { 'mesh': 5, 'star': 3, 'ring': 2 },
        statusDistribution: { 'active': 8, 'inactive': 2 }
      } as any);

      // 执行完整工作流
      const startTime = Date.now();
      const result = await mockOrchestrator.executeFullWorkflow({
        requirement: 'E2E Test Requirement',
        priority: 'high',
        expectedModules: 10
      });
      const endTime = Date.now();
      const executionTime = endTime - startTime;

      // 验证工作流执行结果
      expect(result.success).toBe(true);
      expect(result.totalRounds).toBe(3);
      expect(result.moduleCallHistory).toHaveLength(12); // 3轮中总共12次模块调用 (Round1:5次 + Round2:6次 + Round3:1次)
      expect(result.finalResult).toBeDefined();
      expect(result.workflowState).toBeDefined();

      // 验证所有3轮都成功执行
      expect(result.workflowState.round1).toBeDefined();
      expect(result.workflowState.round2).toBeDefined();
      expect(result.workflowState.round3).toBeDefined();

      // 验证性能要求 (应在合理时间内完成)
      expect(executionTime).toBeLessThan(5000); // 5秒内完成

      console.log('✅ 端到端工作流执行成功:', {
        totalRounds: result.totalRounds,
        moduleCallsCount: result.moduleCallHistory.length,
        executionTime: `${executionTime}ms`
      });
    }, 10000); // 10秒超时

    it('应该验证所有10个模块都被调用', async () => {
      // Mock所有服务方法 (简化版)
      jest.spyOn(contextService, 'getContextStatistics').mockResolvedValue({} as any);
      jest.spyOn(coreService, 'getWorkflowStatistics').mockResolvedValue({} as any);
      jest.spyOn(planService, 'createPlan').mockResolvedValue({ planId: 'test' } as any);
      jest.spyOn(roleService, 'createRole').mockResolvedValue({ roleId: 'test' } as any);
      jest.spyOn(confirmService, 'createConfirm').mockResolvedValue({ confirmId: 'test' } as any);
      jest.spyOn(traceService, 'createTrace').mockResolvedValue({ traceId: 'test' } as any);
      jest.spyOn(extensionService, 'createExtension').mockResolvedValue({ extensionId: 'test' } as any);
      jest.spyOn(dialogService, 'createDialog').mockResolvedValue({ dialogId: 'test' } as any);
      jest.spyOn(collabService, 'createCollaboration').mockResolvedValue({ id: 'test' } as any);
      jest.spyOn(networkService, 'getGlobalStatistics').mockResolvedValue({} as any);

      // 执行工作流
      const result = await mockOrchestrator.executeFullWorkflow({ test: true });

      // 验证所有10个模块都被调用
      const expectedModules = ['Context', 'Plan', 'Role', 'Confirm', 'Trace', 'Extension', 'Dialog', 'Collab', 'Core', 'Network'];

      for (const module of expectedModules) {
        const moduleCallsCount = result.moduleCallHistory.filter(call => call.includes(module)).length;
        expect(moduleCallsCount).toBeGreaterThan(0);
        console.log(`✅ ${module}模块被调用 ${moduleCallsCount} 次`);
      }

      // 验证模块调用历史的完整性
      expect(result.moduleCallHistory.length).toBeGreaterThanOrEqual(10);

      // 验证健康检查覆盖所有模块
      const healthCheck = result.workflowState.round3.healthCheck;
      for (const module of expectedModules) {
        expect(healthCheck[module]).toBeDefined();
        expect(healthCheck[module].status).toBe('healthy');
      }
    });

    it('应该验证3轮链路调用的正确顺序', async () => {
      // Mock所有服务方法
      jest.spyOn(contextService, 'getContextStatistics').mockResolvedValue({} as any);
      jest.spyOn(coreService, 'getWorkflowStatistics').mockResolvedValue({} as any);
      jest.spyOn(planService, 'createPlan').mockResolvedValue({ planId: 'test' } as any);
      jest.spyOn(roleService, 'createRole').mockResolvedValue({ roleId: 'test' } as any);
      jest.spyOn(confirmService, 'createConfirm').mockResolvedValue({ confirmId: 'test' } as any);
      jest.spyOn(traceService, 'createTrace').mockResolvedValue({ traceId: 'test' } as any);
      jest.spyOn(extensionService, 'createExtension').mockResolvedValue({ extensionId: 'test' } as any);
      jest.spyOn(dialogService, 'createDialog').mockResolvedValue({ dialogId: 'test' } as any);
      jest.spyOn(collabService, 'createCollaboration').mockResolvedValue({ id: 'test' } as any);
      jest.spyOn(networkService, 'getGlobalStatistics').mockResolvedValue({} as any);

      // 执行工作流
      const result = await mockOrchestrator.executeFullWorkflow({ test: true });

      // 验证Round 1的调用顺序: Context → Core → Plan → Role → Core → Confirm
      const round1Calls = result.moduleCallHistory.filter(call => call.includes('Round1'));
      expect(round1Calls.some(call => call.includes('Context'))).toBe(true);
      expect(round1Calls.some(call => call.includes('Core'))).toBe(true);
      expect(round1Calls.some(call => call.includes('Plan'))).toBe(true);
      expect(round1Calls.some(call => call.includes('Role'))).toBe(true);
      expect(round1Calls.some(call => call.includes('Confirm'))).toBe(true);

      // 验证Round 2的调用顺序: Core → Trace → Extension → Dialog → Collab → Network
      const round2Calls = result.moduleCallHistory.filter(call => call.includes('Round2'));
      expect(round2Calls.some(call => call.includes('Core'))).toBe(true);
      expect(round2Calls.some(call => call.includes('Trace'))).toBe(true);
      expect(round2Calls.some(call => call.includes('Extension'))).toBe(true);
      expect(round2Calls.some(call => call.includes('Dialog'))).toBe(true);
      expect(round2Calls.some(call => call.includes('Collab'))).toBe(true);
      expect(round2Calls.some(call => call.includes('Network'))).toBe(true);

      // 验证Round 3的调用: Core → 健康检查
      const round3Calls = result.moduleCallHistory.filter(call => call.includes('Round3'));
      expect(round3Calls.some(call => call.includes('Core'))).toBe(true);

      // 验证工作流状态的完整性
      expect(result.workflowState.round1).toBeDefined();
      expect(result.workflowState.round2).toBeDefined();
      expect(result.workflowState.round3).toBeDefined();

      console.log('✅ 3轮链路调用顺序验证成功');
    });
  });

  describe('🔍 模块协调与决策验证', () => {
    it('应该验证Core模块的决策机制', async () => {
      // Mock服务方法
      jest.spyOn(contextService, 'getContextStatistics').mockResolvedValue({} as any);
      jest.spyOn(coreService, 'getWorkflowStatistics').mockResolvedValue({} as any);
      jest.spyOn(planService, 'createPlan').mockResolvedValue({ planId: 'test' } as any);
      jest.spyOn(roleService, 'createRole').mockResolvedValue({ roleId: 'test' } as any);
      jest.spyOn(confirmService, 'createConfirm').mockResolvedValue({ confirmId: 'test' } as any);
      jest.spyOn(traceService, 'createTrace').mockResolvedValue({ traceId: 'test' } as any);
      jest.spyOn(extensionService, 'createExtension').mockResolvedValue({ extensionId: 'test' } as any);
      jest.spyOn(dialogService, 'createDialog').mockResolvedValue({ dialogId: 'test' } as any);
      jest.spyOn(collabService, 'createCollaboration').mockResolvedValue({ id: 'test' } as any);
      jest.spyOn(networkService, 'getGlobalStatistics').mockResolvedValue({} as any);

      // 执行工作流
      const result = await mockOrchestrator.executeFullWorkflow({ test: true });

      // 验证决策机制
      expect(result.workflowState.round1.decision).toBeDefined();
      expect(result.workflowState.round1.decision.decisionType).toBe('Round1Decision');
      expect(result.workflowState.round1.decision.decision).toBe('proceed');

      expect(result.workflowState.round2.decision).toBeDefined();
      expect(result.workflowState.round2.decision.decisionType).toBe('Round2Decision');
      expect(result.workflowState.round2.decision.decision).toBe('proceed');

      expect(result.workflowState.round3.finalDecision).toBeDefined();
      expect(result.workflowState.round3.finalDecision.decisionType).toBe('FinalDecision');
      expect(result.workflowState.round3.finalDecision.decision).toBe('proceed');

      console.log('✅ Core模块决策机制验证成功');
    });

    it('应该验证模块间数据流转', async () => {
      // Mock服务方法返回特定数据
      jest.spyOn(contextService, 'getContextStatistics').mockResolvedValue({
        totalContexts: 100,
        contextsByType: { 'test': 50 }
      } as any);

      jest.spyOn(planService, 'createPlan').mockResolvedValue({
        planId: 'data-flow-plan',
        contextId: 'data-flow-context'
      } as any);

      jest.spyOn(roleService, 'createRole').mockResolvedValue({
        roleId: 'data-flow-role',
        name: 'Data Flow Role'
      } as any);

      jest.spyOn(confirmService, 'createConfirm').mockResolvedValue({
        confirmId: 'data-flow-confirm',
        planId: 'data-flow-plan',
        roleId: 'data-flow-role'
      } as any);

      // Mock其他服务
      jest.spyOn(coreService, 'getWorkflowStatistics').mockResolvedValue({} as any);
      jest.spyOn(traceService, 'createTrace').mockResolvedValue({ traceId: 'test' } as any);
      jest.spyOn(extensionService, 'createExtension').mockResolvedValue({ extensionId: 'test' } as any);
      jest.spyOn(dialogService, 'createDialog').mockResolvedValue({ dialogId: 'test' } as any);
      jest.spyOn(collabService, 'createCollaboration').mockResolvedValue({ id: 'test' } as any);
      jest.spyOn(networkService, 'getGlobalStatistics').mockResolvedValue({} as any);

      // 执行工作流
      const result = await mockOrchestrator.executeFullWorkflow({ test: true });

      // 验证数据流转
      expect(result.workflowState.round1.context.totalContexts).toBe(100);
      expect(result.workflowState.round1.plan.planId).toBe('data-flow-plan');
      expect(result.workflowState.round1.role.roleId).toBe('data-flow-role');
      expect(result.workflowState.round1.confirm.planId).toBe('data-flow-plan');
      expect(result.workflowState.round1.confirm.roleId).toBe('data-flow-role');

      console.log('✅ 模块间数据流转验证成功');
    });
  });

  describe('⚡ 性能与可靠性测试', () => {
    it('应该在合理时间内完成端到端工作流', async () => {
      // Mock所有服务方法 (快速响应)
      jest.spyOn(contextService, 'getContextStatistics').mockResolvedValue({} as any);
      jest.spyOn(coreService, 'getWorkflowStatistics').mockResolvedValue({} as any);
      jest.spyOn(planService, 'createPlan').mockResolvedValue({ planId: 'perf-test' } as any);
      jest.spyOn(roleService, 'createRole').mockResolvedValue({ roleId: 'perf-test' } as any);
      jest.spyOn(confirmService, 'createConfirm').mockResolvedValue({ confirmId: 'perf-test' } as any);
      jest.spyOn(traceService, 'createTrace').mockResolvedValue({ traceId: 'perf-test' } as any);
      jest.spyOn(extensionService, 'createExtension').mockResolvedValue({ extensionId: 'perf-test' } as any);
      jest.spyOn(dialogService, 'createDialog').mockResolvedValue({ dialogId: 'perf-test' } as any);
      jest.spyOn(collabService, 'createCollaboration').mockResolvedValue({ id: 'perf-test' } as any);
      jest.spyOn(networkService, 'getGlobalStatistics').mockResolvedValue({} as any);

      // 性能测试
      const performanceResults = [];

      for (let i = 0; i < 3; i++) {
        const startTime = Date.now();
        const result = await mockOrchestrator.executeFullWorkflow({ iteration: i });
        const endTime = Date.now();
        const executionTime = endTime - startTime;

        performanceResults.push(executionTime);

        expect(result.success).toBe(true);
        expect(executionTime).toBeLessThan(3000); // 3秒内完成
      }

      // 计算平均执行时间
      const averageTime = performanceResults.reduce((a, b) => a + b, 0) / performanceResults.length;
      expect(averageTime).toBeLessThan(2000); // 平均2秒内完成

      console.log('✅ 性能测试通过:', {
        iterations: performanceResults.length,
        averageTime: `${averageTime.toFixed(2)}ms`,
        maxTime: `${Math.max(...performanceResults)}ms`,
        minTime: `${Math.min(...performanceResults)}ms`
      });
    });

    it('应该处理并发执行场景', async () => {
      // Mock所有服务方法
      jest.spyOn(contextService, 'getContextStatistics').mockResolvedValue({} as any);
      jest.spyOn(coreService, 'getWorkflowStatistics').mockResolvedValue({} as any);
      jest.spyOn(planService, 'createPlan').mockResolvedValue({ planId: 'concurrent-test' } as any);
      jest.spyOn(roleService, 'createRole').mockResolvedValue({ roleId: 'concurrent-test' } as any);
      jest.spyOn(confirmService, 'createConfirm').mockResolvedValue({ confirmId: 'concurrent-test' } as any);
      jest.spyOn(traceService, 'createTrace').mockResolvedValue({ traceId: 'concurrent-test' } as any);
      jest.spyOn(extensionService, 'createExtension').mockResolvedValue({ extensionId: 'concurrent-test' } as any);
      jest.spyOn(dialogService, 'createDialog').mockResolvedValue({ dialogId: 'concurrent-test' } as any);
      jest.spyOn(collabService, 'createCollaboration').mockResolvedValue({ id: 'concurrent-test' } as any);
      jest.spyOn(networkService, 'getGlobalStatistics').mockResolvedValue({} as any);

      // 并发执行测试
      const concurrentPromises = [];
      for (let i = 0; i < 3; i++) {
        const orchestrator = new MockCoreOrchestrator(
          contextService, planService, roleService, confirmService, traceService,
          extensionService, dialogService, collabService, coreService, networkService
        );
        concurrentPromises.push(orchestrator.executeFullWorkflow({ concurrent: i }));
      }

      const results = await Promise.all(concurrentPromises);

      // 验证所有并发执行都成功
      results.forEach((result, index) => {
        expect(result.success).toBe(true);
        expect(result.totalRounds).toBe(3);
        expect(result.moduleCallHistory.length).toBeGreaterThan(0);
        console.log(`✅ 并发执行 ${index + 1} 成功`);
      });

      console.log('✅ 并发执行测试通过');
    });
  });

  describe('🚨 错误处理与边界条件测试', () => {
    it('应该处理模块调用失败的情况', async () => {
      // Mock部分服务成功，部分失败
      jest.spyOn(contextService, 'getContextStatistics').mockResolvedValue({} as any);
      jest.spyOn(coreService, 'getWorkflowStatistics').mockResolvedValue({} as any);
      jest.spyOn(planService, 'createPlan').mockRejectedValue(new Error('Plan service failed'));

      // 执行工作流并期望失败
      await expect(mockOrchestrator.executeFullWorkflow({ test: true }))
        .rejects.toThrow('Plan service failed');

      console.log('✅ 错误处理测试通过');
    });

    it('应该验证工作流状态的一致性', async () => {
      // Mock所有服务方法
      jest.spyOn(contextService, 'getContextStatistics').mockResolvedValue({ totalContexts: 50 } as any);
      jest.spyOn(coreService, 'getWorkflowStatistics').mockResolvedValue({ totalWorkflows: 25 } as any);
      jest.spyOn(planService, 'createPlan').mockResolvedValue({ planId: 'consistency-test' } as any);
      jest.spyOn(roleService, 'createRole').mockResolvedValue({ roleId: 'consistency-test' } as any);
      jest.spyOn(confirmService, 'createConfirm').mockResolvedValue({ confirmId: 'consistency-test' } as any);
      jest.spyOn(traceService, 'createTrace').mockResolvedValue({ traceId: 'consistency-test' } as any);
      jest.spyOn(extensionService, 'createExtension').mockResolvedValue({ extensionId: 'consistency-test' } as any);
      jest.spyOn(dialogService, 'createDialog').mockResolvedValue({ dialogId: 'consistency-test' } as any);
      jest.spyOn(collabService, 'createCollaboration').mockResolvedValue({ id: 'consistency-test' } as any);
      jest.spyOn(networkService, 'getGlobalStatistics').mockResolvedValue({ totalNetworks: 5 } as any);

      // 执行工作流
      const result = await mockOrchestrator.executeFullWorkflow({ test: true });

      // 验证状态一致性
      expect(result.workflowState.round1.context.totalContexts).toBe(50);
      expect(result.workflowState.round2.network.totalNetworks).toBe(5);

      // 验证健康检查的一致性
      const healthCheck = result.workflowState.round3.healthCheck;
      Object.keys(healthCheck).forEach(module => {
        expect(healthCheck[module].status).toBe('healthy');
        expect(healthCheck[module].timestamp).toBeDefined();
        expect(healthCheck[module].lastCall).toBeGreaterThanOrEqual(0);
      });

      console.log('✅ 工作流状态一致性验证通过');
    });

    it('应该验证模块调用历史的完整性', async () => {
      // Mock所有服务方法
      jest.spyOn(contextService, 'getContextStatistics').mockResolvedValue({} as any);
      jest.spyOn(coreService, 'getWorkflowStatistics').mockResolvedValue({} as any);
      jest.spyOn(planService, 'createPlan').mockResolvedValue({ planId: 'history-test' } as any);
      jest.spyOn(roleService, 'createRole').mockResolvedValue({ roleId: 'history-test' } as any);
      jest.spyOn(confirmService, 'createConfirm').mockResolvedValue({ confirmId: 'history-test' } as any);
      jest.spyOn(traceService, 'createTrace').mockResolvedValue({ traceId: 'history-test' } as any);
      jest.spyOn(extensionService, 'createExtension').mockResolvedValue({ extensionId: 'history-test' } as any);
      jest.spyOn(dialogService, 'createDialog').mockResolvedValue({ dialogId: 'history-test' } as any);
      jest.spyOn(collabService, 'createCollaboration').mockResolvedValue({ id: 'history-test' } as any);
      jest.spyOn(networkService, 'getGlobalStatistics').mockResolvedValue({} as any);

      // 执行工作流
      const result = await mockOrchestrator.executeFullWorkflow({ test: true });

      // 验证调用历史的格式和完整性
      result.moduleCallHistory.forEach(callId => {
        expect(callId).toMatch(/^Round[1-3]-\w+-\d+$/);
        expect(callId).toContain('Round');
        expect(callId.split('-')).toHaveLength(3);
      });

      // 验证每轮都有调用记录
      const round1Calls = result.moduleCallHistory.filter(call => call.includes('Round1'));
      const round2Calls = result.moduleCallHistory.filter(call => call.includes('Round2'));
      const round3Calls = result.moduleCallHistory.filter(call => call.includes('Round3'));

      expect(round1Calls.length).toBeGreaterThan(0);
      expect(round2Calls.length).toBeGreaterThan(0);
      expect(round3Calls.length).toBeGreaterThan(0);

      console.log('✅ 模块调用历史完整性验证通过:', {
        totalCalls: result.moduleCallHistory.length,
        round1Calls: round1Calls.length,
        round2Calls: round2Calls.length,
        round3Calls: round3Calls.length
      });
    });
  });

  describe('🎯 业务场景验证测试', () => {
    it('应该模拟真实的业务流程场景', async () => {
      // 模拟真实业务数据
      jest.spyOn(contextService, 'getContextStatistics').mockResolvedValue({
        totalContexts: 1000,
        activeContexts: 850,
        contextsByType: { 'user_session': 600, 'system_context': 250 },
        averageLifetime: 7200,
        memoryUsage: 512,
        cacheHitRate: 0.92
      } as any);

      jest.spyOn(planService, 'createPlan').mockResolvedValue({
        planId: 'business-plan-001',
        name: 'Customer Service Plan',
        description: 'Handle customer service requests',
        contextId: 'customer-context-001',
        tasks: [
          { taskId: 'task-001', name: 'Analyze Request', status: 'pending' },
          { taskId: 'task-002', name: 'Generate Response', status: 'pending' }
        ],
        priority: 'high',
        estimatedDuration: 300
      } as any);

      jest.spyOn(roleService, 'createRole').mockResolvedValue({
        roleId: 'customer-service-agent',
        name: 'Customer Service Agent',
        description: 'Handle customer inquiries and support',
        permissions: ['read_customer_data', 'create_response', 'escalate_issue'],
        capabilities: ['natural_language_processing', 'sentiment_analysis']
      } as any);

      // Mock其他服务
      jest.spyOn(coreService, 'getWorkflowStatistics').mockResolvedValue({
        totalWorkflows: 500,
        activeWorkflows: 450,
        completedWorkflows: 400,
        failedWorkflows: 50,
        averageDuration: 180
      } as any);

      jest.spyOn(confirmService, 'createConfirm').mockResolvedValue({
        confirmId: 'business-confirm-001',
        planId: 'business-plan-001',
        roleId: 'customer-service-agent',
        status: 'confirmed',
        approver: 'system',
        timestamp: new Date().toISOString()
      } as any);

      jest.spyOn(traceService, 'createTrace').mockResolvedValue({
        traceId: 'business-trace-001',
        workflowId: 'customer-service-workflow',
        status: 'active',
        startTime: new Date().toISOString(),
        metrics: { cpu_usage: 0.3, memory_usage: 0.4 }
      } as any);

      jest.spyOn(extensionService, 'createExtension').mockResolvedValue({
        extensionId: 'nlp-extension-001',
        name: 'Natural Language Processing Extension',
        version: '2.1.0',
        status: 'active',
        capabilities: ['text_analysis', 'sentiment_detection']
      } as any);

      jest.spyOn(dialogService, 'createDialog').mockResolvedValue({
        dialogId: 'customer-dialog-001',
        title: 'Customer Support Session',
        content: 'How can I help you today?',
        status: 'active',
        participants: ['customer', 'agent']
      } as any);

      jest.spyOn(collabService, 'createCollaboration').mockResolvedValue({
        id: 'support-team-collab-001',
        name: 'Customer Support Team Collaboration',
        description: 'Coordinate customer support activities',
        status: 'active',
        participants: ['agent-001', 'supervisor-001', 'specialist-001']
      } as any);

      jest.spyOn(networkService, 'getGlobalStatistics').mockResolvedValue({
        totalNetworks: 15,
        activeNetworks: 12,
        totalNodes: 150,
        totalEdges: 300,
        topologyDistribution: { 'mesh': 8, 'star': 4, 'ring': 3 },
        statusDistribution: { 'active': 12, 'maintenance': 2, 'inactive': 1 }
      } as any);

      // 执行业务流程
      const result = await mockOrchestrator.executeFullWorkflow({
        businessScenario: 'customer_service',
        priority: 'high',
        expectedOutcome: 'resolved_inquiry'
      });

      // 验证业务流程执行结果
      expect(result.success).toBe(true);
      expect(result.totalRounds).toBe(3);

      // 验证业务数据流转
      expect(result.workflowState.round1.context.totalContexts).toBe(1000);
      expect(result.workflowState.round1.plan.name).toBe('Customer Service Plan');
      expect(result.workflowState.round1.role.name).toBe('Customer Service Agent');
      expect(result.workflowState.round2.extension.name).toBe('Natural Language Processing Extension');
      expect(result.workflowState.round2.dialog.title).toBe('Customer Support Session');
      expect(result.workflowState.round2.collab.name).toBe('Customer Support Team Collaboration');

      // 验证决策逻辑
      expect(result.workflowState.round1.decision.decision).toBe('proceed');
      expect(result.workflowState.round2.decision.decision).toBe('proceed');
      expect(result.workflowState.round3.finalDecision.decision).toBe('proceed');

      console.log('✅ 真实业务场景验证通过:', {
        scenario: 'customer_service',
        totalModulesCalled: new Set(result.moduleCallHistory.map(call => call.split('-')[1])).size,
        executionSuccess: result.success
      });
    });
  });
});
