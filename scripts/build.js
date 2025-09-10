#!/usr/bin/env node

/**
 * MPLP Build Script
 * Simple build script for Multi-Agent Protocol Lifecycle Platform
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔨 Building MPLP...');

try {
  // Clean dist directory
  if (fs.existsSync('dist')) {
    console.log('🧹 Cleaning dist directory...');
    execSync('rm -rf dist', { stdio: 'inherit' });
  }

  // TypeScript compilation
  console.log('📦 Compiling TypeScript...');
  execSync('npx tsc -p tsconfig.build.json', { stdio: 'inherit' });

  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
