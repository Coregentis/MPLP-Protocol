/**
 * MPLP Schema Validator Factory
 * 
 * @description 验证器工厂实现
 * @version 1.0.0
 * @standardized MPLP协议验证工具标准化规范 v1.0.0
 */

import { 
  SchemaValidatorFactory,
  SyntaxValidator,
  CompatibilityValidator,
  DataValidator,
  ReportGenerator
} from '../types';
import { MplpSyntaxValidator } from './syntax-validator';
import { MplpCompatibilityValidator } from './compatibility-validator';
import { MplpDataValidator } from './data-validator';
import { MplpReportGenerator } from './report-generator';

/**
 * MPLP Schema验证器工厂实现
 */
export class MplpSchemaValidatorFactory implements SchemaValidatorFactory {
  private static instance: MplpSchemaValidatorFactory;
  private readonly schemasPath: string;
  
  // 缓存验证器实例
  private syntaxValidator: SyntaxValidator | null = null;
  private compatibilityValidator: CompatibilityValidator | null = null;
  private dataValidator: DataValidator | null = null;
  private reportGenerator: ReportGenerator | null = null;

  private constructor(schemasPath: string = 'src/schemas') {
    this.schemasPath = schemasPath;
  }

  /**
   * 获取工厂单例实例
   */
  static getInstance(schemasPath?: string): MplpSchemaValidatorFactory {
    if (!MplpSchemaValidatorFactory.instance) {
      MplpSchemaValidatorFactory.instance = new MplpSchemaValidatorFactory(schemasPath);
    }
    return MplpSchemaValidatorFactory.instance;
  }

  /**
   * 创建语法验证器
   */
  createSyntaxValidator(): SyntaxValidator {
    if (!this.syntaxValidator) {
      this.syntaxValidator = new MplpSyntaxValidator(this.schemasPath);
    }
    return this.syntaxValidator;
  }

  /**
   * 创建兼容性验证器
   */
  createCompatibilityValidator(): CompatibilityValidator {
    if (!this.compatibilityValidator) {
      this.compatibilityValidator = new MplpCompatibilityValidator(this.schemasPath);
    }
    return this.compatibilityValidator;
  }

  /**
   * 创建数据验证器
   */
  createDataValidator(): DataValidator {
    if (!this.dataValidator) {
      this.dataValidator = new MplpDataValidator(this.schemasPath);
    }
    return this.dataValidator;
  }

  /**
   * 创建报告生成器
   */
  createReportGenerator(): ReportGenerator {
    if (!this.reportGenerator) {
      this.reportGenerator = new MplpReportGenerator();
    }
    return this.reportGenerator;
  }

  /**
   * 重置工厂实例（主要用于测试）
   */
  static reset(): void {
    MplpSchemaValidatorFactory.instance = null as any;
  }

  /**
   * 获取Schema路径
   */
  getSchemasPath(): string {
    return this.schemasPath;
  }

  /**
   * 清理缓存的验证器实例
   */
  clearCache(): void {
    this.syntaxValidator = null;
    this.compatibilityValidator = null;
    this.dataValidator = null;
    this.reportGenerator = null;
  }
}

/**
 * 便捷函数：获取默认工厂实例
 */
export function getValidatorFactory(schemasPath?: string): MplpSchemaValidatorFactory {
  return MplpSchemaValidatorFactory.getInstance(schemasPath);
}

/**
 * 便捷函数：创建语法验证器
 */
export function createSyntaxValidator(schemasPath?: string): SyntaxValidator {
  return getValidatorFactory(schemasPath).createSyntaxValidator();
}

/**
 * 便捷函数：创建兼容性验证器
 */
export function createCompatibilityValidator(schemasPath?: string): CompatibilityValidator {
  return getValidatorFactory(schemasPath).createCompatibilityValidator();
}

/**
 * 便捷函数：创建数据验证器
 */
export function createDataValidator(schemasPath?: string): DataValidator {
  return getValidatorFactory(schemasPath).createDataValidator();
}

/**
 * 便捷函数：创建报告生成器
 */
export function createReportGenerator(): ReportGenerator {
  return getValidatorFactory().createReportGenerator();
}
