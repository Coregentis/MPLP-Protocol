# Extension模块协议规范

> **🌐 语言导航**: [English](../../../en/modules/extension/protocol-specification.md) | [中文](protocol-specification.md)



**多智能体协议生命周期平台 - Extension模块协议规范 v1.0.0-alpha**

[![协议](https://img.shields.io/badge/protocol-Extension%20v1.0-purple.svg)](./README.md)
[![规范](https://img.shields.io/badge/specification-Enterprise%20Grade-green.svg)](./api-reference.md)
[![扩展](https://img.shields.io/badge/extensions-Compliant-orange.svg)](./implementation-guide.md)
[![语言](https://img.shields.io/badge/language-中文-blue.svg)](../../en/modules/extension/protocol-specification.md)

---

## 🎯 协议概览

Extension模块协议定义了企业级扩展管理、能力编排和多智能体系统中动态系统增强的全面消息格式、数据结构和通信模式。该规范确保分布式智能体网络中安全、可扩展和可互操作的可扩展性。

### **协议范围**
- **扩展管理**: 注册、安装、激活和生命周期管理
- **能力编排**: 动态能力发现、调用和负载均衡
- **安全与隔离**: 安全沙箱执行和资源隔离协议
- **集成框架**: 跨模块集成和事件驱动通信
- **市场操作**: 扩展分发、发现和市场协议

### **协议特性**
- **版本**: 1.0.0-alpha
- **传输**: HTTP/HTTPS, gRPC, WebSocket, 消息队列
- **序列化**: JSON, Protocol Buffers, MessagePack
- **安全**: JWT认证, 代码签名, 沙箱隔离
- **合规**: 容器运行时, Kubernetes, OpenAPI兼容

---

## 📋 核心协议消息

### **扩展管理协议**

#### **扩展注册消息**
```json
{
  "message_type": "extension.management.register",
  "protocol_version": "1.0.0-alpha",
  "message_id": "msg-ext-reg-001",
  "timestamp": "2025-09-03T10:00:00.000Z",
  "correlation_id": "corr-ext-001",
  "sender": {
    "sender_id": "extension-publisher-001",
    "sender_type": "extension_publisher",
    "authentication": {
      "method": "jwt",
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "publisher_account": "ai-extensions@mplp.dev"
    }
  },
  "payload": {
    "extension_registration": {
      "extension_id": "ext-ai-assistant-001",
      "extension_name": "AI助手扩展",
      "extension_version": "2.1.0",
      "extension_type": "ai_capability",
      "extension_category": "intelligence",
      "extension_description": "具有自然语言处理和决策支持能力的高级AI助手",
      "publisher_info": {
        "publisher_id": "pub-ai-team-001",
        "publisher_name": "MPLP AI团队",
        "publisher_email": "ai-team@mplp.dev",
        "publisher_website": "https://ai.mplp.dev",
        "verified_publisher": true,
        "trust_level": "verified_partner"
      },
      "extension_manifest": {
        "manifest_version": "1.0",
        "entry_point": "dist/index.js",
        "main_class": "AIAssistantExtension",
        "runtime_requirements": {
          "node_version": ">=18.0.0",
          "mplp_version": ">=1.0.0-alpha",
          "platform": ["linux", "darwin", "win32"],
          "architecture": ["x64", "arm64"]
        },
        "configuration_schema": {
          "$schema": "http://json-schema.org/draft-07/schema#",
          "type": "object",
          "properties": {
            "ai_model": {
              "type": "string",
              "enum": ["gpt-4", "claude-3", "gemini-pro"],
              "default": "gpt-4",
              "description": "用于处理的AI模型"
            },
            "max_tokens": {
              "type": "integer",
              "minimum": 100,
              "maximum": 4000,
              "default": 2000,
              "description": "每个请求的最大令牌数"
            },
            "temperature": {
              "type": "number",
              "minimum": 0,
              "maximum": 2,
              "default": 0.7,
              "description": "AI模型的温度参数"
            },
            "enable_memory": {
              "type": "boolean",
              "default": true,
              "description": "是否启用对话记忆功能"
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
        },
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
      "installation_package": {
        "package_url": "https://packages.mplp.dev/ai-assistant/2.1.0/package.tar.gz",
        "package_checksum": "sha256:a1b2c3d4e5f6...",
        "package_size_bytes": 15728640,
        "signature": {
          "algorithm": "RSA-SHA256",
          "signature": "base64-encoded-signature",
          "certificate": "base64-encoded-certificate"
        }
      },
      "security_profile": {
        "trust_level": "verified",
        "code_signing_verified": true,
        "vulnerability_scan_passed": true,
        "security_rating": "A",
        "compliance_certifications": ["SOC2", "ISO27001"]
      },
      "metadata": {
        "tags": ["ai", "nlp", "decision-support", "automation"],
        "license": "MIT",
        "homepage": "https://extensions.mplp.dev/ai-assistant",
        "repository": "https://github.com/mplp/extensions/ai-assistant",
        "documentation": "https://docs.mplp.dev/extensions/ai-assistant",
        "support_contact": "support@mplp.dev"
      },
      "registered_by": "publisher-admin-001",
      "registered_at": "2025-09-03T10:00:00.000Z"
    }
  }
}
```

#### **扩展注册响应消息**
```json
{
  "message_type": "extension.management.register.response",
  "protocol_version": "1.0.0-alpha",
  "message_id": "msg-ext-reg-response-001",
  "timestamp": "2025-09-03T10:00:02.500Z",
  "correlation_id": "corr-ext-001",
  "sender": {
    "sender_id": "extension-service",
    "sender_type": "system"
  },
  "payload": {
    "extension_registration_result": {
      "status": "success",
      "extension_id": "ext-ai-assistant-001",
      "registration_id": "reg-001",
      "extension_status": "registered",
      "validation_results": {
        "manifest_validation": {
          "status": "passed",
          "validation_time_ms": 150,
          "issues": []
        },
        "security_validation": {
          "status": "passed",
          "validation_time_ms": 800,
          "security_score": 95,
          "vulnerabilities_found": 0,
          "code_signing_verified": true
        },
        "dependency_validation": {
          "status": "passed",
          "validation_time_ms": 300,
          "dependencies_resolved": 2,
          "conflicts": []
        },
        "compatibility_validation": {
          "status": "passed",
          "validation_time_ms": 200,
          "mplp_compatibility": "1.0.0-alpha",
          "platform_compatibility": ["linux", "darwin", "win32"]
        }
      },
      "capabilities_registered": [
        {
          "capability_id": "natural_language_processing",
          "capability_key": "ext-ai-assistant-001:natural_language_processing",
          "registration_status": "active",
          "interfaces_count": 1,
          "methods_count": 4
        },
        {
          "capability_id": "decision_support",
          "capability_key": "ext-ai-assistant-001:decision_support",
          "registration_status": "active",
          "interfaces_count": 1,
          "methods_count": 4
        }
      ],
      "installation_info": {
        "estimated_install_time_seconds": 45,
        "required_restart": false,
        "sandbox_requirements": {
          "sandbox_type": "container",
          "resource_allocation": {
            "memory_mb": 512,
            "cpu_millicores": 200,
            "storage_mb": 1024
          }
        }
      },
      "marketplace_info": {
        "marketplace_url": "https://marketplace.mplp.dev/extensions/ext-ai-assistant-001",
        "publication_status": "pending_review",
        "estimated_review_time_hours": 24
      },
      "registration_time_ms": 2500,
      "registered_at": "2025-09-03T10:00:02.500Z"
    }
  }
}
```

### **能力调用协议**

#### **能力调用请求消息**
```json
{
  "message_type": "extension.capability.invoke",
  "protocol_version": "1.0.0-alpha",
  "message_id": "msg-cap-invoke-001",
  "timestamp": "2025-09-03T10:15:00.000Z",
  "correlation_id": "corr-cap-001",
  "sender": {
    "sender_id": "user-001",
    "sender_type": "human",
    "authentication": {
      "method": "jwt",
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  },
  "payload": {
    "capability_invocation": {
      "capability_id": "ext-ai-assistant-001:natural_language_processing",
      "method": "analyzeText",
      "parameters": {
        "text": "这是一段需要分析的中文文本，包含情感和意图信息。请分析其情感倾向、提取关键实体，并识别用户意图。",
        "analysis_options": {
          "include_sentiment": true,
          "include_entities": true,
          "include_intent": true,
          "include_summary": true,
          "language": "zh-CN"
        },
        "output_format": "detailed"
      },
      "execution_context": {
        "user_id": "user-001",
        "session_id": "session-001",
        "request_id": "req-001",
        "context_data": {
          "conversation_history": [],
          "user_preferences": {
            "language": "zh-CN",
            "detail_level": "high"
          }
        }
      },
      "invocation_options": {
        "timeout_ms": 30000,
        "retry_attempts": 3,
        "enable_caching": true,
        "cache_ttl_seconds": 3600,
        "priority": "normal",
        "async_execution": false
      }
    }
  }
}
```

---

## 🔗 相关文档

- [Extension模块概览](./README.md) - 模块概览和架构
- [API参考](./api-reference.md) - API参考文档
- [配置指南](./configuration-guide.md) - 配置选项详解
- [实施指南](./implementation-guide.md) - 实施指南
- [集成示例](./integration-examples.md) - 集成示例
- [性能指南](./performance-guide.md) - 性能优化
- [测试指南](./testing-guide.md) - 测试策略

---

**协议版本**: 1.0.0-alpha
**最后更新**: 2025年9月3日
**下次审查**: 2025年12月3日
**状态**: 企业级规范

**⚠️ Alpha版本说明**: Extension模块协议规范在Alpha版本中提供企业级协议定义。额外的高级协议功能和扩展将在Beta版本中添加。