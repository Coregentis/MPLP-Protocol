/**
 * MPLP Schema Validation Report Generator
 *
 * @description 验证报告生成器实现
 * @version 1.1.0
 * @standardized MPLP协议验证工具标准化规范 v1.1.0
 * @updated 2025-08-14 - 添加企业级功能和命名约定报告支持
 */

import { 
  ReportGenerator, 
  ValidationResult, 
  ValidationSummary,
  ValidationError,
  ValidationWarning 
} from '../types';

export class MplpReportGenerator implements ReportGenerator {
  private readonly reportVersion = '1.1.0';

  /**
   * 生成文本格式报告
   */
  generateTextReport(results: ValidationResult[]): string {
    const summary = this.generateSummary(results);
    const lines: string[] = [];

    // 报告头部
    lines.push('='.repeat(80));
    lines.push('MPLP Schema Validation Report');
    lines.push('='.repeat(80));
    lines.push(`Generated: ${new Date().toISOString()}`);
    lines.push(`Report Version: ${this.reportVersion}`);
    lines.push('');

    // 摘要信息
    lines.push('SUMMARY');
    lines.push('-'.repeat(40));
    lines.push(`Total Schemas: ${summary.totalSchemas}`);
    lines.push(`Valid Schemas: ${summary.validSchemas}`);
    lines.push(`Invalid Schemas: ${summary.invalidSchemas}`);
    lines.push(`Total Errors: ${summary.totalErrors}`);
    lines.push(`Critical Errors: ${summary.criticalErrors}`);
    lines.push(`Total Warnings: ${summary.totalWarnings}`);
    lines.push(`Execution Time: ${summary.executionTimeMs}ms`);
    lines.push('');

    // 企业级功能统计
    const enterpriseStats = this.generateEnterpriseStatistics(results);
    lines.push('ENTERPRISE FEATURES COMPLIANCE');
    lines.push('-'.repeat(40));
    lines.push(`Enterprise Compliant Schemas: ${enterpriseStats.compliantSchemas}/${summary.totalSchemas}`);
    lines.push(`Enterprise Compliance Rate: ${enterpriseStats.complianceRate.toFixed(1)}%`);
    lines.push(`Missing Enterprise Features: ${enterpriseStats.missingFeatures}`);
    lines.push(`Incomplete Enterprise Features: ${enterpriseStats.incompleteFeatures}`);
    lines.push(`Specialization Issues: ${enterpriseStats.specializationIssues}`);
    lines.push('');

    // 命名约定统计
    const namingStats = this.generateNamingStatistics(results);
    lines.push('NAMING CONVENTION COMPLIANCE');
    lines.push('-'.repeat(40));
    lines.push(`Naming Compliant Schemas: ${namingStats.compliantSchemas}/${summary.totalSchemas}`);
    lines.push(`Naming Compliance Rate: ${namingStats.complianceRate.toFixed(1)}%`);
    lines.push(`Naming Violations: ${namingStats.violations}`);
    lines.push('');

    // 详细结果
    lines.push('DETAILED RESULTS');
    lines.push('-'.repeat(40));

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      const schemaName = this.extractSchemaName(result);
      
      lines.push(`${i + 1}. Schema: ${schemaName}`);
      lines.push(`   Status: ${result.isValid ? '✓ VALID' : '✗ INVALID'}`);
      lines.push(`   Errors: ${result.errors.length}`);
      lines.push(`   Warnings: ${result.warnings.length}`);
      lines.push(`   Duration: ${result.metadata.validationDurationMs}ms`);

      // 错误详情
      if (result.errors.length > 0) {
        lines.push('   ERRORS:');
        for (const error of result.errors) {
          lines.push(`     - [${error.errorCode}] ${error.message}`);
          lines.push(`       Location: ${error.location.jsonPath || 'root'}`);
          lines.push(`       Details: ${error.details}`);
        }
      }

      // 警告详情
      if (result.warnings.length > 0) {
        lines.push('   WARNINGS:');
        for (const warning of result.warnings) {
          lines.push(`     - [${warning.warningCode}] ${warning.message}`);
          lines.push(`       Location: ${warning.location.jsonPath || 'root'}`);
        }
      }

      lines.push('');
    }

