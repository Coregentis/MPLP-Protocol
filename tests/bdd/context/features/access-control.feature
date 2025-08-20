Feature: 访问控制验证
  作为系统管理员
  我想要控制谁可以访问上下文
  以确保安全性

  Background:
    Given 存在一个上下文"secure-context-001"
    And 上下文所有者是"admin-user"

  Scenario: 所有者完全访问权限
    Given 我是上下文所有者"admin-user"
    When 我尝试读取上下文信息
    Then 系统应该允许访问
    And 我应该能看到完整的上下文信息
    When 我尝试更新上下文配置
    Then 系统应该允许更新
    And 更新应该成功保存

  Scenario: 授权用户有限访问权限
    Given 用户"regular-user"被授予"read"权限
    And 我以"regular-user"身份登录
    When 我尝试读取上下文信息
    Then 系统应该允许访问
    And 我应该能看到基本的上下文信息
    When 我尝试更新上下文配置
    Then 系统应该拒绝访问
    And 错误代码应该是"PERMISSION_DENIED"

  Scenario: 未授权用户访问被拒绝
    Given 用户"unauthorized-user"没有任何权限
    And 我以"unauthorized-user"身份登录
    When 我尝试读取上下文信息
    Then 系统应该拒绝访问
    And 错误代码应该是"ACCESS_DENIED"
    And 应该记录访问拒绝的审计日志

  Scenario: 基于角色的权限验证
    Given 存在角色"developer"具有权限["read", "write"]
    And 存在角色"viewer"具有权限["read"]
    And 用户"dev-user"具有角色"developer"
    And 用户"view-user"具有角色"viewer"
    When "dev-user"尝试更新共享状态
    Then 系统应该允许更新
    When "view-user"尝试更新共享状态
    Then 系统应该拒绝访问
    And 错误代码应该是"INSUFFICIENT_PERMISSIONS"

  Scenario: 条件性权限验证
    Given 用户"conditional-user"有条件权限
      | condition | "time_range" |
      | value     | "09:00-17:00" |
      | actions   | ["read", "write"] |
    And 当前时间是"14:30"
    When 我以"conditional-user"身份尝试访问
    Then 系统应该允许访问
    Given 当前时间是"20:00"
    When 我以"conditional-user"身份尝试访问
    Then 系统应该拒绝访问
    And 错误消息应该包含"Outside allowed time range"

  Scenario: 权限继承和覆盖
    Given 用户"inherit-user"继承自组"data-team"
    And 组"data-team"有权限["read"]
    And 用户"inherit-user"有额外权限["write"]
    When 我以"inherit-user"身份尝试读取数据
    Then 系统应该允许访问
    When 我以"inherit-user"身份尝试写入数据
    Then 系统应该允许访问

  Scenario: 权限撤销和实时生效
    Given 用户"revoke-user"当前有"write"权限
    And 用户正在进行写入操作
    When 管理员撤销"revoke-user"的"write"权限
    Then 权限撤销应该立即生效
    And 用户的后续写入操作应该被拒绝
    And 应该记录权限撤销的审计日志

  Scenario: 批量权限管理
    Given 存在用户组"project-team"包含5个用户
    When 管理员为"project-team"批量授予"read"权限
    Then 所有5个用户都应该获得"read"权限
    And 权限变更应该在30秒内生效
    And 应该为每个用户记录权限变更日志
