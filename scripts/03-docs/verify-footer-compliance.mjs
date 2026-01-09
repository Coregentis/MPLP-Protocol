#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

function exists(p) {
    try {
        fs.accessSync(p);
        return true;
    } catch {
        return false;
    }
}

function read(p) {
    return fs.readFileSync(p, "utf8");
}

function fail(msg) {
    console.error(`[FAIL] ${msg}`);
    process.exit(1);
}

function pass(msg) {
    console.log(`[PASS] ${msg}`);
}

function resolveWebsiteRoot() {
    // Support both naming conventions:
    const candidates = [
        path.join(ROOT, "MPLP_website"),
        path.join(ROOT, "_temp_website"),
        path.join(ROOT, "website"),
    ];
    for (const c of candidates) {
        if (exists(c) && fs.statSync(c).isDirectory()) return c;
    }
    fail(
        `Cannot resolve website root. Tried: ${candidates.map((x) => path.relative(ROOT, x)).join(", ")}`
    );
}

function main() {
    const webRoot = resolveWebsiteRoot();

    const footerPath = path.join(webRoot, "components", "layout", "footer.tsx");
    const logoPath = path.join(webRoot, "components", "ui", "logo.tsx");

    if (!exists(footerPath)) fail(`Missing footer file: ${footerPath}`);
    if (!exists(logoPath)) fail(`Missing logo file: ${logoPath}`);

    const footer = read(footerPath);
    const logo = read(logoPath);

    // 1) Footer brand column must NOT contain "Governance" block.
    // We do this conservatively: forbid a "Governance" heading inside the brand/column area.
    // We look for "Brand" and "Governance" appearing within a small window, or a specific comment pattern.
    const governanceInBrandColumn = /Brand.{0,200}Governance/s.test(footer);

    // If you have stable JSX, prefer exact marker check:
    // e.g., <FooterBrand> ... Governance ... </FooterBrand>
    const governanceInsideBrandBlock =
        /<[^>]*Brand[^>]*>[\s\S]*Governance[\s\S]*<\/[^>]*Brand[^>]*>/i.test(footer);

    if (governanceInBrandColumn || governanceInsideBrandBlock) {
        fail(`footer.tsx contains a "Governance" block in the brand column (forbidden).`);
    }

    // 2) Footer MUST contain governance statement in bottom copyright section.
    // Look for a known statement fragment; adjust to your canonical copy snippet.
    const requiredGovernanceStatementHint =
        /does not certify|does not certify products|does not certify, endorse/i.test(footer) ||
        /Managed by the MPLP Protocol Governance Committee/.test(footer);

    if (!requiredGovernanceStatementHint) {
        fail(
            `footer.tsx does not appear to include the required governance statement in the bottom section.`
        );
    }

    // 3) logo.tsx must support showText prop
    const showTextPropDeclared =
        /showText\s*\??\s*:\s*boolean/.test(logo) || /showText\s*=\s*/.test(logo) || /showText\}/.test(logo);

    if (!showTextPropDeclared) {
        fail(`logo.tsx does not appear to support a showText prop.`);
    }

    // 4) footer.tsx must NOT set showText={false}
    if (/showText\s*=\s*\{\s*false\s*\}/.test(footer)) {
        fail(`footer.tsx sets showText={false} (forbidden). Logo text must be visible.`);
    }

    pass(`Footer compliance verified at: ${path.relative(ROOT, footerPath)}`);
}

main();
