import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'MPLP Protocol',
  tagline: 'Multi-Agent Lifecycle Protocol - Observable, Interoperable, Governed AI Agents',
  favicon: 'img/favicon.svg',

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
  onBrokenMarkdownLinks: 'warn',

  // Plugins
  plugins: [
    require.resolve('docusaurus-lunr-search'),
  ],

  themes: ['@docusaurus/theme-mermaid'],

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
    mermaid: true,
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
      tagName: 'script',
      attributes: {
        type: 'application/ld+json',
      },
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org/',
        '@type': 'SoftwareSourceCode',
        name: 'MPLP Protocol',
        description: 'Multi-Agent Lifecycle Protocol for building observable, interoperable, and governed AI agent systems',
        url: 'https://coregentis.github.io/MPLP-Protocol/',
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
    colorMode: {
      defaultMode: 'light',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'MPLP Protocol',
      logo: {
        alt: 'MPLP Logo',
        src: 'img/logo.svg',
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
          type: 'doc',
          docId: 'architecture/architecture-overview',
          label: 'Architecture',
          position: 'left',
        },
        {
          type: 'doc',
          docId: 'modules/context-module',
          label: 'Modules',
          position: 'left',
        },
        {
          type: 'doc',
          docId: 'profiles/sa-profile',
          label: 'Profiles',
          position: 'left',
        },
        {
          type: 'doc',
          docId: 'observability/observability-overview',
          label: 'Observability',
          position: 'left',
        },
        {
          type: 'doc',
          docId: 'tests/golden-test-suite-overview',
          label: 'Tests',
          position: 'left',
        },
        {
          type: 'doc',
          docId: 'sdk/ts-sdk-guide',
          label: 'SDK',
          position: 'left',
        },

        // Right side - External links
        {
          href: 'https://www.npmjs.com/package/@mplp/sdk-ts',
          label: 'npm',
          position: 'right',
          className: 'button button--outline button--sm',
        },
        {
          href: 'https://pypi.org/project/mplp/',
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
          title: 'Specification',
          items: [
            { label: 'Architecture', to: '/architecture/architecture-overview' },
            { label: 'Modules', to: '/modules/context-module' },
            { label: 'Profiles', to: '/profiles/sa-profile' },
          ],
        },
        {
          title: 'Implementation',
          items: [
            { label: 'TypeScript SDK', to: '/sdk/ts-sdk-guide' },
            { label: 'Python SDK', to: '/sdk/py-sdk-guide' },
            { label: 'Quick Start', to: '/guides/quickstart-5min' },
          ],
        },
        {
          title: 'Resources',
          items: [
            { label: 'GitHub', href: 'https://github.com/Coregentis/MPLP-Protocol' },
            { label: 'npm', href: 'https://www.npmjs.com/package/@mplp/sdk-ts' },
            { label: 'PyPI', href: 'https://pypi.org/project/mplp/' },
          ],
        },
      ],
      copyright: `Copyright © 2025 Bangshi Beijing Network Technology Limted Company.<br/>Governed by MPLP Protocol Governance Committee. Licensed under Apache 2.0.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['typescript', 'python', 'json', 'bash', 'yaml'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
