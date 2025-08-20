Feature: 生命周期管理
  作为运维人员
  我想要监控上下文的生命周期状态
  以确保系统健康

  Background:
    Given Context模块监控服务正在运行
    And 我有运维人员权限

  Scenario: 上下文生命周期状态转换
    Given 存在一个"planning"阶段的上下文
    When 上下文开始执行任务
    Then 生命周期阶段应该转换为"executing"
    And 状态转换应该被记录
    And 转换时间戳应该准确
    When 任务执行完成
    Then 生命周期阶段应该转换为"monitoring"
    When 监控期结束
    Then 生命周期阶段应该转换为"completed"

  Scenario: 无效状态转换被阻止
    Given 存在一个"completed"阶段的上下文
    When 我尝试将状态转换为"planning"
    Then 系统应该拒绝状态转换
    And 错误代码应该是"INVALID_STATE_TRANSITION"
    And 错误消息应该说明允许的转换路径

  Scenario: 上下文健康状态监控
    Given 存在一个活跃的上下文
    When 我请求上下文健康检查
    Then 系统应该返回健康状态报告
    And 报告应该包含以下指标
      | metric                    | status |
      | context_access_latency    | healthy |
      | context_update_latency    | healthy |
      | cache_hit_rate           | healthy |
      | context_sync_success_rate | healthy |
      | context_state_consistency | healthy |

  Scenario: 性能指标收集和报告
    Given 上下文启用了性能监控
    When 系统运行5分钟
    Then 应该收集以下性能指标
      | metric                        | expected_range |
      | context_access_latency_ms     | < 100         |
      | context_update_latency_ms     | < 200         |
      | cache_hit_rate_percent        | > 80          |
      | context_sync_success_rate_percent | > 99      |
      | active_contexts_count         | >= 0          |
      | context_operations_per_second | >= 0          |

  Scenario: 上下文暂停和恢复
    Given 存在一个"executing"阶段的活跃上下文
    When 运维人员暂停上下文
    Then 上下文状态应该变为"suspended"
    And 所有正在进行的操作应该被优雅地停止
    And 状态应该被持久化保存
    When 运维人员恢复上下文
    Then 上下文状态应该恢复为"active"
    And 之前的状态应该被正确恢复
    And 操作应该从暂停点继续

  Scenario: 上下文终止和清理
    Given 存在一个需要终止的上下文
    When 运维人员发起上下文终止
    Then 系统应该开始优雅关闭流程
    And 所有资源应该被释放
    And 临时数据应该被清理
    And 重要数据应该被归档
    And 上下文状态应该变为"terminated"
    And 终止操作应该在60秒内完成

  Scenario: 批量上下文状态查询
    Given 系统中存在10个不同状态的上下文
    When 运维人员查询所有上下文状态
    Then 系统应该返回状态统计
    And 响应时间应该少于5秒
    And 统计应该包含每种状态的数量
    And 统计应该包含总体健康度评分

  Scenario: 自动故障检测和恢复
    Given 上下文配置了自动故障检测
    When 上下文出现连续3次健康检查失败
    Then 系统应该自动触发故障恢复流程
    And 应该尝试重启相关服务
    And 应该发送故障告警通知
    And 如果恢复成功，状态应该恢复正常
    And 如果恢复失败，应该标记为"failed"状态
