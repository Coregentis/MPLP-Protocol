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
                <Heading as="h1" className={styles.heroTitlePrimary}>
                    MPLP Specification v1.0.0 (Frozen)
                </Heading>

                <p className={styles.heroSubtitle}>
                    Authoritative definitions live in the Schemas (Source of Truth).<br />
                    This site provides structured specification navigation, references, and evaluation guidance for MPLP v1.0.0 (Frozen).
                </p>

                <div className={styles.noticeBlock}>
                    <p className={styles.noticeLabel}>Documentation Scope</p>
                    <p className={styles.noticeText}>
                        Docs is the specification and reference surface. It organizes repository-backed protocol material for reading, citation, and implementation guidance.
                    </p>
                </div>

                <div className={styles.noticeBlock}>
                    <p className={styles.noticeLabel}>Non-Goals</p>
                    <p className={styles.noticeText}>
                        MPLP is not a framework, runtime, or platform. This homepage orients readers into the documentation set; it does not replace repository truth sources.
                    </p>
                </div>

                <div className={styles.noticeBlock}>
                    <p className={styles.noticeLabel}>Reading Order</p>
                    <p className={styles.noticeText}>
                        Start with the protocol overview, then move into architecture, modules, profiles, observability, and evaluation material as needed.
                    </p>
                </div>

                <div className={styles.linkRow}>
                    <ReadPathItem label="Protocol Overview" link="/docs/introduction/mplp-v1.0-protocol-overview" />
                    <ReadPathItem label="Architecture" link="/docs/specification/architecture" />
                    <ReadPathItem label="Modules" link="/docs/specification/modules/module-interactions" />
                    <ReadPathItem label="Profiles" link="/docs/specification/profiles/sa-profile" />
                    <ReadPathItem label="Observability" link="/docs/specification/observability/observability-overview" />
                    <ReadPathItem label="Golden Flows" link="/docs/evaluation/golden-flows" />
                </div>
            </div>
        </header>
    );
}

const FeatureList = [
    {
        title: 'Architecture',
        link: '/docs/specification/architecture',
        description: (
            <>
                The layered foundation. <strong>L1 Core</strong> (State), <strong>L2 Coordination</strong> (Governance), and <strong>L3 Execution</strong> (Semantics).
            </>
        ),
    },
    {
        title: 'Modules',
        link: '/docs/specification/modules/module-interactions',
        description: (
            <>
                Protocol object families. <strong>Context</strong>, <strong>Plan</strong>, <strong>Confirm</strong>, and <strong>Trace</strong> are read through schema-backed module interactions.
            </>
        ),
    },
    {
        title: 'Profiles',
        link: '/docs/specification/profiles/map-profile',
        description: (
            <>
                Standardized agent capabilities. Define <strong>Role</strong>, <strong>Complexity</strong>, and <strong>Conformance</strong> levels.
            </>
        ),
    },
    {
        title: 'Observability',
        link: '/docs/specification/observability/observability-overview',
        description: (
            <>
                Event-centered reference. <strong>Event families</strong>, <strong>observability invariants</strong>, and <strong>trace/export references</strong>.
            </>
        ),
    },
    {
        title: 'Tests',
        link: '/docs/evaluation/tests/golden-test-suite-overview',
        description: (
            <>
                <strong>Golden Flows</strong> and <strong>Conformance Suites</strong> define reproducible scenarios that generate evidence packs.
                Adjudication is provided externally by the Validation Lab.
            </>
        ),
    },
    {
        title: 'SDK',
        link: '/docs/guides/sdk/ts-sdk-guide',
        description: (
            <>
                Public package guidance. Official SDK surfaces are documented for <strong>TypeScript</strong> and <strong>Python</strong>.
            </>
        ),
    },
    {
        title: 'Validation Lab',
        link: 'https://lab.mplp.io',
        external: true,
        description: (
            <>
                Evidence-based verdict gateway for lifecycle guarantees. Browse <strong>Coverage</strong>, <strong>Runs</strong>, and <strong>Adjudication</strong>.
                <span style={{ display: 'block', fontSize: '0.8em', marginTop: '0.5rem', color: '#94a3b8', fontStyle: 'italic' }}>
                    Not a certification program. Live counts remain in the Lab.
                </span>
            </>
        ),
    },
];

function ReadPathItem({ label, link }) {
    return (
        <Link to={link} style={{
            fontSize: '0.82rem',
            color: '#475569',
            border: '1px solid #e2e8f0',
            padding: '0.35rem 0.75rem',
            borderRadius: '0.375rem',
            textDecoration: 'none',
            background: '#f8fafc'
        }}>
            {label}
        </Link>
    );
}

function Feature({ title, link, description, external = false }) {
    const linkProps = external
        ? { href: link, target: '_blank', rel: 'noopener noreferrer' }
        : { to: link };
    const LinkComponent = external ? 'a' : Link;
    return (
        <div className={clsx('col col--4')}>
            <LinkComponent {...linkProps} className={styles.featureCard}>
                <div className="text--left padding--md">
                    <Heading as="h3" className={styles.featureTitle}>
                        {title} {external ? '↗' : '»'}
                    </Heading>
                    <p className={styles.featureDescription}>{description}</p>
                </div>
            </LinkComponent>
        </div>
    );
}

export default function Home(): React.JSX.Element {
    const { siteConfig } = useDocusaurusContext();
    return (
        <Layout
            title={`MPLP Documentation — Specification & Reference (v1.0.0 Frozen)`}
            description="Authoritative MPLP v1.0.0 (Frozen) specification navigation and references. Schemas are the single source of truth. Includes architecture, modules, profiles, observability, and evidence-based Golden Flows.">
            <HomepageHeader />
            <main>
                <section className={styles.features}>
                    <div className="container">
                        <div className="row">
                            {FeatureList.map((props, idx) => (
                                <Feature key={idx} {...props} />
                            ))}
                        </div>
                        {/* Evaluation Boundary Disclaimer */}
                        <div style={{
                            marginTop: '2rem',
                            padding: '1rem',
                            textAlign: 'center',
                            borderTop: '1px solid rgba(148, 163, 184, 0.2)'
                        }}>
                            <p style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic', margin: 0 }}>
                                Evaluation guidance here is reference-only. Live adjudication data and coverage metrics remain in the Validation Lab.
                            </p>
                        </div>
                    </div>
                </section>
            </main>
        </Layout>
    );
}
