/**
 * MPLP Schema版本管理器
 * 
 * 提供Schema版本冻结、锁定检查、版本一致性验证功能
 * 确保开发期间Schema版本稳定性
 * 
 * @version v1.0.1
 * @created 2025-07-10T15:30:00+08:00
 * @compliance 严格遵循Schema驱动开发规则
 */

import * as fs from 'fs';
import * as path from 'path';
import { logger } from '../utils/logger';

/**
 * 版本状态枚举
 */
export enum VersionStatus {
  FROZEN = 'FROZEN',      // 冻结状态 - 禁止修改
  LOCKED = 'LOCKED',      // 锁定状态 - 需要审批
  ACTIVE = 'ACTIVE',      // 活跃状态 - 可以修改
  DEPRECATED = 'DEPRECATED' // 废弃状态
}

/**
 * Schema版本信息接口
 */
export interface SchemaVersionInfo {
  module: string;
  version: string;
  protocolVersion: string;
  status: VersionStatus;
  lastModified: string;
  hash: string;
  lockTimestamp?: string;
  lockReason?: string;
}

/**
 * 版本锁定配置
 */
export interface VersionLockConfig {
  enforceFreeze: boolean;
  allowedModifiers: string[];
  requireApproval: boolean;
  autoBackup: boolean;
  validateOnStartup: boolean;
}

/**
 * Schema版本管理器
 */
export class SchemaVersionManager {
  private readonly schemasDir: string;
  private readonly lockFile: string;
  private readonly configFile: string;
  private versionMap: Map<string, SchemaVersionInfo> = new Map();
  private config!: VersionLockConfig;

  // 🔒 冻结的基线版本 - 开发期间不允许变更
  private static readonly FROZEN_BASELINE = {
    protocolVersion: '1.0.1',
    schemaModules: [
      'context-protocol',
      'plan-protocol', 
      'confirm-protocol',
      'trace-protocol',
      'role-protocol',
      'extension-protocol'
    ]
  };

  constructor() {
    this.schemasDir = path.join(__dirname, '../../schemas');
    this.lockFile = path.join(__dirname, '../config/schema-versions.lock');
    this.configFile = path.join(__dirname, '../config/schema-version-config.json');
    
    this.loadConfiguration();
    this.initializeVersionBaseline();
  }

  /**
   * 加载版本管理配置
   */
  private loadConfiguration(): void {
    try {
      if (fs.existsSync(this.configFile)) {
        const content = fs.readFileSync(this.configFile, 'utf8');
        this.config = JSON.parse(content);
      } else {
        // 默认严格配置
        this.config = {
          enforceFreeze: true,
          allowedModifiers: ['build-system', 'schema-validator'],
          requireApproval: true,
          autoBackup: true,
          validateOnStartup: true
        };
        this.saveConfiguration();
      }
      
      logger.info('Schema版本管理配置已加载', { config: this.config });
    } catch (error) {
      logger.error('加载版本管理配置失败', { error });
      throw new Error(`Failed to load schema version configuration: ${error}`);
    }
  }

