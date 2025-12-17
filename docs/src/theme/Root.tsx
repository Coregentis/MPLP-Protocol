import React from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Head from '@docusaurus/Head';

const PRODUCTION_URL = 'https://docs.mplp.io';

export default function Root({ children }: { children: React.ReactNode }) {
    const { siteConfig, i18n } = useDocusaurusContext();
    const isProduction = siteConfig.url === PRODUCTION_URL;
    const isEnglish = i18n.currentLocale === 'en';

    // NOTE: keep schemas minimal; do NOT re-add SoftwareSourceCode globally.
    const websiteSchema = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        '@id': 'https://docs.mplp.io/#website',
        name: 'MPLP Documentation',
        url: 'https://docs.mplp.io',
    };

    const orgSchema = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        '@id': 'https://docs.mplp.io/#org',
        name: 'Coregentis',
        url: 'https://docs.mplp.io',
    };

    return (
        <>
            <Head>
                {/* i18n: non-English locales get noindex during v1.0 freeze */}
                {!isEnglish && <meta name="robots" content="noindex, follow" />}

                {/* Global JSON-LD only on production English */}
                {isProduction && isEnglish && (
                    <>
                        <script type="application/ld+json">{JSON.stringify(websiteSchema)}</script>
                        <script type="application/ld+json">{JSON.stringify(orgSchema)}</script>
                    </>
                )}
            </Head>
            {children}
        </>
    );
}
