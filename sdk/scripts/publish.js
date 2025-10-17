#!/usr/bin/env node

/**
 * MPLP SDK Publishing Script
 * 
 * This script handles the publishing of MPLP SDK packages to npm.
 * It includes version management, build verification, and publishing workflow.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  registry: 'https://registry.npmjs.org/',
  distTag: 'beta',
  packagesDir: path.join(__dirname, '..', 'packages'),
  dryRun: process.argv.includes('--dry-run'),
  force: process.argv.includes('--force'),
  verbose: process.argv.includes('--verbose'),
};

// Logging utilities
const log = {
  info: (msg) => console.log(`ℹ️  ${msg}`),
  success: (msg) => console.log(`✅ ${msg}`),
  warn: (msg) => console.log(`⚠️  ${msg}`),
  error: (msg) => console.error(`❌ ${msg}`),
  verbose: (msg) => CONFIG.verbose && console.log(`🔍 ${msg}`),
};

// Utility functions
function execCommand(command, options = {}) {
  log.verbose(`Executing: ${command}`);
  try {
    const result = execSync(command, {
      encoding: 'utf8',
      stdio: CONFIG.verbose ? 'inherit' : 'pipe',
      ...options,
    });
    return result;
  } catch (error) {
    log.error(`Command failed: ${command}`);
    log.error(error.message);
    throw error;
  }
}

function getPackageInfo(packagePath) {
  const packageJsonPath = path.join(packagePath, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    return null;
  }
  
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  return {
    name: packageJson.name,
    version: packageJson.version,
    private: packageJson.private,
    path: packagePath,
    packageJson,
  };
}

function getPublishablePackages() {
  const packages = [];
  const packageDirs = fs.readdirSync(CONFIG.packagesDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  for (const dir of packageDirs) {
    const packagePath = path.join(CONFIG.packagesDir, dir);
    const packageInfo = getPackageInfo(packagePath);
    
    if (packageInfo && !packageInfo.private) {
      packages.push(packageInfo);
    }
  }

  return packages;
}

function validatePackage(packageInfo) {
  log.verbose(`Validating package: ${packageInfo.name}`);
  
  // Check if dist directory exists
  const distPath = path.join(packageInfo.path, 'dist');
  if (!fs.existsSync(distPath)) {
    throw new Error(`Package ${packageInfo.name} is missing dist directory`);
  }

  // Check if main entry point exists
  const mainFile = packageInfo.packageJson.main;
  if (mainFile) {
    const mainPath = path.join(packageInfo.path, mainFile);
    if (!fs.existsSync(mainPath)) {
      throw new Error(`Package ${packageInfo.name} main file not found: ${mainFile}`);
    }
  }

  // Check if types entry point exists
  const typesFile = packageInfo.packageJson.types;
  if (typesFile) {
    const typesPath = path.join(packageInfo.path, typesFile);
    if (!fs.existsSync(typesPath)) {
      throw new Error(`Package ${packageInfo.name} types file not found: ${typesFile}`);
    }
  }

  log.success(`Package ${packageInfo.name} validation passed`);
}

function checkNpmAuth() {
  try {
    const whoami = execCommand('npm whoami --registry=' + CONFIG.registry);
    log.info(`Authenticated as: ${whoami.trim()}`);
    return true;
  } catch (error) {
    log.error('Not authenticated with npm registry');
    log.error('Please run: npm login --registry=' + CONFIG.registry);
    return false;
  }
}

function isPackagePublished(packageName, version) {
  try {
    const result = execCommand(`npm view ${packageName}@${version} version --registry=${CONFIG.registry}`);
    return result.trim() === version;
  } catch (error) {
    return false;
  }
}

function publishPackage(packageInfo) {
  const { name, version, path: packagePath } = packageInfo;
  
  log.info(`Publishing ${name}@${version}...`);
  
  // Check if already published
  if (isPackagePublished(name, version) && !CONFIG.force) {
    log.warn(`Package ${name}@${version} is already published. Use --force to republish.`);
    return false;
  }

  // Validate package before publishing
  validatePackage(packageInfo);

  // Build publish command
  const publishCmd = [
    'npm publish',
    `--registry=${CONFIG.registry}`,
    `--tag=${CONFIG.distTag}`,
    CONFIG.dryRun ? '--dry-run' : '',
  ].filter(Boolean).join(' ');

  try {
    if (CONFIG.dryRun) {
      log.info(`[DRY RUN] Would publish: ${name}@${version}`);
    } else {
      execCommand(publishCmd, { cwd: packagePath });
      log.success(`Published ${name}@${version}`);
    }
    return true;
  } catch (error) {
    log.error(`Failed to publish ${name}@${version}`);
    throw error;
  }
}

function generatePublishReport(results) {
  log.info('\n📊 Publishing Report:');
  log.info('='.repeat(50));
  
  const published = results.filter(r => r.success && r.published);
  const skipped = results.filter(r => r.success && !r.published);
  const failed = results.filter(r => !r.success);

  log.info(`✅ Published: ${published.length} packages`);
  published.forEach(r => log.info(`   - ${r.package.name}@${r.package.version}`));

  if (skipped.length > 0) {
    log.info(`⏭️  Skipped: ${skipped.length} packages`);
    skipped.forEach(r => log.info(`   - ${r.package.name}@${r.package.version} (already published)`));
  }

  if (failed.length > 0) {
    log.error(`❌ Failed: ${failed.length} packages`);
    failed.forEach(r => log.error(`   - ${r.package.name}@${r.package.version}: ${r.error}`));
  }

  log.info('='.repeat(50));
  
  if (failed.length > 0) {
    process.exit(1);
  }
}

// Main publishing workflow
async function main() {
  try {
    log.info('🚀 Starting MPLP SDK publishing process...');
    
    if (CONFIG.dryRun) {
      log.warn('Running in DRY RUN mode - no packages will be actually published');
    }

    // Check npm authentication
    if (!CONFIG.dryRun && !checkNpmAuth()) {
      process.exit(1);
    }

    // Get publishable packages
    const packages = getPublishablePackages();
    log.info(`Found ${packages.length} publishable packages`);

    if (packages.length === 0) {
      log.warn('No publishable packages found');
      return;
    }

    // Build all packages first
    log.info('Building all packages...');
    try {
      execCommand('npm run build', { cwd: path.join(__dirname, '..') });
      log.success('All packages built successfully');
    } catch (error) {
      log.error('Build failed');
      throw error;
    }

    // Publish packages
    const results = [];
    
    for (const packageInfo of packages) {
      try {
        const published = publishPackage(packageInfo);
        results.push({
          package: packageInfo,
          success: true,
          published,
        });
      } catch (error) {
        results.push({
          package: packageInfo,
          success: false,
          published: false,
          error: error.message,
        });
      }
    }

    // Generate report
    generatePublishReport(results);
    
    log.success('🎉 Publishing process completed!');
    
  } catch (error) {
    log.error('Publishing process failed:');
    log.error(error.message);
    process.exit(1);
  }
}

// Help text
function showHelp() {
  console.log(`
MPLP SDK Publishing Script

Usage: node scripts/publish.js [options]

Options:
  --dry-run    Run without actually publishing packages
  --force      Force republish even if version already exists
  --verbose    Show detailed output
  --help       Show this help message

Examples:
  node scripts/publish.js --dry-run    # Test publishing without actually doing it
  node scripts/publish.js --verbose    # Publish with detailed output
  node scripts/publish.js --force      # Force republish existing versions
`);
}

// Handle command line arguments
if (process.argv.includes('--help')) {
  showHelp();
  process.exit(0);
}

// Run the main function
if (require.main === module) {
  main().catch(error => {
    log.error('Unhandled error:');
    log.error(error);
    process.exit(1);
  });
}

module.exports = {
  publishPackage,
  getPublishablePackages,
  validatePackage,
};
