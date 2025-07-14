/**
 * Extension Integration
 * 
 * 扩展模块与其他核心模块的集成
 * 
 * @version 1.0.1
 * @created 2025-07-15T12:00:00+08:00
 * @updated 2025-07-16T10:15:00+08:00
 * @compliance .cursor/rules/schema-design.mdc
 */

import { EventEmitter } from 'events';
import { 
  IContextManager, 
  IRoleManager, 
  ITraceManager 
} from '../../interfaces/module-integration.interface';
import { ITraceAdapter } from '../../interfaces/trace-adapter.interface';
import { ExtensionProtocol, ExtensionEvent } from './types';
import { logger } from '../../utils/logger';
import { MPLPTraceData } from '../../types/trace';

/**
 * 扩展点对象类型
 */
export interface ExtensionPoint {
  point_id: string;
  name: string;
  type: 'hook' | 'filter' | 'action' | 'api_endpoint' | 'event_listener';
  target_module: 'context' | 'plan' | 'confirm' | 'trace' | 'role' | 'extension' | 'system';
  event_name: string;
  execution_order: number;
  enabled: boolean;
  handler: {
    function_name: string;
    parameters?: Record<string, unknown>;
    timeout_ms?: number;
  };
  conditions?: {
    when?: string;
    required_permissions?: string[];
    context_filters?: Record<string, unknown>;
  };
}

/**
 * 扩展模块集成类
 * 
 * 负责扩展模块与其他核心模块的集成
 * 遵循厂商中立原则，使用接口而非具体实现
 */
export class ExtensionIntegration extends EventEmitter {
  private contextManager?: IContextManager;
  private roleManager?: IRoleManager;
  private traceManager?: ITraceManager;
  private traceAdapter?: ITraceAdapter;
  
  /**
   * 设置Context模块集成
   * @param contextManager Context管理器
   */
  public setContextManager(contextManager: IContextManager): void {
    this.contextManager = contextManager;
    logger.info('Extension模块已与Context模块集成');
  }
  
  /**
   * 设置Role模块集成
   * @param roleManager Role管理器
   */
  public setRoleManager(roleManager: IRoleManager): void {
    this.roleManager = roleManager;
    logger.info('Extension模块已与Role模块集成');
  }
  
  /**
   * 设置Trace模块集成
   * @param traceManager Trace管理器
   */
  public setTraceManager(traceManager: ITraceManager): void {
    this.traceManager = traceManager;
    logger.info('Extension模块已与Trace模块集成');
  }
  
  /**
   * 设置Trace适配器
   * @param adapter Trace适配器
   */
  public setTraceAdapter(adapter: ITraceAdapter): void {
    this.traceAdapter = adapter;
    logger.info('Extension模块已设置Trace适配器');
  }
  
  /**
   * 验证上下文存在
   * @param contextId 上下文ID
   */
  public async validateContextExists(contextId: string): Promise<boolean> {
    if (!this.contextManager) {
      logger.warn('Context模块未集成，无法验证上下文');
      return true; // 默认通过，避免阻塞
    }
    
    try {
      return await this.contextManager.validateContextExists(contextId);
    } catch (error) {
      logger.error('验证上下文失败', { 
        context_id: contextId,
        error: error instanceof Error ? error.message : String(error)
      });
      return false;
    }
  }
  
  /**
   * 检查扩展权限
   * @param userId 用户ID
   * @param extensionId 扩展ID
   * @param action 操作
   */
  public async checkExtensionPermission(
    userId: string,
    extensionId: string,
    action: 'install' | 'update' | 'activate' | 'deactivate' | 'uninstall' | 'configure'
  ): Promise<boolean> {
    if (!this.roleManager) {
      logger.warn('Role模块未集成，无法检查权限');
      return true; // 默认通过，避免阻塞
    }
    
    try {
      return await this.roleManager.checkPermission(userId, 'extension', action);
    } catch (error) {
      logger.error('检查扩展权限失败', { 
        user_id: userId,
        extension_id: extensionId,
        action,
        error: error instanceof Error ? error.message : String(error)
      });
      return false;
    }
  }
  
