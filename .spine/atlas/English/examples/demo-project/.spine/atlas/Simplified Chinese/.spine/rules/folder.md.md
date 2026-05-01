<!-- spine-content-hash:050b06e33b3432362a1c833072c039d1257e45fe5f9f0380b25db4dc452293c8 -->
# ArchSpine Rules Directory

## Purpose
This document defines the rules directory within the ArchSpine mirror system, which stores architectural and governance rules that enforce project structure and coding standards.

## Context and Audience
This document is intended for developers and maintainers who need to understand how ArchSpine enforces project rules. It is also relevant for AI agents that need to interpret the rule structure for automated validation.

## Key Responsibilities
- Houses rule documents that enforce architectural constraints and coding standards
- Provides the rule definitions used by ArchSpine to validate project structure and code
- Serves as the source of truth for project-specific governance policies

## Out of Scope
- Actual source code or implementation details
- Project documentation or user guides
- Configuration files for the ArchSpine tool itself

## Key Takeaways
- The `.spine/rules` directory is the central repository for project governance rules
- Rules defined here are used by ArchSpine to validate code and structure
- This directory is part of the mirror system that maintains a synchronized view of project state