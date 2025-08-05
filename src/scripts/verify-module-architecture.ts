/**
 * MPLP Module Architecture Verification Script
 *
 * @version v1.0.0
 * @created 2025-08-02T01:40:00+08:00
 * @description 验证9个协议模块的DDD架构一致性
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  MODULE_REGISTRY,
  MODULE_INITIALIZATION_ORDER,
} from '../config/module-integration';

/**
 * DDD架构层次定义
 */
const REQUIRED_DDD_LAYERS = ['api', 'application', 'domain', 'infrastructure'];

/**
 * 每层必需的子目录
 */
const LAYER_SUBDIRECTORIES = {
  api: ['controllers', 'dto'],
  application: ['services', 'commands', 'queries'],
  domain: ['entities', 'repositories'],
  infrastructure: ['repositories', 'adapters'],
};

/**
 * 必需的模块文件
 */
const REQUIRED_MODULE_FILES = ['types.ts', 'index.ts', 'module.ts'];

/**
 * 架构验证结果
 */
interface ArchitectureValidationResult {
  module: string;
  valid: boolean;
  issues: string[];
  warnings: string[];
  details: {
    hasRequiredFiles: boolean;
    hasDDDLayers: boolean;
    hasCorrectSubdirectories: boolean;
    hasValidExports: boolean;
  };
}

/**
 * 模块架构验证器
 */
class ModuleArchitectureValidator {
  private modulesPath: string;

  constructor() {
    this.modulesPath = path.join(process.cwd(), 'src/modules');
  }

  /**
   * 验证所有模块架构
   */
  async validateAllModules(): Promise<{
    overall: boolean;
    results: ArchitectureValidationResult[];
    summary: {
      total: number;
      valid: number;
      invalid: number;
      warnings: number;
    };
  }> {
    console.log('🔍 开始验证MPLP模块架构一致性...\n');

    const results: ArchitectureValidationResult[] = [];

    // 验证6个核心协议模块 + 3个协作模块
    const allModules = Object.keys(MODULE_REGISTRY).filter(
      name => name !== 'core'
    );

    for (const moduleName of allModules) {
      const result = await this.validateModule(moduleName);
      results.push(result);

      if (result.valid) {
        console.log(`✅ ${moduleName} 模块架构验证通过`);
      } else {
        console.log(`❌ ${moduleName} 模块架构验证失败:`);
        result.issues.forEach(issue => console.log(`   - ${issue}`));
      }

      if (result.warnings.length > 0) {
        console.log(`⚠️  ${moduleName} 模块警告:`);
        result.warnings.forEach(warning => console.log(`   - ${warning}`));
      }

      console.log('');
    }

    const validCount = results.filter(r => r.valid).length;
    const warningCount = results.reduce((sum, r) => sum + r.warnings.length, 0);

    const summary = {
      total: results.length,
      valid: validCount,
      invalid: results.length - validCount,
      warnings: warningCount,
    };

    const overall = validCount === results.length;

    console.log('📊 验证结果汇总:');
    console.log(`   总模块数: ${summary.total}`);
    console.log(`   通过验证: ${summary.valid}`);
    console.log(`   验证失败: ${summary.invalid}`);
    console.log(`   警告数量: ${summary.warnings}`);
    console.log(`   整体状态: ${overall ? '✅ 通过' : '❌ 失败'}\n`);

    return { overall, results, summary };
  }

  /**
   * 验证单个模块架构
   */
  private async validateModule(
    moduleName: string
  ): Promise<ArchitectureValidationResult> {
    const modulePath = path.join(this.modulesPath, moduleName);
    const issues: string[] = [];
    const warnings: string[] = [];

    // 检查模块目录是否存在
    if (!fs.existsSync(modulePath)) {
      return {
        module: moduleName,
        valid: false,
        issues: [`模块目录不存在: ${modulePath}`],
        warnings: [],
        details: {
          hasRequiredFiles: false,
          hasDDDLayers: false,
          hasCorrectSubdirectories: false,
          hasValidExports: false,
        },
      };
    }

    // 验证必需文件
    const hasRequiredFiles = this.validateRequiredFiles(modulePath, issues);

    // 验证DDD层次结构
    const hasDDDLayers = this.validateDDDLayers(modulePath, issues);

    // 验证子目录结构
    const hasCorrectSubdirectories = this.validateSubdirectories(
      modulePath,
      issues,
      warnings
    );

    // 验证导出文件
    const hasValidExports = this.validateExports(
      modulePath,
      moduleName,
      issues,
      warnings
    );

    const valid = issues.length === 0;

    return {
      module: moduleName,
      valid,
      issues,
      warnings,
      details: {
        hasRequiredFiles,
        hasDDDLayers,
        hasCorrectSubdirectories,
        hasValidExports,
      },
    };
  }

  /**
   * 验证必需文件
   */
  private validateRequiredFiles(modulePath: string, issues: string[]): boolean {
    let allFilesExist = true;

    for (const fileName of REQUIRED_MODULE_FILES) {
      const filePath = path.join(modulePath, fileName);
      if (!fs.existsSync(filePath)) {
        issues.push(`缺少必需文件: ${fileName}`);
        allFilesExist = false;
      }
    }

    return allFilesExist;
  }

  /**
   * 验证DDD层次结构
   */
  private validateDDDLayers(modulePath: string, issues: string[]): boolean {
    let allLayersExist = true;

    for (const layer of REQUIRED_DDD_LAYERS) {
      const layerPath = path.join(modulePath, layer);
      if (!fs.existsSync(layerPath)) {
        issues.push(`缺少DDD层: ${layer}`);
        allLayersExist = false;
      }
    }

    return allLayersExist;
  }

