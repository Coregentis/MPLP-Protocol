/**
 * MPLP Schema验证器工厂
 *
 * 提供创建验证器和规则工厂的工厂方法。
 *
 * @version v1.0.0
 * @created 2025-07-19T18:30:00+08:00
 */

import { ISchemaRule, ISchemaRuleFactory, ISchemaValidator, ISchemaValidatorFactory, SchemaRuleType, SchemaValidatorConfig, SchemaViolationSeverity } from './interfaces';
import { SchemaValidator } from './schema-validator';
import { SchemaRuleFactory } from './rules/rule-factory';

/**
 * Schema验证器工厂类
 * 
 * 实现ISchemaValidatorFactory接口，提供创建验证器和规则工厂的工厂方法。
 */
export class SchemaValidatorFactory implements ISchemaValidatorFactory {
  /**
   * 创建Schema验证器
   * 
   * @param config 验证器配置
   * @returns Schema验证器
   */
  public createValidator(config?: SchemaValidatorConfig): ISchemaValidator {
    return new SchemaValidator(config);
  }

  /**
   * 创建规则工厂
   * 
   * @returns 规则工厂
   */
  public createRuleFactory(): ISchemaRuleFactory {
    return new SchemaRuleFactory();
  }

  /**
   * 创建默认验证器
   * 
   * @returns 默认验证器
   */
  public createDefaultValidator(): ISchemaValidator {
    // 创建验证器
    const validator = this.createValidator({
      minSeverity: SchemaViolationSeverity.WARNING,
      showProgress: true,
      verbose: false
    });
    
    // 创建规则工厂
    const ruleFactory = this.createRuleFactory();
    
    // 注册常用规则
    
    // 命名规则
    const namingRules = ruleFactory.createCommonNamingRules();
    namingRules.forEach((rule: ISchemaRule) => validator.registerRule(rule));
    
    // 厂商中立规则
    const vendorNeutralRules = ruleFactory.createCommonVendorNeutralRules();
    vendorNeutralRules.forEach((rule: ISchemaRule) => validator.registerRule(rule));
    
    // 接口规则
    validator.registerRule(
      ruleFactory.createInterfaceRule(
        'interface-adapter',
        'ITraceAdapter',
        '所有追踪适配器必须实现ITraceAdapter接口',
        SchemaViolationSeverity.ERROR
      )
    );
    
    // 依赖规则
    validator.registerRule(
      ruleFactory.createDependencyRule(
        'dependency-core',
        ['@/core', '@/utils', '@/types', '@/interfaces'],
        '核心模块只能依赖核心模块和工具模块',
        SchemaViolationSeverity.ERROR
      )
    );
    
    return validator;
  }

  /**
   * 创建厂商中立验证器
   * 
   * @returns 厂商中立验证器
   */
  public createVendorNeutralValidator(): ISchemaValidator {
    // 创建验证器
    const validator = this.createValidator({
      minSeverity: SchemaViolationSeverity.WARNING,
      includePatterns: ['src/modules/**/*.ts', 'src/interfaces/**/*.ts'],
      excludePatterns: ['**/node_modules/**', '**/dist/**', '**/mcp/**'],
      showProgress: true,
      verbose: true
    });
    
    // 创建规则工厂
    const ruleFactory = this.createRuleFactory();
    
    // 注册厂商中立规则
    const vendorNeutralRules = ruleFactory.createCommonVendorNeutralRules();
    vendorNeutralRules.forEach((rule: ISchemaRule) => validator.registerRule(rule));
    
    return validator;
  }

  /**
   * 创建命名约定验证器
   * 
   * @returns 命名约定验证器
   */
  public createNamingConventionValidator(): ISchemaValidator {
    // 创建验证器
    const validator = this.createValidator({
      minSeverity: SchemaViolationSeverity.WARNING,
      includePatterns: ['src/**/*.ts', 'src/**/*.js', 'src/**/*.json'],
      excludePatterns: ['**/node_modules/**', '**/dist/**'],
      showProgress: true,
      verbose: false
    });
    
    // 创建规则工厂
    const ruleFactory = this.createRuleFactory();
    
    // 注册命名规则
    const namingRules = ruleFactory.createCommonNamingRules();
    namingRules.forEach((rule: ISchemaRule) => validator.registerRule(rule));
    
    return validator;
  }
} 