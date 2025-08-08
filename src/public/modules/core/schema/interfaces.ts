/**
 * Schema相关接口定义
 * 
 * 定义Schema验证和管理相关的接口
 * 
 * @version 1.0.0
 * @created 2025-09-16
 */

export interface SchemaDefinition {
  $schema: string;
  type: string;
  properties?: Record<string, unknown>;
  required?: string[];
  additionalProperties?: boolean;
  definitions?: Record<string, unknown>;
}

export interface SchemaValidationError {
  path: string;
  message: string;
  value?: unknown;
  schema?: unknown;
}

export interface SchemaValidationResult {
  valid: boolean;
  errors: SchemaValidationError[];
  warnings?: string[];
  data?: unknown;
}

export interface ISchemaValidator {
  /**
   * 验证数据是否符合Schema
   */
  validate(schema: SchemaDefinition, data: unknown): SchemaValidationResult;
  
  /**
   * 编译Schema
   */
  compile(schema: SchemaDefinition): (data: unknown) => boolean;
  
  /**
   * 添加Schema定义
   */
  addSchema(id: string, schema: SchemaDefinition): void;
  
  /**
   * 获取Schema定义
   */
  getSchema(id: string): SchemaDefinition | undefined;
  
  /**
   * 移除Schema定义
   */
  removeSchema(id: string): boolean;
}

export interface ISchemaRegistry {
  /**
   * 注册Schema
   */
  register(name: string, schema: SchemaDefinition): void;
  
  /**
   * 获取Schema
   */
  get(name: string): SchemaDefinition | undefined;
  
  /**
   * 列出所有Schema名称
   */
  list(): string[];
  
  /**
   * 验证Schema是否存在
   */
  exists(name: string): boolean;
  
  /**
   * 清理所有Schema
   */
  clear(): void;
}

export interface SchemaMetadata {
  name: string;
  version: string;
  description?: string;
  author?: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
}

export interface SchemaInfo {
  metadata: SchemaMetadata;
  schema: SchemaDefinition;
  compiled?: boolean;
  usage_count?: number;
  last_used?: string;
}
