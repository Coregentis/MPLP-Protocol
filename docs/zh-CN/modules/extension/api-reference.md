# Extension模块API参考

> **🌐 语言导航**: [English](../../../en/modules/extension/api-reference.md) | [中文](api-reference.md)



**多智能体协议生命周期平台 - Extension模块API参考 v1.0.0-alpha**

[![API](https://img.shields.io/badge/API-REST%20%7C%20GraphQL%20%7C%20WebSocket-blue.svg)](./protocol-specification.md)
[![模块](https://img.shields.io/badge/module-Extension-purple.svg)](./README.md)
[![扩展](https://img.shields.io/badge/extensions-Enterprise%20Grade-green.svg)](./implementation-guide.md)
[![语言](https://img.shields.io/badge/language-中文-blue.svg)](../../en/modules/extension/api-reference.md)

---

## 🎯 API概览

Extension模块提供全面的REST、GraphQL和WebSocket API，用于企业级扩展管理、插件编排和动态能力增强。所有API都遵循MPLP协议标准并提供高级可扩展性功能。

### **API端点基础URL**
- **REST API**: `https://api.mplp.dev/v1/extensions`
- **GraphQL API**: `https://api.mplp.dev/graphql`
- **WebSocket API**: `wss://api.mplp.dev/ws/extensions`

### **身份验证**
所有API端点都需要使用JWT Bearer令牌进行身份验证：
```http
Authorization: Bearer <jwt-token>
```

---

## 🔧 REST API参考

### **扩展管理端点**

#### **注册扩展**
```http
POST /api/v1/extensions
Content-Type: application/json
Authorization: Bearer <token>

{
  "extension_id": "ext-ai-assistant-001",
  "extension_name": "AI助手扩展",
  "extension_version": "2.1.0",
  "extension_type": "ai_capability",
  "extension_category": "intelligence",
  "extension_description": "具有自然语言处理和决策支持能力的高级AI助手",
  "extension_metadata": {
    "author": "MPLP AI团队",
    "license": "MIT",
    "homepage": "https://extensions.mplp.dev/ai-assistant",
    "repository": "https://github.com/mplp/extensions/ai-assistant",
    "keywords": ["ai", "nlp", "decision-support", "automation"],
    "compatibility": {
      "mplp_version": ">=1.0.0-alpha",
      "node_version": ">=18.0.0",
      "required_modules": ["context", "plan", "confirm"]
    }
  },
  "extension_manifest": {
    "entry_point": "dist/index.js",
    "main_class": "AIAssistantExtension",
    "configuration_schema": {
      "type": "object",
      "properties": {
        "ai_model": {
          "type": "string",
          "enum": ["gpt-4", "claude-3", "gemini-pro"],
          "default": "gpt-4"
        },
        "max_tokens": {
          "type": "integer",
          "minimum": 100,
          "maximum": 4000,
          "default": 2000
        },
        "temperature": {
          "type": "number",
          "minimum": 0,
          "maximum": 2,
          "default": 0.7
        },
        "enable_memory": {
          "type": "boolean",
          "default": true
        }
      },
      "required": ["ai_model"]
    },
    "capabilities": [
      {
        "capability_id": "natural_language_processing",
        "capability_name": "自然语言处理",
        "capability_description": "用于文本分析和理解的高级NLP",
        "capability_version": "2.1.0",
        "interfaces": [
          {
            "interface_name": "ITextAnalyzer",
            "interface_methods": [
              "analyzeText",
              "extractEntities",
              "classifyIntent",
              "generateSummary"
            ]
          }
        ]
      },
      {
        "capability_id": "decision_support",
        "capability_name": "决策支持",
        "capability_description": "基于AI的决策建议和分析",
        "capability_version": "2.1.0",
        "interfaces": [
          {
            "interface_name": "IDecisionSupport",
            "interface_methods": [
              "analyzeOptions",
              "recommendDecision",
              "assessRisk",
              "generateInsights"
            ]
          }
        ]
      }
    ],
    "permissions": {
      "system_access": ["read_context", "write_plans"],
      "network_access": ["external_api"],
      "data_access": ["user_data", "conversation_history"],
      "resource_limits": {
        "memory_mb": 512,
        "cpu_percent": 20,
        "storage_mb": 1024,
        "network_requests_per_minute": 100
      }
    },
    "hooks": {
      "lifecycle": {
        "on_install": "hooks/install.js",
        "on_uninstall": "hooks/uninstall.js",
        "on_enable": "hooks/enable.js",
        "on_disable": "hooks/disable.js",
        "on_update": "hooks/update.js"
      },
      "system_events": {
        "on_context_created": "hooks/context-created.js",
        "on_plan_updated": "hooks/plan-updated.js",
        "on_decision_required": "hooks/decision-required.js"
      }
    }
  },
  "installation_package": {
    "package_url": "https://packages.mplp.dev/ai-assistant/2.1.0/package.tar.gz",
    "package_checksum": "sha256:a1b2c3d4e5f6...",
    "package_size_bytes": 15728640,
    "dependencies": [
      {
        "dependency_id": "@mplp/core",
        "version_range": "^1.0.0",
        "required": true
      },
      {
        "dependency_id": "@mplp/ai-sdk",
        "version_range": "^2.0.0",
        "required": true
      }
    ]
  },
  "created_by": "user-admin-001",
  "created_at": "2025-09-03T10:00:00.000Z"
}
```

**响应示例**:
```json
{
  "status": "success",
  "extension_id": "ext-ai-assistant-001",
  "registration_id": "reg-001",
  "extension_status": "registered",
  "validation_results": {
    "manifest_valid": true,
    "dependencies_resolved": true,
    "permissions_granted": true,
    "security_scan_passed": true
  },
  "installation_info": {
    "estimated_install_time_seconds": 45,
    "required_restart": false,
    "compatibility_warnings": []
  },
  "registered_at": "2025-09-03T10:00:01.500Z"
}
```

#### **获取扩展列表**
```http
GET /api/v1/extensions?status=active&category=intelligence&limit=20&offset=0
Authorization: Bearer <token>
```

**响应示例**:
```json
{
  "extensions": [
    {
      "extension_id": "ext-ai-assistant-001",
      "extension_name": "AI助手扩展",
      "extension_version": "2.1.0",
      "extension_type": "ai_capability",
      "extension_category": "intelligence",
      "extension_status": "active",
      "installation_status": "installed",
      "last_updated": "2025-09-03T10:00:00.000Z",
      "resource_usage": {
        "memory_mb": 256,
        "cpu_percent": 5.2,
        "storage_mb": 512
      },
      "performance_metrics": {
        "uptime_hours": 168,
        "requests_processed": 15420,
        "average_response_time_ms": 150,
        "error_rate_percent": 0.1
      }
    }
  ],
  "pagination": {
    "total_count": 45,
    "current_page": 1,
    "total_pages": 3,
    "has_next": true,
    "has_previous": false
  }
}
```

#### **获取扩展详情**
```http
GET /api/v1/extensions/{extension_id}
Authorization: Bearer <token>
```

**响应示例**:
```json
{
  "extension_id": "ext-ai-assistant-001",
  "extension_name": "AI助手扩展",
  "extension_version": "2.1.0",
  "extension_description": "具有自然语言处理和决策支持能力的高级AI助手",
  "extension_status": "active",
  "installation_info": {
    "installed_at": "2025-09-01T14:30:00.000Z",
    "installed_by": "user-admin-001",
    "installation_path": "/extensions/ai-assistant",
    "configuration": {
      "ai_model": "gpt-4",
      "max_tokens": 2000,
      "temperature": 0.7,
      "enable_memory": true
    }
  },
  "capabilities": [
    {
      "capability_id": "natural_language_processing",
      "capability_name": "自然语言处理",
      "capability_status": "active",
      "api_endpoints": [
        "/api/v1/extensions/ext-ai-assistant-001/nlp/analyze",
        "/api/v1/extensions/ext-ai-assistant-001/nlp/entities",
        "/api/v1/extensions/ext-ai-assistant-001/nlp/intent"
      ]
    }
  ],
  "resource_usage": {
    "current": {
      "memory_mb": 256,
      "cpu_percent": 5.2,
      "storage_mb": 512,
      "network_requests_per_minute": 25
    },
    "limits": {
      "memory_mb": 512,
      "cpu_percent": 20,
      "storage_mb": 1024,
      "network_requests_per_minute": 100
    }
  },
  "health_status": {
    "status": "healthy",
    "last_health_check": "2025-09-03T10:00:00.000Z",
    "uptime_seconds": 604800,
    "error_count_24h": 2,
    "performance_score": 0.95
  }
}
```

#### **安装扩展**
```http
POST /api/v1/extensions/{extension_id}/install
Content-Type: application/json
Authorization: Bearer <token>

{
  "installation_config": {
    "auto_start": true,
    "enable_on_install": true,
    "configuration": {
      "ai_model": "gpt-4",
      "max_tokens": 2000,
      "temperature": 0.7
    }
  },
  "installation_options": {
    "force_reinstall": false,
    "skip_dependencies": false,
    "backup_existing": true
  }
}
```

**响应示例**:
```json
{
  "status": "success",
  "installation_id": "install-001",
  "installation_status": "installing",
  "progress": {
    "current_step": "downloading_package",
    "steps_completed": 2,
    "total_steps": 8,
    "estimated_time_remaining_seconds": 30
  },
  "installation_log_url": "https://api.mplp.dev/v1/extensions/ext-ai-assistant-001/install/install-001/logs"
}
```

#### **启用/禁用扩展**
```http
POST /api/v1/extensions/{extension_id}/enable
Authorization: Bearer <token>

POST /api/v1/extensions/{extension_id}/disable
Authorization: Bearer <token>
```

#### **卸载扩展**
```http
DELETE /api/v1/extensions/{extension_id}
Authorization: Bearer <token>

{
  "uninstall_options": {
    "remove_data": true,
    "backup_configuration": true,
    "force_uninstall": false
  }
}
```

### **扩展配置端点**

#### **获取扩展配置**
```http
GET /api/v1/extensions/{extension_id}/configuration
Authorization: Bearer <token>
```

#### **更新扩展配置**
```http
PUT /api/v1/extensions/{extension_id}/configuration
Content-Type: application/json
Authorization: Bearer <token>

{
  "configuration": {
    "ai_model": "claude-3",
    "max_tokens": 3000,
    "temperature": 0.8,
    "enable_memory": true,
    "custom_settings": {
      "response_style": "professional",
      "language_preference": "zh-CN"
    }
  },
  "apply_immediately": true
}
```

### **扩展执行端点**

#### **调用扩展方法**
```http
POST /api/v1/extensions/{extension_id}/execute
Content-Type: application/json
Authorization: Bearer <token>

{
  "method": "analyzeText",
  "parameters": {
    "text": "这是一段需要分析的中文文本，包含情感和意图信息。",
    "analysis_type": "comprehensive",
    "options": {
      "include_sentiment": true,
      "include_entities": true,
      "include_intent": true
    }
  },
  "execution_context": {
    "user_id": "user-001",
    "session_id": "session-001",
    "request_id": "req-001"
  }
}
```

**响应示例**:
```json
{
  "execution_id": "exec-001",
  "status": "completed",
  "result": {
    "sentiment": {
      "score": 0.7,
      "label": "positive",
      "confidence": 0.85
    },
    "entities": [
      {
        "text": "中文文本",
        "type": "language",
        "confidence": 0.95
      }
    ],
    "intent": {
      "intent": "text_analysis_request",
      "confidence": 0.92
    },
    "summary": "用户请求对中文文本进行综合分析"
  },
  "execution_time_ms": 250,
  "resource_usage": {
    "memory_mb": 45,
    "cpu_ms": 180
  }
}
```

---

## 🔗 相关文档

- [Extension模块概览](./README.md) - 模块概览和架构
- [配置指南](./configuration-guide.md) - 配置选项详解
- [实施指南](./implementation-guide.md) - 实施指南
- [集成示例](./integration-examples.md) - 集成示例
- [性能指南](./performance-guide.md) - 性能优化
- [协议规范](./protocol-specification.md) - 协议规范
- [测试指南](./testing-guide.md) - 测试策略

---

**API版本**: 1.0.0-alpha  
**最后更新**: 2025年9月3日  
**下次审查**: 2025年12月3日  
**状态**: 企业级API  

**⚠️ Alpha版本说明**: Extension模块API在Alpha版本中提供企业级扩展管理功能。额外的高级API功能和GraphQL查询将在Beta版本中添加。
