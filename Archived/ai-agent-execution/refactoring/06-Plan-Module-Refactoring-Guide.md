# Plan模块重构指南

## 🎯 **重构目标和策略**

### **当前问题分析**
```markdown
❌ 核心问题：
- AI算法违反L1-L3协议层边界，包含了属于L4应用层的AI决策逻辑
- 协议层和应用层职责混淆，导致架构边界模糊
- AI算法与协议逻辑耦合，难以独立演进和优化
- 不同AI算法的切换和版本管理困难

🔍 影响分析：
- 违反了MPLP"协议框架"的核心定位
- 导致其他模块也可能违反协议边界
- AI决策逻辑的变更影响协议稳定性
- 无法支持多种AI算法的灵活集成
```

### **重构策略**
```markdown
🎯 重构目标：AI算法外置，协议边界重新定义

重构原则：
✅ 协议边界清晰：L1-L3只提供协议接口，不包含AI算法
✅ AI算法外置：将AI决策逻辑移至L4应用层或外部服务
✅ 接口标准化：提供标准的AI服务调用接口
✅ 版本管理：支持AI算法的版本管理和动态切换

预期效果：
- 协议边界清晰化100%
- AI算法可插拔性提升
- 模块间依赖简化50%
- 架构一致性大幅提升
```

## 🏗️ **新架构设计**

### **协议层职责重新定义**
```markdown
✅ L1-L3协议层职责（Plan模块）：
- 提供规划协议接口和路由机制
- 定义规划请求/响应格式和验证
- 管理AI服务的调用和集成
- 提供规划结果的标准化处理

❌ 不再包含的职责：
- 具体的AI规划算法实现
- AI模型的训练和推理逻辑
- 复杂的决策树和规则引擎
- 特定领域的规划策略

✅ L4应用层职责（外部AI服务）：
- 实现具体的AI规划算法
- 提供AI模型的训练和推理
- 实现复杂的决策逻辑
- 提供特定领域的规划策略
```

### **3个核心协议服务**

