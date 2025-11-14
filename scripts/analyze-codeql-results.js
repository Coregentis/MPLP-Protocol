#!/usr/bin/env node

/**
 * CodeQL Results Analyzer
 * Analyzes CodeQL SARIF results and generates comprehensive reports
 * Using SCTM+GLFB+ITCM+RBCT Enhanced Framework
 */

const fs = require('fs');
const path = require('path');

// Color definitions
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logInfo(message) {
  log(`[INFO] ${message}`, 'cyan');
}

function logSuccess(message) {
  log(`[SUCCESS] ${message}`, 'green');
}

function logWarning(message) {
  log(`[WARNING] ${message}`, 'yellow');
}

function logError(message) {
  log(`[ERROR] ${message}`, 'red');
}

// ============================================================================
// Step 1: Find Latest SARIF Results
// ============================================================================
logInfo('Finding latest CodeQL SARIF results...');

const resultsDir = 'codeql-results';
if (!fs.existsSync(resultsDir)) {
  logError(`Results directory not found: ${resultsDir}`);
  process.exit(1);
}

const sarifFiles = fs.readdirSync(resultsDir)
  .filter(f => f.endsWith('.sarif'))
  .sort()
  .reverse();

if (sarifFiles.length === 0) {
  logWarning('No SARIF files found. Please run CodeQL analysis first.');
  logInfo('You can run CodeQL analysis using VSCode CodeQL extension:');
  logInfo('1. Open VSCode');
  logInfo('2. Open CodeQL extension');
  logInfo('3. Select the codeql-db database');
  logInfo('4. Run queries from security-and-quality suite');
  process.exit(0);
}

const latestSarif = sarifFiles[0];
const sarifPath = path.join(resultsDir, latestSarif);

logSuccess(`Found latest SARIF file: ${latestSarif}`);

// ============================================================================
// Step 2: Parse SARIF Results
// ============================================================================
logInfo('Parsing SARIF results...');

let sarif;
try {
  const content = fs.readFileSync(sarifPath, 'utf8');
  sarif = JSON.parse(content);
} catch (error) {
  logError(`Failed to parse SARIF file: ${error.message}`);
  process.exit(1);
}

logSuccess('SARIF file parsed successfully');

// ============================================================================
// Step 3: Analyze Results
// ============================================================================
logInfo('Analyzing CodeQL results...');

const analysis = {
  totalIssues: 0,
  byLevel: {
    error: 0,
    warning: 0,
    note: 0,
  },
  byRule: {},
  byFile: {},
  issues: [],
};

// Process each run
if (sarif.runs && Array.isArray(sarif.runs)) {
  for (const run of sarif.runs) {
    if (run.results && Array.isArray(run.results)) {
      for (const result of run.results) {
        analysis.totalIssues++;
        
        // Count by level
        const level = result.level || 'warning';
        if (analysis.byLevel[level] !== undefined) {
          analysis.byLevel[level]++;
        }
        
        // Count by rule
        const ruleId = result.ruleId || 'unknown';
        if (!analysis.byRule[ruleId]) {
          analysis.byRule[ruleId] = 0;
        }
        analysis.byRule[ruleId]++;
        
        // Count by file
        if (result.locations && result.locations.length > 0) {
          const location = result.locations[0];
          if (location.physicalLocation && location.physicalLocation.artifactLocation) {
            const file = location.physicalLocation.artifactLocation.uri;
            if (!analysis.byFile[file]) {
              analysis.byFile[file] = 0;
            }
            analysis.byFile[file]++;
          }
        }
        
        // Store issue details
        analysis.issues.push({
          level,
          ruleId,
          message: result.message?.text || 'No message',
          location: result.locations?.[0]?.physicalLocation?.artifactLocation?.uri || 'unknown',
          line: result.locations?.[0]?.physicalLocation?.region?.startLine || 0,
        });
      }
    }
  }
}

// ============================================================================
// Step 4: Generate Report
// ============================================================================
logInfo('Generating analysis report...');

console.log('\n' + '='.repeat(80));
console.log('CodeQL Analysis Report');
console.log('='.repeat(80) + '\n');

// Summary
log('📊 Summary:', 'cyan');
log(`Total Issues: ${analysis.totalIssues}`, 'cyan');
log(`  - Errors: ${analysis.byLevel.error}`, 'red');
log(`  - Warnings: ${analysis.byLevel.warning}`, 'yellow');
log(`  - Notes: ${analysis.byLevel.note}`, 'cyan');

// Top rules
console.log('\n' + '-'.repeat(80));
log('🔍 Top Issues by Rule:', 'cyan');
const topRules = Object.entries(analysis.byRule)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10);

topRules.forEach(([rule, count], index) => {
  log(`${index + 1}. ${rule}: ${count} issues`, 'yellow');
});

// Top files
console.log('\n' + '-'.repeat(80));
log('📁 Top Files with Issues:', 'cyan');
const topFiles = Object.entries(analysis.byFile)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10);

topFiles.forEach(([file, count], index) => {
  log(`${index + 1}. ${file}: ${count} issues`, 'yellow');
});

// Save detailed report
const reportPath = path.join(resultsDir, `report_${Date.now()}.json`);
fs.writeFileSync(reportPath, JSON.stringify(analysis, null, 2));
logSuccess(`Detailed report saved to: ${reportPath}`);

console.log('\n' + '='.repeat(80));
logSuccess('CodeQL analysis completed!');
console.log('='.repeat(80) + '\n');

// ============================================================================
// Step 5: Recommendations
// ============================================================================
log('💡 Recommendations:', 'cyan');
log('1. Review the top issues by rule and fix them systematically', 'cyan');
log('2. Focus on error-level issues first', 'cyan');
log('3. Use VSCode CodeQL extension to navigate to specific issues', 'cyan');
log('4. Run CodeQL analysis again after fixes to verify improvements', 'cyan');

