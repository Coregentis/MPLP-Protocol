#!/usr/bin/env node

/**
 * Add Missing CryptoRandom Imports
 * 
 * This script automatically adds missing CryptoRandom import statements
 * to files that use CryptoRandom but don't import it.
 * 
 * Based on SCTM+GLFB+ITCM+RBCT framework analysis
 * 
 * Target: 47+ files with "Cannot find name 'CryptoRandom'" errors
 */

const fs = require('fs');
const path = require('path');

// Statistics
const stats = {
  filesScanned: 0,
  filesModified: 0,
  importsAdded: 0,
  errors: [],
};

/**
 * Check if file uses CryptoRandom
 */
function usesCryptoRandom(content) {
  return content.includes('CryptoRandom.');
}

/**
 * Check if file already has CryptoRandom import
 */
function hasCryptoRandomImport(content) {
  return content.includes("from '@/core/utils/crypto-random.util'") ||
         content.includes("from '../core/utils/crypto-random.util'") ||
         content.includes('from "../../core/utils/crypto-random.util"') ||
         content.includes('from "../../../core/utils/crypto-random.util"') ||
         content.includes('from "../../../../core/utils/crypto-random.util"') ||
         content.includes('from "../../../../../core/utils/crypto-random.util"');
}

/**
 * Calculate relative path to crypto-random.util.ts
 */
function getRelativeImportPath(filePath) {
  // Normalize path separators
  const normalizedPath = filePath.replace(/\\/g, '/');
  
  // Count directory depth from src/
  const srcIndex = normalizedPath.indexOf('src/');
  if (srcIndex === -1) {
    // For SDK files
    if (normalizedPath.includes('sdk/')) {
      return '@/core/utils/crypto-random.util';
    }
    return '@/core/utils/crypto-random.util';
  }
  
  const relativePath = normalizedPath.substring(srcIndex + 4); // Remove 'src/'
  const depth = (relativePath.match(/\//g) || []).length;
  
  if (depth === 0) {
    return './core/utils/crypto-random.util';
  }
  
  const upLevels = '../'.repeat(depth);
  return `${upLevels}core/utils/crypto-random.util`;
}

/**
 * Add CryptoRandom import to file
 */
function addCryptoRandomImport(content, filePath) {
  const lines = content.split('\n');
  let lastImportIndex = -1;
  let inMultiLineImport = false;

  // Find last complete import statement
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip comments and empty lines
    if (line.startsWith('//') || line.startsWith('/*') || line.startsWith('*') || line === '') {
      continue;
    }

    // Check for multi-line import start
    if (line.startsWith('import ') && !line.includes(';')) {
      inMultiLineImport = true;
      continue;
    }

    // Check for multi-line import end
    if (inMultiLineImport) {
      if (line.includes(';')) {
        lastImportIndex = i;
        inMultiLineImport = false;
      }
      continue;
    }

    // Check if it's a single-line import statement
    if (line.startsWith('import ') && line.includes(';')) {
      lastImportIndex = i;
    } else if (!inMultiLineImport && line.length > 0) {
      // First non-import, non-comment line
      break;
    }
  }

  // Determine import path
  const importPath = getRelativeImportPath(filePath);
  const importStatement = `import { CryptoRandom } from '${importPath}';`;

  // Insert import statement after last import
  if (lastImportIndex !== -1) {
    lines.splice(lastImportIndex + 1, 0, importStatement);
  } else {
    // No imports found, insert at beginning (after comments)
    let insertIndex = 0;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line.startsWith('/**') && !line.startsWith('*') && !line.startsWith('//') && line !== '') {
        insertIndex = i;
        break;
      }
    }
    lines.splice(insertIndex, 0, importStatement, '');
  }

  return lines.join('\n');
}

/**
 * Process a single file
 */
function processFile(filePath) {
  stats.filesScanned++;
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if file uses CryptoRandom
    if (!usesCryptoRandom(content)) {
      return;
    }
    
    // Check if import already exists
    if (hasCryptoRandomImport(content)) {
      console.log(`  ⏭️  Already has import: ${filePath}`);
      return;
    }
    
    // Add import
    const newContent = addCryptoRandomImport(content, filePath);
    
    // Write back
    fs.writeFileSync(filePath, newContent, 'utf8');
    
    stats.filesModified++;
    stats.importsAdded++;
    console.log(`  ✅ Added import: ${filePath}`);
    
  } catch (error) {
    stats.errors.push({ file: filePath, error: error.message });
    console.error(`  ❌ Error processing ${filePath}: ${error.message}`);
  }
}

/**
 * Recursively process directory
 */
function processDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      // Skip node_modules, dist, .git
      if (['node_modules', 'dist', '.git', '.augment'].includes(entry.name)) {
        continue;
      }
      processDirectory(fullPath);
    } else if (entry.isFile()) {
      // Only process TypeScript files (not tests)
      if (fullPath.endsWith('.ts') && !fullPath.endsWith('.test.ts') && !fullPath.endsWith('.spec.ts')) {
        processFile(fullPath);
      }
    }
  }
}

/**
 * Main execution
 */
function main() {
  console.log('🔒 Adding Missing CryptoRandom Imports\n');
  console.log('━'.repeat(70));
  console.log('Based on SCTM+GLFB+ITCM+RBCT Framework Analysis');
  console.log('Target: Files using CryptoRandom without import');
  console.log('━'.repeat(70));
  
  // Process src directory
  if (fs.existsSync('src')) {
    console.log('\n📁 Processing src/');
    processDirectory('src');
  }
  
  // Process sdk directory
  if (fs.existsSync('sdk')) {
    console.log('\n📁 Processing sdk/');
    processDirectory('sdk');
  }
  
  // Print summary
  console.log('\n' + '━'.repeat(70));
  console.log('📊 Summary:');
  console.log(`   Files scanned: ${stats.filesScanned}`);
  console.log(`   Files modified: ${stats.filesModified}`);
  console.log(`   Imports added: ${stats.importsAdded}`);
  
  if (stats.errors.length > 0) {
    console.log(`\n   ⚠️  Errors: ${stats.errors.length}`);
    stats.errors.forEach(({ file, error }) => {
      console.log(`      - ${file}: ${error}`);
    });
  }
  
  console.log('\n✅ Import addition completed!');
  console.log('\n📝 Next steps:');
  console.log('   1. Run: npm run typecheck');
  console.log('   2. Run: npm run lint');
  console.log('   3. Run: npm test');
  console.log('   4. Review changes and commit');
  console.log('━'.repeat(70));
}

// Run the script
main();

