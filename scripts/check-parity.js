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
