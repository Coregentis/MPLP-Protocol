export function makeCanonicalUrl(
    siteUrl: string,
    baseUrl: string,
    permalink: string,
    trailingSlash: boolean = false
): string {
    // 1. Normalize siteUrl: remove trailing slash
    const url = siteUrl.replace(/\/$/, '');

    // 2. Normalize baseUrl: ensure /.../ format
    let base = baseUrl;
    if (!base.startsWith('/')) base = '/' + base;
    if (!base.endsWith('/')) base = base + '/';

    // 3. Normalize permalink: ensure leading /
    let path = permalink;
    if (!path.startsWith('/')) path = '/' + path;

    // 4. Deduplication: use PATH SEGMENT comparison (not startsWith)
    if (base !== '/') {
        const baseSegments = base.split('/').filter(Boolean);
        const pathSegments = path.split('/').filter(Boolean);

        let matchCount = 0;
        for (let i = 0; i < baseSegments.length && i < pathSegments.length; i++) {
            if (baseSegments[i] === pathSegments[i]) {
                matchCount++;
            } else {
                break;
            }
        }

        if (matchCount === baseSegments.length) {
            pathSegments.splice(0, matchCount);
            path = '/' + pathSegments.join('/');
        }
    }

    // 5. Construct full path
    let fullPath = base === '/' ? path : base.slice(0, -1) + path;

    // 6. Apply trailingSlash policy
    if (!trailingSlash && fullPath.endsWith('/') && fullPath !== '/') {
        fullPath = fullPath.slice(0, -1);
    }

    return `${url}${fullPath}`;
}

export function makeProductionCanonicalUrl(permalink: string): string {
    return makeCanonicalUrl(PRODUCTION_URL, '/', permalink, false);
}

export const PRODUCTION_URL = 'https://docs.mplp.io';

export const WEBSITE_SCHEMA = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': 'https://docs.mplp.io/#website',
    name: 'MPLP Documentation',
    url: 'https://docs.mplp.io',
};

export const ORGANIZATION_SCHEMA = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': 'https://docs.mplp.io/#org',
    name: 'Coregentis',
    url: 'https://docs.mplp.io',
};

export const CORPUS_SCHEMA = {
    '@context': 'https://schema.org',
    '@type': 'Collection',
    '@id': 'MPLP-CORPUS-v1.0.0',
    name: 'MPLP v1.0.0 Normative Corpus',
    description: 'The complete set of normative specifications and guides for the Multi-Party Liquidity Protocol v1.0.0',
    publisher: {
        '@id': 'https://docs.mplp.io/#org'
    },
    version: '1.0.0'
};

export type DocRole = 'normative_spec' | 'normative_index' | 'guide' | 'reference' | 'faq' | 'legacy' | 'test_spec' | 'example' | 'policy' | 'release' | 'ops' | 'manual';
export type DocStatus = 'normative' | 'informative' | 'legacy' | 'proposed';
export type SpecLevel = 'L1' | 'L2' | 'L3' | 'L4' | 'CrossCutting' | 'N/A';

export function generateJsonLd(metadata: { title: string; description: string; id: string; type?: string }) {
    return {
        '@context': 'https://schema.org',
        '@type': metadata.type || 'TechArticle',
        '@id': metadata.id,
        headline: metadata.title,
        description: metadata.description,
        isPartOf: {
            '@id': 'MPLP-CORPUS-v1.0.0'
        }
    };
}

export function generateBreadcrumbJsonLd(breadcrumbs: { name: string; item: string }[]) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.item
        }))
    };
}
