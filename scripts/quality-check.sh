#!/bin/bash

# MPLP Documentation Quality Assurance Script
# Version: 1.0.0
# Usage: ./quality-check.sh [--full|--links|--parity|--navigation|--report]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOCS_DIR="docs"
REPORTS_DIR="reports"
SCRIPTS_DIR="scripts"
CONFIG_DIR="config"

# Create reports directory if it doesn't exist
mkdir -p "$REPORTS_DIR"

# Function to print colored output
print_status() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

print_header() {
    echo ""
    echo "========================================"
    print_status $BLUE "$1"
    echo "========================================"
}

print_success() {
    print_status $GREEN "✅ $1"
}

print_warning() {
    print_status $YELLOW "⚠️  $1"
}

print_error() {
    print_status $RED "❌ $1"
}

# Function to check if Node.js is available
check_dependencies() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is required but not installed. Please install Node.js first."
        exit 1
    fi
    
    if [ ! -f "package.json" ]; then
        print_warning "package.json not found. Creating basic package.json..."
        cat > package.json << EOF
{
  "name": "mplp-docs-quality",
  "version": "1.0.0",
  "description": "MPLP Documentation Quality Assurance Tools",
  "scripts": {
    "quality-check": "./scripts/quality-check.sh"
  },
  "dependencies": {
    "fs-extra": "^11.1.1",
    "glob": "^10.3.3",
    "markdown-link-check": "^3.11.2",
    "axios": "^1.5.0"
  }
}
EOF
        print_success "Created package.json"
    fi
    
    if [ ! -d "node_modules" ]; then
        print_status $BLUE "Installing dependencies..."
        npm install
        print_success "Dependencies installed"
    fi
}

# Function to validate links
validate_links() {
    print_header "🔗 LINK VALIDATION"
    
    local total_files=0
    local files_with_issues=0
    local total_links=0
    local broken_links=0
    
    # Create link validation script if it doesn't exist
    if [ ! -f "$SCRIPTS_DIR/validate-links.js" ]; then
        cat > "$SCRIPTS_DIR/validate-links.js" << 'EOF'
const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');

async function validateLinks() {
    const markdownFiles = glob.sync('docs/**/*.md');
    const results = {
        totalFiles: markdownFiles.length,
        filesWithIssues: 0,
        totalLinks: 0,
        brokenLinks: [],
        summary: {}
    };
    
    for (const file of markdownFiles) {
        const content = await fs.readFile(file, 'utf8');
        const links = extractLinks(content);
        results.totalLinks += links.length;
        
        const brokenLinksInFile = [];
        
        for (const link of links) {
            if (link.type === 'internal') {
                const targetPath = resolveInternalLink(file, link.url);
                if (!await fs.pathExists(targetPath)) {
                    brokenLinksInFile.push({
                        file,
                        line: link.line,
                        url: link.url,
                        type: 'internal',
                        issue: 'File not found'
                    });
                }
            }
        }
        
        if (brokenLinksInFile.length > 0) {
            results.filesWithIssues++;
            results.brokenLinks.push(...brokenLinksInFile);
        }
    }
    
    // Generate summary by category
    const categories = ['sdk-api', 'platform-adapters', 'development-tools', 'project-management'];
    for (const category of categories) {
        const categoryFiles = markdownFiles.filter(f => f.includes(category));
        const categoryBrokenLinks = results.brokenLinks.filter(l => l.file.includes(category));
        
        results.summary[category] = {
            files: categoryFiles.length,
            brokenLinks: categoryBrokenLinks.length,
            healthScore: categoryFiles.length > 0 ? 
                Math.round((1 - categoryBrokenLinks.length / Math.max(categoryFiles.length, 1)) * 100) : 100
        };
    }
    
    await fs.writeJson('reports/link-validation.json', results, { spaces: 2 });
    
    console.log(`📊 Link Validation Results:`);
    console.log(`   Total files: ${results.totalFiles}`);
    console.log(`   Files with issues: ${results.filesWithIssues}`);
    console.log(`   Total links: ${results.totalLinks}`);
    console.log(`   Broken links: ${results.brokenLinks.length}`);
    
    if (results.brokenLinks.length > 0) {
        console.log(`\n🔍 Broken Links:`);
        results.brokenLinks.forEach((link, index) => {
            console.log(`   ${index + 1}. ${link.file}:${link.line} → ${link.url} (${link.issue})`);
        });
    }
    
    return results.brokenLinks.length === 0;
}

function extractLinks(content) {
    const links = [];
    const linkRegex = /\[([^\]]*)\]\(([^)]+)\)/g;
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
        let match;
        while ((match = linkRegex.exec(line)) !== null) {
            const url = match[2];
            links.push({
                text: match[1],
                url: url,
                line: index + 1,
                type: url.startsWith('http') ? 'external' : 'internal'
            });
        }
    });
    
    return links;
}

