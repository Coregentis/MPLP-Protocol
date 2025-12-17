/**
 * Custom DocBreadcrumbs wrapper to fix Google Search Console structured data error
 * 
 * Issue: Docusaurus default breadcrumb JSON-LD generates invalid URLs for the home item
 * when using routeBasePath: '/' configuration. The item.@id becomes empty or invalid.
 * 
 * Solution: Override the breadcrumb Helmet component to inject corrected JSON-LD with
 * absolute URLs for all breadcrumb items.
 */

import React from 'react';
import DocBreadcrumbs from '@theme-original/DocBreadcrumbs';
import type DocBreadcrumbsType from '@theme/DocBreadcrumbs';
import type { WrapperProps } from '@docusaurus/types';
import Head from '@docusaurus/Head';
import { useLocation } from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

type Props = WrapperProps<typeof DocBreadcrumbsType>;

const SITE_URL = 'https://docs.mplp.io';

function generateBreadcrumbJsonLd(pathname: string, title: string): object {
    const segments = pathname.split('/').filter(Boolean);

    // Build breadcrumb items with absolute URLs
    const items = [
        {
            '@type': 'ListItem',
            position: 1,
            name: 'MPLP Documentation',
            item: SITE_URL
        }
    ];

    // Add path segments as breadcrumb items
    let currentPath = '';
    segments.forEach((segment, index) => {
        currentPath += '/' + segment;
        const name = segment
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
            .replace(/^\d+\s*/, ''); // Remove leading numbers like "00-", "01-"

        if (name) {
            items.push({
                '@type': 'ListItem',
                position: index + 2,
                name: name || segment,
                item: `${SITE_URL}${currentPath}`
            });
        }
    });

    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items
    };
}

export default function DocBreadcrumbsWrapper(props: Props): React.JSX.Element {
    const location = useLocation();
    const { siteConfig } = useDocusaurusContext();

    // Generate correct breadcrumb JSON-LD with absolute URLs
    const breadcrumbJsonLd = generateBreadcrumbJsonLd(
        location.pathname,
        siteConfig.title
    );

    return (
        <>
            {/* Inject corrected breadcrumb JSON-LD */}
            <Head>
                <script type="application/ld+json">
                    {JSON.stringify(breadcrumbJsonLd)}
                </script>
            </Head>
            <DocBreadcrumbs {...props} />
        </>
    );
}
