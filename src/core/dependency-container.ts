/**
 * MPLP依赖注入容器 - 厂商中立设计
 * 
 * 提供轻量级的依赖注入机制，支持接口与实现分离，
 * 确保模块间松耦合，便于测试和扩展。
 * 
 * @version v1.1.0
 * @created 2025-07-15T11:00:00+08:00
 * @updated 2025-07-18T09:00:00+08:00
 * @compliance .cursor/rules/architecture.mdc - 厂商中立原则
 */

/**
 * 依赖注入容器类型
 */
type Constructor<T = any> = new (...args: any[]) => T;
type Factory<T = any> = (...args: any[]) => T;
type AsyncFactory<T = any> = (...args: any[]) => Promise<T>;
type Token = string | symbol | Constructor;
type Registration<T = any> = {
  token: Token;
  factory: Factory<T> | AsyncFactory<T>;
  singleton: boolean;
  instance?: T;
  dependencies?: Token[];
  async: boolean;
  lazy: boolean;
  metadata?: Record<string, unknown>;
};

/**
 * 依赖解析错误类
 */
export class DependencyResolutionError extends Error {
  constructor(message: string, public readonly token?: Token, public readonly path?: Token[]) {
    super(message);
    this.name = 'DependencyResolutionError';
  }
}

/**
 * 循环依赖错误类
 */
export class CircularDependencyError extends DependencyResolutionError {
  constructor(public readonly cycle: Token[]) {
    super(`检测到循环依赖: ${cycle.map(t => String(t)).join(' -> ')}`);
    this.name = 'CircularDependencyError';
  }
}

/**
 * 依赖注入容器
 * 支持接口与实现分离，实现厂商中立的依赖注入
 */
export class DependencyContainer {
  private registrations: Map<Token, Registration> = new Map();
  private parent?: DependencyContainer;
  private resolutionStack: Token[] = [];
  private resolving: Set<Token> = new Set();

  /**
   * 创建依赖注入容器
   * @param parent 可选的父容器
   */
  constructor(parent?: DependencyContainer) {
    this.parent = parent;
  }

  /**
   * 注册单例服务
   * @param token 服务标识
   * @param factory 工厂函数
   * @param dependencies 依赖项
   * @param options 注册选项
   * @returns 容器实例
   */
  registerSingleton<T>(
    token: Token, 
    factory: Factory<T> | AsyncFactory<T>, 
    dependencies: Token[] = [],
    options: { async?: boolean; lazy?: boolean; metadata?: Record<string, unknown> } = {}
  ): DependencyContainer {
    this.registrations.set(token, {
      token,
      factory,
      singleton: true,
      dependencies,
      async: options.async || false,
      lazy: options.lazy || false,
      metadata: options.metadata
    });
    return this;
  }

  /**
   * 注册瞬态服务
   * @param token 服务标识
   * @param factory 工厂函数
   * @param dependencies 依赖项
   * @param options 注册选项
   * @returns 容器实例
   */
  registerTransient<T>(
    token: Token, 
    factory: Factory<T> | AsyncFactory<T>, 
    dependencies: Token[] = [],
    options: { async?: boolean; metadata?: Record<string, unknown> } = {}
  ): DependencyContainer {
    this.registrations.set(token, {
      token,
      factory,
      singleton: false,
      dependencies,
      async: options.async || false,
      lazy: false,
      metadata: options.metadata
    });
    return this;
  }

  /**
   * 注册实例
   * @param token 服务标识
   * @param instance 实例
   * @param metadata 元数据
   * @returns 容器实例
   */
  registerInstance<T>(
    token: Token, 
    instance: T,
    metadata?: Record<string, unknown>
  ): DependencyContainer {
    this.registrations.set(token, {
      token,
      factory: () => instance,
      singleton: true,
      instance,
      async: false,
      lazy: false,
      metadata
    });
    return this;
  }

