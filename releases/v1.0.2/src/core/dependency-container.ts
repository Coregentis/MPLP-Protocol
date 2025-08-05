/**
 * 依赖注入容器
 * @description 提供依赖注入和服务定位功能
 * @author MPLP Team
 * @version 1.0.1
 */

import { Logger } from '../utils/logger';

export interface ServiceToken<T = any> {
  name: string;
  type: string;
}

export function createInterfaceToken<T>(name: string): ServiceToken<T> {
  return {
    name,
    type: 'interface'
  };
}

/**
 * 依赖注入容器类
 */
export class DependencyContainer {
  private services = new Map<string, any>();
  private factories = new Map<string, () => any>();
  private singletons = new Map<string, any>();
  private logger: Logger;

  constructor() {
    this.logger = new Logger('DependencyContainer');
  }

  /**
   * 注册服务
   */
  register<T>(token: ServiceToken<T>, implementation: T): void {
    this.services.set(token.name, implementation);
    this.logger.debug('Service registered', { token: token.name });
  }

  /**
   * 注册工厂函数
   */
  registerFactory<T>(token: ServiceToken<T>, factory: () => T): void {
    this.factories.set(token.name, factory);
    this.logger.debug('Factory registered', { token: token.name });
  }

  /**
   * 注册单例
   */
  registerSingleton<T>(token: ServiceToken<T>, implementation: T): void {
    this.singletons.set(token.name, implementation);
    this.logger.debug('Singleton registered', { token: token.name });
  }

  /**
   * 解析服务
   */
  resolve<T>(token: ServiceToken<T>): T {
    // 检查单例
    if (this.singletons.has(token.name)) {
      return this.singletons.get(token.name);
    }

    // 检查工厂
    if (this.factories.has(token.name)) {
      const factory = this.factories.get(token.name);
      if (factory) {
        return factory();
      }
    }

    // 检查普通服务
    if (this.services.has(token.name)) {
      return this.services.get(token.name);
    }

    throw new Error(`Service not registered: ${token.name}`);
  }

  /**
   * 检查服务是否已注册
   */
  has<T>(token: ServiceToken<T>): boolean {
    return this.services.has(token.name) || 
           this.factories.has(token.name) || 
           this.singletons.has(token.name);
  }

  /**
   * 移除服务
   */
  remove<T>(token: ServiceToken<T>): boolean {
    const removed = this.services.delete(token.name) ||
                   this.factories.delete(token.name) ||
                   this.singletons.delete(token.name);
    
    if (removed) {
      this.logger.debug('Service removed', { token: token.name });
    }
    
    return removed;
  }

  /**
   * 清空容器
   */
  clear(): void {
    this.services.clear();
    this.factories.clear();
    this.singletons.clear();
    this.logger.debug('Container cleared');
  }

  /**
   * 获取所有已注册的服务名称
   */
  getRegisteredServices(): string[] {
    const services = new Set<string>();
    
    this.services.forEach((_, key) => services.add(key));
    this.factories.forEach((_, key) => services.add(key));
    this.singletons.forEach((_, key) => services.add(key));
    
    return Array.from(services);
  }

  /**
   * 创建子容器
   */
  createChild(): DependencyContainer {
    const child = new DependencyContainer();
    
    // 复制父容器的服务
    this.services.forEach((value, key) => {
      child.services.set(key, value);
    });
    
    this.factories.forEach((value, key) => {
      child.factories.set(key, value);
    });
    
    this.singletons.forEach((value, key) => {
      child.singletons.set(key, value);
    });
    
    return child;
  }

  /**
   * 获取容器统计信息
   */
  getStats(): {
    services: number;
    factories: number;
    singletons: number;
    total: number;
  } {
    return {
      services: this.services.size,
      factories: this.factories.size,
      singletons: this.singletons.size,
      total: this.services.size + this.factories.size + this.singletons.size
    };
  }
}

// 默认容器实例
export const defaultContainer = new DependencyContainer();
