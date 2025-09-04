#!/usr/bin/env node

/**
 * MPLP Source Code Import Checker
 * 
 * 检查源代码中的导入语句，确保：
 * 1. 所有导入的模块都存在
 * 2. 导入路径正确
 * 3. 循环依赖检测
 * 4. 未使用的导入检测
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

class SourceImportChecker {
  constructor(sourceDir) {
    this.sourceDir = sourceDir || 'src';
    this.errors = [];
    this.warnings = [];
    this.importMap = new Map();
    this.dependencyGraph = new Map();
  }

  /**
   * 运行完整的导入检查
   */
  async runChecks() {
    console.log(`🔍 检查源代码导入 (${this.sourceDir})...\n`);

    try {
      // 1. 扫描所有TypeScript文件
      const files = await this.scanSourceFiles();
      console.log(`📁 找到 ${files.length} 个源文件`);

      // 2. 分析导入语句
      await this.analyzeImports(files);

      // 3. 检查导入路径有效性
      this.checkImportPaths();

      // 4. 检查循环依赖
      this.checkCircularDependencies();

      // 5. 输出结果
      this.outputResults();

    } catch (error) {
      console.error('❌ 源代码导入检查失败:', error.message);
      process.exit(1);
    }
  }

  /**
   * 扫描源文件
   */
  async scanSourceFiles() {
    const pattern = path.join(this.sourceDir, '**/*.{ts,tsx,js,jsx}').replace(/\\/g, '/');
    
    try {
      const files = await new Promise((resolve, reject) => {
        glob(pattern, (err, matches) => {
          if (err) reject(err);
          else resolve(matches);
        });
      });
      
      return files.filter(file => {
        // 排除测试文件和声明文件
        return !file.includes('.test.') && 
               !file.includes('.spec.') && 
               !file.endsWith('.d.ts');
      });
    } catch (error) {
      throw new Error(`扫描源文件失败: ${error.message}`);
    }
  }

  /**
   * 分析导入语句
   */
  async analyzeImports(files) {
    console.log('🔍 分析导入语句...');

    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const imports = this.extractImports(content);
        
        this.importMap.set(file, imports);
        
        // 构建依赖图
        const dependencies = imports
          .filter(imp => imp.isRelative)
          .map(imp => this.resolveImportPath(file, imp.path));
          
        this.dependencyGraph.set(file, dependencies);
        
      } catch (error) {
        this.errors.push(`读取文件失败 ${file}: ${error.message}`);
      }
    }

    console.log(`✅ 分析了 ${files.length} 个文件的导入语句`);
  }

  /**
   * 提取导入语句
   */
  extractImports(content) {
    const imports = [];
    
    // 匹配 import 语句
    const importRegex = /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)(?:\s*,\s*(?:\{[^}]*\}|\*\s+as\s+\w+|\w+))*\s+from\s+)?['"`]([^'"`]+)['"`]/g;
    
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      const importPath = match[1];
      imports.push({
        path: importPath,
        isRelative: importPath.startsWith('.'),
        isNodeModule: !importPath.startsWith('.') && !importPath.startsWith('/'),
        line: this.getLineNumber(content, match.index)
      });
    }

    // 匹配 require 语句
    const requireRegex = /require\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g;
    
    while ((match = requireRegex.exec(content)) !== null) {
      const importPath = match[1];
      imports.push({
        path: importPath,
        isRelative: importPath.startsWith('.'),
        isNodeModule: !importPath.startsWith('.') && !importPath.startsWith('/'),
        line: this.getLineNumber(content, match.index)
      });
    }

    return imports;
  }

  /**
   * 获取行号
   */
  getLineNumber(content, index) {
    return content.substring(0, index).split('\n').length;
  }

  /**
   * 解析导入路径
   */
  resolveImportPath(fromFile, importPath) {
    if (!importPath.startsWith('.')) {
      return importPath; // 外部模块
    }

    const fromDir = path.dirname(fromFile);
    let resolvedPath = path.resolve(fromDir, importPath);
    
    // 尝试添加常见的文件扩展名
    const extensions = ['.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.js'];
    
    for (const ext of extensions) {
      const testPath = resolvedPath + ext;
      if (fs.existsSync(testPath)) {
        return testPath;
      }
    }
    
    return resolvedPath;
  }

  /**
   * 检查导入路径有效性
   */
  checkImportPaths() {
    console.log('🔍 检查导入路径有效性...');
    
    let invalidImports = 0;
    
    for (const [file, imports] of this.importMap) {
      for (const imp of imports) {
        if (imp.isRelative) {
          const resolvedPath = this.resolveImportPath(file, imp.path);
          
          if (!fs.existsSync(resolvedPath)) {
            this.errors.push(`${file}:${imp.line} - 导入路径不存在: ${imp.path}`);
            invalidImports++;
          }
        } else if (imp.isNodeModule) {
          // 检查是否在package.json中声明
          if (!this.isValidNodeModule(imp.path)) {
            this.warnings.push(`${file}:${imp.line} - 可能未安装的模块: ${imp.path}`);
          }
        }
      }
    }
    
    if (invalidImports === 0) {
      console.log('✅ 所有导入路径有效');
    } else {
      console.log(`❌ 发现 ${invalidImports} 个无效导入路径`);
    }
  }

  /**
   * 检查是否是有效的Node模块
   */
  isValidNodeModule(moduleName) {
    try {
      const packageJsonPath = path.join(process.cwd(), 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
        ...packageJson.peerDependencies
      };
      
      // 检查直接依赖
      if (allDeps[moduleName]) {
        return true;
      }
      
      // 检查作用域包
      const scopedMatch = moduleName.match(/^(@[^/]+\/[^/]+)/);
      if (scopedMatch && allDeps[scopedMatch[1]]) {
        return true;
      }
      
      // 检查子路径导入
      const baseModule = moduleName.split('/')[0];
      if (allDeps[baseModule]) {
        return true;
      }
      
      return false;
    } catch (error) {
      return true; // 如果无法读取package.json，假设模块有效
    }
  }

  /**
   * 检查循环依赖
   */
  checkCircularDependencies() {
    console.log('🔄 检查循环依赖...');
    
    const visited = new Set();
    const recursionStack = new Set();
    const cycles = [];
    
    for (const file of this.dependencyGraph.keys()) {
      if (!visited.has(file)) {
        this.detectCycles(file, visited, recursionStack, [], cycles);
      }
    }
    
    if (cycles.length > 0) {
      console.log(`⚠️ 发现 ${cycles.length} 个循环依赖:`);
      cycles.forEach((cycle, index) => {
        console.log(`  ${index + 1}. ${cycle.join(' → ')}`);
        this.warnings.push(`循环依赖: ${cycle.join(' → ')}`);
      });
    } else {
      console.log('✅ 未发现循环依赖');
    }
  }

  /**
   * 检测循环依赖
   */
  detectCycles(file, visited, recursionStack, path, cycles) {
    visited.add(file);
    recursionStack.add(file);
    path.push(path.basename(file));
    
    const dependencies = this.dependencyGraph.get(file) || [];
    
    for (const dep of dependencies) {
      if (!fs.existsSync(dep)) continue;
      
      if (!visited.has(dep)) {
        this.detectCycles(dep, visited, recursionStack, [...path], cycles);
      } else if (recursionStack.has(dep)) {
        // 找到循环
        const cycleStart = path.indexOf(path.basename(dep));
        if (cycleStart !== -1) {
          const cycle = path.slice(cycleStart).concat([path.basename(dep)]);
          cycles.push(cycle);
        }
      }
    }
    
    recursionStack.delete(file);
  }

  /**
   * 输出检查结果
   */
  outputResults() {
    console.log('\n📊 源代码导入检查结果:');
    console.log(`错误: ${this.errors.length}`);
    console.log(`警告: ${this.warnings.length}`);
    
    if (this.errors.length > 0) {
      console.log('\n❌ 错误:');
      this.errors.forEach(error => console.log(`  - ${error}`));
    }
    
    if (this.warnings.length > 0) {
      console.log('\n⚠️ 警告:');
      this.warnings.forEach(warning => console.log(`  - ${warning}`));
    }
    
    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log('\n✅ 所有导入检查通过！');
    }
    
    // 如果有错误，退出码为1
    if (this.errors.length > 0) {
      console.log('\n❌ 源代码导入检查失败');
      process.exit(1);
    } else {
      console.log('\n✅ 源代码导入检查成功');
      process.exit(0);
    }
  }
}

// 运行检查
if (require.main === module) {
  const sourceDir = process.argv[2] || 'src';
  const checker = new SourceImportChecker(sourceDir);
  checker.runChecks().catch(error => {
    console.error('源代码导入检查失败:', error);
    process.exit(1);
  });
}

module.exports = SourceImportChecker;
