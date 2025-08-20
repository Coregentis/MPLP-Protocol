---
type: "always_apply"
description: "MPLP v1.0 Testing Strategy - Context Module Validated Standards"
priority: "critical"
enforcement: "mandatory"
---

# MPLP v1.0 Testing Strategy - Context Module Validated Standards

## 🏗️ **MPLP v1.0 Testing Reality**

**CRITICAL UPDATE**: MPLP v1.0 has **1 module (Context) with 100% perfect TDD+BDD standards**. All testing must achieve Context module's validated quality standard.

**PROVEN METHODOLOGY**: Context module successfully validated complete TDD+BDD methodology with 100% success rate.

## 🎯 **Context Module Validated Testing Standards**

### **Testing Quality Standards (JSON Schema)**
```json
{
  "testing_standards": {
    "mandatory_requirements": {
      "tdd_standards": {
        "test_pass_rate": "100%",
        "typescript_errors": 0,
        "eslint_warnings": 0,
        "test_files_count": ">=21",
        "implementation_files_count": ">=33",
        "application_services_count": ">=15",
        "zero_technical_debt": true
      },
      "bdd_standards": {
        "scenario_pass_rate": "100%",
        "total_scenarios": ">=39",
        "total_steps": ">=327",
        "execution_time": "<=1.0s",
        "framework": "cucumber",
        "language": "gherkin",
        "mock_service_integration": true,
        "business_modules_coverage": ">=5"
      },
      "quality_gates": {
        "module_level_validation": true,
        "schema_typescript_mapping": "100%",
        "dual_naming_convention": "100%",
        "enterprise_grade_quality": true,
        "zero_tolerance_failures": true
      }
    }
  }
}
```

### **Context Module Success Baseline (JSON Schema)**
```json
{
  "context_module_baseline": {
    "tdd_achievements": {
      "typescript_files": 33,
      "test_files": 21,
      "application_services": 15,
      "typescript_errors": 0,
      "eslint_warnings": 0,
      "technical_debt": 0
    },
    "bdd_achievements": {
      "scenarios_passed": 39,
      "scenarios_total": 39,
      "steps_implemented": 327,
      "steps_total": 327,
      "execution_time_seconds": 0.087,
      "business_modules": [
        "context_creation",
        "shared_state_management",
        "access_control",
        "lifecycle_management",
        "error_handling"
      ]
    },
    "quality_metrics": {
      "pass_rate": "100%",
      "stability": "100%",
      "performance": "超高性能",
      "enterprise_grade": true
    }
  }
}
```

## 🎯 **BDD Standards (Context Module Validated)**

### **BDD Implementation Requirements (JSON Schema)**
```json
{
  "bdd_requirements": {
    "framework_standards": {
      "testing_framework": "@cucumber/cucumber",
      "assertion_library": "chai",
      "language": "gherkin",
      "step_definition_format": "javascript",
      "mock_service_integration": "mandatory"
    },
    "quality_standards": {
      "scenario_pass_rate": "100%",
      "step_implementation_rate": "100%",
      "execution_performance": "<=1.0s",
      "test_stability": "100%",
      "business_coverage": ">=5_modules"
    },
    "file_structure": {
      "feature_files": "tests/bdd/features/{module}.feature",
      "step_definitions": "tests/bdd/steps/{module}-steps.js",
      "mock_services": "tests/bdd/mocks/{module}-mock.js",
      "quality_enforcer": "scripts/bdd/bdd-quality-enforcer.js"
    }
  }
}
```

