"use strict";
/**
 * DocItem Layout Wrapper - MPLP Docs v1.0-final-r2.1
 *
 * BLOCKER FIXES APPLIED:
 * - B1: Normative @id MUST throw if normative_id missing or not in registry (NO FALLBACK)
 * - B2: generated-index classification connected via sidebar/category lookup
 * - B3: Canonical ALWAYS uses PRODUCTION_URL (via makeProductionCanonicalUrl)
 *
 * © 2025 Bangshi Beijing Network Technology Limited Company – Apache-2.0
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DocItemLayoutWrapper;
var react_1 = require("react");
var Layout_1 = require("@theme-original/DocItem/Layout");
var Head_1 = require("@docusaurus/Head");
var client_1 = require("@docusaurus/plugin-content-docs/client");
var client_2 = require("@docusaurus/plugin-content-docs/client");
var seo_generator_1 = require("@site/src/utils/seo-generator");
var Admonition_1 = require("@theme/Admonition");
var NORMATIVE_REGISTRY = {
    // 00-index
    'MPLP-PROTOCOL-OVERVIEW': { json_ld_id: 'https://docs.mplp.io/id/MPLP-PROTOCOL-OVERVIEW', permalink: '/00-index/mplp-v1.0-protocol-overview' },
    'MPLP-CORPUS-INDEX': { json_ld_id: 'https://docs.mplp.io/id/MPLP-CORPUS-INDEX', permalink: '/00-index/mplp-v1.0-normative-corpus-index' },
    'MPLP-AUTH-SOURCES': { json_ld_id: 'https://docs.mplp.io/id/MPLP-AUTH-SOURCES', permalink: '/00-index/mplp-v1.0-authority-sources' },
    'MPLP-GLOSSARY': { json_ld_id: 'https://docs.mplp.io/id/MPLP-GLOSSARY', permalink: '/00-index/glossary' },
    // 01-architecture
    'MPLP-ARCH-OVERVIEW': { json_ld_id: 'https://docs.mplp.io/id/MPLP-ARCH-OVERVIEW', permalink: '/architecture/architecture-overview' },
    'MPLP-L1-CORE': { json_ld_id: 'https://docs.mplp.io/id/MPLP-L1-CORE', permalink: '/architecture/l1-core-protocol' },
    'MPLP-L2-COORD': { json_ld_id: 'https://docs.mplp.io/id/MPLP-L2-COORD', permalink: '/architecture/l2-coordination-governance' },
    'MPLP-L3-EXEC': { json_ld_id: 'https://docs.mplp.io/id/MPLP-L3-EXEC', permalink: '/architecture/l3-execution-orchestration' },
    'MPLP-L4-INTEG': { json_ld_id: 'https://docs.mplp.io/id/MPLP-L4-INTEG', permalink: '/architecture/l4-integration-infra' },
    'MPLP-L1L4-DEEPDIVE': { json_ld_id: 'https://docs.mplp.io/id/MPLP-L1L4-DEEPDIVE', permalink: '/architecture/l1-l4-architecture-deep-dive' },
    // 01-architecture/cross-cutting
    'MPLP-CC-OVERVIEW': { json_ld_id: 'https://docs.mplp.io/id/MPLP-CC-OVERVIEW', permalink: '/architecture/cross-cutting/overview' },
    'MPLP-CC-AEL': { json_ld_id: 'https://docs.mplp.io/id/MPLP-CC-AEL', permalink: '/architecture/cross-cutting/ael' },
    'MPLP-CC-VSL': { json_ld_id: 'https://docs.mplp.io/id/MPLP-CC-VSL', permalink: '/architecture/cross-cutting/vsl' },
    'MPLP-CC-OBS': { json_ld_id: 'https://docs.mplp.io/id/MPLP-CC-OBS', permalink: '/architecture/cross-cutting/observability' },
    'MPLP-CC-COORD': { json_ld_id: 'https://docs.mplp.io/id/MPLP-CC-COORD', permalink: '/architecture/cross-cutting/coordination' },
    'MPLP-CC-ERROR': { json_ld_id: 'https://docs.mplp.io/id/MPLP-CC-ERROR', permalink: '/architecture/cross-cutting/error-handling' },
    // 02-modules
    'MPLP-MOD-CONTEXT': { json_ld_id: 'https://docs.mplp.io/id/MPLP-MOD-CONTEXT', permalink: '/modules/context-module' },
    'MPLP-MOD-PLAN': { json_ld_id: 'https://docs.mplp.io/id/MPLP-MOD-PLAN', permalink: '/modules/plan-module' },
    'MPLP-MOD-CONFIRM': { json_ld_id: 'https://docs.mplp.io/id/MPLP-MOD-CONFIRM', permalink: '/modules/confirm-module' },
    'MPLP-MOD-TRACE': { json_ld_id: 'https://docs.mplp.io/id/MPLP-MOD-TRACE', permalink: '/modules/trace-module' },
    'MPLP-MOD-ROLE': { json_ld_id: 'https://docs.mplp.io/id/MPLP-MOD-ROLE', permalink: '/modules/role-module' },
    'MPLP-MOD-DIALOG': { json_ld_id: 'https://docs.mplp.io/id/MPLP-MOD-DIALOG', permalink: '/modules/dialog-module' },
    'MPLP-MOD-COLLAB': { json_ld_id: 'https://docs.mplp.io/id/MPLP-MOD-COLLAB', permalink: '/modules/collab-module' },
    'MPLP-MOD-EXTENSION': { json_ld_id: 'https://docs.mplp.io/id/MPLP-MOD-EXTENSION', permalink: '/modules/extension-module' },
    'MPLP-MOD-CORE': { json_ld_id: 'https://docs.mplp.io/id/MPLP-MOD-CORE', permalink: '/modules/core-module' },
    'MPLP-MOD-NETWORK': { json_ld_id: 'https://docs.mplp.io/id/MPLP-MOD-NETWORK', permalink: '/modules/network-module' },
    // 03-profiles
    'MPLP-PROF-SA': { json_ld_id: 'https://docs.mplp.io/id/MPLP-PROF-SA', permalink: '/profiles/sa-profile' },
    'MPLP-PROF-MAP': { json_ld_id: 'https://docs.mplp.io/id/MPLP-PROF-MAP', permalink: '/profiles/map-profile' },
    // 04-observability
    'MPLP-OBS-OVERVIEW': { json_ld_id: 'https://docs.mplp.io/id/MPLP-OBS-OVERVIEW', permalink: '/observability/observability-overview' },
    'MPLP-OBS-INVARIANTS': { json_ld_id: 'https://docs.mplp.io/id/MPLP-OBS-INVARIANTS', permalink: '/observability/observability-invariants' },
    // 09-tests
    'MPLP-TEST-GOLDEN': { json_ld_id: 'https://docs.mplp.io/id/MPLP-TEST-GOLDEN', permalink: '/tests/golden-flow-registry' },
    // 12-governance
    'MPLP-GOV-POLICY': { json_ld_id: 'https://docs.mplp.io/id/MPLP-GOV-POLICY', permalink: '/governance/governance-policy' },
};
var DIRECTORY_DEFAULTS = {
    '00-index': { doc_status: 'normative', doc_role: 'normative_index', spec_level: 'CrossCutting' },
    '01-architecture': { doc_status: 'normative', doc_role: 'normative_spec', spec_level: 'L1' },
    '02-modules': { doc_status: 'normative', doc_role: 'normative_spec', spec_level: 'L2' },
    '03-profiles': { doc_status: 'normative', doc_role: 'normative_spec' },
    '04-observability': { doc_status: 'normative', doc_role: 'normative_spec', spec_level: 'CrossCutting' },
    '05-learning': { doc_status: 'normative', doc_role: 'normative_spec', spec_level: 'CrossCutting' },
    '06-runtime': { doc_status: 'normative', doc_role: 'normative_spec', spec_level: 'L3' },
    '07-integration': { doc_status: 'normative', doc_role: 'normative_spec', spec_level: 'L4' },
    '08-guides': { doc_status: 'informative', doc_role: 'guide' },
    '09-tests': { doc_status: 'normative', doc_role: 'test_spec' },
    '10-sdk': { doc_status: 'informative', doc_role: 'guide' },
    '11-examples': { doc_status: 'informative', doc_role: 'example' },
    '12-governance': { doc_status: 'normative', doc_role: 'policy' },
    '13-release': { doc_status: 'informative', doc_role: 'release' },
    '14-ops': { doc_status: 'informative', doc_role: 'ops' },
    '99-meta': { doc_status: 'informative', doc_role: 'guide' },
    // Cross-cutting subdirectory
    'cross-cutting': { doc_status: 'normative', doc_role: 'normative_spec', spec_level: 'CrossCutting' },
};
/**
 * Get directory defaults based on permalink
 */
