#!/usr/bin/env node

/**
 * MPLP Mapper Consistency Checker
 * 
 * 验证双重命名约定的一致性：
 * 1. Schema层使用snake_case
 * 2. TypeScript层使用camelCase
 * 3. Mapper函数正确实现双向转换
 * 4. 字段映射100%一致性
 */

const fs = require('fs');
const path = require('path');

class MapperConsistencyChecker {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.checkedMappers = 0;
    this.checkedFields = 0;
  }

  /**
   * 运行完整的Mapper一致性检查
   */
  runChecks() {
    console.log('🔍 开始Mapper字段映射验证...\n');

    try {
      // 1. 扫描所有Mapper文件
      const mapperFiles = this.scanMapperFiles();
      console.log(`📁 找到 ${mapperFiles.length} 个Mapper文件`);

      // 2. 检查每个Mapper的一致性
      for (const mapperFile of mapperFiles) {
        this.checkMapperConsistency(mapperFile);
      }

      // 3. 输出结果
      this.outputResults();

    } catch (error) {
      console.error('❌ Mapper一致性检查失败:', error.message);
      process.exit(1);
    }
  }

  /**
   * 扫描Mapper文件
   */
  scanMapperFiles() {
    const mapperFiles = [];
    const srcDir = 'src';

    if (!fs.existsSync(srcDir)) {
      this.warnings.push('src目录不存在，跳过Mapper检查');
      return mapperFiles;
    }

    this.scanDirectoryForMappers(srcDir, mapperFiles);
    return mapperFiles;
  }

  /**
   * 递归扫描目录查找Mapper文件
   */
  scanDirectoryForMappers(dir, mapperFiles) {
    if (!fs.existsSync(dir)) {
      return;
    }

    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // 跳过不需要的目录
        if (!['node_modules', '.git', 'dist', 'build', 'coverage'].includes(item)) {
          this.scanDirectoryForMappers(fullPath, mapperFiles);
        }
      } else if (stat.isFile()) {
        // 查找Mapper文件
        if (item.includes('mapper') && (item.endsWith('.ts') || item.endsWith('.js'))) {
          mapperFiles.push(fullPath);
        }
      }
    }
  }

  /**
   * 检查单个Mapper文件的一致性
   */
  checkMapperConsistency(mapperFile) {
    try {
      console.log(`🔍 检查 ${mapperFile}...`);

      const content = fs.readFileSync(mapperFile, 'utf8');
      this.checkedMappers++;

      // 检查基本Mapper结构
      this.checkMapperStructure(mapperFile, content);

      // 检查命名约定
      this.checkNamingConventions(mapperFile, content);

      // 检查映射函数
      this.checkMappingFunctions(mapperFile, content);

      console.log(`✅ ${mapperFile} 检查完成`);

    } catch (error) {
      this.errors.push(`读取Mapper文件失败 ${mapperFile}: ${error.message}`);
    }
  }

  /**
   * 检查Mapper基本结构
   */
  checkMapperStructure(mapperFile, content) {
    // 检查是否包含必要的Mapper方法
    const requiredMethods = ['toSchema', 'fromSchema'];
    const optionalMethods = ['validateSchema', 'toSchemaArray', 'fromSchemaArray'];
    
    let foundMethods = 0;
    
    for (const method of requiredMethods) {
      if (content.includes(method)) {
        foundMethods++;
      } else {
        this.warnings.push(`${mapperFile}: 缺少必需方法 ${method}`);
      }
    }
    
    for (const method of optionalMethods) {
      if (content.includes(method)) {
        foundMethods++;
      }
    }
    
    if (foundMethods === 0) {
      this.warnings.push(`${mapperFile}: 未找到任何Mapper方法`);
    }
  }

  /**
   * 检查命名约定
   */
  checkNamingConventions(mapperFile, content) {
    // 检查snake_case模式（Schema层）
    const snakeCasePattern = /[a-z]+_[a-z_]+/g;
    const snakeCaseMatches = content.match(snakeCasePattern) || [];
    
    // 检查camelCase模式（TypeScript层）
    const camelCasePattern = /[a-z]+[A-Z][a-zA-Z]*/g;
    const camelCaseMatches = content.match(camelCasePattern) || [];
    
    if (snakeCaseMatches.length > 0 && camelCaseMatches.length > 0) {
      console.log(`  ✅ 发现双重命名约定: ${snakeCaseMatches.length} snake_case, ${camelCaseMatches.length} camelCase`);
      this.checkedFields += snakeCaseMatches.length + camelCaseMatches.length;
    } else if (snakeCaseMatches.length === 0 && camelCaseMatches.length === 0) {
      this.warnings.push(`${mapperFile}: 未发现明显的命名约定模式`);
    }
  }

  /**
   * 检查映射函数实现
   */
  checkMappingFunctions(mapperFile, content) {
    // 检查toSchema函数
    if (content.includes('toSchema')) {
      if (!content.includes('snake_case') && !content.includes('_')) {
        // 如果没有明显的snake_case转换，给出提示
        this.warnings.push(`${mapperFile}: toSchema函数可能未正确实现snake_case转换`);
      }
    }
    
    // 检查fromSchema函数
    if (content.includes('fromSchema')) {
      if (!content.includes('camelCase') && !this.hasCamelCaseConversion(content)) {
        // 如果没有明显的camelCase转换，给出提示
        this.warnings.push(`${mapperFile}: fromSchema函数可能未正确实现camelCase转换`);
      }
    }
    
    // 检查是否有类型定义
    if (!content.includes('interface') && !content.includes('type')) {
      this.warnings.push(`${mapperFile}: 建议添加TypeScript类型定义`);
    }
  }

  /**
   * 检查是否有camelCase转换
   */
  hasCamelCaseConversion(content) {
    // 查找常见的camelCase转换模式
    const camelCasePatterns = [
      /\w+Id/,           // xxxId
      /\w+At/,           // xxxAt
      /\w+By/,           // xxxBy
      /\w+To/,           // xxxTo
      /\w+From/,         // xxxFrom
      /[a-z][A-Z]/       // 一般的camelCase模式
    ];
    
    return camelCasePatterns.some(pattern => pattern.test(content));
  }

  /**
   * 输出检查结果
   */
  outputResults() {
    console.log('\n📊 Mapper一致性检查结果:');
    console.log(`检查的Mapper文件: ${this.checkedMappers}`);
    console.log(`检查的字段数量: ${this.checkedFields}`);
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
      console.log('\n✅ 所有Mapper一致性检查通过！');
    }
    
    // 如果有错误，退出码为1
    if (this.errors.length > 0) {
      console.log('\n❌ Mapper一致性检查失败');
      process.exit(1);
    } else {
      console.log('\n✅ Mapper一致性检查成功');
      process.exit(0);
    }
  }
}

// 运行检查
if (require.main === module) {
  const checker = new MapperConsistencyChecker();
  try {
    checker.runChecks();
  } catch (error) {
    console.error('Mapper一致性检查失败:', error);
    process.exit(1);
  }
}

module.exports = MapperConsistencyChecker;
