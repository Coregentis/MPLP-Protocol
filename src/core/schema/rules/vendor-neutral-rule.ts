/**
 * MPLP Schema厂商中立规则验证
 *
 * 验证代码是否遵循厂商中立原则，避免直接依赖特定厂商实现。
 *
 * @version v1.0.0
 * @created 2025-07-19T16:30:00+08:00
 */

import { BaseRule } from './base-rule';
import { SchemaRuleType, SchemaViolation, SchemaViolationSeverity } from '../interfaces';
import * as ts from 'typescript';
import { readFileSync } from 'fs';
import { extname } from 'path';

/**
 * 厂商中立规则类
 * 
 * 验证代码是否遵循厂商中立原则，检测直接依赖特定厂商的实现。
 */
export class VendorNeutralRule extends BaseRule {
  /**
   * 厂商特定模式列表
   */
  private vendorPatterns: RegExp[];

  /**
   * 厂商名称列表
   */
  private vendorNames: string[];

  /**
   * 创建厂商中立规则
   * 
   * @param id 规则ID
   * @param vendorPatterns 厂商特定模式列表
   * @param vendorNames 厂商名称列表
   * @param description 规则描述
   * @param severity 规则严重级别
   */
  constructor(
    id: string,
    vendorPatterns: RegExp[],
    vendorNames: string[],
    description: string,
    severity: SchemaViolationSeverity
  ) {
    super(id, SchemaRuleType.VENDOR_NEUTRAL, description, severity);
    this.vendorPatterns = vendorPatterns;
    this.vendorNames = vendorNames;
  }

  /**
   * 验证文件内容是否符合厂商中立原则
   * 
   * @param filePath 文件路径
   * @param content 文件内容
   * @returns 验证问题列表
   */
  protected async validateContent(filePath: string, content: string): Promise<SchemaViolation[]> {
    // 对于JSON文件，使用特殊的验证逻辑
    if (filePath.endsWith('.json')) {
      return this.validateJsonContent(filePath, content);
    }

    // 对于TypeScript/JavaScript文件，使用AST分析
    const sourceFile = ts.createSourceFile(
      filePath,
      content,
      ts.ScriptTarget.Latest,
      true
    );

    const violations: SchemaViolation[] = [];

    // 检查文件路径是否符合厂商中立原则
    const filePathViolations = this.checkFilePath(filePath);
    violations.push(...filePathViolations);

    // 遍历AST查找厂商特定代码
    const visit = (node: ts.Node) => {
      // 检查导入语句
      if (ts.isImportDeclaration(node)) {
        const importPath = this.getImportPath(node);
        if (importPath) {
          const vendorMatch = this.findVendorMatch(importPath);
          if (vendorMatch) {
            const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
            const endLine = sourceFile.getLineAndCharacterOfPosition(node.getEnd()).line;
            
            // 提取代码片段
            const snippet = this.extractCodeSnippet(content, line + 1, endLine + 1);
            
            // 创建验证问题
            violations.push(this.createViolation(
              filePath,
              `导入路径 "${importPath}" 包含厂商特定引用: ${vendorMatch}`,
              line + 1,
              endLine + 1,
              character + 1,
              sourceFile.getLineAndCharacterOfPosition(node.getEnd()).character + 1,
              snippet,
              `请使用厂商中立的接口而不是直接依赖 ${vendorMatch}`
            ));
          }
        }
      }
      
      // 检查类声明
      if (ts.isClassDeclaration(node) && node.name) {
        const className = node.name.text;
        const vendorMatch = this.findVendorMatch(className);
        if (vendorMatch) {
          const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.name.getStart());
          const endLine = sourceFile.getLineAndCharacterOfPosition(node.name.getEnd()).line;
          
          // 提取代码片段
          const snippet = this.extractCodeSnippet(content, line + 1, endLine + 1);
          
          // 创建验证问题
          violations.push(this.createViolation(
            filePath,
            `类名 "${className}" 包含厂商特定名称: ${vendorMatch}`,
            line + 1,
            endLine + 1,
            character + 1,
            sourceFile.getLineAndCharacterOfPosition(node.name.getEnd()).character + 1,
            snippet,
            `请使用厂商中立的命名，如 "${this.suggestNeutralName(className, vendorMatch)}"`
          ));
        }
        
        // 检查类是否直接实例化厂商特定类
        this.checkClassImplementation(node, sourceFile, content, violations);
      }
      
      // 检查接口声明
      if (ts.isInterfaceDeclaration(node) && node.name) {
        const interfaceName = node.name.text;
        const vendorMatch = this.findVendorMatch(interfaceName);
        if (vendorMatch) {
          const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.name.getStart());
          const endLine = sourceFile.getLineAndCharacterOfPosition(node.name.getEnd()).line;
          
          // 提取代码片段
          const snippet = this.extractCodeSnippet(content, line + 1, endLine + 1);
          
          // 创建验证问题
          violations.push(this.createViolation(
            filePath,
            `接口名 "${interfaceName}" 包含厂商特定名称: ${vendorMatch}`,
            line + 1,
            endLine + 1,
            character + 1,
            sourceFile.getLineAndCharacterOfPosition(node.name.getEnd()).character + 1,
            snippet,
            `请使用厂商中立的命名，如 "I${this.suggestNeutralName(interfaceName, vendorMatch)}"`
          ));
        }
      }
      