### **BDD Stage Validation (JSON Schema)**
```json
{
  "bdd_stage_validation": {
    "stage_1_business_analysis": {
      "pre_check": [
        "business_requirements_complete",
        "user_stories_defined",
        "acceptance_criteria_clear"
      ],
      "development_constraints": [
        "stakeholder_validation_required",
        "business_scenario_coverage_tracking"
      ],
      "post_validation": [
        "business_scenario_coverage_100%",
        "stakeholder_approval_documented"
      ]
    },
    "stage_2_gherkin_specification": {
      "pre_check": [
        "business_scenarios_approved",
        "feature_priority_defined"
      ],
      "development_constraints": [
        "gherkin_syntax_validation",
        "business_logic_consistency"
      ],
      "post_validation": [
        "gherkin_syntax_100%_valid",
        "business_logic_verified"
      ]
    },
    "stage_3_step_implementation": {
      "pre_check": [
        "gherkin_scenarios_finalized",
        "mock_service_architecture_ready"
      ],
      "development_constraints": [
        "step_coverage_tracking",
        "mock_service_quality_validation"
      ],
      "post_validation": [
        "step_implementation_100%",
        "mock_service_integration_verified"
      ]
    },
    "stage_4_business_validation": {
      "pre_check": [
        "all_steps_implemented",
        "mock_services_integrated"
      ],
      "development_constraints": [
        "end_to_end_scenario_testing",
        "performance_monitoring"
      ],
      "post_validation": [
        "scenario_pass_rate_100%",
        "business_value_validated"
      ]
    }
  }
}
```

### **TDD Implementation Requirements (JSON Schema)**
```json
{
  "tdd_requirements": {
    "implementation_standards": {
      "typescript_files_minimum": 33,
      "test_files_minimum": 21,
      "application_services_minimum": 15,
      "typescript_errors_maximum": 0,
      "eslint_warnings_maximum": 0,
      "technical_debt_tolerance": 0
    },
    "architecture_requirements": {
      "ddd_layers": [
        "api_layer",
        "application_layer",
        "domain_layer",
        "infrastructure_layer"
      ],
      "mandatory_components": [
        "mapper_classes",
        "dto_classes",
        "controllers",
        "repositories",
        "entities",
        "services"
      ],
      "dual_naming_convention": {
        "schema_format": "snake_case",
        "typescript_format": "camelCase",
        "mapping_consistency": "100%"
      }
    },
    "quality_gates": {
      "module_level_validation": true,
      "cross_module_isolation": true,
      "zero_tolerance_policy": true,
      "enterprise_grade_standards": true
    }
  }
}
```

## 📋 **Testing Architecture (Context Module Validated)**

### **Testing Layer Structure (JSON Schema)**
```json
{
  "testing_architecture": {
    "layer_1_functional_tests": {
      "purpose": "user_scenario_based_functional_testing",
      "target_coverage": ">=90%",
      "file_pattern": "tests/functional/{module}-functional.test.ts",
      "scenario_types": [
        "basic_functional_scenarios",
        "advanced_functional_scenarios",
        "exception_handling_scenarios",
        "boundary_condition_scenarios",
        "integration_scenarios",
        "performance_scenarios"
      ],
      "validation_focus": "source_code_functional_gaps"
    },
    "layer_1_5_bdd_tests": {
      "purpose": "business_behavior_driven_development",
      "target_coverage": "100%",
      "file_patterns": {
        "feature_files": "tests/bdd/features/{module}.feature",
        "step_definitions": "tests/bdd/steps/{module}-steps.js"
      },
      "context_module_success": {
        "scenarios_passed": 39,
        "execution_time": "0.087s",
        "pass_rate": "100%"
      },
      "scenario_types": [
        "core_business_scenarios",
        "user_journey_scenarios",
        "business_rule_scenarios",
        "exception_business_scenarios",
        "integration_business_scenarios",
        "performance_business_scenarios"
      ],
      "mandatory_validation": "bdd-quality-enforcer.js"
    },
    "layer_2_interface_tests": {
      "purpose": "module_interface_core_orchestrator_readiness",
      "target_coverage": ">=90%",
      "file_pattern": "tests/interfaces/{module}-interface.test.ts",
      "validation_focus": "core_orchestrator_integration_readiness",
      "methodology": [
        "test_public_interfaces_with_orchestrator_data",
        "validate_interface_signatures_and_types",
        "mock_orchestrator_data_generation",
        "verify_orchestrated_workflow_handling"
      ]
    }
  }
}
```

