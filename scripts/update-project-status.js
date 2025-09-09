#!/usr/bin/env node

/**
 * Project Status Update Script
 * Updates project status information across all documentation
 */

const fs = require('fs');
const path = require('path');

class ProjectStatusUpdater {
  constructor() {
    this.rootDir = path.resolve(__dirname, '..');
    this.statusFile = path.join(__dirname, 'project-status.json');
    this.status = JSON.parse(fs.readFileSync(this.statusFile, 'utf8'));
    this.updates = 0;
    this.errors = 0;
  }

  /**
   * Main update function
   */
  async update() {
    console.log('🔄 MPLP Project Status Updater');
    console.log('==============================');
    console.log(`📁 Root Directory: ${this.rootDir}`);
    console.log(`📊 Status File: ${this.statusFile}`);
    console.log('');

    // Update main README
    await this.updateMainReadme();
    
    // Update docs README
    await this.updateDocsReadme();
    
    // Update English README
    await this.updateEnglishReadme();
    
    // Update Chinese README
    await this.updateChineseReadme();

    this.printResults();
  }

  /**
   * Update main README.md
   */
  async updateMainReadme() {
    const filePath = path.join(this.rootDir, 'README.md');
    console.log('📄 Updating: README.md');
    
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // Update badges
    const badgeUpdates = [
      {
        pattern: /\[!\[Version\]\([^\)]+\)\]/g,
        replacement: `[![Version](${this.status.badges.version})]`,
        description: 'Version badge'
      },
      {
        pattern: /\[!\[Protocol Stack\]\([^\)]+\)\]/g,
        replacement: `[![Protocol Stack](${this.status.badges.protocolStack})]`,
        description: 'Protocol Stack badge'
      },
      {
        pattern: /\[!\[Modules\]\([^\)]+\)\]/g,
        replacement: `[![Modules](${this.status.badges.modules})]`,
        description: 'Modules badge'
      },
      {
        pattern: /\[!\[Tests\]\([^\)]+\)\]/g,
        replacement: `[![Tests](${this.status.badges.tests})]`,
        description: 'Tests badge'
      }
    ];

    for (const update of badgeUpdates) {
      if (update.pattern.test(content)) {
        content = content.replace(update.pattern, update.replacement);
        console.log(`  ✅ Updated ${update.description}`);
        this.updates++;
      }
    }

    // Update project status text
    const textUpdates = [
      {
        pattern: /2,?\d{3}\/2,?\d{3} tests passing/gi,
        replacement: `${this.status.quality.tests.passed}/${this.status.quality.tests.total} tests passing`,
        description: 'Test count'
      },
      {
        pattern: /100% pass rate/gi,
        replacement: `${this.status.quality.tests.passRate} pass rate`,
        description: 'Pass rate'
      },
      {
        pattern: /10\/10 complete/gi,
        replacement: `${this.status.architecture.modules.completed}/${this.status.architecture.modules.total} complete`,
        description: 'Module completion'
      }
    ];

    for (const update of textUpdates) {
      if (update.pattern.test(content)) {
        content = content.replace(update.pattern, update.replacement);
        console.log(`  ✅ Updated ${update.description}`);
        this.updates++;
      }
    }

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`  📝 Updated README.md`);
    } else {
      console.log('  ℹ️  No updates needed in README.md');
    }
  }

  /**
   * Update docs/README.md
   */
  async updateDocsReadme() {
    const filePath = path.join(this.rootDir, 'docs', 'README.md');
    console.log('📄 Updating: docs/README.md');
    
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // Update project status table
    const statusTablePattern = /\| \*\*Core Modules[^|]*\| [^|]* \| [^|]* \|/g;
    if (statusTablePattern.test(content)) {
      content = content.replace(
        statusTablePattern,
        `| **Core Modules 核心模块** | ✅ ${this.status.architecture.modules.completed}/${this.status.architecture.modules.total} Complete | All enterprise-grade 全部企业级 |`
      );
      console.log('  ✅ Updated core modules status');
      this.updates++;
    }

    const testTablePattern = /\| \*\*Test Coverage[^|]*\| [^|]* \| [^|]* \|/g;
    if (testTablePattern.test(content)) {
      content = content.replace(
        testTablePattern,
        `| **Test Coverage 测试覆盖** | ✅ ${this.status.quality.tests.passed}/${this.status.quality.tests.total} Pass | ${this.status.quality.tests.passRate} pass rate ${this.status.quality.tests.passRate}通过率 |`
      );
      console.log('  ✅ Updated test coverage status');
      this.updates++;
    }

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`  📝 Updated docs/README.md`);
    } else {
      console.log('  ℹ️  No updates needed in docs/README.md');
    }
  }

  /**
   * Update docs/en/README.md
   */
  async updateEnglishReadme() {
    const filePath = path.join(this.rootDir, 'docs', 'en', 'README.md');
    console.log('📄 Updating: docs/en/README.md');
    
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // Update module table
    const moduleTableStart = content.indexOf('| **[Context](./modules/context/)**');
    if (moduleTableStart !== -1) {
      const moduleTableEnd = content.indexOf('| **[Network](./modules/network/)**', moduleTableStart);
      if (moduleTableEnd !== -1) {
        const endOfRow = content.indexOf('\n', moduleTableEnd);
        if (endOfRow !== -1) {
          let newTable = '';
          for (const [moduleName, moduleInfo] of Object.entries(this.status.moduleDetails)) {
            const moduleLink = `./modules/${moduleName.toLowerCase()}/`;
            newTable += `| **[${moduleName}](${moduleLink})** | ${moduleInfo.status} | ${moduleInfo.tests} | ${moduleInfo.coverage} | ${moduleInfo.description} |\n`;
          }
          
          content = content.substring(0, moduleTableStart) + newTable.trim() + content.substring(endOfRow);
          console.log('  ✅ Updated module table');
          this.updates++;
        }
      }
    }

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`  📝 Updated docs/en/README.md`);
    } else {
      console.log('  ℹ️  No updates needed in docs/en/README.md');
    }
  }

  /**
   * Update docs/zh-CN/README.md
   */
  async updateChineseReadme() {
    const filePath = path.join(this.rootDir, 'docs', 'zh-CN', 'README.md');
    console.log('📄 Updating: docs/zh-CN/README.md');
    
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // Update Chinese module table
    const moduleTableStart = content.indexOf('| **[Context](./modules/context/)**');
    if (moduleTableStart !== -1) {
      const moduleTableEnd = content.indexOf('| **[Network](./modules/network/)**', moduleTableStart);
      if (moduleTableEnd !== -1) {
        const endOfRow = content.indexOf('\n', moduleTableEnd);
        if (endOfRow !== -1) {
          let newTable = '';
          const chineseDescriptions = {
            'Context': '上下文管理和状态同步',
            'Plan': 'AI驱动的规划和任务管理', 
            'Role': '企业级RBAC权限管理',
            'Confirm': '多级审批工作流',
            'Trace': '执行监控和追踪',
            'Extension': '扩展管理和插件系统',
            'Dialog': '智能对话管理',
            'Collab': '多智能体协作',
            'Core': '中央协调系统',
            'Network': '分布式通信'
          };
          
          for (const [moduleName, moduleInfo] of Object.entries(this.status.moduleDetails)) {
            const moduleLink = `./modules/${moduleName.toLowerCase()}/`;
            const chineseDesc = chineseDescriptions[moduleName] || moduleInfo.description;
            newTable += `| **[${moduleName}](${moduleLink})** | ${moduleInfo.status} | ${moduleInfo.tests} | ${moduleInfo.coverage} | ${chineseDesc} |\n`;
          }
          
          content = content.substring(0, moduleTableStart) + newTable.trim() + content.substring(endOfRow);
          console.log('  ✅ Updated Chinese module table');
          this.updates++;
        }
      }
    }

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`  📝 Updated docs/zh-CN/README.md`);
    } else {
      console.log('  ℹ️  No updates needed in docs/zh-CN/README.md');
    }
  }

  /**
   * Print update results
   */
  printResults() {
    console.log('');
    console.log('📊 Update Results');
    console.log('==================');
    console.log(`✅ Updates applied: ${this.updates}`);
    console.log(`❌ Errors: ${this.errors}`);
    console.log('');

    if (this.updates > 0) {
      console.log('🎉 Project status information has been synchronized!');
      console.log('');
      console.log('📋 Updated Information:');
      console.log(`  • Version: ${this.status.project.version}`);
      console.log(`  • Tests: ${this.status.quality.tests.passed}/${this.status.quality.tests.total} (${this.status.quality.tests.passRate})`);
      console.log(`  • Modules: ${this.status.architecture.modules.completed}/${this.status.architecture.modules.total} Complete`);
      console.log(`  • Quality: ${this.status.quality.technicalDebt} Technical Debt`);
      console.log('');
    } else {
      console.log('ℹ️  All documentation is already up to date.');
    }
  }
}

// Run updater
if (require.main === module) {
  const updater = new ProjectStatusUpdater();
  updater.update().catch(error => {
    console.error('❌ Update failed:', error);
    process.exit(1);
  });
}

module.exports = ProjectStatusUpdater;
