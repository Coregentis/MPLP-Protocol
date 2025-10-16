# Extension Module API Reference

> **🌐 Language Navigation**: [English](api-reference.md) | [中文](../../../zh-CN/modules/extension/api-reference.md)



**Multi-Agent Protocol Lifecycle Platform - Extension Module API Reference v1.0.0-alpha**

[![API](https://img.shields.io/badge/API-REST%20%7C%20GraphQL%20%7C%20WebSocket-blue.svg)](./protocol-specification.md)
[![Module](https://img.shields.io/badge/module-Extension-purple.svg)](./README.md)
[![Extensions](https://img.shields.io/badge/extensions-Enterprise%20Grade-green.svg)](./implementation-guide.md)
[![Language](https://img.shields.io/badge/language-English-blue.svg)](../../zh-CN/modules/extension/api-reference.md)

---

## 🎯 API Overview

The Extension Module provides comprehensive REST, GraphQL, and WebSocket APIs for enterprise-grade extension management, plugin orchestration, and dynamic capability enhancement. All APIs follow MPLP protocol standards and provide advanced extensibility features.

### **API Endpoints Base URLs**
- **REST API**: `https://api.mplp.dev/v1/extensions`
- **GraphQL API**: `https://api.mplp.dev/graphql`
- **WebSocket API**: `wss://api.mplp.dev/ws/extensions`

### **Authentication**
All API endpoints require authentication using JWT Bearer tokens:
```http
Authorization: Bearer <jwt-token>
```

---

## 🔧 REST API Reference

### **Extension Management Endpoints**

#### **Register Extension**
```http
POST /api/v1/extensions
Content-Type: application/json
Authorization: Bearer <token>

{
  "extension_id": "ext-ai-assistant-001",
  "extension_name": "AI Assistant Extension",
  "extension_version": "2.1.0",
  "extension_type": "ai_capability",
  "extension_category": "intelligence",
  "extension_description": "Advanced AI assistant with natural language processing and decision support capabilities",
  "extension_metadata": {
    "author": "MPLP AI Team",
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
        "capability_name": "Natural Language Processing",
        "capability_description": "Advanced NLP for text analysis and understanding",
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
        "capability_name": "Decision Support",
        "capability_description": "AI-powered decision recommendations and analysis",
        "capability_version": "2.1.0",
        "interfaces": [
          {
            "interface_name": "IDecisionSupport",
            "interface_methods": [
              "analyzeOptions",
              "recommendDecision",
              "assessRisk",
              "predictOutcome"
            ]
          }
        ]
      }
    ],
    "dependencies": [
      {
        "dependency_name": "@openai/openai",
        "dependency_version": "^4.0.0",
        "dependency_type": "runtime"
      },
      {
        "dependency_name": "@mplp/core",
        "dependency_version": "^1.0.0-alpha",
        "dependency_type": "peer"
      }
    ],
    "resources": {
      "cpu_limit": "1000m",
      "memory_limit": "2Gi",
      "storage_limit": "10Gi",
      "network_policies": ["allow_external_ai_apis"]
    },
    "security": {
      "permissions": [
        "context:read",
        "plan:read",
        "confirm:read",
        "trace:write"
      ],
      "sandbox_enabled": true,
      "network_access": "restricted",
      "file_system_access": "read_only"
    }
  },
  "installation_package": {
    "package_type": "npm",
    "package_url": "https://registry.npmjs.org/@mplp/extension-ai-assistant/-/extension-ai-assistant-2.1.0.tgz",
    "package_checksum": "sha256:1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z",
    "package_size_bytes": 15728640,
    "signature": "rsa-sha256:signature_data_here"
  },
  "lifecycle_hooks": {
    "pre_install": "scripts/pre-install.js",
    "post_install": "scripts/post-install.js",
    "pre_activate": "scripts/pre-activate.js",
    "post_activate": "scripts/post-activate.js",
    "pre_deactivate": "scripts/pre-deactivate.js",
    "post_deactivate": "scripts/post-deactivate.js",
    "pre_uninstall": "scripts/pre-uninstall.js",
    "post_uninstall": "scripts/post-uninstall.js"
  }
}
```

**Response (201 Created):**
```json
{
  "extension_id": "ext-ai-assistant-001",
  "extension_name": "AI Assistant Extension",
  "extension_version": "2.1.0",
  "registration_status": "registered",
  "registration_timestamp": "2025-09-03T10:00:00.000Z",
  "extension_status": "inactive",
  "installation_status": "pending",
  "validation_results": {
    "manifest_valid": true,
    "dependencies_resolved": true,
    "security_approved": true,
    "compatibility_verified": true,
    "package_integrity_verified": true
  },
  "assigned_resources": {
    "extension_namespace": "mplp-ext-ai-assistant-001",
    "storage_path": "/var/lib/mplp/extensions/ext-ai-assistant-001",
    "log_path": "/var/log/mplp/extensions/ext-ai-assistant-001.log",
    "config_path": "/etc/mplp/extensions/ext-ai-assistant-001.yaml"
  },
  "security_context": {
    "sandbox_id": "sandbox-ext-ai-assistant-001",
    "permission_set": "ai_capability_permissions",
    "network_policy": "restricted_external_access",
    "resource_limits": {
      "cpu": "1000m",
      "memory": "2Gi",
      "storage": "10Gi"
    }
  },
  "next_steps": [
    "install_extension",
    "configure_extension",
    "activate_extension"
  ]
}
```

#### **Install Extension**
```http
POST /api/v1/extensions/{extension_id}/install
Content-Type: application/json
Authorization: Bearer <token>

{
  "installation_options": {
    "install_dependencies": true,
    "verify_signatures": true,
    "run_security_scan": true,
    "create_sandbox": true,
    "setup_monitoring": true
  },
  "configuration": {
    "ai_model": "gpt-4",
    "max_tokens": 2000,
    "temperature": 0.7,
    "enable_memory": true,
    "api_keys": {
      "openai_api_key": "${OPENAI_API_KEY}",
      "anthropic_api_key": "${ANTHROPIC_API_KEY}"
    },
    "custom_settings": {
      "response_format": "structured",
      "enable_streaming": true,
      "cache_responses": true,
      "log_level": "info"
    }
  },
  "deployment_target": {
    "environment": "production",
    "region": "us-east-1",
    "availability_zone": "us-east-1a",
    "node_selector": {
      "node_type": "extension_worker",
      "gpu_enabled": false
    }
  }
}
```

**Response (200 OK):**
```json
{
  "extension_id": "ext-ai-assistant-001",
  "installation_id": "install-001",
  "installation_status": "installing",
  "installation_progress": {
    "current_step": "downloading_package",
    "completed_steps": 2,
    "total_steps": 8,
    "progress_percentage": 25,
    "estimated_completion": "2025-09-03T10:05:00.000Z"
  },
  "installation_steps": [
    {
      "step_name": "validate_manifest",
      "step_status": "completed",
      "step_duration_ms": 150,
      "step_result": "success"
    },
    {
      "step_name": "verify_dependencies",
      "step_status": "completed",
      "step_duration_ms": 2300,
      "step_result": "success"
    },
    {
      "step_name": "download_package",
      "step_status": "in_progress",
      "step_progress_percentage": 65,
      "estimated_completion": "2025-09-03T10:02:30.000Z"
    },
    {
      "step_name": "verify_package_integrity",
      "step_status": "pending"
    },
    {
      "step_name": "security_scan",
      "step_status": "pending"
    },
    {
      "step_name": "create_sandbox",
      "step_status": "pending"
    },
    {
      "step_name": "install_dependencies",
      "step_status": "pending"
    },
    {
      "step_name": "configure_extension",
      "step_status": "pending"
    }
  ],
  "resource_allocation": {
    "sandbox_id": "sandbox-ext-ai-assistant-001",
    "namespace": "mplp-ext-ai-assistant-001",
    "storage_allocated": "10Gi",
    "cpu_allocated": "1000m",
    "memory_allocated": "2Gi"
  },
  "monitoring": {
    "metrics_endpoint": "/metrics/extensions/ext-ai-assistant-001",
    "logs_endpoint": "/logs/extensions/ext-ai-assistant-001",
    "health_check_endpoint": "/health/extensions/ext-ai-assistant-001"
  }
}
```

#### **Activate Extension**
```http
POST /api/v1/extensions/{extension_id}/activate
Content-Type: application/json
Authorization: Bearer <token>

{
  "activation_options": {
    "start_immediately": true,
    "enable_monitoring": true,
    "register_capabilities": true,
    "setup_integrations": true
  },
  "integration_targets": [
    {
      "target_module": "context",
      "integration_type": "capability_provider",
      "integration_config": {
        "provide_capabilities": ["text_analysis", "entity_extraction"],
        "event_subscriptions": ["context_created", "participant_added"]
      }
    },
    {
      "target_module": "plan",
      "integration_type": "decision_support",
      "integration_config": {
        "provide_capabilities": ["plan_optimization", "risk_assessment"],
        "event_subscriptions": ["plan_created", "objective_updated"]
      }
    },
    {
      "target_module": "confirm",
      "integration_type": "approval_assistant",
      "integration_config": {
        "provide_capabilities": ["decision_recommendation", "risk_analysis"],
        "event_subscriptions": ["approval_requested", "decision_pending"]
      }
    }
  ],
  "runtime_configuration": {
    "auto_scaling": {
      "enabled": true,
      "min_instances": 1,
      "max_instances": 5,
      "target_cpu_utilization": 70
    },
    "health_checks": {
      "enabled": true,
      "check_interval_seconds": 30,
      "timeout_seconds": 10,
      "failure_threshold": 3
    },
    "logging": {
      "level": "info",
      "format": "json",
      "output": "stdout"
    }
  }
}
```

**Response (200 OK):**
```json
{
  "extension_id": "ext-ai-assistant-001",
  "activation_id": "activate-001",
  "activation_status": "activated",
  "activation_timestamp": "2025-09-03T10:05:30.000Z",
  "extension_status": "active",
  "runtime_info": {
    "instance_id": "ext-ai-assistant-001-instance-001",
    "process_id": 12345,
    "start_time": "2025-09-03T10:05:30.000Z",
    "memory_usage_mb": 256,
    "cpu_usage_percent": 15.2,
    "status": "healthy"
  },
  "registered_capabilities": [
    {
      "capability_id": "natural_language_processing",
      "capability_status": "active",
      "interface_endpoints": {
        "ITextAnalyzer": "/api/v1/extensions/ext-ai-assistant-001/text-analyzer"
      }
    },
    {
      "capability_id": "decision_support",
      "capability_status": "active",
      "interface_endpoints": {
        "IDecisionSupport": "/api/v1/extensions/ext-ai-assistant-001/decision-support"
      }
    }
  ],
  "active_integrations": [
    {
      "target_module": "context",
      "integration_status": "active",
      "provided_capabilities": ["text_analysis", "entity_extraction"],
      "subscribed_events": ["context_created", "participant_added"]
    },
    {
      "target_module": "plan",
      "integration_status": "active",
      "provided_capabilities": ["plan_optimization", "risk_assessment"],
      "subscribed_events": ["plan_created", "objective_updated"]
    },
    {
      "target_module": "confirm",
      "integration_status": "active",
      "provided_capabilities": ["decision_recommendation", "risk_analysis"],
      "subscribed_events": ["approval_requested", "decision_pending"]
    }
  ],
  "monitoring": {
    "health_status": "healthy",
    "metrics_available": true,
    "logs_available": true,
    "alerts_configured": true
  }
}
```

### **Extension Capability Endpoints**

#### **Invoke Extension Capability**
```http
POST /api/v1/extensions/{extension_id}/capabilities/{capability_id}/invoke
Content-Type: application/json
Authorization: Bearer <token>

{
  "method": "analyzeText",
  "parameters": {
    "text": "The quarterly budget proposal requires immediate review and approval from the finance team. The proposed allocation includes $500,000 for marketing initiatives, $300,000 for technology upgrades, and $200,000 for operational improvements. Risk factors include market volatility and potential supply chain disruptions.",
    "analysis_type": "comprehensive",
    "include_sentiment": true,
    "include_entities": true,
    "include_summary": true,
    "language": "en"
  },
  "context": {
    "context_id": "ctx-budget-review-001",
    "user_id": "user-001",
    "session_id": "sess-001",
    "request_id": "req-001"
  },
  "options": {
    "timeout_ms": 30000,
    "cache_result": true,
    "trace_execution": true
  }
}
```

**Response (200 OK):**
```json
{
  "capability_id": "natural_language_processing",
  "method": "analyzeText",
  "execution_id": "exec-001",
  "execution_status": "completed",
  "execution_time_ms": 1250,
  "result": {
    "analysis_summary": {
      "text_length": 312,
      "sentence_count": 3,
      "word_count": 52,
      "language": "en",
      "confidence": 0.98
    },
    "sentiment_analysis": {
      "overall_sentiment": "neutral",
      "sentiment_score": 0.15,
      "confidence": 0.87,
      "sentiment_distribution": {
        "positive": 0.25,
        "neutral": 0.65,
        "negative": 0.10
      }
    },
    "entity_extraction": {
      "entities": [
        {
          "entity": "quarterly budget proposal",
          "entity_type": "document",
          "confidence": 0.95,
          "start_position": 4,
          "end_position": 28
        },
        {
          "entity": "finance team",
          "entity_type": "organization",
          "confidence": 0.92,
          "start_position": 75,
          "end_position": 87
        },
        {
          "entity": "$500,000",
          "entity_type": "money",
          "confidence": 0.99,
          "start_position": 125,
          "end_position": 133,
          "normalized_value": 500000,
          "currency": "USD"
        },
        {
          "entity": "marketing initiatives",
          "entity_type": "business_category",
          "confidence": 0.88,
          "start_position": 138,
          "end_position": 159
        },
        {
          "entity": "$300,000",
          "entity_type": "money",
          "confidence": 0.99,
          "start_position": 161,
          "end_position": 169,
          "normalized_value": 300000,
          "currency": "USD"
        },
        {
          "entity": "technology upgrades",
          "entity_type": "business_category",
          "confidence": 0.91,
          "start_position": 174,
          "end_position": 193
        },
        {
          "entity": "$200,000",
          "entity_type": "money",
          "confidence": 0.99,
          "start_position": 199,
          "end_position": 207,
          "normalized_value": 200000,
          "currency": "USD"
        }
      ],
      "total_entities": 7,
      "entity_categories": ["document", "organization", "money", "business_category"]
    },
    "text_summary": {
      "summary": "A quarterly budget proposal requesting $1M total allocation across marketing ($500K), technology ($300K), and operations ($200K), with identified risks including market volatility and supply chain issues.",
      "key_points": [
        "Budget proposal requires finance team approval",
        "Total allocation: $1,000,000 across three categories",
        "Marketing receives largest allocation at $500,000",
        "Risk factors identified: market volatility, supply chain disruptions"
      ],
      "summary_length": 156,
      "compression_ratio": 0.5
    },
    "intent_classification": {
      "primary_intent": "budget_approval_request",
      "confidence": 0.94,
      "secondary_intents": [
        {
          "intent": "financial_planning",
          "confidence": 0.78
        },
        {
          "intent": "risk_assessment",
          "confidence": 0.65
        }
      ]
    },
    "metadata": {
      "processing_model": "gpt-4",
      "model_version": "gpt-4-0613",
      "processing_time_ms": 1250,
      "tokens_used": 156,
      "cost_usd": 0.0234
    }
  },
  "trace_info": {
    "trace_id": "trace-ext-001",
    "span_id": "span-ext-001",
    "parent_span_id": "span-req-001"
  },
  "cache_info": {
    "cache_hit": false,
    "cache_key": "nlp_analyze_text_sha256:abc123...",
    "cached": true,
    "cache_ttl_seconds": 3600
  }
}
```

#### **Get Extension Capabilities**
```http
GET /api/v1/extensions/{extension_id}/capabilities
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "extension_id": "ext-ai-assistant-001",
  "extension_name": "AI Assistant Extension",
  "extension_version": "2.1.0",
  "extension_status": "active",
  "capabilities": [
    {
      "capability_id": "natural_language_processing",
      "capability_name": "Natural Language Processing",
      "capability_description": "Advanced NLP for text analysis and understanding",
      "capability_version": "2.1.0",
      "capability_status": "active",
      "interfaces": [
        {
          "interface_name": "ITextAnalyzer",
          "interface_description": "Text analysis and processing interface",
          "methods": [
            {
              "method_name": "analyzeText",
              "method_description": "Comprehensive text analysis including sentiment, entities, and summary",
              "parameters": [
                {
                  "parameter_name": "text",
                  "parameter_type": "string",
                  "parameter_required": true,
                  "parameter_description": "Text to analyze"
                },
                {
                  "parameter_name": "analysis_type",
                  "parameter_type": "string",
                  "parameter_required": false,
                  "parameter_default": "standard",
                  "parameter_enum": ["basic", "standard", "comprehensive"],
                  "parameter_description": "Level of analysis to perform"
                },
                {
                  "parameter_name": "include_sentiment",
                  "parameter_type": "boolean",
                  "parameter_required": false,
                  "parameter_default": true,
                  "parameter_description": "Include sentiment analysis in results"
                }
              ],
              "return_type": "TextAnalysisResult",
              "endpoint": "/api/v1/extensions/ext-ai-assistant-001/capabilities/natural_language_processing/invoke"
            },
            {
              "method_name": "extractEntities",
              "method_description": "Extract named entities from text",
              "parameters": [
                {
                  "parameter_name": "text",
                  "parameter_type": "string",
                  "parameter_required": true
                },
                {
                  "parameter_name": "entity_types",
                  "parameter_type": "array",
                  "parameter_items_type": "string",
                  "parameter_required": false,
                  "parameter_description": "Specific entity types to extract"
                }
              ],
              "return_type": "EntityExtractionResult",
              "endpoint": "/api/v1/extensions/ext-ai-assistant-001/capabilities/natural_language_processing/invoke"
            }
          ]
        }
      ],
      "performance_metrics": {
        "avg_response_time_ms": 1250,
        "success_rate_percent": 99.2,
        "total_invocations": 15420,
        "error_rate_percent": 0.8,
        "last_24h_invocations": 1240
      }
    },
    {
      "capability_id": "decision_support",
      "capability_name": "Decision Support",
      "capability_description": "AI-powered decision recommendations and analysis",
      "capability_version": "2.1.0",
      "capability_status": "active",
      "interfaces": [
        {
          "interface_name": "IDecisionSupport",
          "interface_description": "Decision support and recommendation interface",
          "methods": [
            {
              "method_name": "analyzeOptions",
              "method_description": "Analyze multiple options and provide comparative analysis",
              "parameters": [
                {
                  "parameter_name": "options",
                  "parameter_type": "array",
                  "parameter_items_type": "DecisionOption",
                  "parameter_required": true,
                  "parameter_description": "List of options to analyze"
                },
                {
                  "parameter_name": "criteria",
                  "parameter_type": "array",
                  "parameter_items_type": "DecisionCriteria",
                  "parameter_required": false,
                  "parameter_description": "Evaluation criteria"
                }
              ],
              "return_type": "OptionsAnalysisResult",
              "endpoint": "/api/v1/extensions/ext-ai-assistant-001/capabilities/decision_support/invoke"
            },
            {
              "method_name": "recommendDecision",
              "method_description": "Provide decision recommendation based on analysis",
              "parameters": [
                {
                  "parameter_name": "context",
                  "parameter_type": "DecisionContext",
                  "parameter_required": true
                },
                {
                  "parameter_name": "preferences",
                  "parameter_type": "DecisionPreferences",
                  "parameter_required": false
                }
              ],
              "return_type": "DecisionRecommendation",
              "endpoint": "/api/v1/extensions/ext-ai-assistant-001/capabilities/decision_support/invoke"
            }
          ]
        }
      ],
      "performance_metrics": {
        "avg_response_time_ms": 2100,
        "success_rate_percent": 98.7,
        "total_invocations": 8920,
        "error_rate_percent": 1.3,
        "last_24h_invocations": 680
      }
    }
  ],
  "total_capabilities": 2,
  "active_capabilities": 2,
  "overall_performance": {
    "avg_response_time_ms": 1675,
    "success_rate_percent": 98.95,
    "total_invocations": 24340,
    "error_rate_percent": 1.05
  }
}
```

---

## 🔍 GraphQL API Reference

### **Schema Definition**

```graphql
type Extension {
  extensionId: ID!
  extensionName: String!
  extensionVersion: String!
  extensionType: ExtensionType!
  extensionCategory: String!
  extensionDescription: String
  extensionStatus: ExtensionStatus!
  installationStatus: InstallationStatus!
  registrationTimestamp: DateTime!
  lastUpdated: DateTime!
  capabilities: [Capability!]!
  integrations: [Integration!]!
  metadata: ExtensionMetadata
  manifest: ExtensionManifest
  runtimeInfo: RuntimeInfo
  performanceMetrics: PerformanceMetrics
}

type Capability {
  capabilityId: ID!
  capabilityName: String!
  capabilityDescription: String
  capabilityVersion: String!
  capabilityStatus: CapabilityStatus!
  interfaces: [CapabilityInterface!]!
  performanceMetrics: CapabilityPerformanceMetrics
}

type CapabilityInterface {
  interfaceName: String!
  interfaceDescription: String
  methods: [InterfaceMethod!]!
  endpoint: String!
}

type InterfaceMethod {
  methodName: String!
  methodDescription: String
  parameters: [MethodParameter!]!
  returnType: String!
  endpoint: String!
}

type Integration {
  integrationId: ID!
  targetModule: String!
  integrationType: IntegrationType!
  integrationStatus: IntegrationStatus!
  providedCapabilities: [String!]!
  subscribedEvents: [String!]!
  configuration: JSON
}

enum ExtensionType {
  AI_CAPABILITY
  DATA_PROCESSOR
  WORKFLOW_ENHANCER
  INTEGRATION_CONNECTOR
  MONITORING_TOOL
  SECURITY_ENHANCER
  CUSTOM
}

enum ExtensionStatus {
  REGISTERED
  INSTALLING
  INSTALLED
  ACTIVATING
  ACTIVE
  DEACTIVATING
  INACTIVE
  ERROR
  UNINSTALLING
}

enum CapabilityStatus {
  AVAILABLE
  ACTIVE
  INACTIVE
  ERROR
  DEPRECATED
}

enum IntegrationType {
  CAPABILITY_PROVIDER
  EVENT_SUBSCRIBER
  DATA_PROCESSOR
  WORKFLOW_ENHANCER
  MONITORING_INTEGRATION
}
```

### **Query Operations**

#### **Get Extension Details**
```graphql
query GetExtension($extensionId: ID!) {
  extension(extensionId: $extensionId) {
    extensionId
    extensionName
    extensionVersion
    extensionType
    extensionStatus
    installationStatus
    capabilities {
      capabilityId
      capabilityName
      capabilityStatus
      interfaces {
        interfaceName
        methods {
          methodName
          methodDescription
          parameters {
            parameterName
            parameterType
            parameterRequired
          }
          returnType
        }
      }
      performanceMetrics {
        avgResponseTimeMs
        successRatePercent
        totalInvocations
        errorRatePercent
      }
    }
    integrations {
      integrationId
      targetModule
      integrationType
      integrationStatus
      providedCapabilities
      subscribedEvents
    }
    runtimeInfo {
      instanceId
      processId
      startTime
      memoryUsageMb
      cpuUsagePercent
      status
    }
    performanceMetrics {
      avgResponseTimeMs
      successRatePercent
      totalInvocations
      errorRatePercent
    }
  }
}
```

#### **List Extensions**
```graphql
query ListExtensions(
  $filter: ExtensionFilter
  $sort: ExtensionSort
  $pagination: Pagination
) {
  extensions(filter: $filter, sort: $sort, pagination: $pagination) {
    edges {
      node {
        extensionId
        extensionName
        extensionVersion
        extensionType
        extensionStatus
        capabilities {
          capabilityId
          capabilityName
          capabilityStatus
        }
        performanceMetrics {
          avgResponseTimeMs
          successRatePercent
          totalInvocations
        }
      }
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
    totalCount
  }
}
```

### **Mutation Operations**

#### **Register Extension**
```graphql
mutation RegisterExtension($input: RegisterExtensionInput!) {
  registerExtension(input: $input) {
    extension {
      extensionId
      extensionName
      extensionVersion
      registrationStatus
      validationResults {
        manifestValid
        dependenciesResolved
        securityApproved
        compatibilityVerified
      }
      assignedResources {
        extensionNamespace
        storagePath
        configPath
      }
    }
  }
}
```

#### **Install Extension**
```graphql
mutation InstallExtension($input: InstallExtensionInput!) {
  installExtension(input: $input) {
    installation {
      installationId
      extensionId
      installationStatus
      installationProgress {
        currentStep
        completedSteps
        totalSteps
        progressPercentage
      }
      resourceAllocation {
        sandboxId
        namespace
        storageAllocated
        cpuAllocated
        memoryAllocated
      }
    }
  }
}
```

---

## 🔌 WebSocket API Reference

### **Real-time Extension Updates**

```javascript
// Subscribe to extension status updates
ws.send(JSON.stringify({
  type: 'subscribe',
  id: 'sub-001',
  channel: 'extensions.ext-ai-assistant-001.status'
}));

// Receive extension status updates
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (message.type === 'extension_status_updated') {
    console.log('Extension status updated:', message.data);
  }
};
```

### **Real-time Capability Invocations**

```javascript
// Subscribe to capability invocation events
ws.send(JSON.stringify({
  type: 'subscribe',
  id: 'sub-002',
  channel: 'capabilities.natural_language_processing.invocations'
}));

// Receive capability invocation results
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (message.type === 'capability_invoked') {
    console.log('Capability invoked:', message.data);
  }
};
```

---

## 🔗 Related Documentation

- [Extension Module Overview](./README.md) - Module overview and architecture
- [Protocol Specification](./protocol-specification.md) - Protocol specification
- [Implementation Guide](./implementation-guide.md) - Implementation guidelines
- [Configuration Guide](./configuration-guide.md) - Configuration options
- [Testing Guide](./testing-guide.md) - Testing strategies
- [Performance Guide](./performance-guide.md) - Performance optimization
- [Integration Examples](./integration-examples.md) - Integration examples

---

**API Version**: 1.0.0-alpha  
**Last Updated**: September 3, 2025  
**Next Review**: December 3, 2025  
**Status**: Enterprise Ready  

**⚠️ Alpha Notice**: The Extension Module API provides enterprise-grade extensibility capabilities in Alpha release. Additional AI-powered extension management and advanced capability orchestration features will be added in Beta release while maintaining backward compatibility.
