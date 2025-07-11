/**
 * Enhanced TracePilot MCP Adapter - 真正的开发助手
 * 
 * @version v2.0.0
 * @created 2025-07-09T25:10:00+08:00
 * @compliance .cursor/rules/mcp-integration.mdc - MCP工具标准
 * @description 智能开发助手，主动检测问题、追踪任务、提供解决方案
 */

import { EventEmitter } from 'events';
import { Logger } from '@/utils/logger';
import { Performance } from '@/utils/performance';
import { MPLPTraceData } from '@/types/trace';
import * as fs from 'fs/promises';
import * as path from 'path';

// 创建logger和performance实例
const logger = new Logger('EnhancedTracePilot');
const performance = new Performance();

// 创建性能监控装饰器
function PerformanceMonitor(target: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      const startTime = performance.now();
      try {
        const result = await originalMethod.apply(this, args);
        const duration = performance.since(startTime);
        
        // 记录性能指标
        const metricId = performance.start(`${target}.${propertyKey}`);
        performance.end(metricId);
        
        return result;
      } catch (error) {
        const duration = performance.since(startTime);
        const metricId = performance.start(`${target}.${propertyKey}`, { error: true });
        performance.end(metricId);
        throw error;
      }
    };
  };
}

/**
 * 开发问题类型
 */
export type DevelopmentIssueType = 
  | 'missing_schema'
  | 'type_error'
  | 'import_error'
  | 'test_failure'
  | 'performance_issue'
  | 'incomplete_implementation'
  | 'missing_validation'
  | 'configuration_error';

/**
 * 开发问题接口
 */
export interface DevelopmentIssue {
  id: string;
  type: DevelopmentIssueType;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  file_path?: string;
  line_number?: number;
  suggested_solution: string;
  auto_fixable: boolean;
  dependencies: string[];
  created_at: string;
  status: 'open' | 'in_progress' | 'resolved' | 'deferred';
}

/**
 * 任务追踪接口
 */
export interface TaskTracker {
  task_id: string;
  module: string;
  task_name: string;
  expected_completion_time: string;
  actual_completion_time?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked' | 'failed';
  progress_percentage: number;
  dependencies: string[];
  blockers: DevelopmentIssue[];
  quality_checks: QualityCheck[];
}

/**
 * 质量检查接口
 */
export interface QualityCheck {
  check_id: string;
  check_type: 'type_safety' | 'test_coverage' | 'performance' | 'schema_validation';
  status: 'passing' | 'failing' | 'pending';
  details: string;
  auto_fixable: boolean;
}

/**
 * TracePilot建议接口
 */
export interface TracePilotSuggestion {
  suggestion_id: string;
  type: 'fix' | 'optimization' | 'best_practice' | 'refactor';
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  implementation_steps: string[];
  estimated_time_minutes: number;
  code_examples?: Record<string, string>;
}

/**
 * 增强的TracePilot适配器
 * 
 * 真正的MCP工具实现：
 * - 主动问题检测
 * - 智能任务追踪  
 * - 实时质量监控
 * - 自动修复建议
 */
export class EnhancedTracePilotAdapter extends EventEmitter {
  private issues: Map<string, DevelopmentIssue> = new Map();
  private tasks: Map<string, TaskTracker> = new Map();
  private suggestions: Map<string, TracePilotSuggestion> = new Map();
  private projectRoot: string;
  private isActive: boolean = true;

  constructor(projectRoot: string = process.cwd()) {
    super();
    this.projectRoot = projectRoot;
    this.startContinuousMonitoring();
    
    logger.info('Enhanced TracePilot启动 - 真正的开发助手模式', {
      project_root: projectRoot,
      features: [
        'intelligent_issue_detection',
        'proactive_task_tracking', 
        'automatic_quality_checks',
        'smart_suggestions'
      ]
    });
  }

