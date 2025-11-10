#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔍 测试npm包大小\n');

try {
  console.log('1. 运行 npm pack --dry-run...\n');
  
  const output = execSync('npm pack --dry-run', { 
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe']
  });
  
  console.log(output);
  
  // 提取大小信息
  const lines = output.split('\n');
  for (const line of lines) {
    if (line.includes('package size') || line.includes('unpacked size') || line.includes('total files')) {
      console.log('📊', line.trim());
    }
  }
  
} catch (error) {
  console.error('❌ 错误:', error.message);
  if (error.stdout) {
    console.log('\n输出:', error.stdout.toString());
  }
  if (error.stderr) {
    console.error('\n错误输出:', error.stderr.toString());
  }
}

