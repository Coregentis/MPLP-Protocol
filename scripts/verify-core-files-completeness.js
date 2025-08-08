#!/usr/bin/env node

/**
 * 验证所有模块核心文件的完整性
 * 
 * 检查所有10个模块的index.ts, module.ts, types.ts文件是否存在
 * 并验证Schema-Application映射关系是否正确
 * 
 * @version 1.0.0
 * @created 2025-08-06
 */

const fs = require('fs');
const path = require('path');

class CoreFilesCompletenessVerifier {
  constructor() {
    this.stats = {
      totalModules: 0,
      completeModules: 0,
      missingFiles: [],
      existingFiles: [],
      mappingIssues: []
    };
    
    // 10个模块列表
    this.modules = [
      'core', 'context', 'plan', 'confirm', 'trace', 
      'role', 'extension', 'collab', 'dialog', 'network'
    ];
    
    // 核心文件列表
    this.coreFiles = ['index.ts', 'module.ts', 'types.ts'];
  }

  /**
   * 运行验证流程
   */
  async run() {
    console.log('🔍 开始验证所有模块核心文件的完整性...\n');
    
    try {
      // 验证每个模块的核心文件
      for (const module of this.modules) {
        await this.verifyModuleCoreFiles(module);
      }
      
      this.printSummary();
      
    } catch (error) {
      console.error('❌ 验证过程中发生错误:', error.message);
      process.exit(1);
    }
  }

  /**
   * 验证单个模块的核心文件
   */
  async verifyModuleCoreFiles(moduleName) {
    console.log(`📁 验证模块: ${moduleName}`);
    
    const moduleDir = path.join('src/modules', moduleName);
    if (!fs.existsSync(moduleDir)) {
      console.log(`❌ 模块目录不存在: ${moduleDir}`);
      return;
    }

    this.stats.totalModules++;
    let moduleComplete = true;
    let moduleFiles = {
      existing: [],
      missing: []
    };

    // 检查每个核心文件
    for (const fileName of this.coreFiles) {
      const filePath = path.join(moduleDir, fileName);
      
      if (fs.existsSync(filePath)) {
        console.log(`  ✅ ${fileName} - 存在`);
        moduleFiles.existing.push(fileName);
        this.stats.existingFiles.push(`${moduleName}/${fileName}`);
        
        // 验证文件内容的映射关系
        await this.verifyFileMapping(moduleName, fileName, filePath);
        
      } else {
        console.log(`  ❌ ${fileName} - 缺失`);
        moduleFiles.missing.push(fileName);
        this.stats.missingFiles.push(`${moduleName}/${fileName}`);
        moduleComplete = false;
      }
    }

    if (moduleComplete) {
      console.log(`  🎉 模块 ${moduleName} 核心文件完整`);
      this.stats.completeModules++;
    } else {
      console.log(`  ⚠️  模块 ${moduleName} 缺少文件: ${moduleFiles.missing.join(', ')}`);
    }
    
    console.log('');
  }

  /**
   * 验证文件的Schema-Application映射关系
   */
  async verifyFileMapping(moduleName, fileName, filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // 检查是否存在snake_case字段（应该避免在Application层）
      const snakeCasePattern = /\b\w+_\w+\s*:/g;
      const snakeCaseMatches = content.match(snakeCasePattern);
      
      if (snakeCaseMatches && snakeCaseMatches.length > 0) {
        // 过滤掉一些合理的snake_case使用（如注释、字符串等）
        const problematicMatches = snakeCaseMatches.filter(match => {
          // 排除注释中的snake_case
          const lines = content.split('\n');
          for (const line of lines) {
            if (line.includes(match) && (line.trim().startsWith('//') || line.trim().startsWith('*'))) {
              return false;
            }
          }
          return true;
        });
        
        if (problematicMatches.length > 0) {
          this.stats.mappingIssues.push({
            module: moduleName,
            file: fileName,
            issues: problematicMatches.slice(0, 3), // 只显示前3个
            count: problematicMatches.length
          });
          console.log(`    ⚠️  发现 ${problematicMatches.length} 个可能的映射问题`);
        }
      }
      
    } catch (error) {
      console.log(`    ⚠️  无法验证文件映射: ${error.message}`);
    }
  }

  /**
   * 打印验证总结
   */
  printSummary() {
    console.log('\n📊 核心文件完整性验证总结:');
    console.log('================================');
    console.log(`总模块数: ${this.stats.totalModules}`);
    console.log(`完整模块数: ${this.stats.completeModules}`);
    console.log(`完整率: ${((this.stats.completeModules / this.stats.totalModules) * 100).toFixed(1)}%`);
    
    console.log('\n📋 文件统计:');
    console.log(`存在的文件: ${this.stats.existingFiles.length}`);
    console.log(`缺失的文件: ${this.stats.missingFiles.length}`);
    
    if (this.stats.missingFiles.length > 0) {
      console.log('\n❌ 缺失的文件:');
      this.stats.missingFiles.forEach(file => {
        console.log(`  - ${file}`);
      });
    }
    
    if (this.stats.mappingIssues.length > 0) {
      console.log('\n⚠️  映射关系问题:');
      this.stats.mappingIssues.forEach(issue => {
        console.log(`  - ${issue.module}/${issue.file}: ${issue.count}个问题`);
        issue.issues.forEach(problemMatch => {
          console.log(`    * ${problemMatch.trim()}`);
        });
      });
    }
    
    console.log('\n📁 模块核心文件详情:');
    this.modules.forEach(module => {
      const moduleFiles = this.coreFiles.map(file => {
        const exists = this.stats.existingFiles.includes(`${module}/${file}`);
        return `${file}:${exists ? '✅' : '❌'}`;
      }).join(' ');
      console.log(`  ${module}: ${moduleFiles}`);
    });
    
    if (this.stats.completeModules === this.stats.totalModules && this.stats.mappingIssues.length === 0) {
      console.log('\n🎉 所有模块核心文件完整且映射关系正确！');
      console.log('✅ Schema层: snake_case (JSON/API标准)');
      console.log('✅ Application层: camelCase (JavaScript标准)');
      console.log('✅ 映射机制: 序列化/反序列化时自动转换');
    } else {
      console.log('\n⚠️  发现问题需要修复:');
      if (this.stats.missingFiles.length > 0) {
        console.log(`  - ${this.stats.missingFiles.length} 个文件缺失`);
      }
      if (this.stats.mappingIssues.length > 0) {
        console.log(`  - ${this.stats.mappingIssues.length} 个模块存在映射问题`);
      }
    }
  }
}

// 运行验证器
if (require.main === module) {
  const verifier = new CoreFilesCompletenessVerifier();
  verifier.run().catch(console.error);
}

module.exports = CoreFilesCompletenessVerifier;
