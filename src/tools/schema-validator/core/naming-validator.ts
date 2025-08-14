/**
 * MPLP Schema Naming Convention Validator
 * 
 * @description 双重命名约定验证器实现
 * @version 1.1.0
 * @created 2025-08-14
 * @updated 基于MPLP v1.0双重命名约定成功实践
 */

import * as fs from 'fs/promises';
import { 
  NamingConventionValidationResult,
  NamingViolation,
  NamingConventionSummary
} from '../types';

export class NamingConventionValidator {
  
  /**
   * 验证Schema的命名约定合规性
   */
  async validateNamingConvention(schemaPath: string): Promise<NamingConventionValidationResult> {
    try {
      const schemaContent = await fs.readFile(schemaPath, 'utf-8');
      const schema = JSON.parse(schemaContent);
      
      const violations: NamingViolation[] = [];
      
      // 验证Schema层命名约定（应该使用snake_case）
      this.validateSchemaLayerNaming(schema, '', violations);
      
      const summary = this.generateNamingSummary(schema, violations);
      
      return {
        isCompliant: violations.length === 0,
        violations,
        summary
      };

    } catch (error) {
      throw new Error(`Failed to validate naming convention: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 验证Schema层命名约定
   */
  private validateSchemaLayerNaming(obj: any, currentPath: string, violations: NamingViolation[]): void {
    if (!obj || typeof obj !== 'object') {
      return;
    }

    // 检查properties中的字段命名
    if (obj.properties) {
      for (const [fieldName, fieldDef] of Object.entries(obj.properties)) {
        const fieldPath = currentPath ? `${currentPath}.properties.${fieldName}` : `properties.${fieldName}`;
        
        // 验证字段名是否符合snake_case
        if (!this.isSnakeCase(fieldName)) {
          violations.push({
            fieldPath,
            fieldName,
            violationType: this.detectViolationType(fieldName),
            expectedNaming: this.toSnakeCase(fieldName),
            actualNaming: fieldName,
            layer: 'schema',
            severity: 'error',
            suggestion: `Change '${fieldName}' to '${this.toSnakeCase(fieldName)}' to follow snake_case convention`
          });
        }

        // 递归检查嵌套对象
        if (typeof fieldDef === 'object') {
          this.validateSchemaLayerNaming(fieldDef, fieldPath, violations);
        }
      }
    }

    // 检查enum值的命名
    if (obj.enum && Array.isArray(obj.enum)) {
      obj.enum.forEach((enumValue: string, index: number) => {
        if (typeof enumValue === 'string' && !this.isSnakeCase(enumValue)) {
          const fieldPath = currentPath ? `${currentPath}.enum[${index}]` : `enum[${index}]`;
          violations.push({
            fieldPath,
            fieldName: enumValue,
            violationType: this.detectViolationType(enumValue),
            expectedNaming: this.toSnakeCase(enumValue),
            actualNaming: enumValue,
            layer: 'schema',
            severity: 'warning',
            suggestion: `Change enum value '${enumValue}' to '${this.toSnakeCase(enumValue)}'`
          });
        }
      });
    }

    // 检查$defs中的定义
    if (obj.$defs) {
      for (const [defName, defValue] of Object.entries(obj.$defs)) {
        const defPath = currentPath ? `${currentPath}.$defs.${defName}` : `$defs.${defName}`;
        
        // 验证定义名称（通常使用camelCase，但在Schema中应该考虑一致性）
        if (typeof defValue === 'object') {
          this.validateSchemaLayerNaming(defValue, defPath, violations);
        }
      }
    }

    // 递归检查其他对象属性
    for (const [key, value] of Object.entries(obj)) {
      if (key !== 'properties' && key !== '$defs' && key !== 'enum' && typeof value === 'object') {
        const newPath = currentPath ? `${currentPath}.${key}` : key;
        this.validateSchemaLayerNaming(value, newPath, violations);
      }
    }
  }

  /**
   * 检查字符串是否符合snake_case
   */
  private isSnakeCase(str: string): boolean {
    // snake_case规则：小写字母、数字、下划线，不能以下划线开头或结尾
    const snakeCaseRegex = /^[a-z][a-z0-9]*(_[a-z0-9]+)*$/;
    return snakeCaseRegex.test(str);
  }

  /**
   * 检查字符串是否符合camelCase
   */
  private isCamelCase(str: string): boolean {
    // camelCase规则：小写字母开头，后续可以有大写字母和数字
    const camelCaseRegex = /^[a-z][a-zA-Z0-9]*$/;
    return camelCaseRegex.test(str) && /[A-Z]/.test(str);
  }

  /**
   * 检测违规类型
   */
  private detectViolationType(str: string): 'wrong_case' | 'mixed_convention' | 'invalid_pattern' {
    if (this.isCamelCase(str)) {
      return 'wrong_case'; // 在Schema层使用了camelCase
    }
    
    if (str.includes('-') || str.includes(' ')) {
      return 'invalid_pattern'; // 使用了无效字符
    }
    
    if (/[A-Z]/.test(str) && str.includes('_')) {
      return 'mixed_convention'; // 混合了大小写和下划线
    }
    
    return 'wrong_case';
  }

  /**
   * 转换为snake_case
   */
  private toSnakeCase(str: string): string {
    return str
      // 处理camelCase转换
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      // 处理连续大写字母
      .replace(/([A-Z])([A-Z][a-z])/g, '$1_$2')
      // 替换空格和连字符为下划线
      .replace(/[\s-]+/g, '_')
      // 转为小写
      .toLowerCase()
      // 移除开头和结尾的下划线
      .replace(/^_+|_+$/g, '')
      // 合并多个连续下划线
      .replace(/_+/g, '_');
  }

  /**
   * 转换为camelCase
   */
  private toCamelCase(str: string): string {
    return str
      .toLowerCase()
      .replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
      .replace(/^[A-Z]/, letter => letter.toLowerCase());
  }

  /**
   * 生成命名约定摘要
   */
  private generateNamingSummary(schema: any, violations: NamingViolation[]): NamingConventionSummary {
    const totalFields = this.countTotalFields(schema);
    const violationCount = violations.length;
    const compliantFields = totalFields - violationCount;
    
    const schemaViolations = violations.filter(v => v.layer === 'schema').length;
    const typescriptViolations = violations.filter(v => v.layer === 'typescript').length;
    
    return {
      totalFields,
      compliantFields,
      violationCount,
      compliancePercentage: totalFields > 0 ? (compliantFields / totalFields) * 100 : 100,
      layerCompliance: {
        schema: totalFields > 0 ? ((totalFields - schemaViolations) / totalFields) * 100 : 100,
        typescript: totalFields > 0 ? ((totalFields - typescriptViolations) / totalFields) * 100 : 100
      }
    };
  }

  /**
   * 计算Schema中的总字段数
   */
  private countTotalFields(obj: any, visited = new Set()): number {
    if (!obj || typeof obj !== 'object' || visited.has(obj)) {
      return 0;
    }
    
    visited.add(obj);
    let count = 0;

    if (obj.properties) {
      count += Object.keys(obj.properties).length;
      
      for (const fieldDef of Object.values(obj.properties)) {
        if (typeof fieldDef === 'object') {
          count += this.countTotalFields(fieldDef, visited);
        }
      }
    }

    if (obj.enum && Array.isArray(obj.enum)) {
      count += obj.enum.length;
    }

    if (obj.$defs) {
      for (const defValue of Object.values(obj.$defs)) {
        if (typeof defValue === 'object') {
          count += this.countTotalFields(defValue, visited);
        }
      }
    }

    // 递归检查其他对象属性
    for (const [key, value] of Object.entries(obj)) {
      if (key !== 'properties' && key !== '$defs' && key !== 'enum' && typeof value === 'object') {
        count += this.countTotalFields(value, visited);
      }
    }

    return count;
  }

  /**
   * 验证字段映射一致性
   */
  validateFieldMapping(schemaField: string, typescriptField: string): {
    isValid: boolean;
    expectedMapping: string;
    suggestion: string;
  } {
    const expectedTypescriptField = this.toCamelCase(schemaField);
    const expectedSchemaField = this.toSnakeCase(typescriptField);
    
    const isValid = expectedTypescriptField === typescriptField;
    
    return {
      isValid,
      expectedMapping: expectedTypescriptField,
      suggestion: isValid 
        ? 'Mapping is correct'
        : `Schema field '${schemaField}' should map to TypeScript field '${expectedTypescriptField}'`
    };
  }

  /**
   * 生成字段映射建议
   */
  generateMappingSuggestions(schema: any): Array<{
    schemaField: string;
    suggestedTypescriptField: string;
    mappingFunction: string;
  }> {
    const suggestions: Array<{
      schemaField: string;
      suggestedTypescriptField: string;
      mappingFunction: string;
    }> = [];

    if (schema.properties) {
      for (const fieldName of Object.keys(schema.properties)) {
        const typescriptField = this.toCamelCase(fieldName);
        suggestions.push({
          schemaField: fieldName,
          suggestedTypescriptField: typescriptField,
          mappingFunction: `'${fieldName}' → '${typescriptField}'`
        });
      }
    }

    return suggestions;
  }
}