  /**
   * 保存版本管理配置
   */
  private saveConfiguration(): void {
    try {
      const configDir = path.dirname(this.configFile);
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }
      
      fs.writeFileSync(this.configFile, JSON.stringify(this.config, null, 2));
    } catch (error) {
      logger.error('保存版本管理配置失败', { error });
    }
  }

  /**
   * 初始化版本基线
   */
  private initializeVersionBaseline(): void {
    try {
      // 如果锁定文件存在，加载现有版本信息
      if (fs.existsSync(this.lockFile)) {
        this.loadVersionLock();
      } else {
        // 首次初始化，扫描所有Schema文件
        this.scanSchemaFiles();
        this.saveVersionLock();
      }
      
      // 启动时验证
      if (this.config.validateOnStartup) {
        this.validateVersionConsistency();
      }
      
      logger.info('Schema版本基线已初始化', {
        modules: Array.from(this.versionMap.keys()),
        frozenVersion: SchemaVersionManager.FROZEN_BASELINE.protocolVersion
      });
    } catch (error) {
      logger.error('初始化版本基线失败', { error });
      throw new Error(`Failed to initialize schema version baseline: ${error}`);
    }
  }

  /**
   * 扫描Schema文件建立版本基线
   */
  private scanSchemaFiles(): void {
    for (const module of SchemaVersionManager.FROZEN_BASELINE.schemaModules) {
      const filePath = path.join(this.schemasDir, `${module}.json`);
      
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        const schema = JSON.parse(content);
        const stat = fs.statSync(filePath);
        
        const versionInfo: SchemaVersionInfo = {
          module,
          version: schema.version || '1.0.1',
          protocolVersion: schema.properties?.protocol_version?.const || '1.0.1',
          status: VersionStatus.FROZEN, // 默认冻结状态
          lastModified: stat.mtime.toISOString(),
          hash: this.calculateFileHash(content),
          lockTimestamp: new Date().toISOString(),
          lockReason: 'Development baseline freeze'
        };
        
        this.versionMap.set(module, versionInfo);
      }
    }
  }

  /**
   * 计算文件哈希值
   */
  private calculateFileHash(content: string): string {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  /**
   * 加载版本锁定文件
   */
  private loadVersionLock(): void {
    try {
      const content = fs.readFileSync(this.lockFile, 'utf8');
      const lockData = JSON.parse(content);
      
      for (const [module, info] of Object.entries(lockData.versions)) {
        this.versionMap.set(module, info as SchemaVersionInfo);
      }
      
      logger.info('版本锁定文件已加载', { modules: Object.keys(lockData.versions) });
    } catch (error) {
      logger.error('加载版本锁定文件失败', { error });
    }
  }

  /**
   * 保存版本锁定文件
   */
  private saveVersionLock(): void {
    try {
      const lockDir = path.dirname(this.lockFile);
      if (!fs.existsSync(lockDir)) {
        fs.mkdirSync(lockDir, { recursive: true });
      }
      
      const lockData = {
        timestamp: new Date().toISOString(),
        frozenBaseline: SchemaVersionManager.FROZEN_BASELINE,
        versions: Object.fromEntries(this.versionMap),
        signature: this.generateLockSignature()
      };
      
      fs.writeFileSync(this.lockFile, JSON.stringify(lockData, null, 2));
      logger.info('版本锁定文件已保存', { lockFile: this.lockFile });
    } catch (error) {
      logger.error('保存版本锁定文件失败', { error });
    }
  }

  /**
   * 生成锁定文件签名
   */
  private generateLockSignature(): string {
    const crypto = require('crypto');
    const data = Array.from(this.versionMap.entries())
      .map(([module, info]) => `${module}:${info.version}:${info.hash}`)
      .join('|');
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * 验证Schema版本一致性
   */
  public validateVersionConsistency(): {
    valid: boolean;
    violations: string[];
    recommendations: string[];
  } {
    const violations: string[] = [];
    const recommendations: string[] = [];
    
    try {
      // 1. 验证协议版本一致性
      const protocolVersions = new Set();
      for (const info of this.versionMap.values()) {
        protocolVersions.add(info.protocolVersion);
      }
      
      if (protocolVersions.size > 1) {
        violations.push(`协议版本不一致: ${Array.from(protocolVersions).join(', ')}`);
        recommendations.push(`统一协议版本为: ${SchemaVersionManager.FROZEN_BASELINE.protocolVersion}`);
      }
      
      // 2. 验证冻结状态
      for (const [module, info] of this.versionMap) {
        if (this.config.enforceFreeze && info.status !== VersionStatus.FROZEN) {
          violations.push(`模块 ${module} 未处于冻结状态: ${info.status}`);
          recommendations.push(`冻结模块 ${module} 以防止开发期间变更`);
        }
      }
      
      // 3. 验证文件完整性
      for (const module of SchemaVersionManager.FROZEN_BASELINE.schemaModules) {
        if (!this.versionMap.has(module)) {
          violations.push(`缺失Schema模块: ${module}`);
          recommendations.push(`添加缺失的Schema文件: ${module}.json`);
        }
      }
      
      const result = {
        valid: violations.length === 0,
        violations,
        recommendations
      };
      
      if (result.valid) {
        logger.info('Schema版本一致性验证通过');
      } else {
        logger.warn('Schema版本一致性验证失败', result);
      }
      
      return result;
    } catch (error) {
      logger.error('版本一致性验证错误', { error });
      return {
        valid: false,
        violations: [`验证过程出错: ${error}`],
        recommendations: ['修复验证工具错误']
      };
    }
  }

  /**
   * 冻结所有Schema版本
   */
  public freezeAllSchemas(reason: string = 'Development phase freeze'): void {
    try {
      let freezeCount = 0;
      
      for (const [module, info] of this.versionMap) {
        if (info.status !== VersionStatus.FROZEN) {
          info.status = VersionStatus.FROZEN;
          info.lockTimestamp = new Date().toISOString();
          info.lockReason = reason;
          freezeCount++;
        }
      }
      
      this.saveVersionLock();
      
      logger.info(`已冻结 ${freezeCount} 个Schema模块`, {
        reason,
        modules: Array.from(this.versionMap.keys())
      });
    } catch (error) {
      logger.error('冻结Schema版本失败', { error });
      throw new Error(`Failed to freeze schema versions: ${error}`);
    }
  }

  /**
   * 检查Schema文件是否被修改
   */
  public detectSchemaChanges(): {
    changed: boolean;
    changedFiles: Array<{
      module: string;
      expectedHash: string;
      actualHash: string;
      status: string;
    }>;
  } {
    const changedFiles: Array<{
      module: string;
      expectedHash: string;
      actualHash: string;
      status: string;
    }> = [];
    
    try {
      for (const [module, info] of this.versionMap) {
        const filePath = path.join(this.schemasDir, `${module}.json`);
        
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf8');
          const actualHash = this.calculateFileHash(content);
          
          if (actualHash !== info.hash) {
            changedFiles.push({
              module,
              expectedHash: info.hash,
              actualHash,
              status: info.status
            });
          }
        }
      }
      
      if (changedFiles.length > 0) {
        logger.warn('检测到Schema文件变更', { changedFiles });
      }
      
      return {
        changed: changedFiles.length > 0,
        changedFiles
      };
    } catch (error) {
      logger.error('检测Schema变更失败', { error });
      return { changed: false, changedFiles: [] };
    }
  }

  /**
   * 获取版本信息
   */
  public getVersionInfo(module?: string): SchemaVersionInfo | Map<string, SchemaVersionInfo> {
    if (module) {
      const info = this.versionMap.get(module);
      if (!info) {
        throw new Error(`Schema module not found: ${module}`);
      }
      return info;
    }
    return new Map(this.versionMap);
  }

  /**
   * 获取冻结基线信息
   */
  public static getFrozenBaseline() {
    return SchemaVersionManager.FROZEN_BASELINE;
  }

  /**
   * 验证开发环境Schema完整性
   */
  public validateDevelopmentEnvironment(): {
    valid: boolean;
    message: string;
    details: any;
  } {
    try {
      // 1. 版本一致性检查
      const consistency = this.validateVersionConsistency();
      
      // 2. 文件变更检查
      const changes = this.detectSchemaChanges();
      
      // 3. 冻结状态检查
      const frozenCount = Array.from(this.versionMap.values())
        .filter(info => info.status === VersionStatus.FROZEN).length;
      
      const result = {
        valid: consistency.valid && !changes.changed && frozenCount === this.versionMap.size,
        message: '',
        details: {
          consistency,
          changes,
          frozenModules: frozenCount,
          totalModules: this.versionMap.size,
          baseline: SchemaVersionManager.FROZEN_BASELINE
        }
      };
      
      if (result.valid) {
        result.message = '✅ Schema环境验证通过 - 所有模块已冻结，版本一致，无变更';
      } else {
        result.message = '❌ Schema环境验证失败 - 存在版本冲突或未授权变更';
      }
      
      return result;
         } catch (error) {
       return {
         valid: false,
         message: `❌ Schema环境验证错误: ${error instanceof Error ? error.message : String(error)}`,
         details: { error: error instanceof Error ? error.message : String(error) }
       };
     }
  }
}

// 导出单例实例
export const schemaVersionManager = new SchemaVersionManager(); 