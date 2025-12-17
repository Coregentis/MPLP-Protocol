import fs from 'fs';
import path from 'path';

const VERSION = '1.0.2';
const PACKAGES_DIR = path.join(process.cwd(), 'packages');
const ROOT_PKG = path.join(process.cwd(), 'package.json');

const COMMON_META = {
    author: "邦士（北京）网络科技有限公司",
    license: "Apache-2.0",
    homepage: "https://github.com/coregentis/MPLP-Protocol",
    bugs: { url: "https://github.com/coregentis/MPLP-Protocol/issues" },
    repository: {
        type: "git",
        url: "https://github.com/coregentis/MPLP-Protocol.git"
    }
};

// Update Root Package
const rootPkg = JSON.parse(fs.readFileSync(ROOT_PKG, 'utf8'));
rootPkg.version = VERSION;
if (rootPkg.mplp) rootPkg.mplp.protocolVersion = '1.0.0'; // Protocol version stays 1.0.0
fs.writeFileSync(ROOT_PKG, JSON.stringify(rootPkg, null, 2) + '\n');
console.log(`Updated root package.json to ${VERSION}`);

// Get all packages (Recursive)
function getPackageDirs(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            if (fs.existsSync(path.join(fullPath, 'package.json'))) {
                results.push(fullPath);
            }
            // Recurse into 'integration' or other container dirs if they don't have package.json
            // or even if they do (though MPLP structure seems to be leaf-only packages)
            // But 'integration' folder itself doesn't have package.json, so we recurse.
            else {
                results = results.concat(getPackageDirs(fullPath));
            }
        }
    });
    return results;
}

const packageDirs = getPackageDirs(PACKAGES_DIR);

packageDirs.forEach(pkgDir => {
    const pkgName = path.basename(pkgDir);
    const pkgJsonPath = path.join(pkgDir, 'package.json');

    if (!fs.existsSync(pkgJsonPath)) return;

    const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));

    // 1. Version Bump
    pkg.version = VERSION;

    // 2. Dependency Bump (Internal)
    ['dependencies', 'devDependencies', 'peerDependencies'].forEach(depType => {
        if (!pkg[depType]) return;
        Object.keys(pkg[depType]).forEach(dep => {
            if (dep.startsWith('@mplp/')) {
                pkg[depType][dep] = `^${VERSION}`;
            }
        });
    });

    // 3. Metadata Hardening
    Object.assign(pkg, COMMON_META);
    pkg.repository.directory = `packages/${pkgName}`;

    // Ensure keywords exist
    if (!pkg.keywords) pkg.keywords = [];
    const baseKeywords = ["MPLP", "multi-agent", "protocol"];
    baseKeywords.forEach(k => {
        if (!pkg.keywords.includes(k)) pkg.keywords.push(k);
    });

    // Ensure exports/main/types
    pkg.main = "dist/index.js";
    pkg.types = "dist/index.d.ts";
    // Only set exports if not already complex
    if (!pkg.exports) {
        pkg.exports = {
            ".": {
                "import": "./dist/index.js",
                "types": "./dist/index.d.ts"
            }
        };
    }

    pkg.sideEffects = false;

    fs.writeFileSync(pkgJsonPath, JSON.stringify(pkg, null, 2) + '\n');
    console.log(`Updated ${pkg.name} to ${VERSION}`);

    // 4. File Checks
    const readmePath = path.join(pkgDir, 'README.md');
    if (!fs.existsSync(readmePath)) {
        fs.writeFileSync(readmePath, `# ${pkg.name}\n\n${pkg.description || 'MPLP Package'}\n\n## Installation\n\n\`npm i ${pkg.name}\`\n\n## License\n\nApache-2.0`);
        console.log(`Created README for ${pkgName}`);
    }

    const licensePath = path.join(pkgDir, 'LICENSE.txt');
    if (!fs.existsSync(licensePath)) {
        fs.copyFileSync(path.join(process.cwd(), 'LICENSE.txt'), licensePath);
        console.log(`Copied LICENSE to ${pkgName}`);
    }

    const changelogPath = path.join(pkgDir, 'CHANGELOG.md');
    if (!fs.existsSync(changelogPath)) {
        fs.writeFileSync(changelogPath, `# Changelog\n\nThis package follows the global MPLP Protocol changelog.\n\nSee: https://github.com/coregentis/MPLP-Protocol/blob/main/CHANGELOG.md`);
        console.log(`Created CHANGELOG stub for ${pkgName}`);
    }

    // 5. Ensure Directories
    ['src', 'tests', 'examples'].forEach(d => {
        const dirPath = path.join(pkgDir, d);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath);
            console.log(`Created ${d} dir for ${pkgName}`);
        }
    });
});

console.log('Release preparation complete.');