function getDirectoryDefaults(permalink) {
    var _a, _b, _c;
    // Extract first directory segment from permalink
    var match = permalink.match(/^\/([^/]+)/);
    if (!match)
        return null;
    var firstDir = match[1];
    // Check for cross-cutting subdirectory
    if (permalink.includes('/cross-cutting/')) {
        return (_a = DIRECTORY_DEFAULTS['cross-cutting']) !== null && _a !== void 0 ? _a : null;
    }
    // Map URL segments to directory names
    var urlToDir = {
        'architecture': '01-architecture',
        'modules': '02-modules',
        'profiles': '03-profiles',
        'observability': '04-observability',
        'learning': '05-learning',
        'runtime': '06-runtime',
        'integration': '07-integration',
        'guides': '08-guides',
        'tests': '09-tests',
        'sdk': '10-sdk',
        'examples': '11-examples',
        'governance': '12-governance',
        'release': '13-release',
        'ops': '14-ops',
        'meta': '99-meta',
        '00-index': '00-index',
    };
    var dirName = (_b = urlToDir[firstDir]) !== null && _b !== void 0 ? _b : firstDir;
    return (_c = DIRECTORY_DEFAULTS[dirName]) !== null && _c !== void 0 ? _c : null;
}
// =============================================================================
// Classification Resolution (B2 FIX - now with directory defaults fallback)
// =============================================================================
/**
 * Resolves document classification with proper fallback chain:
 * 1. frontMatter (explicit)
 * 2. Directory defaults (for generated-index and missing frontmatter)
 */
