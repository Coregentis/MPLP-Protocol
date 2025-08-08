/**
 * MPLP Dialog Module - Unified Interface Type Definitions
 *
 * @version v1.0.0
 * @updated 2025-08-03T15:30:00+08:00
 * @description Dialog协议统一标准接口的TypeScript类型定义
 */

// ==================== 统一标准接口类型 ====================

/**
 * Dialog协议统一标准接口
 * 通过配置参数支持所有类型的对话需求
 */
export interface DialogProtocol {
  /**
   * 创建对话会话
   * 支持从简单到复杂的所有对话类型
   */
  createDialog(request: CreateDialogRequest): Promise<DialogResponse>;

  /**
   * 更新对话配置
   * 支持动态调整对话策略和能力
   */
  updateDialog(request: UpdateDialogRequest): Promise<DialogResponse>;

  /**
   * 对话交互
   * 统一的交互接口，根据配置提供不同能力
   */
  interactWithDialog(request: DialogInteractionRequest): Promise<DialogInteractionResponse>;

  /**
   * 查询对话状态
   * 获取对话进度、分析结果、知识状态等
   */
  getDialogStatus(dialogId: string, options?: StatusOptions): Promise<DialogStatusResponse>;

  /**
   * 删除对话
   * 标准的对话删除接口
   */
  deleteDialog(dialogId: string): Promise<DeleteResponse>;

  /**
   * 查询对话列表
   * 支持多种过滤和排序条件
   */
  queryDialogs(filter: DialogFilter): Promise<QueryDialogResponse>;
}

// ==================== 核心数据类型 ====================

/**
 * 对话创建请求
 * 通过capabilities配置控制对话能力
 */
export interface CreateDialogRequest {
  name: string;
  description?: string;
  participants: string[];

  // 对话能力配置 - 核心参数化设计
  capabilities: DialogCapabilities;

  // 对话策略配置
  strategy?: DialogStrategy;

  // 上下文配置
  context?: DialogContext;

  metadata?: Record<string, unknown>;
}

/**
 * 对话能力配置
 * 通过布尔值和配置对象控制不同能力的启用
 */
export interface DialogCapabilities {
  // 基础对话能力（默认启用）
  basic: {
    enabled: true;
    messageHistory: boolean;
    participantManagement: boolean;
  };

  // 智能对话控制（可选）
  intelligentControl?: {
    enabled: boolean;
    adaptiveRounds: boolean;
    dynamicStrategy: boolean;
    completenessEvaluation: boolean;
  };

  // 批判性思维分析（可选）
  criticalThinking?: {
    enabled: boolean;
    analysisDepth: 'surface' | 'moderate' | 'deep';
    questionGeneration: boolean;
    logicValidation: boolean;
  };

  // 知识搜索集成（可选）
  knowledgeSearch?: {
    enabled: boolean;
    realTimeSearch: boolean;
    knowledgeValidation: boolean;
    sourceVerification: boolean;
  };

  // 多模态交互（可选）
  multimodal?: {
    enabled: boolean;
    supportedModalities: ('text' | 'audio' | 'image' | 'video' | 'file')[];
    crossModalTranslation: boolean;
  };
}

/**
 * 对话策略配置
 */
export interface DialogStrategy {
  type: 'fixed' | 'adaptive' | 'goal_driven' | 'exploratory';

  // 轮次控制
  rounds?: {
    min?: number;
    max?: number;
    target?: number;
  };

  // 退出条件
  exitCriteria?: {
    completenessThreshold?: number;
    userSatisfactionThreshold?: number;
    timeLimit?: number;
  };

  // 适应规则
  adaptationRules?: AdaptationRule[];
}

/**
 * 对话交互请求
 * 统一的交互接口，根据能力配置提供不同功能
 */
export interface DialogInteractionRequest {
  dialogId: string;

  // 交互内容
  content: DialogContent;

  // 交互选项
  options?: {
    // 是否需要批判性思维分析
    applyCriticalThinking?: boolean;

    // 是否需要知识搜索
    performKnowledgeSearch?: boolean;

    // 分析深度
    analysisDepth?: 'surface' | 'moderate' | 'deep';

    // 响应格式
    responseFormat?: 'text' | 'structured' | 'multimodal';
  };

  metadata?: Record<string, unknown>;
}

/**
 * 对话内容定义
 * 支持多模态内容
 */
export interface DialogContent {
  // 文本内容
  text?: string;