  /**
   * 验证子目录结构
   */
  private validateSubdirectories(
    modulePath: string,
    issues: string[],
    warnings: string[]
  ): boolean {
    const allSubdirsCorrect = true;

    for (const [layer, subdirs] of Object.entries(LAYER_SUBDIRECTORIES)) {
      const layerPath = path.join(modulePath, layer);

      if (!fs.existsSync(layerPath)) {
        continue; // 层不存在的问题已在上一步检查
      }

      for (const subdir of subdirs) {
        const subdirPath = path.join(layerPath, subdir);
        if (!fs.existsSync(subdirPath)) {
          warnings.push(`${layer}层缺少子目录: ${subdir}`);
        }
      }
    }

    return allSubdirsCorrect;
  }

  /**
   * 验证导出文件
   */
  private validateExports(
    modulePath: string,
    moduleName: string,
    issues: string[],
    warnings: string[]
  ): boolean {
    const indexPath = path.join(modulePath, 'index.ts');
    const moduleTsPath = path.join(modulePath, 'module.ts');
    const typesPath = path.join(modulePath, 'types.ts');

    let hasValidExports = true;

    // 检查index.ts导出
    if (fs.existsSync(indexPath)) {
      const indexContent = fs.readFileSync(indexPath, 'utf-8');

      // 检查是否导出了主要组件
      const expectedExports = [
        'types',
        'entities',
        'repositories',
        'services',
        'controllers',
        'module',
      ];

      for (const exportName of expectedExports) {
        if (
          !indexContent.includes(`export`) ||
          !indexContent.includes(exportName)
        ) {
          warnings.push(`index.ts可能缺少${exportName}相关导出`);
        }
      }
    }

    // 检查module.ts配置
    if (fs.existsSync(moduleTsPath)) {
      const moduleContent = fs.readFileSync(moduleTsPath, 'utf-8');

      // 检查是否有模块定义（类模式或函数模式）
      const hasClassModule =
        moduleContent.includes('class') && moduleContent.includes('Module');
      const hasFunctionModule =
        moduleContent.includes('initialize') &&
        moduleContent.includes('Module');

      if (!hasClassModule && !hasFunctionModule) {
        issues.push('module.ts缺少模块定义（类模式或函数模式）');
        hasValidExports = false;
      }

      // 对于新的协作模块，检查getRouter方法
      if (['collab', 'dialog', 'network'].includes(moduleName)) {
        if (!moduleContent.includes('getRouter')) {
          warnings.push('module.ts可能缺少getRouter方法');
        }
      }
    }

    return hasValidExports;
  }

  /**
   * 验证模块集成配置
   */
  async validateModuleIntegration(): Promise<{
    valid: boolean;
    issues: string[];
  }> {
    console.log('🔧 验证模块集成配置...\n');

    const issues: string[] = [];

    // 检查所有模块是否在注册表中
    const moduleDirectories = fs
      .readdirSync(this.modulesPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    for (const moduleName of moduleDirectories) {
      if (!MODULE_REGISTRY[moduleName] && moduleName !== 'core') {
        issues.push(`模块 ${moduleName} 未在MODULE_REGISTRY中注册`);
      }
    }

    // 检查注册表中的模块是否都存在
    for (const moduleName of Object.keys(MODULE_REGISTRY)) {
      if (moduleName === 'core') {continue;}

      const modulePath = path.join(this.modulesPath, moduleName);
      if (!fs.existsSync(modulePath)) {
        issues.push(`注册的模块 ${moduleName} 目录不存在`);
      }
    }

    // 检查初始化顺序
    const registeredModules = Object.keys(MODULE_REGISTRY).filter(
      name => name !== 'core'
    );
    const initOrderModules = MODULE_INITIALIZATION_ORDER.filter(
      name => name !== 'core'
    );

    for (const moduleName of registeredModules) {
      if (!initOrderModules.includes(moduleName)) {
        issues.push(`模块 ${moduleName} 未包含在初始化顺序中`);
      }
    }

    const valid = issues.length === 0;

    if (valid) {
      console.log('✅ 模块集成配置验证通过\n');
    } else {
      console.log('❌ 模块集成配置验证失败:');
      issues.forEach(issue => console.log(`   - ${issue}`));
      console.log('');
    }

    return { valid, issues };
  }
}

/**
 * 主验证函数
 */
async function main() {
  console.log('🚀 MPLP v1.0 模块架构验证工具\n');
  console.log('验证范围: 9个协议模块的DDD架构一致性\n');

  const validator = new ModuleArchitectureValidator();

  try {
    // 验证模块架构
    const architectureResult = await validator.validateAllModules();

    // 验证模块集成
    const integrationResult = await validator.validateModuleIntegration();

    // 最终结果
    const overallSuccess =
      architectureResult.overall && integrationResult.valid;

    console.log('🎯 最终验证结果:');
    console.log(
      `   架构一致性: ${architectureResult.overall ? '✅ 通过' : '❌ 失败'}`
    );
    console.log(
      `   集成配置: ${integrationResult.valid ? '✅ 通过' : '❌ 失败'}`
    );
    console.log(`   整体状态: ${overallSuccess ? '✅ 成功' : '❌ 失败'}\n`);

    if (overallSuccess) {
      console.log('🎉 恭喜！所有9个协议模块都遵循统一的DDD架构模式！');
      console.log('📋 架构统一完成，可以开始TracePilot开发。');
    } else {
      console.log('⚠️  请修复上述问题后重新验证。');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ 验证过程中发生错误:', error);
    process.exit(1);
  }
}

// 运行验证
if (require.main === module) {
  main();
}
