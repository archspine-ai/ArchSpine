# ArchSpine Symbol Extraction Rules Specification

## Purpose
This document defines the core extraction rules that drive the ArchSpine mirror system. It specifies how the system imports, exports, and identifies usages of C++ source code symbols. By providing a declarative pattern language, it enables the mirror to produce accurate API documentation and code mappings without executing or analyzing runtime behavior.

## Audience
This specification is intended for **developers and integrators** working on the ArchSpine mirror system. Readers who need to:
- Configure which symbols are extracted from a C++ codebase.
- Define how `#include` directives are matched for import.
- Set export patterns for functions, classes, structs, namespaces, and template classes.
- Establish usage patterns that detect function calls, scoped accesses, and method calls.

## How This Document Anchors Decisions and Workflows
- **Import Logic**: The `include` pattern (`#include $SOURCE`) defines the single entry point for header inclusion. All further extraction depends on correctly matching these directives.
- **Export Definitions**: Five distinct export rule categories (function, class, struct, namespace, template_class) determine which C++ constructs become symbolic entities in the mirror. Each rule uses a tree–sitter–based rule pattern with placeholders (`$NAME`, `$ARGS`) to extract names and signatures.
- **Usage Detection**: Three usage patterns (call, scoped, method) enable the mirror to record how extracted symbols are used across the codebase. This is essential for dependency analysis and cross–reference generation.
- **Scope & Boundaries**: The specification explicitly excludes runtime semantics, build system configuration, and non–C++ languages. Any workflow relying on execution behavior or build dependencies must look elsewhere.

## Key Takeaways
- Rules are defined for functions, classes, structs, namespaces, and template classes.
- Usage patterns cover function calls, scoped member access (`::`), and method calls (`.`).
- The import pattern matches `#include` directives to bring in header files.
- All patterns follow a consistent tree–sitter grammar, ensuring deterministic extraction.