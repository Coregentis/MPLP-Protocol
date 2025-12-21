# MPLP Package Release Workflow

**Version**: 1.0.0
**Status**: FROZEN
**Governance**: MPGC

---

## 1. Directory Structure

```
packages/
├── sources/              # 构建源 (Build Sources)
│   ├── sdk-ts/          # TypeScript SDK 源代码
│   └── sdk-py/          # Python SDK 源代码
│
├── npm/                  # NPM 发布包 (Publish Targets)
│   ├── core/            # @mplp/core
│   ├── coordination/    # @mplp/coordination
│   ├── schema/          # @mplp/schema
│   └── ...              # 其他 NPM 包
│
└── pypi/                 # PyPI 发布包 (Publish Targets)
    └── mplp-sdk/        # mplp-sdk
```

---

## 2. Release Workflow

### Phase 1: Check Build Sources

```bash
# 1. 检查构建源状态
cd packages/sources/sdk-ts
git status

# 2. 运行测试
npm test
```

### Phase 2: Make Changes

```bash
# 在 sources/ 目录中进行修改
# 修改完成后运行测试验证
npm run build
npm test
```

### Phase 3: Build to Publish Directory

```bash
# NPM 包：从 sources 构建到 npm/
cd packages/sources/sdk-ts
npm run build

# 复制构建产物到发布目录
cp -r dist/* ../npm/core/dist/
cp package.json ../npm/core/

# Python 包：从 sources 构建到 pypi/
cd packages/sources/sdk-py
python -m build --outdir ../pypi/mplp-sdk/dist/
```

### Phase 4: Verify Publish Packages

```bash
# NPM 验证门禁
cd packages/npm/core
npm pack --dry-run

# 扫描危险路径
grep -r "schemas/v2" dist/ && exit 1 || echo "PASS"
grep -r "__dirname" dist/ && exit 1 || echo "PASS"

# 元数据对齐检查
node -e "const p=require('./package.json'); 
  if(p.homepage!=='https://mplp.io') throw 'homepage';
  if(p.license!=='Apache-2.0') throw 'license';
  console.log('METADATA OK');"
```

### Phase 5: Publish

```bash
# NPM 发布
cd packages/npm/core
npm publish --access public

cd ../coordination
npm publish --access public

# PyPI 发布
cd packages/pypi/mplp-sdk
python -m twine upload dist/*
```

---

## 3. Release Gates (必须通过)

### Gate 1: Artifact Integrity

- [ ] dist/ 中无 `schemas/v2` 路径
- [ ] dist/ 中无 `__dirname` 危险模式
- [ ] dist/ 中无 `fs.readFileSync` 相对路径读取

### Gate 2: Metadata Alignment (PyPI Baseline)

| Field | Required Value |
|:---|:---|
| homepage | `https://mplp.io` |
| repository | `https://github.com/Coregentis/MPLP-Protocol` |
| bugs | `https://github.com/Coregentis/MPLP-Protocol/issues` |
| license | `Apache-2.0` |
| author | `Coregentis AI` |
| keywords | `mplp, multi-agent, lifecycle, protocol, agent-os` |

### Gate 3: Consumer Install Test

```bash
mkdir /tmp/test && cd /tmp/test && npm init -y
npm install @mplp/core@latest
node -e "console.log(require('@mplp/core').validateContext({}))"
# Expected: { ok: true, errors: [] }
```

---

## 4. Version Bump Rules

| Change Type | Version Bump | Example |
|:---|:---|:---|
| Bug fix | PATCH | 1.0.2 → 1.0.3 |
| New feature (backward compatible) | MINOR | 1.0.3 → 1.1.0 |
| Breaking change | MAJOR | 1.1.0 → 2.0.0 |

**MPLP Protocol**: v1.0.0 is FROZEN. Only PATCH allowed for fixes.

---

## 5. Post-Release Verification

```bash
# 验证已发布包
npm info @mplp/core version
pip show mplp-sdk | grep Version
```

---

**MPGC 2025-12-21**