function resolveInternalLink(fromFile, linkUrl) {
    const fromDir = path.dirname(fromFile);
    
    // Handle anchor links
    const [filePath, anchor] = linkUrl.split('#');
    
    if (filePath === '') {
        // Same file anchor link
        return fromFile;
    }
    
    if (filePath.startsWith('/')) {
        // Absolute path from docs root
        return path.join('docs', filePath.substring(1));
    }
    
    // Relative path
    return path.resolve(fromDir, filePath);
}

validateLinks().then(success => {
    process.exit(success ? 0 : 1);
}).catch(error => {
    console.error('Error validating links:', error);
    process.exit(1);
});
EOF
    fi
    
    # Run link validation
    if node "$SCRIPTS_DIR/validate-links.js"; then
        print_success "Link validation completed successfully"
        return 0
    else
        print_error "Link validation found issues"
        return 1
    fi
}

# Function to check multi-language parity
check_parity() {
    print_header "🌐 MULTI-LANGUAGE PARITY CHECK"
    
    # Create parity check script if it doesn't exist
    if [ ! -f "$SCRIPTS_DIR/check-parity.js" ]; then
        cat > "$SCRIPTS_DIR/check-parity.js" << 'EOF'
const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');

async function checkParity() {
    const enFiles = glob.sync('docs/en/**/*.md');
    const zhFiles = glob.sync('docs/zh-CN/**/*.md');
    
    const results = {
        englishFiles: enFiles.length,
        chineseFiles: zhFiles.length,
        missingTranslations: [],
        extraTranslations: [],
        contentMismatches: [],
        parityScore: 0,
        categoryAnalysis: {}
    };
    
    // Check for missing translations
    for (const enFile of enFiles) {
        const relativePath = path.relative('docs/en', enFile);
        const zhFile = path.join('docs/zh-CN', relativePath);
        
        if (!await fs.pathExists(zhFile)) {
            results.missingTranslations.push({
                english: enFile,
                expectedChinese: zhFile
            });
        } else {
            // Check content length difference
            const enContent = await fs.readFile(enFile, 'utf8');
            const zhContent = await fs.readFile(zhFile, 'utf8');
            
            const enWordCount = enContent.split(/\s+/).length;
            const zhCharCount = zhContent.length;
            
            // Rough estimation: 1 English word ≈ 2 Chinese characters
            const expectedZhLength = enWordCount * 2;
            const lengthDifference = Math.abs(zhCharCount - expectedZhLength) / expectedZhLength;
            
            if (lengthDifference > 0.3) { // More than 30% difference
                results.contentMismatches.push({
                    english: enFile,
                    chinese: zhFile,
                    enWordCount,
                    zhCharCount,
                    lengthDifference: Math.round(lengthDifference * 100)
                });
            }
        }
    }
    
    // Check for extra translations
    for (const zhFile of zhFiles) {
        const relativePath = path.relative('docs/zh-CN', zhFile);
        const enFile = path.join('docs/en', relativePath);
        
        if (!await fs.pathExists(enFile)) {
            results.extraTranslations.push({
                chinese: zhFile,
                expectedEnglish: enFile
            });
        }
    }
    
    // Calculate parity score
    const totalExpectedFiles = Math.max(enFiles.length, zhFiles.length);
    const matchingFiles = totalExpectedFiles - results.missingTranslations.length - results.extraTranslations.length;
    results.parityScore = Math.round((matchingFiles / totalExpectedFiles) * 100);
    
    // Category analysis
    const categories = ['sdk-api', 'platform-adapters', 'development-tools', 'project-management'];
    for (const category of categories) {
        const categoryEnFiles = enFiles.filter(f => f.includes(category));
        const categoryZhFiles = zhFiles.filter(f => f.includes(category));
        const categoryMissing = results.missingTranslations.filter(m => m.english.includes(category));
        
        results.categoryAnalysis[category] = {
            englishFiles: categoryEnFiles.length,
            chineseFiles: categoryZhFiles.length,
            missingTranslations: categoryMissing.length,
            parityScore: categoryEnFiles.length > 0 ? 
                Math.round((1 - categoryMissing.length / categoryEnFiles.length) * 100) : 100
        };
    }
    
    await fs.writeJson('reports/parity-check.json', results, { spaces: 2 });
    
    console.log(`📊 Multi-language Parity Results:`);
    console.log(`   English files: ${results.englishFiles}`);
    console.log(`   Chinese files: ${results.chineseFiles}`);
    console.log(`   Missing translations: ${results.missingTranslations.length}`);
    console.log(`   Extra translations: ${results.extraTranslations.length}`);
    console.log(`   Content mismatches: ${results.contentMismatches.length}`);
    console.log(`   Parity score: ${results.parityScore}%`);
    
    if (results.missingTranslations.length > 0) {
        console.log(`\n🔍 Missing Translations:`);
        results.missingTranslations.forEach((item, index) => {
            console.log(`   ${index + 1}. ${item.english} → ${item.expectedChinese}`);
        });
    }
    
    if (results.contentMismatches.length > 0) {
        console.log(`\n🔍 Content Length Mismatches:`);
        results.contentMismatches.forEach((item, index) => {
            console.log(`   ${index + 1}. ${item.english} (${item.enWordCount} words) vs ${item.chinese} (${item.zhCharCount} chars) - ${item.lengthDifference}% difference`);
        });
    }
    
    return results.missingTranslations.length === 0 && results.contentMismatches.length === 0;
}

checkParity().then(success => {
    process.exit(success ? 0 : 1);
}).catch(error => {
    console.error('Error checking parity:', error);
    process.exit(1);
});
EOF
    fi
    
    # Run parity check
    if node "$SCRIPTS_DIR/check-parity.js"; then
        print_success "Multi-language parity check completed successfully"
        return 0
    else
        print_error "Multi-language parity check found issues"
        return 1
    fi
}

