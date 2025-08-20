Feature: 错误处理和恢复
  作为开发者
  我想要系统能够优雅地处理错误
  以确保系统稳定性

  Background:
    Given Context模块错误处理系统已启用
    And 我有开发者权限

  Scenario: 网络连接错误处理
    Given 上下文依赖外部服务
    When 外部服务不可用
    And 我尝试访问上下文
    Then 系统应该返回适当的错误响应
    And 错误代码应该是"SERVICE_UNAVAILABLE"
    And 系统应该自动重试3次
    And 如果重试失败，应该使用缓存数据
    And 应该记录错误和恢复尝试

  Scenario: 数据库连接错误恢复
    Given 上下文正在使用数据库
    When 数据库连接突然中断
    And 我尝试更新上下文状态
    Then 系统应该检测到连接错误
    And 应该自动尝试重新连接
    And 如果重连成功，操作应该继续
    And 如果重连失败，应该返回明确的错误信息
    And 错误代码应该是"DATABASE_CONNECTION_ERROR"

  Scenario: 内存不足错误处理
    Given 系统内存使用率达到90%
    When 我尝试创建大型上下文
    Then 系统应该检测到内存不足
    And 应该拒绝创建请求
    And 错误代码应该是"INSUFFICIENT_MEMORY"
    And 应该建议减少上下文大小或稍后重试
    And 应该触发内存清理机制

  Scenario: 并发冲突错误处理
    Given 两个用户同时尝试更新同一个上下文
    When 第一个更新成功提交
    And 第二个更新尝试提交
    Then 系统应该检测到并发冲突
    And 第二个更新应该失败
    And 错误代码应该是"CONCURRENT_MODIFICATION"
    And 应该提供冲突解决建议
    And 用户应该能够重新获取最新状态并重试

  Scenario: 数据验证错误处理
    Given 我尝试更新上下文状态
    When 提供的数据不符合Schema要求
      | field | value | error |
      | name  | ""    | "Name cannot be empty" |
      | status | "invalid" | "Invalid status value" |
    Then 系统应该返回验证错误
    And 错误代码应该是"VALIDATION_ERROR"
    And 错误消息应该详细说明每个字段的问题
    And 应该提供正确的数据格式示例

  Scenario: 权限错误的优雅处理
    Given 用户权限在操作过程中被撤销
    When 我正在执行需要权限的操作
    Then 系统应该立即检测到权限变更
    And 应该停止当前操作
    And 错误代码应该是"PERMISSION_REVOKED"
    And 应该提供重新认证的指导
    And 已完成的部分操作应该保持一致性

  Scenario: 系统过载时的降级服务
    Given 系统负载超过80%
    When 大量并发请求到达
    Then 系统应该启用降级模式
    And 非关键功能应该被暂时禁用
    And 关键功能应该继续正常工作
    And 用户应该收到系统繁忙的友好提示
    And 应该记录降级事件和恢复时间

  Scenario: 数据损坏检测和恢复
    Given 上下文数据存储在持久化存储中
    When 检测到数据损坏
    Then 系统应该立即隔离损坏的数据
    And 应该尝试从备份恢复数据
    And 如果恢复成功，应该验证数据完整性
    And 如果恢复失败，应该创建错误报告
    And 应该通知管理员进行人工干预

  Scenario: 错误恢复后的状态一致性验证
    Given 系统从错误状态恢复
    When 恢复过程完成
    Then 系统应该验证所有上下文状态的一致性
    And 应该检查数据完整性
    And 应该验证所有服务的健康状态
    And 如果发现不一致，应该自动修复或报告
    And 应该生成恢复报告供审查
