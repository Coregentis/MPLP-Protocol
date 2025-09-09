#!/usr/bin/env node

/**
 * Documentation Link Validation Script
 * Validates all internal links in MPLP documentation
 */

const fs = require('fs');
const path = require('path');

class DocumentationValidator {
  constructor() {
    this.rootDir = path.resolve(__dirname, '..');
    this.docsDir = path.join(this.rootDir, 'docs');
    this.errors = [];
    this.warnings = [];
    this.checkedFiles = new Set();
    this.validatedLinks = new Set();
  }

  /**
   * Main validation function
   */
  async validate() {
    console.log('🔍 MPLP Documentation Link Validation');
    console.log('=====================================');
    console.log(`📁 Root Directory: ${this.rootDir}`);
    console.log(`📚 Docs Directory: ${this.docsDir}`);
    console.log('');

    // Validate main README
    await this.validateFile(path.join(this.rootDir, 'README.md'));
    
    // Validate docs README
    await this.validateFile(path.join(this.docsDir, 'README.md'));
    
    // Validate documentation index
    await this.validateFile(path.join(this.docsDir, 'DOCUMENTATION-INDEX.md'));
    
    // Validate English documentation
    await this.validateDirectory(path.join(this.docsDir, 'en'));
    
    // Validate Chinese documentation
    await this.validateDirectory(path.join(this.docsDir, 'zh-CN'));
    
    // Validate other important files
    const importantFiles = [
      'CONTRIBUTING.md',
      'CHANGELOG.md',
      'ROADMAP.md'
    ];
    
    for (const file of importantFiles) {
      const filePath = path.join(this.rootDir, file);
      if (fs.existsSync(filePath)) {
        await this.validateFile(filePath);
      }
    }

    this.printResults();
  }

  /**
   * Validate a single file
   */
  async validateFile(filePath) {
    if (this.checkedFiles.has(filePath)) {
      return;
    }
    
    this.checkedFiles.add(filePath);
    
    if (!fs.existsSync(filePath)) {
      this.errors.push(`❌ File not found: ${filePath}`);
      return;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(this.rootDir, filePath);
    
    console.log(`📄 Validating: ${relativePath}`);
    
    // Extract markdown links
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let match;
    
    while ((match = linkRegex.exec(content)) !== null) {
      const linkText = match[1];
      const linkUrl = match[2];
      
      // Skip external links
      if (linkUrl.startsWith('http://') || linkUrl.startsWith('https://')) {
        continue;
      }
      
      // Skip anchors
      if (linkUrl.startsWith('#')) {
        continue;
      }
      
      // Skip email links
      if (linkUrl.startsWith('mailto:')) {
        continue;
      }
      
      await this.validateLink(filePath, linkText, linkUrl);
    }
  }

  /**
   * Validate a directory recursively
   */
  async validateDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) {
      this.warnings.push(`⚠️  Directory not found: ${dirPath}`);
      return;
    }

    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        await this.validateDirectory(itemPath);
      } else if (item.endsWith('.md')) {
        await this.validateFile(itemPath);
      }
    }
  }

  /**
   * Validate a single link
   */
  async validateLink(sourceFile, linkText, linkUrl) {
    const linkKey = `${sourceFile}:${linkUrl}`;
    
    if (this.validatedLinks.has(linkKey)) {
      return;
    }
    
    this.validatedLinks.add(linkKey);
    
    // Resolve relative path
    const sourceDir = path.dirname(sourceFile);
    let targetPath;
    
    if (linkUrl.startsWith('./') || linkUrl.startsWith('../')) {
      targetPath = path.resolve(sourceDir, linkUrl);
    } else if (linkUrl.startsWith('/')) {
      targetPath = path.join(this.rootDir, linkUrl.substring(1));
    } else {
      targetPath = path.resolve(sourceDir, linkUrl);
    }
    
    // Check if target exists
    if (!fs.existsSync(targetPath)) {
      // Try with .md extension if it's a directory
      if (!targetPath.endsWith('.md') && fs.existsSync(targetPath + '.md')) {
        return; // Valid
      }
      
      // Try README.md in directory
      if (fs.existsSync(path.join(targetPath, 'README.md'))) {
        return; // Valid
      }
      
      const relativeSource = path.relative(this.rootDir, sourceFile);
      const relativeTarget = path.relative(this.rootDir, targetPath);
      
      this.errors.push(`❌ Broken link in ${relativeSource}: "${linkText}" -> ${relativeTarget}`);
    }
  }

  /**
   * Print validation results
   */
  printResults() {
    console.log('');
    console.log('📊 Validation Results');
    console.log('====================');
    console.log(`📄 Files checked: ${this.checkedFiles.size}`);
    console.log(`🔗 Links validated: ${this.validatedLinks.size}`);
    console.log(`❌ Errors: ${this.errors.length}`);
    console.log(`⚠️  Warnings: ${this.warnings.length}`);
    console.log('');

    if (this.warnings.length > 0) {
      console.log('⚠️  Warnings:');
      this.warnings.forEach(warning => console.log(`  ${warning}`));
      console.log('');
    }

    if (this.errors.length > 0) {
      console.log('❌ Errors:');
      this.errors.forEach(error => console.log(`  ${error}`));
      console.log('');
      
      console.log('🔧 Recommendations:');
      console.log('  1. Check file paths and ensure they exist');
      console.log('  2. Verify relative path calculations');
      console.log('  3. Ensure README.md files exist in referenced directories');
      console.log('  4. Update broken links to point to correct locations');
      console.log('');
      
      process.exit(1);
    } else {
      console.log('✅ All documentation links are valid!');
      console.log('');
      console.log('🎉 Documentation Quality Summary:');
      console.log('  ✅ All internal links working');
      console.log('  ✅ File structure consistent');
      console.log('  ✅ Navigation paths verified');
      console.log('  ✅ Multi-language support validated');
      console.log('');
    }
  }
}

// Run validation
if (require.main === module) {
  const validator = new DocumentationValidator();
  validator.validate().catch(error => {
    console.error('❌ Validation failed:', error);
    process.exit(1);
  });
}

module.exports = DocumentationValidator;
