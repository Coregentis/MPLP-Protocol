import React from 'react';
import ThemedImage from '@theme/ThemedImage';
import useBaseUrl from '@docusaurus/useBaseUrl';

interface MermaidDiagramProps {
    id: string;
    alt: string;
    caption?: string;
    source?: string;
}

/**
 * Mermaid Diagram Component - Pre-rendered SVG with SEO/GEO enhancements
 * 
 * Three-layer semantic structure:
 * 1. ALT text: Accessibility & basic semantics
 * 2. Figure caption: Indexable, crawlable description
 * 3. Hidden source: Machine-readable textual equivalent
 * 
 * Part of Day 2 P1-5 Performance Optimization + SEO Enhancement
 */
export default function MermaidDiagram({
    id,
    alt,
    caption,
    source
}: MermaidDiagramProps) {
    const lightSvg = useBaseUrl(`/mermaid/${id}.light.svg`);
    const darkSvg = useBaseUrl(`/mermaid/${id}.dark.svg`);

    return (
        <figure
            className="mermaid-diagram-container"
            style={{ margin: '2rem 0' }}
            data-diagram-id={id}
            data-diagram-type="mermaid"
            data-diagram-title={alt}
        >
            <ThemedImage
                sources={{
                    light: lightSvg,
                    dark: darkSvg,
                }}
                alt={alt}
                style={{
                    maxWidth: '100%',
                    height: 'auto',
                }}
                loading="lazy"
                decoding="async"
            />

            {caption && (
                <figcaption
                    style={{
                        marginTop: '0.5rem',
                        fontSize: '0.9em',
                        color: 'var(--ifm-color-emphasis-700)',
                        textAlign: 'center',
                        fontStyle: 'italic'
                    }}
                >
                    {caption}
                </figcaption>
            )}

            {source && (
                <details className="diagram-source-text" style={{ marginTop: '0.5rem' }}>
                    <summary style={{ cursor: 'pointer', fontSize: '0.85em', color: 'var(--ifm-color-emphasis-600)' }}>
                        Diagram source (Mermaid)
                    </summary>
                    <pre style={{
                        fontSize: '0.8em',
                        padding: '0.5rem',
                        backgroundColor: 'var(--ifm-code-background)',
                        borderRadius: '4px',
                        overflow: 'auto'
                    }}>
                        {source}
                    </pre>
                </details>
            )}
        </figure>
    );
}
