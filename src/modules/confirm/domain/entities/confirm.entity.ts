/**
 * 企业级审批和决策协调领域实体
 *
 * L2协调层的企业级审批专业化组件核心实体
 * 封装5种approval_workflow类型的企业级审批业务逻辑和不变性约束
 * 严格遵循双重命名约定：TypeScript层使用camelCase
 *
 * @version 2.0.0
 * @created 2025-08-18
 * @updated 2025-08-18 - TDD重构完成
 */

import { UUID } from '../../../../public/shared/types';
import { Logger } from '../../../../public/utils/logger';
import { ConfirmEntityData, ConfirmMapper, ConfirmSchema } from '../../api/mappers/confirm.mapper';
import { ConfirmStatus, Priority, ConfirmMetadata } from '../../types';

/**
 * 企业级审批和决策协调领域实体
 *
 * 基于ConfirmEntityData的领域实体包装器
 * 提供企业级审批业务逻辑和不变性约束
 */
export class Confirm {
  private readonly data: ConfirmEntityData;
  private readonly logger: Logger;

  constructor(data: ConfirmEntityData) {
    this.data = { ...data };
    this.logger = new Logger('ConfirmEntity');
    this.validateInvariants();
  }

  /**
   * 验证领域不变性约束 (企业级增强版)
   */
  private validateInvariants(): void {
    // 基础字段验证
    this.validateRequiredFields();

    // 业务规则验证
    this.validateBusinessRules();

    // 审批工作流验证
    this.validateApprovalWorkflow();

    // 风险评估验证
    this.validateRiskAssessment();

    // 合规检查验证
    this.validateComplianceRequirements();
  }

  /**
   * 验证必需字段
   */
  private validateRequiredFields(): void {
    if (!this.data.confirmId) {
      throw new Error('确认ID是必需的');
    }
    if (!this.data.contextId) {
      throw new Error('上下文ID是必需的');
    }
    if (!this.data.confirmationType) {
      throw new Error('确认类型是必需的');
    }
    if (!this.data.status) {
      throw new Error('状态是必需的');
    }
    if (!this.data.priority) {
      throw new Error('优先级是必需的');
    }
    if (!this.data.subject) {
      throw new Error('主题是必需的');
    }
    if (!this.data.requester) {
      throw new Error('请求者是必需的');
    }
    if (!this.data.approvalWorkflow) {
      throw new Error('审批工作流是必需的');
    }
  }

  /**
   * 验证业务规则
   */
  private validateBusinessRules(): void {
    // 验证确认主题
    if (!this.data.subject.title || this.data.subject.title.trim().length === 0) {
      throw new Error('确认主题标题不能为空');
    }
    if (this.data.subject.title.length > 200) {
      throw new Error('确认主题标题不能超过200个字符');
    }

    // 验证描述长度
    if (!this.data.subject.description || this.data.subject.description.trim().length === 0) {
      throw new Error('确认描述不能为空');
    }
    if (this.data.subject.description.length > 2000) {
      throw new Error('确认描述不能超过2000个字符');
    }

    // 验证请求者信息
    if (!this.data.requester.userId || this.data.requester.userId.trim().length === 0) {
      throw new Error('请求者用户ID不能为空');
    }
    if (!this.data.requester.name || this.data.requester.name.trim().length === 0) {
      throw new Error('请求者姓名不能为空');
    }
    if (!this.data.requester.email || !this.isValidEmail(this.data.requester.email)) {
      throw new Error('请求者邮箱格式无效');
    }

    // 验证时间逻辑
    if (this.data.expiresAt && this.data.expiresAt <= this.data.createdAt) {
      throw new Error('过期时间必须晚于创建时间');
    }
    if (this.data.updatedAt < this.data.createdAt) {
      throw new Error('更新时间不能早于创建时间');
    }
  }

