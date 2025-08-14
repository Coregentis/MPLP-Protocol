/**
 * MPLP协议验证工具使用示例
 * 
 * @description 演示如何使用MPLP协议验证工具
 * @version 1.0.0
 * @author MPLP Development Team
 * @standardized MPLP协议模块标准化规范 v1.0.0
 */

import {
  // Schema验证器
  MPLPSchemaValidator,
  ValidationOptions,
  
  // 兼容性检查器
  checkSchemaCompatibility,
  checkAllSchemaCompatibility,
  checkModuleReferences,
  
  // 协议测试套件
  runProtocolTests,
  TestConfiguration,
  TestType,
  
  // CI集成工具
  runCIIntegration,
  CIConfiguration,
  CICheckType,
  ReportFormat,
  
  // 协议文档生成器
  generateProtocolDocumentation,
  DocumentationConfig,
  DocumentFormat
} from '../src/validation';

import { SchemaName } from '../src/schemas';

/**
 * 示例1: 基础Schema验证
 */
async function exampleBasicSchemaValidation(): Promise<void> {
  console.log('🧪 Example 1: Basic Schema Validation');
  
  const validator = new MPLPSchemaValidator();
  
  // 验证有效数据
  const validData = {
    context_id: '550e8400-e29b-41d4-a716-446655440000',
    created_at: new Date().toISOString(),
    context_type: 'user_session'
  };
  
  const validationOptions: ValidationOptions = {
    strictMode: true,
    validateReferences: true,
    generateWarnings: true
  };
  
  try {
    const result = validator.validate('context' as SchemaName, validData, validationOptions);
    
    if (result.isValid) {
      console.log('✅ Validation passed');
      console.log(`📊 Validation score: ${result.validationScore}`);
    } else {
      console.log('❌ Validation failed');
      console.log('Errors:', result.errors.map(e => e.errorMessage));
    }
    
    if (result.warnings.length > 0) {
      console.log('⚠️  Warnings:', result.warnings.map(w => w.warningMessage));
    }
  } catch (error) {
    console.error('❌ Validation error:', error);
  }
  
  console.log('');
}

/**
 * 示例2: 兼容性检查
 */
async function exampleCompatibilityCheck(): Promise<void> {
  console.log('🔗 Example 2: Compatibility Check');
  
  try {
    // 检查两个Schema之间的兼容性
    const compatibilityResult = checkSchemaCompatibility('coordination' as SchemaName, 'orchestration' as SchemaName);
    
    console.log(`🔍 Checking compatibility: coordination <-> orchestration`);
    console.log(`✅ Compatible: ${compatibilityResult.isCompatible}`);
    console.log(`📊 Compatibility score: ${compatibilityResult.compatibilityScore}`);
    
    if (compatibilityResult.incompatibilities.length > 0) {
      console.log('❌ Incompatibilities found:');
      compatibilityResult.incompatibilities.forEach(issue => {
        console.log(`  - ${issue.description} (${issue.severity})`);
      });
    }
    
    if (compatibilityResult.recommendations.length > 0) {
      console.log('💡 Recommendations:');
      compatibilityResult.recommendations.forEach(rec => {
        console.log(`  - ${rec}`);
      });
    }
    
    // 检查所有Schema的兼容性矩阵
    console.log('\n🌐 Checking all schema compatibility...');
    const allCompatibility = checkAllSchemaCompatibility();
    
    let compatiblePairs = 0;
    let totalPairs = 0;
    
    for (const [pair, result] of allCompatibility.entries()) {
      totalPairs++;
      if (result.isCompatible) {
        compatiblePairs++;
      }
    }
    
    console.log(`📈 Overall compatibility: ${compatiblePairs}/${totalPairs} pairs compatible`);
    
  } catch (error) {
    console.error('❌ Compatibility check error:', error);
  }
  
  console.log('');
}

/**
 * 示例3: 模块引用检查
 */
