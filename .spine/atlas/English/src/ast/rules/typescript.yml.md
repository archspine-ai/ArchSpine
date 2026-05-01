<!-- spine-content-hash:910d8cc916f11a4bce4f9b92c7255ad544c34413509f9ba8ada6987c14a928fd -->
# ArchSpine – Pattern Extraction Rules

## Purpose
This document defines a set of pattern-based extraction rules used to parse TypeScript/JavaScript source code. It maps import, export, and usage patterns to structured symbol metadata for analysis and tooling.

## Context & Audience
Intended for developers and AI agents building or maintaining static analysis, code indexing, or refactoring tools that need to extract symbol-level information from source files without executing them.

## Key Responsibilities
- Specify import pattern templates: named, default, and namespace imports.
- Specify export pattern templates: function, class, interface, type, const, let, var, default, and list exports.
- Specify usage pattern templates: function calls, constructor calls (`new`), and property access.
- Map matched patterns to semantic kinds: `Function`, `Class`, `Interface`, `Type`, `Variable`, `Unknown`.

## Out of Scope
- Runtime behavior or execution logic.
- Build or bundler configuration.
- Testing or validation rules.
- Documentation generation or formatting.

## Key Takeaways
- Imports are matched by three patterns: named, default, and namespace.
- Exports are matched by patterns for functions, classes, interfaces, types, and variables, each assigned a semantic kind.
- Usages are matched by patterns for function calls, constructor calls, and property access.
- The document is purely declarative — it defines rules, not logic.