  /**
   * 验证审批工作流
   */
  private validateApprovalWorkflow(): void {
    const workflow = this.data.approvalWorkflow;

    // 验证工作流步骤
    if (!workflow.steps || workflow.steps.length === 0) {
      throw new Error('审批工作流必须包含至少一个步骤');
    }

    // 验证步骤顺序
    const stepOrders = workflow.steps.map(step => step.stepOrder || 0);
    const uniqueOrders = new Set(stepOrders);
    if (uniqueOrders.size !== stepOrders.length) {
      throw new Error('审批步骤顺序不能重复');
    }

    // 验证每个步骤
    workflow.steps.forEach((step, index) => {
      if (!step.stepId || step.stepId.trim().length === 0) {
        throw new Error(`第${index + 1}个审批步骤缺少步骤ID`);
      }
      if (!step.name || step.name.trim().length === 0) {
        throw new Error(`第${index + 1}个审批步骤缺少步骤名称`);
      }

      // 验证审批者
      if (!step.approvers || step.approvers.length === 0) {
        throw new Error(`第${index + 1}个审批步骤必须包含至少一个审批者`);
      }

      step.approvers.forEach((approver, approverIndex) => {
        if (!approver.approverId || approver.approverId.trim().length === 0) {
          throw new Error(`第${index + 1}个步骤的第${approverIndex + 1}个审批者缺少ID`);
        }
        if (!approver.name || approver.name.trim().length === 0) {
          throw new Error(`第${index + 1}个步骤的第${approverIndex + 1}个审批者缺少姓名`);
        }
        if (!approver.email || !this.isValidEmail(approver.email)) {
          throw new Error(`第${index + 1}个步骤的第${approverIndex + 1}个审批者邮箱格式无效`);
        }
      });
    });

    // 注意：ApprovalWorkflow接口中没有currentStepIndex字段
    // 如果需要跟踪当前步骤，应该通过步骤状态来判断
  }

  /**
   * 验证风险评估
   */
  private validateRiskAssessment(): void {
    if (!this.data.subject.impactAssessment) {
      throw new Error('影响评估信息是必需的');
    }

    const impact = this.data.subject.impactAssessment;

    // 验证业务影响
    if (!impact.businessImpact || impact.businessImpact.trim().length === 0) {
      throw new Error('业务影响描述不能为空');
    }
    if (impact.businessImpact.length > 1000) {
      throw new Error('业务影响描述不能超过1000个字符');
    }

    // 验证技术影响
    if (!impact.technicalImpact || impact.technicalImpact.trim().length === 0) {
      throw new Error('技术影响描述不能为空');
    }
    if (impact.technicalImpact.length > 1000) {
      throw new Error('技术影响描述不能超过1000个字符');
    }

    // 验证风险级别
    const validRiskLevels = ['low', 'medium', 'high', 'critical'];
    if (!validRiskLevels.includes(impact.riskLevel)) {
      throw new Error(`风险级别必须是以下之一: ${validRiskLevels.join(', ')}`);
    }

    // 验证影响范围
    if (!impact.impactScope || impact.impactScope.length === 0) {
      throw new Error('影响范围不能为空');
    }

    // 验证预估成本（如果提供）
    if (impact.estimatedCost !== undefined && impact.estimatedCost < 0) {
      throw new Error('预估成本不能为负数');
    }
  }

  /**
   * 验证合规要求
   */
  private validateComplianceRequirements(): void {
    // 基础合规验证
    if (this.data.priority === Priority.URGENT || this.data.priority === Priority.HIGH) {
      // 高优先级确认需要更严格的验证
      if (!this.data.subject.impactAssessment) {
        throw new Error('高优先级确认必须包含影响评估');
      }

      // 确保有足够的审批者
      const totalApprovers = this.data.approvalWorkflow.steps.reduce(
        (total, step) => total + (step.approvers?.length || 0), 0
      );
      if (totalApprovers < 2) {
        throw new Error('高优先级确认至少需要2个审批者');
      }
    }

    // 验证审批工作流类型的合规性
    if (this.data.approvalWorkflow.workflowType) {
      const validWorkflowTypes = ['sequential', 'parallel', 'consensus'];
      if (!validWorkflowTypes.includes(this.data.approvalWorkflow.workflowType)) {
        throw new Error(`工作流类型必须是以下之一: ${validWorkflowTypes.join(', ')}`);
      }
    }

    // 验证超时配置的合规性
    if (this.data.expiresAt) {
      const now = new Date();
      const maxExpirationDays = this.getMaxExpirationDays();
      const maxExpirationTime = new Date(now.getTime() + maxExpirationDays * 24 * 60 * 60 * 1000);

      if (this.data.expiresAt > maxExpirationTime) {
        throw new Error(`确认过期时间不能超过${maxExpirationDays}天`);
      }
    }
  }

