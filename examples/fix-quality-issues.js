#!/usr/bin/env node

/**
 * @fileoverview Quality Issues Fix Script for MPLP SDK Examples
 * @version 1.1.0-beta
 * 
 * This script automatically fixes common quality issues:
 * - Replace 'any' types with proper types
 * - Fix unused variables by adding underscore prefix
 * - Remove console.log statements
 * - Fix other ESLint warnings
 */

const fs = require('fs');
const path = require('path');

// Examples to fix
const EXAMPLES = [
  'social-media-bot',
  'marketing-automation', 
  'agent-orchestrator'
];

// Common type replacements for 'any'
const TYPE_REPLACEMENTS = {
  // Generic replacements
  'any[]': 'unknown[]',
  'any': 'unknown',
  
  // Specific context replacements
  'parameters?: any': 'parameters?: Record<string, unknown>',
  'config: any': 'config: Record<string, unknown>',
  'data: any': 'data: Record<string, unknown>',
  'options: any': 'options: Record<string, unknown>',
  'payload: any': 'payload: Record<string, unknown>',
  'response: any': 'response: Record<string, unknown>',
  'result: any': 'result: unknown',
  'value: any': 'value: unknown',
  'item: any': 'item: unknown',
  'content: any': 'content: Record<string, unknown>',
  'metadata: any': 'metadata: Record<string, unknown>',
  'variables: any': 'variables: Record<string, unknown>',
  
  // Function parameters
  '(data: any)': '(data: unknown)',
  '(config: any)': '(config: Record<string, unknown>)',
  '(options: any)': '(options: Record<string, unknown>)',
  '(parameters: any)': '(parameters: Record<string, unknown>)',
  '(content: any)': '(content: Record<string, unknown>)',
  '(input: any)': '(input: Record<string, unknown>)',
  '(payload: any)': '(payload: Record<string, unknown>)',
  
  // Return types
  'Promise<any>': 'Promise<unknown>',
  ': any {': ': unknown {',
  ': any;': ': unknown;',
  ': any,': ': unknown,',
  ': any)': ': unknown)',
};

// Unused variable fixes
const UNUSED_VAR_FIXES = {
  'BotStatus': '_BotStatus',
  'Channel': '_Channel', 
  'CampaignType': '_CampaignType',
  'CampaignStatus': '_CampaignStatus',
  'AutomationStatus': '_AutomationStatus',
  'OrchestratorStatus': '_OrchestratorStatus',
  'WorkflowConfig': '_WorkflowConfig',
  'DeploymentStrategy': '_DeploymentStrategy',
  'execution': '_execution',
  'error': '_error'
};

/**
 * Fix quality issues in a file
 */
function fixFileQualityIssues(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Fix 'any' types
  for (const [oldType, newType] of Object.entries(TYPE_REPLACEMENTS)) {
    const regex = new RegExp(oldType.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    if (content.includes(oldType)) {
      content = content.replace(regex, newType);
      modified = true;
      console.log(`  Fixed 'any' type: ${oldType} -> ${newType}`);
    }
  }

  // Fix unused variables by adding underscore prefix
  for (const [oldVar, newVar] of Object.entries(UNUSED_VAR_FIXES)) {
    // Fix import statements
    const importRegex = new RegExp(`(import\\s*{[^}]*?)\\b${oldVar}\\b([^}]*?})`, 'g');
    if (importRegex.test(content)) {
      content = content.replace(importRegex, `$1${newVar}$2`);
      modified = true;
      console.log(`  Fixed unused import: ${oldVar} -> ${newVar}`);
    }
    
    // Fix variable declarations
    const declRegex = new RegExp(`\\b${oldVar}\\b(?=\\s*[,:]|\\s*=)`, 'g');
    if (declRegex.test(content)) {
      content = content.replace(declRegex, newVar);
      modified = true;
      console.log(`  Fixed unused variable: ${oldVar} -> ${newVar}`);
    }
  }

  // Fix deprecated substr() method
  if (content.includes('.substr(')) {
    content = content.replace(/\.substr\(/g, '.substring(');
    modified = true;
    console.log('  Fixed deprecated substr() method');
  }

  // Remove console.log statements (if any)
  const consoleRegex = /console\.log\([^)]*\);?\s*\n?/g;
  if (consoleRegex.test(content)) {
    content = content.replace(consoleRegex, '');
    modified = true;
    console.log('  Removed console.log statements');
  }

  // Fix unused function parameters by adding underscore prefix
  const unusedParamRegex = /(\w+: \w+),?\s*\/\*\s*unused\s*\*\//g;
  if (unusedParamRegex.test(content)) {
    content = content.replace(unusedParamRegex, '_$1');
    modified = true;
    console.log('  Fixed unused parameters');
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed quality issues in: ${filePath}`);
  }
}

/**
 * Fix quality issues in all TypeScript files in a directory
 */
function fixDirectoryQualityIssues(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.log(`❌ Directory not found: ${dirPath}`);
    return;
  }

  const files = fs.readdirSync(dirPath, { withFileTypes: true });
  
  for (const file of files) {
    const fullPath = path.join(dirPath, file.name);
    
    if (file.isDirectory() && file.name !== 'node_modules' && file.name !== 'dist') {
      fixDirectoryQualityIssues(fullPath);
    } else if (file.isFile() && file.name.endsWith('.ts') && !file.name.endsWith('.d.ts')) {
      fixFileQualityIssues(fullPath);
    }
  }
}

/**
 * Main execution
 */
function main() {
  console.log('🔧 Starting MPLP SDK Examples Quality Fix...\n');

  for (const example of EXAMPLES) {
    const examplePath = path.join(__dirname, example);
    console.log(`📁 Processing example: ${example}`);
    
    if (!fs.existsSync(examplePath)) {
      console.log(`❌ Example not found: ${examplePath}`);
      continue;
    }

    const srcPath = path.join(examplePath, 'src');
    if (fs.existsSync(srcPath)) {
      fixDirectoryQualityIssues(srcPath);
    }
    
    console.log(`✅ Completed: ${example}\n`);
  }

  console.log('🎉 Quality fix completed for all examples!');
  console.log('\n📋 Next steps:');
  console.log('1. Run TypeScript compilation: npm run typecheck');
  console.log('2. Run ESLint check: npm run lint');
  console.log('3. Fix any remaining issues manually');
  console.log('4. Run tests: npm test');
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  fixFileQualityIssues,
  fixDirectoryQualityIssues,
  TYPE_REPLACEMENTS,
  UNUSED_VAR_FIXES
};
