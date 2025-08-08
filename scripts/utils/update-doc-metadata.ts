#!/usr/bin/env ts-node

/**
 * 批量更新文档元数据脚本
 * 为所有文档添加统一的元数据头部
 */

import * as fs from 'fs';
import * as path from 'path';

const METADATA_TEMPLATE = `<!--
文档元数据
版本: v1.0.0
创建时间: 2025-08-06T00:35:06Z
最后更新: 2025-08-06T00:35:06Z
文档状态: 已完成
-->

`;

const LEGACY_METADATA_TEMPLATE = `<!--
文档元数据
版本: v1.0.0
创建时间: 2025-08-06T00:35:06Z
最后更新: 2025-08-06T00:35:06Z
文档状态: 已归档
-->

`;

// 需要更新的文档列表
const DOCS_TO_UPDATE = [
  // 05-testing 目录
  'docs/05-testing/complete-test-roadmap.md',
  'docs/05-testing/core-test-fixes-summary.md',
  'docs/05-testing/e2e-test-report.md',
  'docs/05-testing/integration-test-report.md',
  'docs/05-testing/legacy-testing.md',
  'docs/05-testing/mplp-performance-analysis.md',
  'docs/05-testing/mplp-testing-complete-report.md',
  'docs/05-testing/mplp-testing-standards.md',
  'docs/05-testing/performance-enhancement-guide.md',
  'docs/05-testing/real-business-performance-report.md',
  'docs/05-testing/realistic-performance-analysis.md',
  'docs/05-testing/schema-driven-testing-guide.md',
  'docs/05-testing/test-data-management-guide.md',
  'docs/05-testing/test-fixes-report.md',
  'docs/05-testing/test-results-summary.md',
  'docs/05-testing/test-status-dashboard.md',
  'docs/05-testing/testing-principles-summary.md',
  'docs/05-testing/unit-test-progress.md',
  
  // 06-deployment 目录
  'docs/06-deployment/CIRCLECI_BEST_PRACTICES.md',
  'docs/06-deployment/CIRCLECI_IMPLEMENTATION_SUMMARY.md',
  'docs/06-deployment/CIRCLECI_SETUP.md',
  'docs/06-deployment/RELEASE_NOTES.md',
  'docs/06-deployment/RELEASE_PROCESS.md',
  'docs/06-deployment/content-review-checklist.md',
  'docs/06-deployment/deployment.md',
  'docs/06-deployment/opensource-release-strategy.md',
  'docs/06-deployment/release-best-practices-analysis.md',
  'docs/06-deployment/release-guide.md',
  'docs/06-deployment/release-plan.md',
  'docs/06-deployment/release-timeline.md',
  'docs/06-deployment/version-content-specification.md',
  
  // 07-api 目录
  'docs/07-api/context-api.md',
  'docs/07-api/core-api.md',
  'docs/07-api/core-protocol-api.md',
  'docs/07-api/plan-api.md'
];

// Legacy文档列表（使用归档状态）
const LEGACY_DOCS = [
  'docs/05-testing/legacy-testing.md'
];

function hasMetadata(content: string): boolean {
  return content.includes('文档元数据');
}

function addMetadataToDoc(filePath: string): void {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  文件不存在: ${filePath}`);
      return;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    
    if (hasMetadata(content)) {
      console.log(`✅ 已有元数据: ${filePath}`);
      return;
    }

    const lines = content.split('\n');
    const titleLineIndex = lines.findIndex(line => line.startsWith('#'));
    
    if (titleLineIndex === -1) {
      console.log(`⚠️  未找到标题: ${filePath}`);
      return;
    }

    const isLegacy = LEGACY_DOCS.includes(filePath);
    const metadata = isLegacy ? LEGACY_METADATA_TEMPLATE : METADATA_TEMPLATE;
    
    // 在标题后插入元数据
    const newLines = [
      ...lines.slice(0, titleLineIndex + 1),
      '',
      metadata.trim(),
      '',
      ...lines.slice(titleLineIndex + 1)
    ];

    const newContent = newLines.join('\n');
    fs.writeFileSync(filePath, newContent, 'utf-8');
    
    console.log(`✅ 已更新: ${filePath}`);
  } catch (error) {
    console.error(`❌ 更新失败 ${filePath}:`, error.message);
  }
}

function main(): void {
  console.log('🚀 开始批量更新文档元数据...\n');
  
  let updatedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (const docPath of DOCS_TO_UPDATE) {
    try {
      const fullPath = path.resolve(docPath);
      
      if (!fs.existsSync(fullPath)) {
        console.log(`⚠️  文件不存在: ${docPath}`);
        skippedCount++;
        continue;
      }

      const content = fs.readFileSync(fullPath, 'utf-8');
      
      if (hasMetadata(content)) {
        console.log(`✅ 已有元数据: ${docPath}`);
        skippedCount++;
        continue;
      }

      addMetadataToDoc(fullPath);
      updatedCount++;
      
    } catch (error) {
      console.error(`❌ 处理失败 ${docPath}:`, error.message);
      errorCount++;
    }
  }

  console.log('\n📊 更新统计:');
  console.log(`✅ 已更新: ${updatedCount} 个文件`);
  console.log(`⏭️  已跳过: ${skippedCount} 个文件`);
  console.log(`❌ 失败: ${errorCount} 个文件`);
  console.log(`📋 总计: ${DOCS_TO_UPDATE.length} 个文件`);
  
  if (errorCount === 0) {
    console.log('\n🎉 所有文档元数据更新完成！');
  } else {
    console.log('\n⚠️  部分文档更新失败，请检查错误信息。');
  }
}

if (require.main === module) {
  main();
}

export { addMetadataToDoc, hasMetadata };
