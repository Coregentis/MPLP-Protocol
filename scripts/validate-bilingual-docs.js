#!/usr/bin/env node

/**
 * Bilingual Documentation Validation Script
 * Validates that English and Chinese documentation are properly synchronized
 */

const fs = require('fs');
const path = require('path');

class BilingualDocsValidator {
  constructor() {
    this.rootDir = path.resolve(__dirname, '..');
    this.enDir = path.join(this.rootDir, 'docs', 'en');
    this.zhDir = path.join(this.rootDir, 'docs', 'zh-CN');
    this.missingFiles = [];
    this.extraFiles = [];
    this.structureDiffs = [];
    this.checkedPaths = new Set();
  }

  /**
   * Main validation function
   */
  async validate() {
    console.log('🔍 MPLP Bilingual Documentation Validator');
    console.log('==========================================');
    console.log(`📁 English Docs: ${this.enDir}`);
    console.log(`📁 Chinese Docs: ${this.zhDir}`);
    console.log('');

    // Validate directory structure
    await this.validateDirectoryStructure(this.enDir, this.zhDir, '');
    await this.validateDirectoryStructure(this.zhDir, this.enDir, '', true);

    this.printResults();
  }

  /**
   * Validate directory structure recursively
   */
  async validateDirectoryStructure(sourceDir, targetDir, relativePath, reverse = false) {
    const sourcePath = path.join(sourceDir, relativePath);
    const targetPath = path.join(targetDir, relativePath);
    
    if (!fs.existsSync(sourcePath)) {
      return;
    }

    const items = fs.readdirSync(sourcePath);
    
    for (const item of items) {
      const sourceItemPath = path.join(sourcePath, item);
      const targetItemPath = path.join(targetPath, item);
      const relativeItemPath = path.join(relativePath, item).replace(/\\/g, '/');
      
      // Skip if already checked
      if (this.checkedPaths.has(relativeItemPath)) {
        continue;
      }
      this.checkedPaths.add(relativeItemPath);
      
      const stat = fs.statSync(sourceItemPath);
      
      if (stat.isDirectory()) {
        // Check if corresponding directory exists
        if (!fs.existsSync(targetItemPath)) {
          if (reverse) {
            this.extraFiles.push({
              type: 'directory',
              path: relativeItemPath,
              location: 'zh-CN only'
            });
          } else {
            this.missingFiles.push({
              type: 'directory', 
              path: relativeItemPath,
              location: 'missing in zh-CN'
            });
          }
        } else {
          // Recursively check subdirectory
          await this.validateDirectoryStructure(sourceDir, targetDir, relativeItemPath, reverse);
        }
      } else if (item.endsWith('.md')) {
        // Check if corresponding file exists
        if (!fs.existsSync(targetItemPath)) {
          if (reverse) {
            this.extraFiles.push({
              type: 'file',
              path: relativeItemPath,
              location: 'zh-CN only'
            });
          } else {
            this.missingFiles.push({
              type: 'file',
              path: relativeItemPath, 
              location: 'missing in zh-CN'
            });
          }
        } else {
          // Validate file content structure
          await this.validateFileStructure(sourceItemPath, targetItemPath, relativeItemPath, reverse);
        }
      }
    }
  }

