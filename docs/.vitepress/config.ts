import { defineConfig } from 'vitepress';

export default defineConfig({
  lang: 'en-US',
  title: 'ArchSpine',
  description: 'Deterministic context and architecture guardrails for AI coding agents.',
  cleanUrls: true,
  srcExclude: ['README.md', '.obsidian/**'],
  themeConfig: {
    logo: '/social-preview.svg',
    nav: [
      { text: 'Home', link: 'index' },
      { text: 'Quick Start', link: 'quick-start' },
      { text: 'MCP', link: 'integrations/mcp' },
      { text: 'Examples', link: 'examples/demo' },
      { text: '中文文档', link: 'zh-CN/' },
      { text: 'GitHub', link: 'https://github.com/iZoy/archSpine' },
    ],
    sidebar: [
      {
        text: 'English Docs',
        items: [
          { text: 'Home', link: 'index' },
          { text: 'Quick Start', link: 'quick-start' },
          { text: 'Current Capabilities', link: 'guides/CURRENT-CAPABILITIES' },
          { text: 'Runbook', link: 'guides/RUNBOOK' },
          { text: 'View Layer', link: 'guides/VIEW-LAYER' },
          { text: 'God Mode', link: 'guides/GOD-MODE' },
          { text: 'Local LLM', link: 'guides/LOCAL-LLM' },
          { text: 'MCP Integration', link: 'integrations/mcp' },
          { text: 'Official Demo', link: 'examples/demo' },
          { text: 'Showcase', link: 'showcase' },
        ],
      },
      {
        text: 'Chinese Docs',
        items: [
          { text: '中文文档入口', link: 'zh-CN/' },
          { text: '中文快速开始', link: 'zh-CN/quick-start' },
          { text: '中文当前能力', link: 'zh-CN/guides/CURRENT-CAPABILITIES' },
          { text: '中文 View Layer 指南', link: 'zh-CN/guides/VIEW-LAYER' },
          { text: '中文 God Mode 指南', link: 'zh-CN/guides/GOD-MODE' },
          { text: '中文 Demo', link: 'zh-CN/examples/demo' },
          { text: '中文 MCP 指南', link: 'zh-CN/integrations/mcp' },
          { text: '中文 Runbook', link: 'zh-CN/guides/RUNBOOK' },
          { text: '中文本地 LLM', link: 'zh-CN/guides/LOCAL-LLM' },
          { text: '中文 Specs', link: 'zh-CN/specs/' },
        ],
      },
      {
        text: 'Public Specs',
        items: [
          { text: 'Protocol', link: 'specs/PROTOCOL' },
          { text: 'Ignore Policy', link: 'specs/IGNORE-POLICY' },
          { text: 'LLM Benchmarks', link: 'specs/LLM-BENCHMARKS' },
          { text: '中文 Specs', link: 'zh-CN/specs/' },
        ],
      },
    ],
    socialLinks: [{ icon: 'github', link: 'https://github.com/iZoy/archSpine' }],
    search: {
      provider: 'local',
    },
    footer: {
      message: 'English is the primary docs tree; zh-CN mirrors shipped behavior.',
      copyright: 'Released under Apache License 2.0',
    },
  },
});
