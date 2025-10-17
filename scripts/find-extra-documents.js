#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function getAllFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            getAllFiles(filePath, fileList);
        } else if (file.endsWith('.md')) {
            fileList.push(filePath);
        }
    });
    
    return fileList;
}

function findExtraDocuments() {
    const enDir = 'docs/en';
    const zhDir = 'docs/zh-CN';
    
    console.log('🔍 Finding extra Chinese documents...\n');
    
    // Get all English and Chinese files
    const enFiles = getAllFiles(enDir).map(f => f.replace(/\\/g, '/').replace('docs/en/', ''));
    const zhFiles = getAllFiles(zhDir).map(f => f.replace(/\\/g, '/').replace('docs/zh-CN/', ''));
    
    console.log(`📊 File counts:`);
    console.log(`   English files: ${enFiles.length}`);
    console.log(`   Chinese files: ${zhFiles.length}`);
    console.log(`   Difference: ${zhFiles.length - enFiles.length}\n`);
    
    // Find extra Chinese files
    const extraZhFiles = zhFiles.filter(zhFile => !enFiles.includes(zhFile));
    
    console.log(`🔍 Extra Chinese documents (${extraZhFiles.length}):`);
    extraZhFiles.forEach((file, index) => {
        console.log(`   ${index + 1}. docs/zh-CN/${file}`);
    });
    
    // Find missing English files
    const missingEnFiles = enFiles.filter(enFile => !zhFiles.includes(enFile));
    
    if (missingEnFiles.length > 0) {
        console.log(`\n❌ Missing Chinese documents (${missingEnFiles.length}):`);
        missingEnFiles.forEach((file, index) => {
            console.log(`   ${index + 1}. docs/en/${file} (no Chinese equivalent)`);
        });
    }
    
    return { extraZhFiles, missingEnFiles };
}

// Run the analysis
findExtraDocuments();
