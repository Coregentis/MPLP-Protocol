#!/usr/bin/env node
/**
 * 协议合规性验证脚本
 * 验证MPLP协议的完整合规性
 * 
 * @version 1.0.0
 * @created 2025-08-15
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 日志函数
function log(message, level = 'INFO') {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${level}] ${message}`);
}

// 协议合规性验证器
class ProtocolComplianceValidator {
  constructor(module = 'context') {
    this.module = module;
    this.complianceResults = [];
    this.violations = [];
    this.warnings = [];
  }

  // 验证Schema合规性
  async validateSchemaCompliance() {
    log('📋 验证Schema合规性...');
    
    try {
      const schemaPath = `src/schemas/mplp-${this.module}.json`;
      if (!fs.existsSync(schemaPath)) {
        this.violations.push(`Schema文件不存在: ${schemaPath}`);
        return;
      }

      const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
      
      // 验证Schema版本
      if (schema.$schema !== 'http://json-schema.org/draft-07/schema#') {
        this.violations.push(`Schema版本不符合要求: ${schema.$schema}`);
      } else {
        this.complianceResults.push('Schema版本合规: JSON Schema Draft-07');
      }

      // 验证必需字段
      const requiredFields = schema.required || [];
      if (requiredFields.length === 0) {
        this.warnings.push('Schema没有定义必需字段');
      } else {
        this.complianceResults.push(`Schema必需字段: ${requiredFields.length}个`);
      }

      // 验证字段命名约定 (snake_case)
      const properties = schema.properties || {};
      const fieldNames = Object.keys(properties);
      const invalidFieldNames = fieldNames.filter(name => 
        !/^[a-z][a-z0-9_]*[a-z0-9]$/.test(name) && name !== name.toLowerCase()
      );

      if (invalidFieldNames.length > 0) {
        this.violations.push(`Schema字段命名不符合snake_case约定: ${invalidFieldNames.join(', ')}`);
      } else {
        this.complianceResults.push(`Schema字段命名合规: ${fieldNames.length}个字段使用snake_case`);
      }

      // 验证枚举值定义
      let enumCount = 0;
      const validateEnums = (obj) => {
        for (const [key, value] of Object.entries(obj)) {
          if (value && typeof value === 'object') {
            if (value.enum) {
              enumCount++;
              if (!Array.isArray(value.enum) || value.enum.length === 0) {
                this.violations.push(`无效的枚举定义: ${key}`);
              }
            }
            if (value.properties) {
              validateEnums(value.properties);
            }
            if (value.items && value.items.properties) {
              validateEnums(value.items.properties);
            }
          }
        }
      };

      validateEnums(properties);
      this.complianceResults.push(`Schema枚举定义: ${enumCount}个枚举字段`);

    } catch (error) {
      this.violations.push(`Schema合规性验证失败: ${error.message}`);
    }
  }

  // 验证双重命名约定合规性
  async validateDualNamingConvention() {
    log('🔄 验证双重命名约定合规性...');
    
    try {
      // 检查Mapper文件
      const mapperPath = `src/modules/${this.module}/api/mappers/${this.module}.mapper.ts`;
      if (!fs.existsSync(mapperPath)) {
        this.violations.push(`Mapper文件不存在: ${mapperPath}`);
        return;
      }

      const mapperContent = fs.readFileSync(mapperPath, 'utf8');
      
      // 验证toSchema方法存在
      if (!mapperContent.includes('toSchema')) {
        this.violations.push('Mapper缺少toSchema方法');
      } else {
        this.complianceResults.push('Mapper包含toSchema方法');
      }

      // 验证fromSchema方法存在
      if (!mapperContent.includes('fromSchema')) {
        this.violations.push('Mapper缺少fromSchema方法');
      } else {
        this.complianceResults.push('Mapper包含fromSchema方法');
      }

      // 验证validateSchema方法存在
      if (!mapperContent.includes('validateSchema')) {
        this.violations.push('Mapper缺少validateSchema方法');
      } else {
        this.complianceResults.push('Mapper包含validateSchema方法');
      }

      // 验证TypeScript接口命名 (camelCase)
      const interfaceMatches = mapperContent.match(/interface\s+\w+/g) || [];
      const camelCaseInterfaces = interfaceMatches.filter(match => {
        const interfaceName = match.split(' ')[1];
        return /^[A-Z][a-zA-Z0-9]*$/.test(interfaceName);
      });

      if (camelCaseInterfaces.length === interfaceMatches.length) {
        this.complianceResults.push(`TypeScript接口命名合规: ${interfaceMatches.length}个接口使用PascalCase`);
      } else {
        this.violations.push('部分TypeScript接口命名不符合PascalCase约定');
      }

    } catch (error) {
      this.violations.push(`双重命名约定验证失败: ${error.message}`);
    }
  }

  // 验证厂商中立性
  async validateVendorNeutrality() {
    log('🌐 验证厂商中立性...');
    
    try {
      const moduleDir = `src/modules/${this.module}`;
      if (!fs.existsSync(moduleDir)) {
        this.violations.push(`模块目录不存在: ${moduleDir}`);
        return;
      }

      // 检查厂商特定代码
      const vendorSpecificPatterns = [
        /aws\./gi,
        /azure\./gi,
        /gcp\./gi,
        /google\./gi,
        /microsoft\./gi,
        /amazon\./gi,
        /openai\./gi,
        /anthropic\./gi
      ];

      const checkVendorSpecific = (filePath) => {
        if (!fs.existsSync(filePath) || !filePath.endsWith('.ts')) return;
        
        const content = fs.readFileSync(filePath, 'utf8');
        const violations = [];
        
        vendorSpecificPatterns.forEach(pattern => {
          const matches = content.match(pattern);
          if (matches) {
            violations.push(`发现厂商特定代码: ${matches[0]} in ${filePath}`);
          }
        });
        
        return violations;
      };

      // 递归检查所有TypeScript文件
      const checkDirectory = (dir) => {
        const files = fs.readdirSync(dir);
        let totalViolations = [];
        
        files.forEach(file => {
          const filePath = path.join(dir, file);
          const stat = fs.statSync(filePath);
          
          if (stat.isDirectory()) {
            totalViolations = totalViolations.concat(checkDirectory(filePath));
          } else if (file.endsWith('.ts')) {
            totalViolations = totalViolations.concat(checkVendorSpecific(filePath));
          }
        });
        
        return totalViolations;
      };

      const vendorViolations = checkDirectory(moduleDir);
      
      if (vendorViolations.length > 0) {
        this.violations = this.violations.concat(vendorViolations);
      } else {
        this.complianceResults.push('厂商中立性验证通过: 未发现厂商特定代码');
      }

      // 验证适配器模式使用
      const adapterPath = `src/modules/${this.module}/infrastructure/adapters`;
      if (fs.existsSync(adapterPath)) {
        this.complianceResults.push('适配器模式实现: 支持厂商中立集成');
      } else {
        this.warnings.push('建议实现适配器模式以增强厂商中立性');
      }

    } catch (error) {
      this.violations.push(`厂商中立性验证失败: ${error.message}`);
    }
  }

  // 验证MPLP协议标准合规性
  async validateMPLPProtocolStandards() {
    log('🏗️ 验证MPLP协议标准合规性...');
    
    try {
      // 验证模块结构合规性
      const requiredDirectories = [
        `src/modules/${this.module}/api`,
        `src/modules/${this.module}/application`,
        `src/modules/${this.module}/domain`,
        `src/modules/${this.module}/infrastructure`
      ];

      const missingDirectories = requiredDirectories.filter(dir => !fs.existsSync(dir));
      if (missingDirectories.length > 0) {
        this.violations.push(`缺少MPLP标准目录: ${missingDirectories.join(', ')}`);
      } else {
        this.complianceResults.push('MPLP模块目录结构合规: DDD分层架构');
      }

      // 验证必需文件
      const requiredFiles = [
        `src/modules/${this.module}/index.ts`,
        `src/modules/${this.module}/module.ts`,
        `src/modules/${this.module}/types.ts`
      ];

      const missingFiles = requiredFiles.filter(file => !fs.existsSync(file));
      if (missingFiles.length > 0) {
        this.violations.push(`缺少MPLP标准文件: ${missingFiles.join(', ')}`);
      } else {
        this.complianceResults.push('MPLP模块文件结构合规: 标准导出和类型定义');
      }

      // 验证协议版本标识
      const indexPath = `src/modules/${this.module}/index.ts`;
      if (fs.existsSync(indexPath)) {
        const indexContent = fs.readFileSync(indexPath, 'utf8');
        if (indexContent.includes('1.0.0') || indexContent.includes('version')) {
          this.complianceResults.push('MPLP协议版本标识: 包含版本信息');
        } else {
          this.warnings.push('建议在模块中添加明确的协议版本标识');
        }
      }

    } catch (error) {
      this.violations.push(`MPLP协议标准验证失败: ${error.message}`);
    }
  }

  // 执行完整合规性验证
  async runValidation() {
    log(`🚀 开始${this.module}模块协议合规性验证`);
    
    await this.validateSchemaCompliance();
    await this.validateDualNamingConvention();
    await this.validateVendorNeutrality();
    await this.validateMPLPProtocolStandards();
    
    // 生成合规性报告
    this.generateComplianceReport();
    
    return {
      compliant: this.violations.length === 0,
      complianceResults: this.complianceResults,
      violations: this.violations,
      warnings: this.warnings
    };
  }

  // 生成合规性报告
  generateComplianceReport() {
    log('\n📊 协议合规性验证报告:');
    log('=' .repeat(60));
    
    if (this.complianceResults.length > 0) {
      log('✅ 合规项目:');
      this.complianceResults.forEach((item, index) => {
        log(`  ${index + 1}. ${item}`);
      });
    }
    
    if (this.warnings.length > 0) {
      log('\n⚠️ 警告:');
      this.warnings.forEach((item, index) => {
        log(`  ${index + 1}. ${item}`);
      });
    }
    
    if (this.violations.length > 0) {
      log('\n❌ 违规项目:');
      this.violations.forEach((item, index) => {
        log(`  ${index + 1}. ${item}`);
      });
    }
    
    log('\n' + '=' .repeat(60));
    
    if (this.violations.length === 0) {
      log('🎉 协议合规性验证通过！符合MPLP协议标准。');
    } else {
      log('💥 协议合规性验证失败！请修复违规项目。');
      process.exit(1);
    }
  }
}

// 主执行函数
async function main() {
  const args = process.argv.slice(2);
  const moduleArg = args.find(arg => arg.startsWith('--module='));
  const module = moduleArg ? moduleArg.split('=')[1] : 'context';
  
  const validator = new ProtocolComplianceValidator(module);
  const result = await validator.runValidation();
  
  // 保存验证结果
  const reportPath = `tests/bdd/${module}/reports/protocol-compliance-report.json`;
  const reportDir = path.dirname(reportPath);
  
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    module: module,
    result: result,
    summary: {
      compliant: result.compliant,
      totalChecks: result.complianceResults.length + result.violations.length + result.warnings.length,
      passedChecks: result.complianceResults.length,
      violationChecks: result.violations.length,
      warningChecks: result.warnings.length,
      complianceRate: (result.complianceResults.length / (result.complianceResults.length + result.violations.length)) * 100
    }
  }, null, 2));
  
  log(`\n📄 合规性报告已保存: ${reportPath}`);
}

// 执行验证
if (require.main === module) {
  main().catch(error => {
    log(`💥 合规性验证异常: ${error.message}`, 'ERROR');
    process.exit(1);
  });
}

module.exports = { ProtocolComplianceValidator };
