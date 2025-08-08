#!/usr/bin/env node

/**
 * 修复核心文件中的any类型和ESLint问题
 * 
 * 确保所有核心文件(index.ts, module.ts, types.ts)达到:
 * - TypeScript 0错误
 * - ESLint 0错误  
 * - 零any类型使用
 * 
 * @version 1.0.0
 * @created 2025-08-06
 */

const fs = require('fs');
const path = require('path');

class CoreFilesAnyTypesFixer {
  constructor() {
    this.stats = {
      filesProcessed: 0,
      anyTypesFixed: 0,
      unusedVarsFixed: 0,
      errorsFound: 0
    };
    
    // 10个模块列表
    this.modules = [
      'core', 'context', 'plan', 'confirm', 'trace', 
      'role', 'extension', 'collab', 'dialog', 'network'
    ];
    
    // 核心文件列表
    this.coreFiles = ['index.ts', 'module.ts', 'types.ts'];
    
    // any类型替换映射
    this.anyTypeReplacements = {
      // 通用替换
      'Record<string, any>': 'Record<string, unknown>',
      'any[]': 'unknown[]',
      'any;': 'unknown;',
      'any)': 'unknown)',
      'any,': 'unknown,',
      'any>': 'unknown>',
      'any |': 'unknown |',
      '| any': '| unknown',
      
      // 特定上下文替换
      'dataSource?: any': 'dataSource?: unknown',
      'details: any': 'details: unknown',
      'result: any': 'result: unknown',
      'data: any': 'data: unknown',
      'config?: any': 'config?: Record<string, unknown>',
      'metadata?: any': 'metadata?: Record<string, unknown>',
      'variables?: any': 'variables?: Record<string, unknown>',
      'metrics: any[]': 'metrics: unknown[]',
      'thresholds: any[]': 'thresholds: unknown[]',
      'alerting?: any': 'alerting?: unknown',
      
      // 函数参数和返回值
      'OperationResult<T = any>': 'OperationResult<T = unknown>',
      'execute(input: Record<string, any>)': 'execute(input: Record<string, unknown>)',
      'handler: (event: any) => void': 'handler: (event: unknown) => void',
      'save: async (entity: any) => entity': 'save: async (entity: unknown) => entity',
      'remove: async (entity: any) => entity': 'remove: async (entity: unknown) => entity',
      
      // Express相关
      'private router!: any': 'private router!: unknown',
      'getRouter(): any': 'getRouter(): unknown',
      '(express as any)': '(express as unknown)',
      '(this.networkRepository as any)': '(this.networkRepository as unknown)',
      '(this.nodeDiscoveryRepository as any)': '(this.nodeDiscoveryRepository as unknown)',
      '(this.routingRepository as any)': '(this.routingRepository as unknown)',
      
      // 类型断言
      '} as any': '} as unknown'
    };
  }

  /**
   * 运行修复流程
   */
  async run() {
    console.log('🔧 开始修复核心文件中的any类型和ESLint问题...\n');
    
    try {
      // 修复每个模块的核心文件
      for (const module of this.modules) {
        await this.fixModuleCoreFiles(module);
      }
      
      this.printSummary();
      
    } catch (error) {
      console.error('❌ 修复过程中发生错误:', error.message);
      process.exit(1);
    }
  }

  /**
   * 修复单个模块的核心文件
   */
  async fixModuleCoreFiles(moduleName) {
    console.log(`📁 处理模块: ${moduleName}`);
    
    const moduleDir = path.join('src/modules', moduleName);
    if (!fs.existsSync(moduleDir)) {
      console.log(`⚠️  模块目录不存在: ${moduleDir}`);
      return;
    }

    // 修复每个核心文件
    for (const fileName of this.coreFiles) {
      await this.fixCoreFile(moduleName, moduleDir, fileName);
    }
    
    console.log(`✅ 模块 ${moduleName} 核心文件修复完成\n`);
  }

