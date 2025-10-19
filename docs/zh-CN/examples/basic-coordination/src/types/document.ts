/**
 * 文档处理示例的类型定义
 * 
 * 此文件包含文档处理流程中使用的所有TypeScript接口和类型
 */

/**
 * 表示要处理的文档
 */
export interface Document {
  /** 唯一文档标识符 */
  id: string;
  
  /** 原始文件名 */
  filename: string;
  
  /** 文档类型/格式 */
  type: 'pdf' | 'docx' | 'txt' | 'pptx' | 'xlsx' | 'unknown';
  
  /** 文件大小（字节） */
  size: number;
  
  /** 文件路径或URL */
  path: string;
  
  /** 附加元数据 */
  metadata?: {
    uploadedAt?: string;
    source?: string;
    tags?: string[];
    priority?: 'low' | 'normal' | 'high';
    [key: string]: any;
  };
}

/**
 * 表示已解析的文档及提取的内容
 */
export interface ParsedDocument {
  /** 原始文档ID */
  id: string;
  
  /** 提取的标题 */
  title: string;
  
  /** 提取的文本内容 */
  content: string;
  
  /** 解析元数据 */
  metadata: {
    /** 页数 */
    pageCount: number;
    
    /** 字数 */
    wordCount: number;
    
    /** 检测到的语言 */
    language: string;
    
    /** 提取时间戳 */
    extractedAt: string;
    
    /** 解析器版本 */
    parserVersion?: string;
    
    /** 置信度分数 */
    confidence?: number;
  };
}

/**
 * 表示文档的分析结果
 */
export interface AnalysisResult {
  /** 文档ID */
  documentId: string;
  
  /** 文档分类 */
  classification: {
    /** 主要类别 */
    category: string;
    
    /** 置信度分数（0-1） */
    confidence: number;
    
    /** 子类别 */
    subcategories?: string[];
  };
  
  /** 情感分析 */
  sentiment?: {
    /** 整体情感 */
    overall: 'positive' | 'negative' | 'neutral';
    
    /** 情感分数（-1到1） */
    score: number;
    
    /** 置信度 */
    confidence: number;
  };
  
  /** 提取的关键词 */
  keywords: Array<{
    /** 关键词文本 */
    text: string;
    
    /** 相关性分数 */
    relevance: number;
    
    /** 频率计数 */
    frequency: number;
  }>;
  
  /** 命名实体 */
  entities?: Array<{
    /** 实体文本 */
    text: string;
    
    /** 实体类型 */
    type: 'person' | 'organization' | 'location' | 'date' | 'other';
    
    /** 置信度分数 */
    confidence: number;
  }>;
  
  /** 分析元数据 */
  metadata: {
    /** 分析时间戳 */
    analyzedAt: string;
    
    /** 分析器版本 */
    analyzerVersion: string;
    
    /** 处理时间（毫秒） */
    processingTimeMs: number;
  };
}

/**
 * 表示由Agent处理的任务
 */
export interface Task {
  /** 唯一任务标识符 */
  id: string;
  
  /** 任务类型 */
  type: 'parse' | 'analyze' | 'report' | 'custom';
  
  /** 任务数据负载 */
  data: any;
  
  /** 任务开始时间 */
  startTime: number;
  
  /** 任务优先级 */
  priority: 'low' | 'normal' | 'high';
  
  /** 任务元数据 */
  metadata?: {
    /** 分配的Agent ID */
    assignedTo?: string;
    
    /** 任务依赖 */
    dependencies?: string[];
    
    /** 超时时间（毫秒） */
    timeoutMs?: number;
    
    /** 重试次数 */
    retryCount?: number;
    
    /** 最大重试次数 */
    maxRetries?: number;
  };
}

/**
 * 表示任务执行的结果
 */
export interface TaskResult {
  /** 任务ID */
  taskId?: string;
  
  /** 成功标志 */
  success: boolean;
  
  /** 结果数据（如果成功） */
  data?: any;
  
  /** 错误消息（如果失败） */
  error?: string;
  