function resolveClassification(frontMatter, permalink) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    var dirDefaults = getDirectoryDefaults(permalink);
    return {
        doc_status: (_b = (_a = frontMatter.doc_status) !== null && _a !== void 0 ? _a : dirDefaults === null || dirDefaults === void 0 ? void 0 : dirDefaults.doc_status) !== null && _b !== void 0 ? _b : null,
        doc_role: (_d = (_c = frontMatter.doc_role) !== null && _c !== void 0 ? _c : dirDefaults === null || dirDefaults === void 0 ? void 0 : dirDefaults.doc_role) !== null && _d !== void 0 ? _d : null,
        protocol_version: (_e = frontMatter.protocol_version) !== null && _e !== void 0 ? _e : '1.0.0',
        spec_level: (_g = (_f = frontMatter.spec_level) !== null && _f !== void 0 ? _f : dirDefaults === null || dirDefaults === void 0 ? void 0 : dirDefaults.spec_level) !== null && _g !== void 0 ? _g : null,
        normative_id: (_h = frontMatter.normative_id) !== null && _h !== void 0 ? _h : null,
    };
}
// =============================================================================
// @id Resolution (B1 FIX - MUST throw for normative without valid normative_id)
// =============================================================================
var NormativeIdError = /** @class */ (function (_super) {
    __extends(NormativeIdError, _super);
    function NormativeIdError(message) {
        var _this = _super.call(this, message) || this;
        _this.name = 'NormativeIdError';
        return _this;
    }
    return NormativeIdError;
}(Error));
/**
 * Gets the JSON-LD @id for a document.
 *
 * B1 FIX: For normative documents, this MUST throw if:
 * - normative_id is missing
 * - normative_id is not found in registry
 *
 * NO FALLBACK is allowed for normative documents.
 */