async function exampleModuleReferenceCheck(): Promise<void> {
  console.log('🔍 Example 3: Module Reference Check');
  
  try {
    const referenceResult = checkModuleReferences();
    
    console.log(`✅ Module references valid: ${referenceResult.isCompatible}`);
    console.log(`📊 Reference integrity score: ${referenceResult.compatibilityScore}`);
    
    if (referenceResult.incompatibilities.length > 0) {
      console.log('❌ Reference issues found:');
      referenceResult.incompatibilities.forEach(issue => {
        console.log(`  - ${issue.description} (${issue.severity})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Module reference check error:', error);
  }
  
  console.log('');
}

/**
 * 示例4: 协议测试套件
 */
async function exampleProtocolTestSuite(): Promise<void> {
  console.log('🧪 Example 4: Protocol Test Suite');
  
  const testConfig: TestConfiguration = {
    enabledTestTypes: [TestType.SCHEMA_VALIDATION, TestType.COMPATIBILITY_CHECK],
    schemaFilter: ['context', 'coordination', 'orchestration'] as SchemaName[],
    parallelExecution: true,
    generateReport: true,
    reportFormat: 'json'
  };
  
  try {
    const testResult = await runProtocolTests(testConfig);
    
    console.log(`📊 Test Results Summary:`);
    console.log(`  Total Tests: ${testResult.totalTests}`);
    console.log(`  Passed: ${testResult.passedTests}`);
    console.log(`  Failed: ${testResult.failedTests}`);
    console.log(`  Skipped: ${testResult.skippedTests}`);
    console.log(`  Success Rate: ${testResult.summary.successRate.toFixed(2)}%`);
    console.log(`  Execution Time: ${testResult.executionTime}ms`);
    
    if (testResult.summary.criticalIssues > 0) {
      console.log(`❌ Critical Issues: ${testResult.summary.criticalIssues}`);
    }
    
    if (testResult.summary.warnings > 0) {
      console.log(`⚠️  Warnings: ${testResult.summary.warnings}`);
    }
    
    if (testResult.summary.recommendations.length > 0) {
      console.log('💡 Recommendations:');
      testResult.summary.recommendations.slice(0, 3).forEach(rec => {
        console.log(`  - ${rec}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Protocol test suite error:', error);
  }
  
  console.log('');
}

/**
 * 示例5: CI集成
 */
async function exampleCIIntegration(): Promise<void> {
  console.log('🚀 Example 5: CI Integration');
  
  const ciConfig: CIConfiguration = {
    enabledChecks: [
      CICheckType.SCHEMA_VALIDATION,
      CICheckType.COMPATIBILITY_CHECK,
      CICheckType.PERFORMANCE_TEST
    ],
    failOnWarnings: false,
    failOnCompatibilityIssues: true,
    generateReports: true,
    reportFormats: [ReportFormat.JSON, ReportFormat.HTML],
    outputDirectory: './ci-reports',
    parallelExecution: true,
    timeoutMinutes: 5,
    retryCount: 2
  };
  
  try {
    const ciResult = await runCIIntegration(ciConfig);
    
    console.log(`🎯 CI Integration Results:`);
    console.log(`  Success: ${ciResult.success ? '✅' : '❌'}`);
    console.log(`  Exit Code: ${ciResult.exitCode}`);
    console.log(`  Total Checks: ${ciResult.summary.totalChecks}`);
    console.log(`  Passed: ${ciResult.summary.passedChecks}`);
    console.log(`  Failed: ${ciResult.summary.failedChecks}`);
    console.log(`  Execution Time: ${ciResult.executionTime}ms`);
    
    if (ciResult.summary.blockers.length > 0) {
      console.log('🚫 Blockers:');
      ciResult.summary.blockers.forEach(blocker => {
        console.log(`  - ${blocker}`);
      });
    }
    
    if (ciResult.reportUrls.length > 0) {
      console.log('📄 Reports Generated:');
      ciResult.reportUrls.forEach(url => {
        console.log(`  - ${url}`);
      });
    }
    
  } catch (error) {
    console.error('❌ CI integration error:', error);
  }
  
  console.log('');
}

/**
 * 示例6: 协议文档生成
 */
async function exampleDocumentationGeneration(): Promise<void> {
  console.log('📚 Example 6: Documentation Generation');
  
  const docConfig: DocumentationConfig = {
    outputFormat: [DocumentFormat.MARKDOWN, DocumentFormat.HTML],
    includeExamples: true,
    includeCompatibilityMatrix: true,
    includeValidationRules: true,
    includePerformanceMetrics: false,
    outputDirectory: './docs/generated'
  };
  
  try {
    const documents = await generateProtocolDocumentation(docConfig);
    
    console.log(`📖 Documentation Generation Results:`);
    console.log(`  Documents Generated: ${documents.length}`);
    
    documents.forEach(doc => {
      console.log(`  📄 ${doc.format.toUpperCase()}: ${doc.filepath}`);
      console.log(`    - Size: ${doc.size} bytes`);
      console.log(`    - Sections: ${doc.sections.length}`);
      console.log(`    - Schemas Covered: ${doc.metadata.schemaCount}`);
    });
    
  } catch (error) {
    console.error('❌ Documentation generation error:', error);
  }
  
  console.log('');
}

/**
 * 示例7: 完整的验证工作流
 */
async function exampleCompleteValidationWorkflow(): Promise<void> {
  console.log('🔄 Example 7: Complete Validation Workflow');
  
  try {
    // 步骤1: 基础Schema验证
    console.log('Step 1: Schema Validation...');
    const validator = new MPLPSchemaValidator();
    const schemas = ['context', 'coordination', 'orchestration'] as SchemaName[];
    let allValid = true;
    
    for (const schemaName of schemas) {
      const testData = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        timestamp: new Date().toISOString()
      };
      
      const result = validator.validate(schemaName, testData);
      if (!result.isValid) {
        allValid = false;
        console.log(`❌ ${schemaName} validation failed`);
      }
    }
    
    if (allValid) {
      console.log('✅ All schemas validated successfully');
    }
    
    // 步骤2: 兼容性检查
    console.log('Step 2: Compatibility Check...');
    const compatibilityResults = checkAllSchemaCompatibility();
    const incompatiblePairs = Array.from(compatibilityResults.values())
      .filter(result => !result.isCompatible).length;
    
    if (incompatiblePairs === 0) {
      console.log('✅ All schemas are compatible');
    } else {
      console.log(`⚠️  Found ${incompatiblePairs} incompatible schema pairs`);
    }
    
    // 步骤3: 运行测试套件
    console.log('Step 3: Running Test Suite...');
    const testResult = await runProtocolTests({
      enabledTestTypes: [TestType.SCHEMA_VALIDATION, TestType.COMPATIBILITY_CHECK],
      parallelExecution: true
    });
    
    const successRate = testResult.summary.successRate;
    if (successRate >= 95) {
      console.log(`✅ Test suite passed with ${successRate.toFixed(1)}% success rate`);
    } else {
      console.log(`⚠️  Test suite completed with ${successRate.toFixed(1)}% success rate`);
    }
    
    // 步骤4: 生成报告
    console.log('Step 4: Generating Documentation...');
    const documents = await generateProtocolDocumentation({
      outputFormat: [DocumentFormat.MARKDOWN],
      includeExamples: true,
      includeCompatibilityMatrix: true
    });
    
    console.log(`✅ Generated ${documents.length} documentation files`);
    
    // 工作流总结
    console.log('\n📊 Validation Workflow Summary:');
    console.log(`  Schema Validation: ${allValid ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`  Compatibility Check: ${incompatiblePairs === 0 ? '✅ PASSED' : '⚠️  WARNINGS'}`);
    console.log(`  Test Suite: ${successRate >= 95 ? '✅ PASSED' : '⚠️  WARNINGS'}`);
    console.log(`  Documentation: ✅ GENERATED`);
    
  } catch (error) {
    console.error('❌ Validation workflow error:', error);
  }
  
  console.log('');
}

/**
 * 主函数 - 运行所有示例
 */
async function main(): Promise<void> {
  console.log('🚀 MPLP Protocol Validation Tools - Usage Examples\n');
  
  try {
    await exampleBasicSchemaValidation();
    await exampleCompatibilityCheck();
    await exampleModuleReferenceCheck();
    await exampleProtocolTestSuite();
    await exampleCIIntegration();
    await exampleDocumentationGeneration();
    await exampleCompleteValidationWorkflow();
    
    console.log('🎉 All examples completed successfully!');
    
  } catch (error) {
    console.error('❌ Example execution failed:', error);
    process.exit(1);
  }
}

// 运行示例
if (require.main === module) {
  main().catch(console.error);
}

// 导出示例函数供其他模块使用
export {
  exampleBasicSchemaValidation,
  exampleCompatibilityCheck,
  exampleModuleReferenceCheck,
  exampleProtocolTestSuite,
  exampleCIIntegration,
  exampleDocumentationGeneration,
  exampleCompleteValidationWorkflow
};
