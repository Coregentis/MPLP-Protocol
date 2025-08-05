/**
 * 发布版本路径修复脚本
 * 修复发布版本中的所有导入路径问题
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import { Logger } from '../src/public/utils/logger';

interface PathMapping {
  from: string;
  to: string;
  description: string;
}

export class ReleasePathFixer {
  private logger: Logger;
  private releaseDir: string;

  constructor(releaseDir: string) {
    this.logger = new Logger('ReleasePathFixer');
    this.releaseDir = releaseDir;
  }

  /**
   * 修复所有路径问题
   */
  async fixAllPaths(): Promise<void> {
    this.logger.info('🔧 开始修复发布版本的路径问题...');

    try {
      // 1. 修复核心模块的导入路径
      await this.fixCoreModulePaths();
      
      // 2. 修复业务模块的导入路径
      await this.fixBusinessModulePaths();
      
      // 3. 修复主入口文件
      await this.fixMainIndexFile();
      
      // 4. 修复Schema文件路径
      await this.fixSchemaFilePaths();
      
      // 5. 创建缺失的文件
      await this.createMissingFiles();
      
      this.logger.info('✅ 路径修复完成！');
      
    } catch (error) {
      this.logger.error('❌ 路径修复失败:', error);
      throw error;
    }
  }

  /**
   * 1. 修复核心模块的导入路径
   */
  private async fixCoreModulePaths(): Promise<void> {
    this.logger.info('🔧 修复核心模块路径...');
    
    const coreFiles = [
      'src/core/orchestrator/core-orchestrator.ts',
      'src/core/orchestrator/performance-enhanced-orchestrator.ts',
      'src/core/workflow/workflow-manager.ts'
    ];
    
    const pathMappings: PathMapping[] = [
      {
        from: '../../../shared/types',
        to: '../../shared/types',
        description: '共享类型路径'
      },
      {
        from: '../../../utils/logger',
        to: '../../utils/logger',
        description: 'Logger路径'
      },
      {
        from: '../types/core.types',
        to: '../types/core.types',
        description: '核心类型路径'
      },
      {
        from: '../../../performance/real-performance-optimizer',
        to: '../performance/real-performance-optimizer',
        description: '性能优化器路径'
      }
    ];
    
    for (const file of coreFiles) {
      await this.fixFileImports(file, pathMappings);
    }
  }

  /**
   * 2. 修复业务模块的导入路径
   */
  private async fixBusinessModulePaths(): Promise<void> {
    this.logger.info('🔧 修复业务模块路径...');
    
    const modules = ['context', 'plan', 'confirm', 'trace', 'role', 'extension'];
    
    for (const module of modules) {
      await this.fixModulePaths(module);
    }
  }

  /**
   * 修复单个模块的路径
   */
  private async fixModulePaths(moduleName: string): Promise<void> {
    const moduleDir = path.join(this.releaseDir, `src/modules/${moduleName}`);
    
    if (!await fs.pathExists(moduleDir)) {
      this.logger.warn(`模块目录不存在: ${moduleName}`);
      return;
    }
    
    // 定义路径映射 - 更全面的路径修复
    const pathMappings: PathMapping[] = [
      // 共享类型路径修复
      {
        from: '../../../../public/shared/types',
        to: '../../../shared/types',
        description: '共享类型路径'
      },
      {
        from: '../../../shared/types/context-types',
        to: '../../../shared/types',
        description: 'Context类型路径统一'
      },
      {
        from: '../../../shared/types/plan-types',
        to: '../../../shared/types',
        description: 'Plan类型路径统一'
      },
      {
        from: '../../../../shared/types/express-extensions',
        to: '../../../shared/types',
        description: 'Express扩展类型路径'
      },

      // Logger路径修复
      {
        from: '../../../../public/utils/logger',
        to: '../../../utils/logger',
        description: 'Logger路径'
      },
      {
        from: '../../public/utils/logger',
        to: '../utils/logger',
        description: 'Logger路径(模块级)'
      },
      {
        from: '../public/utils/logger',
        to: '../utils/logger',
        description: 'Logger路径(Schema级)'
      },

      // 类型索引路径修复
      {
        from: '../../types/index',
        to: '../../../shared/types',
        description: '类型索引路径'
      },
      {
        from: '../../types',
        to: '../../../shared/types',
        description: '类型路径'
      },

      // 配置路径修复
      {
        from: '../../config/module-integration',
        to: '../config/module-integration',
        description: '模块集成配置路径'
      }
    ];
    
    // 递归修复模块中的所有TypeScript文件
    await this.fixDirectoryImports(moduleDir, pathMappings);
  }

  /**
   * 3. 修复主入口文件
   */
  private async fixMainIndexFile(): Promise<void> {
    this.logger.info('🔧 修复主入口文件...');
    
    const indexFile = path.join(this.releaseDir, 'src/index.ts');
    
    if (!await fs.pathExists(indexFile)) {
      // 创建新的主入口文件
      await this.createMainIndexFile();
      return;
    }
    
    const pathMappings: PathMapping[] = [
      {
        from: './core/orchestrator/core-orchestrator',
        to: './core/orchestrator/core-orchestrator',
        description: '核心调度器导出'
      },
      {
        from: './core/workflow/workflow-manager',
        to: './core/workflow/workflow-manager',
        description: '工作流管理器导出'
      }
    ];
    
    await this.fixFileImports(indexFile, pathMappings);
  }

  /**
   * 创建新的主入口文件
   */
  private async createMainIndexFile(): Promise<void> {
    const indexContent = `/**
 * MPLP Protocol v${this.getVersionFromPackageJson()}
 * Multi-Agent Project Lifecycle Protocol - L4 Intelligent Agent Operating System
 */

// Core exports
export { CoreOrchestrator as MPLPOrchestrator } from './core/orchestrator/core-orchestrator';
export { WorkflowManager } from './core/workflow/workflow-manager';

// Module exports - 使用具体导出避免类型冲突
export { ContextController } from './modules/context/api/controllers/context.controller';
export { ContextManagementService } from './modules/context/application/services/context-management.service';
export { Context } from './modules/context/domain/entities/context.entity';

export { PlanController } from './modules/plan/api/controllers/plan.controller';
export { PlanManagementService } from './modules/plan/application/services/plan-management.service';
export { Plan } from './modules/plan/domain/entities/plan.entity';

export { ConfirmController } from './modules/confirm/api/controllers/confirm.controller';
export { ConfirmManagementService } from './modules/confirm/application/services/confirm-management.service';
export { Confirm } from './modules/confirm/domain/entities/confirm.entity';

export { TraceController } from './modules/trace/api/controllers/trace.controller';
export { TraceManagementService } from './modules/trace/application/services/trace-management.service';
export { Trace } from './modules/trace/domain/entities/trace.entity';

export { RoleController } from './modules/role/api/controllers/role.controller';
export { RoleManagementService } from './modules/role/application/services/role-management.service';
export { Role } from './modules/role/domain/entities/role.entity';

export { ExtensionController } from './modules/extension/api/controllers/extension.controller';
export { ExtensionManagementService } from './modules/extension/application/services/extension-management.service';
export { Extension } from './modules/extension/domain/entities/extension.entity';

// 核心类型导出
export type {
  UUID,
  Timestamp,
  EntityStatus,
  ValidationResult,
  OperationResult
} from './shared/types';

// 工具导出
export { Logger } from './utils/logger';

// Version info
export const VERSION = '${this.getVersionFromPackageJson()}';
`;

    const indexPath = path.join(this.releaseDir, 'src/index.ts');
    await fs.writeFile(indexPath, indexContent);
    this.logger.info('✅ 创建了新的主入口文件');
  }

  /**
   * 4. 修复Schema文件路径
   */
  private async fixSchemaFilePaths(): Promise<void> {
    this.logger.info('🔧 修复Schema文件路径...');
    
    const schemaIndexFile = path.join(this.releaseDir, 'src/schemas/index.ts');
    
    if (await fs.pathExists(schemaIndexFile)) {
      const pathMappings: PathMapping[] = [
        {
          from: '../public/utils/logger',
          to: '../utils/logger',
          description: 'Schema Logger路径'
        }
      ];
      
      await this.fixFileImports(schemaIndexFile, pathMappings);
    }
  }

  /**
   * 5. 创建缺失的文件
   */
  private async createMissingFiles(): Promise<void> {
    this.logger.info('🔧 创建缺失的文件...');
    
    // 创建缺失的application和infrastructure层文件
    const modules = ['context', 'plan', 'confirm', 'trace', 'role', 'extension'];
    
    for (const module of modules) {
      await this.createMissingModuleFiles(module);
    }
  }

  /**
   * 创建缺失的模块文件
   */
  private async createMissingModuleFiles(moduleName: string): Promise<void> {
    const moduleDir = path.join(this.releaseDir, `src/modules/${moduleName}`);
    
    // 创建application层的基本文件
    const applicationDir = path.join(moduleDir, 'application');
    if (!await fs.pathExists(applicationDir)) {
      await fs.ensureDir(path.join(applicationDir, 'services'));
      await fs.ensureDir(path.join(applicationDir, 'commands'));
      await fs.ensureDir(path.join(applicationDir, 'queries'));
      
      // 创建基本的服务文件
      const serviceContent = `// ${moduleName} management service placeholder
export class ${this.capitalize(moduleName)}ManagementService {
  // Implementation will be added based on actual requirements
}
`;
      
      await fs.writeFile(
        path.join(applicationDir, 'services', `${moduleName}-management.service.ts`),
        serviceContent
      );
    }
    
    // 创建infrastructure层的基本文件
    const infrastructureDir = path.join(moduleDir, 'infrastructure');
    if (!await fs.pathExists(infrastructureDir)) {
      await fs.ensureDir(path.join(infrastructureDir, 'repositories'));
      
      // 创建基本的仓储文件
      const repositoryContent = `// ${moduleName} repository placeholder
export class ${this.capitalize(moduleName)}Repository {
  // Implementation will be added based on actual requirements
}
`;
      
      await fs.writeFile(
        path.join(infrastructureDir, 'repositories', `${moduleName}.repository.ts`),
        repositoryContent
      );
    }
  }

  /**
   * 修复文件中的导入路径
   */
  private async fixFileImports(filePath: string, pathMappings: PathMapping[]): Promise<void> {
    const fullPath = path.join(this.releaseDir, filePath);
    
    if (!await fs.pathExists(fullPath)) {
      this.logger.warn(`文件不存在: ${filePath}`);
      return;
    }
    
    let content = await fs.readFile(fullPath, 'utf-8');
    let modified = false;
    
    for (const mapping of pathMappings) {
      const regex = new RegExp(this.escapeRegExp(mapping.from), 'g');
      if (regex.test(content)) {
        content = content.replace(regex, mapping.to);
        modified = true;
        this.logger.info(`  ✓ ${filePath}: ${mapping.description}`);
      }
    }
    
    if (modified) {
      await fs.writeFile(fullPath, content);
    }
  }

  /**
   * 递归修复目录中的导入路径
   */
  private async fixDirectoryImports(dirPath: string, pathMappings: PathMapping[]): Promise<void> {
    const files = await fs.readdir(dirPath);
    
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stat = await fs.stat(filePath);
      
      if (stat.isDirectory()) {
        await this.fixDirectoryImports(filePath, pathMappings);
      } else if (file.endsWith('.ts') && !file.endsWith('.d.ts')) {
        const relativePath = path.relative(this.releaseDir, filePath);
        await this.fixFileImports(relativePath, pathMappings);
      }
    }
  }

  /**
   * 工具方法
   */
  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  private getVersionFromPackageJson(): string {
    try {
      const packageJsonPath = path.join(this.releaseDir, 'package.json');
      const packageJson = require(packageJsonPath);
      return packageJson.version || '1.0.0';
    } catch {
      return '1.0.0';
    }
  }
}

// CLI支持
if (require.main === module) {
  const releaseDir = process.argv[2] || path.resolve('releases/v1.0.0');
  
  const fixer = new ReleasePathFixer(releaseDir);
  
  fixer.fixAllPaths()
    .then(() => {
      console.log('✅ 路径修复完成！');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ 路径修复失败:', error);
      process.exit(1);
    });
}