  // 多模态内容（如果启用）
  multimodal?: {
    audio?: AudioData;
    image?: ImageData;
    video?: VideoData;
    file?: FileData;
  };

  // 内容类型
  type: 'message' | 'question' | 'command' | 'feedback';

  // 优先级
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

// ==================== 响应类型 ====================

/**
 * 对话响应
 */
export interface DialogResponse {
  success: boolean;
  data?: {
    dialogId: string;
    name: string;
    status: DialogStatus;
    capabilities: DialogCapabilities;
    participants: string[];
    createdAt: string;
    updatedAt: string;
  };
  error?: string;
}

/**
 * 对话交互响应
 * 根据启用的能力返回相应的分析结果
 */
export interface DialogInteractionResponse {
  success: boolean;

  // 基础响应内容
  content: DialogContent;

  // 智能分析结果（如果启用）
  analysis?: {
    // 批判性思维分析
    criticalThinking?: CriticalAnalysisResult;

    // 知识搜索结果
    knowledgeSearch?: KnowledgeSearchResult;

    // 对话完成度评估
    completeness?: CompletenessEvaluation;
  };

  // 对话状态更新
  dialogState?: {
    currentRound: number;
    completenessScore: number;
    nextSuggestions: string[];
  };

  // 元数据
  metadata: {
    processingTime: number;
    capabilitiesUsed: string[];
    confidence: number;
  };

  error?: string;
}

/**
 * 对话状态响应
 */
export interface DialogStatusResponse {
  success: boolean;
  data?: {
    dialogId: string;
    status: DialogStatus;
    progress: DialogProgress;
    participants: ParticipantStatus[];
    analysis?: DialogAnalysisStatus;
    performance: DialogPerformanceMetrics;
  };
  error?: string;
}

// ==================== 支持类型 ====================

/**
 * 批判性分析结果
 */
export interface CriticalAnalysisResult {
  assumptions: string[];
  logicalGaps: string[];
  alternatives: string[];
  deepQuestions: string[];
  confidence: number;
}

/**
 * 知识搜索结果
 */
export interface KnowledgeSearchResult {
  results: KnowledgeItem[];
  sources: string[];
  validation: {
    timeliness: number;
    accuracy: number;
    relevance: number;
  };
  recommendations: string[];
}

/**
 * 对话完成度评估
 */
export interface CompletenessEvaluation {
  overallScore: number; // 0-1
  dimensions: {
    informationGathering: number;
    goalClarity: number;
    stakeholderAlignment: number;
    riskAssessment: number;
  };
  recommendations: string[];
  shouldContinue: boolean;
}

/**
 * 对话进度信息
 */
export interface DialogProgress {
  currentRound: number;
  totalRounds?: number;
  completenessScore: number;
  milestones: DialogMilestone[];
}

/**
 * 对话分析状态
 */
export interface DialogAnalysisStatus {
  criticalThinkingActive: boolean;
  knowledgeSearchActive: boolean;
  lastAnalysisTime?: string;
  analysisResults: AnalysisResult[];
}

/**
 * 对话性能指标
 */
export interface DialogPerformanceMetrics {
  responseTime: number;
  throughput: number;
  participantSatisfaction: number;
  goalAchievement: number;
}

// ==================== 枚举类型 ====================

/**
 * 对话状态
 */
export type DialogStatus =
  | 'active'
  | 'inactive'
  | 'pending'
  | 'completed'
  | 'failed'
  | 'cancelled';

/**
 * 参与者状态
 */
export type ParticipantStatus =
  | 'active'
  | 'inactive'
  | 'pending'
  | 'completed'
  | 'failed'
  | 'cancelled';

// ==================== 辅助类型 ====================

/**
 * 对话上下文
 */
export interface DialogContext {
  sessionId?: string;
  contextId?: string;
  knowledgeBase?: string;
  previousDialogs?: string[];
}

/**
 * 状态选项
 */
export interface StatusOptions {
  includeAnalysis?: boolean;
  includePerformance?: boolean;
  includeParticipants?: boolean;
}

/**
 * 对话过滤器
 */
export interface DialogFilter {
  status?: DialogStatus[];
  participants?: string[];
  capabilities?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  limit?: number;
  offset?: number;
}

/**
 * 查询对话响应
 */
export interface QueryDialogResponse {
  success: boolean;
  data?: {
    dialogs: DialogSummary[];
    total: number;
    hasMore: boolean;
  };
  error?: string;
}

/**
 * 对话摘要
 */
export interface DialogSummary {
  dialogId: string;
  name: string;
  status: DialogStatus;
  participantCount: number;
  createdAt: string;
  lastActivity: string;
}

/**
 * 更新对话请求
 */
export interface UpdateDialogRequest {
  dialogId: string;
  name?: string;
  description?: string;
  capabilities?: Partial<DialogCapabilities>;
  strategy?: DialogStrategy;
  metadata?: Record<string, unknown>;
}

/**
 * 删除响应
 */
export interface DeleteResponse {
  success: boolean;
  error?: string;
}

// ==================== 多模态数据类型 ====================

/**
 * 音频数据
 */
export interface AudioData {
  format: string;
  duration?: number;
  data: string | Buffer;
}

/**
 * 图像数据
 */
export interface ImageData {
  format: string;
  width?: number;
  height?: number;
  data: string | Buffer;
}

/**
 * 视频数据
 */
export interface VideoData {
  format: string;
  duration?: number;
  width?: number;
  height?: number;
  data: string | Buffer;
}

/**
 * 文件数据
 */
export interface FileData {
  filename: string;
  mimeType: string;
  size: number;
  data: string | Buffer;
}

// ==================== 分析相关类型 ====================

/**
 * 知识项
 */
export interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  source: string;
  relevance: number;
  timestamp: string;
}

