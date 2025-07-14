/**
 * MPLP Schema验证器
 *
 * 验证代码是否符合Schema规范，包括命名约定、厂商中立性等。
 *
 * @version v1.0.0
 * @created 2025-07-19T18:00:00+08:00
 */

import { ISchemaRule, ISchemaValidator, SchemaRuleType, SchemaValidatorConfig, SchemaViolation, SchemaViolationSeverity } from './interfaces';
import { SchemaValidationReport } from './validation-report';
import { promises as fs } from 'fs';
import { join, resolve, relative } from 'path';
import * as globModule from 'glob';
import { Logger } from '../../utils/logger';
import { Performance } from '../../utils/performance';

// 声明glob函数类型
const glob = globModule.glob as (pattern: string, options?: globModule.IOptions) => Promise<string[]>;

/**
 * Schema验证器类
 * 
 * 实现ISchemaValidator接口，提供代码验证功能。
 */
export class SchemaValidator implements ISchemaValidator {
  /**
   * 验证规则列表
   */
  private rules: ISchemaRule[];

  /**
   * 验证配置
   */
  private config: SchemaValidatorConfig;

  /**
   * 日志记录器
   */
  private logger: Logger;

  /**
   * 性能监控
   */
  private performance: Performance;

  /**
   * 创建Schema验证器
   * 
   * @param config 验证配置
   */
  constructor(config?: SchemaValidatorConfig) {
    this.rules = [];
    this.config = {
      includePatterns: ['**/*.{ts,js,tsx,jsx,json}'],
      excludePatterns: ['**/node_modules/**', '**/dist/**', '**/build/**'],
      minSeverity: SchemaViolationSeverity.WARNING,
      fix: false,
      showProgress: true,
      verbose: false,
      ...config
    };
    this.logger = new Logger('SchemaValidator');
    this.performance = new Performance();
  }

  /**
   * 注册验证规则
   * 
   * @param rule 验证规则
   * @returns 是否成功
   */
  public registerRule(rule: ISchemaRule): boolean {
    // 检查规则ID是否已存在
    const existingRule = this.rules.find(r => r.getId() === rule.getId());
    if (existingRule) {
      this.logger.warn(`规则ID "${rule.getId()}" 已存在，将被替换`);
      this.rules = this.rules.filter(r => r.getId() !== rule.getId());
    }
    
    this.rules.push(rule);
    
    if (this.config.verbose) {
      this.logger.info(`注册规则: ${rule.getId()} (${rule.getType()}) - ${rule.getDescription()}`);
    }
    
    return true;
  }

  /**
   * 获取所有验证规则
   * 
   * @returns 所有验证规则
   */
  public getAllRules(): ISchemaRule[] {
    return [...this.rules];
  }

  /**
   * 获取特定类型的验证规则
   * 
   * @param type 规则类型
   * @returns 特定类型的验证规则
   */
  public getRulesByType(type: SchemaRuleType): ISchemaRule[] {
    return this.rules.filter(rule => rule.getType() === type);
  }

  /**
   * 验证单个文件
   * 
   * @param filePath 文件路径
   * @returns 验证问题列表
   */
  public async validateFile(filePath: string): Promise<SchemaViolation[]> {
    const startTime = this.performance.now();
    
    try {
      // 读取文件内容
      const content = await fs.readFile(filePath, 'utf-8');
      
      // 获取适用的规则
      const applicableRules = this.getApplicableRules();
      
      // 应用所有规则
      const violationsPromises = applicableRules.map(rule => rule.validate(filePath, content));
      const violationsArrays = await Promise.all(violationsPromises);
      
      // 合并所有验证问题
      const allViolations = violationsArrays.flat();
      
      // 过滤低于最小严重级别的问题
      const filteredViolations = this.filterViolationsBySeverity(allViolations);
      
      const duration = this.performance.since(startTime);
      
      if (this.config.verbose) {
        this.logger.info(`验证文件 ${filePath} 完成，发现 ${filteredViolations.length} 个问题，耗时 ${duration}ms`);
      }
      
      return filteredViolations;
    } catch (error) {
      this.logger.error(`验证文件 ${filePath} 失败:`, {
        error: error instanceof Error ? error.message : String(error)
      });
      
      // 返回文件读取错误作为验证问题
      return [{
        id: `file_error_${Date.now()}`,
        ruleType: SchemaRuleType.STRUCTURE,
        severity: SchemaViolationSeverity.ERROR,
        message: `文件读取失败: ${error instanceof Error ? error.message : String(error)}`,
        location: {
          filePath
        }
      }];
    }
  }

  /**
   * 验证多个文件
   * 
   * @param filePaths 文件路径列表
   * @returns 验证报告
   */
  public async validateFiles(filePaths: string[]): Promise<SchemaValidationReport> {
    const startTime = this.performance.now();
    const report = new SchemaValidationReport();
    
    if (this.config.showProgress) {
      this.logger.info(`开始验证 ${filePaths.length} 个文件...`);
    }
    
    let processedCount = 0;
    
    for (const filePath of filePaths) {
      // 验证单个文件
      const violations = await this.validateFile(filePath);
      
      // 添加到报告
      report.addViolations(violations);
      
      // 更新进度
      processedCount++;
      if (this.config.showProgress && processedCount % 10 === 0) {
        const progress = Math.round((processedCount / filePaths.length) * 100);
        this.logger.info(`验证进度: ${progress}% (${processedCount}/${filePaths.length})`);
      }
    }
    
    const duration = this.performance.since(startTime);
    
    this.logger.info(`验证完成，共验证 ${filePaths.length} 个文件，发现 ${report.getViolationCount()} 个问题，耗时 ${duration}ms`);
    
    return report;
  }

