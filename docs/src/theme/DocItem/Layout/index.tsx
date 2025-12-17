import React from 'react';
import Layout from '@theme-original/DocItem/Layout';
import Head from '@docusaurus/Head';
import { useDoc } from '@docusaurus/plugin-content-docs/client';
import { useSidebarBreadcrumbs } from '@docusaurus/plugin-content-docs/client';
import {
    makeProductionCanonicalUrl,
    generateJsonLd,
    generateBreadcrumbJsonLd,
    type DocRole,
    type DocStatus,
    type SpecLevel,
} from '@site/src/utils/seo-generator';
import Admonition from '@theme/Admonition';
import type { ComponentProps } from 'react';

// Normative registry MUST be runtime-importable (JSON recommended).
// Path: docs/docs/00-index/mplp-v1.0-normative-registry.json
// Shape: { documents: [{ id: string, json_ld_id: string, ... }] }
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import normativeRegistry from '@site/docs/00-index/mplp-v1.0-normative-registry.json';

type Props = ComponentProps<typeof Layout>;

// =============================================================================
// Types
// =============================================================================

interface Classification {
    doc_status: DocStatus | null;
    doc_role: DocRole | null;
    protocol_version: string;
    spec_level: SpecLevel | null;
    normative_id: string | null;
}

// =============================================================================
// Helpers
// =============================================================================

function resolveClassification(frontMatter: any, categoryProps?: any): Classification {
    return {
        doc_status: (frontMatter?.doc_status ?? categoryProps?.doc_status ?? null) as any,
        doc_role: frontMatter?.doc_role ?? categoryProps?.doc_role ?? null,
        protocol_version: frontMatter?.protocol_version ?? categoryProps?.protocol_version ?? '1.0.0',
        spec_level: frontMatter?.spec_level ?? categoryProps?.spec_level ?? null,
        normative_id: frontMatter?.normative_id ?? categoryProps?.normative_id ?? null,
    };
}

function isGeneratedIndexDoc(metadata: any): boolean {
    // Docusaurus generated-index docs expose this flag.
    return Boolean((metadata as any)?.isGeneratedIndex);
}

function getCategoryCustomProps(metadata: any): any | undefined {
    // For generated-index rendered through DocItem, customProps typically lives on metadata.customProps.
    // We still probe defensively for version/theme variance.
    return (
        (metadata as any)?.customProps ??
        (metadata as any)?.category?.customProps ??
        (metadata as any)?.sidebarCategory?.customProps ??
        (metadata as any)?.sidebar?.customProps ??
        undefined
    );
}

function getStableDocKey(metadata: any): string {
    // Avoid relying solely on unversionedId — not guaranteed in all builds.
    // Logic: unversionedId > id > permalink (stripped) > 'unknown'

    if ((metadata as any)?.unversionedId) {
        return (metadata as any).unversionedId;
    }

    if ((metadata as any)?.id) {
        return (metadata as any).id;
    }

    if (metadata?.permalink) {
        // last resort: permalink without leading slash
        return String(metadata.permalink).replace(/^\//, '');
    }

    return 'unknown';
}

// =============================================================================
// @id Resolution (B1 FIX - Normative @id MUST FAIL)
// =============================================================================

function getJsonLdId(metadata: any, classification: Classification, registry: any): string {
    if (classification.doc_status === 'normative') {
        // PATCH r2.1: Normative @id MUST NOT fallback — must FAIL
        if (!classification.normative_id) {
            throw new Error(`Normative doc missing normative_id: ${metadata?.permalink}`);
        }
        const entry = registry?.documents?.find((d: any) => d.id === classification.normative_id);
        if (!entry) {
            throw new Error(`normative_id '${classification.normative_id}' not found in registry`);
        }
        if (!entry.json_ld_id) {
            throw new Error(`Registry entry for '${classification.normative_id}' missing json_ld_id`);
        }
        return entry.json_ld_id;
    }

    // Informative: deterministic generation (allowed)
    const key = getStableDocKey(metadata);
    return `https://docs.mplp.io/id/doc/${key}`;
}

// =============================================================================
// Component
// =============================================================================

export default function DocItemLayoutWrapper(props: Props): React.JSX.Element {
    const { metadata, frontMatter } = useDoc();
    const sidebarBreadcrumbs = useSidebarBreadcrumbs();

    const generatedIndex = isGeneratedIndexDoc(metadata);

    // LOCK-GI-01: generated-index MUST be classifiable via _category_.json customProps
    const categoryCustomProps = generatedIndex ? getCategoryCustomProps(metadata) : undefined;
    const classification = resolveClassification(frontMatter, categoryCustomProps);

    // Hard fail for generated-index missing classification
    if (generatedIndex) {
        if (!classification.doc_status || !classification.doc_role) {
            throw new Error(
                `generated-index missing classification in _category_.json customProps: ${metadata?.permalink}`
            );
        }
    }

    // Generate canonical URL - ALWAYS production URL (B3 FIX)
    const canonicalUrl = makeProductionCanonicalUrl(metadata.permalink);

    // PATCH r2.1: Normative @id enforcement (FAIL-fast, no fallback)
    const jsonLdId = getJsonLdId(metadata, classification, normativeRegistry);

    // Determine notice type
    const isNormative = classification.doc_status === 'normative';
    const isInformative = classification.doc_status === 'informative';

    // Generate primary JSON-LD
    const primaryJsonLd = generateJsonLd({
        title: metadata.title,
        description: metadata.description,
        id: jsonLdId,
    });

    // Generate breadcrumb JSON-LD
    const breadcrumbItems = sidebarBreadcrumbs?.map((crumb) => ({
        name: crumb.label,
        item: crumb.href ?? '',
    })) ?? [];

    const breadcrumbJsonLd = generateBreadcrumbJsonLd(breadcrumbItems);

    return (
        <>
            <Head>
                {/* Canonical URL */}
                <link rel="canonical" href={canonicalUrl} />
                {/* JSON-LD */}
                <script type="application/ld+json">{JSON.stringify(primaryJsonLd)}</script>
                {breadcrumbJsonLd && (
                    <script type="application/ld+json">
                        {JSON.stringify(breadcrumbJsonLd)}
                    </script>
                )}
            </Head>

            {/* Normative/Informative Notice Banner */}
            <div style={{ marginBottom: '1rem' }}>
                {isNormative && (
                    <Admonition type="info" icon="⚖️" title="Normative Specification">
                        <p style={{ marginBottom: 0 }}>
                            This document is a <strong>Normative</strong> part of the MPLP v1.0 Protocol.
                            Content designated with MUST, SHALL, or REQUIRED defines binding requirements for compliance.
                        </p>
                    </Admonition>
                )}
                {isInformative && (
                    <Admonition type="note" icon="📘" title="Informative Guide">
                        <p style={{ marginBottom: 0 }}>
                            This document is <strong>Informative</strong>. It provides guidance, examples, or context
                            but does not define protocol requirements.
                        </p>
                    </Admonition>
                )}
            </div>

            <Layout {...props} />
        </>
    );
}
