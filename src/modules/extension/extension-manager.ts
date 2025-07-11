/**
 * Extension管理器
 * 负责扩展模块的生命周期管理、性能监控和系统集成
 * 
 * @version 1.0.1
 * @created 2025-07-10T15:15:00+08:00
 * @compliance .cursor/rules/schema-design.mdc
 * @author MPLP开发团队
 */

import { EventEmitter } from 'events';
import { 
  ExtensionProtocol,
  ExtensionStatus,
  InstallExtensionRequest,
  UpdateExtensionRequest,
  UpdateConfigurationRequest,
  ExtensionActivationRequest,
  ExtensionSearchCriteria,
  ExtensionInstallResult,
  ExtensionStatistics,
  ExtensionEvent,
  ExtensionOperation,
  ExtensionErrorCode,
  ExtensionManagerConfiguration,
  ExtensionExecutionResult,
  EXTENSION_CONSTANTS
} from './types';
import { ExtensionService } from './extension-service';
import { logger } from '../../utils/logger';
import { Performance } from '../../utils/performance';
import { UUID, Timestamp } from '../../types/index';

/**
 * Extension管理器状态
 */
interface ExtensionManagerState {
  status: 'initializing' | 'ready' | 'error' | 'shutdown';
  total_extensions: number;
  active_extensions: number;
  failed_extensions: number;
  last_health_check: Timestamp;
  startup_time: Timestamp;
}

/**
 * Extension管理器
 * 
 * 性能目标：
 * - 管理器初始化 < 500ms
 * - 扩展操作协调 < 20ms
 * - 系统监控开销 < 1% CPU
 * - 支持 > 100 个并发扩展
 */
export class ExtensionManager extends EventEmitter {
  private readonly extensionService: ExtensionService;
  private readonly performanceMonitor: Performance;
  private readonly config: ExtensionManagerConfiguration;
  private readonly state: ExtensionManagerState;
  private readonly operationQueue = new Map<string, Promise<any>>();
  private readonly extensionRegistry = new Map<string, ExtensionProtocol>();
  
  // 定时器管理
  private healthCheckTimer?: NodeJS.Timeout;
  private metricsTimer?: NodeJS.Timeout;
  private cleanupTimer?: NodeJS.Timeout;

  // 性能监控
  private operationMetrics = new Map<ExtensionOperation | string, number[]>();
  private concurrentOperations = 0;
  private readonly maxConcurrentOperations: number = 50;
  private readonly healthCheckInterval = 60; // 默认60秒

  constructor(config: Partial<ExtensionManagerConfiguration> = {}) {
    super();

    // 初始化配置
    this.config = {
      registry_enabled: config.registry_enabled ?? true,
      auto_update_enabled: config.auto_update_enabled ?? true,
      security_scanning_enabled: config.security_scanning_enabled ?? true,
      performance_monitoring_enabled: config.performance_monitoring_enabled ?? true,
      sandbox_enabled: config.sandbox_enabled ?? true,
      allowed_extension_types: config.allowed_extension_types || ['plugin', 'adapter', 'connector', 'middleware', 'hook', 'transformer'],
      resource_limits: config.resource_limits || {
        max_memory_mb: EXTENSION_CONSTANTS.DEFAULT_MAX_MEMORY_MB,
        max_cpu_percent: EXTENSION_CONSTANTS.DEFAULT_MAX_CPU_PERCENT,
        max_disk_mb: 1000,
        max_network_requests_per_minute: 100,
        max_execution_time_ms: 30000
      },
      security_settings: config.security_settings || {
        code_signing_required: false,
        sandbox_isolation_enabled: true,
        permission_system_enabled: true,
        audit_logging_enabled: true,
        trusted_publishers: [],
        blocked_extensions: []
      },
      marketplace_settings: config.marketplace_settings
    };

    // 初始化状态
    this.state = {
      status: 'initializing',
      total_extensions: 0,
      active_extensions: 0,
      failed_extensions: 0,
      last_health_check: new Date().toISOString() as Timestamp,
      startup_time: new Date().toISOString() as Timestamp
    };

    // 初始化服务
    this.extensionService = new ExtensionService();
    this.performanceMonitor = new Performance();

    // 绑定事件监听
    this.setupEventListeners();

    logger.info('Extension管理器初始化', { config: this.config });
  }

