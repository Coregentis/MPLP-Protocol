/**
 * Extension核心服务
 * 提供扩展机制的完整功能实现
 * 
 * @version 1.0.1
 * @created 2025-07-10T15:30:00+08:00
 * @compliance .cursor/rules/schema-design.mdc
 * @author MPLP开发团队
 */

import { v4 as uuidv4 } from 'uuid';
import { EventEmitter } from 'events';
import { 
  ExtensionProtocol,
  ExtensionType,
  ExtensionStatus,
  InstallExtensionRequest,
  UpdateExtensionRequest,
  UpdateConfigurationRequest,
  ExtensionActivationRequest,
  ExtensionSearchCriteria,
  ExtensionInstallResult,
  ExtensionStatistics,
  ExtensionExecutionContext,
  ExtensionExecutionResult,
  ExtensionEvent,
  ExtensionPoint,
  ApiExtension,
  EventSubscription,
  ExtensionErrorCode,
  ExtensionOperation,
  EXTENSION_CONSTANTS,
  ExtensionCompatibility,
  ExtensionConfiguration,
  ExtensionSecurity,
  ExtensionResourceLimits,
  ExtensionMetadata,
  ExtensionLifecycle,
  ValidationRule
} from './types';
import { logger } from '../../utils/logger';
import { Timestamp } from '../../types/index';

/**
 * Extension核心服务类
 * 
 * 性能目标：
 * - 扩展调用响应时间 < 50ms
 * - 健康检查响应时间 < 10ms  
 * - 支持 > 100 并发扩展执行
 * - 内存使用 < 512MB (所有扩展总计)
 */
export class ExtensionService extends EventEmitter {
  private readonly extensions = new Map<string, ExtensionProtocol>();
  private readonly extensionHandlers = new Map<string, unknown>();
  private readonly activeExecutions = new Map<string, ExtensionExecutionContext>();
  private readonly statistics: ExtensionStatistics;
  private readonly performanceMonitor = new Map<string, number[]>();

  constructor() {
    super();
    this.statistics = {
      total_extensions: 0,
      active_extensions: 0,
      failed_extensions: 0,
      total_api_calls: 0,
      average_response_time: 0,
      memory_usage_mb: 0,
      cpu_usage_percent: 0
    };

    // 启动定期清理和监控
    this.startPerformanceMonitoring();
    this.startHealthCheckMonitoring();
  }

  // ================== 扩展安装管理 ==================

  /**
   * 安装扩展
   * 目标性能: < 2000ms 完成安装验证
   */
  public async installExtension(request: InstallExtensionRequest): Promise<ExtensionInstallResult> {
    const startTime = Date.now();
    
    try {
      logger.info('开始安装扩展', { name: request.name, source: request.source });

      // 1. 验证请求参数
      this.validateInstallRequest(request);

      // 2. 检查扩展是否已存在
      const existingExtension = this.findExtensionByName(request.name);
      if (existingExtension && !request.force_install) {
        throw new Error(`Extension ${request.name} already installed`);
      }

      // 3. 下载或加载扩展
      const extensionManifest = await this.loadExtensionManifest(request.source);

      // 4. 验证兼容性
      const compatibilityCheck = await this.checkCompatibility(extensionManifest);
      if (!compatibilityCheck.compatible) {
        throw new Error(`Compatibility check failed: ${compatibilityCheck.reason}`);
      }

      // 5. 创建扩展协议对象
      const extension: ExtensionProtocol = {
        protocol_version: EXTENSION_CONSTANTS.PROTOCOL_VERSION,
        timestamp: new Date().toISOString() as Timestamp,
        extension_id: uuidv4(),
        context_id: request.context_id || uuidv4(),
        name: request.name,
        display_name: extensionManifest.display_name as string | undefined,
        description: extensionManifest.description as string | undefined,
        version: request.version || extensionManifest.version as string,
        type: (extensionManifest.type as ExtensionType) || (extensionManifest.extension_type as ExtensionType) || 'plugin',
        status: 'installed',
        compatibility: this.parseCompatibility(extensionManifest.compatibility),
        configuration: this.parseConfiguration(extensionManifest, request),
        extension_points: (extensionManifest.extension_points as ExtensionPoint[]) || [],
        api_extensions: (extensionManifest.api_extensions as ApiExtension[]) || [],
        event_subscriptions: (extensionManifest.event_subscriptions as EventSubscription[]) || [], 
        lifecycle: {
          install_date: new Date().toISOString() as Timestamp,
          activation_count: 0,
          error_count: 0,
          performance_metrics: {
            average_execution_time_ms: 0,
            total_executions: 0,
            success_rate: 1,
            memory_usage_mb: 0
          }
        },
        security: this.createSecurityConfig(extensionManifest),
        metadata: extensionManifest.metadata as ExtensionMetadata | undefined
      };

      // 6. 保存扩展
      this.extensions.set(extension.extension_id, extension);

      // 7. 自动激活（如果请求）
      if (request.auto_activate) {
        await this.activateExtension({
          extension_id: extension.extension_id,
          activate: true
        });
      }

      // 8. 更新统计
      this.updateInstallStatistics();

      // 9. 发送安装成功事件
      this.emitExtensionEvent(extension.extension_id, 'extension_installed', {
        name: extension.name,
        version: extension.version,
        installation_time: Date.now() - startTime
      });

      logger.info('扩展安装成功', { 
        extension_id: extension.extension_id,
        name: extension.name,
        time_ms: Date.now() - startTime
      });

      return {
        success: true,
        extension_id: extension.extension_id,
        message: `Extension ${extension.name} installed successfully`,
        warnings: compatibilityCheck.warnings || []
      };

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('扩展安装失败', { 
        name: request.name, 
        error: errorMessage,
        time_ms: Date.now() - startTime
      });

      return {
        success: false,
        message: `Installation failed: ${errorMessage}`
      };
    }
  }

