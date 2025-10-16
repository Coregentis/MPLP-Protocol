#!/usr/bin/env node

/**
 * @fileoverview Phase 2 Quality Fix - Precise Type Corrections
 * @version 1.1.0-beta
 * 
 * This script fixes the TypeScript compilation errors introduced by
 * overly aggressive 'unknown' type replacements in Phase 1.
 */

const fs = require('fs');
const path = require('path');

// Precise type corrections for specific contexts
const PRECISE_TYPE_FIXES = {
  // Content-related types
  'content: unknown': 'content: ContentItem',
  'input: unknown': 'input: Partial<ContentItem>',
  'results: unknown': 'results: Record<string, PublishResult>',
  'publishResults: unknown': 'publishResults: Record<string, PublishResult>',
  'adapter: unknown': 'adapter: PlatformAdapter',
  'interaction: unknown': 'interaction: SocialInteraction',
  
  // Function return types that should be specific
  'Promise<unknown>': 'Promise<ContentItem>',
  ': unknown {': ': ContentItem {',
  
  // Object spread fixes
  '{ ...content }': '{ ...(content as ContentItem) }',
  '{ ...unknown }': '{ ...(content as Record<string, unknown>) }',
  
  // Type assertions for Object methods
  'Object.keys(unknown)': 'Object.keys(publishResults as Record<string, unknown>)',
  'Object.values(unknown)': 'Object.values(publishResults as Record<string, unknown>)',
  'Object.entries(unknown)': 'Object.entries(results as Record<string, unknown>)',
  
  // Filter callbacks
  '(r: unknown) => r.success': '(r: any) => (r as PublishResult).success',
  '(r: unknown) => !r.success': '(r: any) => !(r as PublishResult).success',
};

// Additional type definitions needed
const TYPE_DEFINITIONS = `
/**
 * Platform adapter interface
 */
export interface PlatformAdapter {
  initialize(config: PlatformConfig): Promise<void>;
  publish(content: ContentItem): Promise<PublishResult>;
  monitor(): Promise<SocialActivity[]>;
  handleInteraction(interaction: SocialInteraction): Promise<InteractionResult>;
  getMetrics(): Promise<PlatformMetrics>;
  isConnected(): boolean;
  start?(): Promise<void>;
  stop?(): Promise<void>;
}

/**
 * Publish result
 */
export interface PublishResult {
  success: boolean;
  postId?: string;
  error?: string;
  timestamp: string;
}

/**
 * Social interaction
 */
export interface SocialInteraction {
  type: 'like' | 'comment' | 'share' | 'mention';
  postId: string;
  userId: string;
  content?: string;
  timestamp: string;
}

/**
 * Interaction result
 */
export interface InteractionResult {
  success: boolean;
  action: string;
  error?: string;
}

/**
 * Social activity
 */
export interface SocialActivity {
  type: string;
  content: string;
  timestamp: string;
  engagement: {
    likes: number;
    comments: number;
    shares: number;
  };
}

/**
 * Platform metrics
 */
export interface PlatformMetrics {
  followers: number;
  engagement: number;
  reach: number;
  impressions: number;
}
`;

/**
 * Fix TypeScript compilation errors in a file
 */
function fixTypeScriptErrors(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Apply precise type fixes
  for (const [oldType, newType] of Object.entries(PRECISE_TYPE_FIXES)) {
    if (content.includes(oldType)) {
      content = content.replace(new RegExp(oldType.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newType);
      modified = true;
      console.log(`  Fixed type: ${oldType} -> ${newType}`);
    }
  }

  // Fix BotStatus reference issues
  if (content.includes('BotStatus') && !content.includes('_BotStatus')) {
    content = content.replace(/BotStatus/g, '_BotStatus');
    modified = true;
    console.log('  Fixed BotStatus references');
  }

  // Fix error variable references
  if (content.includes('error') && content.includes('_error')) {
    content = content.replace(/(?<!_)error(?!\w)/g, '_error');
    modified = true;
    console.log('  Fixed error variable references');
  }

  // Add type guards for unknown types
  const typeGuardPatterns = [
    {
      pattern: /if \(([^)]+) as unknown\)\.success\)/g,
      replacement: 'if (($1 as PublishResult).success)'
    },
    {
      pattern: /([^.]+)\.text\?\./g,
      replacement: '($1 as ContentItem).text?.'
    }
  ];

  for (const { pattern, replacement } of typeGuardPatterns) {
    if (pattern.test(content)) {
      content = content.replace(pattern, replacement);
      modified = true;
      console.log('  Added type guards');
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed TypeScript errors in: ${filePath}`);
  }
}

/**
 * Add missing type definitions to types file
 */
function addMissingTypes(typesFilePath) {
  if (!fs.existsSync(typesFilePath)) {
    return;
  }

  let content = fs.readFileSync(typesFilePath, 'utf8');
  
  // Check if types already exist
  if (!content.includes('PlatformAdapter')) {
    content += '\n' + TYPE_DEFINITIONS;
    fs.writeFileSync(typesFilePath, content, 'utf8');
    console.log(`✅ Added missing type definitions to: ${typesFilePath}`);
  }
}

/**
 * Main execution
 */
function main() {
  console.log('🔧 Starting Phase 2 Quality Fix - Precise Type Corrections...\n');

  const examples = ['social-media-bot', 'marketing-automation', 'agent-orchestrator'];

  for (const example of examples) {
    const examplePath = path.join(__dirname, example);
    console.log(`📁 Processing example: ${example}`);
    
    if (!fs.existsSync(examplePath)) {
      console.log(`❌ Example not found: ${examplePath}`);
      continue;
    }

    // Add missing types
    const typesPath = path.join(examplePath, 'src', 'types', 'index.ts');
    addMissingTypes(typesPath);

    // Fix TypeScript errors in all source files
    const srcPath = path.join(examplePath, 'src');
    if (fs.existsSync(srcPath)) {
      const files = fs.readdirSync(srcPath, { withFileTypes: true, recursive: true });
      
      for (const file of files) {
        if (file.isFile() && file.name.endsWith('.ts') && !file.name.endsWith('.d.ts')) {
          const fullPath = path.join(file.path || srcPath, file.name);
          fixTypeScriptErrors(fullPath);
        }
      }
    }
    
    console.log(`✅ Completed: ${example}\n`);
  }

  console.log('🎉 Phase 2 quality fix completed!');
  console.log('\n📋 Next steps:');
  console.log('1. Run TypeScript compilation: npm run typecheck');
  console.log('2. Run build: npm run build');
  console.log('3. Fix any remaining issues manually');
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { fixTypeScriptErrors, addMissingTypes };