### **Additional Testing Layers (JSON Schema)**
```json
{
  "additional_testing_layers": {
    "layer_3_unit_tests": {
      "purpose": "complete_unit_test_coverage",
      "target_coverage": ">=90%",
      "method": "test_individual_components_and_functions",
      "focus": "implementation_details_and_boundary_conditions",
      "file_pattern": "tests/unit/{module}/{component}.test.ts"
    },
    "layer_4_integration_tests": {
      "purpose": "core_orchestrator_mediated_coordination",
      "method": "test_through_orchestrator_apis_only",
      "focus": "complete_orchestrated_workflows",
      "prohibited": "direct_module_to_module_integration",
      "current_status": "deferred_until_orchestrator_implementation"
    },
    "layer_5_e2e_tests": {
      "purpose": "complete_user_scenario_testing",
      "target": "verify_complete_business_processes",
      "method": "test_real_user_scenarios",
      "focus": "overall_system_stability"
    }
  }
}
```

### **Quality Enforcement Tools (JSON Schema)**
```json
{
  "quality_enforcement": {
    "tdd_quality_enforcer": {
      "script_path": "scripts/tdd/tdd-quality-enforcer.js",
      "validation_stages": [
        "pre_check",
        "stage_1_architecture",
        "stage_2_dto_layer",
        "stage_3_repository_interface",
        "stage_4_business_logic",
        "post_check"
      ],
      "enforcement_level": "mandatory"
    },
    "bdd_quality_enforcer": {
      "script_path": "scripts/bdd/bdd-quality-enforcer.js",
      "validation_stages": [
        "pre_check",
        "stage_1_business_analysis",
        "stage_2_gherkin_specification",
        "stage_3_step_implementation",
        "stage_4_business_validation",
        "post_check"
      ],
      "enforcement_level": "mandatory"
    },
    "module_quality_gate": {
      "script_path": "scripts/check-module-quality.sh",
      "validation_scope": "module_level_only",
      "quality_checks": [
        "typescript_compilation",
        "eslint_validation",
        "version_consistency",
        "test_execution",
        "coverage_validation",
        "naming_convention"
      ]
    }
  }
}
```

## 🔧 **Source Code Repair Methodology (JSON Schema)**

### **Problem Resolution Process**
```json
{
  "source_code_repair": {
    "step_1_impact_analysis": {
      "mandatory_checks": [
        "direct_impact_modules",
        "indirect_impact_modules",
        "systemic_issue_patterns",
        "type_definition_updates_needed",
        "api_interface_updates_needed",
        "test_adjustments_required"
      ],
      "analysis_scope": "complete_system_impact"
    },
    "step_2_systematic_repair": {
      "repair_principles": [
        "fix_root_causes_not_symptoms",
        "maintain_backward_compatibility",
        "ensure_type_safety",
        "follow_existing_architecture_patterns",
        "add_necessary_validation_logic",
        "improve_error_handling_mechanisms"
      ],
      "prohibited_actions": [
        "bypass_problems",
        "modify_test_expectations",
        "skip_failed_tests",
        "lower_quality_standards"
      ]
    },
    "step_3_chain_validation": {
      "validation_sequence": [
        {
          "step": 1,
          "action": "typescript_compilation_validation",
          "requirement": "zero_compilation_errors"
        },
        {
          "step": 2,
          "action": "unit_test_validation",
          "requirement": "existing_functionality_unaffected"
        },
        {
          "step": 3,
          "action": "functional_scenario_validation",
          "requirement": "repair_effectiveness_verified"
        },
        {
          "step": 4,
          "action": "integration_test_validation",
          "requirement": "inter_module_collaboration_normal"
        },
        {
          "step": 5,
          "action": "end_to_end_validation",
          "requirement": "overall_system_stability"
        }
      ]
    }
  }
}
```

