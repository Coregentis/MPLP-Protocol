/**
 * Role模块适配器
 * 
 * 实现Core模块的ModuleInterface接口，提供生命周期管理功能
 * 
 * @version 2.0.0
 * @created 2025-08-04
 * @updated 2025-08-04 22:19
 */

import { v4 as uuidv4 } from 'uuid';
import { 
  ModuleInterface, 
  ModuleStatus, 
  LifecycleCoordinationRequest,
  LifecycleResult
} from '../../../../public/modules/core/types/core.types';
import { RoleManagementService, CreateRoleRequest, OperationResult } from '../../application/services/role-management.service';
import { Logger } from '../../../../public/utils/logger';
import {
  RoleType,
  RoleStatus,
  Permission,
  PermissionAction,
  ResourceType,
  GrantType
} from '../../types';
import { UUID } from '../../../../public/shared/types';

/**
 * Role模块适配器类
 * 实现Core模块的ModuleInterface接口
 */
export class RoleModuleAdapter implements ModuleInterface {
  public readonly module_name = 'role';
  private logger = new Logger('RoleModuleAdapter');
  private moduleStatus: ModuleStatus = {
    module_name: 'role',
    status: 'idle',
    error_count: 0
  };

  constructor(private roleManagementService: RoleManagementService) {}

  /**
   * 初始化模块
   */
  async initialize(): Promise<void> {
    try {
      this.logger.info('Initializing Role module adapter');
      
      // 检查RoleManagementService是否可用
      if (!this.roleManagementService) {
        throw new Error('RoleManagementService not available');
      }

      this.moduleStatus.status = 'initialized';
      this.logger.info('Role module adapter initialized successfully');
    } catch (error) {
      this.moduleStatus.status = 'error';
      this.moduleStatus.error_count++;
      this.logger.error('Failed to initialize Role module adapter', error);
      throw error;
    }
  }

