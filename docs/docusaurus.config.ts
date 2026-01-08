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
        crossorigin: 'anonymous',
      },
    },
    {
      tagName: 'script',
      attributes: {
        type: 'application/ld+json',
      },
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org/',
        '@type': 'SoftwareSourceCode',
        name: 'MPLP',
        description: 'Multi-Agent Lifecycle Protocol for building observable, interoperable, and governed AI agent systems',
        url: 'https://docs.mplp.io',
        codeRepository: 'https://github.com/Coregentis/MPLP-Protocol',
        programmingLanguage: ['TypeScript', 'Python'],
        license: 'https://www.apache.org/licenses/LICENSE-2.0',
        author: {
          '@type': 'Organization',
          name: 'Bangshi Beijing Network Technology Limited Company',
        },
      }),
    },
  ],

  themeConfig: {
    image: 'img/mplp-social-card.jpg',
    metadata: [
      { name: 'theme-color', content: '#2563eb' },
      { name: 'og:locale', content: 'en_US' },
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
      copyright: `Copyright © 2025 Bangshi Beijing Network Technology Co., Ltd.<br/>Licensed under the Apache License 2.0.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['typescript', 'python', 'json', 'bash', 'yaml'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
