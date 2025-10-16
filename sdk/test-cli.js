/**
 * Simple test for CLI template functionality
 */

const path = require('path');
const fs = require('fs-extra');

// Import the ProjectTemplateManager
const { ProjectTemplateManager } = require('./packages/cli/src/templates/ProjectTemplateManager.ts');

async function testTemplateManager() {
  console.log('🧪 Testing ProjectTemplateManager...');
  
  try {
    const manager = new ProjectTemplateManager();
    
    // Test available templates
    const templates = manager.getAvailableTemplates();
    console.log('✅ Available templates:', templates);
    
    // Test template existence
    const hasBasic = manager.hasTemplate('basic');
    console.log('✅ Has basic template:', hasBasic);
    
    // Test template info
    const basicInfo = manager.getTemplate('basic');
    console.log('✅ Basic template info:', basicInfo ? 'Found' : 'Not found');
    
    // Test project creation
    const testDir = path.join(__dirname, 'test-output');
    await fs.ensureDir(testDir);
    
    const options = {
      name: 'test-project',
      template: 'basic',
      description: 'A test project',
      author: 'Test Author',
      license: 'MIT'
    };
    
    console.log('🚀 Creating test project...');
    await manager.createProject(options, path.join(testDir, 'test-project'));
    
    // Check if files were created
    const projectPath = path.join(testDir, 'test-project');
    const packageJsonExists = await fs.pathExists(path.join(projectPath, 'package.json'));
    const srcIndexExists = await fs.pathExists(path.join(projectPath, 'src', 'index.ts'));
    
    console.log('✅ package.json created:', packageJsonExists);
    console.log('✅ src/index.ts created:', srcIndexExists);
    
    if (packageJsonExists) {
      const packageJson = await fs.readJson(path.join(projectPath, 'package.json'));
      console.log('✅ Project name in package.json:', packageJson.name);
    }
    
    console.log('🎉 CLI template test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  }
}

// Run the test
testTemplateManager();
