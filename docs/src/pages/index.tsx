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
                {/* Primary Title - Protocol Name */}
                <Heading as="h1" className={styles.heroTitlePrimary}>
                    MPLP Specification v1.0.0 (Frozen)
                </Heading>

                {/* Hero Definition - Specification Entry (elevated to main sentence) */}
                <p className={styles.heroSubtitle}>
                    Authoritative definitions live in the Schemas (Source of Truth).<br />
                    This site provides structured specification navigation, references, and evaluation guidance for MPLP v1.0.0 (Frozen).
                </p>

                {/* Non-Goals Block (formal governance section) */}
                <p style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500, marginBottom: '0.75rem' }}>
                    <strong style={{ color: '#475569' }}>Non-Goals:</strong> MPLP is not a framework, not a runtime, and not a platform.
                </p>

                {/* Positioning Analogy - Explicitly Non-Normative */}
                <div style={{
                    backgroundColor: 'rgba(148, 163, 184, 0.1)',
                    borderRadius: '0.5rem',
                    padding: '0.75rem 1rem',
                    maxWidth: '500px',
                    margin: '0 auto 1.5rem auto',
                    border: '1px solid rgba(148, 163, 184, 0.2)'
                }}>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0, fontWeight: 600 }}>
                        Positioning Analogy (Non-Normative)
                    </p>
                    <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '0.25rem 0 0 0', fontStyle: 'italic' }}>
                        Often described as "The Agent OS Protocol" — a conceptual analogy for lifecycle governance.
                        This does not imply an execution runtime, operating system, or vendor platform.
                    </p>
                </div>

                {/* Badges Section */}
                <div className={styles.badges}>
                    <img src="https://img.shields.io/badge/Protocol-v1.0.0(FROZEN)-blue?style=flat-square" alt="Protocol" />
                    <img src="https://img.shields.io/badge/Governance-MPGC_Managed-blue?style=flat-square" alt="Governance" />
                    <img src="https://img.shields.io/badge/License-Apache_2.0-green?style=flat-square" alt="License" />
                    <img src="https://img.shields.io/badge/Schemas-v2_bundle_(Repo)-lightgrey?style=flat-square" alt="Schemas" />
                    <a href="https://lab.mplp.io" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                        <img src="https://img.shields.io/badge/Validation_Lab_(External)-Evidence_Sealed-orange?style=flat-square" alt="Validation Lab (External)" />
                    </a>
                </div>

                {/* Governance Statement */}
                <p style={{ fontSize: '0.85rem', color: '#64748b', maxWidth: '600px', margin: '1.5rem auto', lineHeight: '1.6' }}>
                    Governed by MPGC. The specification is frozen at v1.0.0 — no breaking changes permitted.
                    Reference SDKs and Golden Flows enable protocol conformance without vendor certification.
                    Governance processes and constitutional records are maintained in the Repository <code>governance/</code> directory; this site provides pointers only.
                </p>

                <div className={styles.buttons}>
                    <Link
                        className="button button--secondary button--lg"
                        to="/docs/introduction/mplp-v1.0-protocol-overview">
                        Start Reading (Protocol Overview)
                    </Link>
                    <Link
                        className="button button--info button--lg"
                        style={{ marginLeft: '1rem', backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', color: '#3b82f6' }}
                        to="https://github.com/Coregentis/MPLP-Protocol/tree/main/schemas">
                        Schemas (Source of Truth)
                    </Link>
                    <Link
                        className="button button--outline button--lg"
                        style={{ marginLeft: '1rem', color: '#64748b', borderColor: '#e2e8f0' }}
                        to="/docs/evaluation/golden-flows">
                        Golden Flows (Evaluation)
                    </Link>
                </div>

                {/* Start Here - Reading Path */}
                <div style={{ marginTop: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Start Here</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', alignItems: 'center' }}>
                        <ReadPathItem label="Protocol Overview" link="/docs/introduction/mplp-v1.0-protocol-overview" />
                        <ReadPathItem label="Architecture (L1–L4)" link="/docs/specification/architecture" />
                        <ReadPathItem label="Modules (L2)" link="/docs/specification/modules/module-interactions" />
                        <ReadPathItem label="Profiles (SA/MAP)" link="/docs/specification/profiles/sa-profile" />
                        <ReadPathItem label="Observability" link="/docs/specification/observability/observability-overview" />
                        <ReadPathItem label="Golden Flows" link="/docs/evaluation/golden-flows" />
                    </div>
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
        link: '/docs/specification/modules/core-module',
        description: (
            <>
                Composable building blocks. <strong>Memory</strong>, <strong>Planning</strong>, <strong>Tools</strong>, and <strong>User Interaction</strong> standards.
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
                Full-stack visibility. <strong>Distributed Tracing</strong>, <strong>Event Bus</strong> specs, and <strong>Log Standards</strong>.
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
                Build faster. Official libraries for <strong>TypeScript</strong>, <strong>Python</strong>, and <strong>Go</strong>.
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
            fontSize: '0.85rem',
            color: '#475569',
            border: '1px solid #e2e8f0',
            padding: '0.25rem 0.75rem',
            borderRadius: '999px',
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
