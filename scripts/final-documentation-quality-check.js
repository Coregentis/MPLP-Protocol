#!/usr/bin/env node

/**
 * Final Documentation Quality Check
 * Comprehensive validation for professional open-source project documentation
 */

const fs = require('fs');
const path = require('path');

class DocumentationQualityChecker {
  constructor() {
    this.rootDir = path.resolve(__dirname, '..');
    this.docsDir = path.join(this.rootDir, 'docs');
    this.enDir = path.join(this.docsDir, 'en');
    this.zhDir = path.join(this.docsDir, 'zh-CN');
    
    this.results = {
      structure: { passed: 0, failed: 0, issues: [] },
      navigation: { passed: 0, failed: 0, issues: [] },
      consistency: { passed: 0, failed: 0, issues: [] },
      completeness: { passed: 0, failed: 0, issues: [] }
    };
  }

  /**
   * Main quality check function
   */
  async check() {
    console.log('🔍 MPLP Documentation Quality Check');
    console.log('===================================');
    console.log(`📁 Root Directory: ${this.rootDir}`);
    console.log(`📁 Docs Directory: ${this.docsDir}`);
    console.log('');

    // 1. Structure Quality Check
    await this.checkStructureQuality();
    
    // 2. Navigation Quality Check
    await this.checkNavigationQuality();
    
    // 3. Content Consistency Check
    await this.checkContentConsistency();
    
    // 4. Completeness Check
    await this.checkCompleteness();

    this.printFinalResults();
  }

  /**
   * Check documentation structure quality
   */
  async checkStructureQuality() {
    console.log('📋 1. Structure Quality Check');
    console.log('-----------------------------');

    // Check main README exists and is properly structured
    const mainReadme = path.join(this.rootDir, 'README.md');
    if (fs.existsSync(mainReadme)) {
      const content = fs.readFileSync(mainReadme, 'utf8');
      if (content.includes('🌍 **Choose Your Language')) {
        console.log('  ✅ Main README has multilingual navigation');
        this.results.structure.passed++;
      } else {
        console.log('  ❌ Main README missing multilingual navigation');
        this.results.structure.failed++;
        this.results.structure.issues.push('Main README missing multilingual navigation');
      }
    }

    // Check docs/README.md exists and is clean
    const docsReadme = path.join(this.docsDir, 'README.md');
    if (fs.existsSync(docsReadme)) {
      const content = fs.readFileSync(docsReadme, 'utf8');
      if (content.includes('📖 **MPLP Documentation Hub**')) {
        console.log('  ✅ Docs README is properly structured');
        this.results.structure.passed++;
      } else {
        console.log('  ❌ Docs README structure needs improvement');
        this.results.structure.failed++;
        this.results.structure.issues.push('Docs README structure needs improvement');
      }
    }

    // Check that docs root only contains README.md, en/, and zh-CN/
    const docsItems = fs.readdirSync(this.docsDir);
    const allowedItems = ['README.md', 'en', 'zh-CN'];
    const extraItems = docsItems.filter(item => !allowedItems.includes(item));
    
    if (extraItems.length === 0) {
      console.log('  ✅ Docs directory structure is clean');
      this.results.structure.passed++;
    } else {
      console.log(`  ❌ Extra items in docs directory: ${extraItems.join(', ')}`);
      this.results.structure.failed++;
      this.results.structure.issues.push(`Extra items in docs directory: ${extraItems.join(', ')}`);
    }

    console.log('');
  }