/**
 * 对话里程碑
 */
export interface DialogMilestone {
  id: string;
  name: string;
  achieved: boolean;
  timestamp?: string;
}

/**
 * 分析结果
 */
export interface AnalysisResult {
  type: string;
  result: unknown;
  confidence: number;
  timestamp: string;
}

/**
 * 适应规则
 */
export interface AdaptationRule {
  condition: string;
  action: string;
  priority: number;
}
// ==================== 统一接口类型定义 ====================

/**
 * 对话实体数据结构
 * 统一的对话实体定义，支持所有对话管理需求
 */
export interface DialogEntity {
  dialogId: string;
  version: string;
  timestamp: string;
  sessionId: string;
  contextId: string;
  name: string;
  description?: string;
  participants: DialogParticipant[];
  message_format: MessageFormat;
  conversation_context?: ConversationContext;
  security_policy?: SecurityPolicy;
  status: DialogStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  metadata?: Record<string, unknown>;
}

/**
 * 对话参与者数据结构
 * 统一的参与者定义，支持所有参与者管理需求
 */
export interface DialogParticipant {
  participant_id: string;
  agentId: string;
  roleId: string;
  status: ParticipantStatus;
  permissions: Permission[];
  joined_at: string;
}

/**
 * 权限类型
 */
export type Permission = 'read' | 'write' | 'moderate' | 'admin';

/**
 * 消息格式配置
 */
export interface MessageFormat {
  type: MessageFormatType;
  encoding: MessageEncoding;
  max_length?: number;
  allowed_mime_types?: string[];
}

/**
 * 对话上下文配置
 */
export interface ConversationContext {
  shared_variables?: Record<string, unknown>;
  history_config?: HistoryConfig;
}

/**
 * 历史记录配置
 */
export interface HistoryConfig {
  max_messages?: number;
  retention_policy?: RetentionPolicy;
}

/**
 * 安全策略配置
 */
export interface SecurityPolicy {
  encryption?: boolean;
  authentication?: boolean;
  message_validation?: boolean;
  audit_logging?: boolean;
}

// ==================== 向后兼容枚举类型 ====================

export type MessageFormatType = 'text' | 'structured' | 'multimedia' | 'binary';
export type MessageEncoding = 'utf-8' | 'base64' | 'json' | 'xml';
export type RetentionPolicy = 'session' | 'persistent' | 'temporary';
export type MessageType = 'text' | 'data' | 'command' | 'notification' | 'system' | 'file';
export type MessagePriority = 'low' | 'normal' | 'high' | 'urgent';
export type MessageStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed';

// ==================== 向后兼容的旧版接口类型 ====================

/**
 * 创建对话请求（兼容接口）
 */
export interface LegacyCreateDialogRequest {
  sessionId: string;
  contextId: string;
  name: string;
  description?: string;
  participants: Omit<DialogParticipant, 'participant_id' | 'joined_at'>[];
  message_format: MessageFormat;
  conversation_context?: ConversationContext;
  security_policy?: SecurityPolicy;
  metadata?: Record<string, unknown>;
}

/**
 * 对话消息数据结构
 * 统一的消息定义，支持所有消息类型和格式
 */
