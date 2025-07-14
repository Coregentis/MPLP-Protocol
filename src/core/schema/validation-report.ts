/**
 * MPLP Schema验证报告
 *
 * 收集和展示Schema验证结果。
 *
 * @version v1.0.0
 * @created 2025-07-19T17:30:00+08:00
 */

import { ISchemaValidationReport, SchemaRuleType, SchemaViolation, SchemaViolationSeverity } from './interfaces';

/**
 * Schema验证报告类
 * 
 * 实现ISchemaValidationReport接口，提供验证结果的收集、分析和展示功能。
 */
export class SchemaValidationReport implements ISchemaValidationReport {
  /**
   * 验证时间
   */
  private timestamp: Date;

  /**
   * 验证的文件列表
   */
  private files: Set<string>;

  /**
   * 验证问题列表
   */
  private violations: SchemaViolation[];

  /**
   * 按文件分组的验证问题
   */
  private violationsByFile: Map<string, SchemaViolation[]>;

  /**
   * 按规则类型分组的验证问题
   */
  private violationsByRuleType: Map<SchemaRuleType, SchemaViolation[]>;

  /**
   * 按严重级别分组的验证问题
   */
  private violationsBySeverity: Map<SchemaViolationSeverity, SchemaViolation[]>;

  /**
   * 创建验证报告
   */
  constructor() {
    this.timestamp = new Date();
    this.files = new Set<string>();
    this.violations = [];
    this.violationsByFile = new Map<string, SchemaViolation[]>();
    this.violationsByRuleType = new Map<SchemaRuleType, SchemaViolation[]>();
    this.violationsBySeverity = new Map<SchemaViolationSeverity, SchemaViolation[]>();
    
    // 初始化分组映射
    Object.values(SchemaRuleType).forEach(type => {
      this.violationsByRuleType.set(type as SchemaRuleType, []);
    });
    
    Object.values(SchemaViolationSeverity).forEach(severity => {
      this.violationsBySeverity.set(severity as SchemaViolationSeverity, []);
    });
  }

  /**
   * 添加验证问题
   * 
   * @param violation 验证问题
   */
  public addViolation(violation: SchemaViolation): void {
    // 添加到总列表
    this.violations.push(violation);
    
    // 记录文件
    this.files.add(violation.location.filePath);
    
    // 按文件分组
    const fileViolations = this.violationsByFile.get(violation.location.filePath) || [];
    fileViolations.push(violation);
    this.violationsByFile.set(violation.location.filePath, fileViolations);
    
    // 按规则类型分组
    const ruleTypeViolations = this.violationsByRuleType.get(violation.ruleType) || [];
    ruleTypeViolations.push(violation);
    this.violationsByRuleType.set(violation.ruleType, ruleTypeViolations);
    
    // 按严重级别分组
    const severityViolations = this.violationsBySeverity.get(violation.severity) || [];
    severityViolations.push(violation);
    this.violationsBySeverity.set(violation.severity, severityViolations);
  }

  /**
   * 批量添加验证问题
   * 
   * @param violations 验证问题列表
   */
  public addViolations(violations: SchemaViolation[]): void {
    violations.forEach(violation => this.addViolation(violation));
  }

  /**
   * 获取验证时间
   * 
   * @returns 验证时间
   */
  public getTimestamp(): Date {
    return this.timestamp;
  }

  /**
   * 获取验证的文件数
   * 
   * @returns 文件数
   */
  public getFileCount(): number {
    return this.files.size;
  }

  /**
   * 获取验证问题总数
   * 
   * @returns 问题总数
   */
  public getViolationCount(): number {
    return this.violations.length;
  }

  /**
   * 获取按严重级别分类的问题数
   * 
   * @returns 按严重级别分类的问题数
   */
  public getViolationCountBySeverity(): Record<SchemaViolationSeverity, number> {
    const result: Record<SchemaViolationSeverity, number> = {} as Record<SchemaViolationSeverity, number>;
    
    this.violationsBySeverity.forEach((violations, severity) => {
      result[severity] = violations.length;
    });
    
    return result;
  }

