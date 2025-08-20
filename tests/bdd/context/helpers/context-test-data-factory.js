/**
 * Context模块BDD测试数据工厂
 * 
 * @version 1.0.0
 * @created 2025-08-15
 */

class ContextTestDataFactory {
  // 生成UUID v4
  static generateUUIDv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // 创建基础context实例
  static createBasicContext() {
    return {
      protocol_version: "1.0.0",
      timestamp: new Date().toISOString(),
      context_id: this.generateUUIDv4(),
      name: "BDD Test Context",
      description: "BDD测试用context实例",
      status: "active",
      lifecycle_stage: "executing"
    };
  }

  // 创建完整context实例
  static createCompleteContext() {
    const basic = this.createBasicContext();
    
    return {
      ...basic,
      shared_state: {
        variables: { test_mode: true },
        resources: { allocated: {}, requirements: {} },
        dependencies: [],
        goals: []
      },
      access_control: {
        owner: { user_id: "bdd-test-user", role: "admin" },
        permissions: []
      },
      configuration: {
        timeout_settings: { default_timeout: 300, max_timeout: 3600, cleanup_timeout: 60 },
        notification_settings: { enabled: true, channels: ["email"], events: ["created"] },
        persistence: { enabled: true, storage_backend: "memory", retention_policy: { duration: "P7D", max_versions: 10 } }
      }
    };
  }

  // 创建测试场景数据
  static createScenarioData(scenarioName) {
    const scenarios = {
      'basic_crud': this.createBasicContext(),
      'complete_instance': this.createCompleteContext(),
      'performance_test': Array.from({ length: 100 }, () => this.createBasicContext())
    };

    return scenarios[scenarioName] || this.createBasicContext();
  }
}

module.exports = { ContextTestDataFactory };