/**
 * AJV Schema验证配置
 * @description 配置AJV JSON Schema验证器，提供统一的验证规则和格式
 * @author MPLP Team
 * @version 1.0.1
 */

import Ajv, { JSONSchemaType, ValidateFunction, ErrorObject } from 'ajv';
import addFormats from 'ajv-formats';
import { Logger } from '../../utils/logger';

export interface AjvConfig {
  strict: boolean;
  allErrors: boolean;
  verbose: boolean;
  validateFormats: boolean;
  removeAdditional: boolean | 'all' | 'failing';
  useDefaults: boolean;
  coerceTypes: boolean | 'array';
  allowUnionTypes: boolean;
  validateSchema: boolean;
  addUsedSchema: boolean;
  inlineRefs: boolean | number;
  passContext: boolean;
  loopRequired: number;
  ownProperties: boolean;
  multipleOfPrecision: number;
  discriminator: boolean;
  unicodeRegExp: boolean;
  int32range: boolean;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  data?: any;
}

export interface ValidationError {
  instancePath: string;
  schemaPath: string;
  keyword: string;
  params: Record<string, any>;
  message?: string;
  data?: any;
  schema?: any;
}

/**
 * 创建配置好的AJV实例
 */
export function createAjv(config: Partial<AjvConfig> = {}): Ajv {
  const defaultConfig: AjvConfig = {
    strict: true,
    allErrors: true,
    verbose: false,
    validateFormats: true,
    removeAdditional: false,
    useDefaults: true,
    coerceTypes: false,
    allowUnionTypes: true,
    validateSchema: true,
    addUsedSchema: true,
    inlineRefs: true,
    passContext: false,
    loopRequired: 20,
    ownProperties: false,
    multipleOfPrecision: 2,
    discriminator: true,
    unicodeRegExp: false,
    int32range: true
  };

  const finalConfig = { ...defaultConfig, ...config };
  const ajv = new Ajv(finalConfig);

  // 添加格式验证
  addFormats(ajv);

  // 添加自定义格式
  addCustomFormats(ajv);

  // 添加自定义关键字
  addCustomKeywords(ajv);

  return ajv;
}

/**
 * 创建测试用的AJV实例
 */
export function createTestAjv(): Ajv {
  return createAjv({
    strict: false,
    allErrors: true,
    verbose: true,
    validateFormats: false,
    removeAdditional: false,
    useDefaults: true,
    coerceTypes: true
  });
}

/**
 * 创建生产用的AJV实例
 */
export function createProductionAjv(): Ajv {
  return createAjv({
    strict: true,
    allErrors: false,
    verbose: false,
    validateFormats: true,
    removeAdditional: 'failing',
    useDefaults: true,
    coerceTypes: false
  });
}

/**
 * 添加自定义格式
 */
function addCustomFormats(ajv: Ajv): void {
  // UUID格式
  ajv.addFormat('uuid', {
    type: 'string',
    validate: (data: string) => {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      return uuidRegex.test(data);
    }
  });

  // 时间戳格式
  ajv.addFormat('timestamp', {
    type: 'string',
    validate: (data: string) => {
      const timestamp = Date.parse(data);
      return !isNaN(timestamp);
    }
  });

  // 版本号格式
  ajv.addFormat('version', {
    type: 'string',
    validate: (data: string) => {
      const versionRegex = /^\d+\.\d+\.\d+(-[a-zA-Z0-9]+)?$/;
      return versionRegex.test(data);
    }
  });

  // 模块名格式
  ajv.addFormat('module-name', {
    type: 'string',
    validate: (data: string) => {
      const moduleNameRegex = /^[a-z][a-z0-9-]*[a-z0-9]$/;
      return moduleNameRegex.test(data);
    }
  });

  // 状态格式
  ajv.addFormat('status', {
    type: 'string',
    validate: (data: string) => {
      const validStatuses = ['active', 'inactive', 'pending', 'completed', 'failed', 'cancelled'];
      return validStatuses.includes(data);
    }
  });
}

/**
 * 添加自定义关键字
 */