  /**
   * 验证目录
   * 
   * @param dirPath 目录路径
   * @param recursive 是否递归
   * @returns 验证报告
   */
  public async validateDirectory(dirPath: string, recursive: boolean = true): Promise<SchemaValidationReport> {
    const startTime = this.performance.now();
    
    try {
      // 解析目录路径
      const resolvedDirPath = resolve(dirPath);
      
      // 构建glob模式
      const globPattern = recursive ? `${resolvedDirPath}/**/*` : `${resolvedDirPath}/*`;
      
      // 查找文件
      const files = await this.findFiles(globPattern);
      
      if (this.config.verbose) {
        this.logger.info(`在目录 ${dirPath} 中找到 ${files.length} 个文件`);
      }
      
      // 验证文件
      const report = await this.validateFiles(files);
      
      const duration = this.performance.since(startTime);
      
      this.logger.info(`验证目录 ${dirPath} 完成，耗时 ${duration}ms`);
      
      return report;
    } catch (error) {
      this.logger.error(`验证目录 ${dirPath} 失败:`, {
        error: error instanceof Error ? error.message : String(error)
      });
      
      // 返回空报告
      return new SchemaValidationReport();
    }
  }

  /**
   * 验证项目
   * 
   * @param projectRoot 项目根目录
   * @returns 验证报告
   */
  public async validateProject(projectRoot: string): Promise<SchemaValidationReport> {
    const startTime = this.performance.now();
    
    try {
      // 解析项目根目录
      const resolvedProjectRoot = resolve(projectRoot);
      
      this.logger.info(`开始验证项目: ${resolvedProjectRoot}`);
      
      // 查找文件
      const files = await this.findProjectFiles(resolvedProjectRoot);
      
      if (this.config.verbose) {
        this.logger.info(`在项目中找到 ${files.length} 个文件`);
      }
      
      // 验证文件
      const report = await this.validateFiles(files);
      
      const duration = this.performance.since(startTime);
      
      this.logger.info(`验证项目 ${resolvedProjectRoot} 完成，耗时 ${duration}ms`);
      
      return report;
    } catch (error) {
      this.logger.error(`验证项目 ${projectRoot} 失败:`, {
        error: error instanceof Error ? error.message : String(error)
      });
      
      // 返回空报告
      return new SchemaValidationReport();
    }
  }

  /**
   * 修复验证问题
   * 
   * @param violations 验证问题列表
   * @returns 修复的问题数
   */
  public async fixViolations(violations: SchemaViolation[]): Promise<number> {
    // 当前版本不支持自动修复
    this.logger.warn('自动修复功能尚未实现');
    return 0;
  }

  /**
   * 获取适用的规则
   * 
   * @returns 适用的规则列表
   */
  private getApplicableRules(): ISchemaRule[] {
    // 如果指定了规则ID列表，只使用这些规则
    if (this.config.ruleIds && this.config.ruleIds.length > 0) {
      return this.rules.filter(rule => this.config.ruleIds!.includes(rule.getId()));
    }
    
    // 如果指定了忽略规则ID列表，排除这些规则
    if (this.config.ignoreRuleIds && this.config.ignoreRuleIds.length > 0) {
      return this.rules.filter(rule => !this.config.ignoreRuleIds!.includes(rule.getId()));
    }
    
    // 否则使用所有规则
    return this.rules;
  }

  /**
   * 过滤低于最小严重级别的问题
   * 
   * @param violations 验证问题列表
   * @returns 过滤后的验证问题列表
   */
  private filterViolationsBySeverity(violations: SchemaViolation[]): SchemaViolation[] {
    // 如果没有指定最小严重级别，返回所有问题
    if (!this.config.minSeverity) {
      return violations;
    }
    
    // 计算最小严重级别的索引
    const severityLevels = Object.values(SchemaViolationSeverity);
    const minSeverityIndex = severityLevels.indexOf(this.config.minSeverity);
    
    if (minSeverityIndex === -1) {
      return violations;
    }
    
    // 过滤低于最小严重级别的问题
    return violations.filter(violation => {
      const severityIndex = severityLevels.indexOf(violation.severity);
      return severityIndex >= minSeverityIndex;
    });
  }

  /**
   * 查找项目文件
   * 
   * @param projectRoot 项目根目录
   * @returns 文件路径列表
   */
  private async findProjectFiles(projectRoot: string): Promise<string[]> {
    // 构建包含模式
    const includePatterns = this.config.includePatterns?.map(pattern => join(projectRoot, pattern as string)) || [];
    
    // 构建排除模式
    const excludePatterns = this.config.excludePatterns?.map(pattern => join(projectRoot, pattern as string)) || [];
    
    // 查找文件
    const files: string[] = [];
    
    for (const pattern of includePatterns) {
      const matchedFiles = await glob(pattern, {
        ignore: excludePatterns,
        nodir: true,
        absolute: true
      });
      
      files.push(...matchedFiles);
    }
    
    // 去重
    return [...new Set(files)];
  }

  /**
   * 查找文件
   * 
   * @param globPattern glob模式
   * @returns 文件路径列表
   */
  private async findFiles(globPattern: string): Promise<string[]> {
    // 构建排除模式
    const excludePatterns = this.config.excludePatterns || [];
    
    // 查找文件
    const files = await glob(globPattern, {
      ignore: excludePatterns,
      nodir: true,
      absolute: true
    });
    
    // 过滤文件类型
    return files.filter((file: string) => {
      const ext = file.split('.').pop()?.toLowerCase();
      return ext && ['ts', 'js', 'tsx', 'jsx', 'json'].includes(ext);
    });
  }
} 