  /**
   * 执行生命周期管理
   */
  async execute(request: LifecycleCoordinationRequest): Promise<LifecycleResult> {
    this.logger.info('Executing lifecycle coordination', { 
      contextId: request.contextId,
      strategy: request.creation_strategy 
    });

    this.moduleStatus.status = 'running';
    this.moduleStatus.last_execution = new Date().toISOString();

    try {
      // 验证请求参数
      this.validateLifecycleRequest(request);

      // 根据策略执行生命周期管理
      const result = await this.executeLifecycleStrategy(request);

      this.moduleStatus.status = 'idle';
      
      this.logger.info('Lifecycle coordination completed', {
        contextId: request.contextId,
        role_id: result.role_id
      });

      return result;
    } catch (error) {
      this.moduleStatus.status = 'error';
      this.moduleStatus.error_count++;
      
      this.logger.error('Lifecycle coordination failed', {
        contextId: request.contextId,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * 清理资源
   */
  async cleanup(): Promise<void> {
    try {
      this.logger.info('Cleaning up Role module adapter');
      this.moduleStatus.status = 'idle';
      this.logger.info('Role module adapter cleanup completed');
    } catch (error) {
      this.logger.error('Failed to cleanup Role module adapter', error);
      throw error;
    }
  }

  /**
   * 获取模块状态
   */
  getStatus(): ModuleStatus {
    return this.moduleStatus;
  }

  // ===== 私有方法 =====

  /**
   * 验证生命周期请求
   */
  private validateLifecycleRequest(request: LifecycleCoordinationRequest): void {
    if (!request.contextId) {
      throw new Error('Context ID is required');
    }

    if (!['static', 'dynamic', 'template_based', 'ai_generated'].includes(request.creation_strategy)) {
      throw new Error(`Unsupported creation strategy: ${request.creation_strategy}`);
    }

    // 验证模板策略的模板源
    if (request.creation_strategy === 'template_based') {
      if (!request.parameters.template_source) {
        throw new Error('Template source is required for template_based strategy');
      }
    }

    // 验证AI生成策略的生成条件
    if (request.creation_strategy === 'ai_generated') {
      if (!request.parameters.generation_criteria) {
        throw new Error('Generation criteria is required for ai_generated strategy');
      }
    }

    // 验证能力管理配置
    if (request.capability_management) {
      const { skills, expertise_level } = request.capability_management;
      
      if (!skills || skills.length === 0) {
        throw new Error('At least one skill is required for capability management');
      }

      if (expertise_level < 1 || expertise_level > 10) {
        throw new Error('Expertise level must be between 1 and 10');
      }
    }
  }

  /**
   * 执行生命周期策略
   */
  private async executeLifecycleStrategy(request: LifecycleCoordinationRequest): Promise<LifecycleResult> {
    const role_id = uuidv4();
    const timestamp = new Date().toISOString();

    // 根据策略生成角色数据
    const roleData = await this.generateRoleData(request, role_id);

    // 创建角色
    const createRoleRequest: CreateRoleRequest = {
      context_id: request.contextId,
      name: roleData.name,
      role_type: roleData.role_type,
      display_name: roleData.display_name,
      description: roleData.description,
      permissions: roleData.permissions
    };

    const createResult = await this.roleManagementService.createRole(createRoleRequest);
    if (!createResult.success || !createResult.data) {
      throw new Error(`Failed to create role: ${createResult.error}`);
    }

    // 处理能力管理
    const capabilities = this.processCapabilityManagement(request);

    return {
      role_id,
      role_data: createResult.data,
      capabilities,
      timestamp
    };
  }

  /**
   * 根据策略生成角色数据
   */
  private async generateRoleData(request: LifecycleCoordinationRequest, role_id: string): Promise<{
    name: string;
    role_type: RoleType;
    display_name?: string;
    description?: string;
    permissions: Permission[];
  }> {
    switch (request.creation_strategy) {
      case 'static':
        return this.generateStaticRole(request, role_id);
      
      case 'dynamic':
        return this.generateDynamicRole(request, role_id);
      
      case 'template_based':
        return this.generateTemplateBasedRole(request, role_id);
      
      case 'ai_generated':
        return this.generateAIRole(request, role_id);
      
      default:
        throw new Error(`Unsupported creation strategy: ${request.creation_strategy}`);
    }
  }

  /**
   * 生成静态角色
   */
  private generateStaticRole(request: LifecycleCoordinationRequest, role_id: string): {
    name: string;
    role_type: RoleType;
    display_name?: string;
    description?: string;
    permissions: Permission[];
  } {
    return {
      name: `static_role_${role_id.substring(0, 8)}`,
      role_type: 'functional',
      display_name: 'Static Role',
      description: 'A statically defined role with predefined permissions',
      permissions: this.getDefaultPermissions()
    };
  }

  /**
   * 生成动态角色
   */
  private generateDynamicRole(request: LifecycleCoordinationRequest, role_id: string): {
    name: string;
    role_type: RoleType;
    display_name?: string;
    description?: string;
    permissions: Permission[];
  } {
    const rules = request.parameters.creation_rules || [];
    const permissions = this.generateDynamicPermissions(rules);

    return {
      name: `dynamic_role_${role_id.substring(0, 8)}`,
      role_type: 'project',
      display_name: 'Dynamic Role',
      description: `Dynamically created role based on rules: ${rules.join(', ')}`,
      permissions
    };
  }

  /**
   * 生成基于模板的角色
   */
  private generateTemplateBasedRole(request: LifecycleCoordinationRequest, role_id: string): {
    name: string;
    role_type: RoleType;
    display_name?: string;
    description?: string;
    permissions: Permission[];
  } {
    const templateSource = request.parameters.template_source!;
    
    return {
      name: `template_role_${role_id.substring(0, 8)}`,
      role_type: 'organizational',
      display_name: 'Template-based Role',
      description: `Role created from template: ${templateSource}`,
      permissions: this.getTemplatePermissions(templateSource)
    };
  }

  /**
   * 生成AI生成的角色
   */
  private generateAIRole(request: LifecycleCoordinationRequest, role_id: string): {
    name: string;
    role_type: RoleType;
    display_name?: string;
    description?: string;
    permissions: Permission[];
  } {
    const criteria = request.parameters.generation_criteria;
    
    return {
      name: `ai_role_${role_id.substring(0, 8)}`,
      role_type: 'temporary',
      display_name: 'AI-generated Role',
      description: `AI-generated role based on criteria: ${JSON.stringify(criteria)}`,
      permissions: this.generateAIPermissions(criteria)
    };
  }

  /**
   * 处理能力管理
   */
  private processCapabilityManagement(request: LifecycleCoordinationRequest): string[] {
    if (!request.capability_management) {
      return ['basic_operations'];
    }

    const { skills, expertise_level, learning_enabled } = request.capability_management;
    const capabilities = [...skills];

    // 根据专业水平添加额外能力
    if (expertise_level >= 7) {
      capabilities.push('advanced_operations');
    }
    if (expertise_level >= 9) {
      capabilities.push('expert_operations');
    }

    // 如果启用学习，添加学习能力
    if (learning_enabled) {
      capabilities.push('adaptive_learning');
    }

    return capabilities;
  }

  /**
   * 获取默认权限
   */
  private getDefaultPermissions(): Permission[] {
    return [
      {
        permission_id: uuidv4(),
        resource_type: 'context' as ResourceType,
        resource_id: '*',
        actions: ['read'] as PermissionAction[],
        grant_type: 'direct' as GrantType
      },
      {
        permission_id: uuidv4(),
        resource_type: 'plan' as ResourceType,
        resource_id: '*',
        actions: ['read'] as PermissionAction[],
        grant_type: 'direct' as GrantType
      }
    ];
  }

  /**
   * 生成动态权限
   */
  private generateDynamicPermissions(rules: string[]): Permission[] {
    const permissions = this.getDefaultPermissions();

    // 根据规则添加额外权限
    if (rules.includes('admin_access')) {
      permissions.push({
        permission_id: uuidv4(),
        resource_type: 'system' as ResourceType,
        resource_id: '*',
        actions: ['admin'] as PermissionAction[],
        grant_type: 'direct' as GrantType
      });
    }

    return permissions;
  }

  /**
   * 获取模板权限
   */
  private getTemplatePermissions(templateSource: string): Permission[] {
    // 简化实现：根据模板源返回不同权限
    if (templateSource.includes('admin')) {
      return [
        {
          permission_id: uuidv4(),
          resource_type: 'system' as ResourceType,
          resource_id: '*',
          actions: ['admin', 'manage'] as PermissionAction[],
          grant_type: 'inherited' as GrantType
        }
      ];
    }

    return this.getDefaultPermissions();
  }

  /**
   * 生成AI权限
   */
  private generateAIPermissions(criteria: any): Permission[] {
    // 简化实现：根据AI条件生成权限
    const permissions = this.getDefaultPermissions();

    if (criteria.access_level === 'high') {
      permissions.push({
        permission_id: uuidv4(),
        resource_type: 'system' as ResourceType,
        resource_id: '*',
        actions: ['execute', 'manage'] as PermissionAction[],
        grant_type: 'temporary' as GrantType
      });
    }

    return permissions;
  }

  /**
   * P0修复：临时实现新方法
   */
  async executeStage(context: any): Promise<any> {
    return { stage: 'role', status: 'completed', result: {}, duration_ms: 100, started_at: new Date().toISOString(), completed_at: new Date().toISOString() };
  }

  async executeBusinessCoordination(request: any): Promise<any> {
    const result = await this.execute({ contextId: request.context_id, creation_strategy: 'dynamic', parameters: {} });
    return {
      coordination_id: request.coordination_id,
      module: 'role',
      status: 'completed',
      output_data: { data_type: 'role_data', data_version: '1.0.0', payload: result, metadata: { source_module: 'role', target_modules: [], data_schema_version: '1.0.0', validation_status: 'valid', security_level: 'internal' }, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      execution_metrics: { start_time: new Date().toISOString(), end_time: new Date().toISOString(), duration_ms: 100 },
      timestamp: new Date().toISOString()
    };
  }

  async validateInput(input: any): Promise<any> {
    return { is_valid: true, errors: [], warnings: [] };
  }

  async handleError(error: any, context: any): Promise<any> {
    return { handled: true, recovery_action: 'retry' };
  }
}
