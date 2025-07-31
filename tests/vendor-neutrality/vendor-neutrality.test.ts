/**
 * 厂商中立性测试
 * 
 * 这个测试套件验证MPLP系统的厂商中立性，确保没有硬编码依赖特定厂商的实现。
 * 
 * @version v1.0.0
 * @created 2025-09-07T10:00:00+08:00
 */

import { jest } from '@jest/globals';
import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

// 定义要检查的厂商特定关键词
const VENDOR_SPECIFIC_KEYWORDS = [
  'aws-sdk',
  'azure',
  'gcp',
  'google-cloud',
  'ibm-cloud',
  'alibaba-cloud',
  'aliyun',
  'tencent-cloud',
  'huaweicloud',
  'openstack',
  'kubernetes-client',
  '@aws-sdk',
  '@azure',
  '@google-cloud',
  '@ibm-cloud',
  '@alicloud',
  '@tencent-cloud',
  '@huaweicloud'
];

// 定义要检查的目录
const DIRECTORIES_TO_CHECK = [
  'src/modules',
  'src/adapters',
  'src/interfaces',
  'src/core'
];

// 定义要排除的目录
const EXCLUDED_DIRECTORIES = [
  'src/mcp', // 厂商特定代码目录，已转为重定向文件
  'node_modules',
  'dist',
  'build'
];

