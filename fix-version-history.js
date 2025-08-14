#!/usr/bin/env node

/**
 * MPLP Schema version_history.max_versions修复脚本
 * 
 * 将所有Schema的max_versions默认值从10改为50
 */

const fs = require('fs');
const path = require('path');

// 需要修复的Schema文件列表
const schemaFiles = [
  'mplp-collab.json',
  'mplp-confirm.json', 
  'mplp-context.json',
  'mplp-coordination.json',
  'mplp-core.json',
  'mplp-dialog.json',
  'mplp-error-handling.json',
  'mplp-event-bus.json',
  'mplp-extension.json',
  'mplp-network.json',
  'mplp-orchestration.json',
  'mplp-performance.json',
  'mplp-plan.json',
  'mplp-protocol-version.json',
  'mplp-role.json',
  'mplp-security.json',
  'mplp-state-sync.json',
  'mplp-trace.json',
  'mplp-transaction.json'
];

function fixVersionHistory(filePath) {
  console.log(`修复version_history: ${filePath}`);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let updatedContent = content;
    
    // 修复max_versions - 添加default字段
    updatedContent = updatedContent.replace(
      /"max_versions":\s*\{\s*"type":\s*"integer",\s*"minimum":\s*1,\s*"maximum":\s*50\s*\}/g,
      '"max_versions": { "type": "integer", "minimum": 1, "maximum": 100, "default": 50 }'
    );

    // 修复max_versions - 更新maximum值
    updatedContent = updatedContent.replace(
      /"max_versions":\s*\{\s*"type":\s*"integer",\s*"minimum":\s*1,\s*"maximum":\s*100\s*\}/g,
      '"max_versions": { "type": "integer", "minimum": 1, "maximum": 100, "default": 50 }'
    );
    
    // 检查是否有变化
    if (updatedContent !== content) {
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      console.log(`✅ 已修复: ${filePath}`);
    } else {
      console.log(`⏭️  无需修复: ${filePath}`);
    }
    
  } catch (error) {
    console.error(`❌ 修复失败 ${filePath}:`, error.message);
  }
}

// 主函数
function main() {
  console.log('🔧 开始修复version_history.max_versions...\n');
  
  const schemasDir = path.join(__dirname, 'src', 'schemas');
  
  for (const fileName of schemaFiles) {
    const filePath = path.join(schemasDir, fileName);
    if (fs.existsSync(filePath)) {
      fixVersionHistory(filePath);
    } else {
      console.log(`⚠️  文件不存在: ${filePath}`);
    }
  }
  
  console.log('\n🎉 version_history修复完成！');
}

if (require.main === module) {
  main();
}

module.exports = { fixVersionHistory };
