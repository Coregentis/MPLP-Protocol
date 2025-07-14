/**
 * MPLP模块依赖关系图
 * 
 * 用于分析、管理和可视化模块间的依赖关系，支持依赖验证和循环依赖检测。
 * 
 * @version v1.1.0
 * @created 2025-07-15T10:30:00+08:00
 * @updated 2025-07-18T09:30:00+08:00
 */

import * as fs from 'fs';
import * as path from 'path';
import { EventBus } from './event-bus';
import { EventType, ModuleRegisteredEventData, DependencyCycleDetectedEventData } from './event-types';

// 依赖节点类型
export enum DependencyNodeType {
  MODULE = 'module',
  INTERFACE = 'interface',
  SERVICE = 'service',
  ADAPTER = 'adapter',
  REPOSITORY = 'repository',
  CONTROLLER = 'controller'
}

// 依赖关系类型
export enum DependencyRelationType {
  USES = 'uses',            // 模块使用其他模块
  IMPLEMENTS = 'implements', // 实现接口
  DEPENDS_ON = 'depends_on', // 直接依赖
  EXTENDS = 'extends',      // 扩展/继承
  CONTAINS = 'contains',    // 包含关系
  COMMUNICATES = 'communicates' // 通信关系
}

// 依赖节点接口
export interface IDependencyNode {
  id: string;               // 节点唯一标识
  name: string;             // 节点名称
  type: DependencyNodeType; // 节点类型
  module: string;           // 所属模块
  description?: string;     // 节点描述
  metadata?: Record<string, unknown>; // 节点元数据
}

// 依赖关系接口
export interface IDependencyRelation {
  source: string;                    // 源节点ID
  target: string;                    // 目标节点ID
  type: DependencyRelationType;      // 关系类型
  weight?: number;                   // 关系权重
  description?: string;              // 关系描述
  metadata?: Record<string, unknown>; // 关系元数据
}

// 依赖图接口
export interface IDependencyGraph {
  nodes: Map<string, IDependencyNode>;     // 节点集合
  relations: IDependencyRelation[];        // 关系集合
  
  addNode(node: IDependencyNode): void;
  addRelation(relation: IDependencyRelation): void;
  getNodeDependencies(nodeId: string): IDependencyNode[];
  getNodeDependents(nodeId: string): IDependencyNode[];
  detectCycles(): string[][];
  validateDependencies(): boolean;
  exportToDot(): string;
  exportToJson(outputPath: string): void;
  getModuleDependencies(moduleName: string): string[];
  getModuleDependents(moduleName: string): string[];
  analyzeModuleCohesion(): Record<string, number>;
  analyzeModuleCoupling(): Record<string, number>;
}

/**
 * 模块依赖图实现
 */
export class DependencyGraph implements IDependencyGraph {
  public nodes: Map<string, IDependencyNode>;
  public relations: IDependencyRelation[];
  private eventBus: EventBus;

  constructor(eventBus: EventBus) {
    this.nodes = new Map<string, IDependencyNode>();
    this.relations = [];
    this.eventBus = eventBus;
    
    // 订阅模块注册事件
    this.eventBus.subscribe(EventType.MODULE_REGISTERED, (data: ModuleRegisteredEventData) => {
      if (data.module && data.interfaces) {
        this.registerModuleFromEvent(data.module, data.interfaces);
      }
    });
  }

  /**
   * 添加依赖节点
   */
  public addNode(node: IDependencyNode): void {
    if (this.nodes.has(node.id)) {
      throw new Error(`节点已存在: ${node.id}`);
    }
    this.nodes.set(node.id, node);
  }

  /**
   * 添加依赖关系
   */
  public addRelation(relation: IDependencyRelation): void {
    if (!this.nodes.has(relation.source)) {
      throw new Error(`源节点不存在: ${relation.source}`);
    }
    if (!this.nodes.has(relation.target)) {
      throw new Error(`目标节点不存在: ${relation.target}`);
    }
    this.relations.push(relation);
  }

  /**
   * 获取节点的直接依赖
   */
  public getNodeDependencies(nodeId: string): IDependencyNode[] {
    if (!this.nodes.has(nodeId)) {
      throw new Error(`节点不存在: ${nodeId}`);
    }
    
    const dependencies: IDependencyNode[] = [];
    for (const relation of this.relations) {
      if (relation.source === nodeId) {
        const targetNode = this.nodes.get(relation.target);
        if (targetNode) {
          dependencies.push(targetNode);
        }
      }
    }
    return dependencies;
  }

