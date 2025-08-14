#!/usr/bin/env node

/**
 * MPLP Schema头部信息修复脚本
 * 
 * 修复所有Schema中的$schema和$id格式
 * 
 * @version 1.0.0
 * @author MPLP Project Team
 * @since 2025-08-14
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

function fixSchemaHeaders(filePath) {
  console.log(`修复Schema头部: ${filePath}`);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let updatedContent = content;
    
    // 修复$schema
    updatedContent = updatedContent.replace(
      /"http:\/\/json-schema_org\/draft-07\/schema#"/g,
      '"http://json-schema.org/draft-07/schema#"'
    );
    
    // 修复$id
    updatedContent = updatedContent.replace(
      /"https:\/\/mplp_dev\/schemas\/v1\.0\/(mplp-[a-z-]+)_json"/g,
      '"https://mplp.dev/schemas/v1.0/$1.json"'
    );
    
    // 修复version_history.max_versions
    updatedContent = updatedContent.replace(
      /"max_versions": \{\s*"type": "integer",\s*"minimum": 1,\s*"maximum": 100,\s*"default": 10\s*\}/g,
      '"max_versions": {\n        "type": "integer",\n        "minimum": 1,\n        "maximum": 100,\n        "default": 50\n      }'
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
  console.log('🔧 开始修复Schema头部信息...\n');
  
  // 修正路径：从工具目录到schemas目录
  const schemasDir = path.join(__dirname, '../../../src/schemas');
  
  for (const fileName of schemaFiles) {
    const filePath = path.join(schemasDir, fileName);
    if (fs.existsSync(filePath)) {
      fixSchemaHeaders(filePath);
    } else {
      console.log(`⚠️  文件不存在: ${filePath}`);
    }
  }
  
  console.log('\n🎉 Schema头部修复完成！');
}

if (require.main === module) {
  main();
}

module.exports = { fixSchemaHeaders };