  /**
   * 注册类
   * @param token 服务标识（通常是接口或抽象类）
   * @param ctor 类构造函数
   * @param dependencies 依赖项
   * @param options 注册选项
   * @returns 容器实例
   */
  registerClass<T>(
    token: Token, 
    ctor: Constructor<T>, 
    dependencies: Token[] = [],
    options: { singleton?: boolean; async?: boolean; lazy?: boolean; metadata?: Record<string, unknown> } = {}
  ): DependencyContainer {
    const factory = (...args: any[]) => new ctor(...args);
    const singleton = options.singleton !== undefined ? options.singleton : true;
    
    if (singleton) {
      this.registerSingleton(token, factory, dependencies, {
        async: options.async || false,
        lazy: options.lazy || false,
        metadata: options.metadata
      });
    } else {
      this.registerTransient(token, factory, dependencies, {
        async: options.async || false,
        metadata: options.metadata
      });
    }
    return this;
  }

  /**
   * 解析服务
   * @param token 服务标识
   * @returns 服务实例
   * @throws {DependencyResolutionError} 当服务未注册或解析失败时
   * @throws {CircularDependencyError} 当检测到循环依赖时
   */
  resolve<T>(token: Token): T {
    return this.resolveInternal<T>(token, []);
  }

  /**
   * 异步解析服务
   * @param token 服务标识
   * @returns Promise<服务实例>
   * @throws {DependencyResolutionError} 当服务未注册或解析失败时
   * @throws {CircularDependencyError} 当检测到循环依赖时
   */
  async resolveAsync<T>(token: Token): Promise<T> {
    return this.resolveInternalAsync<T>(token, []);
  }

  /**
   * 内部解析服务实现
   * @private
   */
  private resolveInternal<T>(token: Token, resolutionPath: Token[]): T {
    // 检查循环依赖
    if (this.resolving.has(token)) {
      const cycle = [...resolutionPath, token];
      throw new CircularDependencyError(cycle);
    }
    
    // 查找注册信息
    const registration = this.registrations.get(token);
    
    // 如果本容器没有找到，尝试从父容器解析
    if (!registration && this.parent) {
      return this.parent.resolveInternal<T>(token, resolutionPath);
    }
    
    // 如果没有找到注册信息，抛出错误
    if (!registration) {
      throw new DependencyResolutionError(`Service not registered: ${String(token)}`, token, resolutionPath);
    }
    
    // 如果是异步工厂，提示使用resolveAsync
    if (registration.async) {
      throw new DependencyResolutionError(
        `Service ${String(token)} is registered as async. Use resolveAsync() instead.`,
        token,
        resolutionPath
      );
    }
    
    // 如果是单例且已有实例，直接返回
    if (registration.singleton && registration.instance) {
      return registration.instance as T;
    }
    
    // 标记为正在解析
    this.resolving.add(token);
    
    try {
      // 解析依赖
      const dependencies = registration.dependencies?.map(dep => 
        this.resolveInternal(dep, [...resolutionPath, token])
      ) || [];
      
      // 创建实例
      const instance = (registration.factory as Factory<T>)(...dependencies);
      
      // 如果是单例，缓存实例
      if (registration.singleton) {
        registration.instance = instance;
      }
      
      return instance;
    } finally {
      // 解析完成，从正在解析集合中移除
      this.resolving.delete(token);
    }
  }

  /**
   * 内部异步解析服务实现
   * @private
   */
  private async resolveInternalAsync<T>(token: Token, resolutionPath: Token[]): Promise<T> {
    // 检查循环依赖
    if (this.resolving.has(token)) {
      const cycle = [...resolutionPath, token];
      throw new CircularDependencyError(cycle);
    }
    
    // 查找注册信息
    const registration = this.registrations.get(token);
    
    // 如果本容器没有找到，尝试从父容器解析
    if (!registration && this.parent) {
      return this.parent.resolveInternalAsync<T>(token, resolutionPath);
    }
    
    // 如果没有找到注册信息，抛出错误
    if (!registration) {
      throw new DependencyResolutionError(`Service not registered: ${String(token)}`, token, resolutionPath);
    }
    
    // 如果是单例且已有实例，直接返回
    if (registration.singleton && registration.instance) {
      return registration.instance as T;
    }
    
    // 标记为正在解析
    this.resolving.add(token);
    
    try {
      // 解析依赖
      const dependencies = registration.dependencies?.length ? 
        await Promise.all(registration.dependencies.map(dep => 
          this.resolveInternalAsync(dep, [...resolutionPath, token])
        )) : [];
      
      // 创建实例
      let instance: T;
      if (registration.async) {
        instance = await (registration.factory as AsyncFactory<T>)(...dependencies);
      } else {
        instance = (registration.factory as Factory<T>)(...dependencies);
      }
      
      // 如果是单例，缓存实例
      if (registration.singleton) {
        registration.instance = instance;
      }
      
      return instance;
    } finally {
      // 解析完成，从正在解析集合中移除
      this.resolving.delete(token);
    }
  }