  /**
   * Check navigation quality
   */
  async checkNavigationQuality() {
    console.log('🧭 2. Navigation Quality Check');
    console.log('------------------------------');

    // Check main README navigation links
    const mainReadme = path.join(this.rootDir, 'README.md');
    if (fs.existsSync(mainReadme)) {
      const content = fs.readFileSync(mainReadme, 'utf8');
      
      const criticalLinks = [
        'docs/en/developers/quick-start.md',
        'docs/zh-CN/developers/quick-start.md',
        'docs/en/',
        'docs/zh-CN/',
        'docs/en/api-reference/',
        'docs/zh-CN/api-reference/'
      ];

      let validLinks = 0;
      for (const link of criticalLinks) {
        if (content.includes(link)) {
          const fullPath = path.join(this.rootDir, link);
          if (fs.existsSync(fullPath)) {
            validLinks++;
          }
        }
      }

      if (validLinks === criticalLinks.length) {
        console.log('  ✅ All critical navigation links are valid');
        this.results.navigation.passed++;
      } else {
        console.log(`  ❌ ${criticalLinks.length - validLinks} critical links are broken`);
        this.results.navigation.failed++;
        this.results.navigation.issues.push(`${criticalLinks.length - validLinks} critical navigation links are broken`);
      }
    }

    // Check bilingual navigation consistency
    const enReadme = path.join(this.enDir, 'README.md');
    const zhReadme = path.join(this.zhDir, 'README.md');
    
    if (fs.existsSync(enReadme) && fs.existsSync(zhReadme)) {
      console.log('  ✅ Both English and Chinese main documentation exist');
      this.results.navigation.passed++;
    } else {
      console.log('  ❌ Missing main documentation in one or both languages');
      this.results.navigation.failed++;
      this.results.navigation.issues.push('Missing main documentation in one or both languages');
    }

    console.log('');
  }

  /**
   * Check content consistency
   */
  async checkContentConsistency() {
    console.log('📊 3. Content Consistency Check');
    console.log('--------------------------------');

    // Check project status consistency
    const statusFile = path.join(__dirname, 'project-status.json');
    if (fs.existsSync(statusFile)) {
      const status = JSON.parse(fs.readFileSync(statusFile, 'utf8'));
      
      // Check main README for consistent project info
      const mainReadme = path.join(this.rootDir, 'README.md');
      if (fs.existsSync(mainReadme)) {
        const content = fs.readFileSync(mainReadme, 'utf8');
        
        if (content.includes(status.project.version) && 
            content.includes(`${status.quality.tests.passed}/${status.quality.tests.total}`)) {
          console.log('  ✅ Main README has consistent project status');
          this.results.consistency.passed++;
        } else {
          console.log('  ❌ Main README project status is inconsistent');
          this.results.consistency.failed++;
          this.results.consistency.issues.push('Main README project status is inconsistent');
        }
      }

      // Check docs README for consistent project info
      const docsReadme = path.join(this.docsDir, 'README.md');
      if (fs.existsSync(docsReadme)) {
        const content = fs.readFileSync(docsReadme, 'utf8');
        
        if (content.includes(`${status.architecture.modules.completed}/${status.architecture.modules.total}`) &&
            content.includes(`${status.quality.tests.passed}/${status.quality.tests.total}`)) {
          console.log('  ✅ Docs README has consistent project status');
          this.results.consistency.passed++;
        } else {
          console.log('  ❌ Docs README project status is inconsistent');
          this.results.consistency.failed++;
          this.results.consistency.issues.push('Docs README project status is inconsistent');
        }
      }
    }

    console.log('');
  }

  /**
   * Check documentation completeness
   */
  async checkCompleteness() {
    console.log('📋 4. Completeness Check');
    console.log('------------------------');

    // Check essential files exist
    const essentialFiles = [
      'README.md',
      'docs/README.md',
      'docs/en/README.md',
      'docs/zh-CN/README.md',
      'CONTRIBUTING.md',
      'CHANGELOG.md',
      'ROADMAP.md'
    ];

    let existingFiles = 0;
    for (const file of essentialFiles) {
      const fullPath = path.join(this.rootDir, file);
      if (fs.existsSync(fullPath)) {
        existingFiles++;
      } else {
        console.log(`  ❌ Missing essential file: ${file}`);
        this.results.completeness.issues.push(`Missing essential file: ${file}`);
      }
    }

    if (existingFiles === essentialFiles.length) {
      console.log('  ✅ All essential documentation files exist');
      this.results.completeness.passed++;
    } else {
      console.log(`  ❌ Missing ${essentialFiles.length - existingFiles} essential files`);
      this.results.completeness.failed++;
    }

    // Check bilingual coverage
    const enFiles = this.countMarkdownFiles(this.enDir);
    const zhFiles = this.countMarkdownFiles(this.zhDir);
    const coverage = zhFiles / enFiles * 100;

    if (coverage >= 75) {
      console.log(`  ✅ Good bilingual coverage: ${coverage.toFixed(1)}%`);
      this.results.completeness.passed++;
    } else {
      console.log(`  ⚠️  Low bilingual coverage: ${coverage.toFixed(1)}%`);
      this.results.completeness.issues.push(`Low bilingual coverage: ${coverage.toFixed(1)}%`);
    }

    console.log('');
  }

