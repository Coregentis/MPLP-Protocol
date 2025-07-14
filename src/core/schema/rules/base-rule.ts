/**
 * MPLP Schema验证基础规则
 *
 * 提供所有验证规则的基础实现，包含共享功能和抽象方法。
 *
 * @version v1.0.0
 * @created 2025-07-19T15:30:00+08:00
 */

import { ISchemaRule, SchemaRuleType, SchemaViolation, SchemaViolationSeverity } from '../interfaces';
import { readFileSync } from 'fs';
import { extname } from 'path';

/**
 * 抽象基础规则类
 * 
 * 提供规则实现的通用功能，子类需要实现具体的验证逻辑。
 */
export abstract class BaseRule implements ISchemaRule {
  /**
   * 规则ID
   */
  protected id: string;
  
  /**
   * 规则类型
   */
  protected type: SchemaRuleType;
  
  /**
   * 规则描述
   */
  protected description: string;
  
  /**
   * 规则严重级别
   */
  protected severity: SchemaViolationSeverity;

  /**
   * 创建基础规则
   * 
   * @param id 规则ID
   * @param type 规则类型
   * @param description 规则描述
   * @param severity 规则严重级别
   */
  constructor(
    id: string,
    type: SchemaRuleType,
    description: string,
    severity: SchemaViolationSeverity
  ) {
    this.id = id;
    this.type = type;
    this.description = description;
    this.severity = severity;
  }

  /**
   * 获取规则ID
   * @returns 规则ID
   */
  public getId(): string {
    return this.id;
  }

  /**
   * 获取规则类型
   * @returns 规则类型
   */
  public getType(): SchemaRuleType {
    return this.type;
  }

  /**
   * 获取规则描述
   * @returns 规则描述
   */
  public getDescription(): string {
    return this.description;
  }

  /**
   * 获取规则严重级别
   * @returns 规则严重级别
   */
  public getSeverity(): SchemaViolationSeverity {
    return this.severity;
  }

  /**
   * 验证文件内容
   * 
   * @param filePath 文件路径
   * @param content 文件内容
   * @returns 验证问题列表
   */
  public async validate(filePath: string, content: string): Promise<SchemaViolation[]> {
    // 检查文件扩展名是否支持
    if (!this.isSupportedFile(filePath)) {
      return [];
    }

    try {
      // 执行具体的验证逻辑
      return await this.validateContent(filePath, content);
    } catch (error) {
      // 捕获验证过程中的错误并返回为验证问题
      return [{
        id: `${this.id}_error`,
        ruleType: this.type,
        severity: SchemaViolationSeverity.ERROR,
        message: `验证过程发生错误: ${error instanceof Error ? error.message : String(error)}`,
        location: {
          filePath,
          startLine: 1,
          endLine: 1
        }
      }];
    }
  }

  /**
   * 检查文件是否受支持
   * 
   * @param filePath 文件路径
   * @returns 是否支持
   */
  protected isSupportedFile(filePath: string): boolean {
    const ext = extname(filePath).toLowerCase();
    return this.getSupportedExtensions().includes(ext);
  }

  /**
   * 获取支持的文件扩展名
   * 
   * @returns 支持的文件扩展名列表
   */
  protected getSupportedExtensions(): string[] {
    return ['.ts', '.js', '.tsx', '.jsx', '.json'];
  }

  /**
   * 创建验证问题
   * 
   * @param filePath 文件路径
   * @param message 问题描述
   * @param startLine 开始行号
   * @param endLine 结束行号
   * @param startColumn 开始列号
   * @param endColumn 结束列号
   * @param codeSnippet 代码片段
   * @param fix 修复建议
   * @returns 验证问题
   */
  protected createViolation(
    filePath: string,
    message: string,
    startLine?: number,
    endLine?: number,
    startColumn?: number,
    endColumn?: number,
    codeSnippet?: string,
    fix?: string
  ): SchemaViolation {
    return {
      id: `${this.id}_${Date.now()}`,
      ruleType: this.type,
      severity: this.severity,
      message,
      location: {
        filePath,
        startLine,
        endLine,
        startColumn,
        endColumn,
        codeSnippet
      },
      fix
    };
  }

  /**
   * 提取文件中的代码片段
   * 
   * @param content 文件内容
   * @param startLine 开始行号
   * @param endLine 结束行号
   * @returns 代码片段
   */
  protected extractCodeSnippet(content: string, startLine: number, endLine: number): string {
    const lines = content.split('\n');
    return lines.slice(startLine - 1, endLine).join('\n');
  }

  /**
   * 具体的验证逻辑，由子类实现
   * 
   * @param filePath 文件路径
   * @param content 文件内容
   * @returns 验证问题列表
   */
  protected abstract validateContent(filePath: string, content: string): Promise<SchemaViolation[]>;
} 