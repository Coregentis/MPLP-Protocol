/**
 * MPLP Schema版本审计工具
 * 
 * 分析所有Schema文件的版本一致性，建立版本基线
 * 严格遵循Schema驱动开发规则
 */

const fs = require('fs');
const path = require('path');

class SchemaVersionAuditor {
  constructor() {
    this.schemasDir = path.join(__dirname, '../src/schemas');
    this.schemaFiles = [
      'context-protocol.json',
      'plan-protocol.json', 
      'confirm-protocol.json',
      'trace-protocol.json',
      'role-protocol.json',
      'extension-protocol.json'
    ];
    this.versionReport = {
      timestamp: new Date().toISOString(),
      schemas: {},
      conflicts: [],
      recommendations: []
    };
  }

  /**
   * 执行完整的版本审计
   */
  async audit() {
    console.log('🔍 开始Schema版本审计...\n');
    
    // 1. 分析每个Schema文件
    for (const file of this.schemaFiles) {
      await this.analyzeSchema(file);
    }
    
    // 2. 检测版本冲突
    this.detectVersionConflicts();
    
    // 3. 生成建议
    this.generateRecommendations();
    
    // 4. 输出报告
    this.printReport();
    
    // 5. 保存审计报告
    await this.saveReport();
    
    return this.versionReport;
  }

  /**
   * 分析单个Schema文件
   */
  async analyzeSchema(filename) {
    try {
      const filePath = path.join(this.schemasDir, filename);
      const content = fs.readFileSync(filePath, 'utf8');
      const schema = JSON.parse(content);
      
      const moduleName = filename.replace('-protocol.json', '');
      
      this.versionReport.schemas[moduleName] = {
        filename,
        version: this.extractVersion(schema),
        protocolVersion: schema.properties?.protocol_version?.const || schema.properties?.protocol_version?.pattern,
        schemaId: schema.$id,
        title: schema.title,
        lastModified: fs.statSync(filePath).mtime.toISOString(),
        requiredFields: schema.required || [],
        fieldCount: Object.keys(schema.properties || {}).length,
        enumFields: this.extractEnumFields(schema)
      };
      
      console.log(`✅ 分析完成: ${moduleName}`);
    } catch (error) {
      console.error(`❌ 分析失败: ${filename}`, error.message);
      this.versionReport.schemas[filename] = {
        error: error.message,
        status: 'FAILED'
      };
    }
  }

  /**
   * 提取Schema版本信息
   */
  extractVersion(schema) {
    return {
      schema: schema.version || 'N/A',
      protocol: schema.properties?.protocol_version?.const || 
                schema.properties?.protocol_version?.pattern || 'N/A',
      schemaSpec: schema.$schema || 'N/A'
    };
  }

  /**
   * 提取枚举字段
   */
  extractEnumFields(schema, prefix = '') {
    const enums = {};
    
    if (schema.properties) {
      for (const [key, value] of Object.entries(schema.properties)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        
        if (value.enum) {
          enums[fullKey] = value.enum;
        }
        
        if (value.properties) {
          Object.assign(enums, this.extractEnumFields(value, fullKey));
        }
        
        if (value.items && value.items.properties) {
          Object.assign(enums, this.extractEnumFields(value.items, `${fullKey}[]`));
        }
      }
    }
    
    if (schema.$defs) {
      for (const [key, value] of Object.entries(schema.$defs)) {
        Object.assign(enums, this.extractEnumFields(value, `$defs.${key}`));
      }
    }
    
    return enums;
  }

  /**
   * 检测版本冲突
   */
  detectVersionConflicts() {
    const versions = {};
    const protocolVersions = {};
    
    // 收集所有版本
    for (const [module, info] of Object.entries(this.versionReport.schemas)) {
      if (info.error) continue;
      
      const schemaVer = info.version.schema;
      const protocolVer = info.version.protocol;
      
      if (!versions[schemaVer]) versions[schemaVer] = [];
      if (!protocolVersions[protocolVer]) protocolVersions[protocolVer] = [];
      
      versions[schemaVer].push(module);
      protocolVersions[protocolVer].push(module);
    }
    
    // 检测冲突
    if (Object.keys(versions).length > 1) {
      this.versionReport.conflicts.push({
        type: 'SCHEMA_VERSION_MISMATCH',
        description: 'Schema版本不一致',
        details: versions
      });
    }
    
    if (Object.keys(protocolVersions).length > 1) {
      this.versionReport.conflicts.push({
        type: 'PROTOCOL_VERSION_MISMATCH', 
        description: '协议版本不一致',
        details: protocolVersions
      });
    }
  }

