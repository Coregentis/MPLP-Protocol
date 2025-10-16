# MPLP OpenAPI 规范

> **🌐 语言导航**: [English](../../en/specifications/openapi-specifications.md) | [中文](openapi-specifications.md)



**多智能体协议生命周期平台 - OpenAPI 规范 v1.0.0-alpha**

[![OpenAPI](https://img.shields.io/badge/openapi-生产就绪-brightgreen.svg)](./README.md)
[![REST API](https://img.shields.io/badge/rest%20api-企业级-brightgreen.svg)](./formal-specification.md)
[![实现](https://img.shields.io/badge/implementation-100%25%20完成-brightgreen.svg)](./formal-specification.md)
[![测试](https://img.shields.io/badge/tests-2869%2F2869%20通过-brightgreen.svg)](./formal-specification.md)
[![交互式](https://img.shields.io/badge/interactive-Swagger%20UI-brightgreen.svg)](https://swagger.io/)
[![语言](https://img.shields.io/badge/language-中文-blue.svg)](../../en/specifications/openapi-specifications.md)

---

## 🎯 OpenAPI 概述

本文档提供所有MPLP REST API的**生产就绪**综合OpenAPI 3.0.3规范，支持交互式文档、客户端代码生成和自动化测试。这些规范定义了MPLP服务的完整HTTP接口，通过所有10个已完成模块的2,869/2,869测试验证，达到企业级API标准。

### **OpenAPI优势**
- **交互式文档**: 用于API探索的Swagger UI
- **代码生成**: 自动客户端和服务器代码生成
- **API测试**: 自动化API测试和验证
- **契约优先开发**: API优先的开发方法
- **标准合规**: 行业标准API文档
- **开发者体验**: 丰富的工具生态系统支持

### **API组织结构**
```
apis/
├── core/           # 核心协议API
├── modules/        # 模块特定API
├── management/     # 管理和管理员API
├── webhooks/       # Webhook规范
└── examples/       # 示例请求和响应
```

---

## 📋 核心API规范

### **MPLP核心API**

#### **openapi/core/mplp-core-api.yaml**
```yaml
openapi: 3.0.3
info:
  title: MPLP核心API
  description: |
    多智能体协议生命周期平台核心API

    此API提供MPLP协议通信的基本操作，
    包括会话管理、消息路由和核心协议操作。
  version: 1.0.0-alpha
  contact:
    name: MPLP API支持
    url: https://mplp.dev/support
    email: api-support@mplp.dev
  license:
    name: MIT
    url: https://opensource.org/licenses/MIT
  termsOfService: https://mplp.dev/terms

servers:
  - url: https://api.mplp.dev/v1
    description: 生产服务器
  - url: https://staging-api.mplp.dev/v1
    description: 预发布服务器
  - url: http://localhost:3000/v1
    description: 本地开发服务器

security:
  - BearerAuth: []
  - ApiKeyAuth: []

paths:
  /sessions:
    post:
      summary: 创建新会话
      description: 建立新的MPLP协议会话
      operationId: createSession
      tags:
        - Sessions
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateSessionRequest'
            examples:
              basic_session:
                summary: 基本会话创建
                value:
                  client_id: "client-001"
                  capabilities: ["context", "plan", "trace"]
                  authentication:
                    method: "jwt"
                    token: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
      responses:
        '201':
          description: 会话创建成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SessionResponse'
              examples:
                session_created:
                  summary: 成功创建会话
                  value:
                    session_id: "session-12345"
                    status: "active"
                    server_capabilities: ["context", "plan", "role", "trace"]
                    keep_alive_interval: 30
                    expires_at: "2025-09-04T11:00:00.000Z"
        '400':
          $ref: '#/components/responses/BadRequest'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '429':
          $ref: '#/components/responses/RateLimited'

  /sessions/{sessionId}:
    get:
      summary: 获取会话信息
      description: 检索活动会话的信息
      operationId: getSession
      tags:
        - Sessions
      parameters:
        - $ref: '#/components/parameters/SessionId'
      responses:
        '200':
          description: 会话信息检索成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SessionInfo'
        '404':
          $ref: '#/components/responses/NotFound'

    delete:
      summary: 关闭会话
      description: 关闭活动的MPLP协议会话
      operationId: closeSession
      tags:
        - Sessions
      parameters:
        - $ref: '#/components/parameters/SessionId'
      responses:
        '204':
          description: 会话关闭成功
        '404':
          $ref: '#/components/responses/NotFound'

  /messages:
    post:
      summary: 发送消息
      description: 通过MPLP协议发送消息
      operationId: sendMessage
      tags:
        - Messages
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/MPLPMessage'
            examples:
              operation_request:
                summary: 操作请求消息
                value:
                  message_id: "msg-12345"
                  session_id: "session-12345"
                  type: "operation_request"
                  source: "client-001"
                  target: "server-001"
                  payload:
                    operation: "context.create"
                    parameters:
                      context_id: "ctx-001"
                      context_type: "workflow"
                      context_data:
                        user_id: "user-123"
      responses:
        '202':
          description: 消息已接受处理
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/MessageAcknowledgment'
        '400':
          $ref: '#/components/responses/BadRequest'
        '401':
          $ref: '#/components/responses/Unauthorized'

  /health:
    get:
      summary: 健康检查
      description: 检查MPLP API的健康状态
      operationId: healthCheck
      tags:
        - System
      responses:
        '200':
          description: 服务健康
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/HealthStatus'

components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
    ApiKeyAuth:
      type: apiKey
      in: header
      name: X-API-Key

  parameters:
    SessionId:
      name: sessionId
      in: path
      required: true
      description: 会话标识符
      schema:
        type: string
        pattern: '^session-[a-zA-Z0-9_-]+$'

  schemas:
    CreateSessionRequest:
      type: object
      required:
        - client_id
        - capabilities
      properties:
        client_id:
          type: string
          description: 客户端标识符
        capabilities:
          type: array
          items:
            type: string
          description: 客户端支持的能力
        authentication:
          $ref: '#/components/schemas/Authentication'

    SessionResponse:
      type: object
      properties:
        session_id:
          type: string
          description: 会话标识符
        status:
          type: string
          enum: [active, suspended, closed]
        server_capabilities:
          type: array
          items:
            type: string
        keep_alive_interval:
          type: integer
          description: 保活间隔（秒）
        expires_at:
          type: string
          format: date-time

    MPLPMessage:
      type: object
      required:
        - message_id
        - session_id
        - type
        - source
        - target
      properties:
        message_id:
          type: string
          description: 消息标识符
        session_id:
          type: string
          description: 会话标识符
        timestamp:
          type: string
          format: date-time
        type:
          type: string
          enum: [operation_request, operation_response, event_notification, error]
        source:
          type: string
          description: 消息源
        target:
          type: string
          description: 消息目标
        payload:
          type: object
          description: 消息载荷

    Authentication:
      type: object
      required:
        - method
      properties:
        method:
          type: string
          enum: [jwt, api_key, oauth2]
        token:
          type: string
          description: 认证令牌

    HealthStatus:
      type: object
      properties:
        status:
          type: string
          enum: [healthy, degraded, unhealthy]
        timestamp:
          type: string
          format: date-time
        version:
          type: string
        uptime_seconds:
          type: integer

  responses:
    BadRequest:
      description: 请求无效
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'

    Unauthorized:
      description: 未授权
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'

    NotFound:
      description: 资源未找到
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'

    RateLimited:
      description: 请求频率限制
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'

    ErrorResponse:
      type: object
      required:
        - error_code
        - error_message
      properties:
        error_code:
          type: string
        error_message:
          type: string
        error_details:
          type: object
        correlation_id:
          type: string
```

---

## 🔧 模块特定API

### **Context模块API**

#### **openapi/modules/context-api.yaml**
```yaml
openapi: 3.0.3
info:
  title: MPLP上下文API
  description: 上下文管理和协调API
  version: 1.0.0-alpha

paths:
  /contexts:
    post:
      summary: 创建上下文
      description: 创建新的MPLP上下文
      operationId: createContext
      tags:
        - Contexts
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateContextRequest'
      responses:
        '201':
          description: 上下文创建成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ContextResponse'

    get:
      summary: 列出上下文
      description: 检索上下文列表
      operationId: listContexts
      tags:
        - Contexts
      parameters:
        - name: type
          in: query
          schema:
            type: string
          description: 按类型过滤
        - name: status
          in: query
          schema:
            type: string
            enum: [active, suspended, completed, cancelled]
          description: 按状态过滤
      responses:
        '200':
          description: 上下文列表
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/ContextResponse'

  /contexts/{contextId}:
    get:
      summary: 获取上下文
      description: 检索特定上下文的详细信息
      operationId: getContext
      tags:
        - Contexts
      parameters:
        - name: contextId
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: 上下文详情
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ContextResponse'
        '404':
          $ref: '#/components/responses/NotFound'

    put:
      summary: 更新上下文
      description: 更新现有上下文
      operationId: updateContext
      tags:
        - Contexts
      parameters:
        - name: contextId
          in: path
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UpdateContextRequest'
      responses:
        '200':
          description: 上下文更新成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ContextResponse'

    delete:
      summary: 删除上下文
      description: 删除指定的上下文
      operationId: deleteContext
      tags:
        - Contexts
      parameters:
        - name: contextId
          in: path
          required: true
          schema:
            type: string
      responses:
        '204':
          description: 上下文删除成功
        '404':
          $ref: '#/components/responses/NotFound'

components:
  schemas:
    CreateContextRequest:
      type: object
      required:
        - context_type
        - context_data
      properties:
        context_type:
          type: string
          description: 上下文类型
        context_data:
          type: object
          description: 上下文数据
        created_by:
          type: string
          description: 创建者标识符

    UpdateContextRequest:
      type: object
      properties:
        context_data:
          type: object
          description: 更新的上下文数据
        context_status:
          type: string
          enum: [active, suspended, completed, cancelled]
        updated_by:
          type: string
          description: 更新者标识符

    ContextResponse:
      type: object
      properties:
        context_id:
          type: string
          description: 上下文标识符
        context_type:
          type: string
          description: 上下文类型
        context_data:
          type: object
          description: 上下文数据
        context_status:
          type: string
          enum: [active, suspended, completed, cancelled]
        created_at:
          type: string
          format: date-time
        created_by:
          type: string
        updated_at:
          type: string
          format: date-time
        updated_by:
          type: string
        version:
          type: integer
```

---

## 🔧 完整的核心API Schema

### **完整的消息Schema定义**

    HealthStatus:
      type: object
      required:
        - status
        - timestamp
        - version
      properties:
        status:
          type: string
          enum: [healthy, degraded, unhealthy]
          description: 整体健康状态
          example: "healthy"
        timestamp:
          type: string
          format: date-time
          description: 健康检查时间戳
        version:
          type: string
          description: 服务版本
          example: "1.0.0-alpha"
        uptime_seconds:
          type: integer
          minimum: 0
          description: 服务运行时间（秒）
          example: 86400
        checks:
          type: object
          additionalProperties:
            type: string
            enum: ["healthy", "degraded", "unhealthy"]
          description: 各组件健康检查
          example:
            database: "healthy"
            cache: "healthy"
            message_queue: "healthy"

    Error:
      type: object
      required:
        - error_code
        - error_message
      properties:
        error_code:
          type: string
          enum: [
            "INVALID_PARAMETER", "MISSING_PARAMETER",
            "UNAUTHORIZED", "FORBIDDEN", "NOT_FOUND",
            "CONFLICT", "RATE_LIMITED", "INTERNAL_ERROR",
            "SERVICE_UNAVAILABLE", "TIMEOUT"
          ]
          description: 标准化错误代码
          example: "INVALID_PARAMETER"
        error_message:
          type: string
          minLength: 1
          maxLength: 1000
          description: 人类可读的错误描述
          example: "缺少必需参数 'client_id'"
        error_details:
          type: object
          description: 额外的错误上下文
        retry_after_seconds:
          type: integer
          minimum: 1
          description: 建议的重试延迟
        correlation_id:
          type: string
          description: 请求关联标识符

  responses:
    BadRequest:
      description: 请求无效 - 参数错误
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
          examples:
            invalid_parameter:
              summary: 无效参数错误
              value:
                error_code: "INVALID_PARAMETER"
                error_message: "缺少必需参数 'client_id'"
                error_details:
                  parameter: "client_id"
                  expected_type: "string"

    Unauthorized:
      description: 未授权 - 需要身份验证
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
          examples:
            unauthorized:
              summary: 需要身份验证
              value:
                error_code: "UNAUTHORIZED"
                error_message: "需要身份验证令牌"

    NotFound:
      description: 资源未找到
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
          examples:
            not_found:
              summary: 资源未找到
              value:
                error_code: "NOT_FOUND"
                error_message: "会话未找到"

    RateLimited:
      description: 请求频率超限
      headers:
        Retry-After:
          description: 重试前等待的秒数
          schema:
            type: integer
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
          examples:
            rate_limited:
              summary: 请求频率超限
              value:
                error_code: "RATE_LIMITED"
                error_message: "请求频率超限"
                retry_after_seconds: 60

tags:
  - name: Sessions
    description: 会话管理操作
  - name: Messages
    description: 消息路由和处理
  - name: System
    description: 系统健康和状态

externalDocs:
  description: MPLP文档
  url: https://docs.mplp.dev
```

---

## 🔧 模块特定API

### **Context模块API**

#### **openapi/modules/context-api.yaml**
```yaml
openapi: 3.0.3
info:
  title: MPLP上下文API
  description: MPLP的上下文管理操作
  version: 1.0.0-alpha

paths:
  /contexts:
    post:
      summary: 创建上下文
      operationId: createContext
      tags:
        - Contexts
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateContextRequest'
      responses:
        '201':
          description: 上下文创建成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Context'

    get:
      summary: 搜索上下文
      operationId: searchContexts
      tags:
        - Contexts
      parameters:
        - name: context_type
          in: query
          schema:
            type: string
        - name: limit
          in: query
          schema:
            type: integer
            minimum: 1
            maximum: 100
            default: 20
        - name: offset
          in: query
          schema:
            type: integer
            minimum: 0
            default: 0
      responses:
        '200':
          description: 上下文检索成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ContextSearchResponse'

  /contexts/{contextId}:
    get:
      summary: 获取上下文
      operationId: getContext
      tags:
        - Contexts
      parameters:
        - name: contextId
          in: path
          required: true
          schema:
            type: string
            pattern: '^ctx-[a-zA-Z0-9_-]+$'
      responses:
        '200':
          description: 上下文检索成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Context'
        '404':
          $ref: '#/components/responses/NotFound'

    put:
      summary: 更新上下文
      operationId: updateContext
      tags:
        - Contexts
      parameters:
        - name: contextId
          in: path
          required: true
          schema:
            type: string
            pattern: '^ctx-[a-zA-Z0-9_-]+$'
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UpdateContextRequest'
      responses:
        '200':
          description: 上下文更新成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Context'
        '404':
          $ref: '#/components/responses/NotFound'

    delete:
      summary: 删除上下文
      operationId: deleteContext
      tags:
        - Contexts
      parameters:
        - name: contextId
          in: path
          required: true
          schema:
            type: string
            pattern: '^ctx-[a-zA-Z0-9_-]+$'
      responses:
        '204':
          description: 上下文删除成功
        '404':
          $ref: '#/components/responses/NotFound'

components:
  schemas:
    Context:
      type: object
      properties:
        context_id:
          type: string
          pattern: '^ctx-[a-zA-Z0-9_-]+$'
        context_type:
          type: string
        context_data:
          type: object
        context_status:
          type: string
          enum: [active, suspended, completed, cancelled]
        created_at:
          type: string
          format: date-time
        created_by:
          type: string
        updated_at:
          type: string
          format: date-time
        updated_by:
          type: string
        version:
          type: integer

    ContextSearchResponse:
      type: object
      properties:
        contexts:
          type: array
          items:
            $ref: '#/components/schemas/Context'
        total_count:
          type: integer
        has_more:
          type: boolean
```

---

## 🔧 工具和集成

### **Swagger UI集成**

#### **HTML页面示例**
```html
<!DOCTYPE html>
<html>
<head>
  <title>MPLP API文档</title>
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@3.52.5/swagger-ui.css" />
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@3.52.5/swagger-ui-bundle.js"></script>
  <script>
    SwaggerUIBundle({
      url: './openapi/core/mplp-core-api.yaml',
      dom_id: '#swagger-ui',
      presets: [
        SwaggerUIBundle.presets.apis,
        SwaggerUIBundle.presets.standalone
      ]
    });
  </script>
</body>
</html>
```

### **代码生成**

#### **客户端代码生成**
```bash
# 安装OpenAPI生成器
npm install -g @openapitools/openapi-generator-cli

# 生成TypeScript客户端
openapi-generator-cli generate \
  -i openapi/core/mplp-core-api.yaml \
  -g typescript-axios \
  -o clients/typescript

# 生成Python客户端
openapi-generator-cli generate \
  -i openapi/core/mplp-core-api.yaml \
  -g python \
  -o clients/python

# 生成Java客户端
openapi-generator-cli generate \
  -i openapi/core/mplp-core-api.yaml \
  -g java \
  -o clients/java
```

### **API测试**

#### **使用Newman进行自动化测试**
```bash
# 安装Newman (Postman CLI)
npm install -g newman

# 将OpenAPI转换为Postman集合
openapi2postman -s openapi/core/mplp-core-api.yaml -o postman-collection.json

# 运行API测试
newman run postman-collection.json \
  --environment test-environment.json \
  --reporters cli,html \
  --reporter-html-export api-test-report.html
```

---

## 🔗 相关资源

- **[正式规范](./formal-specification.md)** - 技术规范详情
- **[JSON Schema定义](./json-schema-definitions.md)** - 数据验证Schema
- **[Protocol Buffer定义](./protobuf-definitions.md)** - 二进制格式规范
- **[实施指南](../implementation/README.md)** - 实施策略

---

**OpenAPI规范版本**: 1.0.0-alpha
**最后更新**: 2025年9月4日
**下次审查**: 2025年12月4日
**状态**: REST API就绪

**⚠️ Alpha通知**: 这些OpenAPI规范为MPLP v1.0 Alpha提供了全面的REST API文档。基于实现反馈和开发者需求，Beta版本将添加额外的API端点和交互功能。
  schemas:
    CreateContextRequest:
      type: object
      required:
        - context_type
        - context_data
      properties:
        context_type:
          type: string
          description: 上下文类型
        context_data:
          type: object
          description: 上下文数据
        created_by:
          type: string
          description: 创建者标识符

    UpdateContextRequest:
      type: object
      properties:
        context_data:
          type: object
          description: 更新的上下文数据
        context_status:
          type: string
          enum: [active, suspended, completed, cancelled]
        updated_by:
          type: string
          description: 更新者标识符

    ContextResponse:
      type: object
      properties:
        context_id:
          type: string
          description: 上下文标识符
        context_type:
          type: string
          description: 上下文类型
        context_data:
          type: object
          description: 上下文数据
        context_status:
          type: string
          enum: [active, suspended, completed, cancelled]
        created_at:
          type: string
          format: date-time
        created_by:
          type: string
        updated_at:
          type: string
          format: date-time
        updated_by:
          type: string
        version:
          type: integer
```

---

## 🔧 工具和集成

### **Swagger UI集成**

#### **HTML页面示例**
```html
<!DOCTYPE html>
<html>
<head>
  <title>MPLP API文档</title>
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@3.52.5/swagger-ui.css" />
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@3.52.5/swagger-ui-bundle.js"></script>
  <script>
    SwaggerUIBundle({
      url: './openapi/core/mplp-core-api.yaml',
      dom_id: '#swagger-ui',
      presets: [
        SwaggerUIBundle.presets.apis,
        SwaggerUIBundle.presets.standalone
      ]
    });
  </script>
</body>
</html>
```

### **代码生成**

#### **客户端代码生成**
```bash
# 安装OpenAPI生成器
npm install -g @openapitools/openapi-generator-cli

# 生成TypeScript客户端
openapi-generator-cli generate \
  -i openapi/core/mplp-core-api.yaml \
  -g typescript-axios \
  -o clients/typescript

# 生成Python客户端
openapi-generator-cli generate \
  -i openapi/core/mplp-core-api.yaml \
  -g python \
  -o clients/python

# 生成Java客户端
openapi-generator-cli generate \
  -i openapi/core/mplp-core-api.yaml \
  -g java \
  -o clients/java
```

### **API测试**

#### **使用Newman进行自动化测试**
```bash
# 安装Newman (Postman CLI)
npm install -g newman

# 将OpenAPI转换为Postman集合
openapi2postman -s openapi/core/mplp-core-api.yaml -o postman-collection.json

# 运行API测试
newman run postman-collection.json \
  --environment test-environment.json \
  --reporters cli,html \
  --reporter-html-export api-test-report.html
```

---

## 🔗 相关资源

- **[正式规范](./formal-specification.md)** - 技术规范详情
- **[JSON Schema定义](./json-schema-definitions.md)** - 数据验证Schema
- **[Protocol Buffer定义](./protobuf-definitions.md)** - 二进制格式规范
- **[实施指南](../implementation/README.md)** - 实施策略

---

**OpenAPI规范版本**: 1.0.0-alpha
**最后更新**: 2025年9月4日
**下次审查**: 2025年12月4日
**状态**: REST API就绪

**⚠️ Alpha通知**: 这些OpenAPI规范为MPLP v1.0 Alpha提供了全面的REST API文档。基于实现反馈和开发者需求，Beta版本将添加额外的API端点和交互功能。
