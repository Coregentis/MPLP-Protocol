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
