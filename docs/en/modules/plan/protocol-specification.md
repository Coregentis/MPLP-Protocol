# Plan Module Protocol Specification

**MPLP L2 Coordination Layer - Plan Module Protocol Definition**

[![Protocol](https://img.shields.io/badge/protocol-Plan%20v1.0-green.svg)](./README.md)
[![Schema](https://img.shields.io/badge/schema-JSON%20Schema%20Draft--07-blue.svg)](../../architecture/schema-system.md)
[![Status](https://img.shields.io/badge/status-Stable-green.svg)](../../../../ALPHA-RELEASE-NOTES.md)
[![Language](https://img.shields.io/badge/language-English-blue.svg)](../../../zh-CN/modules/plan/protocol-specification.md)

---

## 🎯 Protocol Overview

The Plan Module Protocol defines the standardized communication interface for AI-driven planning and task scheduling in MPLP. This protocol enables intelligent plan generation, collaborative planning, task coordination, and execution monitoring across multi-agent systems.

### **Protocol Characteristics**
- **Version**: 1.0.0-alpha
- **Schema Standard**: JSON Schema Draft-07
- **Serialization**: JSON with optional binary extensions for large plans
- **Transport**: HTTP/HTTPS, WebSocket, gRPC
- **Authentication**: JWT-based with planning-specific permissions
- **Naming Convention**: snake_case for protocol, camelCase for TypeScript

---

## 📋 Message Types

### **1. Plan Management Messages**

#### **Create Plan Request**
```json
{
  "message_type": "create_plan_request",
  "message_id": "msg-plan-001",
  "timestamp": "2025-09-03T10:00:00Z",
  "sender": {
    "module_id": "planning-client-001",
    "module_type": "external_client"
  },
  "request": {
    "plan_definition": {
      "name": "multi_agent_document_processing",
      "context_id": "ctx-001",
      "objectives": [
        {
          "objective_id": "obj-001",
          "description": "Process 1000 documents within 2 hours",
          "priority": "high",
          "success_criteria": [
            "completion_rate >= 95%",
            "processing_time <= 7200000",
            "error_rate <= 2%"
          ]
        }
      ],
      "constraints": [
        {
          "constraint_id": "const-001",
          "type": "resource",
          "description": "Maximum 10 agents",
          "parameters": {
            "max_agents": 10,
            "agent_types": ["parser", "analyzer", "validator"]
          }
        },
        {
          "constraint_id": "const-002",
          "type": "temporal",
          "description": "Complete within 2 hours",
          "parameters": {
            "deadline": "2025-09-03T12:00:00Z",
            "max_duration": 7200000
          }
        }
      ],
      "planning_preferences": {
        "algorithm": "hierarchical_task_network",
        "optimization_criteria": ["time", "resource_efficiency", "quality"],
        "risk_tolerance": "moderate",
        "collaboration_mode": "consensus_based"
      }
    },
    "planning_context": {
      "available_agents": [
        {
          "agent_id": "agent-parser-001",
          "capabilities": ["pdf_parsing", "text_extraction"],
          "capacity": 50,
          "cost_per_hour": 10.0
        },
        {
          "agent_id": "agent-analyzer-001",
          "capabilities": ["content_analysis", "classification"],
          "capacity": 30,
          "cost_per_hour": 15.0
        }
      ],
      "available_resources": {
        "compute": {
          "cpu_cores": 32,
          "memory_gb": 128,
          "storage_gb": 1000
        },
        "network": {
          "bandwidth_mbps": 1000,
          "latency_ms": 5
        }
      }
    }
  }
}
```

#### **Create Plan Response**
```json
{
  "message_type": "create_plan_response",
  "message_id": "msg-plan-001",
  "correlation_id": "msg-plan-001",
  "timestamp": "2025-09-03T10:00:05Z",
  "sender": {
    "module_id": "plan-service",
    "module_type": "plan_module"
  },
  "response": {
    "plan_id": "plan-001",
    "status": "created",
    "plan_summary": {
      "name": "multi_agent_document_processing",
      "total_tasks": 15,
      "estimated_duration": 6300000,
      "estimated_cost": 125.50,
      "confidence_score": 0.92,
      "risk_assessment": {
        "overall_risk": "low",
        "risk_factors": [
          {
            "factor": "resource_availability",
            "probability": 0.1,
            "impact": "medium"
          }
        ]
      }
    },
    "task_breakdown": [
      {
        "task_id": "task-001",
        "name": "initialize_processing_context",
        "type": "setup",
        "estimated_duration": 300000,
        "assigned_agents": ["agent-coordinator-001"],
        "dependencies": [],
        "resources": {
          "cpu_cores": 1,
          "memory_mb": 512
        }
      },
      {
        "task_id": "task-002",
        "name": "parse_document_batch_1",
        "type": "processing",
        "estimated_duration": 1800000,
        "assigned_agents": ["agent-parser-001", "agent-parser-002"],
        "dependencies": ["task-001"],
        "resources": {
          "cpu_cores": 4,
          "memory_mb": 2048
        }
      }
    ],
    "execution_timeline": {
      "planned_start": "2025-09-03T10:05:00Z",
      "planned_end": "2025-09-03T11:50:00Z",
      "critical_path": ["task-001", "task-002", "task-008", "task-015"],
      "milestones": [
        {
          "milestone_id": "milestone-001",
          "name": "first_batch_complete",
          "planned_time": "2025-09-03T10:35:00Z",
          "tasks": ["task-002", "task-003", "task-004"]
        }
      ]
    },
    "resource_allocation": {
      "total_agents": 8,
      "peak_cpu_usage": 16,
      "peak_memory_usage": 8192,
      "estimated_network_usage": 500
    }
  }
}
```

### **2. Collaborative Planning Messages**

#### **Start Collaborative Planning Request**
```json
{
  "message_type": "start_collaborative_planning_request",
  "message_id": "msg-collab-001",
  "timestamp": "2025-09-03T10:10:00Z",
  "sender": {
    "module_id": "planning-coordinator-001",
    "module_type": "planning_coordinator"
  },
  "request": {
    "session_config": {
      "session_name": "quarterly_project_planning",
      "planning_scope": "strategic",
      "collaboration_mode": "consensus_based",
      "time_limit": 3600000,
      "consensus_threshold": 0.8
    },
    "participants": [
      {
        "agent_id": "agent-strategic-001",
        "role": "lead_planner",
        "capabilities": ["strategic_planning", "resource_optimization"],
        "voting_weight": 2.0
      },
      {
        "agent_id": "agent-tactical-001",
        "role": "tactical_planner",
        "capabilities": ["task_scheduling", "dependency_management"],
        "voting_weight": 1.5
      },
      {
        "agent_id": "agent-resource-001",
        "role": "resource_advisor",
        "capabilities": ["resource_analysis", "cost_estimation"],
        "voting_weight": 1.0
      }
    ],
    "planning_problem": {
      "objectives": [
        {
          "objective_id": "obj-strategic-001",
          "description": "Increase system throughput by 50%",
          "priority": "high",
          "measurable_outcomes": ["throughput_increase >= 50%"]
        }
      ],
      "constraints": [
        {
          "constraint_id": "budget-001",
          "type": "financial",
          "description": "Budget limit $100,000",
          "parameters": {"max_budget": 100000}
        }
      ],
      "context": {
        "current_system_state": {
          "throughput": 1000,
          "resource_utilization": 0.7,
          "cost_per_month": 15000
        },
        "available_improvements": [
          "add_processing_nodes",
          "optimize_algorithms",
          "upgrade_infrastructure"
        ]
      }
    }
  }
}
```

#### **Planning Contribution Message**
```json
{
  "message_type": "planning_contribution",
  "message_id": "msg-contrib-001",
  "timestamp": "2025-09-03T10:15:00Z",
  "sender": {
    "module_id": "agent-strategic-001",
    "module_type": "planning_agent"
  },
  "contribution": {
    "session_id": "session-collab-001",
    "contribution_type": "solution_proposal",
    "content": {
      "proposal_id": "proposal-001",
      "title": "Hybrid Scaling Strategy",
      "description": "Combine horizontal scaling with algorithm optimization",
      "solution_components": [
        {
          "component_id": "comp-001",
          "name": "add_processing_nodes",
          "description": "Add 5 additional processing nodes",
          "estimated_cost": 25000,
          "estimated_benefit": "30% throughput increase",
          "implementation_time": 2160000
        },
        {
          "component_id": "comp-002",
          "name": "optimize_core_algorithms",
          "description": "Optimize critical path algorithms",
          "estimated_cost": 15000,
          "estimated_benefit": "25% throughput increase",
          "implementation_time": 1440000
        }
      ],
      "overall_impact": {
        "throughput_increase": 0.55,
        "total_cost": 40000,
        "implementation_timeline": 2160000,
        "risk_level": "medium"
      }
    },
    "supporting_evidence": {
      "analysis_results": {
        "bottleneck_analysis": "CPU-bound operations identified",
        "scalability_projections": "Linear scaling up to 10 nodes",
        "cost_benefit_ratio": 2.75
      },
      "references": [
        "performance_analysis_report_q2_2025",
        "infrastructure_capacity_study"
      ]
    },
    "confidence_level": 0.85
  }
}
```

### **3. Task Scheduling Messages**

#### **Schedule Tasks Request**
```json
{
  "message_type": "schedule_tasks_request",
  "message_id": "msg-schedule-001",
  "timestamp": "2025-09-03T10:20:00Z",
  "sender": {
    "module_id": "task-coordinator-001",
    "module_type": "task_coordinator"
  },
  "request": {
    "plan_id": "plan-001",
    "scheduling_preferences": {
      "optimization_criteria": ["minimize_makespan", "balance_load"],
      "scheduling_algorithm": "critical_path_method",
      "resource_allocation_strategy": "greedy_best_fit"
    },
    "tasks": [
      {
        "task_id": "task-001",
        "name": "data_preprocessing",
        "duration": 1800000,
        "resource_requirements": {
          "cpu_cores": 2,
          "memory_mb": 1024,
          "agent_capabilities": ["data_processing"]
        },
        "dependencies": [],
        "priority": "high"
      },
      {
        "task_id": "task-002",
        "name": "model_training",
        "duration": 3600000,
        "resource_requirements": {
          "cpu_cores": 8,
          "memory_mb": 8192,
          "agent_capabilities": ["machine_learning"]
        },
        "dependencies": ["task-001"],
        "priority": "critical"
      }
    ],
    "constraints": {
      "deadline": "2025-09-03T14:00:00Z",
      "max_parallel_tasks": 5,
      "agent_availability": [
        {
          "agent_id": "agent-ml-001",
          "available_from": "2025-09-03T10:30:00Z",
          "available_until": "2025-09-03T16:00:00Z"
        }
      ]
    }
  }
}
```

#### **Schedule Tasks Response**
```json
{
  "message_type": "schedule_tasks_response",
  "message_id": "msg-schedule-001",
  "correlation_id": "msg-schedule-001",
  "timestamp": "2025-09-03T10:20:02Z",
  "sender": {
    "module_id": "task-scheduler",
    "module_type": "plan_module"
  },
  "response": {
    "schedule_id": "schedule-001",
    "status": "scheduled",
    "schedule_summary": {
      "total_tasks": 2,
      "scheduled_start": "2025-09-03T10:30:00Z",
      "scheduled_end": "2025-09-03T12:00:00Z",
      "total_duration": 5400000,
      "critical_path_duration": 5400000,
      "resource_utilization": 0.75
    },
    "task_assignments": [
      {
        "task_id": "task-001",
        "assigned_agent": "agent-data-001",
        "scheduled_start": "2025-09-03T10:30:00Z",
        "scheduled_end": "2025-09-03T11:00:00Z",
        "allocated_resources": {
          "cpu_cores": 2,
          "memory_mb": 1024,
          "node_id": "node-compute-001"
        }
      },
      {
        "task_id": "task-002",
        "assigned_agent": "agent-ml-001",
        "scheduled_start": "2025-09-03T11:00:00Z",
        "scheduled_end": "2025-09-03T12:00:00Z",
        "allocated_resources": {
          "cpu_cores": 8,
          "memory_mb": 8192,
          "node_id": "node-gpu-001"
        }
      }
    ],
    "optimization_results": {
      "makespan": 5400000,
      "resource_efficiency": 0.75,
      "load_balance_score": 0.82,
      "constraint_violations": 0
    }
  }
}
```

### **4. Execution Monitoring Messages**

#### **Execution Status Update**
```json
{
  "message_type": "execution_status_update",
  "message_id": "msg-status-001",
  "timestamp": "2025-09-03T10:45:00Z",
  "sender": {
    "module_id": "execution-monitor-001",
    "module_type": "execution_monitor"
  },
  "update": {
    "plan_id": "plan-001",
    "execution_id": "exec-001",
    "overall_status": "in_progress",
    "progress": {
      "completed_tasks": 3,
      "total_tasks": 15,
      "completion_percentage": 0.2,
      "elapsed_time": 2700000,
      "estimated_remaining_time": 3600000
    },
    "task_updates": [
      {
        "task_id": "task-001",
        "status": "completed",
        "actual_start": "2025-09-03T10:30:00Z",
        "actual_end": "2025-09-03T10:58:00Z",
        "actual_duration": 1680000,
        "performance_metrics": {
          "efficiency": 0.93,
          "quality_score": 0.95,
          "resource_utilization": 0.87
        }
      },
      {
        "task_id": "task-002",
        "status": "in_progress",
        "actual_start": "2025-09-03T11:00:00Z",
        "progress_percentage": 0.6,
        "estimated_completion": "2025-09-03T11:55:00Z",
        "current_metrics": {
          "throughput": 150,
          "error_rate": 0.01,
          "resource_utilization": 0.92
        }
      }
    ],
    "deviations": [
      {
        "deviation_id": "dev-001",
        "type": "schedule_delay",
        "description": "Task-001 completed 2 minutes late",
        "impact": "low",
        "root_cause": "higher_than_expected_data_volume",
        "mitigation": "allocated_additional_resources_to_task-002"
      }
    ],
    "resource_usage": {
      "current_cpu_usage": 12,
      "current_memory_usage": 6144,
      "peak_cpu_usage": 16,
      "peak_memory_usage": 8192,
      "network_throughput": 250
    },
    "alerts": [
      {
        "alert_id": "alert-001",
        "severity": "warning",
        "message": "Memory usage approaching 80% threshold",
        "timestamp": "2025-09-03T10:42:00Z",
        "affected_tasks": ["task-002"]
      }
    ]
  }
}
```

### **5. Plan Adaptation Messages**

#### **Adapt Plan Request**
```json
{
  "message_type": "adapt_plan_request",
  "message_id": "msg-adapt-001",
  "timestamp": "2025-09-03T11:00:00Z",
  "sender": {
    "module_id": "adaptation-engine-001",
    "module_type": "adaptation_engine"
  },
  "request": {
    "plan_id": "plan-001",
    "adaptation_trigger": {
      "trigger_type": "performance_deviation",
      "description": "Execution running 15% slower than planned",
      "severity": "medium",
      "detected_at": "2025-09-03T10:55:00Z"
    },
    "current_situation": {
      "execution_progress": 0.4,
      "time_elapsed": 3300000,
      "time_remaining": 2700000,
      "performance_gap": -0.15,
      "resource_constraints": {
        "cpu_availability": 0.6,
        "memory_availability": 0.4
      }
    },
    "adaptation_options": [
      {
        "option_id": "adapt-001",
        "type": "resource_scaling",
        "description": "Add 2 additional processing nodes",
        "estimated_impact": {
          "time_reduction": 900000,
          "cost_increase": 50.0,
          "success_probability": 0.9
        }
      },
      {
        "option_id": "adapt-002",
        "type": "task_reordering",
        "description": "Reorder non-critical tasks to optimize critical path",
        "estimated_impact": {
          "time_reduction": 600000,
          "cost_increase": 0.0,
          "success_probability": 0.7
        }
      }
    ],
    "adaptation_preferences": {
      "max_cost_increase": 100.0,
      "min_success_probability": 0.8,
      "preferred_adaptation_types": ["resource_scaling", "task_reordering"]
    }
  }
}
```

---

## 🔧 Protocol Operations

### **Authentication and Authorization**

#### **Planning Permission Scopes**
- **plan:create** - Create new plans
- **plan:read** - Read plan details
- **plan:update** - Update existing plans
- **plan:delete** - Delete plans
- **plan:execute** - Execute plans
- **plan:collaborate** - Participate in collaborative planning
- **plan:schedule** - Schedule tasks
- **plan:monitor** - Monitor plan execution
- **plan:adapt** - Adapt plans during execution

### **Error Handling**

#### **Planning Error Codes**
- **PLAN_CREATION_FAILED** - Plan creation failed due to invalid parameters
- **PLANNING_ALGORITHM_ERROR** - Planning algorithm encountered an error
- **RESOURCE_ALLOCATION_FAILED** - Unable to allocate required resources
- **SCHEDULING_CONFLICT** - Task scheduling conflict detected
- **COLLABORATION_TIMEOUT** - Collaborative planning session timed out
- **CONSENSUS_NOT_REACHED** - Unable to reach consensus in collaborative planning
- **EXECUTION_MONITORING_FAILED** - Execution monitoring system failure
- **ADAPTATION_FAILED** - Plan adaptation attempt failed

### **Performance Metrics**

#### **Planning Performance Targets**
- **Plan Generation**: < 5 seconds for simple plans, < 30 seconds for complex plans
- **Task Scheduling**: < 2 seconds for 100 tasks
- **Collaborative Planning**: < 1 second response time for contributions
- **Execution Monitoring**: < 100ms for status updates
- **Plan Adaptation**: < 10 seconds for adaptation decisions

---

**Protocol Version**: 1.0.0-alpha  
**Last Updated**: September 3, 2025  
**Next Review**: December 3, 2025  
**Compatibility**: MPLP v1.0 Alpha and later  

**⚠️ Alpha Notice**: Protocol specifications may evolve based on AI/ML integration feedback and collaborative planning optimization during the Alpha phase.
