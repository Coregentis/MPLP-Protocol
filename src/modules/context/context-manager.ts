/**
 * MPLP Context模块管理器
 * 
 * Context模块高级业务管理层
 * 严格按照 context-protocol.json Schema规范定义
 * 
 * @version v1.0.2
 * @updated 2025-07-10T17:30:00+08:00
 * @compliance 100% Schema合规性 - 完全匹配context-protocol.json Schema定义
 * @schema_path src/schemas/context-protocol.json
 */

import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { ContextService, IContextRepository, IContextValidator } from './context-service';
import {
  ContextProtocol,
  CreateContextRequest,
  UpdateContextRequest,
  BatchContextRequest,
  BatchContextResponse,
  ContextResponse,
  ContextFilter,
  ContextOperationResult,
  ContextStatus,
  ContextLifecycleStage,
  SharedState,
  AccessControl,
  ContextConfiguration,
  UUID,
  Timestamp,
  ContextError,
  ValidationError,
  AccessDeniedError,
  ConfigurationError,
  InternalError
} from './types';
import { logger } from '../../utils/logger';

// ===== 管理器配置类型 =====

/**
 * Context管理器配置
 */
export interface ContextManagerConfig {
  /** 自动初始化 */
  autoInitialize?: boolean;
  
  /** 启用性能监控 */
  enablePerformanceMonitoring?: boolean;
  
  /** 默认超时时间(秒) */
  defaultTimeout?: number;
  
  /** 最大并发操作数 */
  maxConcurrentOperations?: number;
  
  /** 缓存策略 */
  cacheStrategy?: 'memory' | 'redis' | 'hybrid';
  
  /** 自动清理过期Context */
  autoCleanupEnabled?: boolean;
  
  /** 清理间隔(秒) */
  cleanupIntervalSeconds?: number;
}

/**
 * Context会话信息
 */
export interface ContextSession {
  session_id: UUID;
  context_id: UUID;
  user_id: string;
  created_at: Timestamp;
  last_active_at: Timestamp;
  expires_at?: Timestamp;
  metadata?: Record<string, unknown>;
}

/**
 * Context统计信息
 */
export interface ContextStatistics {
  total_contexts: number;
  active_contexts: number;
  completed_contexts: number;
  total_sessions: number;
  active_sessions: number;
  average_session_duration_minutes: number;
  total_shared_state_size_mb: number;
}

/**
 * Context事件数据
 */
export interface ContextManagerEventData {
  context_id: UUID;
  timestamp: Timestamp;
  user_id?: string;
  action: string;
  metadata?: Record<string, unknown>;
}

// ===== 管理器实现 =====

/**
 * Context模块管理器
 * 
 * 提供高级业务友好的Context管理接口
 * 封装复杂的服务层调用，实现业务逻辑组合
 * 管理Context生命周期、会话和状态
 */
export class ContextManager extends EventEmitter {
  private contextService: ContextService;
  private config: ContextManagerConfig;
  private sessions: Map<UUID, ContextSession> = new Map();
  private cleanupTimer?: NodeJS.Timeout;
  private isInitialized = false;

  constructor(
    repository: IContextRepository,
    validator: IContextValidator,
    config: ContextManagerConfig = {}
  ) {
    super();
    
    this.config = {
      autoInitialize: true,
      enablePerformanceMonitoring: false,
      defaultTimeout: 300,
      maxConcurrentOperations: 10,
      cacheStrategy: 'memory',
      autoCleanupEnabled: true,
      cleanupIntervalSeconds: 300,
      ...config
    };

    this.contextService = new ContextService(repository, validator);
    
    // 转发Service层事件
    this.contextService.on('context.created', (data) => {
      this.emit('context.created', data);
    });
    
    this.contextService.on('context.updated', (data) => {
      this.emit('context.updated', data);
    });
    
    this.contextService.on('context.deleted', (data) => {
      this.emit('context.deleted', data);
    });

    if (this.config.autoInitialize) {
      this.initialize();
    }
  }

  // ===== 初始化和生命周期 =====

  /**
   * 初始化管理器
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // 启动自动清理
      if (this.config.autoCleanupEnabled) {
        this.startAutoCleanup();
      }

      this.isInitialized = true;
      
      logger.info('Context Manager initialized successfully', {
        config: this.config,
        auto_cleanup: this.config.autoCleanupEnabled
      });

      this.emit('manager.initialized', {
        timestamp: new Date().toISOString(),
        config: this.config
      });

    } catch (error) {
      logger.error('Failed to initialize Context Manager', { error });
      throw new ConfigurationError('Manager initialization failed', { error });
    }
  }

  /**
   * 关闭管理器
   */
  public async shutdown(): Promise<void> {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }

