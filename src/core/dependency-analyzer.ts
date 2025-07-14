/**
 * MPLP依赖关系分析器
 * 
 * 自动分析并构建模块之间的依赖关系图，支持静态分析和动态依赖跟踪。
 * 
 * @version v1.0.0
 * @created 2025-07-15T11:00:00+08:00
 */

import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';
import { DependencyGraph, DependencyNodeType, DependencyRelationType, IDependencyNode, IDependencyRelation } from './dependency-graph';
import { EventBus } from './event-bus';
import { EventType, DependencyGraphGeneratedEventData } from './event-types';

/**
 * 依赖关系分析器接口
 */
export interface IDependencyAnalyzer {
  analyzeModule(moduleName: string, modulePath: string): Promise<void>;
  analyzeAllModules(): Promise<void>;
  getGraph(): DependencyGraph;
  generateGraph(): Promise<void>;
  exportGraphVisualization(outputPath: string): Promise<void>;
}

/**
 * 依赖关系分析器选项
 */
export interface DependencyAnalyzerOptions {
  rootDir: string;           // 项目根目录
  modulesDir?: string;       // 模块目录
  interfacesDir?: string;    // 接口目录
  outputDir?: string;        // 输出目录
  excludePatterns?: RegExp[]; // 排除的文件模式
}

/**
 * 依赖关系分析器实现
 */
export class DependencyAnalyzer implements IDependencyAnalyzer {
  private graph: DependencyGraph;
  private options: DependencyAnalyzerOptions;
  private eventBus: EventBus;
  private moduleToFilesMap: Map<string, string[]>;

  constructor(eventBus: EventBus, options: DependencyAnalyzerOptions) {
    this.graph = new DependencyGraph(eventBus);
    this.options = {
      rootDir: options.rootDir,
      modulesDir: options.modulesDir || path.join(options.rootDir, 'src/modules'),
      interfacesDir: options.interfacesDir || path.join(options.rootDir, 'src/interfaces'),
      outputDir: options.outputDir || path.join(options.rootDir, 'docs/architecture'),
      excludePatterns: options.excludePatterns || [/\.spec\.ts$/, /\.test\.ts$/, /__tests__/]
    };
    this.eventBus = eventBus;
    this.moduleToFilesMap = new Map<string, string[]>();
  }

  /**
   * 分析指定模块的依赖关系
   */
  public async analyzeModule(moduleName: string, modulePath: string): Promise<void> {
    try {
      console.log(`分析模块: ${moduleName}`);
      
      // 确保模块目录存在
      if (!fs.existsSync(modulePath)) {
        throw new Error(`模块目录不存在: ${modulePath}`);
      }
      
      // 创建模块节点
      const moduleNode: IDependencyNode = {
        id: `module:${moduleName}`,
        name: moduleName,
        type: DependencyNodeType.MODULE,
        module: moduleName,
        description: `MPLP ${moduleName} 模块`
      };
      
      this.graph.addNode(moduleNode);
      
      // 扫描模块文件
      const files = this.scanFiles(modulePath);
      this.moduleToFilesMap.set(moduleName, files);
      
      // 分析模块文件依赖
      await this.analyzeModuleFiles(moduleName, files);
      
      // 分析接口实现关系
      await this.analyzeInterfaceImplementations(moduleName);
      
      console.log(`模块 ${moduleName} 分析完成`);
    } catch (error) {
      console.error(`分析模块 ${moduleName} 时出错:`, error);
      throw error;
    }
  }

  /**
   * 分析所有模块的依赖关系
   */
  public async analyzeAllModules(): Promise<void> {
    try {
      console.log('开始分析所有模块...');
      
      // 获取所有模块目录
      const modulesDir = this.options.modulesDir!;
      const moduleDirs = fs.readdirSync(modulesDir)
        .filter(dir => fs.statSync(path.join(modulesDir, dir)).isDirectory());
      
      // 按模块名称排序：优先分析基础模块
      const moduleOrder = ['context', 'plan', 'trace', 'confirm', 'role', 'extension'];
      moduleDirs.sort((a, b) => {
        const aIndex = moduleOrder.indexOf(a);
        const bIndex = moduleOrder.indexOf(b);
        if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        return aIndex - bIndex;
      });
      
      // 分析每个模块
      for (const dir of moduleDirs) {
        const modulePath = path.join(modulesDir, dir);
        await this.analyzeModule(dir, modulePath);
      }
      
      // 分析模块间的依赖关系
      await this.analyzeInterModuleDependencies();
      
      console.log('所有模块分析完成');
    } catch (error) {
      console.error('分析模块时出错:', error);
      throw error;
    }
  }