  /**
   * 获取依赖该节点的节点列表
   */
  public getNodeDependents(nodeId: string): IDependencyNode[] {
    if (!this.nodes.has(nodeId)) {
      throw new Error(`节点不存在: ${nodeId}`);
    }
    
    const dependents: IDependencyNode[] = [];
    for (const relation of this.relations) {
      if (relation.target === nodeId) {
        const sourceNode = this.nodes.get(relation.source);
        if (sourceNode) {
          dependents.push(sourceNode);
        }
      }
    }
    return dependents;
  }

  /**
   * 检测循环依赖
   */
  public detectCycles(): string[][] {
    const cycles: string[][] = [];
    const visited = new Set<string>();
    const recStack = new Set<string>();
    const path: string[] = [];

    const dfs = (nodeId: string, path: string[]) => {
      if (recStack.has(nodeId)) {
        // 找到循环依赖
        const cycleStart = path.indexOf(nodeId);
        const cycle = path.slice(cycleStart).concat(nodeId);
        cycles.push(cycle);
        
        // 发布循环依赖检测事件
        this.eventBus.publish(EventType.DEPENDENCY_CYCLE_DETECTED, {
          timestamp: new Date().toISOString(),
          cycles: [cycle]
        } as DependencyCycleDetectedEventData);
        
        return;
      }

      if (visited.has(nodeId)) {
        return;
      }

      visited.add(nodeId);
      recStack.add(nodeId);
      path.push(nodeId);

      const dependencies = this.getNodeDependencies(nodeId);
      for (const dep of dependencies) {
        dfs(dep.id, [...path]);
      }

      recStack.delete(nodeId);
    };

    // 对每个节点执行DFS
    for (const nodeId of this.nodes.keys()) {
      if (!visited.has(nodeId)) {
        dfs(nodeId, []);
      }
    }

    return cycles;
  }

  /**
   * 验证依赖关系
   */
  public validateDependencies(): boolean {
    // 检查循环依赖
    const cycles = this.detectCycles();
    if (cycles.length > 0) {
      console.error('检测到循环依赖:', cycles);
      return false;
    }

    // 检查模块间依赖是否合理
    const moduleRelations = this.getModuleRelations();
    
    // 检查架构约束
    const architectureViolations = this.checkArchitectureConstraints(moduleRelations);
    if (architectureViolations.length > 0) {
      console.error('检测到架构约束违规:', architectureViolations);
      return false;
    }
    
    return true;
  }