    // 建议
    if (summary.totalErrors > 0 || summary.totalWarnings > 0) {
      lines.push('RECOMMENDATIONS');
      lines.push('-'.repeat(40));
      
      if (summary.criticalErrors > 0) {
        lines.push('• Fix critical errors immediately - these prevent schema usage');
      }
      
      if (summary.totalErrors > 0) {
        lines.push('• Address all errors before deploying schemas');
      }
      
      if (summary.totalWarnings > 0) {
        lines.push('• Review warnings to improve schema quality');
        lines.push('• Consider following MPLP best practices');
      }
      
      lines.push('• Run validation again after making changes');
      lines.push('');
    }

    lines.push('='.repeat(80));
    
    return lines.join('\n');
  }

  /**
   * 生成JSON格式报告
   */
  generateJsonReport(results: ValidationResult[]): string {
    const summary = this.generateSummary(results);
    
    const report = {
      reportMetadata: {
        version: this.reportVersion,
        generatedAt: new Date().toISOString(),
        reportType: 'schema-validation',
        totalSchemas: summary.totalSchemas
      },
      summary,
      results: results.map((result, index) => ({
        schemaIndex: index + 1,
        schemaName: this.extractSchemaName(result),
        isValid: result.isValid,
        errorCount: result.errors.length,
        warningCount: result.warnings.length,
        validationDurationMs: result.metadata.validationDurationMs,
        errors: result.errors.map(error => ({
          id: error.errorId,
          code: error.errorCode,
          type: error.errorType,
          message: error.message,
          details: error.details,
          location: error.location,
          severity: error.severity,
          suggestions: error.suggestions
        })),
        warnings: result.warnings.map(warning => ({
          id: warning.warningId,
          code: warning.warningCode,
          type: warning.warningType,
          message: warning.message,
          details: warning.details,
          location: warning.location,
          severity: warning.severity,
          suggestions: warning.suggestions
        })),
        metadata: result.metadata
      })),
      recommendations: this.generateRecommendations(summary)
    };

    return JSON.stringify(report, null, 2);
  }

  /**
   * 生成HTML格式报告
   */
  generateHtmlReport(results: ValidationResult[]): string {
    const summary = this.generateSummary(results);
    
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MPLP Schema Validation Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .summary-card { background: #f8f9fa; padding: 15px; border-radius: 6px; text-align: center; }
        .summary-card h3 { margin: 0 0 10px 0; color: #333; }
        .summary-card .value { font-size: 24px; font-weight: bold; color: #007bff; }
        .result { margin-bottom: 20px; border: 1px solid #ddd; border-radius: 6px; overflow: hidden; }
        .result-header { background: #f8f9fa; padding: 15px; border-bottom: 1px solid #ddd; }
        .result-header.valid { background: #d4edda; }
        .result-header.invalid { background: #f8d7da; }
        .result-body { padding: 15px; }
        .error { background: #f8d7da; border-left: 4px solid #dc3545; padding: 10px; margin: 10px 0; }
        .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 10px; margin: 10px 0; }
        .code { font-family: monospace; background: #f1f1f1; padding: 2px 4px; border-radius: 3px; }
        .recommendations { background: #e7f3ff; border: 1px solid #b3d9ff; border-radius: 6px; padding: 20px; margin-top: 30px; }
        .status-valid { color: #28a745; font-weight: bold; }
        .status-invalid { color: #dc3545; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>MPLP Schema Validation Report</h1>
            <p>Generated: ${new Date().toISOString()}</p>
            <p>Report Version: ${this.reportVersion}</p>
        </div>

        <div class="summary">
            <div class="summary-card">
                <h3>Total Schemas</h3>
                <div class="value">${summary.totalSchemas}</div>
            </div>
            <div class="summary-card">
                <h3>Valid Schemas</h3>
                <div class="value" style="color: #28a745;">${summary.validSchemas}</div>
            </div>
            <div class="summary-card">
                <h3>Invalid Schemas</h3>
                <div class="value" style="color: #dc3545;">${summary.invalidSchemas}</div>
            </div>
            <div class="summary-card">
                <h3>Total Errors</h3>
                <div class="value" style="color: #dc3545;">${summary.totalErrors}</div>
            </div>
            <div class="summary-card">
                <h3>Total Warnings</h3>
                <div class="value" style="color: #ffc107;">${summary.totalWarnings}</div>
            </div>
            <div class="summary-card">
                <h3>Execution Time</h3>
                <div class="value">${summary.executionTimeMs}ms</div>
            </div>
        </div>

        <h2>Detailed Results</h2>
        ${results.map((result, index) => this.generateHtmlResultSection(result, index + 1)).join('')}

        ${this.generateHtmlRecommendations(summary)}
    </div>
</body>
</html>`;

    return html;
  }

  /**
   * 生成JUnit格式报告
   */
  generateJunitReport(results: ValidationResult[]): string {
    const summary = this.generateSummary(results);
    
    const testSuites = results.map((result, index) => {
      const schemaName = this.extractSchemaName(result);
      const testCases: string[] = [];
      
      // 为每个错误创建一个失败的测试用例
      for (const error of result.errors) {
        testCases.push(`
        <testcase name="${error.errorCode}" classname="${schemaName}" time="${result.metadata.validationDurationMs / 1000}">
            <failure message="${this.escapeXml(error.message)}" type="${error.errorType}">
                ${this.escapeXml(error.details)}
                Location: ${this.escapeXml(error.location.jsonPath || 'root')}
            </failure>
        </testcase>`);
      }
      
      // 为每个警告创建一个跳过的测试用例
      for (const warning of result.warnings) {
        testCases.push(`
        <testcase name="${warning.warningCode}" classname="${schemaName}" time="0">
            <skipped message="${this.escapeXml(warning.message)}" />
        </testcase>`);
      }
      
      // 如果没有错误或警告，创建一个成功的测试用例
      if (result.errors.length === 0 && result.warnings.length === 0) {
        testCases.push(`
        <testcase name="schema-validation" classname="${schemaName}" time="${result.metadata.validationDurationMs / 1000}" />`);
      }
      
      return `
    <testsuite name="${schemaName}" tests="${Math.max(1, result.errors.length + result.warnings.length)}" 
               failures="${result.errors.length}" errors="0" skipped="${result.warnings.length}" 
               time="${result.metadata.validationDurationMs / 1000}">
        ${testCases.join('')}
    </testsuite>`;
    });

    return `<?xml version="1.0" encoding="UTF-8"?>
<testsuites name="MPLP Schema Validation" tests="${summary.totalSchemas}" 
            failures="${summary.totalErrors}" errors="0" skipped="${summary.totalWarnings}" 
            time="${summary.executionTimeMs / 1000}">
    ${testSuites.join('')}
</testsuites>`;
  }

  /**
   * 生成摘要信息
   */
  private generateSummary(results: ValidationResult[]): ValidationSummary {
    const totalSchemas = results.length;
    const validSchemas = results.filter(r => r.isValid).length;
    const invalidSchemas = totalSchemas - validSchemas;
    const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);
    const totalWarnings = results.reduce((sum, r) => sum + r.warnings.length, 0);
    const criticalErrors = results.reduce((sum, r) => 
      sum + r.errors.filter(e => e.severity === 'critical').length, 0);
    const executionTimeMs = results.reduce((sum, r) => sum + r.metadata.validationDurationMs, 0);

    return {
      totalSchemas,
      validSchemas,
      invalidSchemas,
      totalErrors,
      totalWarnings,
      criticalErrors,
      executionTimeMs
    };
  }

  /**
   * 提取Schema名称
   */
  private extractSchemaName(result: ValidationResult): string {
    // 尝试从错误或警告中提取Schema名称
    if (result.errors.length > 0) {
      return result.errors[0].location.schemaFile;
    }
    if (result.warnings.length > 0) {
      return result.warnings[0].location.schemaFile;
    }
    return 'unknown-schema';
  }

  /**
   * 生成建议
   */
  private generateRecommendations(summary: ValidationSummary): string[] {
    const recommendations: string[] = [];

    if (summary.criticalErrors > 0) {
      recommendations.push('Fix critical errors immediately - these prevent schema usage');
    }

    if (summary.totalErrors > 0) {
      recommendations.push('Address all errors before deploying schemas');
    }

    if (summary.totalWarnings > 0) {
      recommendations.push('Review warnings to improve schema quality');
      recommendations.push('Consider following MPLP best practices');
    }

    if (summary.invalidSchemas > 0) {
      recommendations.push('Focus on fixing invalid schemas first');
    }

    recommendations.push('Run validation again after making changes');

    return recommendations;
  }

  /**
   * 生成HTML结果部分
   */
  private generateHtmlResultSection(result: ValidationResult, index: number): string {
    const schemaName = this.extractSchemaName(result);
    const statusClass = result.isValid ? 'valid' : 'invalid';
    const statusText = result.isValid ? 'VALID' : 'INVALID';
    const statusColor = result.isValid ? 'status-valid' : 'status-invalid';

    const errorsHtml = result.errors.map(error => `
        <div class="error">
            <strong>[${error.errorCode}]</strong> ${this.escapeHtml(error.message)}<br>
            <small>Location: ${this.escapeHtml(error.location.jsonPath || 'root')}</small><br>
            <small>Details: ${this.escapeHtml(error.details)}</small>
        </div>
    `).join('');

    const warningsHtml = result.warnings.map(warning => `
        <div class="warning">
            <strong>[${warning.warningCode}]</strong> ${this.escapeHtml(warning.message)}<br>
            <small>Location: ${this.escapeHtml(warning.location.jsonPath || 'root')}</small>
        </div>
    `).join('');

    return `
        <div class="result">
            <div class="result-header ${statusClass}">
                <h3>${index}. ${schemaName} - <span class="${statusColor}">${statusText}</span></h3>
                <p>Errors: ${result.errors.length} | Warnings: ${result.warnings.length} | Duration: ${result.metadata.validationDurationMs}ms</p>
            </div>
            <div class="result-body">
                ${errorsHtml}
                ${warningsHtml}
            </div>
        </div>
    `;
  }

  /**
   * 生成HTML建议部分
   */
  private generateHtmlRecommendations(summary: ValidationSummary): string {
    if (summary.totalErrors === 0 && summary.totalWarnings === 0) {
      return `
        <div class="recommendations">
            <h2>🎉 All schemas are valid!</h2>
            <p>No errors or warnings found. Your schemas are ready for use.</p>
        </div>
      `;
    }

    const recommendations = this.generateRecommendations(summary);
    const recommendationsHtml = recommendations.map(rec => `<li>${rec}</li>`).join('');

    return `
        <div class="recommendations">
            <h2>Recommendations</h2>
            <ul>
                ${recommendationsHtml}
            </ul>
        </div>
    `;
  }

  /**
   * 转义XML特殊字符
   */
  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * 转义HTML特殊字符
   */
  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * 生成企业级功能统计
   */
  private generateEnterpriseStatistics(results: ValidationResult[]): {
    compliantSchemas: number;
    complianceRate: number;
    missingFeatures: number;
    incompleteFeatures: number;
    specializationIssues: number;
  } {
    let compliantSchemas = 0;
    let missingFeatures = 0;
    let incompleteFeatures = 0;
    let specializationIssues = 0;

    for (const result of results) {
      let hasEnterpriseIssues = false;

      // 检查企业级功能相关错误和警告
      for (const error of result.errors) {
        if (error.errorType === 'enterprise') {
          hasEnterpriseIssues = true;
          if (error.errorCode === 'MISSING_ENTERPRISE_FEATURE') {
            missingFeatures++;
          } else if (error.errorCode === 'INCOMPLETE_ENTERPRISE_FEATURE') {
            incompleteFeatures++;
          }
        }
      }

      for (const warning of result.warnings) {
        if (warning.warningType === 'specialization') {
          specializationIssues++;
        } else if (warning.warningType === 'enterprise') {
          hasEnterpriseIssues = true;
          incompleteFeatures++;
        }
      }

      if (!hasEnterpriseIssues) {
        compliantSchemas++;
      }
    }

    return {
      compliantSchemas,
      complianceRate: results.length > 0 ? (compliantSchemas / results.length) * 100 : 100,
      missingFeatures,
      incompleteFeatures,
      specializationIssues
    };
  }

  /**
   * 生成命名约定统计
   */
  private generateNamingStatistics(results: ValidationResult[]): {
    compliantSchemas: number;
    complianceRate: number;
    violations: number;
  } {
    let compliantSchemas = 0;
    let violations = 0;

    for (const result of results) {
      let hasNamingIssues = false;

      // 检查命名约定相关错误和警告
      for (const error of result.errors) {
        if (error.errorType === 'naming') {
          hasNamingIssues = true;
          violations++;
        }
      }

      for (const warning of result.warnings) {
        if (warning.warningCode === 'NAMING_CONVENTION_VIOLATION') {
          hasNamingIssues = true;
          violations++;
        }
      }

      if (!hasNamingIssues) {
        compliantSchemas++;
      }
    }

    return {
      compliantSchemas,
      complianceRate: results.length > 0 ? (compliantSchemas / results.length) * 100 : 100,
      violations
    };
  }
}
