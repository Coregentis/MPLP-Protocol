/**
 * MPLP架构验证脚本
 * 
 * 验证所有模块的DDD架构完整性和一致性
 * 
 * @version 1.0.0
 * @created 2025-09-16
 */

import * as fs from 'fs';
import * as path from 'path';

interface ArchitectureValidationResult {
  module: string;
  isValid: boolean;
  errors: string[];
  warnings: string[];
  score: number;
}

interface DDDLayerStructure {
  api: string[];
  application: string[];
  domain: string[];
  infrastructure: string[];
}

/**
 * 架构验证器
 */
class ArchitectureValidator {
  private readonly modulesPath = path.join(__dirname, '../modules');
  private readonly requiredModules = ['context', 'plan', 'confirm', 'trace', 'role', 'extension', 'core'];

  /**
   * 验证所有模块的架构
   */
  async validateAllModules(): Promise<ArchitectureValidationResult[]> {
    const results: ArchitectureValidationResult[] = [];

    for (const moduleName of this.requiredModules) {
      const result = await this.validateModule(moduleName);
      results.push(result);
    }

    return results;
  }

  /**
   * 验证单个模块的架构
   */
  private async validateModule(moduleName: string): Promise<ArchitectureValidationResult> {
    const modulePath = path.join(this.modulesPath, moduleName);
    const errors: string[] = [];
    const warnings: string[] = [];
    let score = 100;

    // 检查模块目录是否存在
    if (!fs.existsSync(modulePath)) {
      errors.push(`模块目录不存在: ${modulePath}`);
      return {
        module: moduleName,
        isValid: false,
        errors,
        warnings,
        score: 0
      };
    }

    // Core模块有特殊的架构结构
    if (moduleName === 'core') {
      return this.validateCoreModule(modulePath, moduleName);
    }

    // 验证DDD层结构
    const layerValidation = this.validateDDDLayers(modulePath, moduleName);
    errors.push(...layerValidation.errors);
    warnings.push(...layerValidation.warnings);
    score -= layerValidation.penalty;

    // 验证必需文件
    const fileValidation = this.validateRequiredFiles(modulePath, moduleName);
    errors.push(...fileValidation.errors);
    warnings.push(...fileValidation.warnings);
    score -= fileValidation.penalty;

    // 验证导出结构
    const exportValidation = this.validateExports(modulePath, moduleName);
    errors.push(...exportValidation.errors);
    warnings.push(...exportValidation.warnings);
    score -= exportValidation.penalty;

    return {
      module: moduleName,
      isValid: errors.length === 0,
      errors,
      warnings,
      score: Math.max(0, score)
    };
  }

  /**
   * 验证Core模块的特殊架构
   */
  private validateCoreModule(modulePath: string, moduleName: string): ArchitectureValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let score = 100;

    const requiredDirs = ['orchestrator', 'workflow', 'coordination', 'types'];
    
    for (const dir of requiredDirs) {
      const dirPath = path.join(modulePath, dir);
      if (!fs.existsSync(dirPath)) {
        errors.push(`Core模块缺少必需目录: ${dir}`);
        score -= 25;
      }
    }

    // 检查核心文件
    const requiredFiles = [
      'orchestrator/core-orchestrator.ts',
      'workflow/workflow-manager.ts',
      'coordination/module-coordinator.ts',
      'types/core.types.ts',
      'index.ts'
    ];

    for (const file of requiredFiles) {
      const filePath = path.join(modulePath, file);
      if (!fs.existsSync(filePath)) {
        errors.push(`Core模块缺少必需文件: ${file}`);
        score -= 10;
      }
    }