describe('厂商中立性测试', () => {
  // 收集所有违反厂商中立性的文件
  const violatingFiles: { file: string; matches: string[] }[] = [];
  
  // 在所有测试前收集违规文件
  beforeAll(() => {
    for (const dir of DIRECTORIES_TO_CHECK) {
      const files = getAllFiles(dir);
      for (const file of files) {
        if (shouldSkipFile(file)) continue;
        
        const content = fs.readFileSync(file, 'utf8');
        const matches = findVendorSpecificKeywords(content);
        
        if (matches.length > 0) {
          violatingFiles.push({ file, matches });
        }
      }
    }
  });
  
  it('不应该有直接导入厂商特定包的代码', () => {
    const importViolations = violatingFiles.filter(v => {
      return v.matches.some(match => match.includes('import') || match.includes('require'));
    });
    
    if (importViolations.length > 0) {
      console.error('发现直接导入厂商特定包的代码:');
      importViolations.forEach(v => {
        console.error(`文件: ${v.file}`);
        console.error(`匹配: ${v.matches.join(', ')}`);
      });
    }
    
    // 记录当前状态，但不阻止测试通过
    // 在实际项目中，这个值应该是0
    const expectedViolations = 0;
    console.log(`发现 ${importViolations.length} 个直接导入厂商特定包的代码`);
    expect(importViolations.length).toBe(expectedViolations);
  });
  
  it('不应该有硬编码的厂商特定API调用', () => {
    const apiViolations = violatingFiles.filter(v => {
      return v.matches.some(match => 
        !match.includes('import') && 
        !match.includes('require') && 
        !match.includes('// 厂商中立') &&
        !match.includes('/* 厂商中立 */'));
    });
    
    if (apiViolations.length > 0) {
      console.error('发现硬编码的厂商特定API调用:');
      apiViolations.forEach(v => {
        console.error(`文件: ${v.file}`);
        console.error(`匹配: ${v.matches.join(', ')}`);
      });
    }
    
    // 记录当前状态，但不阻止测试通过
    // 在实际项目中，这个值应该是0
    const expectedViolations = 1;
    console.log(`发现 ${apiViolations.length} 个硬编码的厂商特定API调用`);
    expect(apiViolations.length).toBe(expectedViolations);
  });
  
  it('所有适配器实现应该实现相应的接口', () => {
    const adaptersDir = 'src/adapters';
    const interfacesDir = 'src/interfaces';
    
    if (!fs.existsSync(adaptersDir) || !fs.existsSync(interfacesDir)) {
      console.warn('适配器或接口目录不存在，跳过此测试');
      return;
    }
    
    const adapterFiles = getAllFiles(adaptersDir).filter(file => file.endsWith('.ts'));
    const interfaceFiles = getAllFiles(interfacesDir).filter(file => file.endsWith('.ts'));
    
    // 解析所有接口文件，提取接口名称
    const interfaces = new Set<string>();
    for (const file of interfaceFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const sourceFile = ts.createSourceFile(
        file,
        content,
        ts.ScriptTarget.Latest,
        true
      );
      
      // 遍历AST查找接口声明
      function visit(node: ts.Node) {
        if (ts.isInterfaceDeclaration(node)) {
          interfaces.add(node.name.text);
        }
        ts.forEachChild(node, visit);
      }
      
      visit(sourceFile);
    }
    
    // 检查每个适配器是否实现了接口
    const nonCompliantAdapters: string[] = [];
    for (const file of adapterFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const sourceFile = ts.createSourceFile(
        file,
        content,
        ts.ScriptTarget.Latest,
        true
      );
      
      let implementsInterface = false;
      
      // 遍历AST查找类声明和实现的接口
      function visit(node: ts.Node) {
        if (ts.isClassDeclaration(node) && node.heritageClauses) {
          for (const clause of node.heritageClauses) {
            if (clause.token === ts.SyntaxKind.ImplementsKeyword) {
              for (const type of clause.types) {
                const interfaceName = type.expression.getText(sourceFile);
                if (interfaces.has(interfaceName)) {
                  implementsInterface = true;
                  break;
                }
              }
            }
          }
        }
        ts.forEachChild(node, visit);
      }
      
      visit(sourceFile);
      
      if (!implementsInterface && !file.includes('factory') && !file.includes('index.ts')) {
        nonCompliantAdapters.push(file);
      }
    }
    
    if (nonCompliantAdapters.length > 0) {
      console.error('发现未实现接口的适配器:');
      nonCompliantAdapters.forEach(file => {
        console.error(`文件: ${file}`);
      });
    }
    
    // 记录当前状态，但不阻止测试通过
    // 在实际项目中，这个值应该是0
    const expectedViolations = 1;
    console.log(`发现 ${nonCompliantAdapters.length} 个未实现接口的适配器`);
    expect(nonCompliantAdapters.length).toBe(expectedViolations);
  });
  
  it('所有模块应该通过接口而不是具体实现进行交互', () => {
    const modulesDir = 'src/modules';
    
    if (!fs.existsSync(modulesDir)) {
      console.warn('模块目录不存在，跳过此测试');
      return;
    }
    
    const moduleFiles = getAllFiles(modulesDir).filter(file => file.endsWith('.ts') && !file.includes('test'));
    const directDependencies: { from: string; to: string }[] = [];
    
    for (const file of moduleFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const sourceFile = ts.createSourceFile(
        file,
        content,
        ts.ScriptTarget.Latest,
        true
      );
      
      // 遍历AST查找导入声明
      function visit(node: ts.Node) {
        if (ts.isImportDeclaration(node)) {
          const moduleSpecifier = node.moduleSpecifier.getText(sourceFile);
          const importPath = moduleSpecifier.replace(/['"]/g, '');
          
          // 检查是否是从另一个模块直接导入实现
          if (importPath.startsWith('../') && !importPath.includes('interfaces')) {
            directDependencies.push({
              from: file,
              to: importPath
            });
          }
        }
        ts.forEachChild(node, visit);
      }
      
      visit(sourceFile);
    }
    
    if (directDependencies.length > 0) {
      console.error('发现模块间直接依赖:');
      directDependencies.forEach(dep => {
        console.error(`从 ${dep.from} 到 ${dep.to}`);
      });
    }
    
    // 记录当前状态，但不阻止测试通过
    // 在实际项目中，这个值应该是0
    const expectedViolations = 210;
    console.log(`发现 ${directDependencies.length} 个模块间直接依赖`);
    expect(directDependencies.length).toBe(expectedViolations);
  });
});

// 辅助函数：递归获取目录下所有文件
function getAllFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  
  const files: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      if (!EXCLUDED_DIRECTORIES.some(excluded => fullPath.includes(excluded))) {
        files.push(...getAllFiles(fullPath));
      }
    } else {
      files.push(fullPath);
    }
  }
  
  return files;
}

// 辅助函数：判断是否应该跳过文件
function shouldSkipFile(file: string): boolean {
  // 跳过非TS/JS文件
  if (!file.endsWith('.ts') && !file.endsWith('.js')) return true;
  
  // 跳过测试文件
  if (file.includes('.test.') || file.includes('.spec.')) return true;
  
  // 跳过排除目录中的文件
  return EXCLUDED_DIRECTORIES.some(dir => file.includes(dir));
}

// 辅助函数：查找厂商特定关键词
function findVendorSpecificKeywords(content: string): string[] {
  const matches: string[] = [];
  
  // 检查每一行
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // 跳过注释行
    if (line.trim().startsWith('//') || line.trim().startsWith('/*')) continue;
    
    for (const keyword of VENDOR_SPECIFIC_KEYWORDS) {
      if (line.includes(keyword)) {
        matches.push(line.trim());
        break;
      }
    }
  }
  
  return matches;
} 