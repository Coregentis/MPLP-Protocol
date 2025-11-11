#!/usr/bin/env node

/**
 * CodeQL本地扫描脚本
 * 使用本地安装的CodeQL CLI进行安全扫描
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

// CodeQL CLI路径
const CODEQL_PATH = path.join(
  os.homedir(),
  'AppData/Roaming/Code/User/globalStorage/github.vscode-codeql/distribution1/codeql/codeql.exe'
);

// 检查CodeQL是否存在
if (!fs.existsSync(CODEQL_PATH)) {
  console.error('❌ CodeQL CLI not found at:', CODEQL_PATH);
  console.error('Please install the CodeQL VSCode extension first');
  process.exit(1);
}

console.log('✅ Found CodeQL CLI');
console.log('');

// 数据库目录
const DB_DIR = path.join(process.cwd(), 'codeql-db');
const RESULTS_DIR = path.join(process.cwd(), 'codeql-results');

// 清理旧的结果
if (fs.existsSync(RESULTS_DIR)) {
  fs.rmSync(RESULTS_DIR, { recursive: true, force: true });
}
fs.mkdirSync(RESULTS_DIR, { recursive: true });

/**
 * 运行CodeQL命令
 */
function runCodeQL(args, description) {
  return new Promise((resolve, reject) => {
    console.log(`🔍 ${description}...`);
    
    const child = spawn(CODEQL_PATH, args, {
      stdio: 'inherit',
      shell: false
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ ${description} completed`);
        console.log('');
        resolve();
      } else {
        reject(new Error(`${description} failed with code ${code}`));
      }
    });
    
    child.on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * 主函数
 */
async function main() {
  try {
    // 步骤1: 创建数据库（如果不存在）
    if (!fs.existsSync(DB_DIR)) {
      console.log('📦 Creating CodeQL database...');
      console.log('This will take 2-3 minutes for the first time...');
      console.log('');
      
      await runCodeQL([
        'database',
        'create',
        DB_DIR,
        '--language=javascript',
        `--source-root=${process.cwd()}`,
        '--overwrite'
      ], 'Database creation');
    } else {
      console.log('✅ Using existing CodeQL database');
      console.log('');
    }
    
    // 步骤2: 运行安全查询
    console.log('🔍 Running security analysis...');
    console.log('');
    
    const RESULT_FILE = path.join(RESULTS_DIR, 'security-results.sarif');
    
    await runCodeQL([
      'database',
      'analyze',
      DB_DIR,
      '--format=sarif-latest',
      `--output=${RESULT_FILE}`,
      '--sarif-category=javascript',
      '--',
      'javascript-security-and-quality.qls'
    ], 'Security analysis');
    
    // 步骤3: 生成CSV报告（更易读）
    console.log('📊 Generating CSV report...');
    console.log('');
    
    const CSV_FILE = path.join(RESULTS_DIR, 'security-results.csv');
    
    await runCodeQL([
      'database',
      'analyze',
      DB_DIR,
      '--format=csv',
      `--output=${CSV_FILE}`,
      '--',
      'javascript-security-and-quality.qls'
    ], 'CSV report generation');
    
    // 步骤4: 显示结果摘要
    console.log('');
    console.log('🎉 CodeQL scan completed!');
    console.log('');
    console.log('📁 Results directory:', RESULTS_DIR);
    console.log('📄 SARIF file:', RESULT_FILE);
    console.log('📄 CSV file:', CSV_FILE);
    console.log('');
    console.log('💡 To view results:');
    console.log('   1. Install "SARIF Viewer" VSCode extension');
    console.log('   2. Open', path.basename(RESULT_FILE), 'in VSCode');
    console.log('   3. Or open', path.basename(CSV_FILE), 'in Excel/spreadsheet');
    console.log('');
    
    // 步骤5: 解析并显示关键问题
    if (fs.existsSync(CSV_FILE)) {
      console.log('📋 Parsing results...');
      const csvContent = fs.readFileSync(CSV_FILE, 'utf-8');
      const lines = csvContent.split('\n');
      
      if (lines.length > 1) {
        console.log(`Found ${lines.length - 1} potential issues`);
        console.log('');
        console.log('Top 10 issues:');
        lines.slice(1, 11).forEach((line, index) => {
          if (line.trim()) {
            const parts = line.split(',');
            if (parts.length >= 3) {
              console.log(`${index + 1}. ${parts[0]}: ${parts[2]}`);
            }
          }
        });
      } else {
        console.log('✅ No security issues found!');
      }
    }
    
  } catch (error) {
    console.error('');
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// 运行主函数
main();