  /**
   * Count markdown files in directory recursively
   */
  countMarkdownFiles(dir) {
    if (!fs.existsSync(dir)) return 0;
    
    let count = 0;
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        count += this.countMarkdownFiles(fullPath);
      } else if (item.endsWith('.md')) {
        count++;
      }
    }
    
    return count;
  }

  /**
   * Print final results
   */
  printFinalResults() {
    console.log('🎯 Final Quality Assessment');
    console.log('===========================');
    
    const totalPassed = Object.values(this.results).reduce((sum, category) => sum + category.passed, 0);
    const totalFailed = Object.values(this.results).reduce((sum, category) => sum + category.failed, 0);
    const totalChecks = totalPassed + totalFailed;
    const successRate = totalChecks > 0 ? (totalPassed / totalChecks * 100) : 0;

    console.log(`📊 Overall Score: ${totalPassed}/${totalChecks} (${successRate.toFixed(1)}%)`);
    console.log('');

    // Category breakdown
    for (const [category, results] of Object.entries(this.results)) {
      const categoryTotal = results.passed + results.failed;
      const categoryRate = categoryTotal > 0 ? (results.passed / categoryTotal * 100) : 0;
      
      console.log(`${this.getCategoryIcon(category)} ${this.getCategoryName(category)}: ${results.passed}/${categoryTotal} (${categoryRate.toFixed(1)}%)`);
      
      if (results.issues.length > 0) {
        results.issues.forEach(issue => {
          console.log(`    ⚠️  ${issue}`);
        });
      }
    }

    console.log('');

    // Final assessment
    if (successRate >= 90) {
      console.log('🎉 EXCELLENT: Documentation quality meets professional open-source standards!');
      console.log('');
      console.log('✅ Ready for production release');
      console.log('✅ Professional navigation structure');
      console.log('✅ Consistent project information');
      console.log('✅ Clean and organized structure');
    } else if (successRate >= 75) {
      console.log('✅ GOOD: Documentation quality is solid with minor improvements needed.');
      console.log('');
      console.log('🔧 Recommended improvements:');
      this.printAllIssues();
    } else {
      console.log('⚠️  NEEDS IMPROVEMENT: Documentation requires attention before release.');
      console.log('');
      console.log('🔧 Critical issues to address:');
      this.printAllIssues();
    }

    console.log('');
    console.log('📋 Documentation Engineering Summary:');
    console.log('  📁 Structure: Clean docs/ directory with en/zh-CN organization');
    console.log('  🧭 Navigation: Multilingual navigation in main README');
    console.log('  📊 Status: Unified project status across all documents');
    console.log('  🌍 Languages: English/Chinese bilingual support');
    console.log('  🔗 Links: Professional navigation between language versions');
    console.log('');
  }

  getCategoryIcon(category) {
    const icons = {
      structure: '🏗️',
      navigation: '🧭',
      consistency: '📊',
      completeness: '📋'
    };
    return icons[category] || '📄';
  }

  getCategoryName(category) {
    const names = {
      structure: 'Structure Quality',
      navigation: 'Navigation Quality',
      consistency: 'Content Consistency',
      completeness: 'Documentation Completeness'
    };
    return names[category] || category;
  }

  printAllIssues() {
    for (const [category, results] of Object.entries(this.results)) {
      if (results.issues.length > 0) {
        results.issues.forEach(issue => {
          console.log(`  • ${issue}`);
        });
      }
    }
  }
}

// Run quality checker
if (require.main === module) {
  const checker = new DocumentationQualityChecker();
  checker.check().catch(error => {
    console.error('❌ Quality check failed:', error);
    process.exit(1);
  });
}

module.exports = DocumentationQualityChecker;