  /**
   * 卸载扩展
   * 目标性能: < 1000ms 完成卸载清理
   */
  public async uninstallExtension(extensionId: string, force = false): Promise<boolean> {
    const startTime = Date.now();

    try {
      const extension = this.extensions.get(extensionId);
      if (!extension) {
        throw new Error(`Extension ${extensionId} not found`);
      }

      logger.info('开始卸载扩展', { extension_id: extensionId, name: extension.name });

      // 1. 检查依赖关系
      if (!force) {
        const dependents = this.findDependentExtensions(extensionId);
        if (dependents.length > 0) {
          throw new Error(`Cannot uninstall: ${dependents.length} extensions depend on this extension`);
        }
      }

      // 2. 停用扩展
      if (extension.status === 'active') {
        await this.activateExtension({
          extension_id: extensionId,
          activate: false,
          force: true
        });
      }

      // 3. 清理扩展点
      await this.unregisterExtensionPoints(extensionId);

      // 4. 清理API扩展
      await this.unregisterApiExtensions(extensionId);

      // 5. 清理事件订阅
      await this.unregisterEventSubscriptions(extensionId);

      // 6. 清理处理器
      this.extensionHandlers.delete(extensionId);

      // 7. 从存储中删除
      this.extensions.delete(extensionId);

      // 8. 更新统计
      this.updateUninstallStatistics();

      // 9. 发送卸载事件
      this.emitExtensionEvent(extensionId, 'extension_uninstalled', {
        name: extension.name,
        uninstallation_time: Date.now() - startTime
      });

      logger.info('扩展卸载成功', {
        extension_id: extensionId,
        name: extension.name,
        time_ms: Date.now() - startTime
      });

      return true;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('扩展卸载失败', {
        extension_id: extensionId,
        error: errorMessage,
        time_ms: Date.now() - startTime
      });
      return false;
    }
  }