function addCustomKeywords(ajv: Ajv): void {
  // 厂商中立关键字
  ajv.addKeyword({
    keyword: 'vendorNeutral',
    type: 'object',
    schemaType: 'boolean',
    compile: (schemaVal: boolean) => {
      return function validate(data: any) {
        if (!schemaVal) return true;
        
        // 检查是否包含厂商特定字段
        const vendorFields = ['aws', 'azure', 'gcp', 'vendor', 'provider'];
        const dataKeys = Object.keys(data).map(key => key.toLowerCase());
        
        for (const vendorField of vendorFields) {
          if (dataKeys.some(key => key.includes(vendorField))) {
            (validate as any).errors = [{
              instancePath: '',
              schemaPath: '#/vendorNeutral',
              keyword: 'vendorNeutral',
              params: { vendorField },
              message: `Object contains vendor-specific field: ${vendorField}`
            }];
            return false;
          }
        }
        
        return true;
      };
    }
  });

  // MPLP协议版本关键字
  ajv.addKeyword({
    keyword: 'mplpVersion',
    type: 'string',
    schemaType: 'string',
    compile: (_schemaVal: string) => {
      return function validate(data: string) {
        const supportedVersions = ['1.0.0', '1.0.1'];
        const isValid = supportedVersions.includes(data);
        
        if (!isValid) {
          (validate as any).errors = [{
            instancePath: '',
            schemaPath: '#/mplpVersion',
            keyword: 'mplpVersion',
            params: { supportedVersions },
            message: `Unsupported MPLP version: ${data}. Supported versions: ${supportedVersions.join(', ')}`
          }];
        }
        
        return isValid;
      };
    }
  });

  // 模块依赖关键字
  ajv.addKeyword({
    keyword: 'moduleDependency',
    type: 'array',
    schemaType: 'object',
    compile: (_schemaVal: any) => {
      return function validate(data: string[]) {
        const validModules = ['context', 'plan', 'confirm', 'trace', 'role', 'extension'];
        
        for (const module of data) {
          if (!validModules.includes(module)) {
            (validate as any).errors = [{
              instancePath: '',
              schemaPath: '#/moduleDependency',
              keyword: 'moduleDependency',
              params: { invalidModule: module, validModules },
              message: `Invalid module dependency: ${module}`
            }];
            return false;
          }
        }
        
        return true;
      };
    }
  });
}

/**
 * 验证数据
 */
export function validateData<T>(
  ajv: Ajv,
  schema: JSONSchemaType<T> | object,
  data: unknown
): ValidationResult {
  const logger = new Logger('AjvValidator');
  
  try {
    const validate = ajv.compile(schema);
    const valid = validate(data);
    
    const errors: ValidationError[] = (validate.errors || []).map(error => ({
      instancePath: error.instancePath,
      schemaPath: error.schemaPath,
      keyword: error.keyword,
      params: error.params || {},
      message: error.message,
      data: error.data,
      schema: error.schema
    }));

    if (!valid) {
      logger.debug('Validation failed', { errors });
    }

    return {
      valid,
      errors,
      data: valid ? data : undefined
    };
  } catch (error) {
    logger.error('Validation error', { error });
    return {
      valid: false,
      errors: [{
        instancePath: '',
        schemaPath: '',
        keyword: 'validation',
        params: {},
        message: error instanceof Error ? error.message : 'Unknown validation error'
      }]
    };
  }
}

/**
 * 创建验证函数
 */
export function createValidator<T>(
  ajv: Ajv,
  schema: JSONSchemaType<T> | object
): (data: unknown) => ValidationResult {
  const validate = ajv.compile(schema);
  
  return (data: unknown): ValidationResult => {
    const valid = validate(data);
    
    const errors: ValidationError[] = (validate.errors || []).map(error => ({
      instancePath: error.instancePath,
      schemaPath: error.schemaPath,
      keyword: error.keyword,
      params: error.params || {},
      message: error.message,
      data: error.data,
      schema: error.schema
    }));

    return {
      valid,
      errors,
      data: valid ? data : undefined
    };
  };
}

/**
 * 格式化验证错误
 */
export function formatValidationErrors(errors: ValidationError[]): string {
  return errors.map(error => {
    const path = error.instancePath || 'root';
    const message = error.message || 'Validation failed';
    return `${path}: ${message}`;
  }).join('; ');
}

/**
 * 检查Schema是否有效
 */
export function isValidSchema(ajv: Ajv, schema: object): boolean {
  try {
    ajv.compile(schema);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * 获取Schema信息
 */
export function getSchemaInfo(schema: object): {
  type?: string;
  properties?: string[];
  required?: string[];
  title?: string;
  description?: string;
} {
  const schemaObj = schema as any;
  
  return {
    type: schemaObj.type,
    properties: schemaObj.properties ? Object.keys(schemaObj.properties) : undefined,
    required: schemaObj.required,
    title: schemaObj.title,
    description: schemaObj.description
  };
}