  /**
   * 验证邮箱格式
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * 获取最大过期天数（基于优先级）
   */
  private getMaxExpirationDays(): number {
    switch (this.data.priority) {
      case Priority.URGENT:
        return 1; // 1天
      case Priority.HIGH:
        return 3; // 3天
      case Priority.MEDIUM:
        return 7; // 7天
      case Priority.LOW:
        return 30; // 30天
      default:
        return 7; // 默认7天
    }
  }

  // ===== 访问器方法 (Getters) =====

  get confirmId(): UUID {
    return this.data.confirmId;
  }

  get contextId(): UUID {
    return this.data.contextId;
  }

  get planId(): UUID | undefined {
    return this.data.planId;
  }

  get protocolVersion(): string {
    return this.data.protocolVersion;
  }

  get timestamp(): Date {
    return this.data.timestamp;
  }

  get metadata(): ConfirmMetadata | undefined {
    return this.data.metadata;
  }

  get confirmationType(): string {
    return this.data.confirmationType;
  }

  get status(): string {
    return this.data.status;
  }

  get priority(): string {
    return this.data.priority;
  }

  get subject(): ConfirmEntityData['subject'] {
    return this.data.subject;
  }

  get requester(): ConfirmEntityData['requester'] {
    return this.data.requester;
  }

  get approvalWorkflow(): ConfirmEntityData['approvalWorkflow'] {
    return this.data.approvalWorkflow;
  }

  get createdAt(): Date {
    return this.data.createdAt;
  }

  get updatedAt(): Date {
    return this.data.updatedAt;
  }

  get expiresAt(): Date | undefined {
    return this.data.expiresAt;
  }

  get decision(): ConfirmEntityData['decision'] {
    return this.data.decision;
  }

  // ===== 业务逻辑方法 =====

  /**
   * 更新确认状态
   */
  updateStatus(newStatus: string, comments?: string, approverId?: string): void {
    const oldStatus = this.data.status;

    // 验证状态值是否有效
    if (!Object.values(ConfirmStatus).includes(newStatus as ConfirmStatus)) {
      throw new Error(`无效的状态: ${newStatus}。有效状态包括: ${Object.values(ConfirmStatus).join(', ')}`);
    }

    // 验证状态转换是否符合业务规则
    this.validateStatusTransition(oldStatus, newStatus as ConfirmStatus);

    this.data.status = newStatus as ConfirmStatus;
    this.data.updatedAt = new Date();

    // TODO: 审计记录功能将在未来版本中实现
    // 当前版本专注于核心确认功能
    this.logger.info(`Confirm ${this.data.confirmId} status updated from ${oldStatus} to ${newStatus}`, {
      oldStatus,
      newStatus,
      comments,
      approverId: approverId || 'system'
    });
  }

  /**
   * 验证状态转换是否符合业务规则
   */
  private validateStatusTransition(fromStatus: ConfirmStatus, toStatus: ConfirmStatus): void {
    const validTransitions: Record<ConfirmStatus, ConfirmStatus[]> = {
      [ConfirmStatus.PENDING]: [ConfirmStatus.IN_REVIEW, ConfirmStatus.CANCELLED],
      [ConfirmStatus.IN_REVIEW]: [ConfirmStatus.APPROVED, ConfirmStatus.REJECTED, ConfirmStatus.CANCELLED],
      [ConfirmStatus.APPROVED]: [ConfirmStatus.CANCELLED], // 已批准的可以取消
      [ConfirmStatus.REJECTED]: [ConfirmStatus.CANCELLED], // 已拒绝的可以取消
      [ConfirmStatus.CANCELLED]: [], // 已取消的不能再转换
      [ConfirmStatus.EXPIRED]: [], // 已过期的不能再转换
    };

    const allowedTransitions = validTransitions[fromStatus] || [];
    if (!allowedTransitions.includes(toStatus)) {
      throw new Error(`无效的状态转换: 不能从 ${fromStatus} 转换到 ${toStatus}`);
    }
  }

  /**
   * 取消确认
   */
  cancel(reason?: string, cancelledBy?: string): void {
    if (this.data.status === ConfirmStatus.CANCELLED) {
      throw new Error('确认已经被取消');
    }

    if (this.data.status === ConfirmStatus.APPROVED || this.data.status === ConfirmStatus.REJECTED) {
      throw new Error('已完成的确认不能被取消');
    }

    this.data.status = ConfirmStatus.CANCELLED;
    this.data.updatedAt = new Date();

    this.logger.info(`Confirm ${this.data.confirmId} cancelled`, {
      reason: reason || 'No reason provided',
      cancelledBy: cancelledBy || 'system'
    });
  }