  /**
   * 获取按规则类型分类的问题数
   * 
   * @returns 按规则类型分类的问题数
   */
  public getViolationCountByRuleType(): Record<SchemaRuleType, number> {
    const result: Record<SchemaRuleType, number> = {} as Record<SchemaRuleType, number>;
    
    this.violationsByRuleType.forEach((violations, ruleType) => {
      result[ruleType] = violations.length;
    });
    
    return result;
  }

  /**
   * 获取所有验证问题
   * 
   * @returns 所有验证问题
   */
  public getAllViolations(): SchemaViolation[] {
    return [...this.violations];
  }

  /**
   * 获取特定文件的验证问题
   * 
   * @param filePath 文件路径
   * @returns 文件的验证问题
   */
  public getViolationsByFile(filePath: string): SchemaViolation[] {
    return this.violationsByFile.get(filePath) || [];
  }

  /**
   * 获取特定规则类型的验证问题
   * 
   * @param ruleType 规则类型
   * @returns 规则类型的验证问题
   */
  public getViolationsByRuleType(ruleType: SchemaRuleType): SchemaViolation[] {
    return this.violationsByRuleType.get(ruleType) || [];
  }

  /**
   * 获取特定严重级别的验证问题
   * 
   * @param severity 严重级别
   * @returns 严重级别的验证问题
   */
  public getViolationsBySeverity(severity: SchemaViolationSeverity): SchemaViolation[] {
    return this.violationsBySeverity.get(severity) || [];
  }

  /**
   * 导出报告为JSON
   * 
   * @returns JSON格式的报告
   */
  public toJSON(): string {
    const report = {
      timestamp: this.timestamp.toISOString(),
      summary: {
        fileCount: this.getFileCount(),
        violationCount: this.getViolationCount(),
        violationCountBySeverity: this.getViolationCountBySeverity(),
        violationCountByRuleType: this.getViolationCountByRuleType()
      },
      violations: this.violations
    };
    
    return JSON.stringify(report, null, 2);
  }

  /**
   * 导出报告为Markdown
   * 
   * @returns Markdown格式的报告
   */
  public toMarkdown(): string {
    const severityCounts = this.getViolationCountBySeverity();
    const ruleTypeCounts = this.getViolationCountByRuleType();
    
    let markdown = `# Schema验证报告\n\n`;
    markdown += `**验证时间**: ${this.timestamp.toISOString()}\n\n`;
    
    // 添加摘要
    markdown += `## 摘要\n\n`;
    markdown += `- **验证文件数**: ${this.getFileCount()}\n`;
    markdown += `- **问题总数**: ${this.getViolationCount()}\n\n`;
    
    // 添加严重级别统计
    markdown += `### 按严重级别统计\n\n`;
    markdown += `| 严重级别 | 问题数 |\n`;
    markdown += `|--------|------|\n`;
    Object.entries(severityCounts).forEach(([severity, count]) => {
      markdown += `| ${severity} | ${count} |\n`;
    });
    markdown += `\n`;
    
    // 添加规则类型统计
    markdown += `### 按规则类型统计\n\n`;
    markdown += `| 规则类型 | 问题数 |\n`;
    markdown += `|--------|------|\n`;
    Object.entries(ruleTypeCounts).forEach(([ruleType, count]) => {
      markdown += `| ${ruleType} | ${count} |\n`;
    });
    markdown += `\n`;
    
    // 添加问题详情
    markdown += `## 问题详情\n\n`;
    
    // 按严重级别分组显示问题
    Object.values(SchemaViolationSeverity).forEach(severity => {
      const violations = this.getViolationsBySeverity(severity as SchemaViolationSeverity);
      if (violations.length > 0) {
        markdown += `### ${severity} 级别问题 (${violations.length})\n\n`;
        
        violations.forEach((violation, index) => {
          markdown += `#### ${index + 1}. ${violation.message}\n\n`;
          markdown += `- **文件**: \`${violation.location.filePath}\`\n`;
          markdown += `- **位置**: 第${violation.location.startLine || '?'}行\n`;
          markdown += `- **规则类型**: ${violation.ruleType}\n`;
          
          if (violation.location.codeSnippet) {
            markdown += `- **代码片段**:\n\n\`\`\`\n${violation.location.codeSnippet}\n\`\`\`\n\n`;
          }
          
          if (violation.fix) {
            markdown += `- **修复建议**: ${violation.fix}\n\n`;
          }
        });
      }
    });
    
    return markdown;
  }

