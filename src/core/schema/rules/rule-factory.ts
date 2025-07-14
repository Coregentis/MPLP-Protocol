/**
 * MPLP Schema规则工厂
 *
 * 提供创建各种类型验证规则的工厂方法。
 *
 * @version v1.0.0
 * @created 2025-07-19T17:00:00+08:00
 */

import { ISchemaRule, ISchemaRuleFactory, SchemaRuleType, SchemaViolationSeverity } from '../interfaces';
import { NamingRule } from './naming-rule';
import { VendorNeutralRule } from './vendor-neutral-rule';

/**
 * Schema规则工厂类
 * 
 * 实现ISchemaRuleFactory接口，提供创建各种类型规则的工厂方法。
 */
export class SchemaRuleFactory implements ISchemaRuleFactory {
  /**
   * 创建命名规则
   * 
   * @param id 规则ID
   * @param pattern 命名模式
   * @param description 规则描述
   * @param severity 严重级别
   * @returns 命名规则
   */
  public createNamingRule(
    id: string,
    pattern: RegExp,
    description: string,
    severity: SchemaViolationSeverity
  ): ISchemaRule {
    return new NamingRule(id, pattern, description, severity);
  }

  /**
   * 创建接口实现规则
   * 
   * @param id 规则ID
   * @param interfaceName 接口名称
   * @param description 规则描述
   * @param severity 严重级别
   * @returns 接口实现规则
   */
  public createInterfaceRule(
    id: string,
    interfaceName: string,
    description: string,
    severity: SchemaViolationSeverity
  ): ISchemaRule {
    // 暂时使用命名规则作为占位符，后续实现专门的接口规则
    return new NamingRule(
      id,
      new RegExp(`^${interfaceName}(Impl|Implementation)?$`),
      description,
      severity
    );
  }

  /**
   * 创建文件组织规则
   * 
   * @param id 规则ID
   * @param pattern 文件组织模式
   * @param description 规则描述
   * @param severity 严重级别
   * @returns 文件组织规则
   */
  public createStructureRule(
    id: string,
    pattern: RegExp,
    description: string,
    severity: SchemaViolationSeverity
  ): ISchemaRule {
    // 暂时使用命名规则作为占位符，后续实现专门的结构规则
    return new NamingRule(
      id,
      pattern,
      description,
      severity
    );
  }

  /**
   * 创建文档规则
   * 
   * @param id 规则ID
   * @param pattern 文档模式
   * @param description 规则描述
   * @param severity 严重级别
   * @returns 文档规则
   */
  public createDocumentationRule(
    id: string,
    pattern: RegExp,
    description: string,
    severity: SchemaViolationSeverity
  ): ISchemaRule {
    // 暂时使用命名规则作为占位符，后续实现专门的文档规则
    return new NamingRule(
      id,
      pattern,
      description,
      severity
    );
  }

  /**
   * 创建依赖规则
   * 
   * @param id 规则ID
   * @param allowedDependencies 允许的依赖
   * @param description 规则描述
   * @param severity 严重级别
   * @returns 依赖规则
   */
  public createDependencyRule(
    id: string,
    allowedDependencies: string[],
    description: string,
    severity: SchemaViolationSeverity
  ): ISchemaRule {
    // 暂时使用命名规则作为占位符，后续实现专门的依赖规则
    const pattern = new RegExp(`^(${allowedDependencies.join('|')})$`);
    return new NamingRule(
      id,
      pattern,
      description,
      severity
    );
  }

  /**
   * 创建厂商中立规则
   * 
   * @param id 规则ID
   * @param vendorPatterns 厂商特定模式
   * @param description 规则描述
   * @param severity 严重级别
   * @returns 厂商中立规则
   */
  public createVendorNeutralRule(
    id: string,
    vendorPatterns: RegExp[],
    description: string,
    severity: SchemaViolationSeverity
  ): ISchemaRule {
    // 常见厂商名称
    const vendorNames = [
      'TracePilot',
      'Coregentis',
      'AWS',
      'Azure',
      'Google',
      'Microsoft',
      'IBM',
      'Oracle'
    ];
    
    return new VendorNeutralRule(
      id,
      vendorPatterns,
      vendorNames,
      description,
      severity
    );
  }

  /**
   * 创建常用的命名规则集合
   * 
   * @returns 命名规则集合
   */
  public createCommonNamingRules(): ISchemaRule[] {
    return [
      // 类名使用PascalCase
      this.createNamingRule(
        'naming-class-pascal-case',
        /^[A-Z][a-zA-Z0-9]*$/,
        '类名必须使用PascalCase命名法',
        SchemaViolationSeverity.ERROR
      ),
      
      // 接口名使用I前缀+PascalCase
      this.createNamingRule(
        'naming-interface-i-prefix',
        /^I[A-Z][a-zA-Z0-9]*$/,
        '接口名必须使用I前缀+PascalCase命名法',
        SchemaViolationSeverity.ERROR
      ),
      
      // 方法名使用camelCase
      this.createNamingRule(
        'naming-method-camel-case',
        /^[a-z][a-zA-Z0-9]*$/,
        '方法名必须使用camelCase命名法',
        SchemaViolationSeverity.ERROR
      ),
      
      // 变量名使用camelCase
      this.createNamingRule(
        'naming-variable-camel-case',
        /^[a-z][a-zA-Z0-9]*$/,
        '变量名必须使用camelCase命名法',
        SchemaViolationSeverity.ERROR
      ),
      
      // JSON属性使用snake_case
      this.createNamingRule(
        'naming-json-snake-case',
        /^[a-z][a-z0-9_]*$/,
        'JSON属性必须使用snake_case命名法',
        SchemaViolationSeverity.ERROR
      )
    ];
  }

  /**
   * 创建常用的厂商中立规则集合
   * 
   * @returns 厂商中立规则集合
   */
  public createCommonVendorNeutralRules(): ISchemaRule[] {
    return [
      // 检查厂商特定类名
      this.createVendorNeutralRule(
        'vendor-neutral-class-name',
        [
          /TracePilot/i,
          /Coregentis/i,
          /AWS/i,
          /Azure/i,
          /Google/i,
          /Microsoft/i,
          /IBM/i,
          /Oracle/i
        ],
        '类名不应包含厂商特定名称',
        SchemaViolationSeverity.ERROR
      ),
      
      // 检查厂商特定导入
      this.createVendorNeutralRule(
        'vendor-neutral-import',
        [
          /tracepilot/i,
          /coregentis/i,
          /aws-sdk/i,
          /azure/i,
          /google-cloud/i,
          /microsoft/i,
          /ibm/i,
          /oracle/i
        ],
        '导入路径不应直接依赖厂商特定包',
        SchemaViolationSeverity.ERROR
      ),
      
      // 检查厂商特定文件路径
      this.createVendorNeutralRule(
        'vendor-neutral-file-path',
        [
          /tracepilot/i,
          /coregentis/i,
          /aws/i,
          /azure/i,
          /google/i,
          /microsoft/i,
          /ibm/i,
          /oracle/i
        ],
        '文件路径不应包含厂商特定名称',
        SchemaViolationSeverity.ERROR
      )
    ];
  }
} 