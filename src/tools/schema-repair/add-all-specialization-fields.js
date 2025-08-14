#!/usr/bin/env node

/**
 * MPLP Schema所有专业化字段添加脚本
 * 
 * 为所有模块添加完整的专业化字段
 * 
 * @version 1.0.0
 * @author MPLP Project Team
 * @since 2025-08-14
 */

const fs = require('fs');
const path = require('path');

// 所有模块的专业化字段定义
const allSpecializationFields = {
  'mplp-collab.json': {
    'collab_details': {
      "type": "object",
      "properties": {
        "collaboration_type": { "type": "string", "enum": ["real_time", "asynchronous", "hybrid"] },
        "participant_limit": { "type": "integer", "minimum": 2, "maximum": 100 },
        "coordination_strategy": { "type": "string", "enum": ["centralized", "distributed", "peer_to_peer"] }
      },
      "description": "协作详细配置"
    }
  },
  'mplp-confirm.json': {
    'confirm_operation': {
      "type": "string",
      "enum": ["create", "approve", "reject", "delegate", "escalate"],
      "description": "确认操作类型"
    },
    'confirm_details': {
      "type": "object",
      "properties": {
        "approval_level": { "type": "integer", "minimum": 1, "maximum": 5 },
        "timeout_seconds": { "type": "integer", "minimum": 30, "maximum": 86400 },
        "escalation_policy": { "type": "string", "enum": ["auto", "manual", "none"] }
      },
      "description": "确认详细信息"
    }
  },
  'mplp-context.json': {
    'context_operation': {
      "type": "string",
      "enum": ["create", "update", "activate", "deactivate", "merge"],
      "description": "上下文操作类型"
    },
    'context_details': {
      "type": "object",
      "properties": {
        "context_scope": { "type": "string", "enum": ["global", "session", "user", "project"] },
        "persistence_level": { "type": "string", "enum": ["memory", "session", "persistent", "permanent"] },
        "sharing_policy": { "type": "string", "enum": ["private", "shared", "public"] }
      },
      "description": "上下文详细配置"
    }
  },
  'mplp-core.json': {
    'core_operation': {
      "type": "string",
      "enum": ["initialize", "orchestrate", "monitor", "shutdown", "recover"],
      "description": "核心操作类型"
    },
    'core_details': {
      "type": "object",
      "properties": {
        "orchestration_mode": { "type": "string", "enum": ["centralized", "distributed", "hybrid"] },
        "resource_allocation": { "type": "string", "enum": ["static", "dynamic", "adaptive"] },
        "fault_tolerance": { "type": "string", "enum": ["none", "basic", "advanced"] }
      },
      "description": "核心详细配置"
    }
  },
  'mplp-dialog.json': {
    'dialog_operation': {
      "type": "string",
      "enum": ["start", "continue", "pause", "resume", "end"],
      "description": "对话操作类型"
    },
    'dialog_details': {
      "type": "object",
      "properties": {
        "dialog_type": { "type": "string", "enum": ["interactive", "batch", "streaming"] },
        "turn_management": { "type": "string", "enum": ["strict", "flexible", "free_form"] },
        "context_retention": { "type": "string", "enum": ["none", "session", "persistent"] }
      },
      "description": "对话详细配置"
    }
  },
  'mplp-event-bus.json': {
    'event_bus_operation': {
      "type": "string",
      "enum": ["publish", "subscribe", "unsubscribe", "route", "filter"],
      "description": "事件总线操作类型"
    }
  },
  'mplp-extension.json': {
    'extension_operation': {
      "type": "string",
      "enum": ["install", "activate", "deactivate", "update", "uninstall"],
      "description": "扩展操作类型"
    },
    'extension_details': {
      "type": "object",
      "properties": {
        "extension_type": { "type": "string", "enum": ["plugin", "middleware", "service", "widget"] },
        "compatibility_mode": { "type": "string", "enum": ["strict", "compatible", "legacy"] },
        "security_level": { "type": "string", "enum": ["sandbox", "restricted", "trusted"] }
      },
      "description": "扩展详细配置"
    }
  },
  'mplp-network.json': {
    'network_operation': {
      "type": "string",
      "enum": ["connect", "disconnect", "route", "broadcast", "discover"],
      "description": "网络操作类型"
    },
    'network_details': {
      "type": "object",
      "properties": {
        "network_topology": { "type": "string", "enum": ["star", "mesh", "ring", "tree"] },
        "protocol_type": { "type": "string", "enum": ["tcp", "udp", "websocket", "http"] },
        "security_mode": { "type": "string", "enum": ["none", "tls", "mtls", "custom"] }
      },
      "description": "网络详细配置"
    }
  },
  'mplp-plan.json': {
    'plan_operation': {
      "type": "string",
      "enum": ["create", "update", "execute", "pause", "cancel"],
      "description": "计划操作类型"
    },
    'plan_details': {
      "type": "object",
      "properties": {
        "planning_strategy": { "type": "string", "enum": ["sequential", "parallel", "adaptive"] },
        "execution_mode": { "type": "string", "enum": ["immediate", "scheduled", "conditional"] },
        "rollback_support": { "type": "boolean" }
      },
      "description": "计划详细配置"
    }
  },
  'mplp-role.json': {
    'role_operation': {
      "type": "string",
      "enum": ["create", "assign", "revoke", "update", "delete"],
      "description": "角色操作类型"
    },
    'role_details': {
      "type": "object",
      "properties": {
        "role_type": { "type": "string", "enum": ["system", "user", "service", "temporary"] },
        "inheritance_mode": { "type": "string", "enum": ["none", "single", "multiple"] },
        "permission_model": { "type": "string", "enum": ["rbac", "abac", "hybrid"] }
      },
      "description": "角色详细配置"
    }
  },
  'mplp-trace.json': {
    'trace_operation': {
      "type": "string",
      "enum": ["start", "record", "analyze", "export", "archive"],
      "description": "追踪操作类型"
    },
    'trace_details': {
      "type": "object",
      "properties": {
        "trace_level": { "type": "string", "enum": ["basic", "detailed", "comprehensive"] },
        "sampling_rate": { "type": "number", "minimum": 0, "maximum": 1 },
        "retention_days": { "type": "integer", "minimum": 1, "maximum": 365 }
      },
      "description": "追踪详细配置"
    }
  }
};

