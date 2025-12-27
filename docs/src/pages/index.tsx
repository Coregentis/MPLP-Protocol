import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
    const { siteConfig } = useDocusaurusContext();
    return (
        <header className={clsx('hero', styles.heroBanner)}>
            <div className="container">
                {/* Title Line 1 - Full Name - Blue & Large */}
                <Heading as="h1" className={styles.heroTitlePrimary}>
                    Multi-Agent Lifecycle Protocol (MPLP)
                </Heading>

                {/* Title Line 2 - Punchy Name - Blue & Medium-Large */}
                <Heading as="h2" className={styles.heroTitleSecondary}>
                    The Agent OS Protocol
                </Heading>

                {/* T0 Identity Statement (INV-02) */}
                <p className={styles.heroSubtitle}>
                    The lifecycle protocol for AI agent systems — defining how agents are created, operated, audited, and decommissioned.
                </p>

                {/* T0 Invariant (INV-03) */}
                <p style={{ fontSize: '0.9rem', color: '#3b82f6', fontWeight: 600, marginBottom: '1.5rem' }}>
                    Not a framework. Not a runtime. Not a platform.
                </p>

                {/* Badges Section */}
                <div className={styles.badges}>
                    <img src="https://img.shields.io/badge/Protocol-v1.0.0(FROZEN)-blue" alt="Protocol v1.0.0" />
                    <img src="https://img.shields.io/badge/NPM_Standard_Library-13_packages-purple" alt="NPM Standard Library" />
                    <img src="https://img.shields.io/badge/PyPI-mplp_v1.0.3-orange" alt="PyPI mplp v1.0.3" />
                    <img src="https://img.shields.io/badge/License-Apache_2.0-green" alt="License Apache 2.0" />
                </div>

                {/* T0 Governance Statement */}
                <p style={{ fontSize: '0.85rem', color: '#64748b', maxWidth: '600px', margin: '1.5rem auto', lineHeight: '1.6' }}>
                    Governed by MPGC. The specification is frozen at v1.0.0 — no breaking changes permitted.
                    Reference SDKs and Golden Flows enable protocol conformance without vendor certification.
                </p>

                <div className={styles.buttons}>
                    <Link
                        className="button button--secondary button--lg"
                        to="/docs/guides/quickstart-5min">
                        Get Started - 5min ⏱️
                    </Link>
                    <Link
                        className="button button--info button--lg"
                        style={{ marginLeft: '1rem', backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', color: '#3b82f6' }}
                        to="https://github.com/Coregentis/MPLP-Protocol">
                        GitHub
                    </Link>
                </div>
            </div>
        </header>
    );
}

const FeatureList = [
    {
        title: 'Architecture',
        link: '/docs/architecture/architecture-overview',
        description: (
            <>
                The layered foundation. <strong>L1 Core</strong> (State), <strong>L2 Coordination</strong> (Governance), and <strong>L3 Execution</strong> (Runtime).
            </>
        ),
    },
    {
        title: 'Modules',
        link: '/docs/modules/core-module',
        description: (
            <>
                Composable building blocks. <strong>Memory</strong>, <strong>Planning</strong>, <strong>Tools</strong>, and <strong>User Interaction</strong> standards.
            </>
        ),
    },
    {
        title: 'Profiles',
        link: '/docs/profiles/map-profile',
        description: (
            <>
                Standardized agent capabilities. Define <strong>Role</strong>, <strong>Complexity</strong>, and <strong>Compliance</strong> levels.
            </>
        ),
    },
    {
        title: 'Observability',
        link: '/docs/observability/observability-overview',
        description: (
            <>
                Full-stack visibility. <strong>Distributed Tracing</strong>, <strong>Event Bus</strong> specs, and <strong>Log Standards</strong>.
            </>
        ),
    },
    {
        title: 'Tests',
        link: '/docs/tests/golden-test-suite-overview',
        description: (
            <>
                Validation framework. <strong>Golden Flows</strong> and <strong>Compliance Suites</strong> to ensure protocol adherence.
            </>
        ),
    },
    {
        title: 'SDK',
        link: '/docs/sdk/ts-sdk-guide',
        description: (
            <>
                Build faster. Official libraries for <strong>TypeScript</strong>, <strong>Python</strong>, and <strong>Go</strong>.
            </>
        ),
    },
];

function Feature({ title, link, description }) {
    return (
        <div className={clsx('col col--4')}>
            <Link to={link} className={styles.featureCard}>
                <div className="text--left padding--md">
                    <Heading as="h3" className={styles.featureTitle}>{title} »</Heading>
                    <p className={styles.featureDescription}>{description}</p>
                </div>
            </Link>
        </div>
    );
}

export default function Home(): React.JSX.Element {
    const { siteConfig } = useDocusaurusContext();
    return (
        <Layout
            title={`Home`}
            description="The Multi-Agent Lifecycle Protocol (MPLP) Specification">
            <HomepageHeader />
            <main>
                <section className={styles.features}>
                    <div className="container">
                        <div className="row">
                            {FeatureList.map((props, idx) => (
                                <Feature key={idx} {...props} />
                            ))}
                        </div>
                    </div>
                </section>
            </main>
        </Layout>
    );
}