  /**
   * 导出为DOT格式，用于生成图形化依赖图
   */
  public exportToDot(): string {
    let dot = 'digraph DependencyGraph {\n';
    dot += '  rankdir=LR;\n';
    dot += '  node [fontname="Arial", fontsize=10];\n';
    dot += '  edge [fontname="Arial", fontsize=8];\n';
    
    // 添加子图，按模块分组
    const moduleNodes = new Map<string, IDependencyNode[]>();
    
    // 按模块分组节点
    for (const node of this.nodes.values()) {
      if (!moduleNodes.has(node.module)) {
        moduleNodes.set(node.module, []);
      }
      moduleNodes.get(node.module)!.push(node);
    }
    
    // 创建模块子图
    let subgraphCount = 0;
    for (const [moduleName, nodes] of moduleNodes.entries()) {
      dot += `  subgraph cluster_${subgraphCount++} {\n`;
      dot += `    label="${moduleName}";\n`;
      dot += '    style=filled;\n';
      dot += '    color=lightgrey;\n';
      dot += '    node [style=filled];\n';
      
      // 添加节点
      for (const node of nodes) {
        let nodeAttrs = '';
        
        // 根据节点类型设置不同的形状和颜色
        switch (node.type) {
          case DependencyNodeType.MODULE:
            nodeAttrs = 'shape=box, style=filled, fillcolor=lightblue';
            break;
          case DependencyNodeType.INTERFACE:
            nodeAttrs = 'shape=ellipse, style=filled, fillcolor=lightgreen';
            break;
          case DependencyNodeType.SERVICE:
            nodeAttrs = 'shape=box, style=filled, fillcolor=lightyellow';
            break;
          case DependencyNodeType.ADAPTER:
            nodeAttrs = 'shape=hexagon, style=filled, fillcolor=lightcoral';
            break;
          case DependencyNodeType.REPOSITORY:
            nodeAttrs = 'shape=cylinder, style=filled, fillcolor=lightcyan';
            break;
          case DependencyNodeType.CONTROLLER:
            nodeAttrs = 'shape=component, style=filled, fillcolor=lightsalmon';
            break;
        }
        
        dot += `    "${node.id}" [label="${node.name}", ${nodeAttrs}];\n`;
      }
      
      dot += '  }\n';
    }
    
    // 添加关系
    for (const relation of this.relations) {
      let edgeAttrs = '';
      
      // 根据关系类型设置不同的样式
      switch (relation.type) {
        case DependencyRelationType.USES:
          edgeAttrs = 'style=solid, color=black, penwidth=1.0';
          break;
        case DependencyRelationType.IMPLEMENTS:
          edgeAttrs = 'style=dashed, color=blue, penwidth=1.0';
          break;
        case DependencyRelationType.DEPENDS_ON:
          edgeAttrs = 'style=solid, color=red, penwidth=1.5';
          break;
        case DependencyRelationType.EXTENDS:
          edgeAttrs = 'style=dashed, color=green, penwidth=1.0';
          break;
        case DependencyRelationType.CONTAINS:
          edgeAttrs = 'style=dotted, color=purple, penwidth=1.0';
          break;
        case DependencyRelationType.COMMUNICATES:
          edgeAttrs = 'style=solid, color=orange, penwidth=1.0, dir=both';
          break;
      }
      
      dot += `  "${relation.source}" -> "${relation.target}" [${edgeAttrs}, label="${relation.type}"];\n`;
    }
    
    dot += '}\n';
    return dot;
  }

  /**
   * 导出为JSON格式
   * @param outputPath 输出路径
   */
  public exportToJson(outputPath: string): void {
    const data = {
      nodes: Array.from(this.nodes.values()),
      relations: this.relations,
      metadata: {
        timestamp: new Date().toISOString(),
        nodeCount: this.nodes.size,
        relationCount: this.relations.length,
        moduleCount: new Set(Array.from(this.nodes.values()).map(n => n.module)).size
      }
    };
    
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
  }

  /**
   * 获取模块的依赖模块
   * @param moduleName 模块名称
   * @returns 依赖模块列表
   */
  public getModuleDependencies(moduleName: string): string[] {
    const moduleId = `module:${moduleName}`;
    if (!this.nodes.has(moduleId)) {
      throw new Error(`模块不存在: ${moduleName}`);
    }
    
    // 查找模块间的依赖关系
    const dependencies = new Set<string>();
    
    for (const relation of this.relations) {
      if (relation.source === moduleId && relation.target.startsWith('module:')) {
        dependencies.add(relation.target.replace('module:', ''));
      }
    }
    
    return Array.from(dependencies);
  }

  /**
   * 获取依赖该模块的模块列表
   * @param moduleName 模块名称
   * @returns 依赖该模块的模块列表
   */
  public getModuleDependents(moduleName: string): string[] {
    const moduleId = `module:${moduleName}`;
    if (!this.nodes.has(moduleId)) {
      throw new Error(`模块不存在: ${moduleName}`);
    }
    
    // 查找模块间的依赖关系
    const dependents = new Set<string>();
    
    for (const relation of this.relations) {
      if (relation.target === moduleId && relation.source.startsWith('module:')) {
        dependents.add(relation.source.replace('module:', ''));
      }
    }
    
    return Array.from(dependents);
  }

  /**
   * 分析模块内聚性
   * 内聚性 = 模块内部关系数 / (模块内节点数 * (模块内节点数 - 1) / 2)
   * @returns 模块内聚性分析结果
   */
  public analyzeModuleCohesion(): Record<string, number> {
    const result: Record<string, number> = {};
    const moduleNodes = new Map<string, string[]>();
    
    // 按模块分组节点
    for (const [id, node] of this.nodes.entries()) {
      if (!moduleNodes.has(node.module)) {
        moduleNodes.set(node.module, []);
      }
      moduleNodes.get(node.module)!.push(id);
    }
    
    // 计算每个模块的内聚性
    for (const [module, nodeIds] of moduleNodes.entries()) {
      if (nodeIds.length <= 1) {
        result[module] = 1; // 单节点模块默认内聚性为1
        continue;
      }
      
      // 计算模块内部关系数
      let internalRelations = 0;
      for (const relation of this.relations) {
        if (nodeIds.includes(relation.source) && nodeIds.includes(relation.target)) {
          internalRelations++;
        }
      }
      
      // 计算可能的最大内部关系数
      const maxPossibleRelations = nodeIds.length * (nodeIds.length - 1) / 2;
      
      // 计算内聚性
      result[module] = maxPossibleRelations > 0 ? internalRelations / maxPossibleRelations : 0;
    }
    
    return result;
  }

