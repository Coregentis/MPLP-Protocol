/**
 * 备份钩子系统
 * 在特定操作前自动触发备份
 */

import { execSync } from 'child_process';
import { createBackup, BackupTrigger } from './backup-manager';
import { Logger } from '../src/public/utils/logger';

export class BackupHooks {
  private logger: Logger;

  constructor() {
    this.logger = new Logger('BackupHooks');
  }

  /**
   * 版本发布前钩子
   */
  async preVersionHook(newVersion: string): Promise<void> {
    this.logger.info(`🔖 版本发布前备份: ${newVersion}`);
    await createBackup(
      BackupTrigger.VERSION_RELEASE,
      `Version release backup before v${newVersion}`,
      ['pre-release', `v${newVersion}`]
    );
  }

  /**
   * 重构前钩子
   */
  async preRefactorHook(refactorType: string): Promise<void> {
    this.logger.info(`🔧 重构前备份: ${refactorType}`);
    await createBackup(
      BackupTrigger.MAJOR_REFACTOR,
      `Pre-refactor backup: ${refactorType}`,
      ['pre-refactor', refactorType]
    );
  }

  /**
   * 生产部署前钩子
   */
  async preDeployHook(environment: string): Promise<void> {
    this.logger.info(`🚀 部署前备份: ${environment}`);
    await createBackup(
      BackupTrigger.PRODUCTION_DEPLOY,
      `Pre-deployment backup to ${environment}`,
      ['pre-deploy', environment]
    );
  }

  /**
   * 开源发布前钩子
   */
  async prePublicReleaseHook(version: string): Promise<void> {
    this.logger.info(`📦 开源发布前备份: ${version}`);
    await createBackup(
      BackupTrigger.PUBLIC_RELEASE,
      `Pre-public-release backup for v${version}`,
      ['pre-public-release', `v${version}`]
    );
  }

  /**
   * Schema迁移前钩子
   */
  async preSchemaMigrationHook(migrationName: string): Promise<void> {
    this.logger.info(`🗄️ Schema迁移前备份: ${migrationName}`);
    await createBackup(
      BackupTrigger.SCHEMA_MIGRATION,
      `Pre-schema-migration backup: ${migrationName}`,
      ['pre-migration', migrationName]
    );
  }

  /**
   * 功能分支合并后钩子
   */
  async postFeatureMergeHook(branchName: string, prNumber?: string): Promise<void> {
    this.logger.info(`🔀 功能合并后备份: ${branchName}`);
    const tags = ['post-merge', branchName];
    if (prNumber) tags.push(`pr-${prNumber}`);
    
    await createBackup(
      BackupTrigger.FEATURE_MERGE,
      `Post-merge backup: ${branchName}`,
      tags
    );
  }

  /**
   * 依赖更新后钩子
   */
  async postDependencyUpdateHook(dependencies: string[]): Promise<void> {
    this.logger.info(`📦 依赖更新后备份: ${dependencies.join(', ')}`);
    await createBackup(
      BackupTrigger.DEPENDENCY_UPDATE,
      `Post-dependency-update backup: ${dependencies.join(', ')}`,
      ['post-dependency-update', ...dependencies]
    );
  }

  /**
   * 配置变更后钩子
   */
  async postConfigChangeHook(configFiles: string[]): Promise<void> {
    this.logger.info(`⚙️ 配置变更后备份: ${configFiles.join(', ')}`);
    await createBackup(
      BackupTrigger.CONFIG_CHANGE,
      `Post-config-change backup: ${configFiles.join(', ')}`,
      ['post-config-change', ...configFiles]
    );
  }

  /**
   * 检查是否需要备份
   */
  async checkAndBackupIfNeeded(): Promise<void> {
    try {
      // 检查是否有重要文件变更
      const status = execSync('git status --porcelain', { encoding: 'utf-8' });
      if (!status.trim()) return;

      const changedFiles = status.split('\n').map(line => line.slice(3));
      
      // 检查是否有关键文件变更
      const criticalFiles = [
        'package.json',
        'package-lock.json',
        'tsconfig.json',
        'jest.config.js',
        '.github/workflows/',
        'src/schemas/',
        'scripts/'
      ];

      const hasCriticalChanges = changedFiles.some(file =>
        criticalFiles.some(critical => file.includes(critical))
      );

      if (hasCriticalChanges) {
        this.logger.info('🔍 检测到关键文件变更，创建备份...');
        await createBackup(
          BackupTrigger.CONFIG_CHANGE,
          `Auto backup due to critical file changes: ${changedFiles.slice(0, 3).join(', ')}`,
          ['auto-backup', 'critical-changes']
        );
      }
    } catch (error) {
      this.logger.warn('检查备份需求时出错:', error);
    }
  }
}

// 导出钩子实例
export const backupHooks = new BackupHooks();

// 便捷函数
export async function preVersionBackup(version: string): Promise<void> {
  await backupHooks.preVersionHook(version);
}

export async function preRefactorBackup(refactorType: string): Promise<void> {
  await backupHooks.preRefactorHook(refactorType);
}

export async function preDeployBackup(environment: string = 'production'): Promise<void> {
  await backupHooks.preDeployHook(environment);
}

export async function prePublicReleaseBackup(version: string): Promise<void> {
  await backupHooks.prePublicReleaseHook(version);
}

export async function preSchemaMigrationBackup(migrationName: string): Promise<void> {
  await backupHooks.preSchemaMigrationHook(migrationName);
}

export async function postFeatureMergeBackup(branchName: string, prNumber?: string): Promise<void> {
  await backupHooks.postFeatureMergeHook(branchName, prNumber);
}

export async function postDependencyUpdateBackup(dependencies: string[]): Promise<void> {
  await backupHooks.postDependencyUpdateHook(dependencies);
}

export async function postConfigChangeBackup(configFiles: string[]): Promise<void> {
  await backupHooks.postConfigChangeHook(configFiles);
}

export async function autoBackupCheck(): Promise<void> {
  await backupHooks.checkAndBackupIfNeeded();
}
