/**
 * MPLP Schema Validator Main Entry Point
 *
 * @description 协议验证工具主入口
 * @version 1.1.0
 * @standardized MPLP协议验证工具标准化规范 v1.1.0
 * @updated 2025-08-14 - 添加企业级功能和命名约定验证支持
 */

// ===== 类型导出 =====
export * from './types';

// ===== 核心验证器导出 =====
export { MplpSyntaxValidator } from './core/syntax-validator';
export { MplpCompatibilityValidator } from './core/compatibility-validator';
export { MplpDataValidator } from './core/data-validator';
export { MplpReportGenerator } from './core/report-generator';

// ===== 企业级功能验证器导出 =====
export { EnterpriseFeatureValidator } from './core/enterprise-validator';
export { NamingConventionValidator } from './core/naming-validator';

// ===== 工厂导出 =====
export { 
  MplpSchemaValidatorFactory,
  getValidatorFactory,
  createSyntaxValidator,
  createCompatibilityValidator,
  createDataValidator,
  createReportGenerator
} from './core/validator-factory';

// ===== CLI导出 =====
export { ValidatorCli } from './cli/validator-cli';

// ===== 便捷函数 =====
import { getValidatorFactory } from './core/validator-factory';
import { ValidationResult, DataValidationRequest, DataValidationResult } from './types';

/**
 * 快速验证Schema语法
 */
export async function validateSchemaFile(schemaPath: string): Promise<ValidationResult> {
  const factory = getValidatorFactory();
  const validator = factory.createSyntaxValidator();
  return await validator.validateSchema(schemaPath);
}

/**
 * 快速验证所有Schema文件
 */
export async function validateAllSchemas(schemasPath?: string): Promise<ValidationResult[]> {
  const factory = getValidatorFactory(schemasPath);
  const validator = factory.createSyntaxValidator();
  return await validator.validateAllSchemas();
}

/**
 * 快速验证Schema兼容性
 */
export async function validateSchemaCompatibility(
  sourceSchema: string, 
  targetSchema: string,
  schemasPath?: string
): Promise<ValidationResult> {
  const factory = getValidatorFactory(schemasPath);
  const validator = factory.createCompatibilityValidator();
  return await validator.checkCompatibility(sourceSchema, targetSchema);
}

/**
 * 快速验证数据
 */
export async function validateData(
  schemaName: string, 
  data: unknown,
  schemasPath?: string
): Promise<DataValidationResult> {
  const factory = getValidatorFactory(schemasPath);
  const validator = factory.createDataValidator();
  
  const request: DataValidationRequest = {
    schemaName,
    data,
    validationOptions: {
      strictMode: true,
      allowAdditionalProperties: false,
      validateReferences: true,
      customValidators: {}
    }
  };
  
  return await validator.validateData(request);
}

/**
 * 生成验证报告
 */
export function generateValidationReport(
  results: ValidationResult[], 
  format: 'text' | 'json' | 'html' | 'junit' = 'text'
): string {
  const factory = getValidatorFactory();
  const reportGenerator = factory.createReportGenerator();
  
  switch (format) {
    case 'json':
      return reportGenerator.generateJsonReport(results);
    case 'html':
      return reportGenerator.generateHtmlReport(results);
    case 'junit':
      return reportGenerator.generateJunitReport(results);
    case 'text':
    default:
      return reportGenerator.generateTextReport(results);
  }
}

/**
 * 验证器版本信息
 */
export const VALIDATOR_VERSION = '1.0.0';

/**
 * 支持的Schema版本
 */
export const SUPPORTED_SCHEMA_VERSIONS = ['draft-07'];

/**
 * 默认配置
 */
export const DEFAULT_CONFIG = {
  schemasPath: 'src/schemas',
  strictMode: false,
  enableWarnings: true,
  outputFormat: 'text' as const,
  verboseOutput: false,
  failOnWarnings: false
};

/**
 * 验证器状态检查
 */
export async function checkValidatorHealth(): Promise<{
  status: 'healthy' | 'error';
  version: string;
  schemasFound: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let schemasFound = 0;
  
  try {
    const results = await validateAllSchemas();
    schemasFound = results.length;
    
    // 检查是否有严重错误
    const criticalErrors = results.filter(r => 
      r.errors.some(e => e.severity === 'critical')
    );
    
    if (criticalErrors.length > 0) {
      errors.push(`Found ${criticalErrors.length} schemas with critical errors`);
    }
    
  } catch (error) {
    errors.push(`Failed to validate schemas: ${(error as Error).message}`);
  }
  
  return {
    status: errors.length === 0 ? 'healthy' : 'error',
    version: VALIDATOR_VERSION,
    schemasFound,
    errors
  };
}
