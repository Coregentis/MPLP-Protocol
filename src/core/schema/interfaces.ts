/**
 * MPLP Schema验证器接口定义
 *
 * 定义Schema验证所需的核心接口，包括验证器、规则、报告等。
 * 用于确保代码实现符合架构设计规范和命名约定。
 *
 * @version v1.0.0
 * @created 2025-07-19T09:00:00+08:00
 */

/**
 * 验证规则类型
 */
export enum SchemaRuleType {
  /**
   * 命名规范规则
   */
  NAMING = 'naming',

  /**
   * 接口实现规则
   */
  INTERFACE = 'interface',

  /**
   * 文件组织规则
   */
  STRUCTURE = 'structure',

  /**
   * 文档规则
   */
  DOCUMENTATION = 'documentation',

  /**
   * 依赖规则
   */
  DEPENDENCY = 'dependency',

  /**
   * 厂商中立规则
   */
  VENDOR_NEUTRAL = 'vendor_neutral'
}

/**
 * 验证问题严重级别
 */
export enum SchemaViolationSeverity {
  /**
   * 信息级别，不影响功能但可能影响可维护性
   */
  INFO = 'info',

  /**
   * 警告级别，可能影响功能但不是关键问题
   */
  WARNING = 'warning',

  /**
   * 错误级别，严重违反规范，需要修复
   */
  ERROR = 'error',

  /**
   * 致命级别，阻断性问题，必须立即修复
   */
  FATAL = 'fatal'
}

/**
 * 验证问题位置
 */
export interface SchemaViolationLocation {
  /**
   * 文件路径
   */
  filePath: string;

  /**
   * 开始行号
   */
  startLine?: number;

  /**
   * 结束行号
   */
  endLine?: number;

  /**
   * 开始列号
   */
  startColumn?: number;

  /**
   * 结束列号
   */
  endColumn?: number;

  /**
   * 相关代码片段
   */
  codeSnippet?: string;
}

/**
 * 验证问题
 */
export interface SchemaViolation {
  /**
   * 问题ID
   */
  id: string;

  /**
   * 问题类型
   */
  ruleType: SchemaRuleType;

  /**
   * 问题严重级别
   */
  severity: SchemaViolationSeverity;

  /**
   * 问题描述
   */
  message: string;

  /**
   * 问题位置
   */
  location: SchemaViolationLocation;

  /**
   * 修复建议
   */
  fix?: string;
}

/**
 * 验证规则接口
 */
export interface ISchemaRule {
  /**
   * 获取规则ID
   * @returns 规则ID
   */
  getId(): string;

  /**
   * 获取规则类型
   * @returns 规则类型
   */
  getType(): SchemaRuleType;

  /**
   * 获取规则描述
   * @returns 规则描述
   */
  getDescription(): string;

  /**
   * 获取规则严重级别
   * @returns 规则严重级别
   */
  getSeverity(): SchemaViolationSeverity;

  /**
   * 验证文件内容
   * @param filePath 文件路径
   * @param content 文件内容
   * @returns 验证问题列表
   */
  validate(filePath: string, content: string): Promise<SchemaViolation[]>;
}

/**
 * 验证报告接口
 */
export interface ISchemaValidationReport {
  /**
   * 获取验证时间
   * @returns 验证时间
   */
  getTimestamp(): Date;

  /**
   * 获取验证的文件数
   * @returns 文件数
   */
  getFileCount(): number;

  /**
   * 获取验证问题总数
   * @returns 问题总数
   */
  getViolationCount(): number;

  /**
   * 获取按严重级别分类的问题数
   * @returns 按严重级别分类的问题数
   */
  getViolationCountBySeverity(): Record<SchemaViolationSeverity, number>;

  /**
   * 获取按规则类型分类的问题数
   * @returns 按规则类型分类的问题数
   */
  getViolationCountByRuleType(): Record<SchemaRuleType, number>;

  /**
   * 获取所有验证问题
   * @returns 所有验证问题
   */
  getAllViolations(): SchemaViolation[];

  /**
   * 获取特定文件的验证问题
   * @param filePath 文件路径
   * @returns 文件的验证问题
   */
  getViolationsByFile(filePath: string): SchemaViolation[];

  /**
   * 获取特定规则类型的验证问题
   * @param ruleType 规则类型
   * @returns 规则类型的验证问题
   */
  getViolationsByRuleType(ruleType: SchemaRuleType): SchemaViolation[];

  /**
   * 获取特定严重级别的验证问题
   * @param severity 严重级别
   * @returns 严重级别的验证问题
   */
  getViolationsBySeverity(severity: SchemaViolationSeverity): SchemaViolation[];

  /**
   * 导出报告为JSON
   * @returns JSON格式的报告
   */
  toJSON(): string;

  /**
   * 导出报告为Markdown
   * @returns Markdown格式的报告
   */
  toMarkdown(): string;

  /**
   * 导出报告为HTML
   * @returns HTML格式的报告
   */
  toHTML(): string;
}

/**
 * Schema验证器配置
 */
export interface SchemaValidatorConfig {
  /**
   * 要验证的文件模式
   */
  includePatterns?: string[];

  /**
   * 要排除的文件模式
   */
  excludePatterns?: string[];

