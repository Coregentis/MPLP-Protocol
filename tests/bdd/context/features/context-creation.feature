Feature: 智能体上下文创建
  作为智能体创建者
  我想要创建一个新的上下文环境
  以便智能体可以在其中运行

  Background:
    Given 我是一个已认证的智能体创建者
    And Context模块服务正在运行

  Scenario: 成功创建基础上下文
    Given 我有有效的上下文创建参数
    When 我发送创建上下文的请求
    Then 系统应该返回成功响应
    And 响应应该包含有效的上下文ID
    And 上下文状态应该是"active"
    And 生命周期阶段应该是"planning"

  Scenario: 创建带有共享状态的上下文
    Given 我有包含共享状态的上下文创建参数
      | variables | {"environment": "development", "version": "1.0.0"} |
      | resources | {"memory": "512MB", "cpu": "1 core"}              |
    When 我发送创建上下文的请求
    Then 系统应该返回成功响应
    And 上下文应该包含指定的共享状态
    And 变量"environment"应该等于"development"
    And 资源"memory"应该等于"512MB"

  Scenario: 创建带有访问控制的上下文
    Given 我有包含访问控制的上下文创建参数
      | owner_user_id | "user-123"     |
      | owner_role    | "admin"        |
      | permissions   | ["read", "write"] |
    When 我发送创建上下文的请求
    Then 系统应该返回成功响应
    And 上下文所有者应该是"user-123"
    And 所有者角色应该是"admin"
    And 权限应该包含"read"和"write"

  Scenario: 使用无效参数创建上下文失败
    Given 我有无效的上下文创建参数
      | name        | ""           |
      | description | null         |
    When 我发送创建上下文的请求
    Then 系统应该返回错误响应
    And 错误代码应该是"VALIDATION_ERROR"
    And 错误消息应该包含"name is required"

  Scenario: 创建重复名称的上下文失败
    Given 已存在名为"test-context"的上下文
    And 我有创建同名上下文的参数
    When 我发送创建上下文的请求
    Then 系统应该返回错误响应
    And 错误代码应该是"DUPLICATE_NAME"
    And 错误消息应该包含"Context name already exists"

  Scenario: 验证上下文创建的审计日志
    Given 我有有效的上下文创建参数
    When 我发送创建上下文的请求
    Then 系统应该返回成功响应
    And 应该记录上下文创建的审计日志
    And 审计日志应该包含用户ID和操作时间
    And 审计日志事件类型应该是"CONTEXT_CREATED"
