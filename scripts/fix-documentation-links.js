#!/usr/bin/env node

/**
 * Documentation Link Fix Script
 * Fixes common broken links in MPLP documentation
 */

const fs = require('fs');
const path = require('path');

class DocumentationLinkFixer {
  constructor() {
    this.rootDir = path.resolve(__dirname, '..');
    this.fixes = 0;
    this.errors = 0;
  }

  /**
   * Main fix function
   */
  async fix() {
    console.log('🔧 MPLP Documentation Link Fixer');
    console.log('=================================');
    console.log(`📁 Root Directory: ${this.rootDir}`);
    console.log('');

    // Fix main README
    await this.fixMainReadme();
    
    // Fix docs README
    await this.fixDocsReadme();
    
    // Fix documentation index
    await this.fixDocumentationIndex();

    this.printResults();
  }

  /**
   * Fix main README.md
   */
  async fixMainReadme() {
    const filePath = path.join(this.rootDir, 'README.md');
    console.log('📄 Fixing: README.md');
    
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // Fix broken links
    const fixes = [
      {
        from: '[Examples](examples/)',
        to: '[Examples](docs/en/examples/)',
        description: 'Fix examples link'
      },
      {
        from: '[Multi-Agent System](docs/en/tutorials/first-agent-system.md)',
        to: '[Multi-Agent System](docs/en/developers/quick-start.md)',
        description: 'Fix first agent system tutorial link'
      },
      {
        from: '[Architecture Guide](docs/architecture.md)',
        to: '[Architecture Guide](docs/en/architecture/)',
        description: 'Fix architecture guide link'
      },
      {
        from: '[API Reference](docs/api)',
        to: '[API Reference](docs/en/api-reference/)',
        description: 'Fix API reference link'
      },
      {
        from: '[Protocol Specifications](docs/protocols)',
        to: '[Protocol Specifications](docs/en/protocol-specs/)',
        description: 'Fix protocol specs link'
      },
      {
        from: '[Integration Guide](docs/integration.md)',
        to: '[Integration Guide](docs/en/implementation/)',
        description: 'Fix integration guide link'
      },
      {
        from: '[Getting Started Tutorial](docs/tutorials/getting-started.md)',
        to: '[Getting Started Tutorial](docs/en/developers/quick-start.md)',
        description: 'Fix getting started tutorial link'
      },
      {
        from: '[Multi-Agent Patterns](docs/patterns)',
        to: '[Multi-Agent Patterns](docs/en/architecture/design-patterns.md)',
        description: 'Fix patterns link'
      },
      {
        from: '[Best Practices](docs/best-practices.md)',
        to: '[Best Practices](docs/en/guides/)',
        description: 'Fix best practices link'
      },
      {
        from: '[Development Setup](docs/development.md)',
        to: '[Development Setup](docs/en/developers/)',
        description: 'Fix development setup link'
      },
      {
        from: '[Testing Guide](docs/testing.md)',
        to: '[Testing Guide](docs/en/testing/)',
        description: 'Fix testing guide link'
      },
      {
        from: '[Release Process](docs/release.md)',
        to: '[Release Process](docs/en/guides/release-process.md)',
        description: 'Fix release process link'
      }
    ];

    for (const fix of fixes) {
      if (content.includes(fix.from)) {
        content = content.replace(fix.from, fix.to);
        console.log(`  ✅ ${fix.description}`);
        this.fixes++;
      }
    }

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`  📝 Updated README.md with ${this.fixes} fixes`);
    } else {
      console.log('  ℹ️  No fixes needed in README.md');
    }
  }

  /**
   * Fix docs/README.md
   */
  async fixDocsReadme() {
    const filePath = path.join(this.rootDir, 'docs', 'README.md');
    console.log('📄 Fixing: docs/README.md');
    
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // Fix broken links
    const fixes = [
      {
        from: '[🚀 Quick Start](docs/en/quick-start)',
        to: '[🚀 Quick Start](./en/developers/quick-start.md)',
        description: 'Fix quick start link'
      },
      {
        from: '[🚀 快速开始](docs/zh-CN/quick-start)',
        to: '[🚀 快速开始](./zh-CN/developers/quick-start.md)',
        description: 'Fix Chinese quick start link'
      },
      {
        from: '[📋 Roadmap](docs/ROADMAP.md)',
        to: '[📋 Roadmap](../ROADMAP.md)',
        description: 'Fix roadmap link'
      }
    ];

    for (const fix of fixes) {
      if (content.includes(fix.from)) {
        content = content.replace(fix.from, fix.to);
        console.log(`  ✅ ${fix.description}`);
        this.fixes++;
      }
    }

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`  📝 Updated docs/README.md`);
    } else {
      console.log('  ℹ️  No fixes needed in docs/README.md');
    }
  }

  /**
   * Fix docs/DOCUMENTATION-INDEX.md
   */
  async fixDocumentationIndex() {
    const filePath = path.join(this.rootDir, 'docs', 'DOCUMENTATION-INDEX.md');
    console.log('📄 Fixing: docs/DOCUMENTATION-INDEX.md');
    
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // Fix broken module links - these directories don't exist in zh-CN
    const brokenModuleLinks = [
      'docs/zh-CN/modules/plan',
      'docs/zh-CN/modules/role', 
      'docs/zh-CN/modules/confirm',
      'docs/zh-CN/modules/trace',
      'docs/zh-CN/modules/extension',
      'docs/zh-CN/modules/dialog',
      'docs/zh-CN/modules/collab',
      'docs/zh-CN/modules/core',
      'docs/zh-CN/modules/network'
    ];

    for (const brokenLink of brokenModuleLinks) {
      const linkPattern = `](${brokenLink})`;
      const fixedLink = linkPattern.replace('/zh-CN/', '/en/');
      
      if (content.includes(linkPattern)) {
        content = content.replace(new RegExp(linkPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), fixedLink);
        console.log(`  ✅ Fixed broken Chinese module link: ${brokenLink}`);
        this.fixes++;
      }
    }

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`  📝 Updated docs/DOCUMENTATION-INDEX.md`);
    } else {
      console.log('  ℹ️  No fixes needed in docs/DOCUMENTATION-INDEX.md');
    }
  }

  /**
   * Print fix results
   */
  printResults() {
    console.log('');
    console.log('📊 Fix Results');
    console.log('===============');
    console.log(`✅ Fixes applied: ${this.fixes}`);
    console.log(`❌ Errors: ${this.errors}`);
    console.log('');

    if (this.fixes > 0) {
      console.log('🎉 Documentation links have been improved!');
      console.log('');
      console.log('📋 Next Steps:');
      console.log('  1. Run validation script to check remaining issues');
      console.log('  2. Create missing README.md files in referenced directories');
      console.log('  3. Complete Chinese module documentation');
      console.log('  4. Verify all external links are working');
      console.log('');
    } else {
      console.log('ℹ️  No fixes were needed.');
    }
  }
}

// Run fixer
if (require.main === module) {
  const fixer = new DocumentationLinkFixer();
  fixer.fix().catch(error => {
    console.error('❌ Fix failed:', error);
    process.exit(1);
  });
}

module.exports = DocumentationLinkFixer;