  /**
   * 设置决策
   */
  setDecision(decision: ConfirmEntityData['decision']): void {
    // 验证状态是否允许设置决策
    if (this.data.status !== ConfirmStatus.IN_REVIEW) {
      throw new Error(`只有审核中的确认才能设置决策，当前状态: ${this.data.status}`);
    }

    // 验证决策数据
    if (!decision) {
      throw new Error('决策数据不能为空');
    }

    if (!decision.decisionId || !decision.type || !decision.approverId) {
      throw new Error('决策必须包含决策ID、类型和审批者ID');
    }

    this.data.decision = decision;
    this.data.updatedAt = new Date();

    // 根据决策类型更新状态
    if (decision.type === 'approve') {
      this.data.status = ConfirmStatus.APPROVED;
    } else if (decision.type === 'reject') {
      this.data.status = ConfirmStatus.REJECTED;
    }

    this.logger.info(`Decision set for confirm ${this.data.confirmId}`, {
      decisionType: decision.type,
      approverId: decision.approverId,
      comment: decision.comment
    });
  }

  /**
   * 检查是否已过期
   */
  isExpired(): boolean {
    if (!this.data.expiresAt) {
      return false;
    }
    return new Date() > this.data.expiresAt;
  }

  /**
   * 检查是否可以审批
   */
  canApprove(): boolean {
    return this.data.status === 'pending' && !this.isExpired();
  }

  /**
   * 检查是否可以取消
   */
  canCancel(): boolean {
    // 只有待审批和审核中的确认可以取消
    return this.data.status === ConfirmStatus.PENDING || this.data.status === ConfirmStatus.IN_REVIEW;
  }

  /**
   * 获取当前审批步骤
   */
  getCurrentApprovalStep(): ConfirmEntityData['approvalWorkflow']['steps'][0] | undefined {
    // TODO: currentStep属性将在未来版本中添加到ApprovalWorkflow接口
    // 当前返回第一个pending状态的步骤
    return this.data.approvalWorkflow.steps.find(step => step.status === 'pending');
  }

  /**
   * 检查是否需要升级
   */
  needsEscalation(): boolean {
    // TODO: escalationRules将在未来版本中添加到ApprovalWorkflow接口
    // 当前基于步骤级别的escalationRules进行检查
    const currentStep = this.getCurrentApprovalStep();
    if (!currentStep?.escalationRules?.enabled) {
      return false;
    }

    // 基于步骤的超时检查（使用timeoutHours）
    if (!currentStep.timeoutHours) {
      return false;
    }

    const stepStartTime = currentStep.startedAt ? new Date(currentStep.startedAt) : this.data.createdAt;
    const timeoutMs = currentStep.timeoutHours * 60 * 60 * 1000;
    return new Date().getTime() - stepStartTime.getTime() > timeoutMs;
  }

  /**
   * 获取风险级别
   */
  getRiskLevel(): string {
    // 从subject.impactAssessment.riskLevel获取风险级别
    return this.data.subject.impactAssessment.riskLevel || 'low';
  }



  /**
   * 转换为数据对象
   */
  toData(): ConfirmEntityData {
    return { ...this.data };
  }

  /**
   * 转换为Schema格式 (camelCase → snake_case)
   */
  toSchema(): ConfirmSchema {
    return ConfirmMapper.toSchema(this.data);
  }

  /**
   * 转换为协议格式（用于API响应）
   */
  toProtocol(): Record<string, unknown> {
    return {
      confirmId: this.data.confirmId,
      contextId: this.data.contextId,
      planId: this.data.planId,
      protocolVersion: this.data.protocolVersion,
      confirmationType: this.data.confirmationType,
      status: this.data.status,
      priority: this.data.priority,
      subject: this.data.subject,
      requester: this.data.requester,
      approvalWorkflow: this.data.approvalWorkflow,
      createdAt: this.data.createdAt.toISOString(),
      updatedAt: this.data.updatedAt.toISOString(),
      expiresAt: this.data.expiresAt?.toISOString(),
      riskLevel: this.getRiskLevel(),
      canApprove: this.canApprove(),
      isExpired: this.isExpired(),
      needsEscalation: this.needsEscalation(),
    };
  }