export interface DialogMessage {
  message_id: string;
  dialogId: string;
  sender_id: string;
  recipient_ids: string[];
  type: MessageType;
  content: MessageContent;
  format: string;
  priority: MessagePriority;
  status: MessageStatus;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

/**
 * 消息内容
 */
export interface MessageContent {
  text?: string;
  data?: unknown;
  attachments?: MessageAttachment[];
  references?: MessageReference[];
}

/**
 * 消息附件
 */
export interface MessageAttachment {
  attachment_id: string;
  name: string;
  type: string;
  size: number;
  url?: string;
  data?: string; // base64 encoded
}

/**
 * 消息引用
 */
export interface MessageReference {
  reference_id: string;
  type: 'reply' | 'forward' | 'quote';
  message_id: string;
  content_excerpt?: string;
}

/**
 * 旧版对话事件类型（向后兼容）
 * @deprecated 使用新的统一接口类型
 */
export type DialogEventType =
  | 'dialog_created'
  | 'dialog_updated'
  | 'dialog_started'
  | 'dialog_paused'
  | 'dialog_completed'
  | 'dialog_failed'
  | 'participant_added'
  | 'participant_removed'
  | 'participant_updated'
  | 'message_sent'
  | 'message_received'
  | 'message_read'
  | 'message_failed';

/**
 * 旧版对话模块配置（向后兼容）
 * @deprecated 使用新的统一接口类型
 */
export interface DialogModuleConfig {
  max_participants: number;
  max_message_length: number;
  message_retention_days: number;
  enable_encryption: boolean;
  enable_audit_logging: boolean;
  cache_ttl: number;
  connection_timeout: number;
}

// ==================== 向后兼容的请求/响应类型 ====================

/**
 * 旧版发送消息请求（向后兼容）
 * @deprecated 使用新的统一接口类型
 */
export interface SendMessageRequest {
  dialogId: string;
  sender_id: string;
  recipient_ids: string[];
  type: MessageType;
  content: MessageContent;
  priority?: MessagePriority;
  metadata?: Record<string, unknown>;
}

/**
 * 旧版对话查询参数（向后兼容）
 * @deprecated 使用新的统一接口类型
 */
export interface DialogQueryParams {
  sessionId?: string;
  contextId?: string;
  status?: DialogStatus;
  participant_id?: string;
  createdBy?: string;
  limit?: number;
  offset?: number;
  sort_by?: 'created_at' | 'updated_at' | 'name';
  sort_order?: 'asc' | 'desc';
}

/**
 * 旧版消息查询参数（向后兼容）
 * @deprecated 使用新的统一接口类型
 */
export interface MessageQueryParams {
  dialogId: string;
  sender_id?: string;
  recipient_id?: string;
  type?: MessageType;
  status?: MessageStatus;
  from_timestamp?: string;
  to_timestamp?: string;
  limit?: number;
  offset?: number;
}

/**
 * 旧版添加参与者请求（向后兼容）
 * @deprecated 使用新的统一接口类型
 */
export interface AddParticipantRequest {
  dialogId: string;
  agentId: string;
  roleId: string;
  permissions: Permission[];
}

/**
 * 旧版移除参与者请求（向后兼容）
 * @deprecated 使用新的统一接口类型
 */
export interface RemoveParticipantRequest {
  dialogId: string;
  participant_id: string;
  reason?: string;
}

/**
 * 旧版更新参与者请求（向后兼容）
 * @deprecated 使用新的统一接口类型
 */
export interface UpdateParticipantRequest {
  dialogId: string;
  participant_id: string;
  permissions?: Permission[];
  status?: ParticipantStatus;
}

/**
 * 旧版对话列表响应（向后兼容）
 * @deprecated 使用新的统一接口类型
 */
export interface DialogListResponse {
  success: boolean;
  data?: {
    dialogs: DialogEntity[];
    total: number;
    limit: number;
    offset: number;
  };
  error?: string;
  timestamp: string;
}

/**
 * 旧版消息响应（向后兼容）
 * @deprecated 使用新的统一接口类型
 */
export interface MessageResponse {
  success: boolean;
  data?: DialogMessage;
  error?: string;
  timestamp: string;
}

/**
 * 旧版消息列表响应（向后兼容）
 * @deprecated 使用新的统一接口类型
 */
export interface MessageListResponse {
  success: boolean;
  data?: {
    messages: DialogMessage[];
    total: number;
    limit: number;
    offset: number;
  };
  error?: string;
  timestamp: string;
}