# Function to validate navigation
validate_navigation() {
    print_header "🧭 NAVIGATION VALIDATION"
    
    # Create navigation validation script if it doesn't exist
    if [ ! -f "$SCRIPTS_DIR/validate-navigation.js" ]; then
        cat > "$SCRIPTS_DIR/validate-navigation.js" << 'EOF'
const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');

async function validateNavigation() {
    const markdownFiles = glob.sync('docs/**/*.md');
    const results = {
        totalFiles: markdownFiles.length,
        filesWithNavigation: 0,
        navigationIssues: [],
        languageNavigationMissing: [],
        inconsistentNavigation: [],
        navigationScore: 0
    };
    
    for (const file of markdownFiles) {
        const content = await fs.readFile(file, 'utf8');
        const hasLanguageNav = content.includes('🌐 Language Navigation') || content.includes('🌐 语言导航');
        
        if (hasLanguageNav) {
            results.filesWithNavigation++;
            
            // Check if navigation links are consistent
            const navLinks = extractNavigationLinks(content);
            const issues = validateNavigationLinks(file, navLinks);
            
            if (issues.length > 0) {
                results.navigationIssues.push({
                    file,
                    issues
                });
            }
        } else {
            // Skip certain files that don't need navigation
            const skipFiles = ['README.md', 'LANGUAGE-GUIDE.md'];
            const fileName = path.basename(file);
            
            if (!skipFiles.includes(fileName)) {
                results.languageNavigationMissing.push(file);
            }
        }
    }
    
    results.navigationScore = results.totalFiles > 0 ? 
        Math.round((results.filesWithNavigation / results.totalFiles) * 100) : 100;
    
    await fs.writeJson('reports/navigation-validation.json', results, { spaces: 2 });
    
    console.log(`📊 Navigation Validation Results:`);
    console.log(`   Total files: ${results.totalFiles}`);
    console.log(`   Files with navigation: ${results.filesWithNavigation}`);
    console.log(`   Navigation issues: ${results.navigationIssues.length}`);
    console.log(`   Missing language navigation: ${results.languageNavigationMissing.length}`);
    console.log(`   Navigation score: ${results.navigationScore}%`);
    
    if (results.languageNavigationMissing.length > 0) {
        console.log(`\n🔍 Files Missing Language Navigation:`);
        results.languageNavigationMissing.forEach((file, index) => {
            console.log(`   ${index + 1}. ${file}`);
        });
    }
    
    return results.navigationIssues.length === 0 && results.languageNavigationMissing.length === 0;
}

function extractNavigationLinks(content) {
    const navRegex = />.*🌐.*Language Navigation.*:.*\[(.*?)\]\((.*?)\)/g;
    const links = [];
    let match;
    
    while ((match = navRegex.exec(content)) !== null) {
        links.push({
            text: match[1],
            url: match[2]
        });
    }
    
    return links;
}

function validateNavigationLinks(file, navLinks) {
    const issues = [];
    const expectedLanguages = ['English', '中文', 'Español', 'Français', '日本語', '한국어'];
    
    // Check if required languages are present
    const presentLanguages = navLinks.map(link => link.text);
    
    if (!presentLanguages.includes('English') && !presentLanguages.includes('中文')) {
        issues.push('Missing required language navigation (English and Chinese)');
    }
    
    return issues;
}

validateNavigation().then(success => {
    process.exit(success ? 0 : 1);
}).catch(error => {
    console.error('Error validating navigation:', error);
    process.exit(1);
});
EOF
    fi
    
    # Run navigation validation
    if node "$SCRIPTS_DIR/validate-navigation.js"; then
        print_success "Navigation validation completed successfully"
        return 0
    else
        print_error "Navigation validation found issues"
        return 1
    fi
}

