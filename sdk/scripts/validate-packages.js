#!/usr/bin/env node

/**
 * Package Validation Script
 * 
 * Validates the structure and configuration of MPLP SDK packages
 * before building or publishing.
 */

const fs = require('fs');
const path = require('path');

const CONFIG = {
  packagesDir: path.join(__dirname, '..', 'packages'),
  verbose: process.argv.includes('--verbose'),
};

const log = {
  info: (msg) => console.log(`ℹ️  ${msg}`),
  success: (msg) => console.log(`✅ ${msg}`),
  warn: (msg) => console.log(`⚠️  ${msg}`),
  error: (msg) => console.error(`❌ ${msg}`),
  verbose: (msg) => CONFIG.verbose && console.log(`🔍 ${msg}`),
};

function validatePackageJson(packagePath, packageJson) {
  const errors = [];
  const warnings = [];

  // Required fields
  const requiredFields = ['name', 'version', 'description', 'main', 'types'];
  for (const field of requiredFields) {
    if (!packageJson[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // Name should start with @mplp/
  if (packageJson.name && !packageJson.name.startsWith('@mplp/')) {
    errors.push(`Package name should start with @mplp/, got: ${packageJson.name}`);
  }

  // Version should be 1.1.0-beta
  if (packageJson.version && packageJson.version !== '1.1.0-beta') {
    warnings.push(`Version should be 1.1.0-beta, got: ${packageJson.version}`);
  }

  // Check if main file exists
  if (packageJson.main) {
    const mainPath = path.join(packagePath, packageJson.main);
    if (!fs.existsSync(mainPath)) {
      // Check if it would exist after build
      const srcMainPath = packageJson.main.replace('/dist/', '/src/').replace('.js', '.ts');
      const srcPath = path.join(packagePath, srcMainPath);
      if (!fs.existsSync(srcPath)) {
        errors.push(`Main file not found: ${packageJson.main}`);
      }
    }
  }

  // Check if types file exists
  if (packageJson.types) {
    const typesPath = path.join(packagePath, packageJson.types);
    if (!fs.existsSync(typesPath)) {
      // Check if it would exist after build
      const srcTypesPath = packageJson.types.replace('/dist/', '/src/').replace('.d.ts', '.ts');
      const srcPath = path.join(packagePath, srcTypesPath);
      if (!fs.existsSync(srcPath)) {
        errors.push(`Types file not found: ${packageJson.types}`);
      }
    }
  }

  // Check scripts
  const recommendedScripts = ['build', 'test', 'lint', 'typecheck'];
  for (const script of recommendedScripts) {
    if (!packageJson.scripts || !packageJson.scripts[script]) {
      warnings.push(`Missing recommended script: ${script}`);
    }
  }

  // Check license
  if (!packageJson.license) {
    warnings.push('Missing license field');
  } else if (packageJson.license !== 'MIT') {
    warnings.push(`License should be MIT, got: ${packageJson.license}`);
  }

  // Check repository
  if (!packageJson.repository) {
    warnings.push('Missing repository field');
  }

  return { errors, warnings };
}

function validatePackageStructure(packagePath) {
  const errors = [];
  const warnings = [];

  // Check required directories
  const requiredDirs = ['src'];
  for (const dir of requiredDirs) {
    const dirPath = path.join(packagePath, dir);
    if (!fs.existsSync(dirPath)) {
      errors.push(`Missing required directory: ${dir}`);
    }
  }

  // Check for index file
  const indexFiles = ['src/index.ts', 'src/index.js'];
  const hasIndex = indexFiles.some(file => fs.existsSync(path.join(packagePath, file)));
  if (!hasIndex) {
    errors.push('Missing index file (src/index.ts or src/index.js)');
  }

  // Check for TypeScript config
  const tsconfigPath = path.join(packagePath, 'tsconfig.json');
  if (!fs.existsSync(tsconfigPath)) {
    warnings.push('Missing tsconfig.json');
  }

  // Check for README
  const readmePath = path.join(packagePath, 'README.md');
  if (!fs.existsSync(readmePath)) {
    warnings.push('Missing README.md');
  }

  return { errors, warnings };
}

function validatePackage(packageName) {
  const packagePath = path.join(CONFIG.packagesDir, packageName);
  const packageJsonPath = path.join(packagePath, 'package.json');

  log.verbose(`Validating package: ${packageName}`);

  if (!fs.existsSync(packageJsonPath)) {
    return {
      name: packageName,
      valid: false,
      errors: ['Missing package.json'],
      warnings: [],
    };
  }

  let packageJson;
  try {
    packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  } catch (error) {
    return {
      name: packageName,
      valid: false,
      errors: [`Invalid package.json: ${error.message}`],
      warnings: [],
    };
  }

  const jsonValidation = validatePackageJson(packagePath, packageJson);
  const structureValidation = validatePackageStructure(packagePath);

  const errors = [...jsonValidation.errors, ...structureValidation.errors];
  const warnings = [...jsonValidation.warnings, ...structureValidation.warnings];

  return {
    name: packageName,
    packageName: packageJson.name,
    version: packageJson.version,
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

function main() {
  log.info('🔍 Validating MPLP SDK packages...');

  if (!fs.existsSync(CONFIG.packagesDir)) {
    log.error(`Packages directory not found: ${CONFIG.packagesDir}`);
    process.exit(1);
  }

  const packageDirs = fs.readdirSync(CONFIG.packagesDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  if (packageDirs.length === 0) {
    log.warn('No packages found');
    return;
  }

  log.info(`Found ${packageDirs.length} packages to validate`);

  const results = packageDirs.map(validatePackage);
  
  // Generate report
  log.info('\n📊 Validation Report:');
  log.info('='.repeat(60));

  const valid = results.filter(r => r.valid);
  const invalid = results.filter(r => !r.valid);

  log.info(`✅ Valid packages: ${valid.length}`);
  valid.forEach(result => {
    log.success(`   ${result.packageName || result.name}@${result.version || 'unknown'}`);
    if (result.warnings.length > 0) {
      result.warnings.forEach(warning => log.warn(`     - ${warning}`));
    }
  });

  if (invalid.length > 0) {
    log.error(`❌ Invalid packages: ${invalid.length}`);
    invalid.forEach(result => {
      log.error(`   ${result.packageName || result.name}`);
      result.errors.forEach(error => log.error(`     - ${error}`));
      result.warnings.forEach(warning => log.warn(`     - ${warning}`));
    });
  }

  log.info('='.repeat(60));

  if (invalid.length > 0) {
    log.error('Package validation failed');
    process.exit(1);
  } else {
    log.success('All packages are valid! 🎉');
  }
}

if (require.main === module) {
  main();
}

module.exports = { validatePackage };
