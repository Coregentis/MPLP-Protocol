#!/usr/bin/env node

/**
 * MPLP v1.0 Project Setup Script
 * 初始化项目依赖和配置
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 MPLP v1.0 项目初始化开始...\n');

function runCommand(command, description) {
  console.log(`📦 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} 完成\n`);
  } catch (error) {
    console.error(`❌ ${description} 失败:`, error.message);
    process.exit(1);
  }
}

function createFile(filePath, content) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, content);
  console.log(`✅ 创建文件: ${filePath}`);
}

// 1. 安装依赖
console.log('📋 步骤 1: 安装项目依赖');
runCommand('npm install', '安装生产依赖');
runCommand('npm install --save-dev', '安装开发依赖');

// 2. 设置 Git Hooks
console.log('📋 步骤 2: 配置 Git Hooks');
runCommand('npx husky install', '初始化 Husky');
runCommand('npx husky add .husky/pre-commit "npx lint-staged"', '添加 pre-commit hook');
runCommand('npx husky add .husky/commit-msg "npx commitlint --edit $1"', '添加 commit-msg hook');

// 3. 创建环境配置文件
console.log('📋 步骤 3: 创建环境配置');
if (!fs.existsSync('.env')) {
  createFile('.env', `# MPLP v1.0 Development Environment
NODE_ENV=development
PORT=3000
APP_NAME=MPLP-v1.0
APP_VERSION=1.0.0

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mplp_dev
DB_USERNAME=mplp_user
DB_PASSWORD=changeme

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Security
JWT_SECRET=your-super-secret-jwt-key-change-this
API_RATE_LIMIT=1000

# MPLP Core
MPLP_PROTOCOL_VERSION=1.0.0
MPLP_MAX_CONTEXT_SIZE=1000

# TracePilot
TRACEPILOT_ENABLED=false
TRACEPILOT_ENDPOINT=https://api.tracepilot.com

# Logging
LOG_LEVEL=debug
LOG_FORMAT=pretty
`);
}

// 4. 创建测试环境配置
createFile('.env.test', `# MPLP v1.0 Test Environment
NODE_ENV=test
PORT=3001
LOG_LEVEL=error
LOG_TESTS=false

# Test Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mplp_test
DB_USERNAME=mplp_test
DB_PASSWORD=test

# Disable external services in tests
TRACEPILOT_ENABLED=false
COREGENTIS_ENABLED=false
REDIS_ENABLED=false
`);

// 5. 运行类型检查
console.log('📋 步骤 4: 运行初始检查');
runCommand('npm run typecheck', 'TypeScript 类型检查');

console.log('🎉 MPLP v1.0 项目初始化完成!');
console.log('\n📚 下一步:');
console.log('1. 配置数据库连接 (.env 文件)');
console.log('2. 启动开发服务器: npm run dev');
console.log('3. 运行测试: npm test');
console.log('4. 查看开发规则: cat .cursor-rules');
console.log('\n🔗 相关文档:');
console.log('- 需求文档: requirements-docs/');
console.log('- 项目规则: ProjectRules/');
console.log('- API 文档: docs/api/ (开发时生成)'); 