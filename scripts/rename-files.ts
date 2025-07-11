#!/usr/bin/env ts-node
/**
 * MPLP 文件命名规范化脚本
 * 
 * 此脚本用于自动重命名不符合MPLP命名规范的文件，并更新所有导入语句。
 * 
 * 使用方法:
 * npm run rename-files
 * 
 * 或直接运行:
 * ts-node scripts/rename-files.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';
// chalk v4需要使用CommonJS导入方式
const chalk = require('chalk');

// 模块名称列表
const CORE_MODULES = ['context', 'plan', 'confirm', 'trace', 'role', 'extension'];

// 组件类型列表
const COMPONENT_TYPES = [
  'protocol',
  'manager',
  'factory',
  'handler',
  'validator',
  'service',
  'controller',
  'repository',
  'types',
  'resolver',
  'adapter',
  'helper',
  'util',
  'config',
  'middleware'
];

// 需要扫描的目录
const SCAN_DIRS = ['src/modules'];

// 需要排除的目录
const EXCLUDE_DIRS = ['node_modules', 'dist', 'build', '.git'];

// 需要处理的文件扩展名
const FILE_EXTENSIONS = ['.ts', '.js', '.tsx', '.jsx'];

interface FileToRename {
  oldPath: string;
  newPath: string;
  moduleName: string;
  componentType: string;
}

/**
 * 检查文件名是否符合命名规范
 */
function isValidFileName(fileName: string, moduleName: string): boolean {
  // 排除index文件和测试文件
  if (fileName === 'index.ts' || fileName.endsWith('.test.ts') || fileName.endsWith('.spec.ts')) {
    return true;
  }
  
  // 检查文件是否符合 {module-name}-{component-type}.ts 格式
  const regex = new RegExp(`^${moduleName}-[a-z-]+\\.ts$`);
  return regex.test(fileName);
}

/**
 * 推断正确的文件名
 */
function inferCorrectFileName(fileName: string, moduleName: string): string {
  // 处理特殊情况: Failure-Resolver.ts -> failure-resolver.ts
  if (fileName === 'Failure-Resolver.ts') {
    return 'failure-resolver.ts';
  }
  
  // 处理使用点分隔符的情况: context.controller.ts -> context-controller.ts
  if (fileName.includes('.') && !fileName.endsWith('.ts')) {
    const parts = fileName.split('.');
    const componentType = parts[parts.length - 2];
    return `${moduleName}-${componentType}.ts`;
  }
  
  // 处理使用驼峰命名的情况: contextManager.ts -> context-manager.ts
  if (/^[a-z]+[A-Z]/.test(fileName)) {
    // 将驼峰命名转换为kebab-case
    const componentType = fileName
      .replace(/\.ts$/, '')
      .replace(moduleName, '')
      .replace(/([A-Z])/g, '-$1')
      .toLowerCase();
    
    return `${moduleName}${componentType}.ts`;
  }
  
  // 处理使用下划线的情况: plan_manager.ts -> plan-manager.ts
  if (fileName.includes('_')) {
    return fileName.replace(/_/g, '-');
  }
  
  // 处理首字母大写的情况: Plan-factory.ts -> plan-factory.ts
  if (/^[A-Z]/.test(fileName)) {
    return fileName.toLowerCase();
  }
  
  // 处理其他不规范的情况，尝试提取组件类型
  for (const componentType of COMPONENT_TYPES) {
    if (fileName.toLowerCase().includes(componentType)) {
      return `${moduleName}-${componentType}.ts`;
    }
  }
  
  // 如果无法推断，保留原文件名
  return fileName;
}

/**
 * 查找所有需要重命名的文件
 */
async function findFilesToRename(): Promise<FileToRename[]> {
  const filesToRename: FileToRename[] = [];
  
  // 遍历所有模块目录
  for (const moduleName of CORE_MODULES) {
    const moduleDir = path.join('src/modules', moduleName);
    
    // 检查模块目录是否存在
    if (!fs.existsSync(moduleDir)) {
      console.log(chalk.yellow(`模块目录不存在: ${moduleDir}`));
      continue;
    }
    
    // 获取模块目录下的所有文件
    const files = await glob(`${moduleDir}/**/*.ts`, {
      ignore: EXCLUDE_DIRS.map(dir => `${moduleDir}/${dir}/**`)
    });
    
    // 检查每个文件是否符合命名规范
    for (const filePath of files) {
      const fileName = path.basename(filePath);
      const dirName = path.dirname(filePath);
      
      // 排除测试文件和index文件
      if (fileName === 'index.ts' || fileName.endsWith('.test.ts') || fileName.endsWith('.spec.ts')) {
        continue;
      }
      
      // 检查文件名是否符合规范
      if (!isValidFileName(fileName, moduleName)) {
        const correctFileName = inferCorrectFileName(fileName, moduleName);
        
        // 如果能够推断出正确的文件名
        if (correctFileName !== fileName) {
          // 提取组件类型
          const componentType = correctFileName
            .replace(`${moduleName}-`, '')
            .replace('.ts', '');
          
          filesToRename.push({
            oldPath: filePath,
            newPath: path.join(dirName, correctFileName),
            moduleName,
            componentType
          });
        }
      }
    }
  }
  
  return filesToRename;
}

