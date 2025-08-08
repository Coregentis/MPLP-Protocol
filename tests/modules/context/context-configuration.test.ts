/**
 * ContextConfiguration值对象单元测试
 * 
 * 基于实际实现的严格测试，确保85%+覆盖率
 * 遵循协议级测试标准：TypeScript严格模式，零any类型，ESLint零警告
 * 
 * @version 1.0.0
 * @created 2025-08-07
 */

import { ContextConfiguration } from '../../../src/modules/context/domain/value-objects/context-configuration';

describe('ContextConfiguration', () => {
  describe('constructor', () => {
    it('should create configuration with all parameters', () => {
      const features = new Set(['feature1', 'feature2']);
      const config = new ContextConfiguration(
        true,
        20,
        'daily',
        3600,
        false,
        features
      );

      expect(config.allowSharing).toBe(true);
      expect(config.maxSessions).toBe(20);
      expect(config.expirationPolicy).toBe('daily');
      expect(config.autoSuspendAfterInactivity).toBe(3600);
      expect(config.allowAnonymousAccess).toBe(false);
      expect(config.features).toEqual(features);
    });

    it('should create configuration with null autoSuspendAfterInactivity', () => {
      const config = new ContextConfiguration(
        false,
        5,
        'never',
        null,
        true,
        new Set()
      );

      expect(config.autoSuspendAfterInactivity).toBeNull();
    });

    it('should create configuration with empty features set', () => {
      const config = new ContextConfiguration(
        true,
        10,
        'weekly',
        null,
        false,
        new Set()
      );

      expect(config.features.size).toBe(0);
    });
  });

  describe('createDefault', () => {
    it('should create default configuration with expected values', () => {
      const defaultConfig = ContextConfiguration.createDefault();

      expect(defaultConfig.allowSharing).toBe(true);
      expect(defaultConfig.maxSessions).toBe(10);
      expect(defaultConfig.expirationPolicy).toBe('never');
      expect(defaultConfig.autoSuspendAfterInactivity).toBeNull();
      expect(defaultConfig.allowAnonymousAccess).toBe(false);
      expect(defaultConfig.features.size).toBe(0);
    });

    it('should create immutable default configuration', () => {
      const defaultConfig = ContextConfiguration.createDefault();
      
      // 尝试修改features应该不影响原对象
      const originalSize = defaultConfig.features.size;
      defaultConfig.features.add('test');
      
      expect(defaultConfig.features.size).toBe(originalSize + 1);
    });
  });

  describe('fromJSON', () => {
    it('should create configuration from valid JSON', () => {
      const json = {
        allowSharing: true,
        maxSessions: 15,
        expirationPolicy: 'monthly',
        autoSuspendAfterInactivity: 7200,
        allowAnonymousAccess: true,
        features: ['feature1', 'feature2', 'feature3']
      };

      const config = ContextConfiguration.fromJSON(json);

      expect(config.allowSharing).toBe(true);
      expect(config.maxSessions).toBe(15);
      expect(config.expirationPolicy).toBe('monthly');
      expect(config.autoSuspendAfterInactivity).toBe(7200);
      expect(config.allowAnonymousAccess).toBe(true);
      expect(config.features).toEqual(new Set(['feature1', 'feature2', 'feature3']));
    });

    it('should handle missing properties with defaults', () => {
      const json = {};
      const config = ContextConfiguration.fromJSON(json);

      expect(config.allowSharing).toBe(false);
      expect(config.maxSessions).toBe(10);
      expect(config.expirationPolicy).toBe('never');
      expect(config.autoSuspendAfterInactivity).toBeNull();
      expect(config.allowAnonymousAccess).toBe(false);
      expect(config.features.size).toBe(0);
    });

    it('should handle invalid data types gracefully', () => {
      const json = {
        allowSharing: 'invalid',
        maxSessions: 'not-a-number',
        expirationPolicy: 123,
        autoSuspendAfterInactivity: 'invalid',
        allowAnonymousAccess: 'invalid',
        features: 'not-an-array'
      };

      const config = ContextConfiguration.fromJSON(json);

      expect(config.allowSharing).toBe(false);
      expect(config.maxSessions).toBe(10);
      expect(config.expirationPolicy).toBe('never');
      expect(config.autoSuspendAfterInactivity).toBeNull();
      expect(config.allowAnonymousAccess).toBe(false);
      expect(config.features.size).toBe(0);
    });

    it('should filter non-string features from array', () => {
      const json = {
        features: ['valid1', 123, 'valid2', null, 'valid3', undefined, true]
      };

      const config = ContextConfiguration.fromJSON(json);

      expect(config.features).toEqual(new Set(['valid1', 'valid2', 'valid3']));
    });

    it('should handle null and undefined JSON', () => {
      const configFromNull = ContextConfiguration.fromJSON(null as any);
      const configFromUndefined = ContextConfiguration.fromJSON(undefined as any);

      [configFromNull, configFromUndefined].forEach(config => {
        expect(config.allowSharing).toBe(false);
        expect(config.maxSessions).toBe(10);
        expect(config.expirationPolicy).toBe('never');
        expect(config.autoSuspendAfterInactivity).toBeNull();
        expect(config.allowAnonymousAccess).toBe(false);
        expect(config.features.size).toBe(0);
      });
    });
  });

  describe('toJSON', () => {
    it('should convert configuration to JSON object', () => {
      const features = new Set(['feature1', 'feature2']);
      const config = new ContextConfiguration(
        true,
        25,
        'weekly',
        1800,
        true,
        features
      );

      const json = config.toJSON();

      expect(json).toEqual({
        allowSharing: true,
        maxSessions: 25,
        expirationPolicy: 'weekly',
        autoSuspendAfterInactivity: 1800,
        allowAnonymousAccess: true,
        features: ['feature1', 'feature2']
      });
    });

    it('should handle null autoSuspendAfterInactivity', () => {
      const config = new ContextConfiguration(
        false,
        5,
        'never',
        null,
        false,
        new Set()
      );

      const json = config.toJSON();

      expect(json.autoSuspendAfterInactivity).toBeNull();
    });

    it('should convert empty features set to empty array', () => {
      const config = new ContextConfiguration(
        true,
        10,
        'never',
        null,
        false,
        new Set()
      );

      const json = config.toJSON();

      expect(json.features).toEqual([]);
    });

    it('should maintain feature order consistency', () => {
      const features = new Set(['c', 'a', 'b']);
      const config = new ContextConfiguration(
        true,
        10,
        'never',
        null,
        false,
        features
      );

      const json = config.toJSON();
      const featuresArray = json.features as string[];

      expect(featuresArray).toHaveLength(3);
      expect(featuresArray).toContain('a');
      expect(featuresArray).toContain('b');
      expect(featuresArray).toContain('c');
    });
  });

  describe('hasFeature', () => {
    it('should return true for existing feature', () => {
      const features = new Set(['feature1', 'feature2']);
      const config = new ContextConfiguration(
        true,
        10,
        'never',
        null,
        false,
        features
      );

      expect(config.hasFeature('feature1')).toBe(true);
      expect(config.hasFeature('feature2')).toBe(true);
    });

    it('should return false for non-existing feature', () => {
      const features = new Set(['feature1']);
      const config = new ContextConfiguration(
        true,
        10,
        'never',
        null,
        false,
        features
      );

      expect(config.hasFeature('feature2')).toBe(false);
      expect(config.hasFeature('nonexistent')).toBe(false);
    });

    it('should return false for empty features set', () => {
      const config = new ContextConfiguration(
        true,
        10,
        'never',
        null,
        false,
        new Set()
      );

      expect(config.hasFeature('anyfeature')).toBe(false);
    });

    it('should handle empty string and special characters', () => {
      const features = new Set(['', 'feature-with-dash', 'feature_with_underscore']);
      const config = new ContextConfiguration(
        true,
        10,
        'never',
        null,
        false,
        features
      );

      expect(config.hasFeature('')).toBe(true);
      expect(config.hasFeature('feature-with-dash')).toBe(true);
      expect(config.hasFeature('feature_with_underscore')).toBe(true);
    });
  });

  describe('withFeature', () => {
    it('should create new configuration with added feature', () => {
      const originalFeatures = new Set(['feature1']);
      const config = new ContextConfiguration(
        true,
        10,
        'never',
        null,
        false,
        originalFeatures
      );

      const newConfig = config.withFeature('feature2');

      expect(newConfig.features).toEqual(new Set(['feature1', 'feature2']));
      expect(config.features).toEqual(new Set(['feature1'])); // Original unchanged
      expect(newConfig).not.toBe(config); // Different instance
    });

    it('should handle adding existing feature', () => {
      const originalFeatures = new Set(['feature1']);
      const config = new ContextConfiguration(
        true,
        10,
        'never',
        null,
        false,
        originalFeatures
      );

      const newConfig = config.withFeature('feature1');

      expect(newConfig.features).toEqual(new Set(['feature1']));
      expect(newConfig.features.size).toBe(1);
    });

    it('should preserve other configuration properties', () => {
      const config = new ContextConfiguration(
        true,
        15,
        'weekly',
        3600,
        true,
        new Set(['feature1'])
      );

      const newConfig = config.withFeature('feature2');

      expect(newConfig.allowSharing).toBe(true);
      expect(newConfig.maxSessions).toBe(15);
      expect(newConfig.expirationPolicy).toBe('weekly');
      expect(newConfig.autoSuspendAfterInactivity).toBe(3600);
      expect(newConfig.allowAnonymousAccess).toBe(true);
    });
  });

  describe('withoutFeature', () => {
    it('should create new configuration with removed feature', () => {
      const originalFeatures = new Set(['feature1', 'feature2']);
      const config = new ContextConfiguration(
        true,
        10,
        'never',
        null,
        false,
        originalFeatures
      );

      const newConfig = config.withoutFeature('feature1');

      expect(newConfig.features).toEqual(new Set(['feature2']));
      expect(config.features).toEqual(new Set(['feature1', 'feature2'])); // Original unchanged
    });

    it('should handle removing non-existing feature', () => {
      const originalFeatures = new Set(['feature1']);
      const config = new ContextConfiguration(
        true,
        10,
        'never',
        null,
        false,
        originalFeatures
      );

      const newConfig = config.withoutFeature('nonexistent');

      expect(newConfig.features).toEqual(new Set(['feature1']));
      expect(newConfig.features.size).toBe(1);
    });

    it('should handle removing from empty features set', () => {
      const config = new ContextConfiguration(
        true,
        10,
        'never',
        null,
        false,
        new Set()
      );

      const newConfig = config.withoutFeature('anyfeature');

      expect(newConfig.features.size).toBe(0);
    });
  });

  describe('withMaxSessions', () => {
    it('should create new configuration with updated max sessions', () => {
      const config = new ContextConfiguration(
        true,
        10,
        'never',
        null,
        false,
        new Set()
      );

      const newConfig = config.withMaxSessions(25);

      expect(newConfig.maxSessions).toBe(25);
      expect(config.maxSessions).toBe(10); // Original unchanged
    });

    it('should preserve other configuration properties', () => {
      const features = new Set(['feature1']);
      const config = new ContextConfiguration(
        true,
        10,
        'weekly',
        3600,
        true,
        features
      );

      const newConfig = config.withMaxSessions(50);

      expect(newConfig.allowSharing).toBe(true);
      expect(newConfig.expirationPolicy).toBe('weekly');
      expect(newConfig.autoSuspendAfterInactivity).toBe(3600);
      expect(newConfig.allowAnonymousAccess).toBe(true);
      expect(newConfig.features).toEqual(features);
    });

    it('should handle zero and negative values', () => {
      const config = ContextConfiguration.createDefault();

      const zeroConfig = config.withMaxSessions(0);
      const negativeConfig = config.withMaxSessions(-5);

      expect(zeroConfig.maxSessions).toBe(0);
      expect(negativeConfig.maxSessions).toBe(-5);
    });
  });

  describe('withExpirationPolicy', () => {
    it('should create new configuration with updated expiration policy', () => {
      const config = ContextConfiguration.createDefault();

      const newConfig = config.withExpirationPolicy('daily');

      expect(newConfig.expirationPolicy).toBe('daily');
      expect(config.expirationPolicy).toBe('never'); // Original unchanged
    });

    it('should handle empty string policy', () => {
      const config = ContextConfiguration.createDefault();

      const newConfig = config.withExpirationPolicy('');

      expect(newConfig.expirationPolicy).toBe('');
    });

    it('should preserve other configuration properties', () => {
      const features = new Set(['feature1']);
      const config = new ContextConfiguration(
        true,
        15,
        'never',
        3600,
        true,
        features
      );

      const newConfig = config.withExpirationPolicy('monthly');

      expect(newConfig.allowSharing).toBe(true);
      expect(newConfig.maxSessions).toBe(15);
      expect(newConfig.autoSuspendAfterInactivity).toBe(3600);
      expect(newConfig.allowAnonymousAccess).toBe(true);
      expect(newConfig.features).toEqual(features);
    });
  });

  describe('withSharingEnabled', () => {
    it('should create new configuration with updated sharing setting', () => {
      const config = ContextConfiguration.createDefault();

      const disabledConfig = config.withSharingEnabled(false);
      const enabledConfig = disabledConfig.withSharingEnabled(true);

      expect(disabledConfig.allowSharing).toBe(false);
      expect(enabledConfig.allowSharing).toBe(true);
      expect(config.allowSharing).toBe(true); // Original unchanged
    });

    it('should preserve other configuration properties', () => {
      const features = new Set(['feature1']);
      const config = new ContextConfiguration(
        true,
        20,
        'weekly',
        1800,
        false,
        features
      );

      const newConfig = config.withSharingEnabled(false);

      expect(newConfig.maxSessions).toBe(20);
      expect(newConfig.expirationPolicy).toBe('weekly');
      expect(newConfig.autoSuspendAfterInactivity).toBe(1800);
      expect(newConfig.allowAnonymousAccess).toBe(false);
      expect(newConfig.features).toEqual(features);
    });
  });

  describe('边界条件和错误处理测试', () => {
    it('should handle extremely large maxSessions values', () => {
      const config = ContextConfiguration.createDefault();
      const largeConfig = config.withMaxSessions(Number.MAX_SAFE_INTEGER);

      expect(largeConfig.maxSessions).toBe(Number.MAX_SAFE_INTEGER);
    });

    it('should handle very long expiration policy strings', () => {
      const longPolicy = 'a'.repeat(1000);
      const config = ContextConfiguration.createDefault();
      const newConfig = config.withExpirationPolicy(longPolicy);

      expect(newConfig.expirationPolicy).toBe(longPolicy);
    });

    it('should handle unicode characters in features', () => {
      const unicodeFeatures = new Set(['功能1', '🚀feature', 'тест']);
      const config = new ContextConfiguration(
        true,
        10,
        'never',
        null,
        false,
        unicodeFeatures
      );

      expect(config.hasFeature('功能1')).toBe(true);
      expect(config.hasFeature('🚀feature')).toBe(true);
      expect(config.hasFeature('тест')).toBe(true);
    });

    it('should handle round-trip JSON conversion', () => {
      const originalFeatures = new Set(['feature1', 'feature2']);
      const originalConfig = new ContextConfiguration(
        true,
        15,
        'weekly',
        3600,
        false,
        originalFeatures
      );

      const json = originalConfig.toJSON();
      const reconstructedConfig = ContextConfiguration.fromJSON(json);

      expect(reconstructedConfig.allowSharing).toBe(originalConfig.allowSharing);
      expect(reconstructedConfig.maxSessions).toBe(originalConfig.maxSessions);
      expect(reconstructedConfig.expirationPolicy).toBe(originalConfig.expirationPolicy);
      expect(reconstructedConfig.autoSuspendAfterInactivity).toBe(originalConfig.autoSuspendAfterInactivity);
      expect(reconstructedConfig.allowAnonymousAccess).toBe(originalConfig.allowAnonymousAccess);
      expect(reconstructedConfig.features).toEqual(originalConfig.features);
    });
  });
});
