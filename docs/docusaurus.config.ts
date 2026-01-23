import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'MPLP Documentation',
  tagline: 'Multi-Agent Lifecycle Protocol - Observable, Interoperable, Governed AI Agents',
  favicon: 'img/favicon.png',

  // Future flags
  future: {
    v4: true,
  },

  // GitHub Pages deployment
  url: 'https://docs.mplp.io',
  baseUrl: '/',
  organizationName: 'Coregentis',
  projectName: 'MPLP-Protocol',
  deploymentBranch: 'gh-pages',
  trailingSlash: false,

  onBrokenLinks: 'warn',

  // Plugins
  plugins: [
    require.resolve('docusaurus-lunr-search'),
    // P0-1: Fix Soft 404 at /index by redirecting to /
    [
      '@docusaurus/plugin-client-redirects',
      {
        redirects: [
          { from: '/index', to: '/' },
          { from: '/index.html', to: '/' },
        ],
      },
    ],
  ],

  // Mermaid diagrams are now pre-rendered to SVG at build time (P1-5)
  // themes: ['@docusaurus/theme-mermaid'],

  // Fonts are now self-hosted in static/fonts/ - see custom.css
  // Removed external Google Fonts to eliminate render-blocking resources (P0-1)
  // stylesheets: [],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/Coregentis/MPLP-Protocol/tree/main/docs/',
          // Docs at /docs/ to allow Landing Page at /
          routeBasePath: 'docs',
          showLastUpdateTime: true,
          // Enable breadcrumbs
          breadcrumbs: true,
          // Preserve numeric prefixes in URLs/DocIDs
          numberPrefixParser: false,
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
        sitemap: {
          changefreq: 'weekly',
          priority: 0.5,
          filename: 'sitemap.xml',
        },
      } satisfies Preset.Options,
    ],
  ],

  // Configure markdown processing
  markdown: {
    format: 'detect',
    // Mermaid runtime disabled - diagrams pre-rendered to SVG (P1-5)
    // mermaid: true,
    mdx1Compat: {
      comments: true,
      admonitions: true,
      headingIds: true,
    },
  },

  // SEO head tags
  headTags: [
    {
      tagName: 'meta',
      attributes: {
        name: 'keywords',
        content: 'MPLP, Multi-Agent, AI Agent, Protocol, Lifecycle, Observability, LLM, Agentic AI, OpenAI, Anthropic',
      },
    },
    {
      tagName: 'meta',
      attributes: {
        property: 'og:type',
        content: 'website',
      },
    },
    {
      tagName: 'meta',
      attributes: {
        name: 'twitter:card',
        content: 'summary_large_image',
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'preload',
        href: '/fonts/inter-500.woff2',
        as: 'font',
        type: 'font/woff2',
        crossorigin: 'anonymous',
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'preload',
        href: '/fonts/jetbrains-mono-400.woff2',
        as: 'font',
        type: 'font/woff2',
      },
    },
  ],

  themeConfig: {
    image: 'img/mplp-social-card.jpg',
    metadata: [
      { name: 'theme-color', content: '#2563eb' },
      { name: 'og:locale', content: 'en_US' },
      // Four-Entry Model role signals (not JSON-LD, visible meta tags)
      { name: 'mplp:entry-role', content: 'Documentation — Specification & Reference' },
      { name: 'mplp:entrypoints', content: 'website=https://www.mplp.io; docs=https://docs.mplp.io; lab=https://lab.mplp.io; repo=https://github.com/Coregentis/MPLP-Protocol' },
      { name: 'mplp:entity-manifest', content: 'https://www.mplp.io/assets/geo/mplp-entity.json' },
      { name: 'application-name', content: 'MPLP Documentation' },
    ],
    // Table of contents on the right (like Antigravity's "On this Page")
    tableOfContents: {
      minHeadingLevel: 2,
      maxHeadingLevel: 4,
    },
    docs: {
      sidebar: {
        hideable: true,
        autoCollapseCategories: false,
      },
    },
    announcementBar: {
      id: 'frozen_status',
      content:
        '<strong>MPLP v1.0.0 — FROZEN · Apache-2.0 · No breaking changes in v1.x</strong>',
      backgroundColor: '#1A73E8',
      textColor: '#ffffff',
      isCloseable: false,
    },
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'MPLP',
      logo: {
        alt: 'MPLP Logo',
        src: 'img/logo.png', // Using PNG for better rendering in navbar
        href: '/',
      },
      items: [
        // Left side - Protocol Sections
        {
          type: 'doc',
          docId: 'intro',
          label: 'Docs',
          position: 'left',
        },
        {
          to: '/docs/specification/architecture',
          label: 'Architecture',
          position: 'left',
        },
        {
          to: '/docs/specification/modules/module-interactions',
          label: 'Modules',
          position: 'left',
        },
        {
          to: '/docs/specification/profiles/sa-profile',
          label: 'Profiles',
          position: 'left',
        },
        {
          to: '/docs/specification/observability/observability-overview',
          label: 'Observability',
          position: 'left',
        },
        {
          to: '/docs/evaluation/golden-flows',
          label: 'Golden Flows',
          position: 'left',
        },
        {
          to: '/docs/guides/sdk/ts-sdk-guide',
          label: 'SDK',
          position: 'left',
        },

        // Right side - External links
        {
          href: 'https://www.mplp.io',
          label: 'Protocol Overview',
          position: 'right',
          className: 'header-protocol-link',
        },
        {
          href: 'https://www.npmjs.com/package/@mplp/sdk-ts',
          label: 'npm',
          position: 'right',
          className: 'button button--outline button--sm',
        },
        {
          href: 'https://pypi.org/project/mplp-sdk/',
          label: 'PyPI',
          position: 'right',
          className: 'button button--outline button--sm',
        },
        {
          href: 'https://lab.mplp.io',
          label: 'Validation Lab',
          position: 'right',
          className: 'header-lab-link',
        },
        {
          href: 'https://github.com/Coregentis/MPLP-Protocol',
          label: 'GitHub',
          position: 'right',
          className: 'header-github-link',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          // Column 1: PROTOCOL (T0 + Governance Root)
          title: 'Protocol',
          items: [
            { label: 'Protocol Overview', href: 'https://www.mplp.io' },
            { label: 'Governance', href: 'https://www.mplp.io/governance' },
            { label: 'Validation Lab', href: 'https://lab.mplp.io' },
            { label: 'FAQ', href: 'https://www.mplp.io/faq' },
            { label: 'References', href: 'https://www.mplp.io/references' },
          ],
        },
        {
          // Column 2: SPECIFICATION (T1/T2)
          title: 'Specification',
          items: [
            { label: 'Architecture', to: '/docs/specification/architecture' },
            { label: 'Modules', to: '/docs/specification/modules/module-interactions' },
            { label: 'Golden Flows', to: '/docs/evaluation/golden-flows' },
            { label: 'SDK Guide', to: '/docs/guides/sdk/ts-sdk-guide' },
          ],
        },
        {
          // Column 3: COMMUNITY (T3/T4)
          title: 'Community',
          items: [
            { label: 'Ecosystem', href: 'https://www.mplp.io/ecosystem' },
            { label: 'GitHub', href: 'https://github.com/Coregentis/MPLP-Protocol' },
            { label: 'npm', href: 'https://www.npmjs.com/package/@mplp/sdk-ts' },
            { label: 'PyPI', href: 'https://pypi.org/project/mplp-sdk/' },
          ],
        },
      ],
      copyright: `© ${new Date().getFullYear()} Bangshi Beijing Network Technology Co., Ltd. Licensed under the <a href="https://www.apache.org/licenses/LICENSE-2.0" target="_blank" rel="noopener noreferrer">Apache License, Version 2.0</a>. Governed by <a href="https://www.mplp.io/governance/overview" target="_blank" rel="noopener noreferrer">MPGC</a>.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['typescript', 'python', 'json', 'bash', 'yaml'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