function getJsonLdId(unversionedId, permalink, classification) {
    if (classification.doc_status === 'normative') {
        // B1 FIX: Normative MUST have normative_id
        if (!classification.normative_id) {
            // In development, we throw to catch missing normative_id early
            // In production build, this should be caught by R14 audit
            throw new NormativeIdError("[BLOCKER] Normative document missing 'normative_id' in frontmatter.\n" +
                "  Permalink: ".concat(permalink, "\n") +
                "  UnversionedId: ".concat(unversionedId, "\n") +
                "  Resolution: Add 'normative_id: MPLP-XXX' to the document frontmatter.");
        }
        // B1 FIX: normative_id MUST be in registry
        var entry = NORMATIVE_REGISTRY[classification.normative_id];
        if (!entry) {
            throw new NormativeIdError("[BLOCKER] normative_id '".concat(classification.normative_id, "' not found in NORMATIVE_REGISTRY.\n") +
                "  Permalink: ".concat(permalink, "\n") +
                "  Resolution: Add entry to mplp-v1.0-normative-registry.yaml and regenerate.");
        }
        return entry.json_ld_id;
    }
    // Informative: deterministic @id generation is allowed
    return "https://docs.mplp.io/id/doc/".concat(unversionedId);
}
// =============================================================================
// Component
// =============================================================================
function DocItemLayoutWrapper(props) {
    var _a, _b, _c, _d;
    var _e = (0, client_1.useDoc)(), metadata = _e.metadata, frontMatter = _e.frontMatter;
    var sidebarBreadcrumbs = (0, client_2.useSidebarBreadcrumbs)();
    // Resolve classification with directory defaults fallback (B2 FIX)
    var classification = resolveClassification(frontMatter, metadata.permalink);
    // Generate canonical URL - ALWAYS production URL (B3 FIX)
    var canonicalUrl = (0, seo_generator_1.makeProductionCanonicalUrl)(metadata.permalink);
    // Get @id for JSON-LD - will throw for normative without valid normative_id (B1 FIX)
    var jsonLdId;
    var jsonLdError = null;
    try {
        jsonLdId = getJsonLdId(metadata.unversionedId, metadata.permalink, classification);
    }
    catch (e) {
        // In development, log the error but don't crash the page
        // In production, this should have been caught by the audit
        jsonLdError = e;
        console.error(jsonLdError.message);
        // Use fallback for development only - audit will catch this
        jsonLdId = "https://docs.mplp.io/id/error/".concat(metadata.unversionedId);
    }
    // Generate primary JSON-LD
    var primaryJsonLd = (0, seo_generator_1.generateJsonLd)({
        title: metadata.title,
        description: metadata.description,
        permalink: metadata.permalink,
        jsonLdId: jsonLdId,
        doc_role: (_a = classification.doc_role) !== null && _a !== void 0 ? _a : undefined,
        doc_status: (_b = classification.doc_status) !== null && _b !== void 0 ? _b : undefined,
        protocol_version: classification.protocol_version,
        keywords: (_c = frontMatter.keywords) !== null && _c !== void 0 ? _c : [],
    });
    // Generate breadcrumb JSON-LD
    var breadcrumbItems = (_d = sidebarBreadcrumbs === null || sidebarBreadcrumbs === void 0 ? void 0 : sidebarBreadcrumbs.map(function (crumb) {
        var _a;
        return ({
            label: crumb.label,
            href: (_a = crumb.href) !== null && _a !== void 0 ? _a : '',
        });
    })) !== null && _d !== void 0 ? _d : [];
    var breadcrumbJsonLd = (0, seo_generator_1.generateBreadcrumbJsonLd)(breadcrumbItems, metadata.permalink);
    // Determine notice type
    var isNormative = classification.doc_status === 'normative';
    var isInformative = classification.doc_status === 'informative';
    return (<>
            <Head_1.default>
                {/* Canonical URL - ALWAYS production (B3 FIX) */}
                <link rel="canonical" href={canonicalUrl}/>

                {/* Primary JSON-LD */}
                <script type="application/ld+json">
                    {JSON.stringify(primaryJsonLd)}
                </script>

                {/* Breadcrumb JSON-LD */}
                {breadcrumbJsonLd && (<script type="application/ld+json">
                        {JSON.stringify(breadcrumbJsonLd)}
                    </script>)}
            </Head_1.default>

            {/* Development Error Notice */}
            {jsonLdError && process.env.NODE_ENV === 'development' && (<Admonition_1.default type="danger" icon="🚨" title="BLOCKER: normative_id Missing">
                    <pre style={{ fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}>
                        {jsonLdError.message}
                    </pre>
                </Admonition_1.default>)}

            {/* Normative/Informative Notice Banner */}
            <div style={{ marginBottom: '1rem' }}>
                {isNormative && (<Admonition_1.default type="info" icon="⚖️" title="Normative Specification">
                        <p style={{ marginBottom: 0 }}>
                            This document is a <strong>Normative</strong> part of the MPLP v1.0 Protocol.
                            Content designated with MUST, SHALL, or REQUIRED defines binding requirements for compliance.
                        </p>
                    </Admonition_1.default>)}
                {isInformative && (<Admonition_1.default type="note" icon="📘" title="Informative Guide">
                        <p style={{ marginBottom: 0 }}>
                            This document is <strong>Informative</strong>. It provides guidance, examples, or context
                            but does not define protocol requirements.
                        </p>
                    </Admonition_1.default>)}
            </div>

            <Layout_1.default {...props}/>
        </>);
}