# Function to generate quality report
generate_report() {
    print_header "📊 GENERATING QUALITY REPORT"
    
    # Create report generation script if it doesn't exist
    if [ ! -f "$SCRIPTS_DIR/generate-report.js" ]; then
        cat > "$SCRIPTS_DIR/generate-report.js" << 'EOF'
const fs = require('fs-extra');
const path = require('path');

async function generateReport() {
    const timestamp = new Date().toISOString();
    
    // Load individual reports
    const linkReport = await loadReport('link-validation.json');
    const parityReport = await loadReport('parity-check.json');
    const navigationReport = await loadReport('navigation-validation.json');
    
    // Calculate overall quality score
    const linkScore = linkReport ? Math.round((1 - linkReport.brokenLinks.length / Math.max(linkReport.totalLinks, 1)) * 100) : 100;
    const parityScore = parityReport ? parityReport.parityScore : 100;
    const navigationScore = navigationReport ? navigationReport.navigationScore : 100;
    
    const overallScore = Math.round((linkScore + parityScore + navigationScore) / 3);
    
    const report = {
        timestamp,
        overallScore,
        summary: {
            totalDocuments: linkReport ? linkReport.totalFiles : 0,
            languages: 2,
            categories: 8
        },
        linkValidation: {
            score: linkScore,
            totalLinks: linkReport ? linkReport.totalLinks : 0,
            brokenLinks: linkReport ? linkReport.brokenLinks.length : 0,
            details: linkReport
        },
        multiLanguageParity: {
            score: parityScore,
            englishFiles: parityReport ? parityReport.englishFiles : 0,
            chineseFiles: parityReport ? parityReport.chineseFiles : 0,
            missingTranslations: parityReport ? parityReport.missingTranslations.length : 0,
            details: parityReport
        },
        navigationIntegrity: {
            score: navigationScore,
            totalFiles: navigationReport ? navigationReport.totalFiles : 0,
            filesWithNavigation: navigationReport ? navigationReport.filesWithNavigation : 0,
            navigationIssues: navigationReport ? navigationReport.navigationIssues.length : 0,
            details: navigationReport
        }
    };
    
    // Save JSON report
    await fs.writeJson('reports/quality-report.json', report, { spaces: 2 });
    
    // Generate HTML report
    const htmlReport = generateHTMLReport(report);
    await fs.writeFile('reports/quality-report.html', htmlReport);
    
    // Generate markdown summary
    const markdownSummary = generateMarkdownSummary(report);
    await fs.writeFile('reports/quality-summary.md', markdownSummary);
    
    console.log(`📊 Quality Report Generated:`);
    console.log(`   Overall Score: ${overallScore}%`);
    console.log(`   Link Validation: ${linkScore}%`);
    console.log(`   Multi-language Parity: ${parityScore}%`);
    console.log(`   Navigation Integrity: ${navigationScore}%`);
    console.log(`   Reports saved to: reports/`);
    
    return overallScore >= 95; // Consider 95%+ as passing
}

async function loadReport(filename) {
    try {
        return await fs.readJson(`reports/${filename}`);
    } catch (error) {
        console.warn(`Warning: Could not load ${filename}`);
        return null;
    }
}

function generateHTMLReport(report) {
    return `<!DOCTYPE html>
<html>
<head>
    <title>MPLP Documentation Quality Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 8px; }
        .score { font-size: 2em; font-weight: bold; color: ${report.overallScore >= 95 ? '#28a745' : report.overallScore >= 80 ? '#ffc107' : '#dc3545'}; }
        .section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .good { color: #28a745; }
        .warning { color: #ffc107; }
        .error { color: #dc3545; }
    </style>
</head>
<body>
    <div class="header">
        <h1>📋 MPLP Documentation Quality Report</h1>
        <p>Generated: ${report.timestamp}</p>
        <div class="score">Overall Score: ${report.overallScore}%</div>
    </div>
    
    <div class="section">
        <h2>📊 Summary</h2>
        <ul>
            <li>Total Documents: ${report.summary.totalDocuments}</li>
            <li>Languages: ${report.summary.languages}</li>
            <li>Categories: ${report.summary.categories}</li>
        </ul>
    </div>
    
    <div class="section">
        <h2>🔗 Link Validation</h2>
        <p class="${report.linkValidation.score >= 95 ? 'good' : 'warning'}">Score: ${report.linkValidation.score}%</p>
        <ul>
            <li>Total Links: ${report.linkValidation.totalLinks}</li>
            <li>Broken Links: ${report.linkValidation.brokenLinks}</li>
        </ul>
    </div>
    
    <div class="section">
        <h2>🌐 Multi-language Parity</h2>
        <p class="${report.multiLanguageParity.score >= 95 ? 'good' : 'warning'}">Score: ${report.multiLanguageParity.score}%</p>
        <ul>
            <li>English Files: ${report.multiLanguageParity.englishFiles}</li>
            <li>Chinese Files: ${report.multiLanguageParity.chineseFiles}</li>
            <li>Missing Translations: ${report.multiLanguageParity.missingTranslations}</li>
        </ul>
    </div>
    
    <div class="section">
        <h2>🧭 Navigation Integrity</h2>
        <p class="${report.navigationIntegrity.score >= 95 ? 'good' : 'warning'}">Score: ${report.navigationIntegrity.score}%</p>
        <ul>
            <li>Total Files: ${report.navigationIntegrity.totalFiles}</li>
            <li>Files with Navigation: ${report.navigationIntegrity.filesWithNavigation}</li>
            <li>Navigation Issues: ${report.navigationIntegrity.navigationIssues}</li>
        </ul>
    </div>
</body>
</html>`;
}

function generateMarkdownSummary(report) {
    return `# 📋 MPLP Documentation Quality Summary

**Generated**: ${report.timestamp}  
**Overall Score**: ${report.overallScore}%

## 📊 Summary
- **Total Documents**: ${report.summary.totalDocuments}
- **Languages**: ${report.summary.languages}
- **Categories**: ${report.summary.categories}

## 🔗 Link Validation
- **Score**: ${report.linkValidation.score}%
- **Total Links**: ${report.linkValidation.totalLinks}
- **Broken Links**: ${report.linkValidation.brokenLinks}

## 🌐 Multi-language Parity
- **Score**: ${report.multiLanguageParity.score}%
- **English Files**: ${report.multiLanguageParity.englishFiles}
- **Chinese Files**: ${report.multiLanguageParity.chineseFiles}
- **Missing Translations**: ${report.multiLanguageParity.missingTranslations}

## 🧭 Navigation Integrity
- **Score**: ${report.navigationIntegrity.score}%
- **Files with Navigation**: ${report.navigationIntegrity.filesWithNavigation}/${report.navigationIntegrity.totalFiles}
- **Navigation Issues**: ${report.navigationIntegrity.navigationIssues}

---
*Quality Assurance System v1.0.0*`;
}

generateReport().then(success => {
    process.exit(success ? 0 : 1);
}).catch(error => {
    console.error('Error generating report:', error);
    process.exit(1);
});
EOF
    fi
    
    # Run report generation
    if node "$SCRIPTS_DIR/generate-report.js"; then
        print_success "Quality report generated successfully"
        return 0
    else
        print_error "Quality report generation failed"
        return 1
    fi
}