  /**
   * 要使用的规则ID列表
   */
  ruleIds?: string[];

  /**
   * 要忽略的规则ID列表
   */
  ignoreRuleIds?: string[];

  /**
   * 最小严重级别
   */
  minSeverity?: SchemaViolationSeverity;

  /**
   * 是否修复问题
   */
  fix?: boolean;

  /**
   * 是否显示进度
   */
  showProgress?: boolean;

  /**
   * 是否输出详细信息
   */
  verbose?: boolean;
}

// 前向声明SchemaValidationReport类型
export type SchemaValidationReport = ISchemaValidationReport;

/**
 * Schema验证器接口
 */
export interface ISchemaValidator {
  /**
   * 注册验证规则
   * @param rule 验证规则
   * @returns 是否成功
   */
  registerRule(rule: ISchemaRule): boolean;

  /**
   * 获取所有验证规则
   * @returns 所有验证规则
   */
  getAllRules(): ISchemaRule[];

  /**
   * 获取特定类型的验证规则
   * @param type 规则类型
   * @returns 特定类型的验证规则
   */
  getRulesByType(type: SchemaRuleType): ISchemaRule[];

  /**
   * 验证单个文件
   * @param filePath 文件路径
   * @returns 验证问题列表
   */
  validateFile(filePath: string): Promise<SchemaViolation[]>;

  /**
   * 验证多个文件
   * @param filePaths 文件路径列表
   * @returns 验证报告
   */
  validateFiles(filePaths: string[]): Promise<SchemaValidationReport>;

  /**
   * 验证目录
   * @param dirPath 目录路径
   * @param recursive 是否递归
   * @returns 验证报告
   */
  validateDirectory(dirPath: string, recursive?: boolean): Promise<SchemaValidationReport>;

  /**
   * 验证项目
   * @param projectRoot 项目根目录
   * @returns 验证报告
   */
  validateProject(projectRoot: string): Promise<SchemaValidationReport>;

  /**
   * 修复验证问题
   * @param violations 验证问题列表
   * @returns 修复的问题数
   */
  fixViolations(violations: SchemaViolation[]): Promise<number>;
}

/**
 * Schema规则工厂接口
 */
export interface ISchemaRuleFactory {
  /**
   * 创建命名规则
   * @param id 规则ID
   * @param pattern 命名模式
   * @param description 规则描述
   * @param severity 严重级别
   * @returns 命名规则
   */
  createNamingRule(
    id: string,
    pattern: RegExp,
    description: string,
    severity: SchemaViolationSeverity
  ): ISchemaRule;

  /**
   * 创建接口实现规则
   * @param id 规则ID
   * @param interfaceName 接口名称
   * @param description 规则描述
   * @param severity 严重级别
   * @returns 接口实现规则
   */
  createInterfaceRule(
    id: string,
    interfaceName: string,
    description: string,
    severity: SchemaViolationSeverity
  ): ISchemaRule;

  /**
   * 创建文件组织规则
   * @param id 规则ID
   * @param pattern 文件组织模式
   * @param description 规则描述
   * @param severity 严重级别
   * @returns 文件组织规则
   */
  createStructureRule(
    id: string,
    pattern: RegExp,
    description: string,
    severity: SchemaViolationSeverity
  ): ISchemaRule;

  /**
   * 创建文档规则
   * @param id 规则ID
   * @param pattern 文档模式
   * @param description 规则描述
   * @param severity 严重级别
   * @returns 文档规则
   */
  createDocumentationRule(
    id: string,
    pattern: RegExp,
    description: string,
    severity: SchemaViolationSeverity
  ): ISchemaRule;

  /**
   * 创建依赖规则
   * @param id 规则ID
   * @param allowedDependencies 允许的依赖
   * @param description 规则描述
   * @param severity 严重级别
   * @returns 依赖规则
   */
  createDependencyRule(
    id: string,
    allowedDependencies: string[],
    description: string,
    severity: SchemaViolationSeverity
  ): ISchemaRule;

  /**
   * 创建厂商中立规则
   * @param id 规则ID
   * @param vendorPatterns 厂商特定模式
   * @param description 规则描述
   * @param severity 严重级别
   * @returns 厂商中立规则
   */
  createVendorNeutralRule(
    id: string,
    vendorPatterns: RegExp[],
    description: string,
    severity: SchemaViolationSeverity
  ): ISchemaRule;

  /**
   * 创建常用的命名规则集合
   * @returns 命名规则集合
   */
  createCommonNamingRules(): ISchemaRule[];

  /**
   * 创建常用的厂商中立规则集合
   * @returns 厂商中立规则集合
   */
  createCommonVendorNeutralRules(): ISchemaRule[];
}

/**
 * Schema验证器工厂接口
 */
export interface ISchemaValidatorFactory {
  /**
   * 创建Schema验证器
   * @param config 验证器配置
   * @returns Schema验证器
   */
  createValidator(config?: SchemaValidatorConfig): ISchemaValidator;

  /**
   * 创建规则工厂
   * @returns 规则工厂
   */
  createRuleFactory(): ISchemaRuleFactory;

  /**
   * 创建默认验证器
   * @returns 默认验证器
   */
  createDefaultValidator(): ISchemaValidator;
} 