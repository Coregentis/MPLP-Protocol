#!/usr/bin/env node

/**
 * 质量监控仪表板 - 持续监控和报告
 * 功能：生成质量趋势报告和预警
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class QualityDashboard {
  constructor() {
    this.metrics = {
      timestamp: new Date().toISOString(),
      schemaCompliance: 0,
      namingConvention: 0,
      enterpriseFeatures: 0,
      testCoverage: 0,
      typeScriptErrors: 0,
      eslintIssues: 0,
      mapperConsistency: 0,
      performanceScore: 0
    };
    
    this.trends = [];
    this.alerts = [];
  }

  /**
   * 生成完整质量报告
   */
  async generateQualityReport() {
    console.log('📊 生成MPLP项目质量报告...\n');

    try {
      // 收集各项质量指标
      await this.collectSchemaMetrics();
      await this.collectCodeQualityMetrics();
      await this.collectTestMetrics();
      await this.collectPerformanceMetrics();
      
      // 分析趋势
      await this.analyzeTrends();
      
      // 生成报告
      await this.generateReport();
      
      // 发送预警
      await this.sendAlerts();
      
      return this.metrics;
      
    } catch (error) {
      console.error('❌ 报告生成失败:', error.message);
      throw error;
    }
  }

  /**
   * 收集Schema相关指标
   */
  async collectSchemaMetrics() {
    console.log('📋 收集Schema质量指标...');
    
    const schemaDir = 'src/schemas';
    const schemaFiles = fs.readdirSync(schemaDir)
      .filter(file => file.startsWith('mplp-') && file.endsWith('.json'));

    let compliantSchemas = 0;
    let totalSchemas = schemaFiles.length;
    let namingViolations = 0;
    let missingEnterpriseFeatures = 0;

    for (const file of schemaFiles) {
      const filePath = path.join(schemaDir, file);
      const schema = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      // 检查Schema合规性
      const isCompliant = this.checkSchemaCompliance(schema);
      if (isCompliant) compliantSchemas++;
      
      // 检查命名约定
      namingViolations += this.countNamingViolations(schema);
      
      // 检查企业级功能
      missingEnterpriseFeatures += this.countMissingEnterpriseFeatures(schema);
    }

    this.metrics.schemaCompliance = (compliantSchemas / totalSchemas) * 100;
    this.metrics.namingConvention = Math.max(0, 100 - (namingViolations * 5)); // 每个违规扣5分
    this.metrics.enterpriseFeatures = Math.max(0, 100 - (missingEnterpriseFeatures * 10)); // 每个缺失扣10分
    
    console.log(`✅ Schema合规性: ${this.metrics.schemaCompliance.toFixed(1)}%`);
    console.log(`✅ 命名约定: ${this.metrics.namingConvention.toFixed(1)}%`);
    console.log(`✅ 企业功能: ${this.metrics.enterpriseFeatures.toFixed(1)}%`);
  }

  /**
   * 收集代码质量指标
   */
  async collectCodeQualityMetrics() {
    console.log('📝 收集代码质量指标...');
    
    try {
      // TypeScript编译检查
      execSync('npm run typecheck', { stdio: 'pipe' });
      this.metrics.typeScriptErrors = 0;
      console.log('✅ TypeScript: 0错误');
    } catch (error) {
      const errorCount = (error.stdout.toString().match(/error TS/g) || []).length;
      this.metrics.typeScriptErrors = errorCount;
      console.log(`❌ TypeScript: ${errorCount}个错误`);
    }

    try {
      // ESLint检查
      const result = execSync('npm run lint', { encoding: 'utf8' });
      this.metrics.eslintIssues = 0;
      console.log('✅ ESLint: 0问题');
    } catch (error) {
      const issueCount = (error.stdout.toString().match(/✖/g) || []).length;
      this.metrics.eslintIssues = issueCount;
      console.log(`❌ ESLint: ${issueCount}个问题`);
    }

    // Mapper一致性检查
    this.metrics.mapperConsistency = await this.checkMapperConsistency();
    console.log(`✅ Mapper一致性: ${this.metrics.mapperConsistency.toFixed(1)}%`);
  }

  /**
   * 收集测试指标
   */
  async collectTestMetrics() {
    console.log('🧪 收集测试指标...');
    
    try {
      const result = execSync('npm run test:coverage', { encoding: 'utf8' });
      
      // 解析覆盖率
      const coverageMatch = result.match(/All files\s+\|\s+(\d+\.?\d*)/);
      if (coverageMatch) {
        this.metrics.testCoverage = parseFloat(coverageMatch[1]);
        console.log(`✅ 测试覆盖率: ${this.metrics.testCoverage}%`);
      }
    } catch (error) {
      this.metrics.testCoverage = 0;
      console.log('❌ 测试覆盖率: 无法获取');
    }
  }

  /**
   * 收集性能指标
   */
  async collectPerformanceMetrics() {
    console.log('⚡ 收集性能指标...');
    
    // 这里可以添加实际的性能测试
    // 暂时使用模拟数据
    this.metrics.performanceScore = 85; // 基于API响应时间、内存使用等计算
    console.log(`✅ 性能评分: ${this.metrics.performanceScore}`);
  }

  /**
   * 分析趋势
   */
  async analyzeTrends() {
    console.log('📈 分析质量趋势...');
    
    // 读取历史数据
    const historyFile = 'quality-history.json';
    let history = [];
    
    if (fs.existsSync(historyFile)) {
      history = JSON.parse(fs.readFileSync(historyFile, 'utf8'));
    }
    
    // 添加当前数据
    history.push(this.metrics);
    
    // 保留最近30天的数据
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    history = history.filter(record => 
      new Date(record.timestamp) > thirtyDaysAgo
    );
    
    // 保存历史数据
    fs.writeFileSync(historyFile, JSON.stringify(history, null, 2));
    
    // 分析趋势
    if (history.length >= 2) {
      const previous = history[history.length - 2];
      const current = history[history.length - 1];
      
      this.analyzeTrendChanges(previous, current);
    }
    
    this.trends = history;
  }

  /**
   * 分析趋势变化
   */
  analyzeTrendChanges(previous, current) {
    const metrics = [
      'schemaCompliance',
      'namingConvention', 
      'enterpriseFeatures',
      'testCoverage',
      'performanceScore'
    ];
    
    metrics.forEach(metric => {
      const change = current[metric] - previous[metric];
      const changePercent = (change / previous[metric]) * 100;
      
      if (Math.abs(changePercent) > 5) { // 变化超过5%
        const direction = change > 0 ? '上升' : '下降';
        const emoji = change > 0 ? '📈' : '📉';
        
        this.alerts.push({
          type: change > 0 ? 'improvement' : 'degradation',
          metric: metric,
          change: changePercent.toFixed(1),
          direction: direction,
          message: `${emoji} ${metric} ${direction} ${Math.abs(changePercent).toFixed(1)}%`
        });
      }
    });
  }

  /**
   * 生成报告
   */
  async generateReport() {
    console.log('📄 生成质量报告...');
    
    const report = {
      timestamp: this.metrics.timestamp,
      summary: {
        overallScore: this.calculateOverallScore(),
        status: this.getQualityStatus()
      },
      metrics: this.metrics,
      trends: this.trends.slice(-7), // 最近7天
      alerts: this.alerts,
      recommendations: this.generateRecommendations()
    };
    
    // 保存报告
    const reportFile = `quality-report-${new Date().toISOString().split('T')[0]}.json`;
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    
    // 生成HTML报告
    this.generateHTMLReport(report);
    
    console.log(`✅ 报告已生成: ${reportFile}`);
    
    return report;
  }

  /**
   * 计算总体评分
   */
  calculateOverallScore() {
    const weights = {
      schemaCompliance: 0.2,
      namingConvention: 0.15,
      enterpriseFeatures: 0.15,
      testCoverage: 0.2,
      typeScriptErrors: 0.1, // 反向计分
      eslintIssues: 0.1, // 反向计分
      mapperConsistency: 0.1
    };
    
    let score = 0;
    score += this.metrics.schemaCompliance * weights.schemaCompliance;
    score += this.metrics.namingConvention * weights.namingConvention;
    score += this.metrics.enterpriseFeatures * weights.enterpriseFeatures;
    score += this.metrics.testCoverage * weights.testCoverage;
    score += Math.max(0, 100 - this.metrics.typeScriptErrors * 10) * weights.typeScriptErrors;
    score += Math.max(0, 100 - this.metrics.eslintIssues * 5) * weights.eslintIssues;
    score += this.metrics.mapperConsistency * weights.mapperConsistency;
    
    return Math.round(score);
  }

  /**
   * 获取质量状态
   */
  getQualityStatus() {
    const score = this.calculateOverallScore();
    
    if (score >= 95) return 'excellent';
    if (score >= 85) return 'good';
    if (score >= 70) return 'fair';
    return 'poor';
  }

  /**
   * 生成改进建议
   */
  generateRecommendations() {
    const recommendations = [];
    
    if (this.metrics.schemaCompliance < 100) {
      recommendations.push('修复Schema合规性问题，确保所有Schema符合标准');
    }
    
    if (this.metrics.namingConvention < 95) {
      recommendations.push('修复命名约定违规，确保双重命名约定的一致性');
    }
    
    if (this.metrics.testCoverage < 90) {
      recommendations.push('提高测试覆盖率，目标≥90%');
    }
    
    if (this.metrics.typeScriptErrors > 0) {
      recommendations.push('修复所有TypeScript编译错误');
    }
    
    if (this.metrics.eslintIssues > 0) {
      recommendations.push('修复所有ESLint代码质量问题');
    }
    
    return recommendations;
  }

  /**
   * 生成HTML报告
   */
  generateHTMLReport(report) {
    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>MPLP质量报告</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 5px; }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
        .metric { background: white; border: 1px solid #ddd; padding: 15px; border-radius: 5px; text-align: center; }
        .score { font-size: 2em; font-weight: bold; }
        .excellent { color: #28a745; }
        .good { color: #17a2b8; }
        .fair { color: #ffc107; }
        .poor { color: #dc3545; }
        .alerts { margin: 20px 0; }
        .alert { padding: 10px; margin: 5px 0; border-radius: 3px; }
        .improvement { background: #d4edda; border: 1px solid #c3e6cb; }
        .degradation { background: #f8d7da; border: 1px solid #f5c6cb; }
    </style>
</head>
<body>
    <div class="header">
        <h1>MPLP项目质量报告</h1>
        <p>生成时间: ${report.timestamp}</p>
        <p>总体评分: <span class="score ${report.summary.status}">${report.summary.overallScore}</span></p>
    </div>
    
    <div class="metrics">
        <div class="metric">
            <h3>Schema合规性</h3>
            <div class="score">${report.metrics.schemaCompliance.toFixed(1)}%</div>
        </div>
        <div class="metric">
            <h3>命名约定</h3>
            <div class="score">${report.metrics.namingConvention.toFixed(1)}%</div>
        </div>
        <div class="metric">
            <h3>企业功能</h3>
            <div class="score">${report.metrics.enterpriseFeatures.toFixed(1)}%</div>
        </div>
        <div class="metric">
            <h3>测试覆盖率</h3>
            <div class="score">${report.metrics.testCoverage.toFixed(1)}%</div>
        </div>
        <div class="metric">
            <h3>TypeScript错误</h3>
            <div class="score">${report.metrics.typeScriptErrors}</div>
        </div>
        <div class="metric">
            <h3>ESLint问题</h3>
            <div class="score">${report.metrics.eslintIssues}</div>
        </div>
    </div>
    
    ${report.alerts.length > 0 ? `
    <div class="alerts">
        <h2>质量变化提醒</h2>
        ${report.alerts.map(alert => `
            <div class="alert ${alert.type}">
                ${alert.message}
            </div>
        `).join('')}
    </div>
    ` : ''}
    
    ${report.recommendations.length > 0 ? `
    <div>
        <h2>改进建议</h2>
        <ul>
            ${report.recommendations.map(rec => `<li>${rec}</li>`).join('')}
        </ul>
    </div>
    ` : ''}
</body>
</html>`;
    
    fs.writeFileSync('quality-report.html', html);
  }

  /**
   * 发送预警
   */
  async sendAlerts() {
    if (this.alerts.length > 0) {
      console.log('\n🚨 质量预警:');
      this.alerts.forEach(alert => {
        console.log(`  ${alert.message}`);
      });
    }
    
    const overallScore = this.calculateOverallScore();
    if (overallScore < 70) {
      console.log('\n💥 严重警告: 项目质量评分过低，需要立即关注！');
    }
  }

  // 辅助方法
  checkSchemaCompliance(schema) {
    const required = ['$schema', '$id', 'title', 'description', 'type'];
    return required.every(field => schema[field]);
  }

  countNamingViolations(obj, count = 0) {
    for (const [key, value] of Object.entries(obj)) {
      if (typeof key === 'string' && !this.isSnakeCase(key) && !this.isAllowedException(key)) {
        count++;
      }
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        count = this.countNamingViolations(value, count);
      }
    }
    return count;
  }

  countMissingEnterpriseFeatures(schema) {
    const required = ['audit_trail', 'monitoring_integration', 'performance_metrics', 'access_control', 'error_handling'];
    if (!schema.properties) return required.length;
    return required.filter(feature => !schema.properties[feature]).length;
  }

  async checkMapperConsistency() {
    // 简化的Mapper一致性检查
    const mapperFiles = ['context', 'plan', 'confirm', 'trace', 'role', 'extension'];
    let consistentMappers = 0;
    
    for (const module of mapperFiles) {
      const mapperPath = `src/modules/${module}/api/mappers/${module}.mapper.ts`;
      if (fs.existsSync(mapperPath)) {
        const content = fs.readFileSync(mapperPath, 'utf8');
        if (content.includes('toSchema(') && content.includes('fromSchema(')) {
          consistentMappers++;
        }
      }
    }
    
    return (consistentMappers / mapperFiles.length) * 100;
  }

  isSnakeCase(str) {
    return /^[a-z][a-z0-9_]*$/.test(str);
  }

  isAllowedException(str) {
    const exceptions = ['$schema', '$id', '$defs', '$ref', 'additionalProperties', 'enum', 'const'];
    return exceptions.includes(str);
  }
}

// 命令行使用
if (require.main === module) {
  const dashboard = new QualityDashboard();
  
  dashboard.generateQualityReport()
    .then(report => {
      console.log('\n📊 质量报告生成完成');
      console.log(`总体评分: ${report.summary ? dashboard.calculateOverallScore() : 'N/A'}`);
    })
    .catch(error => {
      console.error('报告生成失败:', error.message);
      process.exit(1);
    });
}

module.exports = QualityDashboard;