#### **1. PlanProtocolService - 规划协议管理**
```typescript
/**
 * 规划协议路由和管理服务
 * 职责：协议路由、请求验证、响应标准化
 */
export class PlanProtocolService {
  constructor(
    private readonly planRepository: IPlanRepository,
    private readonly aiServiceAdapter: IAIServiceAdapter,
    private readonly logger: ILogger
  ) {}

  // 创建规划请求
  async createPlanRequest(data: CreatePlanRequestData): Promise<PlanRequestEntity> {
    // 1. 验证请求数据
    const validatedData = await this.validatePlanRequest(data);
    
    // 2. 创建规划请求实体
    const planRequest = new PlanRequestEntity({
      requestId: this.generateRequestId(),
      ...validatedData,
      status: 'pending',
      createdAt: new Date()
    });
    
    // 3. 持久化请求
    const savedRequest = await this.planRepository.savePlanRequest(planRequest);
    
    return savedRequest;
  }

  // 执行规划
  async executePlan(requestId: string): Promise<PlanResultEntity> {
    // 1. 获取规划请求
    const planRequest = await this.planRepository.findPlanRequest(requestId);
    if (!planRequest) {
      throw new Error(`Plan request ${requestId} not found`);
    }

    // 2. 调用AI服务执行规划
    const aiResult = await this.aiServiceAdapter.executePlanning({
      requestId: planRequest.requestId,
      planType: planRequest.planType,
      parameters: planRequest.parameters,
      constraints: planRequest.constraints
    });

    // 3. 标准化AI服务响应
    const planResult = new PlanResultEntity({
      requestId: planRequest.requestId,
      resultId: this.generateResultId(),
      planData: aiResult.planData,
      confidence: aiResult.confidence,
      metadata: aiResult.metadata,
      status: 'completed',
      createdAt: new Date()
    });

    // 4. 持久化结果
    const savedResult = await this.planRepository.savePlanResult(planResult);
    
    // 5. 更新请求状态
    await this.updatePlanRequestStatus(requestId, 'completed');

    return savedResult;
  }

  // 获取规划结果
  async getPlanResult(requestId: string): Promise<PlanResultEntity | null> {
    return await this.planRepository.findPlanResult(requestId);
  }

  // 验证规划请求
  private async validatePlanRequest(data: CreatePlanRequestData): Promise<CreatePlanRequestData> {
    // 验证请求数据的完整性和正确性
    if (!data.planType) {
      throw new Error('Plan type is required');
    }
    
    if (!data.parameters || Object.keys(data.parameters).length === 0) {
      throw new Error('Plan parameters are required');
    }

    return data;
  }

  // 更新请求状态
  private async updatePlanRequestStatus(requestId: string, status: PlanStatus): Promise<void> {
    await this.planRepository.updatePlanRequestStatus(requestId, status);
  }

  private generateRequestId(): string {
    return `plan-req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateResultId(): string {
    return `plan-res-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
```

#### **2. PlanIntegrationService - 集成接口服务**
```typescript
/**
 * 与其他模块的集成接口服务
 * 职责：跨模块协调、预留接口管理、数据同步
 */
export class PlanIntegrationService {
  constructor(
    private readonly planRepository: IPlanRepository,
    private readonly coordinationManager: CoordinationManager
  ) {}

  // MPLP模块预留接口（等待CoreOrchestrator激活）
  async integrateWithContext(_contextId: string, _planData: any): Promise<IntegrationResult> {
    // TODO: 等待CoreOrchestrator激活Context模块集成
    return {
      success: true,
      message: 'Context integration interface reserved',
      data: {}
    };
  }

  async integrateWithRole(_roleId: string, _planData: any): Promise<IntegrationResult> {
    // TODO: 等待CoreOrchestrator激活Role模块集成
    return {
      success: true,
      message: 'Role integration interface reserved',
      data: {}
    };
  }

  async integrateWithNetwork(_networkId: string, _planData: any): Promise<IntegrationResult> {
    // TODO: 等待CoreOrchestrator激活Network模块集成
    return {
      success: true,
      message: 'Network integration interface reserved',
      data: {}
    };
  }

  async integrateWithTrace(_traceId: string, _planData: any): Promise<IntegrationResult> {
    // TODO: 等待CoreOrchestrator激活Trace模块集成
    return {
      success: true,
      message: 'Trace integration interface reserved',
      data: {}
    };
  }

  async integrateWithConfirm(_confirmId: string, _planData: any): Promise<IntegrationResult> {
    // TODO: 等待CoreOrchestrator激活Confirm模块集成
    return {
      success: true,
      message: 'Confirm integration interface reserved',
      data: {}
    };
  }

  async integrateWithExtension(_extensionId: string, _planData: any): Promise<IntegrationResult> {
    // TODO: 等待CoreOrchestrator激活Extension模块集成
    return {
      success: true,
      message: 'Extension integration interface reserved',
      data: {}
    };
  }

  async integrateWithDialog(_dialogId: string, _planData: any): Promise<IntegrationResult> {
    // TODO: 等待CoreOrchestrator激活Dialog模块集成
    return {
      success: true,
      message: 'Dialog integration interface reserved',
      data: {}
    };
  }

  async integrateWithCollab(_collabId: string, _planData: any): Promise<IntegrationResult> {
    // TODO: 等待CoreOrchestrator激活Collab模块集成
    return {
      success: true,
      message: 'Collab integration interface reserved',
      data: {}
    };
  }

  // 协调场景支持
  async supportCoordinationScenario(scenario: CoordinationScenario): Promise<CoordinationResult> {
    switch (scenario.type) {
      case 'multi_agent_planning':
        return await this.handleMultiAgentPlanning(scenario);
      case 'resource_allocation':
        return await this.handleResourceAllocation(scenario);
      case 'task_distribution':
        return await this.handleTaskDistribution(scenario);
      case 'conflict_resolution':
        return await this.handleConflictResolution(scenario);
      default:
        throw new Error(`Unsupported coordination scenario: ${scenario.type}`);
    }
  }

  private async handleMultiAgentPlanning(_scenario: CoordinationScenario): Promise<CoordinationResult> {
    // 多智能体规划协调
    return { success: true, data: {} };
  }

  private async handleResourceAllocation(_scenario: CoordinationScenario): Promise<CoordinationResult> {
    // 资源分配协调
    return { success: true, data: {} };
  }

  private async handleTaskDistribution(_scenario: CoordinationScenario): Promise<CoordinationResult> {
    // 任务分发协调
    return { success: true, data: {} };
  }

  private async handleConflictResolution(_scenario: CoordinationScenario): Promise<CoordinationResult> {
    // 冲突解决协调
    return { success: true, data: {} };
  }
}
```

#### **3. PlanValidationService - 规划验证服务**
```typescript
/**
 * 规划请求和结果验证服务
 * 职责：数据验证、结果校验、质量保证
 */
export class PlanValidationService {
  constructor(
    private readonly validationRules: IValidationRules,
    private readonly qualityChecker: IQualityChecker
  ) {}

  // 验证规划请求
  async validatePlanRequest(request: PlanRequestData): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // 1. 基本数据验证
    if (!request.planType) {
      errors.push({ field: 'planType', message: 'Plan type is required' });
    }

    if (!request.parameters) {
      errors.push({ field: 'parameters', message: 'Plan parameters are required' });
    }

    // 2. 业务规则验证
    const businessValidation = await this.validateBusinessRules(request);
    errors.push(...businessValidation.errors);
    warnings.push(...businessValidation.warnings);

    // 3. 约束条件验证
    const constraintValidation = await this.validateConstraints(request);
    errors.push(...constraintValidation.errors);
    warnings.push(...constraintValidation.warnings);

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // 验证规划结果
  async validatePlanResult(result: PlanResultData): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // 1. 结果完整性验证
    if (!result.planData) {
      errors.push({ field: 'planData', message: 'Plan data is required' });
    }

    if (result.confidence < 0 || result.confidence > 1) {
      errors.push({ field: 'confidence', message: 'Confidence must be between 0 and 1' });
    }

    // 2. 质量检查
    const qualityCheck = await this.qualityChecker.checkPlanQuality(result);
    if (qualityCheck.score < 0.7) {
      warnings.push({ field: 'quality', message: 'Plan quality is below threshold' });
    }

    // 3. 一致性验证
    const consistencyCheck = await this.validateConsistency(result);
    errors.push(...consistencyCheck.errors);
    warnings.push(...consistencyCheck.warnings);

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // 验证AI服务响应
  async validateAIServiceResponse(response: AIServiceResponse): Promise<ValidationResult> {
    const errors: ValidationError[] = [];

    // 1. 响应格式验证
    if (!response.planData) {
      errors.push({ field: 'planData', message: 'AI service must return plan data' });
    }

    if (typeof response.confidence !== 'number') {
      errors.push({ field: 'confidence', message: 'AI service must return confidence score' });
    }

    // 2. 数据类型验证
    if (response.planData && typeof response.planData !== 'object') {
      errors.push({ field: 'planData', message: 'Plan data must be an object' });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: []
    };
  }

  private async validateBusinessRules(_request: PlanRequestData): Promise<ValidationResult> {
    // 业务规则验证逻辑
    return { isValid: true, errors: [], warnings: [] };
  }

  private async validateConstraints(_request: PlanRequestData): Promise<ValidationResult> {
    // 约束条件验证逻辑
    return { isValid: true, errors: [], warnings: [] };
  }

  private async validateConsistency(_result: PlanResultData): Promise<ValidationResult> {
    // 一致性验证逻辑
    return { isValid: true, errors: [], warnings: [] };
  }
}
```

### **AI服务适配器设计**
```typescript
/**
 * AI服务适配器接口
 * 支持多种AI服务的统一接口
 */
export interface IAIServiceAdapter {
  executePlanning(request: AIServiceRequest): Promise<AIServiceResponse>;
  getServiceInfo(): AIServiceInfo;
  healthCheck(): Promise<boolean>;
}

/**
 * AI服务适配器实现
 * 支持插拔式AI服务集成
 */
export class AIServiceAdapter implements IAIServiceAdapter {
  constructor(
    private readonly serviceConfig: AIServiceConfig,
    private readonly httpClient: IHttpClient
  ) {}

  async executePlanning(request: AIServiceRequest): Promise<AIServiceResponse> {
    try {
      // 1. 准备AI服务请求
      const aiRequest = this.prepareAIRequest(request);
      
      // 2. 调用AI服务
      const response = await this.httpClient.post(
        this.serviceConfig.endpoint,
        aiRequest,
        {
          headers: {
            'Authorization': `Bearer ${this.serviceConfig.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: this.serviceConfig.timeout || 30000
        }
      );

      // 3. 标准化响应
      return this.standardizeResponse(response.data);
    } catch (error) {
      throw new Error(`AI service call failed: ${error.message}`);
    }
  }

  async getServiceInfo(): Promise<AIServiceInfo> {
    return {
      name: this.serviceConfig.name,
      version: this.serviceConfig.version,
      capabilities: this.serviceConfig.capabilities,
      endpoint: this.serviceConfig.endpoint
    };
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.httpClient.get(`${this.serviceConfig.endpoint}/health`);
      return response.status === 200;
    } catch {
      return false;
    }
  }

  private prepareAIRequest(request: AIServiceRequest): any {
    // 将标准请求转换为AI服务特定格式
    return {
      request_id: request.requestId,
      plan_type: request.planType,
      parameters: request.parameters,
      constraints: request.constraints,
      options: {
        max_iterations: 1000,
        timeout: 30000
      }
    };
  }

  private standardizeResponse(response: any): AIServiceResponse {
    // 将AI服务响应标准化为统一格式
    return {
      planData: response.plan_data || response.result,
      confidence: response.confidence || 0.8,
      metadata: {
        processingTime: response.processing_time,
        iterations: response.iterations,
        algorithm: response.algorithm_used
      }
    };
  }
}
```

## 📋 **重构实施步骤**

### **Phase 1: 协议边界分析和设计（Day 29-32）**
```markdown
Day 29-30: 协议边界重新定义
- [ ] 分析现有AI算法和协议逻辑的耦合点
- [ ] 重新定义L1-L3协议层的职责边界
- [ ] 设计AI算法外置的接口规范
- [ ] 制定协议标准化实施方案