# Main execution logic
main() {
    local command=${1:-"--full"}
    local exit_code=0
    
    print_header "🔍 MPLP DOCUMENTATION QUALITY ASSURANCE"
    echo "Version: 1.0.0"
    echo "Timestamp: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
    
    # Check dependencies
    check_dependencies
    
    # Create scripts directory if it doesn't exist
    mkdir -p "$SCRIPTS_DIR"
    
    case $command in
        "--full")
            print_status $BLUE "Running comprehensive quality check..."
            validate_links || exit_code=1
            check_parity || exit_code=1
            validate_navigation || exit_code=1
            generate_report || exit_code=1
            ;;
        "--links")
            validate_links || exit_code=1
            ;;
        "--parity")
            check_parity || exit_code=1
            ;;
        "--navigation")
            validate_navigation || exit_code=1
            ;;
        "--report")
            generate_report || exit_code=1
            ;;
        "--help"|"-h")
            echo "Usage: $0 [--full|--links|--parity|--navigation|--report|--help]"
            echo ""
            echo "Options:"
            echo "  --full        Run all quality checks (default)"
            echo "  --links       Validate links only"
            echo "  --parity      Check multi-language parity only"
            echo "  --navigation  Validate navigation only"
            echo "  --report      Generate quality report only"
            echo "  --help        Show this help message"
            exit 0
            ;;
        *)
            print_error "Unknown option: $command"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
    
    echo ""
    if [ $exit_code -eq 0 ]; then
        print_success "Quality assurance check completed successfully!"
        print_status $BLUE "Reports available in: $REPORTS_DIR/"
    else
        print_error "Quality assurance check completed with issues!"
        print_status $YELLOW "Check the reports in: $REPORTS_DIR/ for details"
    fi
    
    exit $exit_code
}

# Run main function with all arguments
main "$@"
