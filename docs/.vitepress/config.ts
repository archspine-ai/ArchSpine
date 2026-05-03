import { defineConfig } from 'vitepress';

export default defineConfig({
  lang: 'en-US',
  title: 'ArchSpine',
  description: 'Deterministic context and architecture guardrails for AI coding agents.',
  cleanUrls: true,
  srcExclude: ['README.md', '.obsidian/**'],
  themeConfig: {
    nav: [
      { text: 'Home', link: 'index' },
      { text: 'Tutorials', link: 'tutorials/quick-start' },
      { text: 'How-to', link: 'how-to/RUNBOOK' },
      { text: 'Reference', link: 'reference/PROTOCOL' },
      { text: 'Explanation', link: 'explanation/ARCHITECTURE-OVERVIEW' },
      { text: '中文文档', link: 'zh-CN/' },
      { text: 'GitHub', link: 'https://github.com/iZoy/archSpine' },
    ],
    sidebar: [
      {
        text: 'Tutorials',
        items: [
          { text: 'Quick Start', link: 'tutorials/quick-start' },
          { text: 'Official Demo', link: 'tutorials/DEMO' },
          { text: 'Showcase', link: 'tutorials/showcase' },
        ],
      },
      {
        text: 'How-to Guides',
        items: [
          { text: 'Runbook', link: 'how-to/RUNBOOK' },
          { text: 'MCP Integration', link: 'how-to/MCP' },
          { text: 'Local LLM', link: 'how-to/LOCAL-LLM' },
          { text: 'FAQ', link: 'how-to/FAQ' },
        ],
      },
      {
        text: 'Reference',
        items: [
          { text: 'Overview', link: 'reference/' },
          { text: 'Current Capabilities', link: 'reference/CURRENT-CAPABILITIES' },
          { text: 'Protocol', link: 'reference/PROTOCOL' },
          { text: 'Ignore Policy', link: 'reference/IGNORE-POLICY' },
          { text: 'LLM Benchmarks', link: 'reference/LLM-BENCHMARKS' },
        ],
      },
      {
        text: 'Explanation',
        items: [
          { text: 'Architecture Overview', link: 'explanation/ARCHITECTURE-OVERVIEW' },
          { text: 'View Layer', link: 'explanation/VIEW-LAYER' },
          { text: 'Cost & Usage', link: 'explanation/COST-USAGE' },
          { text: 'God Mode', link: 'explanation/GOD-MODE' },
          { text: 'Powered by', link: 'explanation/POWERED-BY' },
        ],
      },
      {
        text: '中文文档 (Chinese Docs)',
        items: [
          { text: '中文首页', link: 'zh-CN/' },
          {
            text: '教程 (Tutorials)',
            items: [
              { text: '中文快速开始', link: 'zh-CN/tutorials/quick-start' },
              { text: '中文 Demo', link: 'zh-CN/tutorials/DEMO' },
              { text: '中文 Showcase', link: 'zh-CN/tutorials/showcase' },
            ],
          },
          {
            text: '操作指南 (How-to Guides)',
            items: [
              { text: '中文 Runbook', link: 'zh-CN/how-to/RUNBOOK' },
              { text: '中文 MCP 指南', link: 'zh-CN/how-to/MCP' },
              { text: '中文本地 LLM', link: 'zh-CN/how-to/LOCAL-LLM' },
              { text: '中文 FAQ', link: 'zh-CN/how-to/FAQ' },
            ],
          },
          {
            text: '参考规范 (Reference)',
            items: [
              { text: '中文当前能力', link: 'zh-CN/reference/CURRENT-CAPABILITIES' },
              { text: '中文协议 (Protocol)', link: 'zh-CN/reference/PROTOCOL' },
              { text: '中文忽略策略', link: 'zh-CN/reference/IGNORE-POLICY' },
              { text: '中文 LLM 评测', link: 'zh-CN/reference/LLM-BENCHMARKS' },
            ],
          },
          {
            text: '深度解析 (Explanation)',
            items: [
              { text: '中文架构总览', link: 'zh-CN/explanation/ARCHITECTURE-OVERVIEW' },
              { text: '中文 View Layer 指南', link: 'zh-CN/explanation/VIEW-LAYER' },
              { text: '中文成本指南', link: 'zh-CN/explanation/COST-USAGE' },
              { text: '中文 God Mode 指南', link: 'zh-CN/explanation/GOD-MODE' },
              { text: '中文 Powered by', link: 'zh-CN/explanation/POWERED-BY' },
            ],
          },
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
