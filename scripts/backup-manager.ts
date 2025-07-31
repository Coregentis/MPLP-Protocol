/**
 * MPLP 开发版本备份管理器
 * 自动化备份策略和执行
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import { execSync } from 'child_process';
import { Logger } from '../src/public/utils/logger';

export enum BackupTrigger {
  VERSION_RELEASE = 'version_release',
  MAJOR_REFACTOR = 'major_refactor',
  PRODUCTION_DEPLOY = 'production_deploy',
  PUBLIC_RELEASE = 'public_release',
  SCHEMA_MIGRATION = 'schema_migration',
  FEATURE_MERGE = 'feature_merge',
  DEPENDENCY_UPDATE = 'dependency_update',
  CONFIG_CHANGE = 'config_change',
  TEST_ARCHITECTURE = 'test_architecture',
  DAILY_SCHEDULED = 'daily_scheduled',
  WEEKLY_SCHEDULED = 'weekly_scheduled',
  MONTHLY_ARCHIVE = 'monthly_archive',
  MANUAL = 'manual'
}

export enum BackupPriority {
  IMMEDIATE = 'immediate',
  DELAYED = 'delayed',
  SCHEDULED = 'scheduled'
}

interface BackupConfig {
  trigger: BackupTrigger;
  priority: BackupPriority;
  description: string;
  retentionDays: number;
  includeNodeModules: boolean;
  includeBuildArtifacts: boolean;
  compressionLevel: number;
}

interface BackupMetadata {
  id: string;
  timestamp: string;
  trigger: BackupTrigger;
  gitCommit: string;
  gitBranch: string;
  version: string;
  size: number;
  description: string;
  tags: string[];
}

export class BackupManager {
  private logger: Logger;
  private backupDir: string;
  private projectRoot: string;
  private remoteRepo: string;

  constructor() {
    this.logger = new Logger('BackupManager');
    this.projectRoot = process.cwd();
    this.backupDir = path.join(this.projectRoot, '.backups');
    this.remoteRepo = 'https://github.com/Coregentis/MPLP-Protocol-Dev.git';
  }

  /**
   * 执行备份
   */
  async createBackup(
    trigger: BackupTrigger, 
    description?: string,
    tags: string[] = []
  ): Promise<string> {
    const config = this.getBackupConfig(trigger);
    const backupId = this.generateBackupId(trigger);
    
    this.logger.info(`🔄 开始备份: ${backupId}`);
    this.logger.info(`📋 触发原因: ${config.description}`);

    try {
      // 1. 准备备份目录
      await this.prepareBackupDirectory();
      
      // 2. 收集项目信息
      const metadata = await this.collectMetadata(backupId, trigger, description, tags);
      
      // 3. 创建本地备份
      const localBackupPath = await this.createLocalBackup(backupId, config);
      
      // 4. 推送到远程仓库
      await this.pushToRemoteRepo(metadata);
      
      // 5. 保存备份元数据
      await this.saveBackupMetadata(metadata);
      
      // 6. 清理旧备份
      await this.cleanupOldBackups(config.retentionDays);
      
      this.logger.info(`✅ 备份完成: ${backupId}`);
      return backupId;
      
    } catch (error) {
      this.logger.error(`❌ 备份失败: ${error}`);
      throw error;
    }
  }

  /**
   * 获取备份配置
   */
  private getBackupConfig(trigger: BackupTrigger): BackupConfig {
    const configs: Record<BackupTrigger, BackupConfig> = {
      [BackupTrigger.VERSION_RELEASE]: {
        trigger,
        priority: BackupPriority.IMMEDIATE,
        description: '版本发布前备份',
        retentionDays: 365,
        includeNodeModules: false,
        includeBuildArtifacts: true,
        compressionLevel: 9
      },
      [BackupTrigger.MAJOR_REFACTOR]: {
        trigger,
        priority: BackupPriority.IMMEDIATE,
        description: '重大重构前备份',
        retentionDays: 180,
        includeNodeModules: false,
        includeBuildArtifacts: false,
        compressionLevel: 9
      },
      [BackupTrigger.PRODUCTION_DEPLOY]: {
        trigger,
        priority: BackupPriority.IMMEDIATE,
        description: '生产部署前备份',
        retentionDays: 365,
        includeNodeModules: false,
        includeBuildArtifacts: true,
        compressionLevel: 9
      },
      [BackupTrigger.PUBLIC_RELEASE]: {
        trigger,
        priority: BackupPriority.IMMEDIATE,
        description: '开源发布前备份',
        retentionDays: 365,
        includeNodeModules: false,
        includeBuildArtifacts: true,
        compressionLevel: 9
      },
      [BackupTrigger.SCHEMA_MIGRATION]: {
        trigger,
        priority: BackupPriority.IMMEDIATE,
        description: 'Schema迁移前备份',
        retentionDays: 180,
        includeNodeModules: false,
        includeBuildArtifacts: false,
        compressionLevel: 6
      },
      [BackupTrigger.FEATURE_MERGE]: {
        trigger,
        priority: BackupPriority.DELAYED,
        description: '功能分支合并备份',
        retentionDays: 90,
        includeNodeModules: false,
        includeBuildArtifacts: false,
        compressionLevel: 6
      },
      [BackupTrigger.DEPENDENCY_UPDATE]: {
        trigger,
        priority: BackupPriority.DELAYED,
        description: '依赖更新备份',
        retentionDays: 60,
        includeNodeModules: false,
        includeBuildArtifacts: false,
        compressionLevel: 6
      },
      [BackupTrigger.CONFIG_CHANGE]: {
        trigger,
        priority: BackupPriority.DELAYED,
        description: '配置变更备份',
        retentionDays: 60,
        includeNodeModules: false,
        includeBuildArtifacts: false,
        compressionLevel: 6
      },
      [BackupTrigger.TEST_ARCHITECTURE]: {
        trigger,
        priority: BackupPriority.DELAYED,
        description: '测试架构变更备份',
        retentionDays: 90,
        includeNodeModules: false,
        includeBuildArtifacts: false,
        compressionLevel: 6
      },
      [BackupTrigger.DAILY_SCHEDULED]: {
        trigger,
        priority: BackupPriority.SCHEDULED,
        description: '每日定时备份',
        retentionDays: 30,
        includeNodeModules: false,
        includeBuildArtifacts: false,
        compressionLevel: 3
      },
      [BackupTrigger.WEEKLY_SCHEDULED]: {
        trigger,
        priority: BackupPriority.SCHEDULED,
        description: '每周完整备份',
        retentionDays: 90,
        includeNodeModules: false,
        includeBuildArtifacts: true,
        compressionLevel: 6
      },
      [BackupTrigger.MONTHLY_ARCHIVE]: {
        trigger,
        priority: BackupPriority.SCHEDULED,
        description: '每月归档备份',
        retentionDays: 365,
        includeNodeModules: true,
        includeBuildArtifacts: true,
        compressionLevel: 9
      },
      [BackupTrigger.MANUAL]: {
        trigger,
        priority: BackupPriority.IMMEDIATE,
        description: '手动备份',
        retentionDays: 90,
        includeNodeModules: false,
        includeBuildArtifacts: false,
        compressionLevel: 6
      }
    };

    return configs[trigger];
  }

  /**
   * 生成备份ID
   */
  private generateBackupId(trigger: BackupTrigger): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const triggerShort = trigger.replace(/_/g, '-');
    return `backup-${triggerShort}-${timestamp}`;
  }

  /**
   * 收集项目元数据
   */
  private async collectMetadata(
    backupId: string,
    trigger: BackupTrigger,
    description?: string,
    tags: string[] = []
  ): Promise<BackupMetadata> {
    try {
      const gitCommit = execSync('git rev-parse HEAD', { encoding: 'utf-8' }).trim();
      const gitBranch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim();
      const packageJson = await fs.readJson(path.join(this.projectRoot, 'package.json'));
      
      return {
        id: backupId,
        timestamp: new Date().toISOString(),
        trigger,
        gitCommit,
        gitBranch,
        version: packageJson.version,
        size: 0, // 将在备份完成后更新
        description: description || this.getBackupConfig(trigger).description,
        tags: [...tags, gitBranch, `v${packageJson.version}`]
      };
    } catch (error) {
      this.logger.warn('收集元数据时出现警告:', error);
      return {
        id: backupId,
        timestamp: new Date().toISOString(),
        trigger,
        gitCommit: 'unknown',
        gitBranch: 'unknown',
        version: 'unknown',
        size: 0,
        description: description || 'Manual backup',
        tags
      };
    }
  }

  /**
   * 创建本地备份
   */
  private async createLocalBackup(backupId: string, config: BackupConfig): Promise<string> {
    const backupPath = path.join(this.backupDir, `${backupId}.tar.gz`);
    
    // 构建排除列表
    const excludePatterns = [
      '.git',
      '.backups',
      'coverage',
      'dist',
      'release',
      'public-release',
      '.env*',
      '*.log',
      '.DS_Store',
      'Thumbs.db'
    ];

    if (!config.includeNodeModules) {
      excludePatterns.push('node_modules');
    }

    if (!config.includeBuildArtifacts) {
      excludePatterns.push('dist', 'build', '*.tgz');
    }

    // 创建tar命令
    const excludeArgs = excludePatterns.map(pattern => `--exclude='${pattern}'`).join(' ');
    const tarCommand = `tar -czf "${backupPath}" ${excludeArgs} -C "${this.projectRoot}" .`;
    
    this.logger.info('📦 创建本地备份...');
    execSync(tarCommand);
    
    // 获取文件大小
    const stats = await fs.stat(backupPath);
    this.logger.info(`📊 备份大小: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    
    return backupPath;
  }

  /**
   * 推送到远程仓库
   */
  private async pushToRemoteRepo(metadata: BackupMetadata): Promise<void> {
    try {
      this.logger.info('🚀 推送到远程仓库...');
      
      // 检查是否有未提交的更改
      const status = execSync('git status --porcelain', { encoding: 'utf-8' });
      if (status.trim()) {
        this.logger.info('📝 发现未提交的更改，自动提交...');
        execSync('git add .');
        execSync(`git commit -m "Auto backup: ${metadata.description}"`);
      }
      
      // 创建备份标签
      const tagName = `backup/${metadata.id}`;
      execSync(`git tag -a "${tagName}" -m "${metadata.description}"`);
      
      // 推送到远程
      execSync('git push origin HEAD');
      execSync(`git push origin "${tagName}"`);
      
      this.logger.info('✅ 远程推送完成');
    } catch (error) {
      this.logger.warn('⚠️ 远程推送失败，仅保留本地备份:', error);
    }
  }

  /**
   * 保存备份元数据
   */
  private async saveBackupMetadata(metadata: BackupMetadata): Promise<void> {
    const metadataPath = path.join(this.backupDir, 'metadata.json');
    
    let allMetadata: BackupMetadata[] = [];
    if (await fs.pathExists(metadataPath)) {
      allMetadata = await fs.readJson(metadataPath);
    }
    
    allMetadata.push(metadata);
    await fs.writeJson(metadataPath, allMetadata, { spaces: 2 });
  }

  /**
   * 清理旧备份
   */
  private async cleanupOldBackups(retentionDays: number): Promise<void> {
    const metadataPath = path.join(this.backupDir, 'metadata.json');
    if (!await fs.pathExists(metadataPath)) return;
    
    const allMetadata: BackupMetadata[] = await fs.readJson(metadataPath);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
    
    const toDelete = allMetadata.filter(backup => 
      new Date(backup.timestamp) < cutoffDate
    );
    
    for (const backup of toDelete) {
      const backupPath = path.join(this.backupDir, `${backup.id}.tar.gz`);
      if (await fs.pathExists(backupPath)) {
        await fs.remove(backupPath);
        this.logger.info(`🗑️ 删除过期备份: ${backup.id}`);
      }
    }
    
    // 更新元数据
    const remainingMetadata = allMetadata.filter(backup => 
      new Date(backup.timestamp) >= cutoffDate
    );
    await fs.writeJson(metadataPath, remainingMetadata, { spaces: 2 });
  }

  /**
   * 准备备份目录
   */
  private async prepareBackupDirectory(): Promise<void> {
    await fs.ensureDir(this.backupDir);
  }

  /**
   * 列出所有备份
   */
  async listBackups(): Promise<BackupMetadata[]> {
    const metadataPath = path.join(this.backupDir, 'metadata.json');
    if (!await fs.pathExists(metadataPath)) return [];
    
    return await fs.readJson(metadataPath);
  }

  /**
   * 恢复备份
   */
  async restoreBackup(backupId: string, targetDir?: string): Promise<void> {
    const backupPath = path.join(this.backupDir, `${backupId}.tar.gz`);
    if (!await fs.pathExists(backupPath)) {
      throw new Error(`备份文件不存在: ${backupId}`);
    }
    
    const restoreDir = targetDir || path.join(this.projectRoot, `restored-${backupId}`);
    await fs.ensureDir(restoreDir);
    
    this.logger.info(`📥 恢复备份: ${backupId} -> ${restoreDir}`);
    execSync(`tar -xzf "${backupPath}" -C "${restoreDir}"`);
    
    this.logger.info('✅ 备份恢复完成');
  }
}

// 导出便捷函数
export async function createBackup(
  trigger: BackupTrigger,
  description?: string,
  tags?: string[]
): Promise<string> {
  const manager = new BackupManager();
  return await manager.createBackup(trigger, description, tags);
}

export async function listBackups(): Promise<BackupMetadata[]> {
  const manager = new BackupManager();
  return await manager.listBackups();
}

export async function restoreBackup(backupId: string, targetDir?: string): Promise<void> {
  const manager = new BackupManager();
  return await manager.restoreBackup(backupId, targetDir);
}

// CLI支持
if (require.main === module) {
  const [,, command, ...args] = process.argv;
  
  switch (command) {
    case 'create':
      const trigger = args[0] as BackupTrigger || BackupTrigger.MANUAL;
      const description = args[1];
      createBackup(trigger, description).catch(console.error);
      break;
      
    case 'list':
      listBackups().then(backups => {
        console.table(backups.map(b => ({
          ID: b.id,
          Trigger: b.trigger,
          Branch: b.gitBranch,
          Version: b.version,
          Date: new Date(b.timestamp).toLocaleString(),
          Description: b.description
        })));
      }).catch(console.error);
      break;
      
    case 'restore':
      const backupId = args[0];
      const targetDir = args[1];
      if (!backupId) {
        console.error('请指定备份ID');
        process.exit(1);
      }
      restoreBackup(backupId, targetDir).catch(console.error);
      break;
      
    default:
      console.log(`
使用方法:
  npm run backup:create [trigger] [description]
  npm run backup:list
  npm run backup:restore <backup-id> [target-dir]
      `);
  }
}
