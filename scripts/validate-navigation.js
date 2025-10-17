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