  /**
   * 创建实体的副本
   */
  clone(): Confirm {
    return new Confirm(this.toData());
  }

  /**
   * 从Schema格式创建实体 (snake_case → camelCase)
   */
  static fromSchema(schema: ConfirmSchema): Confirm {
    const entityData = ConfirmMapper.fromSchema(schema);
    return new Confirm(entityData);
  }

  /**
   * 批量从Schema格式创建实体数组
   */
  static fromSchemaArray(schemas: ConfirmSchema[]): Confirm[] {
    return schemas.map(schema => this.fromSchema(schema));
  }

  // ===== 企业级功能方法 =====

  /**
   * 高级审批工作流方法：智能路由审批
   */
  intelligentApprovalRouting(): {
    recommendedApprovers: string[];
    estimatedCompletionTime: number;
    riskMitigationSteps: string[];
  } {
    const riskLevel = this.getRiskLevel();
    const priority = this.data.priority;

    // 基于风险级别和优先级推荐审批者
    const recommendedApprovers: string[] = [];
    let estimatedCompletionTime = 24; // 默认24小时
    const riskMitigationSteps: string[] = [];

    // 高风险或紧急优先级需要更多审批者
    if (riskLevel === 'high' || riskLevel === 'critical' || priority === Priority.URGENT) {
      recommendedApprovers.push('senior-manager', 'security-officer', 'compliance-officer');
      estimatedCompletionTime = 4; // 4小时
      riskMitigationSteps.push('立即通知相关利益相关者', '准备回滚计划', '设置监控告警');
    } else if (riskLevel === 'medium' || priority === Priority.HIGH) {
      recommendedApprovers.push('team-lead', 'senior-developer');
      estimatedCompletionTime = 12; // 12小时
      riskMitigationSteps.push('验证测试覆盖率', '准备监控方案');
    } else {
      recommendedApprovers.push('peer-reviewer');
      estimatedCompletionTime = 48; // 48小时
      riskMitigationSteps.push('标准代码审查');
    }

    return {
      recommendedApprovers,
      estimatedCompletionTime,
      riskMitigationSteps
    };
  }

  /**
   * 风险控制和缓解功能
   */
  performRiskMitigation(): {
    mitigationActions: string[];
    monitoringRequirements: string[];
    rollbackPlan: string;
  } {
    const riskLevel = this.getRiskLevel();

    const mitigationActions: string[] = [];
    const monitoringRequirements: string[] = [];
    let rollbackPlan = '标准回滚流程';

    // 基于风险级别制定缓解措施
    switch (riskLevel) {
      case 'critical':
        mitigationActions.push(
          '实施蓝绿部署',
          '设置实时监控',
          '准备热修复方案',
          '通知所有利益相关者'
        );
        monitoringRequirements.push(
          '实时性能监控',
          '错误率监控',
          '用户体验监控',
          '业务指标监控'
        );
        rollbackPlan = '立即回滚机制，5分钟内完成';
        break;

      case 'high':
        mitigationActions.push(
          '分阶段部署',
          '增强监控',
          '准备快速响应团队'
        );
        monitoringRequirements.push(
          '性能监控',
          '错误监控',
          '关键业务指标监控'
        );
        rollbackPlan = '快速回滚机制，15分钟内完成';
        break;

      case 'medium':
        mitigationActions.push(
          '标准部署流程',
          '基础监控',
          '准备支持团队'
        );
        monitoringRequirements.push(
          '基础性能监控',
          '错误日志监控'
        );
        rollbackPlan = '标准回滚流程，30分钟内完成';
        break;

      default: // low
        mitigationActions.push('标准部署流程');
        monitoringRequirements.push('基础监控');
        rollbackPlan = '标准回滚流程，1小时内完成';
    }

    return {
      mitigationActions,
      monitoringRequirements,
      rollbackPlan
    };
  }

