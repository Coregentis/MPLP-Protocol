/**
 * 自动化Release版本构建脚本
 * 从Dev版本筛选出符合开源发布标准的内容
 * 
 * @version 1.0.0
 * @created 2025-01-29T07:00:00+08:00
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

interface BuildConfig {
  sourceDir: string;
  outputDir: string;
  includePatterns: string[];
  excludePatterns: string[];
  excludeMarkers: string[];
  dryRun: boolean;
  verbose: boolean;
}

interface BuildReport {
  totalFiles: number;
  includedFiles: number;
  excludedFiles: number;
  modifiedFiles: number;
  errors: string[];
  warnings: string[];
}

class ReleaseVersionBuilder {
  private config: BuildConfig;
  private report: BuildReport;

  constructor(config: BuildConfig) {
    this.config = config;
    this.report = {
      totalFiles: 0,
      includedFiles: 0,
      excludedFiles: 0,
      modifiedFiles: 0,
      errors: [],
      warnings: []
    };
  }

  async build(): Promise<BuildReport> {
    console.log('🚀 开始构建Release版本...');
    console.log(`源目录: ${this.config.sourceDir}`);
    console.log(`输出目录: ${this.config.outputDir}`);
    console.log(`干运行模式: ${this.config.dryRun}`);

    try {
      // 1. 清理输出目录
      await this.cleanOutputDirectory();

      // 2. 扫描和筛选文件
      await this.scanAndFilterFiles(this.config.sourceDir);

      // 3. 生成构建报告
      this.generateBuildReport();

      // 4. 验证构建结果
      await this.validateBuild();

      console.log('✅ Release版本构建完成');
      return this.report;

    } catch (error) {
      this.report.errors.push(`构建失败: ${error instanceof Error ? error.message : String(error)}`);
      console.error('❌ Release版本构建失败:', error);
      throw error;
    }
  }

  private async cleanOutputDirectory(): Promise<void> {
    if (!this.config.dryRun && fs.existsSync(this.config.outputDir)) {
      fs.rmSync(this.config.outputDir, { recursive: true });
    }
    
    if (!this.config.dryRun) {
      fs.mkdirSync(this.config.outputDir, { recursive: true });
    }
    
    console.log(`📁 输出目录已${this.config.dryRun ? '模拟' : '实际'}清理`);
  }

  private async scanAndFilterFiles(dir: string, relativePath = ''): Promise<void> {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativeFilePath = path.join(relativePath, entry.name);

      this.report.totalFiles++;

      if (entry.isDirectory()) {
        // 检查目录是否应该被排除
        if (this.shouldExcludeDirectory(relativeFilePath)) {
          this.report.excludedFiles++;
          if (this.config.verbose) {
            console.log(`📁❌ 排除目录: ${relativeFilePath}`);
          }
          continue;
        }

        // 递归处理子目录
        const outputSubDir = path.join(this.config.outputDir, relativeFilePath);
        if (!this.config.dryRun) {
          fs.mkdirSync(outputSubDir, { recursive: true });
        }
        
        await this.scanAndFilterFiles(fullPath, relativeFilePath);

      } else {
        // 处理文件
        await this.processFile(fullPath, relativeFilePath);
      }
    }
  }

  private async processFile(fullPath: string, relativeFilePath: string): Promise<void> {
    // 检查文件是否应该被排除
    if (this.shouldExcludeFile(relativeFilePath)) {
      this.report.excludedFiles++;
      if (this.config.verbose) {
        console.log(`📄❌ 排除文件: ${relativeFilePath}`);
      }
      return;
    }

    // 检查文件是否应该被包含
    if (!this.shouldIncludeFile(relativeFilePath)) {
      this.report.excludedFiles++;
      if (this.config.verbose) {
        console.log(`📄⚠️ 未匹配包含规则: ${relativeFilePath}`);
      }
      return;
    }

    try {
      // 读取文件内容
      const content = fs.readFileSync(fullPath, 'utf8');
      
      // 检查和处理文件内容
      const processedContent = this.processFileContent(content, relativeFilePath);
      
      if (processedContent === null) {
        // 文件被内容过滤器排除
        this.report.excludedFiles++;
        if (this.config.verbose) {
          console.log(`📄🔒 内容过滤排除: ${relativeFilePath}`);
        }
        return;
      }

      // 写入处理后的文件
      const outputPath = path.join(this.config.outputDir, relativeFilePath);
      
      if (!this.config.dryRun) {
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
        fs.writeFileSync(outputPath, processedContent);
      }

      this.report.includedFiles++;
      
      if (processedContent !== content) {
        this.report.modifiedFiles++;
        if (this.config.verbose) {
          console.log(`📄✏️ 修改文件: ${relativeFilePath}`);
        }
      } else if (this.config.verbose) {
        console.log(`📄✅ 包含文件: ${relativeFilePath}`);
      }

    } catch (error) {
      this.report.errors.push(`处理文件失败 ${relativeFilePath}: ${error instanceof Error ? error.message : String(error)}`);
      console.error(`❌ 处理文件失败: ${relativeFilePath}`, error);
    }
  }

  private shouldExcludeDirectory(dirPath: string): boolean {
    const normalizedPath = dirPath.replace(/\\/g, '/');
    
    return this.config.excludePatterns.some(pattern => {
      const normalizedPattern = pattern.replace(/\\/g, '/');
      return this.matchPattern(normalizedPath, normalizedPattern);
    });
  }

  private shouldExcludeFile(filePath: string): boolean {
    const normalizedPath = filePath.replace(/\\/g, '/');
    
    // 检查文件扩展名和名称
    const excludeFilePatterns = [
      '**/.env*',
      '**/*.key',
      '**/*.pem',
      '**/*.p12',
      '**/secrets.*',
      '**/credentials.*',
      '**/docker-compose*.yml',
      '**/.DS_Store',
      '**/Thumbs.db',
      '**/*.log'
    ];

    return [...this.config.excludePatterns, ...excludeFilePatterns].some(pattern => {
      const normalizedPattern = pattern.replace(/\\/g, '/');
      return this.matchPattern(normalizedPath, normalizedPattern);
    });
  }

  private shouldIncludeFile(filePath: string): boolean {
    const normalizedPath = filePath.replace(/\\/g, '/');
    
    return this.config.includePatterns.some(pattern => {
      const normalizedPattern = pattern.replace(/\\/g, '/');
      return this.matchPattern(normalizedPath, normalizedPattern);
    });
  }

  private matchPattern(path: string, pattern: string): boolean {
    // 简单的glob模式匹配
    const regexPattern = pattern
      .replace(/\*\*/g, '.*')
      .replace(/\*/g, '[^/]*')
      .replace(/\?/g, '[^/]');
    
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(path);
  }

  private processFileContent(content: string, filePath: string): string | null {
    let processedContent = content;
    let hasExcludedContent = false;

    // 检查是否包含排除标记
    for (const marker of this.config.excludeMarkers) {
      if (content.includes(marker)) {
        // 如果是TypeScript/JavaScript文件，尝试移除标记的代码块
        if (filePath.endsWith('.ts') || filePath.endsWith('.js')) {
          processedContent = this.removeMarkedCodeBlocks(processedContent, marker);
          hasExcludedContent = true;
        } else {
          // 对于其他文件类型，如果包含排除标记则完全排除
          return null;
        }
      }
    }

    // 移除敏感信息模式
    processedContent = this.removeSensitivePatterns(processedContent);

    // 检查是否为空文件或只包含注释
    if (this.isEmptyOrCommentsOnly(processedContent, filePath)) {
      return null;
    }

    return processedContent;
  }

  private removeMarkedCodeBlocks(content: string, marker: string): string {
    const lines = content.split('\n');
    const result: string[] = [];
    let skipBlock = false;
    let blockDepth = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.includes(marker)) {
        skipBlock = true;
        blockDepth = this.getIndentationLevel(line);
        continue;
      }

      if (skipBlock) {
        const currentDepth = this.getIndentationLevel(line);
        
        // 如果遇到同级或更低级的代码，结束跳过
        if (line.trim() && currentDepth <= blockDepth) {
          skipBlock = false;
          result.push(line);
        }
        // 否则跳过这一行
      } else {
        result.push(line);
      }
    }

    return result.join('\n');
  }

  private getIndentationLevel(line: string): number {
    const match = line.match(/^(\s*)/);
    return match ? match[1].length : 0;
  }

  private removeSensitivePatterns(content: string): string {
    const sensitivePatterns = [
      /sk-[a-zA-Z0-9]{48}/g,           // OpenAI API keys
      /pk_[a-zA-Z0-9]{24}/g,           // Stripe keys
      /AKIA[0-9A-Z]{16}/g,             // AWS Access Keys
      /mongodb:\/\/[^\s]+/g,           // MongoDB connection strings
      /postgres:\/\/[^\s]+/g,          // PostgreSQL connection strings
      /mysql:\/\/[^\s]+/g,             // MySQL connection strings
      /redis:\/\/[^\s]+/g,             // Redis connection strings
      /https?:\/\/[^\/\s]+\.internal/g, // Internal URLs
    ];

    let processedContent = content;
    
    for (const pattern of sensitivePatterns) {
      processedContent = processedContent.replace(pattern, '[REDACTED]');
    }

    return processedContent;
  }

  private isEmptyOrCommentsOnly(content: string, filePath: string): boolean {
    const trimmed = content.trim();
    
    if (!trimmed) {
      return true;
    }

    // 检查是否只包含注释
    if (filePath.endsWith('.ts') || filePath.endsWith('.js')) {
      const lines = trimmed.split('\n');
      const codeLines = lines.filter(line => {
        const trimmedLine = line.trim();
        return trimmedLine && 
               !trimmedLine.startsWith('//') && 
               !trimmedLine.startsWith('/*') && 
               !trimmedLine.startsWith('*') &&
               trimmedLine !== '*/';
      });
      
      return codeLines.length === 0;
    }

    return false;
  }

  private generateBuildReport(): void {
    console.log('\n📊 构建报告:');
    console.log(`总文件数: ${this.report.totalFiles}`);
    console.log(`包含文件: ${this.report.includedFiles}`);
    console.log(`排除文件: ${this.report.excludedFiles}`);
    console.log(`修改文件: ${this.report.modifiedFiles}`);
    console.log(`包含率: ${((this.report.includedFiles / this.report.totalFiles) * 100).toFixed(1)}%`);

    if (this.report.warnings.length > 0) {
      console.log('\n⚠️ 警告:');
      this.report.warnings.forEach(warning => console.log(`  - ${warning}`));
    }

    if (this.report.errors.length > 0) {
      console.log('\n❌ 错误:');
      this.report.errors.forEach(error => console.log(`  - ${error}`));
    }
  }

  private async validateBuild(): Promise<void> {
    if (this.config.dryRun) {
      console.log('🔍 跳过构建验证 (干运行模式)');
      return;
    }

    console.log('🔍 验证构建结果...');

    // 检查必需文件是否存在
    const requiredFiles = [
      'package.json',
      'README.md',
      'LICENSE',
      'src/index.ts',
      'src/modules/core/orchestrator/core-orchestrator.ts'
    ];

    for (const file of requiredFiles) {
      const filePath = path.join(this.config.outputDir, file);
      if (!fs.existsSync(filePath)) {
        this.report.errors.push(`必需文件缺失: ${file}`);
      }
    }

    // 检查是否包含敏感信息
    await this.scanForSensitiveInfo();

    // 检查package.json
    await this.validatePackageJson();
  }

  private async scanForSensitiveInfo(): Promise<void> {
    const sensitivePatterns = [
      /password\s*[:=]\s*['"]/i,
      /secret\s*[:=]\s*['"]/i,
      /token\s*[:=]\s*['"]/i,
      /key\s*[:=]\s*['"]/i,
      /api[_-]?key/i,
      /\.internal\b/,
      /@company\//
    ];

    // 递归扫描输出目录
    const scanDir = (dir: string) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          scanDir(fullPath);
        } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.js') || entry.name.endsWith('.json'))) {
          const content = fs.readFileSync(fullPath, 'utf8');
          
          for (const pattern of sensitivePatterns) {
            if (pattern.test(content)) {
              this.report.warnings.push(`可能包含敏感信息: ${path.relative(this.config.outputDir, fullPath)}`);
            }
          }
        }
      }
    };

    scanDir(this.config.outputDir);
  }

  private async validatePackageJson(): Promise<void> {
    const packageJsonPath = path.join(this.config.outputDir, 'package.json');
    
    if (!fs.existsSync(packageJsonPath)) {
      return;
    }

    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      // 检查必需字段
      const requiredFields = ['name', 'version', 'description', 'main', 'license'];
      for (const field of requiredFields) {
        if (!packageJson[field]) {
          this.report.errors.push(`package.json缺少必需字段: ${field}`);
        }
      }

      // 检查是否包含内部依赖
      const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
      for (const [name, version] of Object.entries(dependencies)) {
        if (typeof name === 'string' && (name.includes('@company') || name.includes('@internal'))) {
          this.report.errors.push(`package.json包含内部依赖: ${name}`);
        }
      }

    } catch (error) {
      this.report.errors.push(`package.json格式错误: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

// 默认配置
const DEFAULT_CONFIG: BuildConfig = {
  sourceDir: process.cwd(),
  outputDir: path.join(process.cwd(), 'release'),
  includePatterns: [
    'src/modules/core/**',
    'src/core/performance/**',
    'src/shared/**',
    'src/utils/**',
    'src/index.ts',
    'tests/unit/**',
    'tests/integration/**',
    'tests/e2e/**',
    'tests/performance/real-*',
    'tests/test-utils/**',
    'docs/README.md',
    'docs/api-reference.md',
    'docs/performance-guide.md',
    'docs/getting-started.md',
    'docs/migration-guide.md',
    'docs/contributing.md',
    'docs/changelog.md',
    'examples/**',
    '.github/workflows/**',
    'package.json',
    'tsconfig.json',
    'jest.config.js',
    'LICENSE',
    'SECURITY.md',
    '*.md'
  ],
  excludePatterns: [
    '**/internal/**',
    '**/experimental/**',
    '**/private/**',
    '**/deployment/**',
    '**/monitoring/**',
    '**/analytics/**',
    '**/configs/**',
    '**/scripts/internal/**',
    '**/scripts/deployment/**',
    '**/scripts/monitoring/**',
    '**/tests/internal/**',
    '**/tests/experimental/**',
    '**/tests/load/**',
    '**/tests/security/**',
    '**/docs/internal/**',
    '**/docs/architecture/**',
    '**/docs/deployment/**',
    '**/node_modules/**',
    '**/dist/**',
    '**/coverage/**',
    '**/.git/**'
  ],
  excludeMarkers: [
    '// @internal',
    '// @experimental',
    '// @private',
    '// @dev-only',
    '/* INTERNAL */',
    '/* EXPERIMENTAL */',
    '/* PRIVATE */',
    '/* DEV-ONLY */'
  ],
  dryRun: false,
  verbose: false
};

// 主函数
async function main() {
  const args = process.argv.slice(2);
  const config = { ...DEFAULT_CONFIG };

  // 解析命令行参数
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--dry-run':
        config.dryRun = true;
        break;
      case '--verbose':
        config.verbose = true;
        break;
      case '--output':
        config.outputDir = args[++i];
        break;
      case '--source':
        config.sourceDir = args[++i];
        break;
    }
  }

  try {
    const builder = new ReleaseVersionBuilder(config);
    const report = await builder.build();

    if (report.errors.length > 0) {
      console.error('\n❌ 构建失败，存在错误');
      process.exit(1);
    } else {
      console.log('\n✅ Release版本构建成功');
      process.exit(0);
    }

  } catch (error) {
    console.error('❌ 构建过程中发生错误:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

export { ReleaseVersionBuilder, BuildConfig, BuildReport };