  /**
   * 导出报告为HTML
   * 
   * @returns HTML格式的报告
   */
  public toHTML(): string {
    const severityCounts = this.getViolationCountBySeverity();
    const ruleTypeCounts = this.getViolationCountByRuleType();
    
    let html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Schema验证报告</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 1200px; margin: 0 auto; padding: 20px; }
    h1 { color: #333; }
    h2 { color: #444; margin-top: 30px; }
    h3 { color: #555; }
    table { border-collapse: collapse; width: 100%; margin: 20px 0; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f2f2f2; }
    .error { color: #d32f2f; }
    .warning { color: #f57c00; }
    .info { color: #0288d1; }
    .fatal { color: #b71c1c; font-weight: bold; }
    .code { background: #f5f5f5; padding: 10px; border-radius: 4px; font-family: monospace; overflow-x: auto; }
    .file { color: #2196f3; }
    .summary-box { display: inline-block; padding: 15px; margin: 10px; background-color: #f9f9f9; border-radius: 4px; min-width: 120px; text-align: center; }
    .summary-box .count { font-size: 24px; font-weight: bold; }
    .summary-box .label { font-size: 14px; color: #666; }
    .violation { border: 1px solid #eee; padding: 15px; margin: 15px 0; border-radius: 4px; }
    .fix { background-color: #e8f5e9; padding: 10px; border-radius: 4px; margin-top: 10px; }
  </style>
</head>
<body>
  <h1>Schema验证报告</h1>
  <p><strong>验证时间</strong>: ${this.timestamp.toISOString()}</p>
  
  <h2>摘要</h2>
  <div class="summary-container">
    <div class="summary-box">
      <div class="count">${this.getFileCount()}</div>
      <div class="label">验证文件数</div>
    </div>
    <div class="summary-box">
      <div class="count">${this.getViolationCount()}</div>
      <div class="label">问题总数</div>
    </div>
  </div>
  
  <h3>按严重级别统计</h3>
  <table>
    <tr>
      <th>严重级别</th>
      <th>问题数</th>
    </tr>`;
    
    Object.entries(severityCounts).forEach(([severity, count]) => {
      html += `
    <tr>
      <td class="${severity.toLowerCase()}">${severity}</td>
      <td>${count}</td>
    </tr>`;
    });
    
    html += `
  </table>
  
  <h3>按规则类型统计</h3>
  <table>
    <tr>
      <th>规则类型</th>
      <th>问题数</th>
    </tr>`;
    
    Object.entries(ruleTypeCounts).forEach(([ruleType, count]) => {
      html += `
    <tr>
      <td>${ruleType}</td>
      <td>${count}</td>
    </tr>`;
    });
    
    html += `
  </table>
  
  <h2>问题详情</h2>`;
    
    // 按严重级别分组显示问题
    Object.values(SchemaViolationSeverity).forEach(severity => {
      const violations = this.getViolationsBySeverity(severity as SchemaViolationSeverity);
      if (violations.length > 0) {
        html += `
  <h3 class="${severity.toLowerCase()}">${severity} 级别问题 (${violations.length})</h3>`;
        
        violations.forEach((violation, index) => {
          html += `
  <div class="violation">
    <h4>${index + 1}. ${violation.message}</h4>
    <p><strong>文件</strong>: <span class="file">${violation.location.filePath}</span></p>
    <p><strong>位置</strong>: 第${violation.location.startLine || '?'}行</p>
    <p><strong>规则类型</strong>: ${violation.ruleType}</p>`;
          
          if (violation.location.codeSnippet) {
            html += `
    <p><strong>代码片段</strong>:</p>
    <pre class="code">${this.escapeHtml(violation.location.codeSnippet)}</pre>`;
          }
          
          if (violation.fix) {
            html += `
    <div class="fix">
      <p><strong>修复建议</strong>: ${violation.fix}</p>
    </div>`;
          }
          
          html += `
  </div>`;
        });
      }
    });
    
    html += `
</body>
</html>`;
    
    return html;
  }

  /**
   * HTML转义
   * 
   * @param unsafe 不安全的HTML字符串
   * @returns 转义后的安全HTML字符串
   */
  private escapeHtml(unsafe: string): string {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
} 