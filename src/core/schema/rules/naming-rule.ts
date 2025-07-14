/**
 * MPLP Schema命名规则验证
 *
 * 验证代码是否遵循命名约定，如snake_case、camelCase等。
 *
 * @version v1.0.0
 * @created 2025-07-19T16:00:00+08:00
 */

import { BaseRule } from './base-rule';
import { SchemaRuleType, SchemaViolation, SchemaViolationSeverity } from '../interfaces';
import * as ts from 'typescript';

/**
 * 命名规则类
 * 
 * 验证代码中的标识符是否符合指定的命名模式。
 */
export class NamingRule extends BaseRule {
  /**
   * 命名模式正则表达式
   */
  private pattern: RegExp;

  /**
   * 适用的语法节点类型
   */
  private nodeKinds: ts.SyntaxKind[];

  /**
   * 创建命名规则
   * 
   * @param id 规则ID
   * @param pattern 命名模式正则表达式
   * @param description 规则描述
   * @param severity 规则严重级别
   * @param nodeKinds 适用的语法节点类型
   */
  constructor(
    id: string,
    pattern: RegExp,
    description: string,
    severity: SchemaViolationSeverity,
    nodeKinds: ts.SyntaxKind[] = [
      ts.SyntaxKind.Identifier,
      ts.SyntaxKind.PropertyDeclaration,
      ts.SyntaxKind.MethodDeclaration,
      ts.SyntaxKind.Parameter,
      ts.SyntaxKind.VariableDeclaration,
      ts.SyntaxKind.FunctionDeclaration,
      ts.SyntaxKind.ClassDeclaration,
      ts.SyntaxKind.InterfaceDeclaration
    ]
  ) {
    super(id, SchemaRuleType.NAMING, description, severity);
    this.pattern = pattern;
    this.nodeKinds = nodeKinds;
  }

  /**
   * 验证文件内容中的命名约定
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

    // 遍历AST查找命名问题
    const visit = (node: ts.Node) => {
      // 检查是否是我们关注的节点类型
      if (this.nodeKinds.includes(node.kind)) {
        let name: string | undefined;
        let nodeType: string = '未知类型'; // 初始化为默认值

        // 根据节点类型提取名称
        switch (node.kind) {
          case ts.SyntaxKind.Identifier:
            name = (node as ts.Identifier).text;
            nodeType = '标识符';
            break;
          case ts.SyntaxKind.PropertyDeclaration:
            const prop = node as ts.PropertyDeclaration;
            if (ts.isIdentifier(prop.name)) {
              name = prop.name.text;
              nodeType = '属性';
            }
            break;
          case ts.SyntaxKind.MethodDeclaration:
            const method = node as ts.MethodDeclaration;
            if (ts.isIdentifier(method.name)) {
              name = method.name.text;
              nodeType = '方法';
            }
            break;
          case ts.SyntaxKind.Parameter:
            const param = node as ts.ParameterDeclaration;
            if (ts.isIdentifier(param.name)) {
              name = param.name.text;
              nodeType = '参数';
            }
            break;
          case ts.SyntaxKind.VariableDeclaration:
            const varDecl = node as ts.VariableDeclaration;
            if (ts.isIdentifier(varDecl.name)) {
              name = varDecl.name.text;
              nodeType = '变量';
            }
            break;
          case ts.SyntaxKind.FunctionDeclaration:
            const func = node as ts.FunctionDeclaration;
            if (func.name && ts.isIdentifier(func.name)) {
              name = func.name.text;
              nodeType = '函数';
            }
            break;
          case ts.SyntaxKind.ClassDeclaration:
            const cls = node as ts.ClassDeclaration;
            if (cls.name && ts.isIdentifier(cls.name)) {
              name = cls.name.text;
              nodeType = '类';
            }
            break;
          case ts.SyntaxKind.InterfaceDeclaration:
            const iface = node as ts.InterfaceDeclaration;
            if (iface.name && ts.isIdentifier(iface.name)) {
              name = iface.name.text;
              nodeType = '接口';
            }
            break;
        }

        // 如果提取到名称，检查是否符合命名模式
        if (name && !this.pattern.test(name)) {
          const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
          const endLine = sourceFile.getLineAndCharacterOfPosition(node.getEnd()).line;
          
          // 提取代码片段
          const snippet = this.extractCodeSnippet(content, line + 1, endLine + 1);
          
          // 创建验证问题
          violations.push(this.createViolation(
            filePath,
            `${nodeType} "${name}" 不符合命名规范: ${this.description}`,
            line + 1,
            endLine + 1,
            character + 1,
            sourceFile.getLineAndCharacterOfPosition(node.getEnd()).character + 1,
            snippet,
            `请将 "${name}" 重命名为符合 ${this.pattern} 的形式`
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
   * 验证JSON文件中的命名约定
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
      
      // 递归检查所有属性名
      const checkObject = (obj: any, path: string[] = []) => {
        if (typeof obj !== 'object' || obj === null) {
          return;
        }
        
        // 检查对象的所有键
        Object.keys(obj).forEach(key => {
          const currentPath = [...path, key];
          
          // 检查键名是否符合命名模式
          if (!this.pattern.test(key)) {
            // 尝试找到键在文件中的位置
            const keyRegex = new RegExp(`"${key}"\\s*:`, 'g');
            let match;
            let lineNumber = 1;
            let charPosition = 0;
            
            // 查找键在文件中的位置
            const lines = content.split('\n');
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
              `JSON属性 "${currentPath.join('.')}" 不符合命名规范: ${this.description}`,
              lineNumber,
              lineNumber,
              charPosition,
              charPosition + key.length + 2,
              snippet,
              `请将 "${key}" 重命名为符合 ${this.pattern} 的形式`
            ));
          }
          
          // 递归检查子对象
          if (typeof obj[key] === 'object' && obj[key] !== null) {
            checkObject(obj[key], currentPath);
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
   * 获取支持的文件扩展名
   * 
   * @returns 支持的文件扩展名列表
   */
  protected getSupportedExtensions(): string[] {
    return ['.ts', '.js', '.tsx', '.jsx', '.json'];
  }
} 