  /**
   * 生成版本统一建议
   */
  generateRecommendations() {
    const schemas = this.versionReport.schemas;
    const validSchemas = Object.entries(schemas).filter(([_, info]) => !info.error);
    
    if (this.versionReport.conflicts.length > 0) {
      this.versionReport.recommendations.push({
        priority: 'HIGH',
        action: 'UNIFY_VERSIONS',
        description: '统一所有Schema版本号',
        details: {
          recommendedVersion: '1.0.1',
          affectedSchemas: validSchemas.map(([name]) => name)
        }
      });
    }
    
    // 检查协议版本一致性
    const protocolVersions = validSchemas.map(([_, info]) => info.version.protocol);
    const uniqueProtocolVersions = [...new Set(protocolVersions)];
    
    if (uniqueProtocolVersions.length > 1) {
      this.versionReport.recommendations.push({
        priority: 'CRITICAL',
        action: 'FREEZE_PROTOCOL_VERSION',
        description: '冻结协议版本，防止开发期间变更',
        details: {
          recommendedProtocolVersion: '1.0.1',
          currentVersions: uniqueProtocolVersions
        }
      });
    }
    
    // Schema治理建议
    this.versionReport.recommendations.push({
      priority: 'MEDIUM',
      action: 'IMPLEMENT_VERSION_GOVERNANCE',
      description: '实施Schema版本治理机制',
      details: {
        actions: [
          '建立Schema版本锁定机制',
          '实施版本变更审批流程',
          '添加自动化版本检查',
          '建立版本兼容性测试'
        ]
      }
    });
  }

  /**
   * 打印审计报告
   */
  printReport() {
    console.log('\n📊 Schema版本审计报告');
    console.log('='.repeat(60));
    
    // 版本概览
    console.log('\n📋 版本概览:');
    for (const [module, info] of Object.entries(this.versionReport.schemas)) {
      if (info.error) {
        console.log(`❌ ${module}: 错误 - ${info.error}`);
      } else {
        console.log(`✅ ${module}: Schema v${info.version.schema}, Protocol v${info.version.protocol}`);
      }
    }
    
    // 冲突报告
    if (this.versionReport.conflicts.length > 0) {
      console.log('\n⚠️  版本冲突:');
      this.versionReport.conflicts.forEach((conflict, i) => {
        console.log(`${i + 1}. ${conflict.description}`);
        console.log(`   类型: ${conflict.type}`);
        console.log(`   详情: ${JSON.stringify(conflict.details, null, 2)}`);
      });
    } else {
      console.log('\n✅ 未发现版本冲突');
    }
    
    // 建议
    if (this.versionReport.recommendations.length > 0) {
      console.log('\n💡 建议:');
      this.versionReport.recommendations.forEach((rec, i) => {
        console.log(`${i + 1}. [${rec.priority}] ${rec.description}`);
        console.log(`   操作: ${rec.action}`);
        if (rec.details) {
          console.log(`   详情: ${JSON.stringify(rec.details, null, 2)}`);
        }
      });
    }
    
    console.log('\n='.repeat(60));
  }

  /**
   * 保存审计报告
   */
  async saveReport() {
    const reportPath = path.join(__dirname, '../docs/schema-version-audit-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.versionReport, null, 2));
    console.log(`📄 审计报告已保存: ${reportPath}`);
  }
}

// 执行审计
if (require.main === module) {
  const auditor = new SchemaVersionAuditor();
  auditor.audit()
    .then(() => {
      console.log('\n🎉 Schema版本审计完成!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ 审计失败:', error);
      process.exit(1);
    });
}

module.exports = SchemaVersionAuditor; 