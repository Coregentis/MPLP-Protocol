#!/usr/bin/env node

/**
 * @fileoverview Emergency Fix - Correct Over-aggressive Type Renaming
 * @version 1.1.0-beta
 */

const fs = require('fs');
const path = require('path');

// Emergency fixes for over-aggressive type renaming
const EMERGENCY_FIXES = {
  // Revert incorrect type renamings
  '_CampaignStatus': 'CampaignStatus',
  '_CampaignType': 'CampaignType',
  '_Channel': 'Channel',
  '_AutomationStatus': 'AutomationStatus',
  
  // Fix import statements that were incorrectly modified
  "import { _CampaignStatus": "import { CampaignStatus",
  "import { _CampaignType": "import { CampaignType", 
  "import { _Channel": "import { Channel",
  "import { _AutomationStatus": "import { AutomationStatus",
  
  // Fix export statements
  "export type { _CampaignStatus": "export type { CampaignStatus",
  "export type { _CampaignType": "export type { CampaignType",
  "export type { _Channel": "export type { Channel",
  "export type { _AutomationStatus": "export type { AutomationStatus",
  
  // Fix type annotations
  ": _CampaignStatus": ": CampaignStatus",
  ": _CampaignType": ": CampaignType",
  ": _Channel": ": Channel",
  ": _AutomationStatus": ": AutomationStatus",
  
  // Fix generic type parameters
  "<_CampaignStatus>": "<CampaignStatus>",
  "<_CampaignType>": "<CampaignType>",
  "<_Channel>": "<Channel>",
  "<_AutomationStatus>": "<AutomationStatus>",
};

/**
 * Apply emergency fixes to a file
 */
function applyEmergencyFixes(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Apply all emergency fixes
  for (const [oldText, newText] of Object.entries(EMERGENCY_FIXES)) {
    const regex = new RegExp(oldText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    if (regex.test(content)) {
      content = content.replace(regex, newText);
      modified = true;
      console.log(`  Fixed: ${oldText} -> ${newText}`);
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Applied emergency fixes to: ${filePath}`);
  }
}

/**
 * Add missing dependencies to package.json
 */
function addMissingDependencies(packageJsonPath) {
  if (!fs.existsSync(packageJsonPath)) {
    return;
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Add missing dependencies
  if (!packageJson.dependencies) {
    packageJson.dependencies = {};
  }
  
  const missingDeps = {
    'joi': '^17.9.0'
  };
  
  let modified = false;
  for (const [dep, version] of Object.entries(missingDeps)) {
    if (!packageJson.dependencies[dep] && !packageJson.devDependencies?.[dep]) {
      packageJson.dependencies[dep] = version;
      modified = true;
      console.log(`  Added dependency: ${dep}@${version}`);
    }
  }
  
  if (modified) {
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n', 'utf8');
    console.log(`✅ Updated dependencies in: ${packageJsonPath}`);
  }
}

/**
 * Main execution
 */
function main() {
  console.log('🚨 Starting Emergency Fix - Correcting Over-aggressive Type Renaming...\n');

  const examples = ['social-media-bot', 'marketing-automation', 'agent-orchestrator'];

  for (const example of examples) {
    const examplePath = path.join(__dirname, example);
    console.log(`📁 Processing example: ${example}`);
    
    if (!fs.existsSync(examplePath)) {
      console.log(`❌ Example not found: ${examplePath}`);
      continue;
    }

    // Fix package.json dependencies
    const packageJsonPath = path.join(examplePath, 'package.json');
    addMissingDependencies(packageJsonPath);

    // Process all TypeScript files
    const srcPath = path.join(examplePath, 'src');
    if (fs.existsSync(srcPath)) {
      const files = fs.readdirSync(srcPath, { withFileTypes: true, recursive: true });
      
      for (const file of files) {
        if (file.isFile() && file.name.endsWith('.ts') && !file.name.endsWith('.d.ts')) {
          const fullPath = path.join(file.path || srcPath, file.name);
          applyEmergencyFixes(fullPath);
        }
      }
    }
    
    console.log(`✅ Completed: ${example}\n`);
  }

  console.log('🎉 Emergency fix completed!');
  console.log('\n📋 Next steps:');
  console.log('1. Install missing dependencies: npm install');
  console.log('2. Run TypeScript compilation: npm run typecheck');
  console.log('3. Run ESLint: npm run lint');
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { applyEmergencyFixes, addMissingDependencies };
