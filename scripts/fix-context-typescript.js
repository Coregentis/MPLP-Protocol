#!/usr/bin/env node
/**
 * 修复Context模块TypeScript编译错误的脚本
 * 主要修复Map迭代器问题
 * 
 * @version 1.0.0
 * @created 2025-08-15
 */

const fs = require('fs');
const path = require('path');

function log(message, level = 'INFO') {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${level}] ${message}`);
}

function fixMapIteratorIssues() {
  const filePath = 'src/modules/context/infrastructure/repositories/context.repository.ts';
  
  if (!fs.existsSync(filePath)) {
    log(`文件不存在: ${filePath}`, 'ERROR');
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let fixCount = 0;

  // 修复所有的 Map.values() 迭代器问题
  const regex = /for \(const context of this\.contexts\.values\(\)\)/g;
  const replacement = 'for (const context of Array.from(this.contexts.values()))';
  
  const matches = content.match(regex);
  if (matches) {
    content = content.replace(regex, replacement);
    fixCount = matches.length;
    
    fs.writeFileSync(filePath, content);
    log(`修复了 ${fixCount} 个Map迭代器问题`);
  } else {
    log('没有发现需要修复的Map迭代器问题');
  }

  return fixCount;
}

function main() {
  log('🔧 开始修复Context模块TypeScript编译错误...');
  
  const fixCount = fixMapIteratorIssues();
  
  if (fixCount > 0) {
    log(`✅ 成功修复 ${fixCount} 个TypeScript编译错误`);
  } else {
    log('⚠️ 没有发现需要修复的问题');
  }
  
  log('🎉 Context模块TypeScript修复完成');
}

if (require.main === module) {
  main();
}

module.exports = { fixMapIteratorIssues };