  /**
   * 获取依赖图
   */
  public getGraph(): DependencyGraph {
    return this.graph;
  }

  /**
   * 生成完整的依赖图
   */
  public async generateGraph(): Promise<void> {
    await this.analyzeAllModules();
    
    // 验证依赖关系
    const isValid = this.graph.validateDependencies();
    if (!isValid) {
      console.warn('依赖图验证失败，可能存在循环依赖');
    }
    
    // 触发依赖图生成事件
    this.eventBus.publish(EventType.DEPENDENCY_GRAPH_GENERATED, {
      timestamp: new Date().toISOString(),
      nodeCount: this.graph.nodes.size,
      relationCount: this.graph.relations.length,
      isValid
    });
  }

  /**
   * 导出依赖图可视化文件
   */
  public async exportGraphVisualization(outputPath?: string): Promise<void> {
    const finalPath = outputPath || path.join(this.options.outputDir!, 'dependency-graph.dot');
    
    // 确保输出目录存在
    const dir = path.dirname(finalPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // 导出为DOT格式
    const dotContent = this.graph.exportToDot();
    fs.writeFileSync(finalPath, dotContent);
    
    console.log(`依赖图导出到: ${finalPath}`);
    
    // 生成依赖图统计报告
    await this.generateDependencyReport();
  }

  /**
   * 扫描指定目录下的所有TypeScript文件
   */
  private scanFiles(dirPath: string): string[] {
    const files: string[] = [];
    
    const scan = (dir: string) => {
      const entries = fs.readdirSync(dir);
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          // 递归扫描子目录
          scan(fullPath);
        } else if (stat.isFile() && 
                  entry.endsWith('.ts') && 
                  !this.isFileExcluded(fullPath)) {
          files.push(fullPath);
        }
      }
    };
    