Day 31-32: 新架构设计和验证
- [ ] 设计3个核心协议服务的接口
- [ ] 设计AI服务适配器架构
- [ ] 制定AI服务版本管理策略
- [ ] 验证新架构的可行性和完整性
```

### **Phase 2: 协议服务实现（Day 33-39）**
```markdown
Day 33-35: 核心协议服务实现
- [ ] 实现PlanProtocolService
- [ ] 实现PlanIntegrationService
- [ ] 实现PlanValidationService
- [ ] 实现AI服务适配器

Day 36-37: AI算法外置实现
- [ ] 将现有AI算法移至外部服务
- [ ] 实现AI服务的标准接口
- [ ] 建立AI服务的版本管理机制
- [ ] 测试AI服务的调用和集成

Day 38-39: 协议接口标准化
- [ ] 重构PlanProtocol实现
- [ ] 统一错误处理和响应格式
- [ ] 优化请求路由和验证逻辑
- [ ] 集成横切关注点管理器
```

### **Phase 3: 测试和验证（Day 40-42）**
```markdown
Day 40: 功能测试
- [ ] 编写3个核心服务的单元测试
- [ ] 创建AI服务集成测试
- [ ] 实现协议接口测试
- [ ] 执行端到端功能测试

Day 41: 集成和性能测试
- [ ] 测试与其他模块的集成接口
- [ ] 验证预留接口的正确性
- [ ] 执行性能基准测试
- [ ] 测试AI服务的稳定性和可靠性