  /**
   * 分析模块耦合性
   * 耦合性 = 模块间关系数 / 模块总数
   * @returns 模块耦合性分析结果
   */
  public analyzeModuleCoupling(): Record<string, number> {
    const result: Record<string, number> = {};
    const moduleNodes = new Map<string, string[]>();
    const moduleCount = new Set(Array.from(this.nodes.values()).map(n => n.module)).size;
    
    // 按模块分组节点
    for (const [id, node] of this.nodes.entries()) {
      if (!moduleNodes.has(node.module)) {
        moduleNodes.set(node.module, []);
      }
      moduleNodes.get(node.module)!.push(id);
    }
    
    // 计算每个模块的耦合性
    for (const [module, nodeIds] of moduleNodes.entries()) {
      // 计算模块外部关系数
      let externalRelations = 0;
      
      for (const relation of this.relations) {
        if (nodeIds.includes(relation.source) && !nodeIds.includes(relation.target)) {
          externalRelations++;
        }
      }
      
      // 计算耦合性
      result[module] = moduleCount > 1 ? externalRelations / (moduleCount - 1) : 0;
    }
    
    return result;
  }

  /**
   * 获取模块间关系
   * @private
   */
  private getModuleRelations(): Array<{source: string, target: string, type: DependencyRelationType}> {
    const moduleRelations: Array<{source: string, target: string, type: DependencyRelationType}> = [];
    
    // 查找模块间的依赖关系
    for (const relation of this.relations) {
      if (relation.source.startsWith('module:') && relation.target.startsWith('module:')) {
        moduleRelations.push({
          source: relation.source.replace('module:', ''),
          target: relation.target.replace('module:', ''),
          type: relation.type
        });
      }
    }
    
    return moduleRelations;
  }

  /**
   * 检查架构约束
   * @private
   */
  private checkArchitectureConstraints(
    moduleRelations: Array<{source: string, target: string, type: DependencyRelationType}>
  ): Array<string> {
    const violations: string[] = [];
    
    // 定义架构约束
    const layerOrder = ['context', 'plan', 'confirm', 'trace', 'role', 'extension'];
    
    // 检查层次依赖约束
    for (const relation of moduleRelations) {
      const sourceIndex = layerOrder.indexOf(relation.source);
      const targetIndex = layerOrder.indexOf(relation.target);
      
      if (sourceIndex !== -1 && targetIndex !== -1) {
        // 上层模块不应该依赖下层模块
        if (sourceIndex < targetIndex) {
          violations.push(`架构约束违规: ${relation.source} 不应该依赖 ${relation.target}`);
        }
      }
    }
    
    return violations;
  }

  /**
   * 从模块注册事件中添加依赖信息
   */
  private registerModuleFromEvent(moduleName: string, interfaces: string[]): void {
    // 添加模块节点
    const moduleNodeId = `module:${moduleName}`;
    if (!this.nodes.has(moduleNodeId)) {
      this.addNode({
        id: moduleNodeId,
        name: moduleName,
        type: DependencyNodeType.MODULE,
        module: moduleName,
        description: `MPLP ${moduleName} 模块`
      });
    }

    // 添加接口节点和关系
    for (const interfaceName of interfaces) {
      const interfaceNodeId = `interface:${interfaceName}`;
      if (!this.nodes.has(interfaceNodeId)) {
        this.addNode({
          id: interfaceNodeId,
          name: interfaceName,
          type: DependencyNodeType.INTERFACE,
          module: moduleName,
          description: `${interfaceName} 接口`
        });
      }

      // 添加模块和接口的关系
      this.addRelation({
        source: moduleNodeId,
        target: interfaceNodeId,
        type: DependencyRelationType.IMPLEMENTS
      });
    }
  }
}