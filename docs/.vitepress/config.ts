import { defineConfig } from 'vitepress';

export default defineConfig({
  lang: 'en-US',
  title: 'ArchSpine',
  description:
    'A control plane for AI-assisted engineering — give your AI agents architectural understanding before they write a single line.',
  cleanUrls: true,
  ignoreDeadLinks: true,
  srcExclude: ['README.md', '.obsidian/**'],
  themeConfig: {
    nav: [
      { text: 'Home', link: '/index' },
      { text: 'Tutorials', link: '/tutorials/' },
      { text: 'How-To', link: '/how-to/' },
      { text: 'Reference', link: '/reference/' },
      { text: 'Explanation', link: '/explanation/' },
      { text: '中文文档', link: '/zh-CN/' },
      { text: 'GitHub', link: 'https://github.com/archspine-ai/ArchSpine' },
    ],
    sidebar: [
      {
        text: 'Tutorials',
        items: [
          { text: 'Overview', link: '/tutorials/' },
          { text: 'Quick Start', link: '/tutorials/quick-start' },
          { text: 'Writing Your First Rules', link: '/tutorials/first-rules' },
        ],
      },
      {
        text: 'How-To Guides',
        items: [
          { text: 'Overview', link: '/how-to/' },
          { text: 'Connect MCP to Your Agent', link: '/how-to/mcp-connect' },
          { text: 'Set Up CI Integration', link: '/how-to/ci-integration' },
          { text: 'Write Architecture Rules', link: '/how-to/write-rules' },
          { text: 'Use a Local LLM', link: '/how-to/local-llm' },
          { text: 'Set Up a Monorepo', link: '/how-to/monorepo' },
          { text: 'Build a Custom View', link: '/how-to/custom-view' },
          { text: 'Run a Quick Scan', link: '/how-to/quick-scan' },
          { text: 'Use Semantic Diff', link: '/how-to/semantic-diff' },
          { text: 'MCP Workflow Patterns', link: '/how-to/mcp-workflow' },
        ],
      },
      {
        text: 'Reference',
        items: [
          { text: 'Overview', link: '/reference/' },
          { text: 'CLI Commands', link: '/reference/cli' },
          { text: 'MCP Tools', link: '/reference/mcp-tools' },
          { text: 'Configuration', link: '/reference/config' },
          { text: 'Architecture Rules', link: '/reference/rules' },
          { text: 'View Producers', link: '/reference/view-producers' },
          { text: 'Knowledge Graph', link: '/reference/knowledge-graph' },
          { text: 'Diagnostics', link: '/reference/diagnostics' },
          { text: 'Protocol (.spine/)', link: '/reference/protocol' },
        ],
      },
      {
        text: 'Explanation',
        items: [
          { text: 'Overview', link: '/explanation/' },
          { text: 'What Is ArchSpine?', link: '/explanation/what-is-archspine' },
          { text: 'Control Plane', link: '/explanation/control-plane' },
          { text: 'Sync Pipeline', link: '/explanation/pipeline' },
          { text: 'Quick Scan vs Full Scan', link: '/explanation/quick-vs-full-scan' },
          { text: 'Knowledge Graph', link: '/explanation/knowledge-graph' },
          { text: 'Git-Native Distribution', link: '/explanation/git-native' },
          { text: 'No SaaS', link: '/explanation/no-saas' },
        ],
      },
      {
        text: '中文文档 (Chinese Docs)',
        collapsed: true,
        items: [
          { text: '中文首页', link: '/zh-CN/' },
          { text: '快速开始', link: '/zh-CN/tutorials/quick-start' },
          { text: 'MCP 连接指南', link: '/zh-CN/how-to/mcp-connect' },
          { text: 'CLI 命令参考', link: '/zh-CN/reference/cli' },
          { text: 'MCP 工具参考', link: '/zh-CN/reference/mcp-tools' },
        ],
      },
    ],
    socialLinks: [{ icon: 'github', link: 'https://github.com/archspine-ai/ArchSpine' }],
    search: {
      provider: 'local',
    },
    footer: {
      message: 'English is the primary docs tree; zh-CN mirrors shipped behavior.',
      copyright: 'Released under Apache License 2.0',
    },
  },
});
