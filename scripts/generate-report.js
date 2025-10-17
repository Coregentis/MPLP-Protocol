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
