# Font Files Required for P0-1 Optimization

Download the following font files to `docs/static/fonts/`:

## Inter (Latin subset)
- inter-400.woff2 (Regular)
- inter-500.woff2 (Medium)
- inter-600.woff2 (SemiBold)
- inter-700.woff2 (Bold)

## JetBrains Mono (for code blocks)
- jetbrains-mono-400.woff2 (Regular)
- jetbrains-mono-500.woff2 (Medium)

## Download Sources
- Inter: https://github.com/rsms/inter/releases
- JetBrains Mono: https://github.com/JetBrains/JetBrainsMono/releases

## DoD Verification
After adding fonts:
1. Build docs: `npm run build`
2. Check HTML for no fonts.googleapis.com links
3. Test font loading with `font-display: swap` (may see brief FOUT)
4. Run Lighthouse: check "Eliminate render-blocking resources" improvement