      // 检查变量声明
      if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name)) {
        const variableName = node.name.text;
        const vendorMatch = this.findVendorMatch(variableName);
        if (vendorMatch) {
          const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.name.getStart());
          const endLine = sourceFile.getLineAndCharacterOfPosition(node.name.getEnd()).line;
          
          // 提取代码片段
          const snippet = this.extractCodeSnippet(content, line + 1, endLine + 1);
          
          // 创建验证问题
          violations.push(this.createViolation(
            filePath,
            `变量名 "${variableName}" 包含厂商特定名称: ${vendorMatch}`,
            line + 1,
            endLine + 1,
            character + 1,
            sourceFile.getLineAndCharacterOfPosition(node.name.getEnd()).character + 1,
            snippet,
            `请使用厂商中立的命名，如 "${this.suggestNeutralName(variableName, vendorMatch)}"`
          ));
        }
      }

      // 递归遍历子节点
      ts.forEachChild(node, visit);
    };

    // 开始遍历
    visit(sourceFile);

    return violations;
  }

  /**
   * 检查类实现是否直接依赖厂商特定类
   * 
   * @param node 类声明节点
   * @param sourceFile 源文件
   * @param content 文件内容
   * @param violations 验证问题列表
   */
  private checkClassImplementation(
    node: ts.ClassDeclaration,
    sourceFile: ts.SourceFile,
    content: string,
    violations: SchemaViolation[]
  ): void {
    // 遍历类的成员
    if (node.members) {
      node.members.forEach(member => {
        // 检查方法中的厂商特定实例化
        if (ts.isMethodDeclaration(member) && member.body) {
          this.checkNodeForVendorInstantiation(member.body, sourceFile, content, violations);
        }
        
        // 检查属性声明
        if (ts.isPropertyDeclaration(member) && ts.isIdentifier(member.name)) {
          const propertyName = member.name.text;
          const vendorMatch = this.findVendorMatch(propertyName);
          if (vendorMatch) {
            const { line, character } = sourceFile.getLineAndCharacterOfPosition(member.name.getStart());
            const endLine = sourceFile.getLineAndCharacterOfPosition(member.name.getEnd()).line;
            
            // 提取代码片段
            const snippet = this.extractCodeSnippet(content, line + 1, endLine + 1);
            
            // 创建验证问题
            violations.push(this.createViolation(
              sourceFile.fileName,
              `属性名 "${propertyName}" 包含厂商特定名称: ${vendorMatch}`,
              line + 1,
              endLine + 1,
              character + 1,
              sourceFile.getLineAndCharacterOfPosition(member.name.getEnd()).character + 1,
              snippet,
              `请使用厂商中立的命名，如 "${this.suggestNeutralName(propertyName, vendorMatch)}"`
            ));
          }
          
          // 检查属性类型
          if (member.type && ts.isTypeReferenceNode(member.type) && ts.isIdentifier(member.type.typeName)) {
            const typeName = member.type.typeName.text;
            const vendorMatch = this.findVendorMatch(typeName);
            if (vendorMatch) {
              const { line, character } = sourceFile.getLineAndCharacterOfPosition(member.type.getStart());
              const endLine = sourceFile.getLineAndCharacterOfPosition(member.type.getEnd()).line;
              
              // 提取代码片段
              const snippet = this.extractCodeSnippet(content, line + 1, endLine + 1);
              
              // 创建验证问题
              violations.push(this.createViolation(
                sourceFile.fileName,
                `属性类型 "${typeName}" 包含厂商特定名称: ${vendorMatch}`,
                line + 1,
                endLine + 1,
                character + 1,
                sourceFile.getLineAndCharacterOfPosition(member.type.getEnd()).character + 1,
                snippet,
                `请使用厂商中立的接口类型，如 "I${this.suggestNeutralName(typeName, vendorMatch)}"`
              ));
            }
          }
        }
      });
    }
  }

  /**
   * 检查节点中的厂商特定实例化
   * 
   * @param node 节点
   * @param sourceFile 源文件
   * @param content 文件内容
   * @param violations 验证问题列表
   */
  private checkNodeForVendorInstantiation(
    node: ts.Node,
    sourceFile: ts.SourceFile,
    content: string,
    violations: SchemaViolation[]
  ): void {
    // 检查 new 表达式
    if (ts.isNewExpression(node) && ts.isIdentifier(node.expression)) {
      const className = node.expression.text;
      const vendorMatch = this.findVendorMatch(className);
      if (vendorMatch) {
        const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
        const endLine = sourceFile.getLineAndCharacterOfPosition(node.getEnd()).line;
        
        // 提取代码片段
        const snippet = this.extractCodeSnippet(content, line + 1, endLine + 1);
        
        // 创建验证问题
        violations.push(this.createViolation(
          sourceFile.fileName,
          `直接实例化厂商特定类 "${className}": ${vendorMatch}`,
          line + 1,
          endLine + 1,
          character + 1,
          sourceFile.getLineAndCharacterOfPosition(node.getEnd()).character + 1,
          snippet,
          `请使用依赖注入或工厂模式获取厂商中立的接口实现`
        ));
      }
    }
    
    // 递归检查子节点
    ts.forEachChild(node, child => {
      this.checkNodeForVendorInstantiation(child, sourceFile, content, violations);
    });
  }

  /**
   * 验证JSON文件内容是否符合厂商中立原则
   * 
   * @param filePath JSON文件路径
   * @param content JSON文件内容
   * @returns 验证问题列表
   */
  private validateJsonContent(filePath: string, content: string): SchemaViolation[] {
    const violations: SchemaViolation[] = [];
    
    try {
      // 解析JSON
      const json = JSON.parse(content);
      
      // 递归检查所有属性名和值
      const checkObject = (obj: any, path: string[] = []) => {
        if (typeof obj !== 'object' || obj === null) {
          return;
        }
        
        // 检查对象的所有键和值
        Object.entries(obj).forEach(([key, value]) => {
          const currentPath = [...path, key];
          
          // 检查键名是否包含厂商特定名称
          const keyVendorMatch = this.findVendorMatch(key);
          if (keyVendorMatch) {
            // 查找键在文件中的位置
            const lines = content.split('\n');
            let lineNumber = 1;
            let charPosition = 0;
            
            for (let i = 0; i < lines.length; i++) {
              if (lines[i].includes(`"${key}"`)) {
                lineNumber = i + 1;
                charPosition = lines[i].indexOf(`"${key}"`) + 1;
                break;
              }
            }
            
            // 提取代码片段
            const startLine = Math.max(1, lineNumber - 1);
            const endLine = Math.min(lines.length, lineNumber + 1);
            const snippet = lines.slice(startLine - 1, endLine).join('\n');
            
            // 创建验证问题
            violations.push(this.createViolation(
              filePath,
              `JSON属性 "${currentPath.join('.')}" 包含厂商特定名称: ${keyVendorMatch}`,
              lineNumber,
              lineNumber,
              charPosition,
              charPosition + key.length + 2,
              snippet,
              `请使用厂商中立的命名，如 "${this.suggestNeutralName(key, keyVendorMatch)}"`
            ));
          }
          
          // 检查字符串值是否包含厂商特定名称
          if (typeof value === 'string') {
            const valueVendorMatch = this.findVendorMatch(value);
            if (valueVendorMatch) {
              // 查找值在文件中的位置
              const lines = content.split('\n');
              let lineNumber = 1;
              let charPosition = 0;
              
              for (let i = 0; i < lines.length; i++) {
                if (lines[i].includes(`"${value}"`)) {
                  lineNumber = i + 1;
                  charPosition = lines[i].indexOf(`"${value}"`) + 1;
                  break;
                }
              }
              
              // 提取代码片段
              const startLine = Math.max(1, lineNumber - 1);
              const endLine = Math.min(lines.length, lineNumber + 1);
              const snippet = lines.slice(startLine - 1, endLine).join('\n');
              
              // 创建验证问题
              violations.push(this.createViolation(
                filePath,
                `JSON值 "${currentPath.join('.')}" 包含厂商特定名称: ${valueVendorMatch}`,
                lineNumber,
                lineNumber,
                charPosition,
                charPosition + value.length + 2,
                snippet,
                `请使用厂商中立的值，如 "${this.suggestNeutralName(value, valueVendorMatch)}"`
              ));
            }
          }
          
          // 递归检查子对象
          if (typeof value === 'object' && value !== null) {
            checkObject(value, currentPath);
          }
        });
      };
      
      // 开始递归检查
      checkObject(json);
      
    } catch (error) {
      // JSON解析错误
      violations.push(this.createViolation(
        filePath,
        `无法解析JSON文件: ${error instanceof Error ? error.message : String(error)}`,
        1,
        1,
        1,
        1,
        content.substring(0, 100) + '...',
        '请修复JSON语法错误'
      ));
    }
    
    return violations;
  }

  /**
   * 检查文件路径是否符合厂商中立原则
   * 
   * @param filePath 文件路径
   * @returns 验证问题列表
   */
  private checkFilePath(filePath: string): SchemaViolation[] {
    const violations: SchemaViolation[] = [];
    
    // 检查文件路径是否包含厂商特定名称
    const vendorMatch = this.findVendorMatch(filePath);
    if (vendorMatch) {
      // 排除厂商适配器目录下的文件
      if (!filePath.includes('/mcp/') && !filePath.includes('\\mcp\\')) {
        violations.push(this.createViolation(
          filePath,
          `文件路径 "${filePath}" 包含厂商特定名称: ${vendorMatch}`,
          1,
          1,
          1,
          1,
          filePath,
          `请将厂商特定文件移至适当的适配器目录，如 "src/mcp/"`
        ));
      }
    }
    
    return violations;
  }

  /**
   * 获取导入语句的路径
   * 
   * @param node 导入声明节点
   * @returns 导入路径
   */
  private getImportPath(node: ts.ImportDeclaration): string | undefined {
    if (node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
      return node.moduleSpecifier.text;
    }
    return undefined;
  }

  /**
   * 查找字符串中的厂商特定名称
   * 
   * @param text 要检查的文本
   * @returns 匹配的厂商名称，如果没有匹配则返回undefined
   */
  private findVendorMatch(text: string): string | undefined {
    // 检查是否匹配厂商模式
    for (const pattern of this.vendorPatterns) {
      if (pattern.test(text)) {
        // 查找匹配的厂商名称
        for (const vendor of this.vendorNames) {
          if (text.toLowerCase().includes(vendor.toLowerCase())) {
            return vendor;
          }
        }
        
        // 如果没有具体匹配，但匹配了模式，返回第一个厂商名称
        return this.vendorNames[0];
      }
    }
    
    return undefined;
  }

  /**
   * 建议厂商中立的名称
   * 
   * @param original 原始名称
   * @param vendor 厂商名称
   * @returns 厂商中立的名称建议
   */
  private suggestNeutralName(original: string, vendor: string): string {
    // 移除厂商名称
    const neutralName = original.replace(new RegExp(vendor, 'i'), '');
    
    // 如果移除后为空或太短，返回通用名称
    if (!neutralName || neutralName.length < 3) {
      // 根据原始名称的上下文推断通用名称
      if (original.toLowerCase().includes('adapter')) {
        return 'Adapter';
      } else if (original.toLowerCase().includes('client')) {
        return 'Client';
      } else if (original.toLowerCase().includes('service')) {
        return 'Service';
      } else if (original.toLowerCase().includes('provider')) {
        return 'Provider';
      } else {
        return 'Implementation';
      }
    }
    
    return neutralName;
  }

  /**
   * 获取支持的文件扩展名
   * 
   * @returns 支持的文件扩展名列表
   */
  protected getSupportedExtensions(): string[] {
    return ['.ts', '.js', '.tsx', '.jsx', '.json'];
  }
} 