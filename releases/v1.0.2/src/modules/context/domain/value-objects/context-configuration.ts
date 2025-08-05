/**
 * ContextConfiguration值对象
 * 
 * 包含上下文的配置信息，作为不可变的值对象
 * 
 * @version 1.0.0
 * @created 2025-09-16
 */

/**
 * 上下文配置值对象
 */
export class ContextConfiguration {
  /**
   * 创建一个新的上下文配置
   */
  constructor(
    public readonly allowSharing: boolean,
    public readonly maxSessions: number,
    public readonly expirationPolicy: string,
    public readonly autoSuspendAfterInactivity: number | null,
    public readonly allowAnonymousAccess: boolean,
    public readonly features: Set<string>
  ) {}

  /**
   * 创建默认配置
   */
  static createDefault(): ContextConfiguration {
    return new ContextConfiguration(
      true,           // 允许共享
      10,             // 最大会话数
      'never',        // 永不过期
      null,           // 不自动暂停
      false,          // 不允许匿名访问
      new Set<string>() // 无特性
    );
  }

  /**
   * 创建从JSON的配置
   */
  static fromJSON(json: Record<string, unknown>): ContextConfiguration {
    return new ContextConfiguration(
      json.allowSharing === true,
      typeof json.maxSessions === 'number' ? json.maxSessions : 10,
      typeof json.expirationPolicy === 'string' ? json.expirationPolicy : 'never',
      typeof json.autoSuspendAfterInactivity === 'number' ? json.autoSuspendAfterInactivity : null,
      json.allowAnonymousAccess === true,
      json.features instanceof Array ? new Set<string>(json.features.filter(f => typeof f === 'string')) : new Set<string>()
    );
  }

  /**
   * 转换为JSON对象
   */
  toJSON(): Record<string, unknown> {
    return {
      allowSharing: this.allowSharing,
      maxSessions: this.maxSessions,
      expirationPolicy: this.expirationPolicy,
      autoSuspendAfterInactivity: this.autoSuspendAfterInactivity,
      allowAnonymousAccess: this.allowAnonymousAccess,
      features: Array.from(this.features)
    };
  }

  /**
   * 检查是否包含特定特性
   */
  hasFeature(feature: string): boolean {
    return this.features.has(feature);
  }

  /**
   * 创建一个新配置，添加特性
   */
  withFeature(feature: string): ContextConfiguration {
    const newFeatures = new Set(this.features);
    newFeatures.add(feature);
    
    return new ContextConfiguration(
      this.allowSharing,
      this.maxSessions,
      this.expirationPolicy,
      this.autoSuspendAfterInactivity,
      this.allowAnonymousAccess,
      newFeatures
    );
  }

  /**
   * 创建一个新配置，移除特性
   */
  withoutFeature(feature: string): ContextConfiguration {
    const newFeatures = new Set(this.features);
    newFeatures.delete(feature);
    
    return new ContextConfiguration(
      this.allowSharing,
      this.maxSessions,
      this.expirationPolicy,
      this.autoSuspendAfterInactivity,
      this.allowAnonymousAccess,
      newFeatures
    );
  }

  /**
   * 创建一个新配置，更新会话限制
   */
  withMaxSessions(maxSessions: number): ContextConfiguration {
    return new ContextConfiguration(
      this.allowSharing,
      maxSessions,
      this.expirationPolicy,
      this.autoSuspendAfterInactivity,
      this.allowAnonymousAccess,
      new Set(this.features)
    );
  }

  /**
   * 创建一个新配置，更新过期策略
   */
  withExpirationPolicy(policy: string): ContextConfiguration {
    return new ContextConfiguration(
      this.allowSharing,
      this.maxSessions,
      policy,
      this.autoSuspendAfterInactivity,
      this.allowAnonymousAccess,
      new Set(this.features)
    );
  }

  /**
   * 创建一个新配置，更新共享设置
   */
  withSharingEnabled(enabled: boolean): ContextConfiguration {
    return new ContextConfiguration(
      enabled,
      this.maxSessions,
      this.expirationPolicy,
      this.autoSuspendAfterInactivity,
      this.allowAnonymousAccess,
      new Set(this.features)
    );
  }
} 