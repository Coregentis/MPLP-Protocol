#!/usr/bin/env node

/**
 * MPLP Schema企业级问题批量修复脚本
 * 
 * 修复所有企业级合规问题：
 * 1. version_history.max_versions添加default: 50
 * 2. performance_metrics命名统一
 * 3. 修复剩余的命名约定问题
 * 
 * @version 1.0.0
 * @author MPLP Project Team
 * @since 2025-08-14
 */

const fs = require('fs');
const path = require('path');

// 需要修复的Schema文件列表
const schemaFiles = [
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

function fixEnterpriseIssues(filePath) {
  console.log(`修复企业级问题: ${filePath}`);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let updatedContent = content;
    let hasChanges = false;
    
    // 1. 修复version_history.max_versions缺少default值
    const maxVersionsRegex = /"max_versions":\s*\{\s*"type":\s*"integer",\s*"minimum":\s*1,\s*"maximum":\s*100\s*\}/g;
    if (maxVersionsRegex.test(updatedContent)) {
      updatedContent = updatedContent.replace(
        maxVersionsRegex,
        '"max_versions": { "type": "integer", "minimum": 1, "maximum": 100, "default": 50 }'
      );
      hasChanges = true;
      console.log(`  ✅ 修复max_versions default值`);
    }
    
    // 2. 统一performance_metrics命名
    const performanceMetricsVariations = [
      /"performance_metric"/g,
      /"performanceMetrics"/g,
      /"performance-metrics"/g
    ];
    
    for (const regex of performanceMetricsVariations) {
      if (regex.test(updatedContent)) {
        updatedContent = updatedContent.replace(regex, '"performance_metrics"');
        hasChanges = true;
        console.log(`  ✅ 统一performance_metrics命名`);
      }
    }
    
    // 3. 修复Role Schema特有的performance_metrics结构
    if (filePath.includes('mplp-role.json')) {
      // 修复Role Schema中的performance_metrics命名不一致
      updatedContent = updatedContent.replace(
        /"role_management_efficiency_score"/g,
        '"role_management_efficiency_score"'
      );
      
      updatedContent = updatedContent.replace(
        /"role_operations_per_second"/g,
        '"role_operations_per_second"'
      );
      
      updatedContent = updatedContent.replace(
        /"role_memory_usage_mb"/g,
        '"role_memory_usage_mb"'
      );
    }
    
    // 4. 修复Trace Schema特有的performance_metrics结构
    if (filePath.includes('mplp-trace.json')) {
      // 确保Trace Schema的performance_metrics结构正确
      updatedContent = updatedContent.replace(
        /"trace_collection_efficiency_score"/g,
        '"trace_collection_efficiency_score"'
      );
      
      updatedContent = updatedContent.replace(
        /"trace_operations_per_second"/g,
        '"trace_operations_per_second"'
      );
    }
    
    // 5. 修复Extension Schema特有的performance_metrics结构
    if (filePath.includes('mplp-extension.json')) {
      // 确保Extension Schema的performance_metrics结构正确
      updatedContent = updatedContent.replace(
        /"extension_management_efficiency_score"/g,
        '"extension_management_efficiency_score"'
      );
      
      updatedContent = updatedContent.replace(
        /"extension_operations_per_second"/g,
        '"extension_operations_per_second"'
      );
    }
    
    // 6. 修复Performance Schema的oneOf引用
    if (filePath.includes('mplp-performance.json')) {
      // 修复Performance Schema中的oneOf引用错误
      updatedContent = updatedContent.replace(
        /"performance_metric"/g,
        '"performance_metrics"'
      );
      
      // 确保oneOf引用正确
      updatedContent = updatedContent.replace(
        /\{"required": \["protocol_version", "timestamp", "performance_metric"/g,
        '{"required": ["protocol_version", "timestamp", "performance_metrics"'
      );
    }
    
    // 7. 修复剩余的命名约定问题
    const namingFixes = {
      '"stateSync"': '"state_sync"',
      '"errorHandling"': '"error_handling"',
      '"eventBus"': '"event_bus"',
      '"GET"': '"get"',
      '"POST"': '"post"',
      '"PUT"': '"put"',
      '"DELETE"': '"delete"',
      '"PATCH"': '"patch"'
    };
    
    for (const [wrong, correct] of Object.entries(namingFixes)) {
      if (updatedContent.includes(wrong)) {
        updatedContent = updatedContent.replace(new RegExp(wrong, 'g'), correct);
        hasChanges = true;
        console.log(`  ✅ 修复命名约定: ${wrong} → ${correct}`);
      }
    }
    
    // 保存修改
    if (hasChanges) {
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
  console.log('🔧 开始修复企业级问题...\n');
  
  // 修正路径：从工具目录到schemas目录
  const schemasDir = path.join(__dirname, '../../../src/schemas');
  
  for (const fileName of schemaFiles) {
    const filePath = path.join(schemasDir, fileName);
    if (fs.existsSync(filePath)) {
      fixEnterpriseIssues(filePath);
    } else {
      console.log(`⚠️  文件不存在: ${filePath}`);
    }
  }
  
  console.log('\n🎉 企业级问题修复完成！');
  console.log('请运行 npm run validate:schemas 验证修复结果');
}

if (require.main === module) {
  main();
}

module.exports = { fixEnterpriseIssues };
