import { describe, expect, it } from 'vitest';
import { makeCanonicalUrl } from '../seo-generator';

describe('makeCanonicalUrl', () => {
    it('Case 1: basic root baseUrl', () => {
        expect(makeCanonicalUrl('https://x.io', '/', '/a/b', false)).toBe('https://x.io/a/b');
    });

    it('Case 2: siteUrl trailing slash removed', () => {
        expect(makeCanonicalUrl('https://x.io/', '/', '/a', false)).toBe('https://x.io/a');
    });

    it('Case 3: baseUrl normalized', () => {
        expect(makeCanonicalUrl('https://x.io', 'mplp', '/a', false)).toBe('https://x.io/mplp/a');
    });

    it('Case 4: permalink normalized', () => {
        expect(makeCanonicalUrl('https://x.io', '/mplp/', 'a/b', false)).toBe('https://x.io/mplp/a/b');
    });

    it('Case 5: dedupe exact base segments', () => {
        expect(makeCanonicalUrl('https://x.io', '/mplp/', '/mplp/a', false)).toBe('https://x.io/mplp/a');
    });

    it('Case 6: trailingSlash=false trims non-root', () => {
        expect(makeCanonicalUrl('https://x.io', '/', '/a/', false)).toBe('https://x.io/a');
    });

    it('Case 7: Path segment false positive prevention', () => {
        expect(makeCanonicalUrl('https://x.io', '/mplp/', '/mplp-x/abc', false))
            .toBe('https://x.io/mplp/mplp-x/abc');
    });
});
