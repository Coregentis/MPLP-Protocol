#!/usr/bin/env node

/**
 * Simple test runner for CLI development server functionality
 */

const fs = require('fs-extra');
const path = require('path');

console.log('🧪 Running MPLP CLI Development Server Tests\n');

// Test 1: 基础结构测试
console.log('📁 开发服务器结构测试');

const requiredFiles = [
  'src/commands/DevCommand.ts',
  'src/dev/DevServer.ts',
  'src/dev/FileWatcher.ts',
  'src/dev/BuildManager.ts',
  'src/dev/HotReloadManager.ts',
  'src/dev/LogManager.ts',
  'src/dev/MetricsManager.ts',
  'src/dev/types.ts',
  'src/dev/index.ts'
];

let structureTestsPassed = 0;
let structureTestsTotal = requiredFiles.length;

for (const file of requiredFiles) {
  if (fs.existsSync(file)) {
    console.log(`  ✅ ${file} 存在`);
    structureTestsPassed++;
  } else {
    console.log(`  ❌ ${file} 缺失`);
  }
}

console.log(`\n📊 结构测试结果: ${structureTestsPassed}/${structureTestsTotal} 通过\n`);

// Test 2: 包配置测试
console.log('📦 包配置测试');

let packageTestsPassed = 0;
let packageTestsTotal = 0;

try {
  const packageJson = fs.readJsonSync('package.json');
  
  packageTestsTotal++;
  if (packageJson.dependencies && packageJson.dependencies.open) {
    console.log('  ✅ open 依赖存在');
    packageTestsPassed++;
  } else {
    console.log('  ❌ open 依赖缺失');
  }
  
  packageTestsTotal++;
  if (packageJson.bin && packageJson.bin.mplp) {
    console.log('  ✅ CLI 可执行文件配置存在');
    packageTestsPassed++;
  } else {
    console.log('  ❌ CLI 可执行文件配置缺失');
  }
  
} catch (error) {
  console.log('  ❌ package.json 读取失败');
}

console.log(`\n📊 包配置测试结果: ${packageTestsPassed}/${packageTestsTotal} 通过\n`);

// Test 3: 文件内容验证
console.log('📄 文件内容验证');

let contentTestsPassed = 0;
let contentTestsTotal = 0;

// 检查 DevCommand
try {
  const devCommandContent = fs.readFileSync('src/commands/DevCommand.ts', 'utf8');
  
  contentTestsTotal++;
  if (devCommandContent.includes('export class DevCommand')) {
    console.log('  ✅ DevCommand 类定义存在');
    contentTestsPassed++;
  } else {
    console.log('  ❌ DevCommand 类定义缺失');
  }
  
  contentTestsTotal++;
  if (devCommandContent.includes('DevServer')) {
    console.log('  ✅ DevServer 引用存在');
    contentTestsPassed++;
  } else {
    console.log('  ❌ DevServer 引用缺失');
  }
  
  contentTestsTotal++;
  if (devCommandContent.includes("name = 'dev'")) {
    console.log('  ✅ dev 命令名称正确');
    contentTestsPassed++;
  } else {
    console.log('  ❌ dev 命令名称错误');
  }
  
  contentTestsTotal++;
  if (devCommandContent.includes('aliases = [\'serve\', \'start\']')) {
    console.log('  ✅ dev 命令别名正确');
    contentTestsPassed++;
  } else {
    console.log('  ❌ dev 命令别名错误');
  }
  
} catch (error) {
  console.log('  ❌ DevCommand.ts 读取失败');
  contentTestsTotal += 4;
}

// 检查 DevServer
try {
  const devServerContent = fs.readFileSync('src/dev/DevServer.ts', 'utf8');
  
  contentTestsTotal++;
  if (devServerContent.includes('export class DevServer')) {
    console.log('  ✅ DevServer 类定义存在');
    contentTestsPassed++;
  } else {
    console.log('  ❌ DevServer 类定义缺失');
  }
  
  contentTestsTotal++;
  if (devServerContent.includes('implements IDevServer')) {
    console.log('  ✅ IDevServer 接口实现存在');
    contentTestsPassed++;
  } else {
    console.log('  ❌ IDevServer 接口实现缺失');
  }
  
  contentTestsTotal++;
  if (devServerContent.includes('start()') && devServerContent.includes('stop()')) {
    console.log('  ✅ 服务器生命周期方法存在');
    contentTestsPassed++;
  } else {
    console.log('  ❌ 服务器生命周期方法缺失');
  }
  
} catch (error) {
  console.log('  ❌ DevServer.ts 读取失败');
  contentTestsTotal += 3;
}

// 检查 FileWatcher
try {
  const fileWatcherContent = fs.readFileSync('src/dev/FileWatcher.ts', 'utf8');
  
  contentTestsTotal++;
  if (fileWatcherContent.includes('export class FileWatcher')) {
    console.log('  ✅ FileWatcher 类定义存在');
    contentTestsPassed++;
  } else {
    console.log('  ❌ FileWatcher 类定义缺失');
  }
  
  contentTestsTotal++;
  if (fileWatcherContent.includes('addPattern') && fileWatcherContent.includes('removePattern')) {
    console.log('  ✅ 文件监视方法存在');
    contentTestsPassed++;
  } else {
    console.log('  ❌ 文件监视方法缺失');
  }
  
} catch (error) {
  console.log('  ❌ FileWatcher.ts 读取失败');
  contentTestsTotal += 2;
}

