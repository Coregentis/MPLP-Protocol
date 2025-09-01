# Dialog模块重构指南

## 🎯 **重构目标和策略**

### **当前状态分析**
```markdown
✅ 优势分析：
- Dialog模块已达到企业级标准，测试通过率100% (121/121测试)
- 智能对话管理系统完整实现
- 企业级覆盖率达标
- 架构基本符合DDD分层模式

🔍 需要重构的方面：
- 对话管理可能过于复杂，需要简化以符合协议层职责
- 与统一架构标准的细节对齐
- 接口实现的标准化调整
- 对话流程和状态管理的优化
```

### **重构策略**
```markdown
🎯 重构目标：简化对话管理，标准化对话协议

重构原则：
✅ 对话简化：保留核心对话功能，简化复杂的管理逻辑
✅ 协议标准化：调整以符合L1-L3协议层职责
✅ 流程优化：优化对话流程和状态转换机制
✅ 性能提升：提升对话处理的性能和响应速度

预期效果：
- 对话管理复杂度降低35%
- 对话响应时间提升45%
- 状态管理效率提升40%
- 并发处理能力提升60%
```

## 🏗️ **新架构设计**

### **3个核心协议服务**

#### **1. DialogManagementService - 核心对话管理**
```typescript
/**
 * 核心对话管理服务
 * 职责：对话创建、流程控制、状态管理
 */
export class DialogManagementService {
  constructor(
    private readonly dialogRepository: IDialogRepository,
    private readonly stateManager: IDialogStateManager,
    private readonly flowEngine: IDialogFlowEngine,
    private readonly logger: ILogger
  ) {}

  // 创建对话
  async createDialog(data: CreateDialogData): Promise<DialogEntity> {
    // 1. 验证对话数据
    await this.validateDialogData(data);
    
    // 2. 创建对话实体
    const dialog = new DialogEntity({
      dialogId: this.generateDialogId(),
      title: data.title,
      type: data.type,
      participants: data.participants || [],
      contextId: data.contextId,
      metadata: data.metadata || {},
      status: 'active',
      currentStep: 'initial',
      createdAt: new Date(),
      messages: []
    });
    
    // 3. 初始化对话流程
    const flow = await this.flowEngine.initializeFlow(dialog.dialogId, data.flowTemplate);
    dialog.setFlowId(flow.flowId);
    
    // 4. 设置初始状态
    await this.stateManager.initializeState(dialog.dialogId, data.initialState);
    
    // 5. 持久化对话
    const savedDialog = await this.dialogRepository.save(dialog);
    
    return savedDialog;
  }

  // 发送消息
  async sendMessage(dialogId: string, message: DialogMessage): Promise<DialogResponse> {
    // 1. 获取对话
    const dialog = await this.dialogRepository.findById(dialogId);
    if (!dialog) {
      throw new Error(`Dialog ${dialogId} not found`);
    }

    // 2. 验证消息
    await this.validateMessage(dialog, message);

    // 3. 处理消息
    const processedMessage = await this.processMessage(dialog, message);
    
    // 4. 更新对话状态
    const newState = await this.stateManager.updateState(
      dialogId,
      processedMessage,
      dialog.currentState
    );
    
    // 5. 执行流程步骤
    const flowResult = await this.flowEngine.executeStep(
      dialog.flowId,
      dialog.currentStep,
      processedMessage
    );
    
    // 6. 更新对话
    dialog.addMessage(processedMessage);
    dialog.updateState(newState);
    dialog.updateCurrentStep(flowResult.nextStep);
    
    await this.dialogRepository.update(dialog);
    
    // 7. 生成响应
    const response: DialogResponse = {
      dialogId,
      messageId: processedMessage.messageId,
      status: 'processed',
      nextStep: flowResult.nextStep,
      suggestions: flowResult.suggestions || [],
      metadata: flowResult.metadata || {}
    };
    
    return response;
  }

  // 获取对话
  async getDialog(dialogId: string): Promise<DialogEntity | null> {
    return await this.dialogRepository.findById(dialogId);
  }

  // 获取对话历史
  async getDialogHistory(dialogId: string, options?: HistoryOptions): Promise<DialogMessage[]> {
    const dialog = await this.dialogRepository.findById(dialogId);
    if (!dialog) {
      throw new Error(`Dialog ${dialogId} not found`);
    }

    let messages = dialog.messages;
    
    // 应用过滤选项
    if (options?.startTime) {
      messages = messages.filter(msg => msg.timestamp >= options.startTime!);
    }
    
    if (options?.endTime) {
      messages = messages.filter(msg => msg.timestamp <= options.endTime!);
    }
    
    if (options?.participantId) {
      messages = messages.filter(msg => msg.senderId === options.participantId);
    }
    
    // 应用分页
    if (options?.limit) {
      const offset = options.offset || 0;
      messages = messages.slice(offset, offset + options.limit);
    }
    
    return messages;
  }

  // 更新对话状态
  async updateDialogStatus(dialogId: string, status: DialogStatus): Promise<void> {
    const dialog = await this.dialogRepository.findById(dialogId);
    if (!dialog) {
      throw new Error(`Dialog ${dialogId} not found`);
    }

    // 验证状态转换
    if (!this.isValidStatusTransition(dialog.status, status)) {
      throw new Error(`Invalid status transition from ${dialog.status} to ${status}`);
    }

    dialog.updateStatus(status);
    
    if (status === 'completed' || status === 'cancelled') {
      dialog.setEndTime(new Date());
    }
    
    await this.dialogRepository.update(dialog);
  }

  // 添加参与者
  async addParticipant(dialogId: string, participant: DialogParticipant): Promise<void> {
    const dialog = await this.dialogRepository.findById(dialogId);
    if (!dialog) {
      throw new Error(`Dialog ${dialogId} not found`);
    }

    // 检查参与者是否已存在
    const existingParticipant = dialog.participants.find(p => p.participantId === participant.participantId);
    if (existingParticipant) {
      throw new Error(`Participant ${participant.participantId} already exists in dialog`);
    }

    dialog.addParticipant(participant);
    await this.dialogRepository.update(dialog);
  }

  // 移除参与者
  async removeParticipant(dialogId: string, participantId: string): Promise<void> {
    const dialog = await this.dialogRepository.findById(dialogId);
    if (!dialog) {
      throw new Error(`Dialog ${dialogId} not found`);
    }

    dialog.removeParticipant(participantId);
    await this.dialogRepository.update(dialog);
  }

  // 查询对话
  async queryDialogs(query: DialogQuery): Promise<DialogEntity[]> {
    return await this.dialogRepository.query(query);
  }

  private async validateDialogData(data: CreateDialogData): Promise<void> {
    if (!data.title || data.title.trim().length === 0) {
      throw new Error('Dialog title is required');
    }

    if (!data.type) {
      throw new Error('Dialog type is required');
    }

    if (!data.contextId) {
      throw new Error('Context ID is required');
    }
  }

  private async validateMessage(dialog: DialogEntity, message: DialogMessage): Promise<void> {
    // 验证发送者是否是对话参与者
    const isParticipant = dialog.participants.some(p => p.participantId === message.senderId);
    if (!isParticipant) {
      throw new Error(`Sender ${message.senderId} is not a participant in this dialog`);
    }

    // 验证消息内容
    if (!message.content || message.content.trim().length === 0) {
      throw new Error('Message content is required');
    }

    // 验证对话状态
    if (dialog.status !== 'active') {
      throw new Error(`Cannot send message to dialog with status: ${dialog.status}`);
    }
  }

  private async processMessage(dialog: DialogEntity, message: DialogMessage): Promise<DialogMessage> {
    // 处理消息内容
    const processedMessage: DialogMessage = {
      ...message,
      messageId: this.generateMessageId(),
      timestamp: new Date(),
      processed: true
    };

    // 应用消息处理规则
    if (message.type === 'command') {
      processedMessage.metadata = {
        ...processedMessage.metadata,
        command: this.parseCommand(message.content)
      };
    }

    return processedMessage;
  }

  private parseCommand(content: string): any {
    // 解析命令内容
    const parts = content.split(' ');
    return {
      command: parts[0],
      args: parts.slice(1)
    };
  }

  private isValidStatusTransition(currentStatus: DialogStatus, newStatus: DialogStatus): boolean {
    const validTransitions: Record<DialogStatus, DialogStatus[]> = {
      'active': ['paused', 'completed', 'cancelled'],
      'paused': ['active', 'completed', 'cancelled'],
      'completed': [],
      'cancelled': []
    };

    return validTransitions[currentStatus]?.includes(newStatus) || false;
  }

  private generateDialogId(): string {
    return `dialog-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateMessageId(): string {
    return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
```

#### **2. DialogAnalyticsService - 对话分析服务**
```typescript
/**
 * 对话分析和洞察服务
 * 职责：对话数据分析、模式识别、性能统计
 */
export class DialogAnalyticsService {
  constructor(
    private readonly dialogRepository: IDialogRepository,
    private readonly analyticsEngine: IAnalyticsEngine,
    private readonly nlpProcessor: INLPProcessor
  ) {}

  // 分析对话
  async analyzeDialog(dialogId: string): Promise<DialogAnalysis> {
    const dialog = await this.dialogRepository.findById(dialogId);
    if (!dialog) {
      throw new Error(`Dialog ${dialogId} not found`);
    }

    return {
      dialogId,
      timestamp: new Date().toISOString(),
      overview: {
        totalMessages: dialog.messages.length,
        participants: dialog.participants.length,
        duration: this.calculateDialogDuration(dialog),
        status: dialog.status
      },
      communication: {
        messageDistribution: this.analyzeMessageDistribution(dialog.messages),
        responseTime: this.calculateAverageResponseTime(dialog.messages),
        participationRate: this.calculateParticipationRate(dialog),
        communicationPatterns: this.identifyCommunicationPatterns(dialog.messages)
      },
      content: {
        topics: await this.extractTopics(dialog.messages),
        sentiment: await this.analyzeSentiment(dialog.messages),
        keyPhrases: await this.extractKeyPhrases(dialog.messages),
        languageComplexity: await this.analyzeLanguageComplexity(dialog.messages)
      },
      insights: {
        effectiveness: this.assessDialogEffectiveness(dialog),
        recommendations: this.generateDialogRecommendations(dialog),
        riskFactors: this.identifyRiskFactors(dialog)
      }
    };
  }

  // 分析对话趋势
  async analyzeDialogTrends(timeRange: TimeRange, filters?: DialogFilters): Promise<DialogTrends> {
    const dialogs = await this.dialogRepository.queryByTimeRange(timeRange, filters);
    
    return {
      timeRange,
      totalDialogs: dialogs.length,
      trends: {
        volumeTrend: this.analyzeVolumeTrend(dialogs),
        durationTrend: this.analyzeDurationTrend(dialogs),
        participationTrend: this.analyzeParticipationTrend(dialogs),
        completionRateTrend: this.analyzeCompletionRateTrend(dialogs)
      },
      patterns: {
        peakHours: this.identifyPeakHours(dialogs),
        commonTopics: await this.identifyCommonTopics(dialogs),
        userBehaviorPatterns: this.analyzeUserBehaviorPatterns(dialogs)
      },
      performance: {
        averageResponseTime: this.calculateOverallAverageResponseTime(dialogs),
        completionRate: this.calculateCompletionRate(dialogs),
        satisfactionScore: await this.calculateSatisfactionScore(dialogs)
      }
    };
  }

  // 生成对话报告
  async generateDialogReport(reportType: DialogReportType, params: ReportParams): Promise<DialogReport> {
    switch (reportType) {
      case 'engagement':
        return await this.generateEngagementReport(params);
      case 'performance':
        return await this.generatePerformanceReport(params);
      case 'content_analysis':
        return await this.generateContentAnalysisReport(params);
      case 'user_behavior':
        return await this.generateUserBehaviorReport(params);
      default:
        throw new Error(`Unsupported report type: ${reportType}`);
    }
  }

  // 实时对话监控
  async getRealtimeDialogMetrics(contextId?: string): Promise<RealtimeDialogMetrics> {
    const currentTime = new Date();
    const timeRange = {
      startTime: new Date(currentTime.getTime() - 5 * 60 * 1000), // 最近5分钟
      endTime: currentTime
    };

    const filters = contextId ? { contextId } : undefined;
    const recentDialogs = await this.dialogRepository.queryByTimeRange(timeRange, filters);

    return {
      timestamp: currentTime.toISOString(),
      metrics: {
        activeDialogs: recentDialogs.filter(d => d.status === 'active').length,
        completedDialogs: recentDialogs.filter(d => d.status === 'completed').length,
        totalMessages: recentDialogs.reduce((sum, d) => sum + d.messages.length, 0),
        averageResponseTime: this.calculateOverallAverageResponseTime(recentDialogs),
        participantCount: this.countUniqueParticipants(recentDialogs)
      },
      alerts: this.generateRealtimeAlerts(recentDialogs)
    };
  }

  // 预测对话结果
  async predictDialogOutcome(dialogId: string): Promise<DialogPrediction> {
    const dialog = await this.dialogRepository.findById(dialogId);
    if (!dialog) {
      throw new Error(`Dialog ${dialogId} not found`);
    }

    const features = this.extractDialogFeatures(dialog);
    const prediction = await this.analyticsEngine.predict(features, 'dialog_outcome');

    return {
      dialogId,
      timestamp: new Date().toISOString(),
      prediction: {
        outcome: prediction.outcome,
        confidence: prediction.confidence,
        factors: prediction.factors
      },
      recommendations: this.generatePredictionRecommendations(prediction)
    };
  }

  private calculateDialogDuration(dialog: DialogEntity): number {
    if (dialog.messages.length === 0) return 0;
    
    const firstMessage = dialog.messages[0];
    const lastMessage = dialog.messages[dialog.messages.length - 1];
    
    return lastMessage.timestamp.getTime() - firstMessage.timestamp.getTime();
  }

  private analyzeMessageDistribution(messages: DialogMessage[]): Record<string, number> {
    const distribution: Record<string, number> = {};
    
    messages.forEach(message => {
      distribution[message.senderId] = (distribution[message.senderId] || 0) + 1;
    });
    
    return distribution;
  }

  private calculateAverageResponseTime(messages: DialogMessage[]): number {
    if (messages.length < 2) return 0;
    
    let totalResponseTime = 0;
    let responseCount = 0;
    
    for (let i = 1; i < messages.length; i++) {
      const currentMessage = messages[i];
      const previousMessage = messages[i - 1];
      
      if (currentMessage.senderId !== previousMessage.senderId) {
        totalResponseTime += currentMessage.timestamp.getTime() - previousMessage.timestamp.getTime();
        responseCount++;
      }
    }
    
    return responseCount > 0 ? totalResponseTime / responseCount : 0;
  }

  private calculateParticipationRate(dialog: DialogEntity): Record<string, number> {
    const totalMessages = dialog.messages.length;
    const distribution = this.analyzeMessageDistribution(dialog.messages);
    const participationRate: Record<string, number> = {};
    
    Object.keys(distribution).forEach(participantId => {
      participationRate[participantId] = distribution[participantId] / totalMessages;
    });
    
    return participationRate;
  }

  private identifyCommunicationPatterns(messages: DialogMessage[]): string[] {
    const patterns: string[] = [];
    
    // 识别问答模式
    const questionAnswerPairs = this.identifyQuestionAnswerPairs(messages);
    if (questionAnswerPairs > messages.length * 0.3) {
      patterns.push('question_answer_dominant');
    }
    
    // 识别单向通信
    const senderDistribution = this.analyzeMessageDistribution(messages);
    const dominantSender = Object.keys(senderDistribution).reduce((a, b) => 
      senderDistribution[a] > senderDistribution[b] ? a : b
    );
    
    if (senderDistribution[dominantSender] > messages.length * 0.7) {
      patterns.push('one_way_communication');
    }
    
    return patterns;
  }

  private identifyQuestionAnswerPairs(messages: DialogMessage[]): number {
    let pairs = 0;
    
    for (let i = 0; i < messages.length - 1; i++) {
      const currentMessage = messages[i];
      const nextMessage = messages[i + 1];
      
      if (currentMessage.content.includes('?') && 
          currentMessage.senderId !== nextMessage.senderId) {
        pairs++;
      }
    }
    
    return pairs;
  }

  private async extractTopics(messages: DialogMessage[]): Promise<string[]> {
    const allContent = messages.map(msg => msg.content).join(' ');
    return await this.nlpProcessor.extractTopics(allContent);
  }

  private async analyzeSentiment(messages: DialogMessage[]): Promise<SentimentAnalysis> {
    const sentiments = await Promise.all(
      messages.map(msg => this.nlpProcessor.analyzeSentiment(msg.content))
    );
    
    const averageSentiment = sentiments.reduce((sum, s) => sum + s.score, 0) / sentiments.length;
    
    return {
      overall: averageSentiment > 0.1 ? 'positive' : averageSentiment < -0.1 ? 'negative' : 'neutral',
      score: averageSentiment,
      distribution: this.calculateSentimentDistribution(sentiments)
    };
  }

  private async extractKeyPhrases(messages: DialogMessage[]): Promise<string[]> {
    const allContent = messages.map(msg => msg.content).join(' ');
    return await this.nlpProcessor.extractKeyPhrases(allContent);
  }

  private async analyzeLanguageComplexity(messages: DialogMessage[]): Promise<LanguageComplexity> {
    const allContent = messages.map(msg => msg.content).join(' ');
    return await this.nlpProcessor.analyzeComplexity(allContent);
  }

  private assessDialogEffectiveness(dialog: DialogEntity): number {
    // 评估对话有效性
    let score = 0.5; // 基础分数
    
    // 完成状态加分
    if (dialog.status === 'completed') {
      score += 0.3;
    }
    
    // 参与度加分
    const participationRate = this.calculateParticipationRate(dialog);
    const balancedParticipation = Object.values(participationRate).every(rate => rate > 0.1);
    if (balancedParticipation) {
      score += 0.2;
    }
    
    return Math.min(1.0, score);
  }

  private generateDialogRecommendations(dialog: DialogEntity): string[] {
    const recommendations: string[] = [];
    
    if (dialog.messages.length === 0) {
      recommendations.push('No messages in dialog, consider encouraging participation');
    }
    
    const participationRate = this.calculateParticipationRate(dialog);
    const imbalanced = Object.values(participationRate).some(rate => rate > 0.8);
    if (imbalanced) {
      recommendations.push('Participation is imbalanced, consider encouraging quieter participants');
    }
    
    return recommendations;
  }

  private identifyRiskFactors(dialog: DialogEntity): string[] {
    const risks: string[] = [];
    
    if (dialog.status === 'active' && this.calculateDialogDuration(dialog) > 24 * 60 * 60 * 1000) {
      risks.push('Dialog has been active for over 24 hours');
    }
    
    return risks;
  }

  private analyzeVolumeTrend(dialogs: DialogEntity[]): any {
    // 分析对话量趋势
    return {};
  }

  private analyzeDurationTrend(dialogs: DialogEntity[]): any {
    // 分析对话时长趋势
    return {};
  }

  private analyzeParticipationTrend(dialogs: DialogEntity[]): any {
    // 分析参与度趋势
    return {};
  }

  private analyzeCompletionRateTrend(dialogs: DialogEntity[]): any {
    // 分析完成率趋势
    return {};
  }

  private identifyPeakHours(dialogs: DialogEntity[]): string[] {
    // 识别高峰时段
    return [];
  }

  private async identifyCommonTopics(dialogs: DialogEntity[]): Promise<string[]> {
    // 识别常见话题
    return [];
  }

  private analyzeUserBehaviorPatterns(dialogs: DialogEntity[]): any {
    // 分析用户行为模式
    return {};
  }

  private calculateOverallAverageResponseTime(dialogs: DialogEntity[]): number {
    if (dialogs.length === 0) return 0;
    
    const totalResponseTime = dialogs.reduce((sum, dialog) => 
      sum + this.calculateAverageResponseTime(dialog.messages), 0
    );
    
    return totalResponseTime / dialogs.length;
  }

  private calculateCompletionRate(dialogs: DialogEntity[]): number {
    if (dialogs.length === 0) return 0;
    
    const completedCount = dialogs.filter(dialog => dialog.status === 'completed').length;
    return completedCount / dialogs.length;
  }

  private async calculateSatisfactionScore(dialogs: DialogEntity[]): Promise<number> {
    // 计算满意度分数
    return 0.8; // 示例值
  }

  private countUniqueParticipants(dialogs: DialogEntity[]): number {
    const uniqueParticipants = new Set<string>();
    
    dialogs.forEach(dialog => {
      dialog.participants.forEach(participant => {
        uniqueParticipants.add(participant.participantId);
      });
    });
    
    return uniqueParticipants.size;
  }

  private generateRealtimeAlerts(dialogs: DialogEntity[]): Alert[] {
    const alerts: Alert[] = [];
    
    const longRunningDialogs = dialogs.filter(dialog => 
      dialog.status === 'active' && this.calculateDialogDuration(dialog) > 2 * 60 * 60 * 1000
    );
    
    if (longRunningDialogs.length > 0) {
      alerts.push({
        type: 'long_running_dialog',
        severity: 'warning',
        message: `${longRunningDialogs.length} dialogs have been running for over 2 hours`,
        timestamp: new Date().toISOString()
      });
    }
    
    return alerts;
  }

  private extractDialogFeatures(dialog: DialogEntity): any {
    return {
      messageCount: dialog.messages.length,
      participantCount: dialog.participants.length,
      duration: this.calculateDialogDuration(dialog),
      averageResponseTime: this.calculateAverageResponseTime(dialog.messages)
    };
  }

  private generatePredictionRecommendations(prediction: any): string[] {
    const recommendations: string[] = [];
    
    if (prediction.confidence < 0.7) {
      recommendations.push('Prediction confidence is low, monitor dialog closely');
    }
    
    return recommendations;
  }

  private calculateSentimentDistribution(sentiments: any[]): Record<string, number> {
    const distribution = { positive: 0, neutral: 0, negative: 0 };
    
    sentiments.forEach(sentiment => {
      if (sentiment.score > 0.1) distribution.positive++;
      else if (sentiment.score < -0.1) distribution.negative++;
      else distribution.neutral++;
    });
    
    return distribution;
  }

  private async generateEngagementReport(params: ReportParams): Promise<DialogReport> {
    return {
      reportType: 'engagement',
      generatedAt: new Date().toISOString(),
      data: {}
    };
  }

  private async generatePerformanceReport(params: ReportParams): Promise<DialogReport> {
    return {
      reportType: 'performance',
      generatedAt: new Date().toISOString(),
      data: {}
    };
  }

  private async generateContentAnalysisReport(params: ReportParams): Promise<DialogReport> {
    return {
      reportType: 'content_analysis',
      generatedAt: new Date().toISOString(),
      data: {}
    };
  }

  private async generateUserBehaviorReport(params: ReportParams): Promise<DialogReport> {
    return {
      reportType: 'user_behavior',
      generatedAt: new Date().toISOString(),
      data: {}
    };
  }
}
```

#### **3. DialogSecurityService - 对话安全服务**
```typescript
/**
 * 对话安全和隐私保护服务
 * 职责：内容审核、隐私保护、访问控制
 */
export class DialogSecurityService {
  constructor(
    private readonly dialogRepository: IDialogRepository,
    private readonly contentModerator: IContentModerator,
    private readonly privacyProtector: IPrivacyProtector,
    private readonly securityManager: SecurityManager,
    private readonly auditLogger: IAuditLogger
  ) {}

  // 验证对话访问权限
  async validateDialogAccess(userId: string, dialogId: string, action: string): Promise<boolean> {
    try {
      // 1. 基本权限检查
      const hasPermission = await this.securityManager.validatePermission(
        userId,
        `dialog:${dialogId}`,
        action
      );

      if (!hasPermission) {
        await this.auditLogger.logAccessDenied({
          userId,
          resource: `dialog:${dialogId}`,
          action,
          timestamp: new Date()
        });
        return false;
      }

      // 2. 参与者检查
      const dialog = await this.dialogRepository.findById(dialogId);
      if (dialog) {
        const isParticipant = dialog.participants.some(p => p.participantId === userId);
        if (!isParticipant && action === 'read') {
          // 非参与者需要额外权限才能读取对话
          const hasReadPermission = await this.securityManager.validatePermission(
            userId,
            'dialog:all',
            'read'
          );
          
          if (!hasReadPermission) {
            await this.auditLogger.logAccessDenied({
              userId,
              resource: `dialog:${dialogId}`,
              action,
              reason: 'Not a participant and no global read permission',
              timestamp: new Date()
            });
            return false;
          }
        }
      }

      // 3. 记录访问成功
      await this.auditLogger.logAccessGranted({
        userId,
        resource: `dialog:${dialogId}`,
        action,
        timestamp: new Date()
      });

      return true;
    } catch (error) {
      await this.auditLogger.logError({
        userId,
        resource: `dialog:${dialogId}`,
        action,
        error: error.message,
        timestamp: new Date()
      });
      return false;
    }
  }

  // 审核消息内容
  async moderateMessage(message: DialogMessage): Promise<ModerationResult> {
    const moderationResult = await this.contentModerator.moderate(message.content);
    
    // 记录审核结果
    await this.auditLogger.logContentModeration({
      messageId: message.messageId,
      senderId: message.senderId,
      result: moderationResult,
      timestamp: new Date()
    });
    
    return moderationResult;
  }

  // 保护敏感信息
  async protectSensitiveData(dialogId: string): Promise<void> {
    const dialog = await this.dialogRepository.findById(dialogId);
    if (!dialog) {
      throw new Error(`Dialog ${dialogId} not found`);
    }

    // 1. 识别敏感信息
    const sensitiveMessages = await this.identifySensitiveMessages(dialog.messages);
    
    // 2. 保护敏感信息
    for (const message of sensitiveMessages) {
      const protectedContent = await this.privacyProtector.protectContent(message.content);
      message.content = protectedContent;
      message.metadata = {
        ...message.metadata,
        sensitiveDataProtected: true
      };
    }
    
    // 3. 更新对话
    if (sensitiveMessages.length > 0) {
      dialog.markAsSensitive();
      await this.dialogRepository.update(dialog);
      
      // 4. 记录保护操作
      await this.auditLogger.logDataProtection({
        dialogId,
        action: 'protect_sensitive_data',
        messagesCount: sensitiveMessages.length,
        timestamp: new Date()
      });
    }
  }

  // 执行安全审计
  async performSecurityAudit(dialogId: string): Promise<DialogSecurityAudit> {
    const dialog = await this.dialogRepository.findById(dialogId);
    if (!dialog) {
      throw new Error(`Dialog ${dialogId} not found`);
    }

    const auditId = this.generateAuditId();
    
    try {
      // 1. 内容安全检查
      const contentSecurity = await this.auditContentSecurity(dialog);
      
      // 2. 访问控制检查
      const accessControl = await this.auditAccessControl(dialog);
      
      // 3. 隐私保护检查
      const privacyProtection = await this.auditPrivacyProtection(dialog);
      
      // 4. 合规性检查
      const compliance = await this.auditCompliance(dialog);
      
      // 5. 生成审计结果
      const auditResult: DialogSecurityAudit = {
        auditId,
        dialogId,
        timestamp: new Date().toISOString(),
        contentSecurity,
        accessControl,
        privacyProtection,
        compliance,
        overallScore: this.calculateSecurityScore([contentSecurity, accessControl, privacyProtection, compliance]),
        recommendations: this.generateSecurityRecommendations([contentSecurity, accessControl, privacyProtection, compliance])
      };
      
      return auditResult;
    } catch (error) {
      throw new Error(`Security audit failed: ${error.message}`);
    }
  }

  // 检查合规性
  async checkCompliance(dialogId: string, standard: ComplianceStandard): Promise<ComplianceResult> {
    const dialog = await this.dialogRepository.findById(dialogId);
    if (!dialog) {
      throw new Error(`Dialog ${dialogId} not found`);
    }

    switch (standard) {
      case 'GDPR':
        return await this.checkGDPRCompliance(dialog);
      case 'HIPAA':
        return await this.checkHIPAACompliance(dialog);
      case 'COPPA':
        return await this.checkCOPPACompliance(dialog);
      default:
        throw new Error(`Unsupported compliance standard: ${standard}`);
    }
  }

  // 数据保留管理
  async manageDataRetention(retentionPolicy: DataRetentionPolicy): Promise<DataRetentionResult> {
    const cutoffDate = new Date(Date.now() - retentionPolicy.retentionPeriod);
    
    // 1. 查找过期对话
    const expiredDialogs = await this.dialogRepository.queryByTimeRange({
      startTime: new Date(0),
      endTime: cutoffDate
    });

    // 2. 处理过期数据
    const result: DataRetentionResult = {
      totalProcessed: expiredDialogs.length,
      archived: 0,
      deleted: 0,
      errors: []
    };

    for (const dialog of expiredDialogs) {
      try {
        if (retentionPolicy.archiveBeforeDelete) {
          await this.archiveDialog(dialog.dialogId);
          result.archived++;
        }
        
        await this.dialogRepository.delete(dialog.dialogId);
        result.deleted++;
      } catch (error) {
        result.errors.push({
          dialogId: dialog.dialogId,
          error: error.message
        });
      }
    }

    // 3. 记录数据保留操作
    await this.auditLogger.logDataRetention({
      policy: retentionPolicy.name,
      result,
      timestamp: new Date()
    });

    return result;
  }

  private async identifySensitiveMessages(messages: DialogMessage[]): Promise<DialogMessage[]> {
    const sensitiveMessages: DialogMessage[] = [];
    
    for (const message of messages) {
      const hasSensitiveData = await this.privacyProtector.detectSensitiveData(message.content);
      if (hasSensitiveData) {
        sensitiveMessages.push(message);
      }
    }
    
    return sensitiveMessages;
  }

  private async auditContentSecurity(dialog: DialogEntity): Promise<SecurityAuditResult> {
    const violations: string[] = [];
    
    // 检查不当内容
    for (const message of dialog.messages) {
      const moderationResult = await this.contentModerator.moderate(message.content);
      if (!moderationResult.approved) {
        violations.push(`Message ${message.messageId} contains inappropriate content`);
      }
    }
    
    return {
      category: 'content_security',
      score: violations.length === 0 ? 100 : Math.max(0, 100 - violations.length * 20),
      violations,
      recommendations: violations.length > 0 ? ['Review and moderate inappropriate content'] : []
    };
  }

  private async auditAccessControl(dialog: DialogEntity): Promise<SecurityAuditResult> {
    const violations: string[] = [];
    
    // 检查访问控制配置
    if (dialog.participants.length === 0) {
      violations.push('Dialog has no participants defined');
    }
    
    return {
      category: 'access_control',
      score: violations.length === 0 ? 100 : Math.max(0, 100 - violations.length * 30),
      violations,
      recommendations: violations.length > 0 ? ['Configure proper access controls'] : []
    };
  }

  private async auditPrivacyProtection(dialog: DialogEntity): Promise<SecurityAuditResult> {
    const violations: string[] = [];
    
    // 检查隐私保护
    const sensitiveMessages = await this.identifySensitiveMessages(dialog.messages);
    const unprotectedSensitive = sensitiveMessages.filter(msg => 
      !msg.metadata?.sensitiveDataProtected
    );
    
    if (unprotectedSensitive.length > 0) {
      violations.push(`${unprotectedSensitive.length} messages contain unprotected sensitive data`);
    }
    
    return {
      category: 'privacy_protection',
      score: violations.length === 0 ? 100 : Math.max(0, 100 - violations.length * 25),
      violations,
      recommendations: violations.length > 0 ? ['Protect sensitive data in messages'] : []
    };
  }

  private async auditCompliance(dialog: DialogEntity): Promise<SecurityAuditResult> {
    const violations: string[] = [];
    
    // 基本合规检查
    if (!dialog.metadata?.complianceChecked) {
      violations.push('Dialog has not undergone compliance checking');
    }
    
    return {
      category: 'compliance',
      score: violations.length === 0 ? 100 : Math.max(0, 100 - violations.length * 40),
      violations,
      recommendations: violations.length > 0 ? ['Perform compliance checking'] : []
    };
  }

  private calculateSecurityScore(auditResults: SecurityAuditResult[]): number {
    if (auditResults.length === 0) return 0;
    
    const totalScore = auditResults.reduce((sum, result) => sum + result.score, 0);
    return Math.round(totalScore / auditResults.length);
  }

  private generateSecurityRecommendations(auditResults: SecurityAuditResult[]): string[] {
    const recommendations: string[] = [];
    
    auditResults.forEach(result => {
      recommendations.push(...result.recommendations);
    });
    
    return [...new Set(recommendations)]; // 去重
  }

  private async archiveDialog(dialogId: string): Promise<void> {
    // 归档对话数据
  }

  private async checkGDPRCompliance(dialog: DialogEntity): Promise<ComplianceResult> {
    return { standard: 'GDPR', compliant: true, score: 95, violations: [], recommendations: [] };
  }

  private async checkHIPAACompliance(dialog: DialogEntity): Promise<ComplianceResult> {
    return { standard: 'HIPAA', compliant: true, score: 90, violations: [], recommendations: [] };
  }

  private async checkCOPPACompliance(dialog: DialogEntity): Promise<ComplianceResult> {
    return { standard: 'COPPA', compliant: true, score: 88, violations: [], recommendations: [] };
  }

  private generateAuditId(): string {
    return `dialog-audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
```

## 📋 **重构实施步骤**

### **Phase 1: 对话简化分析（Day 1-2）**
```markdown
Day 1: 现状分析和简化设计
- [ ] 分析现有对话管理系统的复杂度
- [ ] 识别可以简化的对话逻辑
- [ ] 设计简化后的核心对话流程
- [ ] 制定状态管理的优化方案

Day 2: 服务重构设计
- [ ] 设计3个核心服务的接口
- [ ] 制定对话流程引擎的简化方案
- [ ] 设计NLP处理的优化算法
- [ ] 制定性能提升策略
```

### **Phase 2: 服务重构实现（Day 3-5）**
```markdown
Day 3: 核心服务实现
- [ ] 实现DialogManagementService
- [ ] 实现DialogAnalyticsService
- [ ] 实现DialogSecurityService
- [ ] 集成横切关注点管理器

Day 4: 协议接口标准化
- [ ] 重构DialogProtocol实现
- [ ] 统一错误处理和响应格式
- [ ] 优化请求路由逻辑
- [ ] 实现标准化的对话流程接口

Day 5: 测试和验证
- [ ] 编写核心服务的单元测试
- [ ] 创建集成测试套件
- [ ] 执行性能基准测试
- [ ] 进行内容审核和隐私保护测试
```

### **Phase 3: 验证和优化（Day 6-7）**
```markdown
Day 6: 功能验证和性能优化
- [ ] 执行完整测试套件
- [ ] 验证对话管理功能的正确性
- [ ] 优化对话处理性能
- [ ] 验证内容安全和隐私保护

Day 7: 文档和报告
- [ ] 更新API文档和使用指南
- [ ] 创建对话管理最佳实践文档
- [ ] 生成重构效果评估报告
- [ ] 准备对话安全指南
```

## ✅ **验收标准**

### **功能验收标准**
```markdown
核心功能验收：
- [ ] 3个核心服务功能完整正确
- [ ] 对话流程管理正常
- [ ] 内容分析和安全审核完善
- [ ] 隐私保护和合规检查完整

协议接口验收：
- [ ] IMLPPProtocol接口实现标准化
- [ ] 请求路由逻辑清晰高效
- [ ] 错误处理统一规范
- [ ] 响应格式标准一致
```

### **性能验收标准**
```markdown
性能指标验收：
- [ ] 对话创建响应时间<100ms
- [ ] 消息发送响应时间<50ms
- [ ] 内容分析响应时间<200ms
- [ ] 安全审核响应时间<500ms

优化效果验收：
- [ ] 对话响应时间提升≥45%
- [ ] 状态管理效率提升≥40%
- [ ] 并发处理能力提升≥60%
- [ ] 内存使用优化≥30%
```

### **质量验收标准**
```markdown
测试质量验收：
- [ ] 单元测试覆盖率≥95%
- [ ] 集成测试覆盖率≥90%
- [ ] 所有测试100%通过
- [ ] 安全测试覆盖完整

代码质量验收：
- [ ] TypeScript编译0错误
- [ ] ESLint检查0错误和警告
- [ ] 代码复杂度<10
- [ ] 零any类型使用
```

---

**版本**: v1.0  
**创建时间**: 2025-01-27  
**重构周期**: 1周 (Week 10中的3天)  
**维护者**: Dialog模块重构小组