  /** 结果元数据 */
  metadata: {
    /** 处理Agent ID */
    agentId: string;
    
    /** 处理时间（毫秒） */
    processingTime?: number;
    
    /** 完成时间戳 */
    completedAt?: string;
    
    /** 失败原因（如果失败） */
    failureReason?: string;
    
    /** 附加指标 */
    metrics?: {
      memoryUsed?: number;
      cpuTime?: number;
      [key: string]: any;
    };
  };
}

/**
 * 表示最终处理结果
 */
export interface ProcessingResult {
  /** 处理的文档总数 */
  totalDocuments: number;
  
  /** 成功处理的文档数 */
  successfulDocuments: number;
  
  /** 失败的文档数 */
  failedDocuments: number;
  
  /** 整体成功率（0-1） */
  successRate: number;
  
  /** 总处理时间（毫秒） */
  processingTimeMs: number;
  
  /** 使用的Agent数量 */
  agentsUtilized: number;
  
  /** 每个文档的详细结果 */
  documentResults: Array<{
    /** 文档ID */
    documentId: string;
    
    /** 处理状态 */
    status: 'success' | 'failed' | 'skipped';
    
    /** 已解析的文档（如果成功） */
    parsedDocument?: ParsedDocument;
    
    /** 分析结果（如果成功） */
    analysisResult?: AnalysisResult;
    
    /** 错误详情（如果失败） */
    error?: {
      message: string;
      code: string;
      stage: 'parsing' | 'analysis' | 'reporting';
    };
    
    /** 处理指标 */
    metrics: {
      /** 总处理时间 */
      totalTimeMs: number;
      
      /** 解析时间 */
      parseTimeMs?: number;
      
      /** 分析时间 */
      analysisTimeMs?: number;
      
      /** 内存使用 */
      memoryUsed?: number;
    };
  }>;
  
  /** 整体处理指标 */
  overallMetrics: {
    /** 每个文档的平均处理时间 */
    avgProcessingTimeMs: number;
    
    /** 峰值内存使用 */
    peakMemoryUsage: number;
    
    /** 总CPU时间 */
    totalCpuTimeMs: number;
    
    /** 吞吐量（文档/秒） */
    throughput: number;
  };
  
  /** 处理摘要 */
  summary: {
    /** 最常见的文档类型 */
    mostCommonType: string;
    
    /** 最常见的分类 */
    mostCommonClassification: string;
    
    /** 平均置信度分数 */
    avgConfidenceScore: number;
    
    /** 所有文档的热门关键词 */
    topKeywords: Array<{
      text: string;
      frequency: number;
    }>;
  };
  
  /** 报告生成时间戳 */
  generatedAt: string;
  
  /** 报告版本 */
  reportVersion: string;
}

/**
 * Agent能力定义
 */
export interface AgentCapability {
  /** 能力名称 */
  name: string;
  
  /** 能力版本 */
  version: string;
  
  /** 支持的操作 */
  operations: string[];
  
  /** 性能特征 */
  performance?: {
    /** 平均处理时间 */
    avgProcessingTimeMs: number;
    
    /** 最大吞吐量 */
    maxThroughput: number;
    
    /** 内存需求 */
    memoryRequirementMB: number;
  };
}

/**
 * Agent状态信息
 */
export interface AgentStatus {
  /** Agent ID */
  agentId: string;
  
  /** 当前状态 */
  status: 'idle' | 'busy' | 'error' | 'offline';
  
  /** 当前任务数 */
  currentTasks: number;
  
  /** 最大并发任务数 */
  maxTasks: number;
  
  /** 最后心跳时间戳 */
  lastHeartbeat: string;
  
  /** 性能指标 */
  metrics: {
    /** 处理的任务总数 */
    totalTasksProcessed: number;
    
    /** 成功率 */
    successRate: number;
    
    /** 平均处理时间 */
    avgProcessingTimeMs: number;
    
    /** 当前内存使用 */
    memoryUsageMB: number;
    
    /** CPU利用率百分比 */
    cpuUtilization: number;
  };
}