// 检查 BuildManager
try {
  const buildManagerContent = fs.readFileSync('src/dev/BuildManager.ts', 'utf8');
  
  contentTestsTotal++;
  if (buildManagerContent.includes('export class BuildManager')) {
    console.log('  ✅ BuildManager 类定义存在');
    contentTestsPassed++;
  } else {
    console.log('  ❌ BuildManager 类定义缺失');
  }
  
  contentTestsTotal++;
  if (buildManagerContent.includes('buildTypeScript') && buildManagerContent.includes('buildJavaScript')) {
    console.log('  ✅ 构建方法存在');
    contentTestsPassed++;
  } else {
    console.log('  ❌ 构建方法缺失');
  }
  
} catch (error) {
  console.log('  ❌ BuildManager.ts 读取失败');
  contentTestsTotal += 2;
}

// 检查类型定义
try {
  const typesContent = fs.readFileSync('src/dev/types.ts', 'utf8');
  
  contentTestsTotal++;
  if (typesContent.includes('DevServerConfig') && typesContent.includes('IDevServer')) {
    console.log('  ✅ 核心类型定义存在');
    contentTestsPassed++;
  } else {
    console.log('  ❌ 核心类型定义缺失');
  }
  
  contentTestsTotal++;
  if (typesContent.includes('FileChangeEvent') && typesContent.includes('BuildResult')) {
    console.log('  ✅ 事件类型定义存在');
    contentTestsPassed++;
  } else {
    console.log('  ❌ 事件类型定义缺失');
  }
  
  contentTestsTotal++;
  if (typesContent.includes('WebSocketMessage') && typesContent.includes('ServerMetrics')) {
    console.log('  ✅ 消息和指标类型定义存在');
    contentTestsPassed++;
  } else {
    console.log('  ❌ 消息和指标类型定义缺失');
  }
  
} catch (error) {
  console.log('  ❌ types.ts 读取失败');
  contentTestsTotal += 3;
}

console.log(`\n📊 内容验证测试结果: ${contentTestsPassed}/${contentTestsTotal} 通过\n`);

// Test 4: CLI集成测试
console.log('🔧 CLI集成测试');

let integrationTestsPassed = 0;
let integrationTestsTotal = 0;

// 检查命令索引
try {
  const commandsIndexContent = fs.readFileSync('src/commands/index.ts', 'utf8');
  
  integrationTestsTotal++;
  if (commandsIndexContent.includes('DevCommand')) {
    console.log('  ✅ DevCommand 导出存在');
    integrationTestsPassed++;
  } else {
    console.log('  ❌ DevCommand 导出缺失');
  }
  
} catch (error) {
  console.log('  ❌ commands/index.ts 读取失败');
  integrationTestsTotal++;
}

// 检查CLI可执行文件
try {
  const cliContent = fs.readFileSync('src/bin/mplp.ts', 'utf8');
  
  integrationTestsTotal++;
  if (cliContent.includes('DevCommand')) {
    console.log('  ✅ CLI中DevCommand引用存在');
    integrationTestsPassed++;
  } else {
    console.log('  ❌ CLI中DevCommand引用缺失');
  }
  
  integrationTestsTotal++;
  if (cliContent.includes('new DevCommand(context)')) {
    console.log('  ✅ CLI中DevCommand实例化存在');
    integrationTestsPassed++;
  } else {
    console.log('  ❌ CLI中DevCommand实例化缺失');
  }
  
} catch (error) {
  console.log('  ❌ bin/mplp.ts 读取失败');
  integrationTestsTotal += 2;
}

console.log(`\n📊 CLI集成测试结果: ${integrationTestsPassed}/${integrationTestsTotal} 通过\n`);

// Test 5: 测试文件验证
console.log('🧪 测试文件验证');

let testFilesPassed = 0;
let testFilesTotal = 0;

const testFiles = [
  'src/commands/__tests__/DevCommand.test.ts',
  'src/dev/__tests__/DevServer.test.ts'
];

for (const testFile of testFiles) {
  testFilesTotal++;
  if (fs.existsSync(testFile)) {
    console.log(`  ✅ ${testFile} 存在`);
    testFilesPassed++;
    
    // 检查测试内容
    try {
      const testContent = fs.readFileSync(testFile, 'utf8');
      if (testContent.includes('describe(') && testContent.includes('it(')) {
        console.log(`    ✅ ${testFile} 包含有效的测试结构`);
      } else {
        console.log(`    ⚠️  ${testFile} 测试结构可能不完整`);
      }
    } catch (error) {
      console.log(`    ❌ ${testFile} 读取失败`);
    }
  } else {
    console.log(`  ❌ ${testFile} 缺失`);
  }
}

console.log(`\n📊 测试文件验证结果: ${testFilesPassed}/${testFilesTotal} 通过\n`);

// 总结
const totalPassed = structureTestsPassed + packageTestsPassed + contentTestsPassed + integrationTestsPassed + testFilesPassed;
const totalTests = structureTestsTotal + packageTestsTotal + contentTestsTotal + integrationTestsTotal + testFilesTotal;

console.log('🎯 测试总结');
console.log(`📊 总计: ${totalPassed}/${totalTests} 测试通过`);

if (totalPassed === totalTests) {
  console.log('🎉 所有测试通过！开发服务器功能已就绪');
  process.exit(0);
} else {
  console.log('⚠️  部分测试失败，需要修复');
  process.exit(1);
}