    this.sessions.clear();
    this.isInitialized = false;

    logger.info('Context Manager shutdown completed');
    this.emit('manager.shutdown', {
      timestamp: new Date().toISOString()
    });
  }

  // ===== 高级Context管理方法 =====

  /**
   * 创建用户上下文会话
   * 
   * @param userId 用户ID
   * @param userRole 用户角色
   * @param contextRequest 创建请求
   * @returns Context和会话信息
   */
  public async createUserContext(
    userId: string,
    userRole: string,
    contextRequest: CreateContextRequest
  ): Promise<ContextOperationResult<{ context: ContextProtocol; session: ContextSession }>> {
    const startTime = performance.now();

    try {
      this.ensureInitialized();

      // 创建Context
      const result = await this.contextService.createContext(
        contextRequest,
        userId,
        userRole
      );

      if (!result.success || !result.data) {
        return result as ContextOperationResult<any>;
      }

      // 创建会话
      const session = this.createSession(result.data.context_id, userId);

      const executionTime = performance.now() - startTime;

      this.emitManagerEvent('user.context.created', {
        context_id: result.data.context_id,
        timestamp: new Date().toISOString(),
        user_id: userId,
        action: 'create_user_context',
        metadata: { session_id: session.session_id }
      });

      return {
        success: true,
        data: {
          context: result.data,
          session
        },
        execution_time_ms: executionTime
      };

    } catch (error) {
      return this.buildManagerErrorResult(error, performance.now() - startTime);
    }
  }

  /**
   * 获取用户的所有上下文
   * 
   * @param userId 用户ID
   * @returns 用户的Context列表
   */
  public async getUserContexts(userId: string): Promise<ContextOperationResult<ContextProtocol[]>> {
    const startTime = performance.now();

    try {
      this.ensureInitialized();

      const filter: ContextFilter = {
        owner_user_ids: [userId]
      };

      const result = await this.contextService.queryContexts(filter);

      const executionTime = performance.now() - startTime;

      return {
        success: result.success,
        data: result.data,
        error: result.error,
        execution_time_ms: executionTime
      };

    } catch (error) {
      return this.buildManagerErrorResult(error, performance.now() - startTime);
    }
  }

  /**
   * 激活Context和关联会话
   * 
   * @param contextId Context ID
   * @param userId 用户ID
   * @returns 激活结果
   */
  public async activateContext(contextId: UUID, userId: string): Promise<ContextOperationResult<ContextSession>> {
    const startTime = performance.now();

    try {
      this.ensureInitialized();

      // 检查Context是否存在
      const contextResult = await this.contextService.getContext(contextId);
      if (!contextResult.success || !contextResult.data) {
        return {
          success: false,
          error: new ContextError(`Context not found: ${contextId}`, 'CONTEXT_NOT_FOUND'),
          execution_time_ms: performance.now() - startTime
        };
      }

      // 更新状态为active
      const updateResult = await this.contextService.updateStatus(contextId, 'active');
      if (!updateResult.success) {
        return {
          success: false,
          error: updateResult.error,
          execution_time_ms: performance.now() - startTime
        };
      }

      // 创建或更新会话
      let session = this.getActiveSession(contextId);
      if (!session) {
        session = this.createSession(contextId, userId);
      } else {
        session.last_active_at = new Date().toISOString();
      }

      const executionTime = performance.now() - startTime;

      this.emitManagerEvent('context.activated', {
        context_id: contextId,
        timestamp: new Date().toISOString(),
        user_id: userId,
        action: 'activate_context',
        metadata: { session_id: session.session_id }
      });

      return {
        success: true,
        data: session,
        execution_time_ms: executionTime
      };

    } catch (error) {
      return this.buildManagerErrorResult(error, performance.now() - startTime);
    }
  }

  /**
   * 暂停Context
   * 
   * @param contextId Context ID
   * @returns 暂停结果
   */
  public async suspendContext(contextId: UUID): Promise<ContextOperationResult<void>> {
    const startTime = performance.now();

    try {
      this.ensureInitialized();

      const result = await this.contextService.updateStatus(contextId, 'suspended');
      
      if (result.success) {
        // 清理关联会话
        this.cleanupContextSessions(contextId);

        this.emitManagerEvent('context.suspended', {
          context_id: contextId,
          timestamp: new Date().toISOString(),
          action: 'suspend_context'
        });
      }

      return {
        success: result.success,
        error: result.error,
        execution_time_ms: performance.now() - startTime
      };

    } catch (error) {
      return this.buildManagerErrorResult(error, performance.now() - startTime);
    }
  }

  /**
   * 完成Context
   * 
   * @param contextId Context ID
   * @returns 完成结果
   */
  public async completeContext(contextId: UUID): Promise<ContextOperationResult<void>> {
    const startTime = performance.now();

    try {
      this.ensureInitialized();

      // 更新状态为completed
      const statusResult = await this.contextService.updateStatus(contextId, 'completed');
      if (!statusResult.success) {
        return {
          success: false,
          error: statusResult.error,
          execution_time_ms: performance.now() - startTime
        };
      }

      // 更新生命周期为completed
      const lifecycleResult = await this.contextService.updateLifecycleStage(contextId, 'completed');
      if (!lifecycleResult.success) {
        return {
          success: false,
          error: lifecycleResult.error,
          execution_time_ms: performance.now() - startTime
        };
      }

      // 清理关联会话
      this.cleanupContextSessions(contextId);

      const executionTime = performance.now() - startTime;

      this.emitManagerEvent('context.completed', {
        context_id: contextId,
        timestamp: new Date().toISOString(),
        action: 'complete_context'
      });

      return {
        success: true,
        execution_time_ms: executionTime
      };

    } catch (error) {
      return this.buildManagerErrorResult(error, performance.now() - startTime);
    }
  }

  /**
   * 批量处理Contexts (高级封装)
   * 
   * @param request 批量请求
   * @returns 批量处理结果
   */
  public async batchProcessContexts(request: BatchContextRequest): Promise<ContextOperationResult<BatchContextResponse>> {
    const startTime = performance.now();

    try {
      this.ensureInitialized();

      const result = await this.contextService.batchProcessContexts(request);

      if (result.success && result.data) {
        this.emitManagerEvent('contexts.batch.processed', {
          context_id: 'batch',
          timestamp: new Date().toISOString(),
          action: 'batch_process',
          metadata: {
            total: result.data.summary.total,
            successful: result.data.summary.successful,
            failed: result.data.summary.failed
          }
        });
      }

      return {
        success: result.success,
        data: result.data,
        error: result.error,
        execution_time_ms: performance.now() - startTime
      };

    } catch (error) {
      return this.buildManagerErrorResult(error, performance.now() - startTime);
    }
  }

  // ===== 会话管理 =====

  /**
   * 获取活跃会话
   * 
   * @param contextId Context ID
   * @returns 会话信息
   */
  public getActiveSession(contextId: UUID): ContextSession | null {
    for (const session of Array.from(this.sessions.values())) {
      if (session.context_id === contextId) {
        // 检查是否过期
        if (session.expires_at && new Date(session.expires_at) < new Date()) {
          this.sessions.delete(session.session_id);
          return null;
        }
        return session;
      }
    }
    return null;
  }

  /**
   * 获取用户的所有会话
   * 
   * @param userId 用户ID
   * @returns 会话列表
   */
  public getUserSessions(userId: string): ContextSession[] {
    return Array.from(this.sessions.values())
      .filter(session => session.user_id === userId)
      .filter(session => {
        // 过滤过期会话
        if (session.expires_at && new Date(session.expires_at) < new Date()) {
          this.sessions.delete(session.session_id);
          return false;
        }
        return true;
      });
  }

  /**
   * 更新会话活跃时间
   * 
   * @param sessionId 会话ID
   */
  public updateSessionActivity(sessionId: UUID): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.last_active_at = new Date().toISOString();
    }
  }

  // ===== 统计和监控 =====

  /**
   * 获取Context统计信息
   * 
   * @returns 统计信息
   */
  public async getStatistics(): Promise<ContextStatistics> {
    try {
      // 获取所有Contexts进行统计
      const allContextsResult = await this.contextService.queryContexts({});
      const allContexts = allContextsResult.data || [];

      const activeContexts = allContexts.filter(ctx => ctx.status === 'active');
      const completedContexts = allContexts.filter(ctx => ctx.status === 'completed');
      
      const allSessions = Array.from(this.sessions.values());
      const activeSessions = allSessions.filter(session => {
        return !session.expires_at || new Date(session.expires_at) > new Date();
      });

      // 计算平均会话时长
      const sessionDurations = allSessions.map(session => {
        const start = new Date(session.created_at);
        const end = new Date(session.last_active_at);
        return (end.getTime() - start.getTime()) / (1000 * 60); // 分钟
      });
      
      const averageSessionDuration = sessionDurations.length > 0
        ? sessionDurations.reduce((a, b) => a + b, 0) / sessionDurations.length
        : 0;

      // 估算共享状态大小
      const sharedStateSizeMb = this.estimateSharedStateSize(allContexts);

      return {
        total_contexts: allContexts.length,
        active_contexts: activeContexts.length,
        completed_contexts: completedContexts.length,
        total_sessions: allSessions.length,
        active_sessions: activeSessions.length,
        average_session_duration_minutes: Math.round(averageSessionDuration),
        total_shared_state_size_mb: sharedStateSizeMb
      };

    } catch (error) {
      logger.error('Failed to get context statistics', { error });
      throw new InternalError('Statistics calculation failed', { error });
    }
  }

  // ===== 私有方法 =====

  /**
   * 确保管理器已初始化
   */
  private ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new ConfigurationError('Context Manager not initialized');
    }
  }

  /**
   * 创建会话
   */
  private createSession(contextId: UUID, userId: string): ContextSession {
    const sessionId = uuidv4();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + (this.config.defaultTimeout! * 1000));

    const session: ContextSession = {
      session_id: sessionId,
      context_id: contextId,
      user_id: userId,
      created_at: now.toISOString(),
      last_active_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
      metadata: {}
    };

    this.sessions.set(sessionId, session);
    return session;
  }

  /**
   * 清理Context关联的会话
   */
  private cleanupContextSessions(contextId: UUID): void {
    for (const [sessionId, session] of Array.from(this.sessions.entries())) {
      if (session.context_id === contextId) {
        this.sessions.delete(sessionId);
      }
    }
  }

  /**
   * 启动自动清理
   */
  private startAutoCleanup(): void {
    const intervalMs = this.config.cleanupIntervalSeconds! * 1000;
    
    this.cleanupTimer = setInterval(() => {
      this.performCleanup();
    }, intervalMs);

    logger.info('Auto cleanup started', { 
      interval_seconds: this.config.cleanupIntervalSeconds 
    });
  }

  /**
   * 执行清理任务
   */
  private performCleanup(): void {
    const now = new Date();
    let expiredCount = 0;

    // 清理过期会话
    for (const [sessionId, session] of Array.from(this.sessions.entries())) {
      if (session.expires_at && new Date(session.expires_at) < now) {
        this.sessions.delete(sessionId);
        expiredCount++;
      }
    }

    if (expiredCount > 0) {
      logger.info('Cleanup completed', { 
        expired_sessions: expiredCount,
        active_sessions: this.sessions.size
      });

      this.emit('cleanup.completed', {
        timestamp: now.toISOString(),
        expired_sessions: expiredCount,
        active_sessions: this.sessions.size
      });
    }
  }

  /**
   * 估算共享状态大小
   */
  private estimateSharedStateSize(contexts: ContextProtocol[]): number {
    try {
      const totalBytes = contexts.reduce((total, context) => {
        const stateStr = JSON.stringify(context.shared_state);
        return total + stateStr.length;
      }, 0);

      return Math.round(totalBytes / (1024 * 1024) * 100) / 100; // MB，保留2位小数
    } catch {
      return 0;
    }
  }

  /**
   * 发射管理器事件
   */
  private emitManagerEvent(eventName: string, data: ContextManagerEventData): void {
    this.emit(eventName, data);
    this.emit('manager.event', { event: eventName, ...data });
  }

  /**
   * 构建管理器错误结果
   */
  private buildManagerErrorResult<T>(error: unknown, executionTime: number): ContextOperationResult<T> {
    let contextError: ContextError;
    
    if (error instanceof ContextError) {
      contextError = error;
    } else if (error instanceof Error) {
      contextError = new InternalError(error.message, { originalError: error });
    } else {
      contextError = new InternalError('Unknown manager error occurred', { error });
    }

    return {
      success: false,
      error: contextError,
      execution_time_ms: executionTime
    };
  }
} 