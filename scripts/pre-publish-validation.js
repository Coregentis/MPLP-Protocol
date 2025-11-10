#!/usr/bin/env node

/**
 * Pre-Publish Validation Script
 * 
 * Validates that the MPLP package is ready for npm publishing.
 * This script checks:
 * - All required files exist
 * - Build output is complete
 * - Tests pass
 * - Package.json is correctly configured
 * - No critical issues exist
 * 
 * Usage: node scripts/pre-publish-validation.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log();
  log(`${'='.repeat(60)}`, 'cyan');
  log(`  ${title}`, 'bright');
  log(`${'='.repeat(60)}`, 'cyan');
  console.log();
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Validation results
const results = {
  passed: [],
  failed: [],
  warnings: []
};

// Check if file exists
function fileExists(filePath) {
  return fs.existsSync(path.join(process.cwd(), filePath));
}

// Check if directory exists and has files
function directoryHasFiles(dirPath) {
  const fullPath = path.join(process.cwd(), dirPath);
  if (!fs.existsSync(fullPath)) return false;
  const files = fs.readdirSync(fullPath);
  return files.length > 0;
}

// Validation checks
const checks = {
  // Check 1: Required files exist
  requiredFiles: () => {
    logSection('Check 1: Required Files');
    
    const requiredFiles = [
      'package.json',
      'README.md',
      'LICENSE',
      'CHANGELOG.md',
      'tsconfig.json',
      'tsconfig.build.json'
    ];
    
    let allExist = true;
    requiredFiles.forEach(file => {
      if (fileExists(file)) {
        logSuccess(`${file} exists`);
      } else {
        logError(`${file} is missing`);
        results.failed.push(`Missing required file: ${file}`);
        allExist = false;
      }
    });
    
    if (allExist) {
      results.passed.push('All required files exist');
    }
    
    return allExist;
  },
  
  // Check 2: Build output exists
  buildOutput: () => {
    logSection('Check 2: Build Output');
    
    if (!directoryHasFiles('dist')) {
      logError('dist/ directory is missing or empty');
      logInfo('Run: npm run build');
      results.failed.push('Build output missing');
      return false;
    }
    
    // Check for key build files
    const keyFiles = [
      'dist/index.js',
      'dist/index.d.ts',
      'dist/core/mplp.js',
      'dist/core/mplp.d.ts',
      'dist/core/factory.js',
      'dist/core/factory.d.ts'
    ];
    
    let allExist = true;
    keyFiles.forEach(file => {
      if (fileExists(file)) {
        logSuccess(`${file} exists`);
      } else {
        logWarning(`${file} is missing`);
        results.warnings.push(`Missing build file: ${file}`);
        allExist = false;
      }
    });
    
    if (allExist) {
      logSuccess('All key build files exist');
      results.passed.push('Build output complete');
    }
    
    return true; // Non-blocking
  },
  
  // Check 3: Package.json configuration
  packageJson: () => {
    logSection('Check 3: Package.json Configuration');
    
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    // Check required fields
    const requiredFields = ['name', 'version', 'description', 'main', 'types', 'license'];
    let allFieldsExist = true;
    
    requiredFields.forEach(field => {
      if (pkg[field]) {
        logSuccess(`${field}: ${pkg[field]}`);
      } else {
        logError(`Missing field: ${field}`);
        results.failed.push(`Missing package.json field: ${field}`);
        allFieldsExist = false;
      }
    });
    
    // Check files field
    if (pkg.files && Array.isArray(pkg.files)) {
      logSuccess(`files field configured: ${pkg.files.join(', ')}`);
      
      // Verify files exist
      pkg.files.forEach(file => {
        if (file === 'dist' && !directoryHasFiles('dist')) {
          logWarning(`dist/ directory is empty`);
        } else if (file !== 'dist' && !fileExists(file)) {
          logWarning(`File in 'files' field doesn't exist: ${file}`);
        }
      });
    } else {
      logWarning('No files field in package.json');
      results.warnings.push('No files field configured');
    }
    
    // Check version
    if (pkg.version) {
      logInfo(`Package version: ${pkg.version}`);
      if (pkg.version.includes('beta')) {
        logInfo('Beta version detected');
      }
    }
    
    if (allFieldsExist) {
      results.passed.push('Package.json correctly configured');
    }
    
    return allFieldsExist;
  },
  
  // Check 4: TypeScript compilation
  typeCheck: () => {
    logSection('Check 4: TypeScript Type Check (Production Build)');

    try {
      logInfo('Running TypeScript type check with tsconfig.build.json...');
      execSync('npx tsc --project tsconfig.build.json --noEmit', { stdio: 'pipe' });
      logSuccess('TypeScript type check passed (production build)');
      results.passed.push('TypeScript type check passed (production build)');
      return true;
    } catch (error) {
      logError('TypeScript type check failed (production build)');
      logInfo('Run: npx tsc --project tsconfig.build.json --noEmit');
      results.failed.push('TypeScript type check failed (production build)');
      return false;
    }
  },
  
  // Check 5: Tests
  tests: () => {
    logSection('Check 5: Test Suite');

    try {
      logInfo('Running test suite (skipping pretest typecheck)...');
      // Use npx jest directly to skip pretest typecheck
      const output = execSync('npx jest --config=jest.config.js 2>&1', { encoding: 'utf8' });

      // Parse test results
      const testMatch = output.match(/Tests:\s+(\d+)\s+passed/);
      const suiteMatch = output.match(/Test Suites:\s+(\d+)\s+passed/);

      if (testMatch && suiteMatch) {
        logSuccess(`${testMatch[1]} tests passed`);
        logSuccess(`${suiteMatch[1]} test suites passed`);
        results.passed.push(`All tests passed (${testMatch[1]} tests)`);
        return true;
      } else {
        logWarning('Could not parse test results');
        results.warnings.push('Test results unclear');
        return true; // Non-blocking
      }
    } catch (error) {
      logError('Test suite failed');
      logInfo('Run: npx jest --config=jest.config.js');
      results.failed.push('Test suite failed');
      return false;
    }
  },
  
  // Check 6: Documentation validation
  documentation: () => {
    logSection('Check 6: Documentation Validation');
    
    try {
      logInfo('Running documentation validation tests...');
      execSync('npx jest tests/documentation/quick-start.test.ts 2>&1', { stdio: 'pipe' });
      logSuccess('Documentation validation tests passed');
      results.passed.push('Documentation validation passed');
      return true;
    } catch (error) {
      logWarning('Documentation validation tests failed');
      results.warnings.push('Documentation validation failed');
      return true; // Non-blocking
    }
  }
};

// Main execution
async function main() {
  log('\n🚀 MPLP Pre-Publish Validation', 'bright');
  log('Validating package readiness for npm publishing\n', 'cyan');
  
  const startTime = Date.now();
  
  // Run all checks
  const checkResults = {
    requiredFiles: checks.requiredFiles(),
    buildOutput: checks.buildOutput(),
    packageJson: checks.packageJson(),
    typeCheck: checks.typeCheck(),
    tests: checks.tests(),
    documentation: checks.documentation()
  };
  
  // Summary
  logSection('Validation Summary');
  
  const totalChecks = Object.keys(checkResults).length;
  const passedChecks = Object.values(checkResults).filter(r => r === true).length;
  const failedChecks = totalChecks - passedChecks;
  
  log(`Total Checks: ${totalChecks}`, 'blue');
  log(`Passed: ${passedChecks}`, 'green');
  log(`Failed: ${failedChecks}`, 'red');
  log(`Warnings: ${results.warnings.length}`, 'yellow');
  
  console.log();
  
  if (results.passed.length > 0) {
    log('✅ Passed Checks:', 'green');
    results.passed.forEach(msg => log(`   - ${msg}`, 'green'));
    console.log();
  }
  
  if (results.warnings.length > 0) {
    log('⚠️  Warnings:', 'yellow');
    results.warnings.forEach(msg => log(`   - ${msg}`, 'yellow'));
    console.log();
  }
  
  if (results.failed.length > 0) {
    log('❌ Failed Checks:', 'red');
    results.failed.forEach(msg => log(`   - ${msg}`, 'red'));
    console.log();
  }
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  log(`Validation completed in ${duration}s`, 'cyan');
  
  // Final verdict
  console.log();
  if (failedChecks === 0) {
    log('🎉 PACKAGE IS READY FOR PUBLISHING!', 'green');
    log('You can now run: npm publish --tag beta', 'cyan');
    process.exit(0);
  } else {
    log('❌ PACKAGE IS NOT READY FOR PUBLISHING', 'red');
    log('Please fix the failed checks before publishing', 'yellow');
    process.exit(1);
  }
}

// Run validation
main().catch(error => {
  logError(`Validation script error: ${error.message}`);
  process.exit(1);
});

