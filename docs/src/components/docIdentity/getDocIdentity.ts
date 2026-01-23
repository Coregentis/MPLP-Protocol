/**
 * Get document identity from frontmatter
 * Used by DocIdentityHeader component
 */

export interface DocIdentity {
    doc_profile: string;
    normativity: string | null;
    lifecycle_status: string | null;
    authority: string | null;
    showDisambiguation: boolean;
    warnings: string[];  // Phase 3: Mandatory warnings for draft/formative
}

export function calculateDocProfile(
    normativity: string | null,
    lifecycle_status: string | null,
    authority: string | null
): string {
    if (!normativity) return 'unknown-default-informative';

    if (normativity === 'normative') {
        if (lifecycle_status === 'frozen') return 'normative-frozen';
        if (lifecycle_status === 'active') return 'normative-active';
        return 'normative-draft';
    }

    if (normativity === 'formative') {
        return 'formative';
    }

    if (normativity === 'informative' || normativity === 'non-normative') {
        return 'informative';
    }

    return 'unknown-default-informative';
}

/**
 * Generate mandatory warnings based on doc status
 * Phase 3: Draft and formative pages must display warnings
 */
function generateWarnings(
    lifecycle_status: string | null,
    normativity: string | null
): string[] {
    const warnings: string[] = [];

    // Draft pages are noindex and non-authoritative
    if (lifecycle_status === 'draft') {
        warnings.push('Draft — Non-authoritative content (noindex)');
    }

    // Formative pages are in development
    if (normativity === 'formative') {
        warnings.push('Formative — In development (noindex)');
    }

    return warnings;
}

export function getDocIdentity(frontMatter: any): DocIdentity {
    // normativity is the ONLY valid source for doc classification
    // doc_type is NOT a valid substitute (legacy compatibility removed)
    const normativity = frontMatter.normativity || null;

    // Warn if using doc_type without normativity (should not happen after cleanup)
    if (!normativity && frontMatter.doc_type) {
        console.warn(`[DocIdentity] Missing normativity in page with doc_type: ${frontMatter.doc_type}`);
    }

    const lifecycle_status = frontMatter.lifecycle_status || frontMatter.status || null;
    const authority = frontMatter.authority || null;


    const doc_profile = calculateDocProfile(normativity, lifecycle_status, authority);
    const warnings = generateWarnings(lifecycle_status, normativity);

    // Show disambiguation on unknown profiles or high-traffic pages
    const showDisambiguation = doc_profile.includes('unknown') ||
        frontMatter.id === 'intro' ||
        frontMatter.id === 'entrypoints';

    return {
        doc_profile,
        normativity,
        lifecycle_status,
        authority,
        showDisambiguation,
        warnings,
    };
}

