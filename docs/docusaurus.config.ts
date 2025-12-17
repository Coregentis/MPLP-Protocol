import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'MPLP Protocol',
  tagline: 'Multi-Agent Lifecycle Protocol - Observable, Interoperable, Governed AI Agents',
  favicon: 'img/favicon.png',

  // GitHub Pages deployment
  url: 'https://docs.mplp.io',
  baseUrl: '/',
  trailingSlash: false,

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
    localeConfigs: {
      en: { label: 'English', htmlLang: 'en-US' },
    },
  },

  // Plugins
  plugins: [
    require.resolve('docusaurus-lunr-search'),
  ],

  // Google Fonts for MPLP Brand
  stylesheets: [
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap',
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/Coregentis/MPLP-Protocol/tree/main/docs/',
          // Make docs the root path (like Antigravity)
          routeBasePath: '/',
          showLastUpdateTime: true,
          // Enable breadcrumbs
          breadcrumbs: true,
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
    mermaid: false,
    mdx1Compat: {
      comments: true,
      admonitions: true,
      headingIds: true,
    },
  },

  // SEO head tags - REMOVED global JSON-LD to implementation per-page injection
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
    colorMode: {
      defaultMode: 'light',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'MPLP Protocol',
      logo: {
        alt: 'MPLP Logo',
        src: 'img/logo.png',
        href: '/',
      },
      items: [
        // Left side - Quick navigation dropdowns
        {
          type: 'dropdown',
          label: 'Architecture',
          position: 'left',
          items: [
            { to: '/architecture/architecture-overview', label: 'Overview' },
            { to: '/architecture/l1-core-protocol', label: 'L1 Core Protocol' },
            { to: '/architecture/l1-l4-architecture-deep-dive', label: 'L1-L4 Deep Dive' },
            { to: '/architecture/cross-cutting/overview', label: 'Cross-Cutting Concerns' },
          ],
        },
        {
          type: 'dropdown',
          label: 'Modules',
          position: 'left',
          items: [
            { to: '/modules/context-module', label: 'Context' },
            { to: '/modules/plan-module', label: 'Plan' },
            { to: '/modules/confirm-module', label: 'Confirm' },
            { to: '/modules/trace-module', label: 'Trace' },
            { to: '/modules/role-module', label: 'Role' },
            { to: '/modules/collab-module', label: 'Collab' },
          ],
        },
        {
          type: 'dropdown',
          label: 'Implementation',
          position: 'left',
          items: [
            { to: '/sdk/ts-sdk-guide', label: 'TypeScript SDK' },
            { to: '/sdk/py-sdk-guide', label: 'Python SDK' },
            { to: '/guides/quickstart-5min', label: 'Quick Start' },
            { to: '/guides/mplp-v1.0-compliance-guide', label: 'Compliance Guide' },
          ],
        },

        // Right side - External links (like Antigravity's buttons)
        {
          href: 'https://mplp.io',
          label: 'Official Site',
          position: 'right',
        },
        {
          href: 'https://www.npmjs.com/package/@mplp/sdk-ts',
          label: 'npm',
          position: 'right',
        },
        {
          href: 'https://pypi.org/project/mplp-sdk/',
          label: 'PyPI',
          position: 'right',
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
          title: 'Specification',
          items: [
            { label: 'Architecture', to: '/architecture' },
            { label: 'Modules', to: '/modules' },
            { label: 'Profiles', to: '/profiles' },
          ],
        },
        {
          title: 'Implementation',
          items: [
            { label: 'SDK', to: '/sdk' },
            { label: 'Guides', to: '/guides' },
            { label: 'Examples', to: '/examples' },
          ],
        },
        {
          title: 'Resources',
          items: [
            { label: 'Official Site', href: 'https://mplp.io' },
            { label: 'GitHub', href: 'https://github.com/Coregentis/MPLP-Protocol' },
            { label: 'npm', href: 'https://www.npmjs.com/package/@mplp/sdk-ts' },
            { label: 'PyPI', href: 'https://pypi.org/project/mplp-sdk/' },
          ],
        },
      ],
      copyright: `Copyright © 2025 Bangshi Beijing Network Technology Limited Company.<br/>Governed by MPLP Protocol Governance Committee. Licensed under Apache 2.0.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['typescript', 'python', 'json', 'bash', 'yaml'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
