/**
 * MPLP Context WebSocket处理器
 * 
 * @version v1.0.1
 * @created 2025-07-09T23:45:00+08:00
 * @updated 2025-07-15T16:45:00+08:00
 * @compliance .cursor/rules/architecture.mdc - WebSocket实时通信规范
 * @compliance .cursor/rules/vendor-neutral-design.mdc - 厂商中立设计
 */

import { Server as SocketIOServer, Socket } from 'socket.io';
import { logger } from '../../utils/logger';
import { PerformanceMonitor } from '../../utils/performance';
import { ITraceAdapter } from '../../interfaces/trace-adapter.interface';
import { MPLPTraceData, TraceType, TraceStatus } from '../../types/trace';
import { ContextService } from './context-service';
import { 
  ContextEvent, 
  ContextEventType,
  ContextOperationResult 
} from './types';

/**
 * Context模块WebSocket事件定义
 */
interface ContextSocketEvents {
  // 客户端发送的事件
  'join_context': (contextId: string) => void;
  'leave_context': (contextId: string) => void;
  'subscribe_events': (eventTypes: ContextEventType[]) => void;
  'unsubscribe_events': (eventTypes: ContextEventType[]) => void;
  'get_context': (contextId: string, callback: (result: ContextOperationResult) => void) => void;
  'set_shared_state': (data: {
    contextId: string;
    key: string;
    value: unknown;
    metadata?: any;
  }, callback: (result: ContextOperationResult) => void) => void;

  // 服务器发送的事件
  'context_event': (event: ContextEvent) => void;
  'context_events': (event: ContextEvent) => void;
  'context_updated': (data: { contextId: string; changes: any }) => void;
  'shared_state_changed': (data: { contextId: string; key: string; value: unknown }) => void;
  'connection_status': (status: { connected: boolean; contextCount: number }) => void;
  'error': (error: { message: string; code: string }) => void;
}

/**
 * Context WebSocket处理器
 */
export class ContextWebSocketHandler {
  private io: SocketIOServer;
  private contextService: ContextService;
  private traceAdapter?: ITraceAdapter;
  private connectedSockets: Map<string, Socket> = new Map();
  private socketContexts: Map<string, Set<string>> = new Map(); // socketId -> contextIds
  private contextSubscriptions: Map<string, Set<string>> = new Map(); // contextId -> socketIds

  constructor(
    io: SocketIOServer,
    contextService: ContextService,
    traceAdapter?: ITraceAdapter
  ) {
    this.io = io;
    this.contextService = contextService;
    this.traceAdapter = traceAdapter;
    this.setupEventHandlers();

    logger.info('Context WebSocket处理器初始化完成', {
      module: 'ContextWebSocket',
      trace_adapter_enabled: !!traceAdapter,
      trace_adapter_type: traceAdapter?.getAdapterInfo().type
    });
  }

  /**
   * 设置事件处理器
   */
  private setupEventHandlers(): void {
    // 监听Context服务事件
    this.contextService.on('context_created', this.handleContextEvent.bind(this));
    this.contextService.on('context_updated', this.handleContextEvent.bind(this));
    this.contextService.on('shared_state_changed', this.handleContextEvent.bind(this));
    this.contextService.on('context_terminated', this.handleContextEvent.bind(this));

    // 设置WebSocket连接处理
    this.io.on('connection', this.handleConnection.bind(this));
  }

  /**
   * 处理WebSocket连接
   */
  @PerformanceMonitor.measure('context_websocket.connection')
  private async handleConnection(socket: Socket): Promise<void> {
    const socketId = socket.id;
    const userId = socket.handshake.auth?.userId || socket.handshake.query?.userId as string;
    const userAgent = socket.handshake.headers['user-agent'];

    logger.info('Context WebSocket连接建立', {
      module: 'ContextWebSocket',
      socket_id: socketId,
      user_id: userId,
      user_agent: userAgent
    });

    // 存储连接
    this.connectedSockets.set(socketId, socket);
    this.socketContexts.set(socketId, new Set());

    // 追踪事件
    await this.trackSocketEvent('websocket_connected', socketId, {
      user_id: userId,
      user_agent: userAgent
    });

    // 发送连接状态
    socket.emit('connection_status', {
      connected: true,
      contextCount: 0
    });

    // 设置事件监听器
    this.setupSocketEventHandlers(socket);

    // 处理断开连接
    socket.on('disconnect', () => this.handleDisconnection(socket));
  }

