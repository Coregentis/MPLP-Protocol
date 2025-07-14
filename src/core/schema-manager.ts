/**
 * MPLP Schema Manager v1.0
 * 负责加载、管理和协调所有MPLP模块的Schema定义
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { MPLPSchemaValidator, ValidationResult } from './schema-validator';
import { Logger } from '../utils/logger';
import { Performance } from '../utils/performance';

// Schema metadata interface
export interface SchemaMetadata {
  id: string;
  title: string;
  version: string;
  description: string;
  module: string;
  dependencies: string[];
  lastLoaded: string;
  filePath: string;
}

// Schema load result interface
export interface SchemaLoadResult {
  success: boolean;
  schemaId: string;
  error?: string;
  loadTime: number;
  dependenciesResolved: boolean;
}

// MPLP modules enum
export enum MPLPModule {
  CONTEXT = 'context-protocol', 
  PLAN = 'plan-protocol',
  CONFIRM = 'confirm-protocol',
  TRACE = 'trace-protocol',
  ROLE = 'role-protocol',
  EXTENSION = 'extension-protocol'
}

/**
 * MPLP Schema Manager
 * Features:
 * - Automatic schema discovery and loading
 * - Dependency resolution between schemas
 * - Schema versioning and compatibility checks
 * - Hot reload support for development
 * - Centralized validation coordination
 */
export class MPLPSchemaManager {
  private validator: MPLPSchemaValidator;
  private schemas: Map<string, SchemaMetadata> = new Map();
  private logger: Logger;
  private performance: Performance;
  private schemaDirectory: string;
  private loadOrder: string[] = [];

  constructor(schemaDirectory: string = 'src/schemas') {
    this.schemaDirectory = schemaDirectory;
    this.logger = new Logger('MPLPSchemaManager');
    this.performance = new Performance();
    this.validator = new MPLPSchemaValidator();
    
    this.logger.info('MPLP Schema Manager initialized');
  }

  /**
   * Initialize schema manager and load all schemas
   */
  async initialize(): Promise<void> {
    const startTime = this.performance.now();

    try {
      // Load schemas in dependency order
      await this.loadAllSchemas();
      
      // Precompile all schemas for performance
      await this.validator.precompileAll();
      
      // Register custom validation rules
      this.registerCustomValidationRules();

      const duration = this.performance.since(startTime);
      this.logger.info(`Schema Manager initialized with ${this.schemas.size} schemas in ${duration}ms`);

    } catch (error) {
      this.logger.error('Failed to initialize Schema Manager:', { 
        error: error instanceof Error ? error.message : String(error) 
      });
      throw error;
    }
  }

  /**
   * Load all MPLP schemas in correct dependency order
   */
  private async loadAllSchemas(): Promise<void> {
    // Define load order based on dependencies
    // 所有模块现在都是独立的，因为通用定义已内联
    const loadOrder = [
      MPLPModule.CONTEXT,    // Context模块 - 独立
      MPLPModule.PLAN,       // Plan模块 - 独立
      MPLPModule.CONFIRM,    // Confirm模块 - 独立
      MPLPModule.TRACE,      // Trace模块 - 独立
      MPLPModule.ROLE,       // Role模块 - 独立
      MPLPModule.EXTENSION   // Extension模块 - 独立
    ];

    const loadResults: SchemaLoadResult[] = [];

    for (const module of loadOrder) {
      const result = await this.loadSchema(module);
      loadResults.push(result);
      
      if (!result.success) {
        throw new Error(`Failed to load required schema: ${module}. Error: ${result.error}`);
      }
    }

    this.loadOrder = loadOrder;
    this.logger.info(`Loaded ${loadResults.length} schemas successfully`);
  }

