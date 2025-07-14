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
  EXTENSION_CONSTANTS,
  MPLP_VERSION,
  MODULE_VERSIONS
} from './types';

// 不再需要额外定义操作类型常量，直接使用ExtensionOperation类型

import { ExtensionRepository } from './extension-repository';
import { ExtensionIntegration } from './extension-integration';
import { logger } from '../../utils/logger';
import { Performance } from '../../utils/performance';
import { UUID, Timestamp } from '../../types/index';
import { 
  IContextManager, 
  IRoleManager, 
  ITraceManager 
} from '../../interfaces/module-integration.interface';
import { ITraceAdapter } from '../../interfaces/trace-adapter.interface';
import { IExtensionService } from '../../interfaces/extension-service.interface';

/**
 * 扩展更新结果类型
 */
interface ExtensionUpdateResult {
  success: boolean;
  data?: ExtensionProtocol;
  error?: {
    code: string;
    message: string;
  };
}

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
  private readonly extensionService: IExtensionService;
  private readonly extensionRepository: ExtensionRepository;
  private readonly extensionIntegration: ExtensionIntegration;
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
  private readonly healthCheckInterval = 60;
  
  /**
   * 创建Extension管理器
   * @param extensionService 扩展服务
   * @param config 配置
   */
  constructor(extensionService?: IExtensionService, config?: Partial<ExtensionManagerConfiguration>) {
    super();
    
    // 初始化服务和仓储
    this.extensionRepository = new ExtensionRepository();
    
    // 如果未提供extensionService，则使用默认实现
    if (!extensionService) {
      // 从ExtensionService模块导入
      const { ExtensionService } = require('./extension-service');
      this.extensionService = new ExtensionService();
    } else {
      this.extensionService = extensionService;
    }
    
    this.extensionIntegration = new ExtensionIntegration();
    this.performanceMonitor = new Performance();
    
    // 设置默认配置
    this.config = {
      registry_enabled: true,
      auto_update_enabled: false,
      security_scanning_enabled: true,
      performance_monitoring_enabled: true,
      sandbox_enabled: true,
      allowed_extension_types: ['plugin', 'adapter', 'connector', 'middleware', 'hook', 'transformer'],
      resource_limits: {
        max_memory_mb: 512,
        max_cpu_percent: 50,
        max_disk_mb: 100,
        max_network_requests_per_minute: 60,
        max_execution_time_ms: 5000
      },
      security_settings: {
        code_signing_required: false,
        sandbox_isolation_enabled: true,
        permission_system_enabled: true,
        audit_logging_enabled: true,
        trusted_publishers: [],
        blocked_extensions: []
      },
      ...config
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
    
    // 设置事件监听
    this.setupEventListeners();
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
   */
  public async stop(): Promise<void> {
    logger.info('停止Extension管理器...');
    
    try {
      // 1. 停止所有定时任务
      this.stopTimers();
      
      // 2. 停用所有扩展
      await this.deactivateAllExtensions();
      
      // 3. 更新状态
      this.state.status = 'shutdown';
      this.updateManagerState();
      
      logger.info('Extension管理器已停止');
      this.emit('manager_stopped');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Extension管理器停止失败', { error: errorMessage });
      this.emit('manager_error', { error: errorMessage });
      throw error;
    }
  }
  
  // ================== 模块集成 ==================
  
  /**
   * 设置Context模块集成
   * @param contextManager Context管理器
   */
  public setContextManager(contextManager: IContextManager): void {
    this.extensionIntegration.setContextManager(contextManager);
    logger.info('Extension管理器已与Context模块集成');
  }
  
  /**
   * 设置Role模块集成
   * @param roleManager Role管理器
   */
  public setRoleManager(roleManager: IRoleManager): void {
    this.extensionIntegration.setRoleManager(roleManager);
    logger.info('Extension管理器已与Role模块集成');
  }
  
  /**
   * 设置Trace模块集成
   * @param traceManager Trace管理器
   */
  public setTraceManager(traceManager: ITraceManager): void {
    this.extensionIntegration.setTraceManager(traceManager);
    logger.info('Extension管理器已与Trace模块集成');
  }
  
  /**
   * 设置Trace适配器
   * @param adapter Trace适配器
   */
  public setTraceAdapter(adapter: ITraceAdapter): void {
    this.extensionIntegration.setTraceAdapter(adapter);
    logger.info('Extension管理器已设置Trace适配器');
  }
  
  /**
   * 获取扩展服务
   * 用于其他模块访问扩展服务
   */
  public getExtensionService(): IExtensionService {
    return this.extensionService;
  }

  // ================== 扩展管理 ==================

  /**
   * 安装扩展
   * @param request 安装请求
   */
  public async installExtension(request: InstallExtensionRequest): Promise<ExtensionInstallResult> {
    const operationId = `install-${request.name}-${Date.now()}`;
    
    const result = await this.queueOperation(
      operationId,
      'install',
      async () => {
        // 1. 验证上下文存在
        const contextExists = await this.extensionIntegration.validateContextExists(request.context_id);
        if (!contextExists) {
          throw new Error(`Context ${request.context_id} not found`);
        }
        
        // 2. 安装扩展
        const installResult = await this.extensionService.installExtension(request);
        
        // 3. 安装成功后，保存到仓储
        if (installResult.success && installResult.extension_id) {
          const extension = await this.extensionService.getExtension(installResult.extension_id);
          if (extension) {
            await this.extensionRepository.saveExtension(extension);
            
            // 4. 更新注册表
            this.extensionRegistry.set(extension.extension_id, extension);
            
            // 5. 更新状态
            this.state.total_extensions++;
            if (extension.status === 'active') {
              this.state.active_extensions++;
            }
            this.updateManagerState();
            
            // 6. 同步到Trace系统
            await this.extensionIntegration.syncExtensionToTrace(extension);
            
            // 7. 记录事件
            await this.extensionIntegration.recordExtensionEvent({
              event_type: 'extension_installed',
              extension_id: extension.extension_id,
              timestamp: new Date().toISOString() as Timestamp,
              data: {
                name: extension.name,
                version: extension.version,
                type: extension.type
              }
            });
          }
        }
        
        return installResult;
      }
    );
    
    return result;
  }
  
  /**
   * 卸载扩展
   * @param extensionId 扩展ID
   * @param force 强制卸载
   */
  public async uninstallExtension(extensionId: string, force = false): Promise<boolean> {
    const operationId = `uninstall-${extensionId}-${Date.now()}`;
    
    const result = await this.queueOperation(
      operationId,
      'uninstall',
      async () => {
        // 1. 从服务中卸载
        const uninstallResult = await this.extensionService.uninstallExtension(extensionId);
        
        // 2. 卸载成功后，从仓储中删除
        if (uninstallResult) {
          // 获取扩展信息（用于事件记录）
          const extension = this.extensionRegistry.get(extensionId);
          
          // 从仓储中删除
          await this.extensionRepository.deleteExtension(extensionId);
          
          // 从注册表中删除
          this.extensionRegistry.delete(extensionId);
          
          // 更新状态
          this.state.total_extensions--;
          if (extension && extension.status === 'active') {
            this.state.active_extensions--;
          }
          this.updateManagerState();
          
          // 记录事件
          if (extension) {
            await this.extensionIntegration.recordExtensionEvent({
              event_type: 'extension_uninstalled',
              extension_id: extensionId,
              timestamp: new Date().toISOString() as Timestamp,
              data: {
                name: extension.name,
                version: extension.version,
                type: extension.type
              }
            });
          }
        }
        
        return uninstallResult;
      }
    );
    
    return result;
  }
  
  /**
   * 设置扩展激活状态
   * @param request 激活请求
   */
  public async setExtensionActivation(request: ExtensionActivationRequest): Promise<ExtensionExecutionResult> {
    const action = request.activate ? 'activate' : 'deactivate';
    const operationId = `${action}-${request.extension_id}-${Date.now()}`;
    const startTime = Date.now();
    
    const result = await this.queueOperation(
      operationId,
      action as ExtensionOperation,
      async () => {
        // 1. 获取扩展
        const extension = this.extensionRegistry.get(request.extension_id);
        if (!extension) {
          throw new Error(`Extension ${request.extension_id} not found`);
        }

        // 2. 调用服务激活/停用扩展
        await this.extensionService.activateExtension({
          extension_id: request.extension_id,
          activate: request.activate,
          force: request.force
        });

        // 3. 更新注册表 - 重新获取扩展，因为activateExtension返回void
        const updatedExtension = await this.extensionService.getExtension(request.extension_id);
        if (updatedExtension) {
          // 4. 更新仓储
          await this.extensionRepository.saveExtension(updatedExtension);
          
          // 5. 更新注册表
          this.extensionRegistry.set(updatedExtension.extension_id, updatedExtension);
          
          // 6. 更新管理器状态
          if (request.activate && updatedExtension.status === 'active') {
            this.state.active_extensions++;
          } else if (!request.activate && extension.status === 'active') {
            this.state.active_extensions--;
          }
          this.updateManagerState();

          // 7. 记录事件
          await this.extensionIntegration.recordExtensionEvent({
            event_type: request.activate ? 'extension_activated' : 'extension_deactivated',
            extension_id: request.extension_id,
            timestamp: new Date().toISOString() as Timestamp,
            data: {
              name: extension.name,
              version: extension.version,
              execution_time_ms: Date.now() - startTime
            }
          });
        }

        // 8. 返回结果
        return {
          execution_id: `${action}-${request.extension_id}-${Date.now()}`,
          extension_id: request.extension_id,
          success: true,
          execution_time_ms: Date.now() - startTime
        };
      }
    );
    
    return result;
  }
  
  /**
   * 更新扩展配置
   * @param request 配置更新请求
   */
  public async updateConfiguration(request: UpdateConfigurationRequest): Promise<ExtensionProtocol> {
    const operationId = `configure-${request.extension_id}-${Date.now()}`;
    
    const result = await this.queueOperation(
      operationId,
      'configure',
      async () => {
        // 1. 获取扩展
        const extension = this.extensionRegistry.get(request.extension_id);
        if (!extension) {
          throw new Error(`Extension ${request.extension_id} not found`);
        }
        
        // 2. 更新配置
        await this.extensionService.updateConfiguration(request);
        
        // 3. 获取更新后的扩展
        const updatedExtension = await this.extensionService.getExtension(request.extension_id);
        if (!updatedExtension) {
          throw new Error(`Failed to get updated extension ${request.extension_id}`);
        }
        
        // 4. 更新仓储
        await this.extensionRepository.saveExtension(updatedExtension);
        
        // 5. 更新注册表
        this.extensionRegistry.set(updatedExtension.extension_id, updatedExtension);
        
        // 6. 记录事件
        await this.extensionIntegration.recordExtensionEvent({
          event_type: 'extension_configured',
          extension_id: request.extension_id,
          timestamp: new Date().toISOString() as Timestamp,
          data: {
            name: updatedExtension.name,
            configuration_keys: Object.keys(request.configuration)
          }
        });
        
        return updatedExtension;
      }
    );
    
    return result;
  }
  
  /**
   * 执行扩展点
   * @param pointName 扩展点名称
   * @param targetModule 目标模块
   * @param eventData 事件数据
   */
  public async executeExtensionPoint(
    pointName: string, 
    targetModule: string, 
    eventData: Record<string, unknown>
  ): Promise<Record<string, unknown>[]> {
    const operationId = `execute-${pointName}-${targetModule}-${Date.now()}`;
    
    const result = await this.queueOperation(
      operationId,
      'execute',
      async () => {
        // 执行扩展点
        const executionResults = await this.extensionService.executeExtensionPoint(
          pointName,
          targetModule,
          eventData,
          {
            user_id: eventData.user_id as string,
            context_id: eventData.context_id as string,
            trace_id: eventData.trace_id as string
          }
        );
        
        // 转换为Record<string, unknown>[]格式以符合接口定义
        return executionResults.map(result => ({
          ...result,
          extension_id: result.extension_id,
          execution_id: result.execution_id,
          success: result.success,
          result: result.result,
          execution_time_ms: result.execution_time_ms,
          error: result.error
        }));
      }
    );
    
    return result;
  }
  
  /**
   * 搜索扩展
   * @param criteria 搜索条件
   */
  public async searchExtensions(criteria: ExtensionSearchCriteria): Promise<ExtensionProtocol[]> {
    return this.extensionRepository.searchExtensions(criteria);
  }
  
  /**
   * 获取扩展
   * @param extensionId 扩展ID
   */
  public async getExtension(extensionId: string): Promise<ExtensionProtocol | null> {
    return this.extensionRepository.getExtensionById(extensionId);
  }
  
  /**
   * 获取所有扩展
   */
  public async getAllExtensions(): Promise<ExtensionProtocol[]> {
    return this.extensionRepository.getAllExtensions();
  }
  
  /**
   * 获取扩展统计信息
   */
  public async getStatistics(): Promise<ExtensionStatistics> {
    const baseStats = this.extensionService.getStatistics();
    
    // 添加管理器状态信息
    return {
      ...baseStats,
      total_extensions: this.state.total_extensions,
      active_extensions: this.state.active_extensions,
      failed_extensions: this.state.failed_extensions
    };
  }
  
  /**
   * 获取管理器状态
   */
  public getManagerState(): ExtensionManagerState {
    return { ...this.state };
  }

  /**
   * 注册扩展点
   * 
   * @param extensionId 扩展ID
   * @param pointDefinition 扩展点定义
   * @returns Promise<boolean> 操作结果
   */
  public async registerExtensionPoint(
    extensionId: string,
    pointDefinition: {
      name: string;
      type: 'hook' | 'filter' | 'action' | 'api_endpoint' | 'event_listener';
      target_module: 'context' | 'plan' | 'confirm' | 'trace' | 'role' | 'extension' | 'system';
      event_name: string;
      execution_order: number;
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
  ): Promise<boolean> {
    return this.queueOperation(
      `register_extension_point_${extensionId}_${pointDefinition.name}`,
      'register_extension_point' as ExtensionOperation,
      async () => {
        try {
          logger.info('注册扩展点', {
            extension_id: extensionId,
            point_name: pointDefinition.name,
            target_module: pointDefinition.target_module
          });

          // 1. 验证扩展存在
          const extension = await this.getExtension(extensionId);
          if (!extension) {
            throw new Error(`Extension not found: ${extensionId}`);
          }

          // 2. 验证扩展状态
          if (extension.status !== 'active') {
            throw new Error(`Extension is not active: ${extensionId} (${extension.status})`);
          }

          // 3. 生成扩展点ID
          const pointId = this.generateUUID();

          // 4. 构建扩展点对象
          const extensionPoint = {
            point_id: pointId,
            name: pointDefinition.name,
            type: pointDefinition.type,
            target_module: pointDefinition.target_module,
            event_name: pointDefinition.event_name,
            execution_order: pointDefinition.execution_order,
            enabled: true,
            handler: {
              function_name: pointDefinition.handler.function_name,
              parameters: pointDefinition.handler.parameters || {},
              timeout_ms: pointDefinition.handler.timeout_ms || 5000
            },
            conditions: pointDefinition.conditions || {}
          };

          // 5. 添加到扩展的扩展点列表
          const extensionPoints = extension.extension_points || [];
          extensionPoints.push(extensionPoint);

          // 6. 更新扩展
          const updateRequest: UpdateExtensionRequest = {
            extension_id: extensionId,
            extension_points: extensionPoints
          };

          // 先获取结果，然后构造正确的返回类型
          const extensionResult = await this.extensionService.updateExtension(updateRequest);
          const result: ExtensionUpdateResult = {
            success: true,
            data: extensionResult
          };
          
          if (!result.success) {
            throw new Error(`Failed to register extension point: ${result.error?.message}`);
          }

          // 7. 更新本地注册表
          this.extensionRegistry.set(extensionId, result.data!);

          // 8. 通知目标模块
          await this.extensionIntegration.notifyModuleExtensionPointRegistered(
            pointDefinition.target_module,
            extensionPoint
          );

          logger.info('扩展点注册成功', {
            extension_id: extensionId,
            point_id: pointId,
            point_name: pointDefinition.name
          });

          return true;
        } catch (error) {
          logger.error('扩展点注册失败', {
            extension_id: extensionId,
            point_name: pointDefinition.name,
            error: error instanceof Error ? error.message : String(error)
          });
          throw error;
        }
      }
    );
  }

  /**
   * 取消注册扩展点
   * 
   * @param extensionId 扩展ID
   * @param pointId 扩展点ID
   * @returns Promise<boolean> 操作结果
   */
  public async unregisterExtensionPoint(
    extensionId: string,
    pointId: string
  ): Promise<boolean> {
    return this.queueOperation(
      `unregister_extension_point_${extensionId}_${pointId}`,
      'unregister_extension_point' as ExtensionOperation,
      async () => {
        try {
          logger.info('取消注册扩展点', {
            extension_id: extensionId,
            point_id: pointId
          });

          // 1. 验证扩展存在
          const extension = await this.getExtension(extensionId);
          if (!extension) {
            throw new Error(`Extension not found: ${extensionId}`);
          }

          // 2. 查找扩展点
          const extensionPoints = extension.extension_points || [];
          const pointIndex = extensionPoints.findIndex(p => p.point_id === pointId);
          
          if (pointIndex === -1) {
            throw new Error(`Extension point not found: ${pointId}`);
          }

          // 3. 获取扩展点信息（用于通知模块）
          const extensionPoint = extensionPoints[pointIndex];

          // 4. 移除扩展点
          extensionPoints.splice(pointIndex, 1);

          // 5. 更新扩展
          const updateRequest: UpdateExtensionRequest = {
            extension_id: extensionId,
            extension_points: extensionPoints
          };

          // 先获取结果，然后构造正确的返回类型
          const extensionResult = await this.extensionService.updateExtension(updateRequest);
          const result: ExtensionUpdateResult = {
            success: true,
            data: extensionResult
          };
          
          if (!result.success) {
            throw new Error(`Failed to unregister extension point: ${result.error?.message}`);
          }

          // 6. 更新本地注册表
          this.extensionRegistry.set(extensionId, result.data!);

          // 7. 通知目标模块
          await this.extensionIntegration.notifyModuleExtensionPointUnregistered(
            extensionPoint.target_module,
            pointId
          );

          logger.info('扩展点取消注册成功', {
            extension_id: extensionId,
            point_id: pointId
          });

          return true;
        } catch (error) {
          logger.error('扩展点取消注册失败', {
            extension_id: extensionId,
            point_id: pointId,
            error: error instanceof Error ? error.message : String(error)
          });
          throw error;
        }
      }
    );
  }

  /**
   * 检查版本兼容性
   * 
   * @param extensionId 扩展ID
   * @returns Promise<{compatible: boolean, issues: string[]}> 兼容性结果
   */
  public async checkVersionCompatibility(
    extensionId: string
  ): Promise<{
    compatible: boolean;
    issues: string[];
    compatibility_details: {
      mplp_compatible: boolean;
      module_compatibility: Record<string, boolean>;
      dependency_compatibility: Record<string, boolean>;
      conflicts: string[];
    };
  }> {
    return this.queueOperation(
      `check_compatibility_${extensionId}`,
      'check_compatibility' as ExtensionOperation,
      async () => {
        try {
          logger.info('检查扩展版本兼容性', {
            extension_id: extensionId
          });

          // 1. 获取扩展
          const extension = await this.getExtension(extensionId);
          if (!extension) {
            throw new Error(`Extension not found: ${extensionId}`);
          }

          // 2. 获取系统版本信息
          const systemVersion = MPLP_VERSION;
          
          // 3. 检查MPLP版本兼容性
          const mplpVersionCompatible = this.checkVersionRange(
            systemVersion,
            extension.compatibility?.mplp_version || '*'
          );

          // 4. 检查模块兼容性
          const moduleCompatibility: Record<string, boolean> = {};
          const requiredModules = extension.compatibility?.required_modules || [];
          
          for (const moduleReq of requiredModules) {
            const moduleVersion = this.getModuleVersion(moduleReq.module);
            const minVersion = moduleReq.min_version;
            const maxVersion = moduleReq.max_version;
            
            let compatible = true;
            
            if (minVersion) {
              compatible = compatible && this.compareVersions(moduleVersion, minVersion) >= 0;
            }
            
            if (maxVersion) {
              compatible = compatible && this.compareVersions(moduleVersion, maxVersion) <= 0;
            }
            
            moduleCompatibility[moduleReq.module] = compatible;
          }

          // 5. 检查依赖兼容性
          const dependencyCompatibility: Record<string, boolean> = {};
          const dependencies = extension.compatibility?.dependencies || [];
          
          for (const dep of dependencies) {
            // 跳过可选依赖
            if (dep.optional) {
              continue;
            }
            
            const depExtension = await this.getExtension(dep.extension_id);
            if (!depExtension) {
              dependencyCompatibility[dep.name] = false;
              continue;
            }
            
            const compatible = this.checkVersionRange(
              depExtension.version,
              dep.version_range
            );
            
            dependencyCompatibility[dep.name] = compatible;
          }

          // 6. 检查冲突
          const conflicts: string[] = [];
          const conflictList = extension.compatibility?.conflicts || [];
          
          for (const conflict of conflictList) {
            const conflictExtension = await this.getExtension(conflict.extension_id);
            if (conflictExtension) {
              conflicts.push(`${conflict.name}: ${conflict.reason}`);
            }
          }

          // 7. 汇总兼容性问题
          const issues: string[] = [];
          
          if (!mplpVersionCompatible) {
            issues.push(`MPLP version incompatible: requires ${extension.compatibility?.mplp_version}, current ${systemVersion}`);
          }
          
          for (const [module, compatible] of Object.entries(moduleCompatibility)) {
            if (!compatible) {
              const moduleReq = requiredModules.find(m => m.module === module);
              issues.push(`Module ${module} incompatible: requires ${moduleReq?.min_version || ''} to ${moduleReq?.max_version || ''}`);
            }
          }
          
          for (const [dep, compatible] of Object.entries(dependencyCompatibility)) {
            if (!compatible) {
              const depReq = dependencies.find(d => d.name === dep);
              issues.push(`Dependency ${dep} incompatible: requires ${depReq?.version_range || ''}`);
            }
          }
          
          conflicts.forEach(conflict => {
            issues.push(`Conflict: ${conflict}`);
          });

          // 8. 判断整体兼容性
          const compatible = mplpVersionCompatible && 
            Object.values(moduleCompatibility).every(Boolean) && 
            Object.values(dependencyCompatibility).every(Boolean) && 
            conflicts.length === 0;

          logger.info('扩展版本兼容性检查完成', {
            extension_id: extensionId,
            compatible,
            issue_count: issues.length
          });

          return {
            compatible,
            issues,
            compatibility_details: {
              mplp_compatible: mplpVersionCompatible,
              module_compatibility: moduleCompatibility,
              dependency_compatibility: dependencyCompatibility,
              conflicts
            }
          };
        } catch (error) {
          logger.error('扩展版本兼容性检查失败', {
            extension_id: extensionId,
            error: error instanceof Error ? error.message : String(error)
          });
          throw error;
        }
      }
    );
  }
  
  // ================== 私有方法 ==================
  
  /**
   * 初始化扩展服务
   */
  private async initializeExtensionService(): Promise<void> {
    // 初始化服务
    // 这里可以添加服务初始化逻辑
  }
  
  /**
   * 加载已安装的扩展
   */
  private async loadInstalledExtensions(): Promise<void> {
    try {
      // 从仓储加载所有扩展
      const extensions = await this.extensionRepository.getAllExtensions();
      
      logger.info('加载已安装的扩展', { count: extensions.length });
      
      // 更新注册表
      for (const extension of extensions) {
        this.extensionRegistry.set(extension.extension_id, extension);
        
        // 更新状态
        if (extension.status === 'active') {
          this.state.active_extensions++;
        }
      }
      
      this.state.total_extensions = extensions.length;
      this.updateManagerState();
    } catch (error) {
      logger.error('加载已安装扩展失败', { 
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }
  
  /**
   * 停用所有扩展
   */
  private async deactivateAllExtensions(): Promise<void> {
    const activeExtensions = Array.from(this.extensionRegistry.values())
      .filter(ext => ext.status === 'active');
    
    logger.info('停用所有扩展', { count: activeExtensions.length });
    
    for (const extension of activeExtensions) {
      try {
        await this.setExtensionActivation({
          extension_id: extension.extension_id,
          activate: false,
          force: true
        });
      } catch (error) {
        logger.warn('停用扩展失败', { 
          extension_id: extension.extension_id,
          name: extension.name,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
  }
  
  /**
   * 启动系统监控
   */
  private startSystemMonitoring(): void {
    if (this.config.performance_monitoring_enabled) {
      this.metricsTimer = setInterval(() => {
        this.collectPerformanceMetrics();
      }, 60000); // 每分钟收集一次
    }
  }
  
  /**
   * 启动健康检查监控
   */
  private startHealthCheckMonitoring(): void {
    this.healthCheckTimer = setInterval(() => {
      this.performHealthCheck();
    }, this.healthCheckInterval * 1000); // 按配置间隔执行
  }
  
  /**
   * 启动清理任务
   */
  private startCleanupTasks(): void {
    this.cleanupTimer = setInterval(() => {
      this.performCleanupTasks();
    }, 300000); // 每5分钟执行一次
  }
  
  /**
   * 停止所有定时器
   */
  private stopTimers(): void {
    if (this.metricsTimer) {
      clearInterval(this.metricsTimer);
      this.metricsTimer = undefined;
    }
    
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = undefined;
    }
    
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }
  }
  
  /**
   * 收集性能指标
   */
  private collectPerformanceMetrics(): void {
    // 收集性能指标
    // 这里可以添加性能指标收集逻辑
  }
  
  /**
   * 执行健康检查
   */
  private async performHealthCheck(): Promise<void> {
    try {
      this.state.last_health_check = new Date().toISOString() as Timestamp;
      
      // 检查所有活跃扩展的健康状态
      const activeExtensions = Array.from(this.extensionRegistry.values())
        .filter(ext => ext.status === 'active');
      
      for (const extension of activeExtensions) {
        try {
          const healthy = await this.extensionService.checkExtensionHealth(extension.extension_id);
          
          if (!healthy) {
            logger.warn('扩展健康检查失败', { 
              extension_id: extension.extension_id,
              name: extension.name
            });
          }
        } catch (error) {
          logger.error('执行扩展健康检查出错', { 
            extension_id: extension.extension_id,
            name: extension.name,
            error: error instanceof Error ? error.message : String(error)
          });
        }
      }
    } catch (error) {
      logger.error('执行健康检查失败', { 
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
  
  /**
   * 执行清理任务
   */
  private async performCleanupTasks(): Promise<void> {
    try {
      // 清理过期的操作队列
      const now = Date.now();
      const expiredOperations = Array.from(this.operationQueue.keys())
        .filter(key => {
          const timestamp = parseInt(key.split('-').pop() || '0');
          return now - timestamp > 3600000; // 1小时前的操作视为过期
        });
      
      for (const key of expiredOperations) {
        this.operationQueue.delete(key);
      }
      
      // 清理性能指标历史数据
      for (const [operation, metrics] of this.operationMetrics.entries()) {
        if (metrics.length > 1000) {
          this.operationMetrics.set(operation, metrics.slice(-100));
        }
      }
    } catch (error) {
      logger.error('执行清理任务失败', { 
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
  
  /**
   * 更新管理器状态
   */
  private updateManagerState(): void {
    this.emit('state_changed', this.state);
  }
  
  /**
   * 设置事件监听
   */
  private setupEventListeners(): void {
    // 设置事件监听
    // 这里可以添加事件监听逻辑
  }
  
  /**
   * 将操作加入队列
   * @param operationId 操作ID
   * @param operationType 操作类型
   * @param operation 操作函数
   */
  private async queueOperation<T>(
    operationId: string,
    operationType: ExtensionOperation,
    operation: () => Promise<T>
  ): Promise<T> {
    // 检查并发操作数量
    if (this.concurrentOperations >= this.maxConcurrentOperations) {
      throw new Error(`Too many concurrent operations (${this.concurrentOperations}/${this.maxConcurrentOperations})`);
    }
    
    const startTime = Date.now();
    this.concurrentOperations++;
    
    try {
      // 将操作加入队列
      const operationPromise = operation();
      this.operationQueue.set(operationId, operationPromise);
      
      // 执行操作
      const result = await operationPromise;
      
      // 记录性能指标
      const executionTime = Date.now() - startTime;
      this.recordOperationMetrics(operationType, executionTime, true);
      
      return result;
    } catch (error) {
      // 记录性能指标
      const executionTime = Date.now() - startTime;
      this.recordOperationMetrics(operationType, executionTime, false);
      
      throw error;
    } finally {
      // 从队列中移除
      this.operationQueue.delete(operationId);
      this.concurrentOperations--;
    }
  }
  
  /**
   * 记录操作性能指标
   * @param operationType 操作类型
   * @param executionTime 执行时间
   * @param success 是否成功
   */
  private recordOperationMetrics(
    operationType: ExtensionOperation | string,
    executionTime: number,
    success: boolean
  ): void {
    // 获取或创建指标数组
    const metrics = this.operationMetrics.get(operationType) || [];
    
    // 添加新指标
    metrics.push(executionTime);
    
    // 限制数组大小
    if (metrics.length > 100) {
      metrics.shift();
    }
    
    // 更新指标
    this.operationMetrics.set(operationType, metrics);
  }

  /**
   * 检查版本范围
   * 
   * @param version 版本
   * @param range 版本范围
   * @returns boolean 是否兼容
   */
  private checkVersionRange(version: string, range: string): boolean {
    // 简化版本范围检查
    // 在实际实现中，应该使用semver库进行更复杂的版本范围检查
    
    if (range === '*') {
      return true;
    }
    
    // 处理简单的范围表达式
    if (range.startsWith('>=')) {
      const minVersion = range.substring(2);
      return this.compareVersions(version, minVersion) >= 0;
    }
    
    if (range.startsWith('>')) {
      const minVersion = range.substring(1);
      return this.compareVersions(version, minVersion) > 0;
    }
    
    if (range.startsWith('<=')) {
      const maxVersion = range.substring(2);
      return this.compareVersions(version, maxVersion) <= 0;
    }
    
    if (range.startsWith('<')) {
      const maxVersion = range.substring(1);
      return this.compareVersions(version, maxVersion) < 0;
    }
    
    // 精确版本匹配
    return version === range;
  }

  /**
   * 比较版本号
   * 
   * @param v1 版本1
   * @param v2 版本2
   * @returns number 比较结果
   */
  private compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);
    
    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const p1 = i < parts1.length ? parts1[i] : 0;
      const p2 = i < parts2.length ? parts2[i] : 0;
      
      if (p1 !== p2) {
        return p1 - p2;
      }
    }
    
    return 0;
  }

  /**
   * 获取模块版本
   * 
   * @param moduleName 模块名称
   * @returns string 模块版本
   */
  private getModuleVersion(moduleName: string): string {
    // 获取模块实际版本
    switch (moduleName.toLowerCase()) {
      case 'context':
        return MODULE_VERSIONS.CONTEXT;
      case 'plan':
        return MODULE_VERSIONS.PLAN;
      case 'confirm':
        return MODULE_VERSIONS.CONFIRM;
      case 'trace':
        return MODULE_VERSIONS.TRACE;
      case 'role':
        return MODULE_VERSIONS.ROLE;
      case 'extension':
        return MODULE_VERSIONS.EXTENSION;
      default:
        return MPLP_VERSION;
    }
  }

  /**
   * 生成UUID
   * 
   * @returns string UUID
   */
  private generateUUID(): string {
    // 简化实现，实际应使用uuid库
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
} 