  /**
   * 设置Socket事件处理器
   */
  private setupSocketEventHandlers(socket: Socket): void {
    const socketId = socket.id;

    // 加入Context房间
    socket.on('join_context', async (contextId: string) => {
      await this.handleJoinContext(socket, contextId);
    });

    // 离开Context房间
    socket.on('leave_context', async (contextId: string) => {
      await this.handleLeaveContext(socket, contextId);
    });

    // 订阅事件类型
    socket.on('subscribe_events', (eventTypes: ContextEventType[]) => {
      this.handleSubscribeEvents(socket, eventTypes);
    });

    // 取消订阅事件类型
    socket.on('unsubscribe_events', (eventTypes: ContextEventType[]) => {
      this.handleUnsubscribeEvents(socket, eventTypes);
    });

    // 获取Context
    socket.on('get_context', async (contextId: string, callback) => {
      const result = await this.contextService.getContext(contextId);
      callback(result);
    });

    // 设置共享状态
    socket.on('set_shared_state', async (data, callback) => {
      const { contextId, key, value, metadata = {} } = data;
      
      // 验证权限 - 检查用户是否有权限修改此Context
      const hasPermission = await this.verifyContextPermission(socket, contextId, 'write');
      if (!hasPermission) {
        callback({
          success: false,
          error: 'Permission denied',
          error_code: 'PERMISSION_DENIED',
          context_id: contextId,
          operation_time_ms: 0
        });
        return;
      }

      metadata.source_module = 'websocket';
      const result = await this.contextService.setSharedState(contextId, key, value, metadata);
      callback(result);
    });

    // 错误处理
    socket.on('error', (error) => {
      logger.error('Context WebSocket错误', {
        module: 'ContextWebSocket',
        socket_id: socketId,
        error: error.message
      });
    });
  }