    scan(dirPath);
    return files;
  }

  /**
   * 判断文件是否应被排除
   */
  private isFileExcluded(filePath: string): boolean {
    const relativePath = path.relative(this.options.rootDir, filePath);
    
    return this.options.excludePatterns!.some(pattern => 
      pattern.test(filePath) || pattern.test(relativePath));
  }

  /**
   * 分析模块文件的依赖关系
   */
  private async analyzeModuleFiles(moduleName: string, files: string[]): Promise<void> {
    for (const file of files) {
      await this.analyzeFile(moduleName, file);
    }
  }

  /**
   * 分析单个文件的依赖关系
   */
  private async analyzeFile(moduleName: string, filePath: string): Promise<void> {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const fileName = path.basename(filePath);
    const sourceFile = ts.createSourceFile(
      fileName,
      fileContent,
      ts.ScriptTarget.Latest,
      true
    );
    
    // 分析文件内的服务和适配器
    this.analyzeServices(moduleName, sourceFile, filePath);
    
    // 分析文件内的接口
    this.analyzeInterfaces(moduleName, sourceFile, filePath);
    
    // 分析导入语句
    this.analyzeImports(moduleName, sourceFile, filePath);
  }

  /**
   * 分析文件中的服务类定义
   */
  private analyzeServices(moduleName: string, sourceFile: ts.SourceFile, filePath: string): void {
    const serviceRegex = /(Manager|Service|Controller|Repository|Factory)/;
    const fileName = path.basename(filePath, '.ts');
    
    if (serviceRegex.test(fileName)) {
      const nodeType = fileName.includes('Adapter') ? 
        DependencyNodeType.ADAPTER : 
        DependencyNodeType.SERVICE;
      
      // 添加服务节点
      const serviceNode: IDependencyNode = {
        id: `service:${moduleName}:${fileName}`,
        name: fileName,
        type: nodeType,
        module: moduleName
      };
      
      try {
        this.graph.addNode(serviceNode);
        
        // 添加模块和服务的关系
        const moduleId = `module:${moduleName}`;
        this.graph.addRelation({
          source: moduleId,
          target: serviceNode.id,
          type: DependencyRelationType.DEPENDS_ON
        });
      } catch (e) {
        // 节点可能已存在，忽略错误
      }
    }
  }

  /**
   * 分析文件中的接口定义
   */
  private analyzeInterfaces(moduleName: string, sourceFile: ts.SourceFile, filePath: string): void {
    // 遍历AST查找接口定义
    const visit = (node: ts.Node) => {
      if (ts.isInterfaceDeclaration(node) && node.name) {
        const interfaceName = node.name.text;
        
        // 添加接口节点
        const interfaceNode: IDependencyNode = {
          id: `interface:${interfaceName}`,
          name: interfaceName,
          type: DependencyNodeType.INTERFACE,
          module: moduleName
        };
        
        try {
          this.graph.addNode(interfaceNode);
          
          // 添加模块和接口的关系
          const moduleId = `module:${moduleName}`;
          this.graph.addRelation({
            source: moduleId,
            target: interfaceNode.id,
            type: DependencyRelationType.IMPLEMENTS
          });
          
          // 检查接口继承
          if (node.heritageClauses) {
            for (const clause of node.heritageClauses) {
              for (const type of clause.types) {
                const baseTypeName = type.expression.getText();
                
                // 添加基础接口节点（如果不存在）
                const baseId = `interface:${baseTypeName}`;
                try {
                  if (!this.graph.nodes.has(baseId)) {
                    this.graph.addNode({
                      id: baseId,
                      name: baseTypeName,
                      type: DependencyNodeType.INTERFACE,
                      module: 'unknown' // 可能在之后更新
                    });
                  }
                  
                  // 添加接口继承关系
                  this.graph.addRelation({
                    source: interfaceNode.id,
                    target: baseId,
                    type: DependencyRelationType.EXTENDS
                  });
                } catch (e) {
                  // 忽略错误
                }
              }
            }
          }
        } catch (e) {
          // 节点可能已存在，忽略错误
        }
      }
      
      ts.forEachChild(node, visit);
    };
    
    visit(sourceFile);
  }

  /**
   * 分析文件中的导入语句
   */
  private analyzeImports(moduleName: string, sourceFile: ts.SourceFile, filePath: string): void {
    // 遍历AST查找导入语句
    const visit = (node: ts.Node) => {
      if (ts.isImportDeclaration(node) && node.moduleSpecifier) {
        const moduleSpecifier = node.moduleSpecifier.getText().replace(/['"]/g, '');
        
        // 检查是否为内部模块导入
        if (moduleSpecifier.startsWith('.') || moduleSpecifier.startsWith('@/')) {
          // 解析导入的模块名
          let importedModule = this.resolveModuleFromImport(moduleSpecifier, filePath);
          if (importedModule && importedModule !== moduleName) {
            try {
              // 添加模块间依赖关系
              const sourceId = `module:${moduleName}`;
              const targetId = `module:${importedModule}`;
              
              if (this.graph.nodes.has(targetId)) {
                this.graph.addRelation({
                  source: sourceId,
                  target: targetId,
                  type: DependencyRelationType.USES
                });
              }
            } catch (e) {
              // 忽略错误
            }
          }
        }
      }
      
      ts.forEachChild(node, visit);
    };
    
    visit(sourceFile);
  }

  /**
   * 从导入路径解析模块名称
   */
  private resolveModuleFromImport(importPath: string, currentFile: string): string | null {
    // 处理相对路径导入
    if (importPath.startsWith('.')) {
      const currentDir = path.dirname(currentFile);
      const absolutePath = path.resolve(currentDir, importPath);
      
      // 检查导入是否是某个模块的文件
      const modulesDir = this.options.modulesDir!;
      const relativePath = path.relative(modulesDir, absolutePath);
      const moduleName = relativePath.split(path.sep)[0];
      
      if (moduleName && !relativePath.startsWith('..')) {
        return moduleName;
      }
    }
    // 处理@/modules/xxx形式的导入
    else if (importPath.startsWith('@/modules/')) {
      const parts = importPath.split('/');
      if (parts.length > 2) {
        return parts[2];
      }
    }
    
    return null;
  }

  /**
   * 分析接口实现关系
   */
  private async analyzeInterfaceImplementations(moduleName: string): Promise<void> {
    const files = this.moduleToFilesMap.get(moduleName) || [];
    
    for (const file of files) {
      const fileContent = fs.readFileSync(file, 'utf-8');
      const fileName = path.basename(file);
      const sourceFile = ts.createSourceFile(
        fileName,
        fileContent,
        ts.ScriptTarget.Latest,
        true
      );
      
      // 查找类实现接口的关系
      this.findInterfaceImplementations(moduleName, sourceFile);
    }
  }

  /**
   * 查找类对接口的实现关系
   */
  private findInterfaceImplementations(moduleName: string, sourceFile: ts.SourceFile): void {
    // 遍历AST查找类定义
    const visit = (node: ts.Node) => {
      if (ts.isClassDeclaration(node) && node.name) {
        const className = node.name.text;
        const serviceId = `service:${moduleName}:${className}`;
        
        // 检查类是否实现了接口
        if (node.heritageClauses) {
          for (const clause of node.heritageClauses) {
            if (clause.token === ts.SyntaxKind.ImplementsKeyword) {
              for (const type of clause.types) {
                const interfaceName = type.expression.getText();
                const interfaceId = `interface:${interfaceName}`;
                
                try {
                  // 添加服务节点（如果不存在）
                  if (!this.graph.nodes.has(serviceId)) {
                    this.graph.addNode({
                      id: serviceId,
                      name: className,
                      type: DependencyNodeType.SERVICE,
                      module: moduleName
                    });
                  }
                  
                  // 添加接口节点（如果不存在）
                  if (!this.graph.nodes.has(interfaceId)) {
                    this.graph.addNode({
                      id: interfaceId,
                      name: interfaceName,
                      type: DependencyNodeType.INTERFACE,
                      module: 'unknown' // 可能在之后更新
                    });
                  }
                  
                  // 添加实现关系
                  this.graph.addRelation({
                    source: serviceId,
                    target: interfaceId,
                    type: DependencyRelationType.IMPLEMENTS
                  });
                } catch (e) {
                  // 忽略错误
                }
              }
            }
          }
        }
      }
      
      ts.forEachChild(node, visit);
    };
    
    visit(sourceFile);
  }

  /**
   * 分析模块间的依赖关系
   */
  private async analyzeInterModuleDependencies(): Promise<void> {
    // 已在analyzeImports方法中处理
  }

  /**
   * 生成依赖报告
   */
  private async generateDependencyReport(): Promise<void> {
    const reportPath = path.join(this.options.outputDir!, 'dependency-report.md');
    
    // 生成模块依赖关系表
    let report = `# MPLP模块依赖关系报告\n\n`;
    report += `> **生成时间**: ${new Date().toISOString()}\n\n`;
    
    // 模块统计
    report += `## 模块统计\n\n`;
    
    // 计算各类型节点数量
    const nodeCounts = new Map<DependencyNodeType, number>();
    for (const node of this.graph.nodes.values()) {
      const count = nodeCounts.get(node.type) || 0;
      nodeCounts.set(node.type, count + 1);
    }
    
    report += `| 节点类型 | 数量 |\n`;
    report += `|---|---|\n`;
    for (const [type, count] of nodeCounts.entries()) {
      report += `| ${type} | ${count} |\n`;
    }
    
    report += `\n总节点数: ${this.graph.nodes.size}\n`;
    report += `总关系数: ${this.graph.relations.length}\n\n`;
    
    // 模块依赖表
    report += `## 模块依赖表\n\n`;
    report += `| 源模块 | 依赖模块 | 依赖类型 |\n`;
    report += `|---|---|---|\n`;
    
    // 筛选模块间的依赖关系
    const moduleDependencies = this.graph.relations
      .filter(relation => 
        relation.source.startsWith('module:') && 
        relation.target.startsWith('module:'))
      .sort((a, b) => a.source.localeCompare(b.source) || a.target.localeCompare(b.target));
    
    for (const relation of moduleDependencies) {
      const source = relation.source.replace('module:', '');
      const target = relation.target.replace('module:', '');
      report += `| ${source} | ${target} | ${relation.type} |\n`;
    }
    
    // 接口实现表
    report += `\n## 接口实现表\n\n`;
    report += `| 模块 | 服务 | 实现的接口 |\n`;
    report += `|---|---|---|\n`;
    
    // 筛选服务实现接口的关系
    const implementationRelations = this.graph.relations
      .filter(relation => 
        relation.source.startsWith('service:') && 
        relation.target.startsWith('interface:') &&
        relation.type === DependencyRelationType.IMPLEMENTS)
      .sort((a, b) => a.source.localeCompare(b.source));
    
    for (const relation of implementationRelations) {
      const sourceParts = relation.source.replace('service:', '').split(':');
      const module = sourceParts[0];
      const service = sourceParts[1];
      const interfaceName = relation.target.replace('interface:', '');
      report += `| ${module} | ${service} | ${interfaceName} |\n`;
    }
    
    // 循环依赖检查
    const cycles = this.graph.detectCycles();
    
    report += `\n## 循环依赖检查\n\n`;
    
    if (cycles.length === 0) {
      report += `✅ 未检测到循环依赖\n`;
    } else {
      report += `⚠️ 检测到 ${cycles.length} 个循环依赖:\n\n`;
      
      for (let i = 0; i < cycles.length; i++) {
        const cycle = cycles[i];
        report += `### 循环依赖 ${i+1}\n\n`;
        report += cycle.map(nodeId => {
          const node = this.graph.nodes.get(nodeId);
          return node ? `${node.name} (${node.type})` : nodeId;
        }).join(' → ');
        report += '\n\n';
      }
    }
    
    // 写入报告
    fs.writeFileSync(reportPath, report);
    
    console.log(`依赖报告已生成: ${reportPath}`);
  }
} 