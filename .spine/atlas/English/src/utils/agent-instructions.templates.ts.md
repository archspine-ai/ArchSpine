<!-- spine-content-hash:1c2e89e674a4600c77e598edb5a37268c18e0cefb66ccb2067e0899b77a74a63 -->
# ArchSpine Static Configuration Module

This module centralizes static configuration strings for agent instructions and repository file management, ensuring consistency and ease of updates across the ArchSpine system.

## Role

Static configuration module providing agent instruction blocks and repository ignore patterns for the ArchSpine system.

## Key Responsibilities

- Defines the start and end markers for ArchSpine agent instruction blocks in documentation.
- Provides the full ArchSpine agent instruction block content for insertion into AI agent prompts.
- Defines paths and content for search ignore patterns to exclude generated ArchSpine outputs.
- Defines recommended lines for `.spineignore`, `.gitignore`, and `.gitattributes` files to manage repository noise and generated content.

## Notable Invariants

- Exported constants are immutable strings or arrays.
- The `AGENT_BLOCK_START` and `AGENT_BLOCK_END` markers must be present in the `ARCHSPINE_AGENT_BLOCK` content.

## Negative Scope (Out of Scope)

- Dynamic generation or validation of ignore files.
- Parsing or interpreting the content of the instruction blocks.
- Enforcing the usage of these constants in other parts of the system.

## Most Important Exported Behavior

The module exports the following constants that form the public surface:

- **Agent Instruction Markers**: `AGENT_BLOCK_START`, `AGENT_BLOCK_END`, `ARCHSPINE_AGENT_BLOCK`
- **Search Ignore Patterns**: `SEARCH_IGNORE_PATH`, `SPINEIGNORE_PATH`, `SEARCH_IGNORE_LINES`, `SEARCH_IGNORE_CONTENT`
- **Spineignore Configuration**: `SPINEIGNORE_BLOCK_START`, `SPINEIGNORE_BLOCK_END`, `SPINEIGNORE_RECOMMENDED_LINES`
- **Gitignore Configuration**: `GITIGNORE_BLOCK_START`, `GITIGNORE_BLOCK_END`, `LOCAL_GITIGNORE_LINES`, `DISTRIBUTABLE_GITIGNORE_LINES`
- **Gitattributes Configuration**: `GITATTRIBUTES_BLOCK_START`, `GITATTRIBUTES_BLOCK_END`, `DISTRIBUTABLE_GITATTRIBUTES_LINES`

## Change Intent

The architectural intent is to centralize static configuration strings for agent instructions and repository file management to ensure consistency and ease of updates. A recent change updated the `ARCHSPINE_AGENT_BLOCK` to include the `npx --yes archspine@latest try` command for a read-only preview, aligning with the "tighten schema handling and add try preview" commit.