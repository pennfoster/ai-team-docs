import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Engineering Standards',
  description: 'Org-wide code-quality standards across every language we build.',
  cleanUrls: true,
  lastUpdated: true,
  themeConfig: {
    nav: [
      { text: 'Delivery Metrics', link: '/enforcement/delivery-metrics' },
      { text: 'Principles', link: '/principles/01-readiness-for-change' },
      { text: 'Dialects', link: '/dialects/typescript' },
      { text: 'Enforcement', link: '/enforcement/overview' }
    ],
    sidebar: [
      {
        text: 'Principles',
        collapsed: false,
        items: [
          { text: 'Readiness for Change', link: '/principles/01-readiness-for-change' },
          { text: 'Layers', link: '/principles/02-layers' },
          { text: 'Where Does This Go?', link: '/principles/03-where-does-this-go' },
          { text: 'Information Hiding', link: '/principles/04-information-hiding' },
          { text: 'Naming', link: '/principles/05-naming' },
          { text: 'Single Choice', link: '/principles/06-single-choice' }
        ]
      },
      {
        text: 'Dialects',
        collapsed: false,
        items: [
          { text: 'TypeScript', link: '/dialects/typescript' },
          { text: 'C# / .NET', link: '/dialects/csharp' }
        ]
      },
      {
        text: 'Enforcement',
        collapsed: false,
        items: [
          { text: 'Overview', link: '/enforcement/overview' },
          { text: 'TypeScript Tooling', link: '/enforcement/typescript-tooling' },
          { text: 'C# / .NET Tooling', link: '/enforcement/csharp-tooling' },
          { text: 'Adoption', link: '/enforcement/adoption' },
          { text: 'Delivery Metrics', link: '/enforcement/delivery-metrics' }
        ]
      }
    ],
    search: {
      provider: 'local'
    },
    editLink: {
      pattern: 'https://github.com/penn-foster/ai-team-docs/edit/main/docs/:path',
      text: 'Propose a change to this page'
    }
  }
})