function addSpecializationToSchema(filePath, fields) {
  console.log(`添加专业化字段: ${filePath}`);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let updatedContent = content;
    let hasChanges = false;
    
    // 查找event_integration之前的位置
    const eventIntegrationMatch = updatedContent.match(/(\s+)},\s*"event_integration":\s*\{/);
    if (!eventIntegrationMatch) {
      console.log(`  ⚠️  未找到event_integration位置: ${filePath}`);
      return;
    }
    
    const indent = eventIntegrationMatch[1];
    let insertText = '';
    
    // 添加所有字段
    for (const [fieldName, fieldDef] of Object.entries(fields)) {
      insertText += `,\n${indent}"${fieldName}": ${JSON.stringify(fieldDef, null, 2).replace(/\n/g, `\n${indent}`)}`;
      hasChanges = true;
    }
    
    if (hasChanges) {
      // 插入专业化字段
      updatedContent = updatedContent.replace(
        /(\s+)},(\s*"event_integration":\s*\{)/,
        `$1}${insertText},$2`
      );
      
      // 更新required数组
      const fieldNames = Object.keys(fields);
      for (const fieldName of fieldNames) {
        updatedContent = updatedContent.replace(
          /"search_metadata",(\s*"event_integration")/g,
          `"search_metadata", "${fieldName}",$1`
        );
      }
      
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      console.log(`  ✅ 已添加专业化字段: ${fieldNames.join(', ')}`);
    }
    
  } catch (error) {
    console.error(`  ❌ 修复失败 ${filePath}:`, error.message);
  }
}

// 主函数
function main() {
  console.log('🔧 开始添加所有专业化字段...\n');
  
  // 修正路径：从工具目录到schemas目录
  const schemasDir = path.join(__dirname, '../../../src/schemas');
  
  for (const [fileName, fields] of Object.entries(allSpecializationFields)) {
    const filePath = path.join(schemasDir, fileName);
    if (fs.existsSync(filePath)) {
      addSpecializationToSchema(filePath, fields);
    } else {
      console.log(`⚠️  文件不存在: ${filePath}`);
    }
  }
  
  console.log('\n🎉 所有专业化字段添加完成！');
  console.log('请运行 npm run validate:schemas 验证修复结果');
}

if (require.main === module) {
  main();
}

module.exports = { addSpecializationToSchema, allSpecializationFields };