  /**
   * 检查服务是否已注册
   * @param token 服务标识
   * @returns 是否已注册
   */
  has(token: Token): boolean {
    return this.registrations.has(token) || (!!this.parent && this.parent.has(token));
  }

  /**
   * 移除注册服务
   * @param token 服务标识
   * @returns 是否成功移除
   */
  remove(token: Token): boolean {
    return this.registrations.delete(token);
  }

  /**
   * 创建子容器
   * @returns 子容器
   */
  createChildContainer(): DependencyContainer {
    return new DependencyContainer(this);
  }

  /**
   * 清空容器
   */
  clear(): void {
    this.registrations.clear();
  }

  /**
   * 获取所有注册的服务标识
   * @returns 服务标识数组
   */
  getAllRegistrations(): Token[] {
    return Array.from(this.registrations.keys());
  }

  /**
   * 检测循环依赖
   * @returns 循环依赖数组
   */
  detectCircularDependencies(): Token[][] {
    const cycles: Token[][] = [];
    const visited = new Set<Token>();
    const path: Token[] = [];
    
    // 深度优先搜索检测循环
    const dfs = (token: Token) => {
      if (path.includes(token)) {
        // 找到循环依赖
        const cycleStart = path.indexOf(token);
        cycles.push([...path.slice(cycleStart), token]);
        return;
      }
      
      if (visited.has(token)) {
        return;
      }
      
      visited.add(token);
      path.push(token);
      
      const registration = this.registrations.get(token);
      if (registration && registration.dependencies) {
        for (const dep of registration.dependencies) {
          dfs(dep);
        }
      }
      
      path.pop();
    };
    
    // 对每个注册项执行DFS
    for (const token of this.registrations.keys()) {
      dfs(token);
    }
    
    return cycles;
  }

  /**
   * 获取依赖树
   * @param rootToken 根服务标识
   * @returns 依赖树对象
   */
  getDependencyTree(rootToken: Token): object {
    const visited = new Set<Token>();
    
    const buildTree = (token: Token): object => {
      if (visited.has(token)) {
        return { [String(token)]: '(circular)' };
      }
      
      visited.add(token);
      
      const registration = this.registrations.get(token);
      if (!registration) {
        return { [String(token)]: '(not registered)' };
      }
      
      const dependencies: Record<string, any> = {};
      
      if (registration.dependencies && registration.dependencies.length > 0) {
        for (const dep of registration.dependencies) {
          dependencies[String(dep)] = buildTree(dep);
        }
        
        return { 
          [String(token)]: { 
            type: registration.singleton ? 'singleton' : 'transient',
            async: registration.async,
            lazy: registration.lazy,
            dependencies
          }
        };
      }
      
      return { 
        [String(token)]: { 
          type: registration.singleton ? 'singleton' : 'transient',
          async: registration.async,
          lazy: registration.lazy
        }
      };
    };
    
    return buildTree(rootToken);
  }
}

// 创建全局默认容器
export const container = new DependencyContainer();

// 用于创建接口标识符的辅助函数
export function createInterfaceToken(name: string): symbol {
  return Symbol(`Interface:${name}`);
}

// 常用接口标识符
export const Tokens = {
  ITraceAdapter: createInterfaceToken('ITraceAdapter'),
  IPlanAdapter: createInterfaceToken('IPlanAdapter'),
  IConfirmAdapter: createInterfaceToken('IConfirmAdapter'),
  IExtensionAdapter: createInterfaceToken('IExtensionAdapter'),
  IRoleRepository: createInterfaceToken('IRoleRepository'),
  IContextManager: createInterfaceToken('IContextManager'),
  IPlanManager: createInterfaceToken('IPlanManager'),
  IConfirmManager: createInterfaceToken('IConfirmManager'),
  ITraceManager: createInterfaceToken('ITraceManager'),
  IRoleManager: createInterfaceToken('IRoleManager'),
  IExtensionManager: createInterfaceToken('IExtensionManager')
}; 