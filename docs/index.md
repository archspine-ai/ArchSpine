---
layout: home
hero:
  name: ArchSpine
  text: A control plane for AI-assisted engineering
  tagline: Give your AI agents architectural understanding before they write a single line
  actions:
    - theme: brand
      text: Get Started
      link: /tutorials/quick-start
    - theme: alt
      text: Try it now
      link: /tutorials/quick-start#try-archspine
features:
  - icon: 🤖
    title: For AI Agents
    details: |
      21 MCP tools expose the semantic index and knowledge graph directly in your agent's context. The **agent briefing** gives every new session a head start with architecture summaries, module topology, and key constraints. A dedicated **skill** lets agents self-discover the codebase structure before making changes.
  - icon: 👥
    title: For Teams
    details: |
      Define **architecture rules** that gate every PR. CI runs `spine check` to enforce dependency constraints, detect cycles, and surface drift between code and documented intent. **Health reports** track complexity trends, hub risks, and orphaned modules over time.
  - icon: 🏗️
    title: For Maintainers
    details: |
      A full **knowledge graph** built from file-level dependencies aggregated into module-level topology. Query anything: inbound/outbound edges, **cycle detection**, hub risk scoring, and semantic similarity matching. See change impact before you merge.
---

## What ArchSpine Is Not

ArchSpine is **not** a code wiki, a code generator, a SaaS platform, or a proprietary model. It does not sync in real time, and it requires a git repository.

## How It Works

ArchSpine builds a `.spine/` control plane inside your repository — a structured, queryable, version-controlled layer of architectural understanding. The pipeline scans your code, extracts the AST, generates a **semantic index** via LLM summarization, and produces **views** like architecture diagrams, health reports, and the agent briefing.

Agents consume `.spine/` through MCP tools instead of grepping source code. Developers consume it through CLI views and CI checks. Everyone sees the same architectural truth, committed to git.

## Zero Infrastructure, Git-Native, Open Source

- **No servers, no databases, no accounts.** Everything runs locally and the control plane lives as files in your repository.
- **Any LLM provider** — OpenAI, DeepSeek, OpenRouter, Groq, Gemini, Ollama, LM Studio, or your own.
- **You own your data.** API keys stay in your platform keychain. The MCP server runs as a local STDIO subprocess.
- **Apache 2.0 licensed.** Free to use, modify, and distribute.