  /**
   * 记录扩展事件
   * @param event 扩展事件
   */
  public async recordExtensionEvent(event: ExtensionEvent): Promise<void> {
    if (!this.traceManager) {
      logger.warn('Trace模块未集成，无法记录事件');
      return;
    }
    
    try {
      await this.traceManager.recordTrace({
        trace_type: 'extension_event',
        extension_id: event.extension_id,
        event_type: event.event_type,
        timestamp: event.timestamp,
        data: event.data
      });
    } catch (error) {
      logger.error('记录扩展事件失败', { 
        event_type: event.event_type,
        extension_id: event.extension_id,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
  
  /**
   * 同步扩展到Trace系统
   * @param extension 扩展
   */
  public async syncExtensionToTrace(extension: ExtensionProtocol): Promise<boolean> {
    if (!this.traceAdapter) {
      logger.warn('Trace适配器未设置，无法同步扩展');
      return false;
    }
    
    try {
      // 创建符合MPLPTraceData类型的数据
      const traceData: MPLPTraceData = {
        trace_id: `extension-sync-${extension.extension_id}`,
        context_id: extension.context_id || 'default-context',
        operation_name: 'extension_sync',
        start_time: new Date().toISOString(),
        end_time: new Date().toISOString(),
        duration_ms: 0,
        trace_type: 'operation',
        status: 'completed',
        metadata: {
          extension_id: extension.extension_id,
          name: extension.name,
          version: extension.version,
          type: extension.type,
          status: extension.status
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
        protocol_version: '1.0.0',
        timestamp: new Date().toISOString(),
        adapter_metadata: {
          agent_id: 'extension-module',
          session_id: extension.extension_id,
          operation_complexity: 'low',
          expected_duration_ms: 100,
          quality_gates: {
            max_duration_ms: 1000,
            max_memory_mb: 100,
            max_error_rate: 0.01,
            required_events: ['trace_start', 'trace_end']
          }
        }
      };
      
      const result = await this.traceAdapter.syncTraceData(traceData);
      
      return result.success;
    } catch (error) {
      logger.error('同步扩展到Trace系统失败', { 
        extension_id: extension.extension_id,
        error: error instanceof Error ? error.message : String(error)
      });
      return false;
    }
  }
  
  /**
   * 更新上下文状态
   * @param contextId 上下文ID
   * @param updates 状态更新
   */
  public async updateContextState(contextId: string, updates: Record<string, unknown>): Promise<boolean> {
    if (!this.contextManager) {
      logger.warn('Context模块未集成，无法更新上下文状态');
      return false;
    }
    
    try {
      return await this.contextManager.updateContextState(contextId, updates);
    } catch (error) {
      logger.error('更新上下文状态失败', { 
        context_id: contextId,
        error: error instanceof Error ? error.message : String(error)
      });
      return false;
    }
  }
  
  /**
   * 获取上下文状态
   * @param contextId 上下文ID
   */
  public async getContextState(contextId: string): Promise<Record<string, unknown> | null> {
    if (!this.contextManager) {
      logger.warn('Context模块未集成，无法获取上下文状态');
      return null;
    }
    
    try {
      return await this.contextManager.getContextState(contextId);
    } catch (error) {
      logger.error('获取上下文状态失败', { 
        context_id: contextId,
        error: error instanceof Error ? error.message : String(error)
      });
      return null;
    }
  }

  /**
   * 通知目标模块注册扩展点
   * @param targetModule 目标模块
   * @param extensionPoint 扩展点
   */
  public async notifyModuleExtensionPointRegistered(
    targetModule: 'context' | 'plan' | 'confirm' | 'trace' | 'role' | 'extension' | 'system',
    extensionPoint: ExtensionPoint
  ): Promise<boolean> {
    try {
      logger.debug('通知模块注册扩展点', {
        target_module: targetModule,
        point_name: extensionPoint.name
      });
      
      // 发送扩展点注册事件
      this.emit('extension_point_registered', {
        target_module: targetModule,
        extension_point: extensionPoint
      });
      
      // 根据目标模块分发到不同管理器
      switch (targetModule) {
        case 'context':
          if (this.contextManager) {
            // 在实际实现中，这里应该调用具体方法
            return true;
          }
          break;
        case 'trace':
          if (this.traceManager) {
            // 在实际实现中，这里应该调用具体方法
            return true;
          }
          break;
        case 'role':
          if (this.roleManager) {
            // 在实际实现中，这里应该调用具体方法
            return true;
          }
          break;
        case 'system':
          // 系统级扩展点直接处理
          return true;
        default:
          logger.warn('未知的目标模块', { target_module: targetModule });
          return false;
      }
      
      logger.warn('目标模块未集成', { target_module: targetModule });
      return false;
    } catch (error) {
      logger.error('通知模块注册扩展点失败', {
        target_module: targetModule,
        point_name: extensionPoint.name,
        error: error instanceof Error ? error.message : String(error)
      });
      return false;
    }
  }
  
  /**
   * 通知目标模块取消注册扩展点
   * @param targetModule 目标模块
   * @param pointId 扩展点ID
   */
  public async notifyModuleExtensionPointUnregistered(
    targetModule: 'context' | 'plan' | 'confirm' | 'trace' | 'role' | 'extension' | 'system',
    pointId: string
  ): Promise<boolean> {
    try {
      logger.debug('通知模块取消注册扩展点', {
        target_module: targetModule,
        point_id: pointId
      });
      
      // 发送扩展点取消注册事件
      this.emit('extension_point_unregistered', {
        target_module: targetModule,
        point_id: pointId
      });
      
      // 根据目标模块分发到不同管理器
      switch (targetModule) {
        case 'context':
          if (this.contextManager) {
            // 在实际实现中，这里应该调用具体方法
            return true;
          }
          break;
        case 'trace':
          if (this.traceManager) {
            // 在实际实现中，这里应该调用具体方法
            return true;
          }
          break;
        case 'role':
          if (this.roleManager) {
            // 在实际实现中，这里应该调用具体方法
            return true;
          }
          break;
        case 'system':
          // 系统级扩展点直接处理
          return true;
        default:
          logger.warn('未知的目标模块', { target_module: targetModule });
          return false;
      }
      
      logger.warn('目标模块未集成', { target_module: targetModule });
      return false;
    } catch (error) {
      logger.error('通知模块取消注册扩展点失败', {
        target_module: targetModule,
        point_id: pointId,
        error: error instanceof Error ? error.message : String(error)
      });
      return false;
    }
  }
} 