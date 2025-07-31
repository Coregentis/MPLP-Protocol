/**
 * MPLP 类型-Schema一致性验证工具 - 厂商中立设计
 * 
 * 用于验证TypeScript类型与JSON Schema定义的一致性，确保代码实现与Schema定义保持同步。
 * 遵循厂商中立原则，不依赖特定工具或平台。
 * 
 * @version v1.0.0
 * @created 2025-07-16T11:06:00+08:00
 * @updated 2025-08-14T17:30:00+08:00
 * @compliance .cursor/rules/development-standards.mdc - Schema驱动开发原则
 * @compliance .cursor/rules/development-standards.mdc - 厂商中立原则
 */

import fs from 'fs';
import path from 'path';
import ts from 'typescript';
import { Logger } from './logger';

/**
 * 类型-Schema验证结果接口
 */
export interface TypeSchemaValidationResult {
  /**
   * 是否验证通过
   */
  valid: boolean;
  
  /**
   * 不匹配项（如果验证失败）
   */
  mismatches?: TypeSchemaMismatch[];
  
  /**
   * 模块统计信息
   */
  moduleStats?: Record<string, TypeValidationStats>;
}

/**
 * 类型-Schema不匹配项接口
 */
export interface TypeSchemaMismatch {
  /**
   * 接口名称
   */
  interfaceName: string;
  
  /**
   * Schema路径
   */
  schemaPath: string;
  
  /**
   * 字段名称
   */
  fieldName?: string;
  
  /**
   * 期望类型/值
   */
  expected?: string;
  
  /**
   * 实际类型/值
   */
  actual?: string;
  
  /**
   * 不匹配类型
   */
  mismatchType: 'missing_field' | 'type_mismatch' | 'field_name_style' | 'enum_value_mismatch';
  
  /**
   * 严重程度
   */
  severity: 'error' | 'warning';
  
  /**
   * 说明
   */
  explanation: string;
}

/**
 * 类型验证统计信息接口
 */
export interface TypeValidationStats {
  /**
   * 类型总数
   */
  typesCount: number;
  
  /**
   * 接口总数
   */
  interfacesCount: number;
  
  /**
   * 枚举总数
   */
  enumsCount: number;
  
  /**
   * 匹配字段数
   */
  matchingFieldsCount: number;
  
  /**
   * 不匹配字段数
   */
  mismatchFieldsCount: number;
}

/**
 * 类型-Schema验证工具类
 */
export class TypeSchemaValidator {
  private typeChecker: ts.TypeChecker;
  private program: ts.Program;
  private logger: Logger;
  