/**
 * 更新导入语句
 */
async function updateImports(filesToRename: FileToRename[]): Promise<void> {
  // 创建旧路径到新路径的映射
  const pathMap = new Map<string, string>();
  for (const file of filesToRename) {
    const oldRelativePath = path.relative('src', file.oldPath).replace(/\.ts$/, '');
    const newRelativePath = path.relative('src', file.newPath).replace(/\.ts$/, '');
    pathMap.set(oldRelativePath, newRelativePath);
  }
  
  // 获取所有TypeScript文件
  const allFiles = await glob('src/**/*.ts', {
    ignore: EXCLUDE_DIRS.map(dir => `src/${dir}/**`)
  });
  
  // 更新每个文件中的导入语句
  for (const filePath of allFiles) {
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;
    
    // 检查并更新导入语句
    for (const [oldPath, newPath] of pathMap.entries()) {
      // 匹配导入语句
      const importRegex = new RegExp(`from ['"](.*${oldPath})['"]`, 'g');
      const newContent = content.replace(importRegex, (match, p1) => {
        hasChanges = true;
        return match.replace(p1, p1.replace(oldPath, newPath));
      });
      
      if (newContent !== content) {
        content = newContent;
      }
    }
    
    // 如果有更改，写回文件
    if (hasChanges) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(chalk.green(`更新导入语句: ${filePath}`));
    }
  }
}

/**
 * 重命名文件
 */
async function renameFiles(filesToRename: FileToRename[]): Promise<void> {
  console.log(chalk.blue('=== 开始重命名文件 ==='));
  
  // 先更新导入语句，再重命名文件
  await updateImports(filesToRename);
  
  // 重命名文件
  for (const file of filesToRename) {
    try {
      // 确保目标目录存在
      const targetDir = path.dirname(file.newPath);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      
      // 重命名文件
      fs.renameSync(file.oldPath, file.newPath);
      console.log(chalk.green(`✅ 重命名: ${file.oldPath} -> ${file.newPath}`));
    } catch (error) {
      console.error(chalk.red(`❌ 重命名失败: ${file.oldPath}`), error);
    }
  }
  
  console.log(chalk.blue(`=== 重命名完成，共处理 ${filesToRename.length} 个文件 ===`));
}

/**
 * 生成重命名计划报告
 */
function generateReport(filesToRename: FileToRename[]): void {
  console.log(chalk.blue('=== 文件重命名计划 ==='));
  console.log(chalk.yellow(`共发现 ${filesToRename.length} 个不符合命名规范的文件`));
  
  // 按模块分组显示
  const filesByModule = new Map<string, FileToRename[]>();
  for (const file of filesToRename) {
    if (!filesByModule.has(file.moduleName)) {
      filesByModule.set(file.moduleName, []);
    }
    filesByModule.get(file.moduleName)!.push(file);
  }
  
  // 显示每个模块的重命名计划
  for (const [moduleName, files] of filesByModule.entries()) {
    console.log(chalk.cyan(`\n模块: ${moduleName} (${files.length} 个文件)`));
    for (const file of files) {
      const oldFileName = path.basename(file.oldPath);
      const newFileName = path.basename(file.newPath);
      console.log(`  ${chalk.red(oldFileName)} -> ${chalk.green(newFileName)}`);
    }
  }
  
  console.log('\n');
}

/**
 * 主函数
 */
async function main(): Promise<void> {
  console.log(chalk.blue('=== MPLP 文件命名规范化工具 ==='));
  
  // 查找需要重命名的文件
  const filesToRename = await findFilesToRename();
  
  // 如果没有需要重命名的文件，直接退出
  if (filesToRename.length === 0) {
    console.log(chalk.green('✅ 所有文件都符合命名规范，无需重命名。'));
    return;
  }
  
  // 生成重命名计划报告
  generateReport(filesToRename);
  
  // 询问用户是否继续
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  readline.question(chalk.yellow('是否执行重命名操作? (y/n) '), (answer: string) => {
    readline.close();
    if (answer.toLowerCase() === 'y') {
      renameFiles(filesToRename).catch(error => {
        console.error(chalk.red('重命名过程中发生错误:'), error);
      });
    } else {
      console.log(chalk.yellow('已取消重命名操作。'));
    }
  });
}

// 执行主函数
main().catch(error => {
  console.error(chalk.red('脚本执行错误:'), error);
  process.exit(1);
}); 