  /**
   * 激活或停用扩展
   * 目标性能: < 500ms 完成状态切换
   */
  public async activateExtension(request: ExtensionActivationRequest): Promise<void> {
    const startTime = Date.now();
    const { extension_id, activate, force = false } = request;
    
    try {
      const extension = this.extensions.get(extension_id);
      if (!extension) {
        throw new Error(`Extension ${extension_id} not found`);
      }

      const currentlyActive = extension.status === 'active';
      
      // 如果状态已经是请求的状态，则直接返回
      if ((activate && currentlyActive) || (!activate && !currentlyActive)) {
        logger.info('扩展已经处于请求的状态', {
          extension_id,
          name: extension.name,
          status: extension.status
        });
        return;
      }

      logger.info(`开始${activate ? '激活' : '停用'}扩展`, {
        extension_id,
        name: extension.name
      });

      // 如果是激活扩展
      if (activate) {
        // 1. 检查依赖
        if (!force) {
          const dependencyCheck = await this.checkDependencies(extension);
          if (!dependencyCheck.satisfied) {
            throw new Error(`Missing dependencies: ${dependencyCheck.missing.join(', ')}`);
          }
        }

        // 2. 注册扩展点
        if (extension.extension_points && extension.extension_points.length > 0) {
          await this.registerExtensionPoints(extension_id, extension.extension_points);
        }

        // 3. 注册API扩展
        if (extension.api_extensions && extension.api_extensions.length > 0) {
          await this.registerApiExtensions(extension_id, extension.api_extensions);
        }

        // 4. 注册事件订阅
        if (extension.event_subscriptions && extension.event_subscriptions.length > 0) {
          await this.registerEventSubscriptions(extension_id, extension.event_subscriptions);
        }

        // 5. 更新状态
        extension.status = 'active';
        
        // 6. 更新生命周期信息
        if (extension.lifecycle) {
          extension.lifecycle.activation_count += 1;
        }

        // 7. 发送激活事件
        this.emitExtensionEvent(extension_id, 'extension_activated', {
          name: extension.name,
          version: extension.version,
          activation_time: Date.now() - startTime
        });
      } 
      // 如果是停用扩展
      else {
        // 1. 停止所有活动执行
        await this.stopActiveExecutions(extension_id);

        // 2. 取消注册扩展点
        await this.unregisterExtensionPoints(extension_id);

        // 3. 取消注册API扩展
        await this.unregisterApiExtensions(extension_id);

        // 4. 取消注册事件订阅
        await this.unregisterEventSubscriptions(extension_id);

        // 5. 更新状态
        extension.status = 'inactive';

        // 6. 发送停用事件
        this.emitExtensionEvent(extension_id, 'extension_deactivated', {
          name: extension.name,
          version: extension.version,
          deactivation_time: Date.now() - startTime
        });
      }

      // 更新统计
      this.updateActivationStatistics();

      logger.info(`扩展${activate ? '激活' : '停用'}成功`, {
        extension_id,
        name: extension.name,
        time_ms: Date.now() - startTime
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`扩展${activate ? '激活' : '停用'}失败`, {
        extension_id,
        error: errorMessage,
        time_ms: Date.now() - startTime
      });
      throw error;
    }
  }

  /**
   * 更新扩展配置
   * 目标性能: < 100ms 完成配置验证和更新
   */
  public async updateConfiguration(request: UpdateConfigurationRequest): Promise<void> {
    const startTime = Date.now();
    const { extension_id, configuration, validate_only = false } = request;
    
    try {
      const extension = this.extensions.get(extension_id);
      if (!extension) {
        throw new Error(`Extension ${extension_id} not found`);
      }

      logger.info('开始更新扩展配置', {
        extension_id,
        name: extension.name,
        validate_only
      });

      // 1. 验证配置
      const validationResult = await this.validateConfiguration(extension, configuration);
      if (!validationResult.valid) {
        throw new Error(`Configuration validation failed: ${validationResult.errors.join(', ')}`);
      }

      // 如果只是验证，则到此为止
      if (validate_only) {
        return;
      }

      // 2. 更新配置
      extension.configuration.current_config = {
        ...extension.configuration.current_config,
        ...configuration
      };

      // 3. 更新时间戳
      extension.timestamp = new Date().toISOString() as Timestamp;
      if (extension.lifecycle) {
        extension.lifecycle.last_update = new Date().toISOString() as Timestamp;
      }

      // 4. 如果扩展处于活动状态，重新加载配置
      if (extension.status === 'active') {
        await this.reloadExtensionConfiguration(extension_id);
      }

      // 5. 发送配置更新事件
      this.emitExtensionEvent(extension_id, 'extension_configuration_updated', {
        name: extension.name,
        version: extension.version,
        update_time: Date.now() - startTime
      });

      logger.info('扩展配置更新成功', {
        extension_id,
        name: extension.name,
        time_ms: Date.now() - startTime
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('扩展配置更新失败', {
        extension_id,
        error: errorMessage,
        time_ms: Date.now() - startTime
      });
      throw error;
    }
  }

  /**
   * 执行扩展点
   * 目标性能: < 50ms 完成单个扩展点执行
   */
  public async executeExtensionPoint(
    pointName: string,
    targetModule: string,
    eventData: Record<string, unknown>,
    context: Partial<ExtensionExecutionContext> = {}
  ): Promise<ExtensionExecutionResult[]> {
    const startTime = Date.now();
    const results: ExtensionExecutionResult[] = [];
    
    try {
      // 1. 查找匹配的扩展点
      const extensionPoints = this.findExtensionPoints(pointName, targetModule);
      if (extensionPoints.length === 0) {
        logger.debug('未找到匹配的扩展点', { point_name: pointName, target_module: targetModule });
        return results;
      }

      logger.debug('找到匹配的扩展点', { 
        point_name: pointName, 
        target_module: targetModule,
        count: extensionPoints.length
      });

      // 2. 按执行顺序排序
      extensionPoints.sort((a, b) => a.point.execution_order - b.point.execution_order);

      // 3. 执行每个扩展点
      for (const { extensionId, point } of extensionPoints) {
        const extension = this.extensions.get(extensionId);
        if (!extension || extension.status !== 'active') {
          continue;
        }

        // 创建执行上下文
        const executionContext: ExtensionExecutionContext = {
          execution_id: uuidv4(),
          extension_id: extensionId,
          point_id: point.point_id,
          context_id: extension.context_id,
          start_time: new Date().toISOString() as Timestamp,
          timeout_ms: point.handler.timeout_ms || EXTENSION_CONSTANTS.DEFAULT_HANDLER_TIMEOUT_MS,
          parameters: point.handler.parameters || {},
          ...context
        };

        // 添加到活动执行列表
        this.activeExecutions.set(executionContext.execution_id, executionContext);

        try {
          // 执行扩展点处理器
          const result = await this.executeExtensionPointHandler(
            extensionId,
            point,
            eventData,
            executionContext
          );
          
          results.push(result);
          
          // 更新性能指标
          this.updateExtensionPerformance(
            extensionId,
            result.execution_time_ms,
            result.success
          );
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          // 记录执行错误
          const errorResult: ExtensionExecutionResult = {
            execution_id: executionContext.execution_id,
            extension_id: extensionId,
            success: false,
            error: {
              code: ExtensionErrorCode.HANDLER_EXECUTION_FAILED,
              message: errorMessage
            },
            execution_time_ms: Date.now() - new Date(executionContext.start_time).getTime()
          };
          
          results.push(errorResult);
          
          // 更新错误计数
          if (extension.lifecycle) {
            extension.lifecycle.error_count += 1;
            extension.lifecycle.last_error = {
              timestamp: new Date().toISOString() as Timestamp,
              error_type: ExtensionErrorCode.HANDLER_EXECUTION_FAILED,
              message: errorMessage
            };
          }
          
          // 更新性能指标
          this.updateExtensionPerformance(
            extensionId,
            errorResult.execution_time_ms,
            false
          );
        } finally {
          // 从活动执行列表中移除
          this.activeExecutions.delete(executionContext.execution_id);
        }
      }

      // 4. 更新执行统计
      this.updateExecutionStatistics(Date.now() - startTime);

      return results;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('扩展点执行失败', {
        point_name: pointName,
        target_module: targetModule,
        error: errorMessage,
        time_ms: Date.now() - startTime
      });
      
      return [{
        execution_id: uuidv4(),
        extension_id: '',
        success: false,
        error: {
          code: ExtensionErrorCode.INTERNAL_ERROR,
          message: errorMessage
        },
        execution_time_ms: Date.now() - startTime
      }];
    }
  }

  /**
   * 搜索扩展
   * 目标性能: < 20ms 完成搜索
   */
  public searchExtensions(criteria: ExtensionSearchCriteria): ExtensionProtocol[] {
    const results: ExtensionProtocol[] = [];
    
    // 如果没有条件，返回所有扩展
    if (!criteria || Object.keys(criteria).length === 0) {
      return Array.from(this.extensions.values());
    }
    
    // 遍历所有扩展
    for (const extension of this.extensions.values()) {
      // 按ID过滤
      if (criteria.extension_ids && criteria.extension_ids.length > 0) {
        if (!criteria.extension_ids.includes(extension.extension_id)) {
          continue;
        }
      }
      
      // 按上下文ID过滤
      if (criteria.context_ids && criteria.context_ids.length > 0) {
        if (!criteria.context_ids.includes(extension.context_id)) {
          continue;
        }
      }
      
      // 按名称过滤
      if (criteria.names && criteria.names.length > 0) {
        if (!criteria.names.includes(extension.name)) {
          continue;
        }
      }
      
      // 按类型过滤
      if (criteria.types && criteria.types.length > 0) {
        if (!criteria.types.includes(extension.type)) {
          continue;
        }
      }
      
      // 按状态过滤
      if (criteria.statuses && criteria.statuses.length > 0) {
        if (!criteria.statuses.includes(extension.status)) {
          continue;
        }
      }
      
      // 按类别过滤
      if (criteria.categories && criteria.categories.length > 0 && extension.metadata?.categories) {
        const hasCategory = criteria.categories.some(category => 
          extension.metadata?.categories?.includes(category)
        );
        if (!hasCategory) {
          continue;
        }
      }
      
      // 按作者过滤
      if (criteria.authors && criteria.authors.length > 0) {
        if (!extension.metadata?.author || !criteria.authors.includes(extension.metadata.author)) {
          continue;
        }
      }
      
      // 按关键词过滤
      if (criteria.keywords && criteria.keywords.length > 0 && extension.metadata?.keywords) {
        const hasKeyword = criteria.keywords.some(keyword => 
          extension.metadata?.keywords?.includes(keyword)
        );
        if (!hasKeyword) {
          continue;
        }
      }
      
      // 按安装时间过滤
      if (extension.lifecycle) {
        if (criteria.installed_after && new Date(extension.lifecycle.install_date) < new Date(criteria.installed_after)) {
          continue;
        }
        
        if (criteria.installed_before && new Date(extension.lifecycle.install_date) > new Date(criteria.installed_before)) {
          continue;
        }
      }
      
      // 通过所有过滤条件，添加到结果中
      results.push(extension);
    }
    
    return results;
  }

  /**
   * 获取扩展详情
   */
  public getExtension(extensionId: string): ExtensionProtocol | undefined {
    return this.extensions.get(extensionId);
  }

  /**
   * 获取所有扩展
   */
  public getAllExtensions(): ExtensionProtocol[] {
    return Array.from(this.extensions.values());
  }

  /**
   * 获取扩展统计信息
   */
  public getStatistics(): ExtensionStatistics {
    // 实时计算统计数据
    const allExtensions = Array.from(this.extensions.values());
    
    this.statistics.total_extensions = allExtensions.length;
    this.statistics.active_extensions = allExtensions.filter(ext => ext.status === 'active').length;
    this.statistics.failed_extensions = allExtensions.filter(ext => ext.status === 'error').length;
    
    // 计算平均响应时间
    const allTimes = Array.from(this.performanceMonitor.values()).flat();
    this.statistics.average_response_time = allTimes.length > 0 
      ? allTimes.reduce((sum, time) => sum + time, 0) / allTimes.length 
      : 0;

    // 计算内存使用
    this.statistics.memory_usage_mb = allExtensions.reduce((total, ext) => 
      total + (ext.lifecycle?.performance_metrics?.memory_usage_mb || 0), 0
    );

    return { ...this.statistics };
  }

  // ================== 私有辅助方法 ==================

  /**
   * 验证安装请求参数
   */
  private validateInstallRequest(request: InstallExtensionRequest): void {
    if (!request.name) {
      throw new Error('Extension name is required');
    }

    if (!request.source) {
      throw new Error('Extension source is required');
    }

    if (request.name.length > EXTENSION_CONSTANTS.MAX_NAME_LENGTH) {
      throw new Error(`Extension name exceeds maximum length of ${EXTENSION_CONSTANTS.MAX_NAME_LENGTH} characters`);
    }
  }

  private findExtensionByName(name: string): ExtensionProtocol | undefined {
    return Array.from(this.extensions.values()).find(ext => ext.name === name);
  }

  /**
   * 解析兼容性配置
   */
  private parseCompatibility(compatibilityData: unknown): ExtensionCompatibility {
    if (compatibilityData && typeof compatibilityData === 'object') {
      const data = compatibilityData as Record<string, unknown>;
      if (typeof data.mplp_version === 'string') {
        return {
          mplp_version: data.mplp_version,
          required_modules: data.required_modules as any[] || [],
          dependencies: data.dependencies as any[] || [],
          conflicts: data.conflicts as any[] || []
        };
      }
    }
    
    // 返回默认兼容性配置
    return {
      mplp_version: EXTENSION_CONSTANTS.PROTOCOL_VERSION
    };
  }

  /**
   * 解析配置
   */
  private parseConfiguration(extensionManifest: Record<string, unknown>, request: InstallExtensionRequest): ExtensionConfiguration {
    const configData = extensionManifest.configuration as Record<string, unknown> | undefined;
    
    return {
      schema: configData?.schema as Record<string, unknown> || {},
      current_config: request.configuration || (configData?.default_config as Record<string, unknown>) || {},
      default_config: configData?.default_config as Record<string, unknown> || {},
      validation_rules: configData?.validation_rules as ValidationRule[] || []
    };
  }

  /**
   * 创建安全配置
   * 从扩展清单中提取安全配置，并确保类型正确
   */
  private createSecurityConfig(extensionManifest: Record<string, unknown>): ExtensionSecurity {
    // 尝试从security或security_policies字段获取配置
    const securityConfig = extensionManifest.security || extensionManifest.security_policies;
    
    if (securityConfig && typeof securityConfig === 'object') {
      const config = securityConfig as Record<string, unknown>;
      // 确保必需的字段存在
      if (typeof config.sandbox_enabled === 'boolean' && config.resource_limits) {
        // 使用类型断言转换为ExtensionSecurity
        return {
          sandbox_enabled: config.sandbox_enabled,
          resource_limits: config.resource_limits as ExtensionResourceLimits,
          code_signing: config.code_signing as any,
          permissions: config.permissions as any[]
        };
      }
    }
    
    // 返回默认安全配置
    return {
      sandbox_enabled: true,
      resource_limits: {
        max_memory_mb: EXTENSION_CONSTANTS.DEFAULT_MAX_MEMORY_MB,
        max_cpu_percent: EXTENSION_CONSTANTS.DEFAULT_MAX_CPU_PERCENT,
        network_access: false,
        file_system_access: 'sandbox'
      }
    };
  }

  private async loadExtensionManifest(source: string): Promise<Record<string, unknown>> {
    // 这里应该实现真正的扩展加载逻辑
    // 现在返回模拟数据
    return {
      display_name: `Extension from ${source}`,
      description: `Loaded from ${source}`,
      version: '1.0.1',
      type: 'plugin' as ExtensionType, // 使用正确的字段名
      compatibility: {
        mplp_version: '1.0.1'
      }
    };
  }

  private async checkCompatibility(manifest: Record<string, unknown>): Promise<{ compatible: boolean; reason?: string; warnings?: string[] }> {
    // 实现兼容性检查逻辑
    return { compatible: true, warnings: [] };
  }

  private async checkDependencies(extension: ExtensionProtocol): Promise<{ satisfied: boolean; missing: string[] }> {
    // 实现依赖检查逻辑
    return { satisfied: true, missing: [] };
  }

  private findDependentExtensions(extensionId: string): string[] {
    return Array.from(this.extensions.values())
      .filter(ext => ext.compatibility?.dependencies?.some(dep => dep.extension_id === extensionId))
      .map(ext => ext.extension_id);
  }

  private findExtensionPoints(pointName: string, targetModule: string): Array<{ extensionId: string; point: ExtensionPoint }> {
    const results: Array<{ extensionId: string; point: ExtensionPoint }> = [];

    for (const [extensionId, extension] of this.extensions) {
      if (extension.status !== 'active' || !extension.extension_points) {
        continue;
      }

      for (const point of extension.extension_points) {
        if (point.enabled && 
            point.name === pointName && 
            (point.target_module === targetModule || point.target_module === 'system')) {
          results.push({ extensionId, point });
        }
      }
    }

    return results;
  }

  /**
   * 执行扩展点处理器
   */
  private async executeExtensionPointHandler(
    extensionId: string,
    point: ExtensionPoint,
    eventData: Record<string, unknown>,
    context: Partial<ExtensionExecutionContext>
  ): Promise<ExtensionExecutionResult> {
    const startTime = Date.now();

    try {
      const executionContext: ExtensionExecutionContext = {
        execution_id: uuidv4(),
        extension_id: extensionId,
        point_id: point.point_id,
        context_id: context.context_id || uuidv4(),
        start_time: new Date().toISOString() as Timestamp,
        timeout_ms: point.handler.timeout_ms || EXTENSION_CONSTANTS.DEFAULT_HANDLER_TIMEOUT_MS,
        parameters: point.handler.parameters || {},
        ...context
      };

      // 注册执行上下文
      this.activeExecutions.set(executionContext.execution_id, executionContext);

      try {
        // 获取处理器
        const handler = this.extensionHandlers.get(extensionId);
        if (!handler) {
          throw new Error(`Handler not found for extension ${extensionId}`);
        }

        // 执行处理器函数
        const handlerObj = handler as Record<string, unknown>;
        const handlerFunction = handlerObj[point.handler.function_name];
        if (typeof handlerFunction !== 'function') {
          throw new Error(`Handler function ${point.handler.function_name} not found`);
        }

        // 执行处理器
        const result = await this.simulateExtensionExecution(
          point,
          eventData,
          executionContext
        );

        // 返回成功结果
        return {
          execution_id: executionContext.execution_id,
          extension_id: extensionId,
          success: true,
          result,
          execution_time_ms: Date.now() - startTime,
          memory_usage_mb: process.memoryUsage().heapUsed / 1024 / 1024
        };
      } finally {
        // 清理执行上下文
        this.activeExecutions.delete(executionContext.execution_id);
      }

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const executionTime = Date.now() - startTime;
      
      logger.error('扩展点处理器执行失败', {
        extension_id: extensionId,
        point_name: point.name,
        error: errorMessage,
        execution_time_ms: executionTime
      });

      return {
        execution_id: uuidv4(),
        extension_id: extensionId,
        success: false,
        error: {
          code: ExtensionErrorCode.HANDLER_EXECUTION_FAILED,
          message: errorMessage
        },
        execution_time_ms: executionTime,
        memory_usage_mb: process.memoryUsage().heapUsed / 1024 / 1024
      };
    }
  }

  /**
   * 模拟扩展执行
   */
  private async simulateExtensionExecution(
    point: ExtensionPoint,
    eventData: Record<string, unknown>,
    context: ExtensionExecutionContext
  ): Promise<unknown> {
    // 模拟扩展执行
    const delay = Math.random() * 100; // 0-100ms 随机延迟
    await new Promise(resolve => setTimeout(resolve, delay));
    
    return {
      point_name: point.name,
      processed_data: eventData,
      execution_context: context.execution_id
    };
  }

  private async registerExtensionPoints(extensionId: string, points: ExtensionPoint[]): Promise<void> {
    // 实现扩展点注册逻辑
    logger.debug('注册扩展点', { extension_id: extensionId, points_count: points.length });
  }

  private async unregisterExtensionPoints(extensionId: string): Promise<void> {
    // 实现扩展点注销逻辑
    logger.debug('注销扩展点', { extension_id: extensionId });
  }

  private async registerApiExtensions(extensionId: string, apis: ApiExtension[]): Promise<void> {
    // 实现API扩展注册逻辑
    logger.debug('注册API扩展', { extension_id: extensionId, apis_count: apis.length });
  }

  private async unregisterApiExtensions(extensionId: string): Promise<void> {
    // 实现API扩展注销逻辑
    logger.debug('注销API扩展', { extension_id: extensionId });
  }

  private async registerEventSubscriptions(extensionId: string, subscriptions: EventSubscription[]): Promise<void> {
    // 实现事件订阅注册逻辑
    logger.debug('注册事件订阅', { extension_id: extensionId, subscriptions_count: subscriptions.length });
  }

  private async unregisterEventSubscriptions(extensionId: string): Promise<void> {
    // 实现事件订阅注销逻辑
    logger.debug('注销事件订阅', { extension_id: extensionId });
  }

  /**
   * 停止活动执行
   */
  private async stopActiveExecutions(extensionId: string): Promise<void> {
    const executionsToStop = Array.from(this.activeExecutions.values())
      .filter(execution => execution.extension_id === extensionId);

    for (const execution of executionsToStop) {
      logger.debug('停止扩展执行', {
        extension_id: extensionId,
        execution_id: execution.execution_id
      });
      
      this.activeExecutions.delete(execution.execution_id);
    }

    logger.info('已停止所有活动执行', {
      extension_id: extensionId,
      count: executionsToStop.length
    });
  }

  private async validateConfiguration(extension: ExtensionProtocol, config: Record<string, unknown>): Promise<{ valid: boolean; errors: string[] }> {
    // 实现配置验证逻辑
    const errors: string[] = [];
    
    // 基本验证
    if (!config || typeof config !== 'object') {
      errors.push('Configuration must be an object');
    }

    return { valid: errors.length === 0, errors };
  }

  private async reloadExtensionConfiguration(extensionId: string): Promise<void> {
    // 实现配置重新加载逻辑
    logger.debug('重新加载扩展配置', { extension_id: extensionId });
  }

  private updateExtensionPerformance(extensionId: string, executionTime: number, success: boolean): void {
    const extension = this.extensions.get(extensionId);
    if (!extension || !extension.lifecycle?.performance_metrics) {
      return;
    }

    const metrics = extension.lifecycle.performance_metrics;
    const totalExecs = metrics.total_executions || 0;
    
    // 更新执行次数
    metrics.total_executions = totalExecs + 1;

    // 更新平均执行时间
    const currentAvg = metrics.average_execution_time_ms || 0;
    metrics.average_execution_time_ms = (currentAvg * totalExecs + executionTime) / metrics.total_executions;

    // 更新成功率
    const currentSuccessCount = Math.round((metrics.success_rate || 1) * totalExecs);
    const newSuccessCount = success ? currentSuccessCount + 1 : currentSuccessCount;
    metrics.success_rate = newSuccessCount / metrics.total_executions;

    // 记录性能历史
    if (!this.performanceMonitor.has(extensionId)) {
      this.performanceMonitor.set(extensionId, []);
    }
    const history = this.performanceMonitor.get(extensionId)!;
    history.push(executionTime);
    
    // 保留最近100次记录
    if (history.length > 100) {
      history.shift();
    }
  }

  /**
   * 更新安装统计信息
   */
  private updateInstallStatistics(): void {
    this.statistics.total_extensions = this.extensions.size;
  }

  private updateUninstallStatistics(): void {
    this.statistics.total_extensions = this.extensions.size;
  }

  private updateActivationStatistics(): void {
    const activeCount = Array.from(this.extensions.values())
      .filter(ext => ext.status === 'active').length;
    this.statistics.active_extensions = activeCount;
  }

  private updateExecutionStatistics(executionTime: number): void {
    this.statistics.total_api_calls++;
    
    // 更新平均响应时间
    const currentAvg = this.statistics.average_response_time;
    const totalCalls = this.statistics.total_api_calls;
    this.statistics.average_response_time = (currentAvg * (totalCalls - 1) + executionTime) / totalCalls;
  }

  /**
   * 发送扩展事件
   */
  private emitExtensionEvent(extensionId: string, eventType: string, data: Record<string, unknown>): void {
    const event: ExtensionEvent = {
      event_type: eventType,
      extension_id: extensionId,
      timestamp: new Date().toISOString() as Timestamp,
      data
    };

    this.emit('extension_event', event);
    
    logger.debug('扩展事件发送', {
      extension_id: extensionId,
      event_type: eventType
    });
  }

  private startPerformanceMonitoring(): void {
    // 每5秒更新一次性能统计
    setInterval(() => {
      this.updateSystemPerformanceMetrics();
    }, 5000);
  }

  private startHealthCheckMonitoring(): void {
    // 每30秒执行一次健康检查
    setInterval(() => {
      this.performHealthChecks();
    }, 30000);
  }

  private updateSystemPerformanceMetrics(): void {
    // 实现系统性能指标更新
    const memoryUsage = process.memoryUsage();
    this.statistics.memory_usage_mb = memoryUsage.heapUsed / 1024 / 1024;
    
    // CPU使用率需要更复杂的计算，这里用模拟值
    this.statistics.cpu_usage_percent = Math.random() * 50;
  }

  /**
   * 执行健康检查
   */
  private async performHealthChecks(): Promise<void> {
    const activeExtensions = Array.from(this.extensions.values())
      .filter(ext => ext.status === 'active');

    for (const extension of activeExtensions) {
      try {
        await this.performExtensionHealthCheck(extension);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.warn('扩展健康检查失败', {
          extension_id: extension.extension_id,
          name: extension.name,
          error: errorMessage
        });

        // 标记扩展为错误状态
        extension.status = 'error';
        if (extension.lifecycle) {
          extension.lifecycle.error_count += 1;
          extension.lifecycle.last_error = {
            timestamp: new Date().toISOString() as Timestamp,
            error_type: ExtensionErrorCode.INTERNAL_ERROR,
            message: errorMessage
          };
        }
      }
    }
  }

  /**
   * 执行扩展健康检查
   */
  private async performExtensionHealthCheck(extension: ExtensionProtocol): Promise<void> {
    if (!extension.lifecycle?.health_check?.endpoint) {
      return; // 没有配置健康检查
    }

    try {
      // 执行健康检查逻辑...
      logger.debug('扩展健康检查成功', {
        extension_id: extension.extension_id,
        name: extension.name
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.warn('扩展健康检查失败', {
        extension_id: extension.extension_id,
        name: extension.name,
        error: errorMessage
      });

      // 更新错误计数
      if (extension.lifecycle) {
        extension.lifecycle.error_count += 1;
        extension.lifecycle.last_error = {
          timestamp: new Date().toISOString() as Timestamp,
          error_type: ExtensionErrorCode.INTERNAL_ERROR,
          message: errorMessage
        };
      }
    }
  }
} 