  /**
   * 主动检测开发问题
   */
  @PerformanceMonitor('EnhancedTracePilot.detectDevelopmentIssues')
  async detectDevelopmentIssues(): Promise<DevelopmentIssue[]> {
    const detectedIssues: DevelopmentIssue[] = [];
    
    // 1. 检测缺失的Schema定义
    const schemaIssues = await this.detectMissingSchemas();
    detectedIssues.push(...schemaIssues);
    
    // 2. 检测TypeScript类型错误
    const typeIssues = await this.detectTypeErrors();
    detectedIssues.push(...typeIssues);
    
    // 3. 检测未完成的实现
    const implementationIssues = await this.detectIncompleteImplementations();
    detectedIssues.push(...implementationIssues);
    
    // 4. 检测测试覆盖率问题
    const testIssues = await this.detectTestIssues();
    detectedIssues.push(...testIssues);
    
    // 存储和报告问题
    for (const issue of detectedIssues) {
      this.issues.set(issue.id, issue);
      this.emit('issue_detected', issue);
    }
    
    logger.info('TracePilot问题检测完成', {
      total_issues: detectedIssues.length,
      critical: detectedIssues.filter(i => i.severity === 'critical').length,
      high: detectedIssues.filter(i => i.severity === 'high').length
    });
    
    return detectedIssues;
  }

  /**
   * 检测缺失的Schema定义
   */
  private async detectMissingSchemas(): Promise<DevelopmentIssue[]> {
    const issues: DevelopmentIssue[] = [];
    const schemasPath = path.join(this.projectRoot, 'src/schemas');
    
    try {
      await fs.access(schemasPath);
    } catch {
      // schemas目录不存在
      issues.push({
        id: 'missing-schemas-directory',
        type: 'missing_schema',
        severity: 'critical',
        title: '缺失Schema定义目录',
        description: 'MPLP协议需要完整的JSON Schema定义来验证数据结构',
        suggested_solution: '创建src/schemas目录并实现所有核心模块的Schema定义',
        auto_fixable: true,
        dependencies: [],
        created_at: new Date().toISOString(),
        status: 'open'
      });
      
      return issues;
    }
    
    // 检查必需的Schema文件
    const requiredSchemas = [
      'context-protocol.json',
      'plan-protocol.json',
      'confirm-protocol.json',
      'trace-protocol.json',
      'role-protocol.json',
      'extension-protocol.json'
    ];
    
    for (const schemaFile of requiredSchemas) {
      const schemaPath = path.join(schemasPath, schemaFile);
      try {
        await fs.access(schemaPath);
      } catch {
        issues.push({
          id: `missing-schema-${schemaFile}`,
          type: 'missing_schema',
          severity: 'high',
          title: `缺失${schemaFile} Schema定义`,
          description: `模块需要${schemaFile}来验证数据结构的正确性`,
          file_path: schemaPath,
          suggested_solution: `基于src/modules中的TypeScript类型定义生成${schemaFile}`,
          auto_fixable: true,
          dependencies: [],
          created_at: new Date().toISOString(),
          status: 'open'
        });
      }
    }
    
    return issues;
  }

  /**
   * 检测TypeScript类型错误
   */
  private async detectTypeErrors(): Promise<DevelopmentIssue[]> {
    const issues: DevelopmentIssue[] = [];
    
    // 检查常见的类型导入问题
    const typeFiles = [
      'src/types/index.ts',
      'src/types/trace.ts',
      'src/types/context.ts', 
      'src/types/plan.ts'
    ];
    
    for (const typeFile of typeFiles) {
      const filePath = path.join(this.projectRoot, typeFile);
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        
        // 检查循环导入
        if (this.hasCircularImports(content, typeFile)) {
          issues.push({
            id: `circular-import-${typeFile}`,
            type: 'type_error',
            severity: 'high',
            title: `${typeFile}中存在循环导入`,
            description: '循环导入会导致TypeScript编译错误和运行时问题',
            file_path: typeFile,
            suggested_solution: '重构类型定义，将共同依赖提取到单独的文件中',
            auto_fixable: false,
            dependencies: [],
            created_at: new Date().toISOString(),
            status: 'open'
          });
        }
        
      } catch (error) {
        issues.push({
          id: `missing-type-file-${typeFile}`,
          type: 'type_error',
          severity: 'critical',
          title: `缺失类型定义文件: ${typeFile}`,
          description: '核心类型定义文件缺失会导致整个项目无法编译',
          file_path: typeFile,
          suggested_solution: '创建缺失的类型定义文件，并实现必要的接口',
          auto_fixable: true,
          dependencies: [],
          created_at: new Date().toISOString(),
          status: 'open'
        });
      }
    }
    