## 🧪 **Implementation Standards (JSON Schema)**

### **Testing Implementation Requirements**
```json
{
  "implementation_standards": {
    "functional_testing": {
      "test_structure": {
        "describe_pattern": "{Module} Module Functional Scenarios - Based on Real User Needs",
        "nested_describe_pattern": "{Number}. {Feature} Scenario - {User Role} Daily Use",
        "test_case_pattern": "should allow {user} to {action} {object}"
      },
      "data_requirements": {
        "request_format": "schema_compliant",
        "naming_convention": "snake_case_for_schema_fields",
        "complete_data": "based_on_actual_needs",
        "realistic_scenarios": "production_like_data"
      },
      "assertion_standards": {
        "success_validation": "result.success === true",
        "data_validation": "specific_field_checks",
        "type_safety": "typescript_strict_mode",
        "business_logic": "user_perspective_validation"
      }
    },
    "bdd_testing": {
      "gherkin_structure": {
        "feature_format": "Feature: {Business Value Description}",
        "scenario_format": "Scenario: {Business Behavior Description}",
        "step_format": ["Given {context}", "When {action}", "Then {outcome}"]
      },
      "step_definition_requirements": {
        "implementation_language": "javascript",
        "assertion_library": "chai",
        "mock_service_integration": "mandatory",
        "business_data_simulation": "realistic_business_scenarios"
      },
      "quality_requirements": {
        "scenario_pass_rate": "100%",
        "step_implementation_rate": "100%",
        "execution_performance": "<=1.0s",
        "business_validation": "stakeholder_approved"
      }
    }
  }
}
```

## 🚫 **Prohibited Practices (JSON Schema)**

### **Testing Anti-Patterns**
```json
{
  "prohibited_practices": {
    "absolutely_forbidden": [
      "modifying_test_expectations_to_fit_wrong_implementations",
      "skipping_failed_test_cases",
      "using_excessive_mocks_making_tests_meaningless",
      "testing_implementation_details_instead_of_behavior",
      "writing_unstable_flaky_tests",
      "creating_dependencies_between_tests",
      "hard_coding_test_data_causing_maintenance_issues",
      "lowering_test_standards_to_improve_pass_rates",
      "ignoring_source_code_problems_focusing_only_on_test_passing"
    ],
    "zero_tolerance_violations": [
      "any_type_usage",
      "typescript_compilation_errors",
      "eslint_warnings",
      "technical_debt_accumulation",
      "test_skipping",
      "quality_standard_compromise"
    ]
  }
}
```

### **Correct Resolution Process (JSON Schema)**
```json
{
  "test_failure_resolution": {
    "analysis_process": [
      {
        "step": 1,
        "action": "analyze_failure_cause",
        "question": "is_it_code_problem_or_test_problem"
      },
      {
        "step": 2,
        "condition": "if_code_problem",
        "action": "fix_source_code_implementation"
      },
      {
        "step": 3,
        "condition": "if_test_problem",
        "action": "fix_test_logic_and_expectations"
      },
      {
        "step": 4,
        "action": "ensure_repair_stability_and_reliability"
      },
      {
        "step": 5,
        "action": "verify_no_new_problems_introduced"
      },
      {
        "step": 6,
        "action": "execute_complete_chain_validation"
      },
      {
        "step": 7,
        "action": "document_problems_and_solutions"
      }
    ]
  }
}
```

---

**ENFORCEMENT**: These testing standards are **mandatory** and based on Context module's 100% successful TDD+BDD implementation.

**VALIDATION STATUS**: ✅ Context module: 39 BDD scenarios 100% pass rate, 327 steps 100% implemented, 0.087s execution time, enterprise-grade quality achieved.

**VERSION**: 2.0.0
**EFFECTIVE**: Based on Context module validated standards
**COMPLIANCE**: Zero tolerance for violations