  /**
   * 处理加入Context房间
   */
  @PerformanceMonitor.measure('context_websocket.join_context')
  private async handleJoinContext(socket: Socket, contextId: string): Promise<void> {
    const socketId = socket.id;
    
    try {
      // 验证Context存在性
      const contextResult = await this.contextService.getContext(contextId);
      if (!contextResult.success) {
        socket.emit('error', {
          message: `Context ${contextId} not found`,
          code: 'CONTEXT_NOT_FOUND'
        });
        return;
      }

      // 验证权限
      const hasPermission = await this.verifyContextPermission(socket, contextId, 'read');
      if (!hasPermission) {
        socket.emit('error', {
          message: 'Permission denied to join context',
          code: 'PERMISSION_DENIED'
        });
        return;
      }

      // 加入房间
      await socket.join(`context:${contextId}`);

      // 更新订阅映射
      const socketContexts = this.socketContexts.get(socketId) || new Set();
      socketContexts.add(contextId);
      this.socketContexts.set(socketId, socketContexts);

      const contextSubs = this.contextSubscriptions.get(contextId) || new Set();
      contextSubs.add(socketId);
      this.contextSubscriptions.set(contextId, contextSubs);

      // 发送当前Context状态
      socket.emit('context_updated', {
        contextId,
        changes: {
          action: 'joined',
          context: contextResult.data
        }
      });

      // 更新连接状态
      socket.emit('connection_status', {
        connected: true,
        contextCount: socketContexts.size
      });

      logger.info('Socket加入Context房间', {
        module: 'ContextWebSocket',
        socket_id: socketId,
        context_id: contextId,
        total_contexts: socketContexts.size
      });

      // 追踪事件
      await this.trackSocketEvent('joined_context', socketId, {
        context_id: contextId,
        total_contexts: socketContexts.size
      });

    } catch (error) {
      logger.error('Socket加入Context房间失败', {
        module: 'ContextWebSocket',
        socket_id: socketId,
        context_id: contextId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      socket.emit('error', {
        message: 'Failed to join context',
        code: 'JOIN_CONTEXT_FAILED'
      });
    }
  }

  /**
   * 处理离开Context房间
   */
  @PerformanceMonitor.measure('context_websocket.leave_context')
  private async handleLeaveContext(socket: Socket, contextId: string): Promise<void> {
    const socketId = socket.id;

    try {
      // 离开房间
      await socket.leave(`context:${contextId}`);

      // 更新订阅映射
      const socketContexts = this.socketContexts.get(socketId);
      if (socketContexts) {
        socketContexts.delete(contextId);
      }

      const contextSubs = this.contextSubscriptions.get(contextId);
      if (contextSubs) {
        contextSubs.delete(socketId);
        if (contextSubs.size === 0) {
          this.contextSubscriptions.delete(contextId);
        }
      }

      // 更新连接状态
      socket.emit('connection_status', {
        connected: true,
        contextCount: socketContexts?.size || 0
      });

      logger.info('Socket离开Context房间', {
        module: 'ContextWebSocket',
        socket_id: socketId,
        context_id: contextId,
        remaining_contexts: socketContexts?.size || 0
      });

      // 追踪事件
      await this.trackSocketEvent('left_context', socketId, {
        context_id: contextId,
        remaining_contexts: socketContexts?.size || 0
      });

    } catch (error) {
      logger.error('Socket离开Context房间失败', {
        module: 'ContextWebSocket',
        socket_id: socketId,
        context_id: contextId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * 处理订阅事件类型
   */
  private handleSubscribeEvents(socket: Socket, eventTypes: ContextEventType[]): void {
    const socketId = socket.id;

    for (const eventType of eventTypes) {
      socket.join(`event:${eventType}`);
    }

    logger.info('Socket订阅事件类型', {
      module: 'ContextWebSocket',
      socket_id: socketId,
      event_types: eventTypes
    });
  }

  /**
   * 处理取消订阅事件类型
   */
  private handleUnsubscribeEvents(socket: Socket, eventTypes: ContextEventType[]): void {
    const socketId = socket.id;

    for (const eventType of eventTypes) {
      socket.leave(`event:${eventType}`);
    }

    logger.info('Socket取消订阅事件类型', {
      module: 'ContextWebSocket',
      socket_id: socketId,
      event_types: eventTypes
    });
  }

  /**
   * 处理断开连接
   */
  @PerformanceMonitor.measure('context_websocket.disconnection')
  private async handleDisconnection(socket: Socket): Promise<void> {
    const socketId = socket.id;

    logger.info('Context WebSocket连接断开', {
      module: 'ContextWebSocket',
      socket_id: socketId
    });

    // 清理订阅映射
    const socketContexts = this.socketContexts.get(socketId);
    if (socketContexts) {
      for (const contextId of socketContexts) {
        const contextSubs = this.contextSubscriptions.get(contextId);
        if (contextSubs) {
          contextSubs.delete(socketId);
          if (contextSubs.size === 0) {
            this.contextSubscriptions.delete(contextId);
          }
        }
      }
    }

    // 清理连接记录
    this.connectedSockets.delete(socketId);
    this.socketContexts.delete(socketId);

    // 追踪事件
    await this.trackSocketEvent('websocket_disconnected', socketId, {
      contexts_count: socketContexts?.size || 0
    });
  }

  /**
   * 处理Context事件
   */
  private handleContextEvent(event: ContextEvent): void {
    const { event_type, context_id } = event;

    // 发送到Context房间
    this.io.to(`context:${context_id}`).emit('context_event', event);

    // 发送到事件类型订阅者
    this.io.to(`event:${event_type}`).emit('context_events', event);

    // 特定事件的额外处理
    switch (event_type) {
      case 'shared_state_changed':
        this.handleSharedStateChanged(event);
        break;
      case 'context_terminated':
        this.handleContextTerminated(event);
        break;
    }

    logger.debug('Context事件已广播', {
      module: 'ContextWebSocket',
      event_type,
      context_id,
      subscribers: this.contextSubscriptions.get(context_id)?.size || 0
    });
  }

  /**
   * 处理共享状态变更事件
   */
  private handleSharedStateChanged(event: ContextEvent): void {
    const { context_id, data } = event;
    
    if (data && typeof data === 'object' && 'key' in data && 'value' in data) {
      this.io.to(`context:${context_id}`).emit('shared_state_changed', {
        contextId: context_id,
        key: (data as any).key,
        value: (data as any).value
      });
    }
  }

  /**
   * 处理Context终止事件
   */
  private handleContextTerminated(event: ContextEvent): void {
    const { context_id } = event;
    
    // 通知所有订阅者Context已终止
    this.io.to(`context:${context_id}`).emit('context_updated', {
      contextId: context_id,
      changes: {
        action: 'terminated',
        reason: 'Context has been terminated'
      }
    });

    // 强制所有连接离开该Context房间
    const sockets = this.io.sockets.adapter.rooms.get(`context:${context_id}`);
    if (sockets) {
      for (const socketId of sockets) {
        const socket = this.connectedSockets.get(socketId);
        if (socket) {
          socket.leave(`context:${context_id}`);
        }
      }
    }

    // 清理订阅映射
    this.contextSubscriptions.delete(context_id);
  }

  /**
   * 验证Context权限
   */
  private async verifyContextPermission(
    socket: Socket, 
    contextId: string, 
    action: 'read' | 'write'
  ): Promise<boolean> {
    // TODO: 实现真正的权限验证逻辑
    // 这里暂时返回true，实际应该检查用户角色和权限
    
    const userId = socket.handshake.auth?.userId || socket.handshake.query?.userId as string;
    
    // 获取Context以检查用户是否有权限
    try {
      const contextResult = await this.contextService.getContext(contextId);
      if (!contextResult.success) {
        return false;
      }

      const context = contextResult.data!;
      
      // 简单的权限检查：Context所有者有所有权限
      if (context.access_control.owner.user_id === userId) {
        return true;
      }

      // TODO: 检查角色权限、共享权限等
      return true; // 暂时允许所有操作
      
    } catch (error) {
      logger.error('权限验证失败', {
        module: 'ContextWebSocket',
        context_id: contextId,
        user_id: userId,
        action,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  }

  /**
   * 追踪事件
   */
  private async trackSocketEvent(
    eventType: string,
    socketId: string,
    data: Record<string, unknown>
  ): Promise<void> {
    if (!this.traceAdapter) return;

    try {
      // 创建符合MPLPTraceData接口的追踪数据
      const traceId = `socket-${socketId}-${Date.now()}`;
      const timestamp = new Date().toISOString();
      
      const traceData = {
        trace_id: traceId,
        protocol_version: '1.0.1',
        timestamp: timestamp,
        context_id: (data.context_id as string) || 'global',
        operation_name: `websocket_${eventType}`,
        start_time: timestamp,
        end_time: timestamp,
        duration_ms: 0,
        trace_type: 'event' as TraceType,
        status: 'completed' as TraceStatus,
        metadata: {
          socket_id: socketId,
          ...data
        },
        events: [],
        performance_metrics: {
          cpu_usage: 0,
          memory_usage_mb: 0,
          network_io_bytes: 0,
          disk_io_bytes: 0
        },
        error_info: null,
        parent_trace_id: null,
        adapter_metadata: {
          agent_id: 'context-websocket',
          session_id: socketId,
          operation_complexity: 'low' as 'low' | 'medium' | 'high',
          expected_duration_ms: 0,
          quality_gates: {
            max_duration_ms: 0,
            max_memory_mb: 0,
            max_error_rate: 0,
            required_events: []
          }
        }
      };
      
      // 使用厂商中立的接口方法
      await this.traceAdapter.syncTraceData(traceData);
    } catch (error) {
      logger.warn('WebSocket事件追踪失败', {
        event_type: eventType,
        socket_id: socketId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * 获取连接统计
   */
  getConnectionStats(): {
    total_connections: number;
    total_context_subscriptions: number;
    active_contexts: number;
  } {
    return {
      total_connections: this.connectedSockets.size,
      total_context_subscriptions: Array.from(this.socketContexts.values())
        .reduce((total, contexts) => total + contexts.size, 0),
      active_contexts: this.contextSubscriptions.size
    };
  }

  /**
   * 广播消息到特定Context
   */
  broadcastToContext(contextId: string, event: string, data: unknown): void {
    this.io.to(`context:${contextId}`).emit(event, data);
  }

  /**
   * 广播消息到所有连接
   */
  broadcastToAll(event: string, data: unknown): void {
    this.io.emit(event, data);
  }
} 