  // ================== 生命周期管理 ==================

  /**
   * 启动Extension管理器
   * 目标性能: < 500ms 完成初始化
   */
  public async start(): Promise<void> {
    const startTime = Date.now();

    try {
      logger.info('启动Extension管理器...');

      // 1. 初始化扩展服务
      await this.initializeExtensionService();

      // 2. 加载已安装的扩展
      await this.loadInstalledExtensions();

      // 3. 启动系统监控
      this.startSystemMonitoring();

      // 4. 启动健康检查
      this.startHealthCheckMonitoring();

      // 5. 启动清理任务
      this.startCleanupTasks();

      // 6. 更新状态
      this.state.status = 'ready';
      this.updateManagerState();

      const initTime = Date.now() - startTime;
      logger.info('Extension管理器启动成功', { 
        initialization_time_ms: initTime,
        total_extensions: this.state.total_extensions,
        active_extensions: this.state.active_extensions
      });

      // 发送启动事件
      this.emit('manager_started', { 
        initialization_time_ms: initTime,
        config: this.config 
      });

    } catch (error: unknown) {
      this.state.status = 'error';
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Extension管理器启动失败', { 
        error: errorMessage,
        initialization_time_ms: Date.now() - startTime
      });
      this.emit('manager_error', { error: errorMessage });
      throw error;
    }
  }

  /**
   * 停止Extension管理器
   * 目标性能: < 1000ms 完成清理
   */
  public async stop(): Promise<void> {
    const startTime = Date.now();

    try {
      logger.info('停止Extension管理器...');

      this.state.status = 'shutdown';

      // 1. 停止所有定时器
      this.stopAllTimers();

      // 2. 停用所有活跃扩展
      await this.deactivateAllExtensions();

      // 3. 等待所有操作完成
      await this.waitForOperationsToComplete();

      // 4. 清理资源
      await this.cleanup();

      const shutdownTime = Date.now() - startTime;
      logger.info('Extension管理器停止成功', { 
        shutdown_time_ms: shutdownTime
      });

      // 发送停止事件
      this.emit('manager_stopped', { 
        shutdown_time_ms: shutdownTime 
      });

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Extension管理器停止失败', { 
        error: errorMessage,
        shutdown_time_ms: Date.now() - startTime
      });
      this.emit('manager_error', { error: errorMessage });
      throw error;
    }
  }

  // ================== 扩展管理 ==================

  /**
   * 安装扩展
   * 目标性能: < 5000ms 完成安装
   */
  public async installExtension(request: InstallExtensionRequest): Promise<ExtensionInstallResult> {
        const startTime = Date.now();
    const operationKey = `install:${request.name}:${Date.now()}`;

        try {
      logger.info('安装扩展', { name: request.name, source: request.source });

          // 验证管理器状态
          this.validateManagerState();
          this.validateConcurrencyLimits();

      // 执行安装操作
      const result = await this.executeWithConcurrencyControl<ExtensionInstallResult>(
        'install',
        operationKey,
        async () => {
          // 1. 调用服务安装扩展
          const extension = await this.extensionService.installExtension(request);

          // 2. 将ExtensionProtocol对象添加到注册表
          if (extension && extension.extension_id) {
            // 确保extension是ExtensionProtocol类型
            const extensionProtocol = extension as unknown as ExtensionProtocol;
            this.extensionRegistry.set(extension.extension_id, extensionProtocol);

            // 3. 更新管理器状态
            this.state.total_extensions++;
            if (extensionProtocol.status === 'active') {
              this.state.active_extensions++;
            }
              this.updateManagerState();

            // 4. 发送事件
            const event: ExtensionEvent = {
              event_type: 'extension_installed',
              extension_id: extension.extension_id,
              timestamp: new Date().toISOString() as Timestamp,
              data: {
                name: extensionProtocol.name,
                version: extensionProtocol.version,
                type: extensionProtocol.type,
                installation_time_ms: Date.now() - startTime
              }
            };
            this.handleExtensionEvent(event);

            // 5. 返回结果
            return {
              success: true,
              extension_id: extension.extension_id,
              message: `Extension ${extensionProtocol.name} v${extensionProtocol.version} installed successfully`,
              warnings: []
            };
          }

          throw new Error('Failed to install extension: Invalid extension data returned');
        }
      );

      logger.info('扩展安装成功', { 
            name: request.name,
            extension_id: result.extension_id,
        execution_time_ms: Date.now() - startTime
          });

          return result;

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
          logger.error('扩展安装失败', { 
            name: request.name,
        error: errorMessage,
        execution_time_ms: Date.now() - startTime
          });

      // 返回错误结果
          return {
            success: false,
        message: `Failed to install extension: ${errorMessage}`,
        warnings: [],
        conflicts: []
          };
        }
  }

  /**
   * 卸载扩展
   * 目标性能: < 2000ms 完成卸载
   */
  public async uninstallExtension(extensionId: string, force = false): Promise<ExtensionInstallResult> {
        const startTime = Date.now();
    const operationKey = `uninstall:${extensionId}`;

        try {
      logger.info('卸载扩展', { extension_id: extensionId, force });

      // 验证管理器状态
          this.validateManagerState();

      // 执行卸载操作
      const result = await this.executeWithConcurrencyControl<ExtensionInstallResult>(
        'uninstall',
        operationKey,
        async () => {
          // 1. 获取扩展
          const extension = this.extensionRegistry.get(extensionId);
          if (!extension) {
            throw new Error(`Extension ${extensionId} not found`);
          }

          // 2. 调用服务卸载扩展
          await this.extensionService.uninstallExtension(extensionId, force);

          // 3. 从注册表中移除
            this.extensionRegistry.delete(extensionId);

          // 4. 更新管理器状态
          this.state.total_extensions--;
          if (extension.status === 'active') {
            this.state.active_extensions--;
          }
            this.updateManagerState();

          // 5. 发送事件
          const event: ExtensionEvent = {
            event_type: 'extension_uninstalled',
            extension_id: extensionId,
            timestamp: new Date().toISOString() as Timestamp,
            data: {
              name: extension.name,
              version: extension.version,
              uninstallation_time_ms: Date.now() - startTime
            }
          };
          this.handleExtensionEvent(event);

          // 6. 返回结果
          return {
            success: true,
            extension_id: extensionId,
            message: `Extension ${extension.name} uninstalled successfully`
          };
        }
      );

      logger.info('扩展卸载成功', { 
            extension_id: extensionId,
        execution_time_ms: Date.now() - startTime
          });

          return result;

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
          logger.error('扩展卸载失败', {
            extension_id: extensionId,
        error: errorMessage,
        execution_time_ms: Date.now() - startTime
          });

      // 返回错误结果
      return {
        success: false,
        message: `Failed to uninstall extension: ${errorMessage}`
      };
    }
  }

  /**
   * 设置扩展激活状态
   * 目标性能: < 1000ms 完成激活/停用
   */
  public async setExtensionActivation(request: ExtensionActivationRequest): Promise<ExtensionExecutionResult> {
        const startTime = Date.now();
    const operationKey = `activation:${request.extension_id}:${request.activate}`;
    const action = request.activate ? 'activate' : 'deactivate';

    try {
      logger.info(`${request.activate ? '激活' : '停用'}扩展`, { 
        extension_id: request.extension_id,
        force: request.force
      });

      // 验证管理器状态
          this.validateManagerState();

      // 执行激活/停用操作
      const result = await this.executeWithConcurrencyControl<ExtensionExecutionResult>(
        request.activate ? 'activate' : 'deactivate',
        operationKey,
        async () => {
          // 1. 获取扩展
          const extension = this.extensionRegistry.get(request.extension_id);
          if (!extension) {
            throw new Error(`Extension ${request.extension_id} not found`);
          }

          // 2. 调用服务激活/停用扩展
          const updatedExtension = await this.extensionService.activateExtension({
            extension_id: request.extension_id,
            activate: request.activate,
            force: request.force
          });

          // 3. 更新注册表 - 重新获取扩展，因为activateExtension返回void
          const refreshedExtension = this.extensionRegistry.get(request.extension_id);
          if (refreshedExtension) {
            // 4. 更新管理器状态
            if (request.activate && refreshedExtension.status === 'active') {
              this.state.active_extensions++;
            } else if (!request.activate && extension.status === 'active') {
              this.state.active_extensions--;
            }
            this.updateManagerState();

            // 5. 发送事件
            const event: ExtensionEvent = {
              event_type: request.activate ? 'extension_activated' : 'extension_deactivated',
              extension_id: request.extension_id,
              timestamp: new Date().toISOString() as Timestamp,
              data: {
                name: extension.name,
                version: extension.version,
                execution_time_ms: Date.now() - startTime
              }
            };
            this.handleExtensionEvent(event);
          }

          // 6. 返回结果
          return {
            execution_id: `${action}-${request.extension_id}-${Date.now()}`,
            extension_id: request.extension_id,
            success: true,
            execution_time_ms: Date.now() - startTime
          };
        }
      );

      logger.info(`扩展${request.activate ? '激活' : '停用'}成功`, { 
            extension_id: request.extension_id,
        execution_time_ms: Date.now() - startTime
          });

      return result;
          
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`扩展${request.activate ? '激活' : '停用'}失败`, { 
            extension_id: request.extension_id,
        error: errorMessage,
        execution_time_ms: Date.now() - startTime
      });

      // 返回错误结果
      return {
        execution_id: `${action}-${request.extension_id}-${Date.now()}`,
        extension_id: request.extension_id,
        success: false,
        error: {
          code: request.activate ? ExtensionErrorCode.EXTENSION_START_FAILED : ExtensionErrorCode.EXTENSION_STOP_FAILED,
          message: errorMessage
        },
        execution_time_ms: Date.now() - startTime
      };
        }
  }

  /**
   * 更新扩展配置
   * 目标性能: < 500ms 完成配置更新
   */
  public async updateConfiguration(request: UpdateConfigurationRequest): Promise<ExtensionExecutionResult> {
        const startTime = Date.now();
    const operationKey = `config:${request.extension_id}`;

    try {
      logger.info('更新扩展配置', { 
        extension_id: request.extension_id,
        validate_only: request.validate_only
      });

      // 验证管理器状态
          this.validateManagerState();

      // 执行配置更新操作
      const result = await this.executeWithConcurrencyControl<ExtensionExecutionResult>(
        'configure',
        operationKey,
        async () => {
          // 1. 获取扩展
          const extension = this.extensionRegistry.get(request.extension_id);
          if (!extension) {
            throw new Error(`Extension ${request.extension_id} not found`);
          }

          // 2. 调用服务更新配置
          const updatedExtension = await this.extensionService.updateConfiguration(request);

          // 3. 更新注册表 - 重新获取扩展，因为updateConfiguration返回void
          if (!request.validate_only) {
            const refreshedExtension = this.extensionRegistry.get(request.extension_id);
            if (refreshedExtension) {
              this.extensionRegistry.set(request.extension_id, refreshedExtension);
            }
          }

          // 4. 发送事件
          if (!request.validate_only) {
            const event: ExtensionEvent = {
              event_type: 'extension_configured',
            extension_id: request.extension_id,
              timestamp: new Date().toISOString() as Timestamp,
              data: {
            name: extension.name,
                configuration_updated: true,
                execution_time_ms: Date.now() - startTime
              }
            };
            this.handleExtensionEvent(event);
          }

          // 5. 返回结果
          return {
            execution_id: `configure-${request.extension_id}-${Date.now()}`,
            extension_id: request.extension_id,
            success: true,
            result: {
              validate_only: request.validate_only,
              validation_passed: true
            },
            execution_time_ms: Date.now() - startTime
          };
        }
      );

      logger.info('扩展配置更新成功', { 
            extension_id: request.extension_id,
        validate_only: request.validate_only,
        execution_time_ms: Date.now() - startTime
          });

      return result;
          
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
          logger.error('扩展配置更新失败', {
            extension_id: request.extension_id,
        error: errorMessage,
        execution_time_ms: Date.now() - startTime
          });

      // 返回错误结果
      return {
        execution_id: `configure-${request.extension_id}-${Date.now()}`,
        extension_id: request.extension_id,
        success: false,
        error: {
          code: ExtensionErrorCode.CONFIGURATION_VALIDATION_FAILED,
          message: errorMessage
        },
        execution_time_ms: Date.now() - startTime
      };
        }
      }

  /**
   * 搜索扩展
   * 目标性能: < 50ms 完成搜索
   */
  public searchExtensions(criteria: ExtensionSearchCriteria): ExtensionProtocol[] {
    logger.debug('搜索扩展', { criteria });

    // 获取所有扩展
    const allExtensions = Array.from(this.extensionRegistry.values());

    // 如果没有条件，返回所有扩展
    if (!criteria || Object.keys(criteria).length === 0) {
      return allExtensions;
    }

    // 根据条件过滤
    return allExtensions.filter(ext => {
      // 按ID过滤
      if (criteria.extension_ids && criteria.extension_ids.length > 0) {
        if (!criteria.extension_ids.includes(ext.extension_id)) {
          return false;
        }
      }

      // 按上下文ID过滤
      if (criteria.context_ids && criteria.context_ids.length > 0) {
        if (!criteria.context_ids.includes(ext.context_id)) {
          return false;
        }
      }

      // 按名称过滤
      if (criteria.names && criteria.names.length > 0) {
        if (!criteria.names.some(name => 
          ext.name.toLowerCase().includes(name.toLowerCase()) || 
          (ext.display_name && ext.display_name.toLowerCase().includes(name.toLowerCase()))
        )) {
          return false;
        }
      }

      // 按类型过滤
      if (criteria.types && criteria.types.length > 0) {
        if (!criteria.types.includes(ext.type)) {
          return false;
        }
      }

      // 按状态过滤
      if (criteria.statuses && criteria.statuses.length > 0) {
        if (!criteria.statuses.includes(ext.status)) {
          return false;
        }
      }

      // 按作者过滤
      if (criteria.authors && criteria.authors.length > 0 && ext.metadata?.author) {
        if (!criteria.authors.some(author => 
          ext.metadata?.author?.toLowerCase().includes(author.toLowerCase())
        )) {
          return false;
        }
      }

      // 按关键词过滤
      if (criteria.keywords && criteria.keywords.length > 0 && ext.metadata?.keywords) {
        if (!criteria.keywords.some(keyword => 
          ext.metadata?.keywords?.some(k => k.toLowerCase().includes(keyword.toLowerCase()))
        )) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * 获取单个扩展
   */
  public getExtension(extensionId: string): ExtensionProtocol | undefined {
    return this.extensionRegistry.get(extensionId);
  }

  /**
   * 获取所有扩展
   */
  public getAllExtensions(): ExtensionProtocol[] {
    return Array.from(this.extensionRegistry.values());
  }

  /**
   * 获取管理器状态
   */
  public getManagerStatus(): ExtensionManagerState {
    return { ...this.state };
  }

  /**
   * 获取扩展统计信息
   */
  public getStatistics(): ExtensionStatistics {
    // 计算API调用总数
    const totalApiCalls = Array.from(this.operationMetrics.values())
      .reduce((sum, metrics) => sum + metrics.length, 0);
    
    // 计算平均响应时间
    const allTimes = Array.from(this.operationMetrics.values()).flat();
    const avgResponseTime = allTimes.length > 0
      ? allTimes.reduce((sum, time) => sum + time, 0) / allTimes.length
      : 0;

    // 获取内存和CPU使用情况
    const memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024; // MB
    const cpuUsage = this.getCpuUsage();

    return {
      total_extensions: this.state.total_extensions,
      active_extensions: this.state.active_extensions,
      failed_extensions: this.state.failed_extensions,
      total_api_calls: totalApiCalls,
      average_response_time: avgResponseTime,
      memory_usage_mb: memoryUsage,
      cpu_usage_percent: cpuUsage
    };
  }

  /**
   * 获取默认上下文ID
   */
  public getDefaultContextId(): UUID {
    // 在实际实现中，这应该从配置或系统中获取
    return '00000000-0000-4000-a000-000000000000';
  }

  /**
   * 检查扩展健康状态
   */
  public async checkExtensionHealth(extensionId: string, fullCheck = false): Promise<any> {
    // 这里应该实现扩展健康检查逻辑
    // 为简化示例，返回一个模拟的健康状态
    const extension = this.extensionRegistry.get(extensionId);
    if (!extension) {
      return null;
    }

    return {
      status: extension.status === 'active' ? 'healthy' : 'not_running',
      is_healthy: extension.status === 'active',
      last_check: new Date().toISOString(),
      details: {
        uptime_seconds: 3600, // 模拟数据
        memory_usage_mb: 50,  // 模拟数据
        error_count: 0        // 模拟数据
      },
      metrics: fullCheck ? {
        cpu_usage_percent: 2,     // 模拟数据
        response_time_ms: 15,     // 模拟数据
        success_rate_percent: 99.9 // 模拟数据
      } : undefined
    };
  }

  /**
   * 获取性能指标
   */
  public getPerformanceMetrics(): Record<string, any> {
    // 收集各种操作的性能指标
    const metrics: Record<string, any> = {};

    // 操作指标
    for (const [operation, times] of this.operationMetrics.entries()) {
      if (times.length === 0) continue;
      
        metrics[operation] = {
          count: times.length,
        avg_time_ms: times.reduce((sum, time) => sum + time, 0) / times.length,
          min_time_ms: Math.min(...times),
          max_time_ms: Math.max(...times),
        p95_time_ms: this.calculatePercentile(times, 95),
        p99_time_ms: this.calculatePercentile(times, 99)
        };
    }

    // 系统指标
    metrics.system = {
      memory_usage_mb: process.memoryUsage().heapUsed / 1024 / 1024,
      cpu_usage_percent: this.getCpuUsage(),
      concurrent_operations: this.concurrentOperations,
      extensions_count: this.state.total_extensions,
      active_extensions_count: this.state.active_extensions
    };

    return metrics;
  }

  // ================== 私有辅助方法 ==================

  private setupEventListeners(): void {
    // 监听扩展服务事件
    this.extensionService.on('extension_event', (event: ExtensionEvent) => {
      logger.debug('收到扩展事件', { 
        event_type: event.event_type,
        extension_id: event.extension_id
      });

      // 转发事件
      this.emit('extension_event', event);

      // 根据事件类型更新状态
      this.handleExtensionEvent(event);
    });

    // 监听进程事件
    process.on('SIGTERM', () => this.gracefulShutdown());
    process.on('SIGINT', () => this.gracefulShutdown());
  }

  private async initializeExtensionService(): Promise<void> {
    // 扩展服务已在构造函数中初始化
    logger.debug('Extension服务初始化完成');
  }

  private async loadInstalledExtensions(): Promise<void> {
    try {
      // 从扩展服务获取所有扩展
      const extensions = this.extensionService.getAllExtensions();
      
      // 更新注册表
      for (const extension of extensions) {
        this.extensionRegistry.set(extension.extension_id, extension);
      }

      logger.info('已加载扩展', { count: extensions.length });

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('加载已安装扩展失败', { error: errorMessage });
      throw error;
    }
  }

  private startSystemMonitoring(): void {
    if (!this.config.performance_monitoring_enabled) {
      return;
    }

    this.metricsTimer = setInterval(() => {
      this.collectSystemMetrics();
    }, 5000); // 每5秒收集一次指标

    logger.debug('系统监控已启动');
  }

  /**
   * 启动健康检查监控
   */
  private startHealthCheckMonitoring(): void {
    this.healthCheckTimer = setInterval(() => {
      this.performSystemHealthCheck();
    }, this.healthCheckInterval * 1000);

    logger.debug('健康检查监控已启动', { 
      interval_seconds: this.healthCheckInterval
    });
  }

  private startCleanupTasks(): void {
    this.cleanupTimer = setInterval(() => {
      this.performCleanupTasks();
    }, 60000); // 每分钟执行一次清理

    logger.debug('清理任务已启动');
  }

  private stopAllTimers(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = undefined;
    }

    if (this.metricsTimer) {
      clearInterval(this.metricsTimer);
      this.metricsTimer = undefined;
    }

    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }

    logger.debug('所有定时器已停止');
  }

  private async deactivateAllExtensions(): Promise<void> {
    const activeExtensions = Array.from(this.extensionRegistry.values())
      .filter(ext => ext.status === 'active');

    logger.info('停用所有活跃扩展', { count: activeExtensions.length });

    // 并发停用所有扩展
    const deactivationPromises = activeExtensions.map(ext =>
      this.extensionService.activateExtension({
        extension_id: ext.extension_id,
        activate: false,
        force: true
      }).catch(error => {
        logger.error('扩展停用失败', {
          extension_id: ext.extension_id,
          name: ext.name,
          error: error.message
        });
      })
    );

    await Promise.allSettled(deactivationPromises);
  }

  private async waitForOperationsToComplete(): Promise<void> {
    const maxWaitTime = 10000; // 最多等待10秒
    const startTime = Date.now();

    while (this.operationQueue.size > 0 && (Date.now() - startTime) < maxWaitTime) {
      logger.debug('等待操作完成', { 
        pending_operations: this.operationQueue.size,
        waited_ms: Date.now() - startTime
      });
      
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    if (this.operationQueue.size > 0) {
      logger.warn('仍有未完成操作', { count: this.operationQueue.size });
    }
  }

  private async cleanup(): Promise<void> {
    // 清理注册表
    this.extensionRegistry.clear();

    // 清理操作队列
    this.operationQueue.clear();

    // 清理性能监控数据
    this.operationMetrics.clear();

    logger.debug('资源清理完成');
  }

  private async executeWithConcurrencyControl<T>(
    operation: ExtensionOperation,
    operationKey: string,
    fn: () => Promise<T>
  ): Promise<T> {
    // 检查并发限制
    if (this.concurrentOperations >= this.maxConcurrentOperations) {
      throw new Error(`Maximum concurrent operations limit reached (${this.maxConcurrentOperations})`);
    }

    // 检查是否已有相同操作在执行
    if (this.operationQueue.has(operationKey)) {
      logger.warn('操作已在执行中', { operation, key: operationKey });
      return this.operationQueue.get(operationKey);
    }

    // 执行操作
    this.concurrentOperations++;
    const operationPromise = fn().finally(() => {
      this.concurrentOperations--;
      this.operationQueue.delete(operationKey);
    });

    this.operationQueue.set(operationKey, operationPromise);

    return operationPromise;
  }

  private validateManagerState(): void {
    if (this.state.status === 'error') {
      throw new Error('Extension manager is in error state');
    }
    if (this.state.status === 'shutdown') {
      throw new Error('Extension manager is shutdown');
    }
    if (this.state.status === 'initializing') {
      throw new Error('Extension manager is still initializing');
    }
  }

  private validateConcurrencyLimits(): void {
    if (this.extensionRegistry.size >= this.config.resource_limits.max_memory_mb) {
      throw new Error(`Maximum extension limit reached (${this.config.resource_limits.max_memory_mb})`);
    }
  }

  private updateManagerState(): void {
    const extensions = Array.from(this.extensionRegistry.values());
    
    this.state.total_extensions = extensions.length;
    this.state.active_extensions = extensions.filter(ext => ext.status === 'active').length;
    this.state.failed_extensions = extensions.filter(ext => ext.status === 'error').length;
  }

  private calculatePercentile(times: number[], percentile: number): number {
    const sorted = [...times].sort((a, b) => a - b);
    const index = Math.ceil(sorted.length * percentile) - 1;
    return sorted[index] || 0;
  }

  private handleExtensionEvent(event: ExtensionEvent): void {
    // 根据事件类型更新本地状态
    const extension = this.extensionRegistry.get(event.extension_id);
    if (!extension) {
      return;
    }

    switch (event.event_type) {
      case 'extension_activated':
        extension.status = 'active';
        break;
      case 'extension_deactivated':
        extension.status = 'inactive';
        break;
      case 'extension_error':
        extension.status = 'error';
        this.state.failed_extensions++;
        break;
    }

    this.updateManagerState();
  }

  /**
   * 收集系统指标
   */
  private collectSystemMetrics(): void {
    try {
      const memoryUsage = process.memoryUsage();
      
      // 使用自定义方法记录指标
      this.recordOperationMetrics('system_memory', memoryUsage.heapUsed / 1024 / 1024);
      this.recordOperationMetrics('system_heap_total', memoryUsage.heapTotal / 1024 / 1024);
      this.recordOperationMetrics('concurrent_operations', this.concurrentOperations);
      this.recordOperationMetrics('total_extensions', this.state.total_extensions);
      this.recordOperationMetrics('active_extensions', this.state.active_extensions);
      this.recordOperationMetrics('failed_extensions', this.state.failed_extensions);

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('系统指标收集失败', { error: errorMessage });
    }
  }

  /**
   * 执行系统健康检查
   */
  private async performSystemHealthCheck(): Promise<void> {
    const startTime = Date.now();

    try {
      // 检查管理器状态
      if (this.state.status !== 'ready') {
        throw new Error(`Manager status is ${this.state.status}`);
      }

      // 检查扩展服务状态
      const statistics = this.extensionService.getStatistics();
      
      // 检查资源使用
      const memoryUsage = process.memoryUsage();
      const memoryUsageMB = memoryUsage.heapUsed / 1024 / 1024;
      
      if (memoryUsageMB > 1024) { // 内存使用超过1GB
        logger.warn('内存使用过高', { memory_usage_mb: memoryUsageMB });
      }

      // 更新健康检查时间
      this.state.last_health_check = new Date().toISOString() as Timestamp;

      logger.debug('系统健康检查完成', {
        check_time_ms: Date.now() - startTime,
        memory_usage_mb: memoryUsageMB,
        total_extensions: statistics.total_extensions,
        active_extensions: statistics.active_extensions
      });

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('系统健康检查失败', {
        error: errorMessage,
        check_time_ms: Date.now() - startTime
      });

      this.emit('health_check_failed', {
        error: errorMessage,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * 执行清理任务
   */
  private performCleanupTasks(): void {
    try {
      // 清理过期的性能监控数据
      for (const [operation, times] of this.operationMetrics) {
        if (times.length > 1000) {
          // 保留最近1000条记录
          times.splice(0, times.length - 1000);
        }
      }

      // 清理已完成的操作
      const completedOperations: string[] = [];
      for (const [key, promise] of this.operationQueue) {
        if (promise && typeof promise.then === 'function') {
          promise.then(() => completedOperations.push(key)).catch(() => completedOperations.push(key));
        }
      }

      logger.debug('清理任务完成', {
        metrics_entries: this.operationMetrics.size,
        operation_queue_size: this.operationQueue.size
      });

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('清理任务失败', { error: errorMessage });
    }
  }

  /**
   * 优雅关闭
   */
  private async gracefulShutdown(): Promise<void> {
    logger.info('收到关闭信号，开始优雅关闭...');
    
    try {
      await this.stop();
      process.exit(0);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('优雅关闭失败', { error: errorMessage });
      process.exit(1);
    }
  }

  /**
   * 获取CPU使用率
   */
  private getCpuUsage(): number {
    // 简化实现，实际应该使用更准确的方法
    return 0;
  }
  
  /**
   * 记录操作指标
   */
  private recordOperationMetrics(operation: ExtensionOperation | string, value: number, success = true): void {
    if (!this.operationMetrics.has(operation)) {
      this.operationMetrics.set(operation, []);
    }

    const metrics = this.operationMetrics.get(operation)!;
    metrics.push(value);

    // 保留最近100次记录
    if (metrics.length > 100) {
      metrics.shift();
    }

    // 使用Performance类记录指标
    if (this.config.performance_monitoring_enabled) {
      const metricId = this.performanceMonitor.start(`${operation}`);
      this.performanceMonitor.end(metricId);
    }
  }
} 