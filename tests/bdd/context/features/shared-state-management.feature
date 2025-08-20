Feature: 共享状态管理
  作为智能体运行时
  我想要读取和更新共享状态
  以便与其他组件协作

  Background:
    Given 存在一个活跃的上下文"test-context-001"
    And 我有访问该上下文的权限

  Scenario: 读取共享状态变量
    Given 上下文包含变量"current_task"值为"data_processing"
    When 我请求读取变量"current_task"
    Then 系统应该返回成功响应
    And 变量值应该是"data_processing"

  Scenario: 更新共享状态变量
    Given 上下文包含变量"progress"值为"50%"
    When 我更新变量"progress"为"75%"
    Then 系统应该返回成功响应
    And 变量"progress"的值应该是"75%"
    And 应该记录状态更新的审计日志

  Scenario: 管理资源分配
    Given 上下文有可用资源
      | type   | allocated | available |
      | memory | 256MB     | 512MB     |
      | cpu    | 1 core    | 2 cores   |
    When 我请求分配额外的"memory" "128MB"
    Then 系统应该返回成功响应
    And 已分配的"memory"应该是"384MB"
    And 可用的"memory"应该是"384MB"

  Scenario: 资源分配超限失败
    Given 上下文有有限的可用资源
      | type   | allocated | available |
      | memory | 400MB     | 512MB     |
    When 我请求分配"memory" "200MB"
    Then 系统应该返回错误响应
    And 错误代码应该是"INSUFFICIENT_RESOURCES"
    And 错误消息应该包含"Not enough memory available"

  Scenario: 管理依赖关系
    Given 上下文有现有依赖
      | dependency_id | type     | status |
      | dep-001       | context  | active |
      | dep-002       | plan     | active |
    When 我添加新依赖"dep-003"类型"external"
    Then 系统应该返回成功响应
    And 依赖列表应该包含"dep-003"
    And 依赖"dep-003"的状态应该是"pending"

  Scenario: 设置和验证目标
    Given 上下文没有设置目标
    When 我添加目标"完成数据处理任务"
      | priority | 1 |
      | success_criteria | [{"type": "completion_rate", "value": 100, "operator": ">="}] |
    Then 系统应该返回成功响应
    And 目标列表应该包含"完成数据处理任务"
    And 目标优先级应该是1
    And 成功标准应该包含完成率要求

  Scenario: 并发状态更新冲突处理
    Given 上下文变量"counter"当前值为10
    And 有两个并发的更新请求
    When 第一个请求将"counter"更新为11
    And 第二个请求同时将"counter"更新为12
    Then 系统应该正确处理并发冲突
    And 最终"counter"的值应该是确定的
    And 应该记录冲突解决的审计日志

  Scenario: 状态同步验证
    Given 上下文配置了实时同步策略
    When 我更新共享状态变量"sync_test"为"updated_value"
    Then 系统应该在100毫秒内同步状态
    And 所有订阅者应该收到状态更新通知
    And 同步成功率应该大于99%