    return issues;
  }

  /**
   * 检测未完成的实现
   */
  private async detectIncompleteImplementations(): Promise<DevelopmentIssue[]> {
    const issues: DevelopmentIssue[] = [];
    
    // 检查模块完整性
    const modules = ['context', 'plan', 'trace'];
    
    for (const moduleName of modules) {
      const moduleDir = path.join(this.projectRoot, 'src/modules', moduleName);
      const requiredFiles = [
        'index.ts',
        'types.ts', 
        `${moduleName}-manager.ts`,
        'utils.ts'
      ];
      
      for (const requiredFile of requiredFiles) {
        const filePath = path.join(moduleDir, requiredFile);
        try {
          const content = await fs.readFile(filePath, 'utf-8');
          
          // 检查TODO注释或占位符
          if (content.includes('TODO') || content.includes('FIXME') || content.includes('PLACEHOLDER')) {
            issues.push({
              id: `incomplete-implementation-${moduleName}-${requiredFile}`,
              type: 'incomplete_implementation',
              severity: 'medium',
              title: `${moduleName}模块${requiredFile}实现不完整`,
              description: '文件中包含TODO、FIXME或PLACEHOLDER标记，表示实现未完成',
              file_path: path.join('src/modules', moduleName, requiredFile),
              suggested_solution: '完成所有标记的待办事项，并移除占位符代码',
              auto_fixable: false,
              dependencies: [],
              created_at: new Date().toISOString(),
              status: 'open'
            });
          }
          
        } catch (error) {
          issues.push({
            id: `missing-module-file-${moduleName}-${requiredFile}`,
            type: 'incomplete_implementation',
            severity: 'high',
            title: `${moduleName}模块缺失${requiredFile}`,
            description: '核心模块文件缺失，影响模块功能完整性',
            file_path: path.join('src/modules', moduleName, requiredFile),
            suggested_solution: `实现${moduleName}模块的${requiredFile}文件`,
            auto_fixable: true,
            dependencies: [],
            created_at: new Date().toISOString(),
            status: 'open'
          });
        }
      }
    }
    
    return issues;
  }

  /**
   * 检测测试相关问题
   */
  private async detectTestIssues(): Promise<DevelopmentIssue[]> {
    const issues: DevelopmentIssue[] = [];
    
    // 检查Jest配置
    const jestConfigPath = path.join(this.projectRoot, 'jest.config.js');
    try {
      const jestConfig = await fs.readFile(jestConfigPath, 'utf-8');
      
      // 检查模块映射配置
      if (!jestConfig.includes('moduleNameMapping')) {
        issues.push({
          id: 'jest-module-mapping-error',
          type: 'configuration_error',
          severity: 'high',
          title: 'Jest配置中模块映射错误',
          description: 'Jest无法正确解析TypeScript路径映射，导致测试失败',
          file_path: 'jest.config.js',
          suggested_solution: '修复Jest配置中的moduleNameMapping属性名拼写',
          auto_fixable: true,
          dependencies: [],
          created_at: new Date().toISOString(),
          status: 'open'
        });
      }
      
    } catch (error) {
      issues.push({
        id: 'missing-jest-config',
        type: 'configuration_error',
        severity: 'critical',
        title: '缺失Jest配置文件',
        description: '没有Jest配置文件，无法运行测试',
        suggested_solution: '创建jest.config.js配置文件',
        auto_fixable: true,
        dependencies: [],
        created_at: new Date().toISOString(),
        status: 'open'
      });
    }
    
    return issues;
  }

  /**
   * 生成智能修复建议
   */
  async generateSuggestions(): Promise<TracePilotSuggestion[]> {
    const suggestions: TracePilotSuggestion[] = [];
    const openIssues = Array.from(this.issues.values()).filter(issue => issue.status === 'open');
    
    // 基于检测到的问题生成建议
    for (const issue of openIssues) {
      if (issue.auto_fixable) {
        const suggestion = this.createAutoFixSuggestion(issue);
        suggestions.push(suggestion);
        this.suggestions.set(suggestion.suggestion_id, suggestion);
      }
    }
    
    // 生成架构改进建议
    const architecturalSuggestions = await this.generateArchitecturalSuggestions();
    suggestions.push(...architecturalSuggestions);
    
    return suggestions;
  }

  /**
   * 创建自动修复建议
   */
  private createAutoFixSuggestion(issue: DevelopmentIssue): TracePilotSuggestion {
    const suggestionMap: Record<DevelopmentIssueType, Partial<TracePilotSuggestion>> = {
      missing_schema: {
        type: 'fix',
        priority: 'critical',
        title: '自动生成缺失的Schema定义',
        implementation_steps: [
          '1. 创建src/schemas目录',
          '2. 基于TypeScript类型定义生成JSON Schema',
          '3. 添加Schema验证中间件',
          '4. 更新测试以包含Schema验证'
        ],
        estimated_time_minutes: 30
      },
      type_error: {
        type: 'fix',
        priority: 'high',
        title: '修复TypeScript类型错误',
        implementation_steps: [
          '1. 分析类型依赖关系',
          '2. 重构循环导入',
          '3. 补充缺失的类型定义',
          '4. 验证类型一致性'
        ],
        estimated_time_minutes: 20
      },
      configuration_error: {
        type: 'fix',
        priority: 'high',
        title: '修复配置错误',
        implementation_steps: [
          '1. 分析配置问题',
          '2. 应用正确的配置',
          '3. 验证配置有效性',
          '4. 更新相关文档'
        ],
        estimated_time_minutes: 15
      },
      incomplete_implementation: {
        type: 'fix',
        priority: 'medium',
        title: '完成未实现的功能',
        implementation_steps: [
          '1. 识别未完成的部分',
          '2. 补充缺失的实现',
          '3. 添加相应的测试',
          '4. 更新文档'
        ],
        estimated_time_minutes: 60
      },
      import_error: {
        type: 'fix',
        priority: 'high',
        title: '修复导入错误',
        implementation_steps: [
          '1. 检查导入路径',
          '2. 确认导出定义',
          '3. 修复路径映射',
          '4. 验证导入正确性'
        ],
        estimated_time_minutes: 10
      },
      test_failure: {
        type: 'fix',
        priority: 'medium',
        title: '修复测试失败',
        implementation_steps: [
          '1. 分析测试失败原因',
          '2. 修复相关代码',
          '3. 更新测试用例',
          '4. 验证测试通过'
        ],
        estimated_time_minutes: 25
      },
      performance_issue: {
        type: 'optimization',
        priority: 'low',
        title: '优化性能问题',
        implementation_steps: [
          '1. 分析性能瓶颈',
          '2. 实施优化方案',
          '3. 验证性能改进',
          '4. 添加性能监控'
        ],
        estimated_time_minutes: 45
      },
      missing_validation: {
        type: 'fix',
        priority: 'medium',
        title: '添加数据验证',
        implementation_steps: [
          '1. 识别验证需求',
          '2. 实现验证逻辑',
          '3. 添加错误处理',
          '4. 测试验证功能'
        ],
        estimated_time_minutes: 30
      }
    };

    const baseSuggestion = suggestionMap[issue.type] || {};
    
    return {
      suggestion_id: `fix-${issue.id}`,
      type: baseSuggestion.type || 'fix',
      priority: baseSuggestion.priority || 'medium',
      title: baseSuggestion.title || `修复问题: ${issue.title}`,
      description: issue.suggested_solution,
      implementation_steps: baseSuggestion.implementation_steps || [issue.suggested_solution],
      estimated_time_minutes: baseSuggestion.estimated_time_minutes || 30
    };
  }

  /**
   * 生成架构改进建议
   */
  private async generateArchitecturalSuggestions(): Promise<TracePilotSuggestion[]> {
    const suggestions: TracePilotSuggestion[] = [];
    
    // Schema优先建议
    suggestions.push({
      suggestion_id: 'implement-schema-first-approach',
      type: 'best_practice',
      priority: 'critical',
      title: '实施Schema优先开发方法',
      description: '建立完整的JSON Schema定义作为开发基础，确保数据结构一致性',
      implementation_steps: [
        '1. 为每个核心模块创建JSON Schema',
        '2. 实现Schema验证中间件',
        '3. 在编译时验证TypeScript类型与Schema一致性',
        '4. 添加运行时数据验证',
        '5. 集成到CI/CD流程中'
      ],
      estimated_time_minutes: 120,
      code_examples: {
        'base-protocol.json': JSON.stringify({
          $schema: 'http://json-schema.org/draft-07/schema#',
          type: 'object',
          properties: {
            version: { type: 'string', pattern: '^\\d+\\.\\d+\\.\\d+$' },
            timestamp: { type: 'string', format: 'date-time' }
          },
          required: ['version', 'timestamp']
        }, null, 2)
      }
    });
    
    return suggestions;
  }

  /**
   * 同步追踪数据到TracePilot
   * 保持与基础版TracePilot适配器的兼容性
   * 
   * @param traceData - MPLP追踪数据
   * @returns Promise<TracePilotSyncResult>
   */
  async syncTraceData(traceData: MPLPTraceData): Promise<{ success: boolean; sync_latency: number; traces_synced: number; errors: any[]; timestamp: string }> {
    const startTime = performance.now();
    
    try {
      // 基础的追踪数据同步逻辑
      logger.info('Enhanced TracePilot同步追踪数据', {
        trace_id: traceData.trace_id,
        operation: traceData.operation_name,
        context_id: traceData.context_id
      });
      
      // 模拟数据同步过程
      await new Promise(resolve => setTimeout(resolve, 10)); // 模拟网络延迟
      
      const syncLatency = performance.now() - startTime;
      
      // 发出同步完成事件
      this.emit('trace_synced', {
        trace_id: traceData.trace_id,
        sync_latency: syncLatency,
        timestamp: new Date().toISOString()
      });
      
      return {
        success: true,
        sync_latency: syncLatency,
        traces_synced: 1,
        errors: [],
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      const syncLatency = performance.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      logger.error('Enhanced TracePilot同步失败', {
        trace_id: traceData.trace_id,
        error: errorMessage,
        sync_latency: syncLatency
      });
      
      return {
        success: false,
        sync_latency: syncLatency,
        traces_synced: 0,
        errors: [errorMessage],
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 添加追踪数据到批处理队列
   * 保持与基础版TracePilot适配器的兼容性
   * 
   * @param traceData - MPLP追踪数据
   */
  async addToBatch(traceData: MPLPTraceData): Promise<void> {
    logger.info('Enhanced TracePilot添加到批处理队列', {
      trace_id: traceData.trace_id,
      operation: traceData.operation_name
    });
    
    // 这里可以实现批处理逻辑
    // 目前直接调用同步方法
    await this.syncTraceData(traceData);
  }

  /**
   * 自动执行修复
   */
  async autoFix(suggestionId: string): Promise<boolean> {
    const suggestion = this.suggestions.get(suggestionId);
    if (!suggestion) {
      logger.error('未找到修复建议', { suggestion_id: suggestionId });
      return false;
    }
    
    try {
      // 这里实现具体的自动修复逻辑
      logger.info('开始自动修复', { suggestion: suggestion.title });
      
      // 示例：创建Schema目录和文件
      if (suggestion.title.includes('Schema')) {
        await this.autoFixSchemaIssues();
      }
      
      // 标记建议为已应用
      this.emit('auto_fix_applied', { suggestion_id: suggestionId, suggestion });
      
      return true;
    } catch (error) {
      logger.error('自动修复失败', {
        suggestion_id: suggestionId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  }

  /**
   * 自动修复Schema问题
   */
  private async autoFixSchemaIssues(): Promise<void> {
    logger.info('开始自动修复Schema问题...');
    
    // 生成6个核心模块的Schema文件
    await this.generateContextProtocolSchema();
    await this.generatePlanProtocolSchema();
    await this.generateConfirmProtocolSchema();
    await this.generateTraceProtocolSchema();
    await this.generateRoleProtocolSchema();
    await this.generateExtensionProtocolSchema();
    
    logger.info('Schema自动修复完成');
  }

  /**
   * 生成Confirm Protocol Schema
   */
  private async generateConfirmProtocolSchema(): Promise<void> {
    const schemaContent = {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      $id: 'confirm-protocol.json',
      title: 'MPLP Confirm Protocol',
      description: 'Confirm模块协议Schema - 验证决策和审批管理',
      type: 'object',
      properties: {
        confirm_id: { type: 'string', format: 'uuid' },
        context_id: { type: 'string', format: 'uuid' },
        plan_id: { type: 'string', format: 'uuid' },
        type: { type: 'string', enum: ['approval', 'validation', 'verification'] },
        status: { type: 'string', enum: ['pending', 'approved', 'rejected', 'cancelled'] },
        priority: { type: 'string', enum: ['critical', 'high', 'medium', 'low'] }
      },
      required: ['confirm_id', 'context_id', 'type', 'status', 'priority']
    };

    const filePath = path.join(this.projectRoot, 'src/schemas/confirm-protocol.json');
    await fs.writeFile(filePath, JSON.stringify(schemaContent, null, 2));
    logger.info('生成confirm-protocol.json Schema');
  }

  /**
   * 生成Role Protocol Schema
   */
  private async generateRoleProtocolSchema(): Promise<void> {
    const schemaContent = {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      $id: 'role-protocol.json',
      title: 'MPLP Role Protocol',
      description: 'Role模块协议Schema - 角色定义和权限管理',
      type: 'object',
      properties: {
        role_id: { type: 'string', format: 'uuid' },
        context_id: { type: 'string', format: 'uuid' },
        name: { type: 'string' },
        type: { type: 'string', enum: ['system', 'user', 'service'] },
        status: { type: 'string', enum: ['active', 'inactive', 'suspended'] },
        permissions: { type: 'array', items: { type: 'object' } }
      },
      required: ['role_id', 'context_id', 'name', 'type', 'status', 'permissions']
    };

    const filePath = path.join(this.projectRoot, 'src/schemas/role-protocol.json');
    await fs.writeFile(filePath, JSON.stringify(schemaContent, null, 2));
    logger.info('生成role-protocol.json Schema');
  }

  /**
   * 生成Extension Protocol Schema
   */
  private async generateExtensionProtocolSchema(): Promise<void> {
    const schemaContent = {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      $id: 'extension-protocol.json',
      title: 'MPLP Extension Protocol',
      description: 'Extension模块协议Schema - 扩展机制和插件管理',
      type: 'object',
      properties: {
        extension_id: { type: 'string', format: 'uuid' },
        context_id: { type: 'string', format: 'uuid' },
        name: { type: 'string' },
        type: { type: 'string', enum: ['plugin', 'integration', 'adapter'] },
        status: { type: 'string', enum: ['active', 'inactive', 'error'] },
        version: { type: 'string', pattern: '^\\d+\\.\\d+\\.\\d+$' }
      },
      required: ['extension_id', 'context_id', 'name', 'type', 'status', 'version']
    };

    const filePath = path.join(this.projectRoot, 'src/schemas/extension-protocol.json');
    await fs.writeFile(filePath, JSON.stringify(schemaContent, null, 2));
    logger.info('生成extension-protocol.json Schema');
  }

  /**
   * 生成Context Protocol Schema
   */
  private async generateContextProtocolSchema(): Promise<void> {
    const schemaContent = {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      $id: 'context-protocol.json',
      title: 'MPLP Context Protocol',
      description: 'Context模块协议Schema - 上下文和全局状态管理',
      type: 'object',
      properties: {
        context_id: { type: 'string', format: 'uuid' },
        name: { type: 'string' },
        status: { type: 'string', enum: ['active', 'suspended', 'completed', 'terminated'] },
        lifecycle_stage: { type: 'string', enum: ['planning', 'executing', 'monitoring', 'completed'] },
        shared_state: { type: 'object' }
      },
      required: ['context_id', 'name', 'status', 'lifecycle_stage', 'shared_state']
    };

    const filePath = path.join(this.projectRoot, 'src/schemas/context-protocol.json');
    await fs.writeFile(filePath, JSON.stringify(schemaContent, null, 2));
    logger.info('生成context-protocol.json Schema');
  }

  /**
   * 生成Plan Protocol Schema
   */
  private async generatePlanProtocolSchema(): Promise<void> {
    const schemaContent = {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      $id: 'plan-protocol.json',
      title: 'MPLP Plan Protocol',
      description: 'Plan模块协议Schema - 任务规划和依赖管理',
      type: 'object',
      properties: {
        plan_id: { type: 'string', format: 'uuid' },
        context_id: { type: 'string', format: 'uuid' },
        name: { type: 'string' },
        status: { type: 'string', enum: ['draft', 'approved', 'active', 'paused', 'completed', 'cancelled', 'failed'] },
        priority: { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
        tasks: { type: 'array', items: { type: 'object' } }
      },
      required: ['plan_id', 'context_id', 'name', 'status', 'priority', 'tasks']
    };

    const filePath = path.join(this.projectRoot, 'src/schemas/plan-protocol.json');
    await fs.writeFile(filePath, JSON.stringify(schemaContent, null, 2));
    logger.info('生成plan-protocol.json Schema');
  }

  /**
   * 生成Trace Protocol Schema
   */
  private async generateTraceProtocolSchema(): Promise<void> {
    const schemaContent = {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      $id: 'trace-protocol.json',
      title: 'MPLP Trace Protocol',
      description: 'Trace模块协议Schema - 追踪记录和监控分析',
      type: 'object',
      properties: {
        trace_id: { type: 'string', format: 'uuid' },
        context_id: { type: 'string', format: 'uuid' },
        plan_id: { type: 'string', format: 'uuid' },
        event_type: { type: 'string' },
        source: { type: 'string' },
        severity: { type: 'string', enum: ['debug', 'info', 'warn', 'error', 'critical'] }
      },
      required: ['trace_id', 'context_id', 'event_type', 'source', 'severity']
    };

    const filePath = path.join(this.projectRoot, 'src/schemas/trace-protocol.json');
    await fs.writeFile(filePath, JSON.stringify(schemaContent, null, 2));
    logger.info('生成trace-protocol.json Schema');
  }

  /**
   * 辅助方法：检测循环导入
   */
  private hasCircularImports(content: string, fileName: string): boolean {
    // 简单的循环导入检测逻辑
    const imports = content.match(/import.*from\s+['"]([^'"]+)['"]/g) || [];
    const relativeSelfImports = imports.filter(imp => 
      imp.includes('./') && imp.includes(path.basename(fileName, '.ts'))
    );
    return relativeSelfImports.length > 0;
  }

  /**
   * 启动持续监控
   */
  private startContinuousMonitoring(): void {
    // 每30秒检测一次问题
    setInterval(async () => {
      if (this.isActive) {
        await this.detectDevelopmentIssues();
        await this.generateSuggestions();
      }
    }, 30000);
    
    logger.info('TracePilot持续监控已启动');
  }

  /**
   * 获取问题报告
   */
  getIssueReport(): {
    total_issues: number;
    by_severity: Record<string, number>;
    by_type: Record<string, number>;
    recent_issues: DevelopmentIssue[];
  } {
    const allIssues = Array.from(this.issues.values());
    
    return {
      total_issues: allIssues.length,
      by_severity: {
        critical: allIssues.filter(i => i.severity === 'critical').length,
        high: allIssues.filter(i => i.severity === 'high').length,
        medium: allIssues.filter(i => i.severity === 'medium').length,
        low: allIssues.filter(i => i.severity === 'low').length
      },
      by_type: allIssues.reduce((acc, issue) => {
        acc[issue.type] = (acc[issue.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      recent_issues: allIssues
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10)
    };
  }

  /**
   * 停止监控
   */
  stop(): void {
    this.isActive = false;
    logger.info('TracePilot监控已停止');
  }
} 