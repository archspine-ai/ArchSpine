# No SaaS

## The Philosophy of Zero Infrastructure

ArchSpine runs on your machine, using your LLM API keys, writing to your repository. There is no ArchSpine cloud. No server is provisioned. No account is created. No database stores your code's architecture. Everything ArchSpine needs — the pipeline, the MCP server, the CLI — runs as local processes. The control plane lives as files in your git repository.

## Why No Cloud Service

The decision to avoid any cloud dependency is not ideological — it is practical:

**Data ownership**: Your codebase is your intellectual property. Sending it to a third-party service for architectural analysis — even an "anonymized" one — creates a data exfiltration risk. With ArchSpine, your code never leaves your machine except through your own LLM provider, which you already trust with your prompts.

**Offline operation**: Developers work on planes, in coffee shops with unreliable WiFi, and behind corporate VPNs that block unknown services. ArchSpine works anywhere git works. The only network call is to your LLM provider's API during summarization.

**Zero onboarding friction**: There is no "sign up for ArchSpine" step. `npx archspine try` works immediately. Teams do not need to provision service accounts, manage org memberships, or configure SSO.

**No vendor lock-in**: If ArchSpine ceased to exist tomorrow, your `.spine/` directory would still be in your repository. All the architectural data — the semantic index, the knowledge graph, the views — is yours, in an open format, under your control.

## How API Keys Stay Local

API keys for LLM providers are never stored in the repository, environment files, or ArchSpine configuration. They are stored in your platform's native secure credential store:

- **macOS**: Keychain
- **Linux**: secret-tool (libsecret)
- **Windows**: DPAPI

The credential backend reads keys at runtime and passes them to the LLM client. Nothing is written to disk in plaintext, and nothing is transmitted anywhere except to the LLM provider's API endpoint.

## Provider Interchangeability

ArchSpine's LLM abstraction layer supports any provider that offers a chat completions API: OpenAI, DeepSeek, OpenRouter, Groq, Gemini, Ollama, LM Studio, and custom endpoints. Switch providers by changing one line in `config.json`. The pipeline stages and MCP tools do not care which provider generates the summaries — they consume the same structured output regardless.

This means:

- No lock-in to a specific AI vendor
- Teams can use their existing provider contracts
- Self-hosted or air-gapped environments can use local models via Ollama or LM Studio

## MCP Runs Locally

The MCP server (`spine mcp start`) runs as a local STDIO subprocess. AI agents (Claude Code, Cursor, Copilot) communicate with it over standard input/output — no network socket, no HTTP server, no port to configure. This is the standard MCP transport for desktop agents, and it keeps all architecture queries local to the machine.

## The Open-Source Business Model

ArchSpine is Apache 2.0 licensed. There is no proprietary edition, no enterprise tier, no paid features. The project's sustainability model — to the extent one exists — relies on community contribution and the natural alignment between ArchSpine's goals and the interests of teams building AI-assisted engineering workflows. If that changes, it will be discussed openly in the repository.
