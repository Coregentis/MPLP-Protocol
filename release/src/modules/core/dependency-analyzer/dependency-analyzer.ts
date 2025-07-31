/**
 * 依赖分析器
 * 
 * 分析项目中的模块依赖关系
 * 
 * @version 1.0.0
 * @created 2025-09-16
 */

import * as fs from 'fs';
import * as path from 'path';
import { EventBus } from '../event-bus/event-bus';
import { EventType } from '../event-bus/event-types';
import { Logger } from '../../../utils/logger';

export interface DependencyNode {
  id: string;
  name: string;
  type: 'module' | 'file' | 'function' | 'class';
  path: string;
  size?: number;
  dependencies: string[];
}

export interface DependencyRelation {
  from: string;
  to: string;
  type: 'import' | 'require' | 'dynamic' | 'type';
  weight: number;
}

export interface DependencyGraph {
  nodes: DependencyNode[];
  relations: DependencyRelation[];
  metadata: {
    generatedAt: string;
    nodeCount: number;
    relationCount: number;
    rootDir: string;
  };
}

export interface DependencyAnalyzerOptions {
  rootDir: string;
  outputDir: string;
  excludePatterns: RegExp[];
}

/**
 * 依赖分析器类
 */
export class DependencyAnalyzer {
  private logger: Logger;
  private eventBus: EventBus;
  private options: DependencyAnalyzerOptions;

  constructor(eventBus: EventBus, options: DependencyAnalyzerOptions) {
    this.logger = new Logger('DependencyAnalyzer');
    this.eventBus = eventBus;
    this.options = options;
  }

  /**
   * 分析依赖关系
   */
  async analyzeDependencies(): Promise<DependencyGraph> {
    const analysisId = `analysis_${Date.now()}`;
    
    this.eventBus.publish(EventType.DEPENDENCY_ANALYSIS_STARTED, {
      analysisId,
      rootDir: this.options.rootDir,
      timestamp: new Date().toISOString()
    });

    try {
      const startTime = Date.now();
      
      // 扫描文件
      const files = this.scanFiles(this.options.rootDir);
      
      // 分析依赖
      const nodes: DependencyNode[] = [];
      const relations: DependencyRelation[] = [];
      
      for (const file of files) {
        const node = await this.analyzeFile(file);
        if (node) {
          nodes.push(node);
          
          // 分析文件中的依赖关系
          const fileRelations = await this.extractDependencies(file, node.id);
          relations.push(...fileRelations);
        }
      }

      const graph: DependencyGraph = {
        nodes,
        relations,
        metadata: {
          generatedAt: new Date().toISOString(),
          nodeCount: nodes.length,
          relationCount: relations.length,
          rootDir: this.options.rootDir
        }
      };

      const duration = Date.now() - startTime;
      
      this.eventBus.publish(EventType.DEPENDENCY_ANALYSIS_COMPLETED, {
        analysisId,
        nodeCount: nodes.length,
        relationCount: relations.length,
        duration,
        timestamp: new Date().toISOString()
      });

      return graph;
    } catch (error) {
      this.eventBus.publish(EventType.DEPENDENCY_ANALYSIS_FAILED, {
        analysisId,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  /**
   * 扫描文件
   */
  private scanFiles(dir: string): string[] {
    const files: string[] = [];
    
    const scan = (currentDir: string) => {
      const items = fs.readdirSync(currentDir);
      
      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          // 检查是否应该排除此目录
          if (!this.shouldExclude(fullPath)) {
            scan(fullPath);
          }
        } else if (stat.isFile() && this.isAnalyzableFile(fullPath)) {
          files.push(fullPath);
        }
      }
    };
    
    scan(dir);
    return files;
  }

  /**
   * 分析单个文件
   */
  private async analyzeFile(filePath: string): Promise<DependencyNode | null> {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const stat = fs.statSync(filePath);
      
      const relativePath = path.relative(this.options.rootDir, filePath);
      const nodeId = this.generateNodeId(relativePath);
      
      return {
        id: nodeId,
        name: path.basename(filePath),
        type: this.getFileType(filePath),
        path: relativePath,
        size: stat.size,
        dependencies: []
      };
    } catch (error) {
      this.logger.warn('分析文件失败', {
        filePath,
        error: error instanceof Error ? error.message : String(error)
      });
      return null;
    }
  }

  /**
   * 提取依赖关系
   */
  private async extractDependencies(filePath: string, nodeId: string): Promise<DependencyRelation[]> {
    const relations: DependencyRelation[] = [];
    
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      
      // 匹配 import 语句
      const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
      let match;
      
      while ((match = importRegex.exec(content)) !== null) {
        const importPath = match[1];
        const targetId = this.resolveImportPath(importPath, filePath);
        
        if (targetId) {
          relations.push({
            from: nodeId,
            to: targetId,
            type: 'import',
            weight: 1
          });
        }
      }
      
      // 匹配 require 语句
      const requireRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
      
      while ((match = requireRegex.exec(content)) !== null) {
        const requirePath = match[1];
        const targetId = this.resolveImportPath(requirePath, filePath);
        
        if (targetId) {
          relations.push({
            from: nodeId,
            to: targetId,
            type: 'require',
            weight: 1
          });
        }
      }
    } catch (error) {
      this.logger.warn('提取依赖关系失败', {
        filePath,
        error: error instanceof Error ? error.message : String(error)
      });
    }
    
    return relations;
  }

  /**
   * 解析导入路径
   */
  private resolveImportPath(importPath: string, fromFile: string): string | null {
    // 跳过 node_modules 依赖
    if (!importPath.startsWith('.')) {
      return null;
    }
    
    const fromDir = path.dirname(fromFile);
    const resolvedPath = path.resolve(fromDir, importPath);
    const relativePath = path.relative(this.options.rootDir, resolvedPath);
    
    return this.generateNodeId(relativePath);
  }

  /**
   * 生成节点ID
   */
  private generateNodeId(relativePath: string): string {
    return relativePath.replace(/[\\\/]/g, '_').replace(/\.[^.]+$/, '');
  }

  /**
   * 获取文件类型
   */
  private getFileType(filePath: string): 'module' | 'file' {
    const ext = path.extname(filePath);
    return ['.ts', '.js', '.tsx', '.jsx'].includes(ext) ? 'module' : 'file';
  }

  /**
   * 检查是否应该排除文件
   */
  private shouldExclude(filePath: string): boolean {
    return this.options.excludePatterns.some(pattern => pattern.test(filePath));
  }

  /**
   * 检查是否为可分析的文件
   */
  private isAnalyzableFile(filePath: string): boolean {
    const ext = path.extname(filePath);
    return ['.ts', '.js', '.tsx', '.jsx'].includes(ext) && !this.shouldExclude(filePath);
  }
}