    return {
      module: moduleName,
      isValid: errors.length === 0,
      errors,
      warnings,
      score: Math.max(0, score)
    };
  }

  /**
   * 验证DDD层结构
   */
  private validateDDDLayers(modulePath: string, moduleName: string): {
    errors: string[];
    warnings: string[];
    penalty: number;
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    let penalty = 0;

    const requiredLayers = ['api', 'application', 'domain', 'infrastructure'];
    
    for (const layer of requiredLayers) {
      const layerPath = path.join(modulePath, layer);
      if (!fs.existsSync(layerPath)) {
        errors.push(`${moduleName}模块缺少${layer}层`);
        penalty += 20;
      } else {
        // 验证层内部结构
        const layerValidation = this.validateLayerStructure(layerPath, layer, moduleName);
        errors.push(...layerValidation.errors);
        warnings.push(...layerValidation.warnings);
        penalty += layerValidation.penalty;
      }
    }

    return { errors, warnings, penalty };
  }

  /**
   * 验证层内部结构
   */
  private validateLayerStructure(layerPath: string, layer: string, moduleName: string): {
    errors: string[];
    warnings: string[];
    penalty: number;
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    let penalty = 0;

    const expectedStructures: Record<string, string[]> = {
      api: ['controllers'],
      application: ['services'],
      domain: ['entities', 'repositories'],
      infrastructure: ['repositories']
    };

    const expectedDirs = expectedStructures[layer] || [];
    
    for (const expectedDir of expectedDirs) {
      const dirPath = path.join(layerPath, expectedDir);
      if (!fs.existsSync(dirPath)) {
        warnings.push(`${moduleName}模块${layer}层缺少${expectedDir}目录`);
        penalty += 5;
      }
    }

    return { errors, warnings, penalty };
  }

  /**
   * 验证必需文件
   */
  private validateRequiredFiles(modulePath: string, moduleName: string): {
    errors: string[];
    warnings: string[];
    penalty: number;
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    let penalty = 0;

    const requiredFiles = [
      'index.ts',
      'module.ts',
      'types.ts'
    ];

    for (const file of requiredFiles) {
      const filePath = path.join(modulePath, file);
      if (!fs.existsSync(filePath)) {
        errors.push(`${moduleName}模块缺少必需文件: ${file}`);
        penalty += 10;
      }
    }

    return { errors, warnings, penalty };
  }

  /**
   * 验证导出结构
   */
  private validateExports(modulePath: string, moduleName: string): {
    errors: string[];
    warnings: string[];
    penalty: number;
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    let penalty = 0;

    const indexPath = path.join(modulePath, 'index.ts');
    
    if (fs.existsSync(indexPath)) {
      try {
        const content = fs.readFileSync(indexPath, 'utf-8');
        
        // 检查是否有DDD架构的导出
        const expectedExports = [
          'api/controllers',
          'application/services',
          'domain/entities',
          'infrastructure/repositories'
        ];

        for (const expectedExport of expectedExports) {
          if (!content.includes(expectedExport)) {
            warnings.push(`${moduleName}模块index.ts缺少${expectedExport}的导出`);
            penalty += 2;
          }
        }

        // 检查是否清理了旧架构的导出
        // 只检测直接导出的旧架构类，不包括DDD架构的from导出
        const oldArchitecturePatterns = [
          /^export\s+class\s+.*Manager(?!.*Service)/m,  // 直接导出Manager类（但不是ManagementService）
          /^export\s+class\s+.*Service(?!.*Management)/m, // 直接导出Service类（但不是ManagementService）
          /^export\s+\{[^}]*Manager[^}]*\}(?!\s+from)/m,  // 直接导出Manager（不是from语句）
          /^export\s+\{[^}]*Service[^}]*\}(?!\s+from)(?!.*Management)/m  // 直接导出Service（不是from语句且不是Management）
        ];

        for (const pattern of oldArchitecturePatterns) {
          if (pattern.test(content)) {
            warnings.push(`${moduleName}模块可能仍包含旧架构的导出`);
            penalty += 5;
            break;
          }
        }

      } catch (error) {
        errors.push(`无法读取${moduleName}模块的index.ts文件`);
        penalty += 10;
      }
    }

    return { errors, warnings, penalty };
  }

  /**
   * 生成验证报告
   */
  generateReport(results: ArchitectureValidationResult[]): string {
    let report = '# MPLP架构验证报告\n\n';
    
    const totalModules = results.length;
    const validModules = results.filter(r => r.isValid).length;
    const averageScore = results.reduce((sum, r) => sum + r.score, 0) / totalModules;

    report += `## 总体概况\n`;
    report += `- 总模块数: ${totalModules}\n`;
    report += `- 有效模块数: ${validModules}\n`;
    report += `- 验证通过率: ${((validModules / totalModules) * 100).toFixed(1)}%\n`;
    report += `- 平均架构分数: ${averageScore.toFixed(1)}/100\n\n`;

    report += `## 模块详情\n\n`;

    for (const result of results) {
      report += `### ${result.module}模块\n`;
      report += `- 状态: ${result.isValid ? '✅ 通过' : '❌ 失败'}\n`;
      report += `- 架构分数: ${result.score}/100\n`;

      if (result.errors.length > 0) {
        report += `- 错误:\n`;
        result.errors.forEach(error => {
          report += `  - ${error}\n`;
        });
      }

      if (result.warnings.length > 0) {
        report += `- 警告:\n`;
        result.warnings.forEach(warning => {
          report += `  - ${warning}\n`;
        });
      }

      report += '\n';
    }

    // 生成建议
    report += `## 改进建议\n\n`;
    
    const failedModules = results.filter(r => !r.isValid);
    if (failedModules.length > 0) {
      report += `### 优先修复\n`;
      failedModules.forEach(module => {
        report += `- ${module.module}模块: 需要修复${module.errors.length}个错误\n`;
      });
      report += '\n';
    }

    const lowScoreModules = results.filter(r => r.score < 80);
    if (lowScoreModules.length > 0) {
      report += `### 架构优化\n`;
      lowScoreModules.forEach(module => {
        report += `- ${module.module}模块: 架构分数${module.score}/100，建议优化\n`;
      });
      report += '\n';
    }

    return report;
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('🔍 开始MPLP架构验证...\n');

  const validator = new ArchitectureValidator();
  const results = await validator.validateAllModules();
  
  // 生成报告
  const report = validator.generateReport(results);
  
  // 输出到控制台
  console.log(report);
  
  // 保存到文件
  const reportPath = path.join(__dirname, '../docs/architecture-validation-report.md');
  fs.writeFileSync(reportPath, report);
  console.log(`📄 验证报告已保存到: ${reportPath}`);

  // 返回退出码
  const hasErrors = results.some(r => !r.isValid);
  process.exit(hasErrors ? 1 : 0);
}

// 运行验证
if (require.main === module) {
  main().catch(error => {
    console.error('❌ 架构验证失败:', error);
    process.exit(1);
  });
}

export { ArchitectureValidator };