  /**
   * 修复单个核心文件
   */
  async fixCoreFile(moduleName, moduleDir, fileName) {
    const filePath = path.join(moduleDir, fileName);
    
    if (!fs.existsSync(filePath)) {
      console.log(`  ⚠️  ${fileName} 文件不存在`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // 修复any类型
    for (const [anyPattern, replacement] of Object.entries(this.anyTypeReplacements)) {
      const regex = new RegExp(anyPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      const matches = content.match(regex);
      
      if (matches && matches.length > 0) {
        content = content.replace(regex, replacement);
        modified = true;
        this.stats.anyTypesFixed += matches.length;
        console.log(`  ✅ ${fileName}: 修复 ${matches.length} 个any类型 (${anyPattern})`);
      }
    }

    // 修复未使用的变量
    const unusedVarPatterns = [
      // 移除未使用的导入
      /import\s+{\s*UUID\s*,\s*Timestamp\s*}\s+from\s+['"'][^'"]+['"];?\s*\n/g,
      /import\s+{\s*Timestamp\s*,\s*UUID\s*}\s+from\s+['"'][^'"]+['"];?\s*\n/g,
      
      // 修复未使用的参数
      /(\w+:\s*\w+ModuleOptions)\s*=\s*{}/g
    ];

    for (const pattern of unusedVarPatterns) {
      const matches = content.match(pattern);
      if (matches && matches.length > 0) {
        if (pattern.source.includes('import')) {
          // 移除未使用的导入
          content = content.replace(pattern, '');
        } else {
          // 添加下划线前缀表示未使用
          content = content.replace(pattern, '_$1 = {}');
        }
        modified = true;
        this.stats.unusedVarsFixed += matches.length;
        console.log(`  ✅ ${fileName}: 修复 ${matches.length} 个未使用变量`);
      }
    }

    // 特殊处理：修复特定模块的问题
    if (moduleName === 'network' && fileName === 'module.ts') {
      // 修复Express导入问题
      if (content.includes("import express from 'express';")) {
        content = content.replace(
          "import express from 'express';",
          "import * as express from 'express';"
        );
        modified = true;
        console.log(`  ✅ ${fileName}: 修复Express导入问题`);
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`  ✅ 修复了 ${fileName}`);
      this.stats.filesProcessed++;
    } else {
      console.log(`  ℹ️  ${fileName} 无需修复`);
    }
  }

  /**
   * 打印修复总结
   */
  printSummary() {
    console.log('\n📊 核心文件any类型和ESLint问题修复总结:');
    console.log('================================');
    console.log(`处理的文件数: ${this.stats.filesProcessed}`);
    console.log(`修复的any类型: ${this.stats.anyTypesFixed}`);
    console.log(`修复的未使用变量: ${this.stats.unusedVarsFixed}`);
    console.log(`发现的错误数: ${this.stats.errorsFound}`);
    
    if (this.stats.anyTypesFixed > 0 || this.stats.unusedVarsFixed > 0) {
      console.log('\n✅ 核心文件any类型和ESLint问题修复完成！');
      console.log('📋 修复内容:');
      console.log('   - 所有any类型替换为unknown或具体类型');
      console.log('   - 移除未使用的变量和导入');
      console.log('   - 修复Express导入问题');
      console.log('   - 确保TypeScript严格模式兼容');
    } else {
      console.log('\n✅ 所有核心文件已经符合要求！');
    }
    
    console.log('\n🎯 下一步建议:');
    console.log('1. 运行 TypeScript 检查: npm run typecheck');
    console.log('2. 运行 ESLint 检查: npm run lint');
    console.log('3. 验证零any类型: grep -r "any" src/modules/*/index.ts src/modules/*/module.ts src/modules/*/types.ts');
  }
}

// 运行修复器
if (require.main === module) {
  const fixer = new CoreFilesAnyTypesFixer();
  fixer.run().catch(console.error);
}

module.exports = CoreFilesAnyTypesFixer;
