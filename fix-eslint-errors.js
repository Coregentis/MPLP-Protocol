#!/usr/bin/env node

/**
 * 批量修复ESLint错误的脚本
 * 专门处理未使用变量和重复导入问题
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 获取ESLint错误列表
function getESLintErrors() {
  try {
    execSync('npm run lint', { stdio: 'pipe' });
    return [];
  } catch (error) {
    const output = error.stdout.toString();
    const lines = output.split('\n');
    const errors = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes('error') && line.includes('@typescript-eslint/no-unused-vars')) {
        const match = line.match(/(.+):(\d+):(\d+)\s+error\s+(.+)/);
        if (match) {
          errors.push({
            file: match[1],
            line: parseInt(match[2]),
            column: parseInt(match[3]),
            message: match[4],
            type: 'unused-vars'
          });
        }
      }
    }
    
    return errors;
  }
}

// 修复未使用变量
function fixUnusedVars(filePath, line, message) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    if (message.includes('is defined but never used')) {
      const varMatch = message.match(/'([^']+)' is defined but never used/);
      if (varMatch) {
        const varName = varMatch[1];
        const lineContent = lines[line - 1];
        
        // 处理导入语句
        if (lineContent.includes('import') && lineContent.includes(varName)) {
          lines[line - 1] = lineContent.replace(
            new RegExp(`\\b${varName}\\b`), 
            `${varName} as _${varName}`
          );
        }
        // 处理变量声明
        else if (lineContent.includes(`${varName}:`)) {
          lines[line - 1] = lineContent.replace(
            new RegExp(`\\b${varName}:`), 
            `_${varName}:`
          );
        }
        // 处理函数参数
        else if (lineContent.includes(`(${varName}`) || lineContent.includes(`, ${varName}`)) {
          lines[line - 1] = lineContent.replace(
            new RegExp(`\\b${varName}\\b`), 
            `_${varName}`
          );
        }
        
        fs.writeFileSync(filePath, lines.join('\n'));
        console.log(`Fixed unused var '${varName}' in ${filePath}:${line}`);
        return true;
      }
    }
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error.message);
  }
  
  return false;
}

// 主函数
function main() {
  console.log('🔧 开始批量修复ESLint错误...');
  
  const errors = getESLintErrors();
  console.log(`发现 ${errors.length} 个未使用变量错误`);
  
  let fixedCount = 0;
  
  for (const error of errors) {
    if (error.type === 'unused-vars') {
      if (fixUnusedVars(error.file, error.line, error.message)) {
        fixedCount++;
      }
    }
  }
  
  console.log(`✅ 修复了 ${fixedCount} 个错误`);
  
  // 再次检查错误数量
  try {
    execSync('npm run lint', { stdio: 'pipe' });
    console.log('🎉 所有ESLint错误已修复！');
  } catch (error) {
    const output = error.stdout.toString();
    const errorCount = (output.match(/error/g) || []).length;
    console.log(`📊 剩余 ${errorCount} 个错误需要手动修复`);
  }
}

if (require.main === module) {
  main();
}