Day 42: 验证和文档
- [ ] 执行完整测试套件验证
- [ ] 更新API文档和使用指南
- [ ] 创建AI算法外置指南
- [ ] 生成重构效果评估报告
```

## ✅ **验收标准**

### **协议边界验收标准**
```markdown
边界清晰性验收：
- [ ] L1-L3协议层不包含任何AI算法实现
- [ ] AI决策逻辑完全外置到L4应用层
- [ ] 协议层只提供标准接口和路由机制
- [ ] 协议边界文档化和可验证

AI服务集成验收：
- [ ] AI服务适配器接口标准化
- [ ] 支持多种AI服务的插拔式集成
- [ ] AI服务版本管理机制完善
- [ ] AI服务调用稳定可靠
```

### **功能和质量验收标准**
```markdown
功能完整性验收：
- [ ] 所有原有规划功能都能正常工作
- [ ] 3个核心协议服务功能完整
- [ ] 预留接口实现正确
- [ ] 协调场景支持完善

质量标准验收：
- [ ] 单元测试覆盖率≥95%
- [ ] 集成测试覆盖率≥90%
- [ ] 所有测试100%通过
- [ ] 代码质量符合统一标准

性能和可靠性验收：
- [ ] 协议响应时间<50ms
- [ ] AI服务调用成功率≥99%
- [ ] 系统稳定性和容错能力良好
- [ ] 资源使用优化合理
```

---

**版本**: v1.0  
**创建时间**: 2025-01-27  
**重构周期**: 2周 (Week 5-6)  
**维护者**: Plan模块重构小组
