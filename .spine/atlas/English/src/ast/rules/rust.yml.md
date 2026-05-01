<!-- spine-content-hash:5ace25732f8c327e49304b0edf02a758966a63d37e9f1224b5cffea5d083962b -->
# ArchSpine Rust Pattern Definition

## Purpose
This document defines the pattern-matching rules that ArchSpine uses to introspect Rust source code. It specifies how imports, exports (functions, structs, traits, impl blocks, variables), and usages (calls, paths) are recognized and extracted from the codebase.

## Context and Audience
This document is intended for developers and AI agents who need to understand or modify how ArchSpine analyzes Rust code. It is the core configuration for the code reflection engine, defining the grammar of what ArchSpine can "see" in a Rust project.

## Key Responsibilities
- Specifying import patterns for source file inclusion
- Defining export patterns for Rust constructs (functions, structs, traits, impl blocks, variables)
- Defining usage patterns for function calls and path references
- Serving as the configuration schema for code analysis and reflection

## Out of Scope
- Actual code execution or compilation logic
- Language-agnostic or multi-language pattern definitions
- User interface or documentation generation

## Key Takeaways
- ArchSpine uses tree-sitter-like pattern rules to identify code structures.
- Exports are categorized by Rust construct type (Function, Class, Interface, Type, Variable).
- Usages track how exported items are referenced (calls and paths).
- The document is a configuration file, not a narrative guide.