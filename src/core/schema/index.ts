/**
 * MPLP Schema验证器模块
 *
 * 提供验证代码是否符合架构设计规范的工具。
 *
 * @version v1.0.0
 * @created 2025-07-20T12:30:00+08:00
 */

// 导出接口
export {
  ISchemaRule,
  ISchemaRuleFactory,
  ISchemaValidator,
  ISchemaValidationReport,
  ISchemaValidatorFactory,
  SchemaRuleType,
  SchemaViolation,
  SchemaViolationLocation,
  SchemaViolationSeverity,
  SchemaValidatorConfig
} from './interfaces';

// 导出验证器
export { SchemaValidator } from './schema-validator';

// 导出报告
export { SchemaValidationReport } from './validation-report';

// 导出工厂
export { SchemaValidatorFactory } from './validator-factory';

// 导出规则
export { BaseRule } from './rules/base-rule';
export { NamingRule } from './rules/naming-rule';
export { VendorNeutralRule } from './rules/vendor-neutral-rule';
export { SchemaRuleFactory } from './rules/rule-factory';

// 导入工厂类用于创建验证器
import { SchemaValidatorFactory } from './validator-factory';

/**
 * 创建默认验证器
 * 
 * 快捷方法，创建一个默认配置的Schema验证器。
 * 
 * @returns 默认验证器
 */
export function createDefaultValidator() {
  const factory = new SchemaValidatorFactory();
  return factory.createDefaultValidator();
}

/**
 * 创建厂商中立验证器
 * 
 * 快捷方法，创建一个专注于验证厂商中立性的验证器。
 * 
 * @returns 厂商中立验证器
 */
export function createVendorNeutralValidator() {
  const factory = new SchemaValidatorFactory();
  return factory.createVendorNeutralValidator();
}

/**
 * 创建命名约定验证器
 * 
 * 快捷方法，创建一个专注于验证命名约定的验证器。
 * 
 * @returns 命名约定验证器
 */
export function createNamingConventionValidator() {
  const factory = new SchemaValidatorFactory();
  return factory.createNamingConventionValidator();
} 