  /**
   * 构造函数
   * 
   * @param projectPath 项目路径
   */
  constructor(private projectPath: string) {
    this.logger = new Logger('TypeSchemaValidator');
    
    // 创建TypeScript程序实例
    const configPath = ts.findConfigFile(
      projectPath,
      ts.sys.fileExists,
      'tsconfig.json'
    );
    
    if (!configPath) {
      throw new Error('无法找到tsconfig.json文件');
    }
    
    try {
      const { config } = ts.readConfigFile(configPath, ts.sys.readFile);
      const { options, fileNames } = ts.parseJsonConfigFileContent(
        config,
        ts.sys,
        path.dirname(configPath)
      );
      
      this.program = ts.createProgram(fileNames, options);
      this.typeChecker = this.program.getTypeChecker();
      
      this.logger.info('TypeScript程序实例已创建', {
        files_count: fileNames.length,
        config_path: configPath
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`创建TypeScript程序实例失败: ${errorMessage}`);
      throw new Error(`创建TypeScript程序实例失败: ${errorMessage}`);
    }
  }
  
  /**
   * 验证指定模块的类型定义与Schema的一致性
   * 
   * @param module 模块名称 (context, plan, confirm, trace, role, extension)
   * @returns 验证结果
   */
  public validateModuleTypes(module: string): TypeSchemaValidationResult {
    try {
      this.logger.info(`开始验证模块类型: ${module}`);
      
      // 读取Schema文件
      const schemaPath = path.join(this.projectPath, 'src', 'schemas', `${module}-protocol.json`);
      if (!fs.existsSync(schemaPath)) {
        this.logger.error(`Schema文件不存在: ${schemaPath}`);
        return {
          valid: false,
          mismatches: [{
            interfaceName: 'N/A',
            schemaPath,
            mismatchType: 'missing_field',
            severity: 'error',
            explanation: `Schema文件不存在: ${schemaPath}`
          }]
        };
      }
      
      const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));
      
      // 找到模块类型文件
      const typesPath = path.join(this.projectPath, 'src', 'modules', module, 'types.ts');
      if (!fs.existsSync(typesPath)) {
        this.logger.error(`类型文件不存在: ${typesPath}`);
        return {
          valid: false,
          mismatches: [{
            interfaceName: 'N/A',
            schemaPath: typesPath,
            mismatchType: 'missing_field',
            severity: 'error',
            explanation: `类型文件不存在: ${typesPath}`
          }]
        };
      }
      
      const sourceFile = this.program.getSourceFile(typesPath);
      if (!sourceFile) {
        this.logger.error(`无法解析类型文件: ${typesPath}`);
        return {
          valid: false,
          mismatches: [{
            interfaceName: 'N/A',
            schemaPath: typesPath,
            mismatchType: 'missing_field',
            severity: 'error',
            explanation: `无法解析类型文件: ${typesPath}`
          }]
        };
      }
      
      // 查找主协议接口
      const mainInterfaceName = this.capitalize(module) + 'Protocol';
      const mainInterface = this.findInterface(sourceFile, mainInterfaceName);
      if (!mainInterface) {
        this.logger.error(`找不到主协议接口: ${mainInterfaceName}`);
        return {
          valid: false,
          mismatches: [{
            interfaceName: mainInterfaceName,
            schemaPath: typesPath,
            mismatchType: 'missing_field',
            severity: 'error',
            explanation: `找不到主协议接口: ${mainInterfaceName}`
          }]
        };
      }
      
      // 验证接口与Schema的一致性
      const mismatches: TypeSchemaMismatch[] = [];
      
      // 统计信息
      const stats: TypeValidationStats = {
        typesCount: 0,
        interfacesCount: 0,
        enumsCount: 0,
        matchingFieldsCount: 0,
        mismatchFieldsCount: 0
      };
      
      // 递归处理所有声明
      this.processSourceFile(sourceFile, stats);
      
      // 验证主接口与Schema的字段一致性
      this.validateInterface(mainInterface, schema.properties, mismatches, stats);
      
      // 验证Schema中的枚举与类型文件中的枚举定义一致性
      this.validateEnums(sourceFile, schema, mismatches, stats);
      
      // 结果
      const moduleStats: Record<string, TypeValidationStats> = {
        [module]: stats
      };
      
      const valid = mismatches.length === 0;
      this.logger.info(`模块类型验证完成: ${module}`, {
        valid,
        mismatches_count: mismatches.length,
        stats
      });
      
      return {
        valid,
        mismatches: mismatches.length > 0 ? mismatches : undefined,
        moduleStats
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`验证模块类型失败: ${errorMessage}`);
      
      return {
        valid: false,
        mismatches: [{
          interfaceName: 'N/A',
          schemaPath: `${module}-protocol.json`,
          mismatchType: 'missing_field',
          severity: 'error',
          explanation: `验证过程中发生错误: ${errorMessage}`
        }]
      };
    }
  }
  
  /**
   * 验证所有模块的类型定义与Schema的一致性
   * 
   * @returns 所有模块的验证结果
   */
  public validateAllModules(): Record<string, TypeSchemaValidationResult> {
    const modules = ['context', 'plan', 'confirm', 'trace', 'role', 'extension'];
    const results: Record<string, TypeSchemaValidationResult> = {};
    
    this.logger.info('开始验证所有模块类型');
    
    try {
      for (const module of modules) {
        results[module] = this.validateModuleTypes(module);
      }
      
      // 汇总结果
      let totalMismatches = 0;
      let validModules = 0;
      
      for (const [module, result] of Object.entries(results)) {
        if (result.mismatches) {
          totalMismatches += result.mismatches.length;
        }
        if (result.valid) {
          validModules++;
        }
      }
      
      this.logger.info('所有模块类型验证完成', {
        total_modules: modules.length,
        valid_modules: validModules,
        total_mismatches: totalMismatches
      });
      
      return results;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`验证所有模块失败: ${errorMessage}`);
      
      return {
        'error': {
          valid: false,
          mismatches: [{
            interfaceName: 'N/A',
            schemaPath: 'all-modules',
            mismatchType: 'missing_field',
            severity: 'error',
            explanation: `验证过程中发生错误: ${errorMessage}`
          }]
        }
      };
    }
  }
  
  /**
   * 在源文件中查找指定名称的接口声明
   * 
   * @param sourceFile 源文件
   * @param interfaceName 接口名称
   * @returns 接口声明或undefined
   */
  private findInterface(sourceFile: ts.SourceFile, interfaceName: string): ts.InterfaceDeclaration | undefined {
    let result: ts.InterfaceDeclaration | undefined;
    
    function visit(node: ts.Node): void {
      if (ts.isInterfaceDeclaration(node) && node.name.text === interfaceName) {
        result = node;
        return;
      }
      
      ts.forEachChild(node, visit);
    }
    
    visit(sourceFile);
    return result;
  }
  
  /**
   * 验证接口与Schema的一致性
   * 
   * @param interfaceDecl 接口声明
   * @param schemaProps Schema属性
   * @param mismatches 不匹配项数组
   * @param stats 统计信息
   */
  private validateInterface(
    interfaceDecl: ts.InterfaceDeclaration,
    schemaProps: any,
    mismatches: TypeSchemaMismatch[],
    stats: TypeValidationStats
  ): void {
    if (!schemaProps) {
      mismatches.push({
        interfaceName: interfaceDecl.name.text,
        schemaPath: 'schema.properties',
        mismatchType: 'missing_field',
        severity: 'error',
        explanation: 'Schema中缺少properties定义'
      });
      return;
    }
    
    // 获取接口的所有成员
    const members = interfaceDecl.members;
    
    // 检查接口成员是否在Schema中定义
    for (const member of members) {
      if (ts.isPropertySignature(member) && member.name) {
        let fieldName: string;
        
        if (ts.isIdentifier(member.name)) {
          fieldName = member.name.text;
        } else if (ts.isStringLiteral(member.name)) {
          fieldName = member.name.text;
        } else {
          continue;
        }
        
        // 检查字段是否在Schema中定义
        if (!schemaProps[fieldName]) {
          mismatches.push({
            interfaceName: interfaceDecl.name.text,
            schemaPath: `schema.properties.${fieldName}`,
            fieldName,
            mismatchType: 'missing_field',
            severity: 'error',
            explanation: `接口中的字段在Schema中未定义: ${fieldName}`
          });
          stats.mismatchFieldsCount++;
        } else {
          // 检查类型是否匹配
          // 这里可以添加更详细的类型检查逻辑
          stats.matchingFieldsCount++;
        }
      }
    }
    
    // 检查Schema中的字段是否在接口中定义
    for (const propName of Object.keys(schemaProps)) {
      const hasMember = members.some(member => {
        if (ts.isPropertySignature(member) && member.name) {
          if (ts.isIdentifier(member.name)) {
            return member.name.text === propName;
          } else if (ts.isStringLiteral(member.name)) {
            return member.name.text === propName;
          }
        }
        return false;
      });
      
      if (!hasMember) {
        mismatches.push({
          interfaceName: interfaceDecl.name.text,
          schemaPath: `schema.properties.${propName}`,
          fieldName: propName,
          mismatchType: 'missing_field',
          severity: 'error',
          explanation: `Schema中的字段在接口中未定义: ${propName}`
        });
        stats.mismatchFieldsCount++;
      }
    }
  }
  
  /**
   * 验证枚举与Schema的一致性
   * 
   * @param sourceFile 源文件
   * @param schema Schema对象
   * @param mismatches 不匹配项数组
   * @param stats 统计信息
   */
  private validateEnums(
    sourceFile: ts.SourceFile,
    schema: any,
    mismatches: TypeSchemaMismatch[],
    stats: TypeValidationStats
  ): void {
    // 查找源文件中的所有枚举声明
    const enums = new Map<string, string[]>();
    
    const findEnums = (node: ts.Node) => {
      if (ts.isEnumDeclaration(node)) {
        const enumName = node.name.text;
        const enumValues: string[] = [];
        
        for (const member of node.members) {
          if (member.initializer && ts.isStringLiteral(member.initializer)) {
            enumValues.push(member.initializer.text);
          } else if (member.name && ts.isIdentifier(member.name)) {
            enumValues.push(member.name.text);
          }
        }
        
        enums.set(enumName, enumValues);
      }
      
      ts.forEachChild(node, findEnums);
    };
    
    findEnums(sourceFile);
    
    // 查找Schema中的所有枚举定义
    const schemaEnums = new Map<string, { path: string; values: string[] }>();
    
    const findSchemaEnums = (obj: any, path: string) => {
      if (!obj || typeof obj !== 'object') return;
      
      if (obj.enum && Array.isArray(obj.enum)) {
        const enumName = this.toTypeNameFromPath(path);
        schemaEnums.set(enumName, { path, values: obj.enum });
      }
      
      for (const key of Object.keys(obj)) {
        const newPath = path ? `${path}.${key}` : key;
        findSchemaEnums(obj[key], newPath);
      }
    };
    
    findSchemaEnums(schema, '');
    
    // 比较枚举值
    for (const [enumName, { path, values: schemaValues }] of schemaEnums.entries()) {
      // 尝试找到匹配的TypeScript枚举
      let found = false;
      
      for (const [tsEnumName, tsEnumValues] of enums.entries()) {
        // 检查名称相似性
        if (
          tsEnumName === enumName ||
          tsEnumName === `${enumName}Type` ||
          tsEnumName === `${enumName}Status` ||
          tsEnumName === `${this.toPascalCase(this.singular(enumName))}Type` ||
          tsEnumName === `${this.toPascalCase(this.singular(enumName))}Status`
        ) {
          found = true;
          
          // 比较枚举值
          const missingInTs = schemaValues.filter(v => !tsEnumValues.includes(v));
          const missingInSchema = tsEnumValues.filter(v => !schemaValues.includes(v));
          
          if (missingInTs.length > 0) {
            mismatches.push({
              interfaceName: tsEnumName,
              schemaPath: path,
              mismatchType: 'enum_value_mismatch',
              severity: 'error',
              expected: schemaValues.join(', '),
              actual: tsEnumValues.join(', '),
              explanation: `Schema枚举值在TypeScript枚举中缺失: ${missingInTs.join(', ')}`
            });
            stats.mismatchFieldsCount += missingInTs.length;
          }
          
          if (missingInSchema.length > 0) {
            mismatches.push({
              interfaceName: tsEnumName,
              schemaPath: path,
              mismatchType: 'enum_value_mismatch',
              severity: 'warning',
              expected: schemaValues.join(', '),
              actual: tsEnumValues.join(', '),
              explanation: `TypeScript枚举值在Schema中缺失: ${missingInSchema.join(', ')}`
            });
            // 这里不计入不匹配统计，因为是警告级别
          }
        }
      }
      
      if (!found) {
        mismatches.push({
          interfaceName: enumName,
          schemaPath: path,
          mismatchType: 'missing_field',
          severity: 'error',
          explanation: `Schema中定义的枚举在TypeScript中未找到: ${enumName}`
        });
        stats.mismatchFieldsCount++;
      }
    }
  }
  
  /**
   * 处理源文件，收集统计信息
   * 
   * @param sourceFile 源文件
   * @param stats 统计信息
   */
  private processSourceFile(sourceFile: ts.SourceFile, stats: TypeValidationStats): void {
    function visit(node: ts.Node) {
      if (ts.isInterfaceDeclaration(node)) {
        stats.interfacesCount++;
        stats.typesCount++;
      } else if (ts.isTypeAliasDeclaration(node)) {
        stats.typesCount++;
      } else if (ts.isEnumDeclaration(node)) {
        stats.enumsCount++;
        stats.typesCount++;
      }
      
      ts.forEachChild(node, visit);
    }
    
    visit(sourceFile);
  }
  
  /**
   * 首字母大写
   * 
   * @param str 输入字符串
   * @returns 首字母大写的字符串
   */
  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  
  /**
   * 转换为PascalCase
   * 
   * @param str 输入字符串
   * @returns PascalCase格式的字符串
   */
  private toPascalCase(str: string): string {
    return str
      .split(/[_\-\.]/)
      .map(part => this.capitalize(part))
      .join('');
  }
  
  /**
   * 从路径生成类型名称
   * 
   * @param path 路径
   * @returns 类型名称
   */
  private toTypeNameFromPath(path: string): string {
    const parts = path.split('.');
    const lastPart = parts[parts.length - 1];
    return this.toPascalCase(lastPart);
  }
  
  /**
   * 转换为单数形式
   * 
   * @param str 输入字符串
   * @returns 单数形式
   */
  private singular(str: string): string {
    if (str.endsWith('ies')) {
      return str.slice(0, -3) + 'y';
    } else if (str.endsWith('s')) {
      return str.slice(0, -1);
    }
    return str;
  }
  
  /**
   * 生成验证报告
   * 
   * @returns 验证报告
   */
  public generateValidationReport(): {
    totalModules: number;
    validModules: number;
    invalidModules: number;
    totalMismatches: number;
    results: Record<string, TypeSchemaValidationResult>;
    summary: string;
  } {
    const results = this.validateAllModules();
    const moduleNames = Object.keys(results).filter(name => name !== 'error');
    
    let validModules = 0;
    let invalidModules = 0;
    let totalMismatches = 0;
    
    for (const result of Object.values(results)) {
      if (result.valid) {
        validModules++;
      } else {
        invalidModules++;
      }
      
      if (result.mismatches) {
        totalMismatches += result.mismatches.length;
      }
    }
    
    // 生成摘要
    const summary = `类型-Schema验证完成: 共${moduleNames.length}个模块, ${validModules}个有效, ${invalidModules}个无效, 共${totalMismatches}个不匹配项`;
    
    this.logger.info(summary);
    
    return {
      totalModules: moduleNames.length,
      validModules,
      invalidModules,
      totalMismatches,
      results,
      summary
    };
  }
} 