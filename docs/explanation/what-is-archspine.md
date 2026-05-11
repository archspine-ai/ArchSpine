---
outline: deep
---

# What Is ArchSpine?

## The Problem: Blind AI Agents

AI coding assistants write code faster than ever. But they lack architectural context. They cannot see your module boundaries, dependency rules, or design conventions just by reading source files.

This creates invisible technical debt. An agent might import from a forbidden layer, create a circular dependency, or bypass a shared utility without anything stopping it.

Prompt files advise. RAG suggests. Neither enforces.

Traditional tools do not help either. Linters and formatters catch syntax errors and formatting issues, but they miss semantic violations. A missing import is an error. A cross-layer call is just code.

## The Solution: A Physical Control Plane

ArchSpine builds a `.spine/` control plane inside your Git repository — a machine-readable semantic layer that sits next to your source code, describing what exists and what is allowed.

It gives AI agents a structured map of your architecture. Agents no longer face a pile of discrete source files. They operate within an engineering system with clear constraints.

## How It Works

ArchSpine uses three mechanisms to keep your architecture honest:

- **Baseline** — Takes a snapshot of your current architecture. Scans source files, extracts ASTs, and builds a semantic index of modules, responsibilities, and dependencies.
- **Tracking** — Detects architectural drift between snapshots. Changes are tracked at the architecture level, not just as line diffs.
- **Audit** — Checks every change against rules defined in `.spine/rules/`. Violations surface before they reach production.

This runs through a staged pipeline. Each stage persists its progress, so an interrupted sync resumes where it left off instead of starting over.

## MCP Is the Primary Interface

ArchSpine is MCP-native. The CLI is just the installer. The real power lives in the MCP server, which exposes 21 query and action tools, 4 contextual resources, and 2 agent guidance prompts.

Agents consume `.spine/` through these MCP tools instead of grepping source code. This gives them instant architectural awareness before they write a single line.

## What Lives in `.spine/`

The control plane contains a mix of human-edited and generated files:

- **`config.json`** — Your project configuration and LLM provider settings. You edit this.
- **`rules/`** — Architecture rules that gate pull requests. You define these.
- **`index/`** — The semantic index of every file. The pipeline generates this.
- **`view/`** — Derived views: architecture diagrams, health reports, agent briefings. Pure computation.
- **`manifest.json`** — Pipeline metadata and version tracking.

Human-edited files define intent. Generated files reflect reality. Git diff shows exactly when the two diverge.

## What ArchSpine Does Not Do

ArchSpine is not a code wiki. Its index is generated from source, not written by hand, so it stays in sync with reality.

It is not SaaS. Everything runs locally. No servers, no databases, no accounts. You own your data.

It does not sync in real time. The control plane updates on explicit sync commands, and every update is committed to Git.

It is not a linter. It catches semantic violations that linters miss — but it does not replace ESLint, Prettier, or your existing toolchain.

ArchSpine is open source, Apache 2.0 licensed, and requires a Git repository with Node.js 20 or later.