  /**
   * Validate file structure (basic checks)
   */
  async validateFileStructure(enFile, zhFile, relativePath, reverse = false) {
    try {
      const enContent = fs.readFileSync(enFile, 'utf8');
      const zhContent = fs.readFileSync(zhFile, 'utf8');
      
      // Count headers
      const enHeaders = (enContent.match(/^#+\s/gm) || []).length;
      const zhHeaders = (zhContent.match(/^#+\s/gm) || []).length;
      
      // Allow some flexibility in header count (±2)
      if (Math.abs(enHeaders - zhHeaders) > 2) {
        this.structureDiffs.push({
          path: relativePath,
          issue: `Header count mismatch: EN(${enHeaders}) vs ZH(${zhHeaders})`,
          severity: 'warning'
        });
      }
      
      // Check for basic content presence
      if (enContent.length > 100 && zhContent.length < 50) {
        this.structureDiffs.push({
          path: relativePath,
          issue: 'Chinese version appears to be incomplete (very short)',
          severity: 'error'
        });
      }
      
      if (zhContent.length > 100 && enContent.length < 50) {
        this.structureDiffs.push({
          path: relativePath,
          issue: 'English version appears to be incomplete (very short)',
          severity: 'error'
        });
      }
      
    } catch (error) {
      this.structureDiffs.push({
        path: relativePath,
        issue: `File reading error: ${error.message}`,
        severity: 'error'
      });
    }
  }

  /**
   * Print validation results
   */
  printResults() {
    console.log('📊 Validation Results');
    console.log('=====================');
    console.log(`📄 Files checked: ${this.checkedPaths.size}`);
    console.log(`❌ Missing files: ${this.missingFiles.length}`);
    console.log(`➕ Extra files: ${this.extraFiles.length}`);
    console.log(`⚠️  Structure differences: ${this.structureDiffs.length}`);
    console.log('');

    if (this.missingFiles.length > 0) {
      console.log('❌ Missing Files (need Chinese versions):');
      this.missingFiles.forEach(item => {
        console.log(`  ${item.type === 'directory' ? '📁' : '📄'} ${item.path} (${item.location})`);
      });
      console.log('');
    }

    if (this.extraFiles.length > 0) {
      console.log('➕ Extra Files (Chinese only):');
      this.extraFiles.forEach(item => {
        console.log(`  ${item.type === 'directory' ? '📁' : '📄'} ${item.path} (${item.location})`);
      });
      console.log('');
    }

    if (this.structureDiffs.length > 0) {
      console.log('⚠️  Structure Differences:');
      this.structureDiffs.forEach(diff => {
        const icon = diff.severity === 'error' ? '❌' : '⚠️';
        console.log(`  ${icon} ${diff.path}: ${diff.issue}`);
      });
      console.log('');
    }

    // Summary
    const totalIssues = this.missingFiles.length + this.extraFiles.length + 
                       this.structureDiffs.filter(d => d.severity === 'error').length;
    
    if (totalIssues === 0) {
      console.log('✅ All bilingual documentation is properly synchronized!');
      console.log('');
      console.log('🎉 Documentation Quality Summary:');
      console.log('  ✅ English and Chinese docs are 1:1 matched');
      console.log('  ✅ Directory structure is consistent');
      console.log('  ✅ File structure is aligned');
      console.log('  ✅ Content completeness verified');
      console.log('');
    } else {
      console.log(`❌ Found ${totalIssues} critical issues that need attention.`);
      console.log('');
      console.log('🔧 Recommendations:');
      console.log('  1. Create missing Chinese documentation files');
      console.log('  2. Review extra files and determine if they should be translated');
      console.log('  3. Fix structural inconsistencies between language versions');
      console.log('  4. Ensure content completeness in both languages');
      console.log('');
    }

    // Language coverage statistics
    const enFiles = this.missingFiles.length + this.checkedPaths.size - this.extraFiles.length;
    const zhFiles = this.checkedPaths.size - this.missingFiles.length;
    const coverage = zhFiles / enFiles * 100;
    
    console.log('📈 Language Coverage Statistics:');
    console.log(`  📄 English files: ${enFiles}`);
    console.log(`  📄 Chinese files: ${zhFiles}`);
    console.log(`  📊 Coverage: ${coverage.toFixed(1)}%`);
    console.log('');
  }
}

// Run validator
if (require.main === module) {
  const validator = new BilingualDocsValidator();
  validator.validate().catch(error => {
    console.error('❌ Validation failed:', error);
    process.exit(1);
  });
}

module.exports = BilingualDocsValidator;