  /**
   * Load a specific schema file
   */
  private async loadSchema(moduleId: string): Promise<SchemaLoadResult> {
    const startTime = this.performance.now();
    const schemaPath = join(this.schemaDirectory, `${moduleId}.json`);

    try {
      // Check if schema file exists
      if (!existsSync(schemaPath)) {
        throw new Error(`Schema file not found: ${schemaPath}`);
      }

      // Read and parse schema
      const schemaContent = readFileSync(schemaPath, 'utf-8');
      const schema = JSON.parse(schemaContent);

      // Extract metadata
      const metadata: SchemaMetadata = {
        id: moduleId,
        title: schema.title || moduleId,
        version: this.extractVersion(schema),
        description: schema.description || '',
        module: this.getModuleName(moduleId),
        dependencies: this.extractDependencies(schema),
        lastLoaded: new Date().toISOString(),
        filePath: schemaPath
      };

      // Validate dependencies are already loaded
      const dependenciesResolved = this.checkDependencies(metadata.dependencies);

      // Register schema with validator
      await this.validator.registerSchema(
        moduleId, 
        schema, 
        metadata.version, 
        metadata.dependencies
      );

      // Store metadata
      this.schemas.set(moduleId, metadata);

      const loadTime = this.performance.since(startTime);
      
      this.logger.info(`Schema ${moduleId} v${metadata.version} loaded in ${loadTime}ms`);

      return {
        success: true,
        schemaId: moduleId,
        loadTime,
        dependenciesResolved
      };

    } catch (error) {
      const loadTime = this.performance.since(startTime);
      this.logger.error(`Failed to load schema ${moduleId}:`, { 
        error: error instanceof Error ? error.message : String(error) 
      });

      return {
        success: false,
        schemaId: moduleId,
        error: error instanceof Error ? error.message : 'Unknown error',
        loadTime,
        dependenciesResolved: false
      };
    }
  }

  /**
   * Validate data against a schema
   */
  async validate(schemaId: string, data: unknown): Promise<ValidationResult> {
    if (!this.schemas.has(schemaId)) {
      throw new Error(`Schema ${schemaId} is not loaded`);
    }

    // 确保data是一个对象类型
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new Error(`Invalid data type: data must be an object`);
    }

