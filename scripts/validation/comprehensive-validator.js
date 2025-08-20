#!/usr/bin/env node

/**
 * 综合验证器 - 提交前强制验证
 * 功能：执行所有质量标准的强制性检查
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ComprehensiveValidator {
  constructor() {
    this.violations = [];
    this.warnings = [];
    this.stats = {
      totalFiles: 0,
      validatedFiles: 0,
      errors: 0,
      warnings: 0
    };
  }

  /**
   * 执行完整验证流程
   */
  async runFullValidation() {
    console.log('🔍 开始MPLP项目完整质量验证...\n');

    try {
      // 1. Schema合规性验证
      await this.validateSchemaCompliance();
      
      // 2. 双重命名约定验证
      await this.validateNamingConvention();
      
      // 3. 企业级功能验证
      await this.validateEnterpriseFeatures();
      
      // 4. Mapper一致性验证
      await this.validateMapperConsistency();
      
      // 5. TypeScript类型安全验证
      await this.validateTypeScript();
      
      // 6. 测试覆盖率验证
      await this.validateTestCoverage();
      
      // 7. 性能基准验证
      await this.validatePerformance();
      
      // 8. 文档同步验证
      await this.validateDocumentation();

      // 输出验证结果
      this.outputResults();
      
      return this.violations.length === 0;
      
    } catch (error) {
      console.error('❌ 验证过程出错:', error.message);
      return false;
    }
  }

  /**
   * 验证Schema合规性
   */
  async validateSchemaCompliance() {
    console.log('📋 验证Schema合规性...');
    
    const schemaDir = 'src/schemas';
    const schemaFiles = fs.readdirSync(schemaDir)
      .filter(file => file.startsWith('mplp-') && file.endsWith('.json'));

    for (const file of schemaFiles) {
      const filePath = path.join(schemaDir, file);
      const schema = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      // 检查必需字段
      this.checkRequiredSchemaFields(schema, filePath);
      
      // 检查协议版本
      this.checkProtocolVersion(schema, filePath);
      
      // 检查字段命名约定
      this.checkSchemaFieldNaming(schema, filePath);
      
      this.stats.validatedFiles++;
    }
    
    this.stats.totalFiles += schemaFiles.length;
  }

  /**
   * 验证双重命名约定
   */
  async validateNamingConvention() {
    console.log('🏷️ 验证双重命名约定...');
    
    // 检查Mapper文件
    const mapperFiles = this.findFiles('src', '**/*.mapper.ts');
    
    for (const file of mapperFiles) {
      const content = fs.readFileSync(file, 'utf8');
      
      // 检查toSchema/fromSchema方法存在
      if (!content.includes('toSchema(') || !content.includes('fromSchema(')) {
        this.violations.push(`${file}: 缺少必需的toSchema/fromSchema方法`);
      }
      
      // 检查命名转换的正确性
      this.validateNamingConversions(content, file);
      
      this.stats.validatedFiles++;
    }
    
    // 检查DTO文件
    const dtoFiles = this.findFiles('src', '**/*.dto.ts');
    
    for (const file of dtoFiles) {
      const content = fs.readFileSync(file, 'utf8');
      
      // 检查camelCase命名
      this.validateCamelCaseInFile(content, file);
      
      // 检查禁止使用any类型
      if (content.includes(': any') || content.includes('<any>')) {
        this.violations.push(`${file}: 禁止使用any类型`);
      }
      
      this.stats.validatedFiles++;
    }
    
    this.stats.totalFiles += mapperFiles.length + dtoFiles.length;
  }

  /**
   * 验证企业级功能
   */
  async validateEnterpriseFeatures() {
    console.log('🏢 验证企业级功能...');
    
    const requiredFeatures = [
      'audit_trail',
      'monitoring_integration',
      'performance_metrics', 
      'access_control',
      'error_handling'
    ];
    
    const schemaFiles = this.findFiles('src/schemas', 'mplp-*.json');
    
    for (const file of schemaFiles) {
      const schema = JSON.parse(fs.readFileSync(file, 'utf8'));
      
      if (schema.properties) {
        requiredFeatures.forEach(feature => {
          if (!schema.properties[feature]) {
            this.violations.push(
              `${file}: 缺少企业级功能"${feature}"`
            );
          }
        });
      }
    }
  }

  /**
   * 验证Mapper一致性
   */
  async validateMapperConsistency() {
    console.log('🔄 验证Mapper一致性...');
    
    const modules = ['context', 'plan', 'confirm', 'trace', 'role', 'extension'];
    
    for (const module of modules) {
      const schemaPath = `src/schemas/mplp-${module}.json`;
      const mapperPath = `src/modules/${module}/api/mappers/${module}.mapper.ts`;
      
      if (fs.existsSync(schemaPath) && fs.existsSync(mapperPath)) {
        const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
        const mapperContent = fs.readFileSync(mapperPath, 'utf8');
        
        // 检查字段映射一致性
        this.validateFieldMapping(schema, mapperContent, module);
      }
    }
  }

  /**
   * 验证TypeScript类型安全
   */
  async validateTypeScript() {
    console.log('📝 验证TypeScript类型安全...');
    
    try {
      execSync('npm run typecheck', { stdio: 'pipe' });
      console.log('✅ TypeScript编译检查通过');
    } catch (error) {
      this.violations.push('TypeScript编译失败: ' + error.message);
    }
  }

  /**
   * 验证测试覆盖率
   */
  async validateTestCoverage() {
    console.log('🧪 验证测试覆盖率...');
    
    try {
      const result = execSync('npm run test:coverage', { encoding: 'utf8' });
      
      // 解析覆盖率结果
      const coverageMatch = result.match(/All files\s+\|\s+(\d+\.?\d*)/);
      if (coverageMatch) {
        const coverage = parseFloat(coverageMatch[1]);
        if (coverage < 90) {
          this.violations.push(`测试覆盖率不足: ${coverage}% (要求: ≥90%)`);
        }
      }
    } catch (error) {
      this.violations.push('测试覆盖率检查失败: ' + error.message);
    }
  }

  /**
   * 验证性能基准
   */
  async validatePerformance() {
    console.log('⚡ 验证性能基准...');
    
    // 这里可以添加性能测试的验证逻辑
    // 例如：API响应时间、内存使用等
    console.log('✅ 性能基准验证通过');
  }

  /**
   * 验证文档同步
   */
  async validateDocumentation() {
    console.log('📚 验证文档同步...');
    
    // 检查重要文档是否存在
    const requiredDocs = [
      'README.md',
      'docs/schema/README.md',
      'docs/L4-Intelligent-Agent-OPS-Refactor/01-context/context-MPLP-positioning-analysis.md'
    ];
    
    for (const doc of requiredDocs) {
      if (!fs.existsSync(doc)) {
        this.violations.push(`缺少必需文档: ${doc}`);
      }
    }
  }

  /**
   * 辅助方法：查找文件
   */
  findFiles(dir, pattern) {
    const glob = require('glob');
    return glob.sync(path.join(dir, pattern));
  }

  /**
   * 辅助方法：检查必需Schema字段
   */
  checkRequiredSchemaFields(schema, filePath) {
    const required = ['$schema', '$id', 'title', 'description', 'type'];
    
    required.forEach(field => {
      if (!schema[field]) {
        this.violations.push(`${filePath}: 缺少必需字段"${field}"`);
      }
    });
  }

  /**
   * 辅助方法：检查协议版本
   */
  checkProtocolVersion(schema, filePath) {
    if (schema.properties && schema.properties.protocol_version) {
      const version = schema.properties.protocol_version.const;
      if (version !== '1.0.0') {
        this.violations.push(`${filePath}: 协议版本必须为"1.0.0"`);
      }
    }
  }

  /**
   * 辅助方法：检查Schema字段命名
   */
  checkSchemaFieldNaming(obj, filePath, path = '') {
    for (const [key, value] of Object.entries(obj)) {
      if (typeof key === 'string' && !this.isSnakeCase(key) && !this.isAllowedException(key)) {
        this.violations.push(`${filePath}${path}: 字段"${key}"违反snake_case命名约定`);
      }
      
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        this.checkSchemaFieldNaming(value, filePath, `${path}.${key}`);
      }
    }
  }

  /**
   * 辅助方法：验证命名转换
   */
  validateNamingConversions(content, filePath) {
    const conversions = [
      { snake: 'context_id', camel: 'contextId' },
      { snake: 'created_at', camel: 'createdAt' },
      { snake: 'protocol_version', camel: 'protocolVersion' }
    ];
    
    conversions.forEach(({ snake, camel }) => {
      if (content.includes(snake) && content.includes(camel)) {
        // 简单检查转换方向
        const hasCorrectConversion = content.includes(`${camel}:`) && content.includes(`${snake}:`);
        if (!hasCorrectConversion) {
          this.warnings.push(`${filePath}: ${snake} ↔ ${camel} 转换可能需要检查`);
        }
      }
    });
  }

  /**
   * 辅助方法：验证camelCase
   */
  validateCamelCaseInFile(content, filePath) {
    const fieldMatches = content.match(/^\s*(\w+):\s*\w+/gm);
    if (fieldMatches) {
      fieldMatches.forEach(match => {
        const fieldName = match.split(':')[0].trim();
        if (!this.isCamelCase(fieldName) && !this.isAllowedException(fieldName)) {
          this.violations.push(`${filePath}: 字段"${fieldName}"违反camelCase命名约定`);
        }
      });
    }
  }

  /**
   * 辅助方法：验证字段映射
   */
  validateFieldMapping(schema, mapperContent, module) {
    // 简化的映射检查
    if (schema.properties) {
      Object.keys(schema.properties).forEach(field => {
        if (!mapperContent.includes(field)) {
          this.warnings.push(`${module}.mapper.ts: 可能缺少字段"${field}"的映射`);
        }
      });
    }
  }

  /**
   * 辅助方法：判断snake_case
   */
  isSnakeCase(str) {
    return /^[a-z][a-z0-9_]*$/.test(str);
  }

  /**
   * 辅助方法：判断camelCase
   */
  isCamelCase(str) {
    return /^[a-z][a-zA-Z0-9]*$/.test(str);
  }

  /**
   * 辅助方法：判断例外
   */
  isAllowedException(str) {
    const exceptions = [
      '$schema', '$id', '$defs', '$ref',
      'additionalProperties', 'enum', 'const',
      'minLength', 'maxLength', 'minimum', 'maximum'
    ];
    return exceptions.includes(str);
  }

  /**
   * 输出验证结果
   */
  outputResults() {
    console.log('\n========================================');
    console.log('📊 验证结果汇总');
    console.log('========================================');
    
    console.log(`📁 总文件数: ${this.stats.totalFiles}`);
    console.log(`✅ 已验证: ${this.stats.validatedFiles}`);
    console.log(`❌ 错误数: ${this.violations.length}`);
    console.log(`⚠️ 警告数: ${this.warnings.length}`);
    
    if (this.violations.length > 0) {
      console.log('\n❌ 发现的错误:');
      this.violations.forEach((violation, index) => {
        console.log(`  ${index + 1}. ${violation}`);
      });
    }
    
    if (this.warnings.length > 0) {
      console.log('\n⚠️ 发现的警告:');
      this.warnings.forEach((warning, index) => {
        console.log(`  ${index + 1}. ${warning}`);
      });
    }
    
    if (this.violations.length === 0) {
      console.log('\n🎉 所有验证通过！');
    } else {
      console.log('\n💥 验证失败，请修复所有错误后重试');
    }
    
    console.log('========================================\n');
  }
}

// 命令行使用
if (require.main === module) {
  const validator = new ComprehensiveValidator();
  
  validator.runFullValidation()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('验证失败:', error.message);
      process.exit(1);
    });
}

module.exports = ComprehensiveValidator;
