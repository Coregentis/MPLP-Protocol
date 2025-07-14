/**
 * MPLP默认基准测试报告器
 *
 * 提供基准测试结果的报告生成功能，支持多种格式输出。
 * 实现IBenchmarkReporter接口，用于生成测试摘要、详细报告和比较报告。
 *
 * @version v1.0.0
 * @created 2025-07-17T10:00:00+08:00
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { IBenchmarkReporter, BenchmarkResult } from './interfaces';

/**
 * 默认基准测试报告器
 */
export class DefaultBenchmarkReporter implements IBenchmarkReporter {
  private outputDir: string;

  /**
   * 创建默认基准测试报告器
   * @param outputDir 报告输出目录
   */
  constructor(outputDir: string = './reports/benchmark') {
    this.outputDir = outputDir;
  }

  /**
   * 报告单个测试结果
   * @param result 测试结果
   */
  public async report(result: BenchmarkResult): Promise<void> {
    const summary = await this.generateSummary([result]);
    console.log(summary);
    
    await this.ensureOutputDir();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${result.config.name}-${timestamp}.json`;
    const filePath = path.join(this.outputDir, filename);
    
    await fs.writeFile(filePath, JSON.stringify(result, null, 2), 'utf8');
    console.log(`详细报告已保存至: ${filePath}`);
  }

  /**
   * 报告多个测试结果
   * @param results 测试结果数组
   */
  public async reportMany(results: BenchmarkResult[]): Promise<void> {
    const summary = await this.generateSummary(results);
    console.log(summary);
    
    await this.ensureOutputDir();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `benchmark-report-${timestamp}.json`;
    const filePath = path.join(this.outputDir, filename);
    
    await fs.writeFile(filePath, JSON.stringify(results, null, 2), 'utf8');
    console.log(`详细报告已保存至: ${filePath}`);
  }

  /**
   * 生成摘要报告
   * @param results 测试结果数组
   * @returns 摘要报告文本
   */
  public async generateSummary(results: BenchmarkResult[]): Promise<string> {
    const lines: string[] = [];
    
    lines.push('# 基准测试摘要报告');
    lines.push('');
    lines.push(`测试时间: ${new Date().toISOString()}`);
    lines.push(`测试用例数: ${results.length}`);
    lines.push(`通过数: ${results.filter(r => r.passed).length}`);
    lines.push(`失败数: ${results.filter(r => !r.passed).length}`);
    lines.push('');
    
    lines.push('## 测试结果');
    lines.push('');
    lines.push('| 测试名称 | 类型 | 级别 | 状态 | 持续时间(ms) | 每秒操作数 | P95延迟(ms) |');
    lines.push('|---------|------|------|------|-------------|------------|------------|');
    
    for (const result of results) {
      const name = result.config.name;
      const type = result.config.type;
      const level = result.config.level;
      const status = result.passed ? '✅ 通过' : '❌ 失败';
      const duration = result.duration.toFixed(2);
      const opsPerSecond = result.opsPerSecond.toFixed(2);
      const p95 = result.metrics.duration ? result.metrics.duration.p95.toFixed(2) : 'N/A';
      
      lines.push(`| ${name} | ${type} | ${level} | ${status} | ${duration} | ${opsPerSecond} | ${p95} |`);
    }
    
    lines.push('');
    
    // 添加失败详情
    const failures = results.filter(r => !r.passed);
    if (failures.length > 0) {
      lines.push('## 失败详情');
      lines.push('');
      
      for (const failure of failures) {
        lines.push(`### ${failure.config.name}`);
        lines.push('');
        
        if (failure.error) {
          lines.push('**错误信息:**');
          lines.push('```');
          lines.push(failure.error.message);
          if (failure.error.stack) {
            lines.push(failure.error.stack);
          }
          lines.push('```');
        }
        
        if (failure.thresholdValidation) {
          lines.push('**阈值验证失败:**');
          lines.push('');
          
          for (const [metricName, validations] of Object.entries(failure.thresholdValidation)) {
            for (const validation of validations) {
              if (!validation.passed) {
                lines.push(`- ${metricName}: ${validation.comparison} (失败)`);
              }
            }
          }
        }
        
        lines.push('');
      }
    }
    
    return lines.join('\n');
  }

  /**
   * 生成详细报告
   * @param results 测试结果数组
   * @returns 详细报告文本
   */
  public async generateDetailedReport(results: BenchmarkResult[]): Promise<string> {
    const lines: string[] = [];
    
    lines.push('# 基准测试详细报告');
    lines.push('');
    lines.push(`生成时间: ${new Date().toISOString()}`);
    lines.push(`测试用例数: ${results.length}`);
    lines.push(`通过数: ${results.filter(r => r.passed).length}`);
    lines.push(`失败数: ${results.filter(r => !r.passed).length}`);
    lines.push('');
    
    for (const result of results) {
      lines.push(`## ${result.config.name}`);
      lines.push('');
      lines.push(`- **类型**: ${result.config.type}`);
      lines.push(`- **级别**: ${result.config.level}`);
      lines.push(`- **状态**: ${result.passed ? '✅ 通过' : '❌ 失败'}`);
      lines.push(`- **描述**: ${result.config.description || 'N/A'}`);
      lines.push(`- **标签**: ${result.config.tags?.join(', ') || 'N/A'}`);
      lines.push('');
      
      lines.push('### 执行信息');
      lines.push('');
      lines.push(`- **持续时间**: ${result.duration.toFixed(2)} ms`);
      lines.push(`- **迭代次数**: ${result.iterations}`);
      lines.push(`- **操作数**: ${result.operations}`);
      lines.push(`- **每秒操作数**: ${result.opsPerSecond.toFixed(2)}`);
      lines.push(`- **时间戳**: ${new Date(result.timestamp).toISOString()}`);
      lines.push('');
      
      lines.push('### 环境信息');
      lines.push('');
      lines.push(`- **Node版本**: ${result.context.environment.nodeVersion}`);
      lines.push(`- **平台**: ${result.context.environment.platform}`);
      lines.push(`- **CPU**: ${result.context.environment.cpuInfo.model} (${result.context.environment.cpuInfo.cores}核, ${result.context.environment.cpuInfo.speed}MHz)`);
      lines.push(`- **内存**: 总计${result.context.environment.memoryInfo.totalMb}MB, 可用${result.context.environment.memoryInfo.freeMb}MB`);
      lines.push('');
      
      lines.push('### 性能指标');
      lines.push('');
      
      for (const [metricName, metricData] of Object.entries(result.metrics)) {
        lines.push(`#### ${metricName}`);
        lines.push('');
        lines.push(`- **最小值**: ${metricData.min.toFixed(2)} ms`);
        lines.push(`- **最大值**: ${metricData.max.toFixed(2)} ms`);
        lines.push(`- **平均值**: ${metricData.mean.toFixed(2)} ms`);
        lines.push(`- **中位数**: ${metricData.median.toFixed(2)} ms`);
        lines.push(`- **标准差**: ${metricData.stdDev.toFixed(2)} ms`);
        lines.push(`- **P95**: ${metricData.p95.toFixed(2)} ms`);
        lines.push(`- **P99**: ${metricData.p99.toFixed(2)} ms`);
        lines.push('');
        
        // 添加直方图
        if (metricData.values && metricData.values.length > 0) {
          lines.push('```');
          lines.push(this.generateHistogram(metricData.values));
          lines.push('```');
          lines.push('');
        }
      }
      
      // 添加阈值验证结果
      if (result.thresholdValidation) {
        lines.push('### 阈值验证');
        lines.push('');
        
        for (const [metricName, validations] of Object.entries(result.thresholdValidation)) {
          for (const validation of validations) {
            const icon = validation.passed ? '✅' : '❌';
            lines.push(`- ${icon} ${metricName}: ${validation.comparison}`);
          }
        }
        
        lines.push('');
      }
      
      // 添加错误信息
      if (result.error) {
        lines.push('### 错误信息');
        lines.push('');
        lines.push('```');
        lines.push(result.error.message);
        if (result.error.stack) {
          lines.push(result.error.stack);
        }
        lines.push('```');
        lines.push('');
      }
      
      lines.push('---');
      lines.push('');
    }
    
    return lines.join('\n');
  }

  /**
   * 生成比较报告
   * @param baseline 基准测试结果数组
   * @param current 当前测试结果数组
   * @returns 比较报告文本
   */
  public async generateComparisonReport(baseline: BenchmarkResult[], current: BenchmarkResult[]): Promise<string> {
    const lines: string[] = [];
    
    lines.push('# 基准测试比较报告');
    lines.push('');
    lines.push(`生成时间: ${new Date().toISOString()}`);
    lines.push(`基准测试用例数: ${baseline.length}`);
    lines.push(`当前测试用例数: ${current.length}`);
    lines.push('');
    
    // 按名称匹配测试用例
    const baselineMap = new Map<string, BenchmarkResult>();
    for (const result of baseline) {
      baselineMap.set(result.config.name, result);
    }
    
    const comparedCases: string[] = [];
    
    lines.push('## 性能比较');
    lines.push('');
    lines.push('| 测试名称 | 指标 | 基准值 | 当前值 | 变化 | 变化率 |');
    lines.push('|---------|------|--------|--------|------|--------|');
    
    for (const result of current) {
      const name = result.config.name;
      const baselineResult = baselineMap.get(name);
      
      if (baselineResult) {
        comparedCases.push(name);
        
        // 比较每秒操作数
        const baselineOps = baselineResult.opsPerSecond;
        const currentOps = result.opsPerSecond;
        const opsDiff = currentOps - baselineOps;
        const opsChange = baselineOps !== 0 ? (opsDiff / baselineOps) * 100 : 0;
        const opsChangeStr = opsChange >= 0 ? `+${opsChange.toFixed(2)}%` : `${opsChange.toFixed(2)}%`;
        const opsIcon = opsChange >= 0 ? '🔼' : '🔽';
        
        lines.push(`| ${name} | 每秒操作数 | ${baselineOps.toFixed(2)} | ${currentOps.toFixed(2)} | ${opsDiff.toFixed(2)} | ${opsIcon} ${opsChangeStr} |`);
        
        // 比较P95延迟
        if (baselineResult.metrics.duration && result.metrics.duration) {
          const baselineP95 = baselineResult.metrics.duration.p95;
          const currentP95 = result.metrics.duration.p95;
          const p95Diff = currentP95 - baselineP95;
          const p95Change = baselineP95 !== 0 ? (p95Diff / baselineP95) * 100 : 0;
          const p95ChangeStr = p95Change >= 0 ? `+${p95Change.toFixed(2)}%` : `${p95Change.toFixed(2)}%`;
          const p95Icon = p95Change <= 0 ? '🔼' : '🔽'; // 注意：延迟降低是好事
          
          lines.push(`| ${name} | P95延迟 | ${baselineP95.toFixed(2)} ms | ${currentP95.toFixed(2)} ms | ${p95Diff.toFixed(2)} ms | ${p95Icon} ${p95ChangeStr} |`);
        }
      }
    }
    
    lines.push('');
    
    // 添加仅在基准中存在的测试用例
    const onlyInBaseline = Array.from(baselineMap.keys()).filter(name => !comparedCases.includes(name));
    if (onlyInBaseline.length > 0) {
      lines.push('## 仅在基准中存在的测试');
      lines.push('');
      for (const name of onlyInBaseline) {
        lines.push(`- ${name}`);
      }
      lines.push('');
    }
    
    // 添加仅在当前中存在的测试用例
    const onlyInCurrent = current.filter(result => !baselineMap.has(result.config.name)).map(result => result.config.name);
    if (onlyInCurrent.length > 0) {
      lines.push('## 仅在当前测试中存在的测试');
      lines.push('');
      for (const name of onlyInCurrent) {
        lines.push(`- ${name}`);
      }
      lines.push('');
    }
    
    return lines.join('\n');
  }

  /**
   * 导出报告
   * @param results 测试结果数组
   * @param format 导出格式
   * @returns 导出文件路径
   */
  public async exportReport(results: BenchmarkResult[], format: 'json' | 'csv' | 'html' | 'md'): Promise<string> {
    await this.ensureOutputDir();
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `benchmark-report-${timestamp}.${format}`;
    const filePath = path.join(this.outputDir, filename);
    
    let content = '';
    
    switch (format) {
      case 'json':
        content = JSON.stringify(results, null, 2);
        break;
        
      case 'csv':
        content = this.generateCsvReport(results);
        break;
        
      case 'html':
        content = await this.generateHtmlReport(results);
        break;
        
      case 'md':
        content = await this.generateDetailedReport(results);
        break;
        
      default:
        throw new Error(`不支持的导出格式: ${format}`);
    }
    
    await fs.writeFile(filePath, content, 'utf8');
    return filePath;
  }

  /**
   * 生成CSV报告
   * @param results 测试结果数组
   * @returns CSV内容
   */
  private generateCsvReport(results: BenchmarkResult[]): string {
    const lines: string[] = [];
    
    // 添加标题行
    lines.push([
      'Name',
      'Type',
      'Level',
      'Status',
      'Duration (ms)',
      'Operations/sec',
      'Min (ms)',
      'Max (ms)',
      'Mean (ms)',
      'Median (ms)',
      'StdDev (ms)',
      'P95 (ms)',
      'P99 (ms)',
      'Timestamp'
    ].join(','));
    
    // 添加数据行
    for (const result of results) {
      const durationMetric = result.metrics.duration || {
        min: 0,
        max: 0,
        mean: 0,
        median: 0,
        stdDev: 0,
        p95: 0,
        p99: 0
      };
      
      lines.push([
        this.escapeCsv(result.config.name),
        this.escapeCsv(result.config.type),
        this.escapeCsv(result.config.level),
        result.passed ? 'PASS' : 'FAIL',
        result.duration.toFixed(2),
        result.opsPerSecond.toFixed(2),
        durationMetric.min.toFixed(2),
        durationMetric.max.toFixed(2),
        durationMetric.mean.toFixed(2),
        durationMetric.median.toFixed(2),
        durationMetric.stdDev.toFixed(2),
        durationMetric.p95.toFixed(2),
        durationMetric.p99.toFixed(2),
        new Date(result.timestamp).toISOString()
      ].join(','));
    }
    
    return lines.join('\n');
  }

  /**
   * 生成HTML报告
   * @param results 测试结果数组
   * @returns HTML内容
   */
  private async generateHtmlReport(results: BenchmarkResult[]): Promise<string> {
    const mdReport = await this.generateDetailedReport(results);
    
    // 简单的HTML包装
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>基准测试报告</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    h1, h2, h3, h4 { margin-top: 24px; margin-bottom: 16px; }
    h1 { font-size: 2em; border-bottom: 1px solid #eee; padding-bottom: 0.3em; }
    h2 { font-size: 1.5em; border-bottom: 1px solid #eee; padding-bottom: 0.3em; }
    h3 { font-size: 1.25em; }
    table { border-collapse: collapse; width: 100%; margin-bottom: 16px; }
    th, td { text-align: left; padding: 8px; border: 1px solid #ddd; }
    th { background-color: #f2f2f2; }
    tr:nth-child(even) { background-color: #f9f9f9; }
    code, pre {
      font-family: SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace;
      background-color: #f6f8fa;
      border-radius: 3px;
    }
    pre {
      padding: 16px;
      overflow: auto;
      line-height: 1.45;
    }
    code { padding: 0.2em 0.4em; }
    pre code { padding: 0; }
    .pass { color: #2cbe4e; }
    .fail { color: #cb2431; }
  </style>
</head>
<body>
  <div id="content">
    ${this.markdownToHtml(mdReport)}
  </div>
</body>
</html>
    `;
  }

  /**
   * 简单的Markdown到HTML转换
   * @param markdown Markdown文本
   * @returns HTML文本
   */
  private markdownToHtml(markdown: string): string {
    let html = markdown;
    
    // 转换标题
    html = html.replace(/^# (.*?)$/gm, '<h1>$1</h1>');
    html = html.replace(/^## (.*?)$/gm, '<h2>$1</h2>');
    html = html.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
    html = html.replace(/^#### (.*?)$/gm, '<h4>$1</h4>');
    
    // 转换列表
    html = html.replace(/^- (.*?)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*?<\/li>\n)+/g, '<ul>$&</ul>');
    
    // 转换表格
    const tableRegex = /^\|(.*?)\|\n\|(.*?)\|\n((?:\|.*?\|\n)+)/gm;
    html = html.replace(tableRegex, (match, header, separator, rows) => {
      const headerCells = header.split('|').map((cell: string) => `<th>${cell.trim()}</th>`).join('');
      const headerRow = `<tr>${headerCells}</tr>`;
      
      const rowsHtml = rows.split('\n').filter(Boolean).map((row: string) => {
        const cells = row.split('|').map((cell: string) => `<td>${cell.trim()}</td>`).join('');
        return `<tr>${cells}</tr>`;
      }).join('');
      
      return `<table><thead>${headerRow}</thead><tbody>${rowsHtml}</tbody></table>`;
    });
    
    // 转换代码块
    html = html.replace(/```\n([\s\S]*?)\n```/g, '<pre><code>$1</code></pre>');
    
    // 转换内联代码
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // 转换粗体
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // 转换斜体
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // 转换水平线
    html = html.replace(/^---$/gm, '<hr>');
    
    // 转换段落
    html = html.replace(/^([^<].*?)$/gm, '<p>$1</p>');
    
    // 修复空段落
    html = html.replace(/<p><\/p>/g, '');
    
    return html;
  }

  /**
   * 生成简单的ASCII直方图
   * @param values 数值数组
   * @returns 直方图文本
   */
  private generateHistogram(values: number[]): string {
    if (values.length === 0) return '';
    
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;
    const bucketCount = Math.min(20, Math.ceil(Math.sqrt(values.length)));
    const bucketSize = range / bucketCount;
    
    const buckets: number[] = Array(bucketCount).fill(0);
    
    // 填充桶
    for (const value of values) {
      const bucketIndex = Math.min(bucketCount - 1, Math.floor((value - min) / bucketSize));
      buckets[bucketIndex]++;
    }
    
    // 找到最大桶计数用于归一化
    const maxCount = Math.max(...buckets);
    const histogramWidth = 40;
    
    const lines: string[] = [];
    lines.push('直方图:');
    
    // 生成直方图
    for (let i = 0; i < bucketCount; i++) {
      const bucketStart = min + i * bucketSize;
      const bucketEnd = bucketStart + bucketSize;
      const count = buckets[i];
      const barWidth = Math.round((count / maxCount) * histogramWidth);
      const bar = '█'.repeat(barWidth);
      
      lines.push(`${bucketStart.toFixed(2)}-${bucketEnd.toFixed(2)} | ${bar} (${count})`);
    }
    
    return lines.join('\n');
  }

  /**
   * 转义CSV字段
   * @param value 字段值
   * @returns 转义后的字段值
   */
  private escapeCsv(value: any): string {
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  /**
   * 确保输出目录存在
   */
  private async ensureOutputDir(): Promise<void> {
    try {
      await fs.mkdir(this.outputDir, { recursive: true });
    } catch (error) {
      console.error(`创建输出目录失败: ${error}`);
      throw error;
    }
  }
} 