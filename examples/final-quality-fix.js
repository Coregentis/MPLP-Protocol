#!/usr/bin/env node

/**
 * @fileoverview Final Quality Fix - Complete TypeScript Error Resolution
 * @version 1.1.0-beta
 */

const fs = require('fs');
const path = require('path');

// Final fixes for remaining TypeScript errors
const FINAL_FIXES = {
  // Logger method fixes
  'logger._error': 'logger.error',
  'console._error': 'console.error',
  
  // Type reference fixes
  'BotStatus': '_BotStatus',
  
  // Import fixes for missing types
  'import { Logger } from \'@mplp/core\';\nimport { SocialPlatform, PlatformConfig, ContentItem, PlatformAdapter, PublishResult } from \'../types\';': 
  'import { Logger } from \'@mplp/core\';\nimport { SocialPlatform, PlatformConfig, ContentItem, PlatformAdapter, PublishResult, SocialInteraction, InteractionResult, SocialActivity, PlatformMetrics } from \'../types\';',
  
  // Status fixes
  '\'approved\'': '\'published\'',
  '\'pending_approval\'': '\'draft\'',
};

/**
 * Apply final fixes to a file
 */
function applyFinalFixes(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Apply all final fixes
  for (const [oldText, newText] of Object.entries(FINAL_FIXES)) {
    if (content.includes(oldText)) {
      content = content.replace(new RegExp(oldText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newText);
      modified = true;
      console.log(`  Fixed: ${oldText} -> ${newText}`);
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Applied final fixes to: ${filePath}`);
  }
}

/**
 * Main execution
 */
function main() {
  console.log('🔧 Starting Final Quality Fix...\n');

  const examples = ['social-media-bot', 'marketing-automation', 'agent-orchestrator'];

  for (const example of examples) {
    const examplePath = path.join(__dirname, example);
    console.log(`📁 Processing example: ${example}`);
    
    if (!fs.existsSync(examplePath)) {
      console.log(`❌ Example not found: ${examplePath}`);
      continue;
    }

    // Process all TypeScript files
    const srcPath = path.join(examplePath, 'src');
    if (fs.existsSync(srcPath)) {
      const files = fs.readdirSync(srcPath, { withFileTypes: true, recursive: true });
      
      for (const file of files) {
        if (file.isFile() && file.name.endsWith('.ts') && !file.name.endsWith('.d.ts')) {
          const fullPath = path.join(file.path || srcPath, file.name);
          applyFinalFixes(fullPath);
        }
      }
    }
    
    console.log(`✅ Completed: ${example}\n`);
  }

  console.log('🎉 Final quality fix completed!');
  console.log('\n📋 Next steps:');
  console.log('1. Run TypeScript compilation: npm run typecheck');
  console.log('2. Run ESLint: npm run lint');
  console.log('3. Run build: npm run build');
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { applyFinalFixes };
