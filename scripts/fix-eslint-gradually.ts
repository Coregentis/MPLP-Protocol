#!/usr/bin/env ts-node

/**
 * 渐进式ESLint修复脚本
 * 按优先级分批修复ESLint问题，避免一次性修复导致的风险
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface ESLintResult {
  filePath: string;
  messages: Array<{
    ruleId: string;
    severity: number;
    message: string;
    line: number;
    column: number;
  }>;
  errorCount: number;
  warningCount: number;
}

class GradualESLintFixer {
  private readonly phases = [
    {
      name: '阶段1: 修复未使用的导入和变量',
      rules: ['@typescript-eslint/no-unused-vars', 'no-unused-vars'],
      priority: 1
    },
    {
      name: '阶段2: 修复类型定义问题',
      rules: ['no-undef', '@typescript-eslint/no-undef'],
      priority: 2
    },
    {
      name: '阶段3: 修复代码风格问题',
      rules: ['no-case-declarations', 'no-useless-escape'],
      priority: 3
    },
    {
      name: '阶段4: 清理any类型使用',
      rules: ['@typescript-eslint/no-explicit-any'],
      priority: 4
    },
    {
      name: '阶段5: 清理console语句',
      rules: ['no-console'],
      priority: 5
    }
  ];

  async runESLint(): Promise<ESLintResult[]> {
    try {
      const output = execSync('npx eslint src/**/*.ts --format json', {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe']
      });
      return JSON.parse(output);
    } catch (error: any) {
      // ESLint返回非零退出码时仍然有输出
      if (error.stdout) {
        try {
          return JSON.parse(error.stdout);
        } catch (parseError) {
          console.log('ESLint输出:', error.stdout);
          throw parseError;
        }
      }
      throw error;
    }
  }

  analyzeProblems(results: ESLintResult[]) {
    const problemsByRule: Record<string, number> = {};
    let totalErrors = 0;
    let totalWarnings = 0;

    results.forEach(result => {
      totalErrors += result.errorCount;
      totalWarnings += result.warningCount;
      
      result.messages.forEach(message => {
        if (message.ruleId) {
          problemsByRule[message.ruleId] = (problemsByRule[message.ruleId] || 0) + 1;
        }
      });
    });

    return {
      totalErrors,
      totalWarnings,
      problemsByRule,
      totalProblems: totalErrors + totalWarnings
    };
  }

  async fixPhase(phaseIndex: number): Promise<boolean> {
    const phase = this.phases[phaseIndex];
    console.log(`\n🔧 开始${phase.name}...`);

    // 运行自动修复
    try {
      execSync('npm run lint:fix', { stdio: 'inherit' });
      console.log('✅ 自动修复完成');
      return true;
    } catch (error) {
      console.log('⚠️ 自动修复遇到问题，需要手动处理');
      return false;
    }
  }

  async run() {
    console.log('🚀 开始渐进式ESLint修复...\n');

    // 分析当前问题
    const results = await this.runESLint();
    const analysis = this.analyzeProblems(results);

    console.log('📊 当前ESLint问题统计:');
    console.log(`   错误: ${analysis.totalErrors}`);
    console.log(`   警告: ${analysis.totalWarnings}`);
    console.log(`   总计: ${analysis.totalProblems}\n`);

    console.log('🔍 问题分布:');
    Object.entries(analysis.problemsByRule)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .forEach(([rule, count]) => {
        console.log(`   ${rule}: ${count}`);
      });

    // 执行分阶段修复
    for (let i = 0; i < this.phases.length; i++) {
      const success = await this.fixPhase(i);
      
      if (success) {
        // 重新分析问题
        const newResults = await this.runESLint();
        const newAnalysis = this.analyzeProblems(newResults);
        
        console.log(`📈 ${this.phases[i].name}完成:`);
        console.log(`   剩余错误: ${newAnalysis.totalErrors}`);
        console.log(`   剩余警告: ${newAnalysis.totalWarnings}`);
        console.log(`   剩余总计: ${newAnalysis.totalProblems}`);
        
        if (newAnalysis.totalProblems === 0) {
          console.log('\n🎉 所有ESLint问题已修复！');
          break;
        }
      } else {
        console.log(`❌ ${this.phases[i].name}需要手动处理`);
        break;
      }
    }
  }
}

// 运行修复器
if (require.main === module) {
  const fixer = new GradualESLintFixer();
  fixer.run().catch(console.error);
}

export { GradualESLintFixer };