  /**
   * 性能监控和分析方法
   */
  performanceAnalysis(): {
    approvalTimeMetrics: {
      averageApprovalTime: number;
      bottleneckSteps: string[];
      efficiencyScore: number;
    };
    workflowOptimization: {
      suggestedImprovements: string[];
      automationOpportunities: string[];
    };
  } {
    const workflow = this.data.approvalWorkflow;
    const createdTime = this.data.createdAt.getTime();
    const currentTime = new Date().getTime();
    const elapsedHours = (currentTime - createdTime) / (1000 * 60 * 60);

    // 计算平均审批时间
    const averageApprovalTime = elapsedHours;

    // 识别瓶颈步骤
    const bottleneckSteps: string[] = [];
    workflow.steps.forEach(step => {
      if (step.status === 'pending' && step.timeoutHours && step.startedAt) {
        const startTime = new Date(step.startedAt).getTime();
        const timeoutTime = startTime + (step.timeoutHours * 60 * 60 * 1000);
        if (currentTime > timeoutTime) {
          bottleneckSteps.push(step.name);
        }
      }
    });

    // 计算效率分数（基于预期时间vs实际时间）
    const expectedTime = this.getExpectedApprovalTime();
    const efficiencyScore = Math.max(0, Math.min(100, (expectedTime / elapsedHours) * 100));

    // 建议改进措施
    const suggestedImprovements: string[] = [];
    const automationOpportunities: string[] = [];

    if (efficiencyScore < 70) {
      suggestedImprovements.push('简化审批流程', '增加并行审批', '设置更合理的截止时间');
    }

    if (workflow.steps.length > 3) {
      automationOpportunities.push('自动化低风险审批', '智能路由', '预审批规则');
    }

    if (this.getRiskLevel() === 'low') {
      automationOpportunities.push('完全自动化审批');
    }

    return {
      approvalTimeMetrics: {
        averageApprovalTime,
        bottleneckSteps,
        efficiencyScore
      },
      workflowOptimization: {
        suggestedImprovements,
        automationOpportunities
      }
    };
  }

  /**
   * 审批策略优化功能
   */
  optimizeApprovalStrategy(): {
    optimizedWorkflow: {
      recommendedSteps: number;
      parallelizableSteps: string[];
      automationCandidates: string[];
    };
    costBenefitAnalysis: {
      currentCost: number;
      optimizedCost: number;
      timeSavings: number;
    };
  } {
    const currentSteps = this.data.approvalWorkflow.steps.length;
    const riskLevel = this.getRiskLevel();
    const priority = this.data.priority;

    // 推荐步骤数量
    let recommendedSteps = currentSteps;
    if (riskLevel === 'low' && priority === Priority.LOW) {
      recommendedSteps = Math.max(1, currentSteps - 1);
    } else if (riskLevel === 'high' || priority === Priority.URGENT) {
      recommendedSteps = Math.min(currentSteps + 1, 5);
    }

    // 识别可并行化的步骤
    const parallelizableSteps: string[] = [];
    this.data.approvalWorkflow.steps.forEach(step => {
      if (step.approvers && step.approvers.length > 1) {
        parallelizableSteps.push(step.name);
      }
    });

    // 识别自动化候选
    const automationCandidates: string[] = [];
    if (riskLevel === 'low') {
      automationCandidates.push('初步审查', '格式验证', '合规检查');
    }

    // 成本效益分析
    const currentCost = currentSteps * 2; // 假设每步骤2小时成本
    const optimizedCost = recommendedSteps * 1.5; // 优化后每步骤1.5小时
    const timeSavings = Math.max(0, currentCost - optimizedCost);

    return {
      optimizedWorkflow: {
        recommendedSteps,
        parallelizableSteps,
        automationCandidates
      },
      costBenefitAnalysis: {
        currentCost,
        optimizedCost,
        timeSavings
      }
    };
  }

  /**
   * 获取预期审批时间（小时）
   */
  private getExpectedApprovalTime(): number {
    const riskLevel = this.getRiskLevel();
    const priority = this.data.priority;

    // 基于风险级别和优先级计算预期时间
    let baseTime = 24; // 默认24小时

    if (priority === Priority.URGENT) {
      baseTime = 4;
    } else if (priority === Priority.HIGH) {
      baseTime = 12;
    } else if (priority === Priority.LOW) {
      baseTime = 72;
    }

    // 风险级别调整
    if (riskLevel === 'critical') {
      baseTime *= 0.5; // 缩短时间
    } else if (riskLevel === 'high') {
      baseTime *= 0.75;
    } else if (riskLevel === 'low') {
      baseTime *= 1.5; // 延长时间
    }

    return baseTime;
  }
}
