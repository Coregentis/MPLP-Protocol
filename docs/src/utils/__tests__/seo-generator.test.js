"use strict";
/**
 * SEO Generator Tests - MPLP Docs v1.0-final-r2.1
 *
 * Tests for makeCanonicalUrl with 7 required test cases.
 * These tests MUST pass before the remediation can be sealed.
 */
Object.defineProperty(exports, "__esModule", { value: true });
var vitest_1 = require("vitest");
var seo_generator_1 = require("../seo-generator");
(0, vitest_1.describe)('makeCanonicalUrl', function () {
    // Case 1: baseUrl = '/', normal permalink
    (0, vitest_1.it)('Case 1: handles baseUrl "/" with normal permalink', function () {
        (0, vitest_1.expect)((0, seo_generator_1.makeCanonicalUrl)('https://docs.mplp.io', '/', '/architecture/overview', false)).toBe('https://docs.mplp.io/architecture/overview');
    });
    // Case 2: baseUrl = '/MPLP-Protocol/', permalink without baseUrl
    (0, vitest_1.it)('Case 2: handles subpath baseUrl with clean permalink', function () {
        (0, vitest_1.expect)((0, seo_generator_1.makeCanonicalUrl)('https://coregentis.github.io', '/MPLP-Protocol/', '/architecture/overview', false)).toBe('https://coregentis.github.io/MPLP-Protocol/architecture/overview');
    });
    // Case 3: baseUrl = '/MPLP-Protocol/', permalink already contains baseUrl
    (0, vitest_1.it)('Case 3: deduplicates when permalink already contains baseUrl', function () {
        (0, vitest_1.expect)((0, seo_generator_1.makeCanonicalUrl)('https://coregentis.github.io', '/MPLP-Protocol/', '/MPLP-Protocol/architecture/overview', false)).toBe('https://coregentis.github.io/MPLP-Protocol/architecture/overview');
    });
    // Case 4: permalink without leading slash
    (0, vitest_1.it)('Case 4: handles permalink without leading slash', function () {
        (0, vitest_1.expect)((0, seo_generator_1.makeCanonicalUrl)('https://docs.mplp.io', '/', 'architecture/overview', false)).toBe('https://docs.mplp.io/architecture/overview');
    });
    // Case 5: root path '/'
    (0, vitest_1.it)('Case 5: handles root path correctly', function () {
        (0, vitest_1.expect)((0, seo_generator_1.makeCanonicalUrl)('https://docs.mplp.io', '/', '/', false)).toBe('https://docs.mplp.io/');
    });
    // Case 6: trailingSlash = true
    (0, vitest_1.it)('Case 6: applies trailingSlash when enabled', function () {
        (0, vitest_1.expect)((0, seo_generator_1.makeCanonicalUrl)('https://docs.mplp.io', '/', '/architecture/overview', true)).toBe('https://docs.mplp.io/architecture/overview/');
    });
    // Case 7: Path segment false positive prevention
    // /mplp/ should NOT match /mplp-x/ as a prefix
    (0, vitest_1.it)('Case 7: prevents false positive when baseUrl is prefix of different segment', function () {
        (0, vitest_1.expect)((0, seo_generator_1.makeCanonicalUrl)('https://x.io', '/mplp/', '/mplp-x/abc', false)).toBe('https://x.io/mplp/mplp-x/abc');
    });
    // Additional edge cases for robustness
    (0, vitest_1.it)('handles baseUrl without leading slash', function () {
        (0, vitest_1.expect)((0, seo_generator_1.makeCanonicalUrl)('https://x.io', 'docs/', '/page', false)).toBe('https://x.io/docs/page');
    });
    (0, vitest_1.it)('handles siteUrl with trailing slash', function () {
        (0, vitest_1.expect)((0, seo_generator_1.makeCanonicalUrl)('https://docs.mplp.io/', '/', '/page', false)).toBe('https://docs.mplp.io/page');
    });
    (0, vitest_1.it)('removes trailing slash when trailingSlash is false', function () {
        (0, vitest_1.expect)((0, seo_generator_1.makeCanonicalUrl)('https://docs.mplp.io', '/', '/architecture/overview/', false)).toBe('https://docs.mplp.io/architecture/overview');
    });
});
(0, vitest_1.describe)('makeProductionCanonicalUrl', function () {
    (0, vitest_1.it)('always uses PRODUCTION_URL', function () {
        (0, vitest_1.expect)((0, seo_generator_1.makeProductionCanonicalUrl)('/architecture/overview'))
            .toBe('https://docs.mplp.io/architecture/overview');
    });
    (0, vitest_1.it)('handles root path', function () {
        (0, vitest_1.expect)((0, seo_generator_1.makeProductionCanonicalUrl)('/'))
            .toBe('https://docs.mplp.io/');
    });
});
(0, vitest_1.describe)('PRODUCTION constants', function () {
    (0, vitest_1.it)('PRODUCTION_URL is correct', function () {
        (0, vitest_1.expect)(seo_generator_1.PRODUCTION_URL).toBe('https://docs.mplp.io');
    });
    (0, vitest_1.it)('PRODUCTION_BASE_URL is correct', function () {
        (0, vitest_1.expect)(seo_generator_1.PRODUCTION_BASE_URL).toBe('/');
    });
});
(0, vitest_1.describe)('DOC_ROLE_SCHEMA_MAP (B4 - Single Source)', function () {
    (0, vitest_1.it)('has all required roles', function () {
        (0, vitest_1.expect)(seo_generator_1.DOC_ROLE_SCHEMA_MAP.normative_spec).toBe('TechArticle');
        (0, vitest_1.expect)(seo_generator_1.DOC_ROLE_SCHEMA_MAP.normative_index).toBe('CollectionPage');
        (0, vitest_1.expect)(seo_generator_1.DOC_ROLE_SCHEMA_MAP.defined_term).toBe('DefinedTerm');
        (0, vitest_1.expect)(seo_generator_1.DOC_ROLE_SCHEMA_MAP.glossary).toBe('DefinedTermSet');
        (0, vitest_1.expect)(seo_generator_1.DOC_ROLE_SCHEMA_MAP.registry).toBe('Dataset');
        (0, vitest_1.expect)(seo_generator_1.DOC_ROLE_SCHEMA_MAP.guide).toBe('WebPage');
    });
});
(0, vitest_1.describe)('generateJsonLd', function () {
    (0, vitest_1.it)('generates TechArticle for normative_spec', function () {
        var result = (0, seo_generator_1.generateJsonLd)({
            title: 'Architecture Overview',
            description: 'MPLP Architecture',
            permalink: '/architecture/overview',
            jsonLdId: 'https://docs.mplp.io/id/MPLP-ARCH-OVERVIEW',
            doc_role: 'normative_spec',
            doc_status: 'normative',
        });
        (0, vitest_1.expect)(result['@type']).toBe('TechArticle');
        (0, vitest_1.expect)(result['@id']).toBe('https://docs.mplp.io/id/MPLP-ARCH-OVERVIEW');
        (0, vitest_1.expect)(result.isPartOf).toHaveProperty('@id');
        (0, vitest_1.expect)(result.articleSection).toBe('Specification');
    });
    (0, vitest_1.it)('generates WebPage for informative guide', function () {
        var result = (0, seo_generator_1.generateJsonLd)({
            title: 'Quick Start',
            description: 'Get started with MPLP',
            permalink: '/guides/quickstart',
            jsonLdId: 'https://docs.mplp.io/id/doc/quickstart',
            doc_role: 'guide',
            doc_status: 'informative',
        });
        (0, vitest_1.expect)(result['@type']).toBe('WebPage');
        (0, vitest_1.expect)(result.articleSection).toBeUndefined();
    });
    (0, vitest_1.it)('generates DefinedTermSet for glossary', function () {
        var result = (0, seo_generator_1.generateJsonLd)({
            title: 'Glossary',
            description: 'MPLP Terminology',
            permalink: '/00-index/glossary',
            jsonLdId: 'https://docs.mplp.io/id/MPLP-GLOSSARY',
            doc_role: 'glossary',
            doc_status: 'normative',
        });
        (0, vitest_1.expect)(result['@type']).toBe('DefinedTermSet');
        (0, vitest_1.expect)(result.inDefinedTermSet).toBeDefined();
    });
    (0, vitest_1.it)('always uses PRODUCTION_URL for mainEntityOfPage (B3 Fix)', function () {
        var result = (0, seo_generator_1.generateJsonLd)({
            title: 'Test',
            description: 'Test',
            permalink: '/test/page',
            jsonLdId: 'https://docs.mplp.io/id/test',
        });
        var mainEntity = result.mainEntityOfPage;
        (0, vitest_1.expect)(mainEntity['@id']).toBe('https://docs.mplp.io/test/page');
    });
});
(0, vitest_1.describe)('generateBreadcrumbJsonLd', function () {
    (0, vitest_1.it)('generates valid BreadcrumbList with consecutive positions', function () {
        var breadcrumbs = [
            { label: 'Architecture', href: '/architecture' },
            { label: 'L1 Core', href: '/architecture/l1-core' },
        ];
        var result = (0, seo_generator_1.generateBreadcrumbJsonLd)(breadcrumbs, '/architecture/l1-core/details');
        (0, vitest_1.expect)(result).not.toBeNull();
        (0, vitest_1.expect)(result['@type']).toBe('BreadcrumbList');
        var items = result.itemListElement;
        (0, vitest_1.expect)(items[0].position).toBe(1);
        (0, vitest_1.expect)(items[1].position).toBe(2);
    });
    (0, vitest_1.it)('filters out current page from breadcrumbs', function () {
        var breadcrumbs = [
            { label: 'Architecture', href: '/architecture' },
            { label: 'Current Page', href: '/architecture/current' },
        ];
        var result = (0, seo_generator_1.generateBreadcrumbJsonLd)(breadcrumbs, '/architecture/current');
        var items = result.itemListElement;
        (0, vitest_1.expect)(items.length).toBe(1);
        (0, vitest_1.expect)(items[0].name).toBe('Architecture');
    });
    (0, vitest_1.it)('filters out root path', function () {
        var breadcrumbs = [
            { label: 'Home', href: '/' },
            { label: 'Architecture', href: '/architecture' },
        ];
        var result = (0, seo_generator_1.generateBreadcrumbJsonLd)(breadcrumbs, '/architecture/page');
        var items = result.itemListElement;
        (0, vitest_1.expect)(items.length).toBe(1);
        (0, vitest_1.expect)(items[0].name).toBe('Architecture');
    });
    (0, vitest_1.it)('returns null for empty breadcrumbs', function () {
        var result = (0, seo_generator_1.generateBreadcrumbJsonLd)([], '/page');
        (0, vitest_1.expect)(result).toBeNull();
    });
    (0, vitest_1.it)('uses PRODUCTION_URL for all URLs (B3 Fix)', function () {
        var breadcrumbs = [
            { label: 'Architecture', href: '/architecture' },
        ];
        var result = (0, seo_generator_1.generateBreadcrumbJsonLd)(breadcrumbs, '/architecture/page');
        var items = result.itemListElement;
        (0, vitest_1.expect)(items[0].item).toBe('https://docs.mplp.io/architecture');
    });
});