    return await this.validator.validate(schemaId, data as Record<string, unknown>);
  }

  /**
   * Batch validate multiple items
   */
  async batchValidate(
    requests: Array<{ schemaId: string; data: unknown; id?: string }>
  ): Promise<Array<ValidationResult & { requestId?: string }>> {
    // Validate that all required schemas are loaded
    for (const request of requests) {
      if (!this.schemas.has(request.schemaId)) {
        throw new Error(`Schema ${request.schemaId} is not loaded`);
      }
      
      // 确保每个请求的data是一个对象类型
      if (!request.data || typeof request.data !== 'object' || Array.isArray(request.data)) {
        throw new Error(`Invalid data type for schema ${request.schemaId}: data must be an object`);
      }
    }

    // 将请求中的data转换为Record<string, unknown>类型
    const validRequests = requests.map(req => ({
      ...req,
      data: req.data as Record<string, unknown>
    }));

    return await this.validator.batchValidate(validRequests);
  }

  /**
   * Get schema metadata
   */
  getSchemaInfo(schemaId: string): SchemaMetadata | undefined {
    return this.schemas.get(schemaId);
  }

  /**
   * Get all loaded schemas information
   */
  getAllSchemasInfo(): SchemaMetadata[] {
    return Array.from(this.schemas.values());
  }

  /**
   * Get schema registry statistics
   */
  getRegistryStats(): {
    totalSchemas: number;
    loadedSchemas: string[];
    dependencyGraph: Record<string, string[]>;
    loadOrder: string[];
    registryInfo: any;
  } {
    const dependencyGraph: Record<string, string[]> = {};
    
    for (const [schemaId, metadata] of this.schemas) {
      dependencyGraph[schemaId] = metadata.dependencies;
    }

    return {
      totalSchemas: this.schemas.size,
      loadedSchemas: Array.from(this.schemas.keys()),
      dependencyGraph,
      loadOrder: this.loadOrder,
      registryInfo: this.validator.getRegistryInfo()
    };
  }

  /**
   * Reload a specific schema (useful for development)
   */
  async reloadSchema(schemaId: string): Promise<SchemaLoadResult> {
    this.logger.info(`Reloading schema: ${schemaId}`);
    
    // Remove from current registry
    this.schemas.delete(schemaId);
    
    // Reload the schema
    return await this.loadSchema(schemaId);
  }

  /**
   * Hot reload all schemas (development only)
   */
  async hotReload(): Promise<void> {
    this.logger.warn('Hot reloading all schemas - development mode only');
    
    const reloadOrder = [...this.loadOrder];
    this.schemas.clear();
    
    for (const schemaId of reloadOrder) {
      await this.loadSchema(schemaId);
    }
    
    await this.validator.precompileAll();
    this.logger.info('Hot reload completed');
  }

  /**
   * Extract version from schema
   */
  private extractVersion(schema: any): string {
    // Try to extract version from different locations
    if (schema.version) return schema.version;
    if (schema.$id && schema.$id.includes('/v')) {
      const match = schema.$id.match(/\/v(\d+\.\d+\.\d+)\//);
      if (match) return match[1];
    }
    return '1.0.0'; // Default version
  }

  /**
   * Extract schema references from $ref properties
   */
  private extractDependencies(schema: any): string[] {
    const dependencies: string[] = [];
    this.findReferencesRecursive(schema, dependencies);
    
    // Filter out self-references and internal references
    return dependencies
      .filter(dep => dep !== schema.$id && !dep.startsWith('#/'))
      .map(dep => this.extractSchemaIdFromRef(dep))
      .filter(Boolean) as string[];
  }

  /**
   * Recursively find $ref dependencies
   */
  private findReferencesRecursive(obj: any, dependencies: string[]): void {
    if (typeof obj !== 'object' || obj === null) return;

    for (const key in obj) {
      if (key === '$ref' && typeof obj[key] === 'string') {
        const dep = this.extractSchemaIdFromRef(obj[key]);
        if (dep) dependencies.push(dep);
      } else if (typeof obj[key] === 'object') {
        this.findReferencesRecursive(obj[key], dependencies);
      }
    }
  }

  /**
   * Extract schema ID from reference string
   */
  private extractSchemaIdFromRef(ref: string): string | null {
    // Handle relative references like "context-protocol.json"
    if (ref.endsWith('.json')) {
      return ref.replace('.json', '');
    }
    
    // Handle full URIs
    if (ref.includes('/')) {
      const parts = ref.split('/');
      const fileName = parts[parts.length - 1];
      return fileName.endsWith('.json') ? fileName.replace('.json', '') : fileName;
    }
    
    return ref;
  }

  /**
   * Check if dependencies are already loaded
   */
  private checkDependencies(dependencies: string[]): boolean {
    return dependencies.every(dep => this.schemas.has(dep));
  }

  /**
   * Get module name from schema ID
   */
  private getModuleName(schemaId: string): string {
    return schemaId.replace('-protocol', '');
  }

  /**
   * Register custom validation rules for MPLP
   */
  private registerCustomValidationRules(): void {
    // Context module custom rules
    this.validator.registerCustomRule({
      name: 'context_lifecycle_validation',
      description: 'Validate context lifecycle state transitions',
      rule: (data: any) => {
        if (data.lifecycle_stage && data.status) {
          const validTransitions: Record<string, string[]> = {
            'planning': ['active', 'suspended'],
            'executing': ['active', 'suspended', 'completed'],
            'monitoring': ['active', 'completed'],
            'completed': ['completed']
          };
          
          const allowedStatuses = validTransitions[data.lifecycle_stage];
          return allowedStatuses ? allowedStatuses.includes(data.status) : true;
        }
        return true;
      },
      type: 'sync',
      severity: 'error'
    });

    // Plan module custom rules
    this.validator.registerCustomRule({
      name: 'plan_dependency_validation',
      description: 'Validate plan task dependencies are acyclic',
      rule: (data: any) => {
        if (data.dependencies && data.tasks) {
          // Simplified cycle detection
          const taskIds = new Set(data.tasks.map((t: any) => t.task_id));
          for (const dep of data.dependencies) {
            if (!taskIds.has(dep.source_task_id) || !taskIds.has(dep.target_task_id)) {
              return 'Dependency references non-existent task';
            }
          }
        }
        return true;
      },
      type: 'sync',
      severity: 'error'
    });

    // Role module custom rules
    this.validator.registerCustomRule({
      name: 'role_permission_validation',
      description: 'Validate role permissions are consistent',
      rule: (data: any) => {
        if (data.permissions) {
          for (const permission of data.permissions) {
            if (permission.resource_type === 'system' && permission.actions.includes('admin')) {
              if (data.role_type !== 'system') {
                return 'Only system roles can have admin permissions on system resources';
              }
            }
          }
        }
        return true;
      },
      type: 'sync',
      severity: 'warning'
    });

    this.logger.info('Custom validation rules registered');
  }
}

export default MPLPSchemaManager; 