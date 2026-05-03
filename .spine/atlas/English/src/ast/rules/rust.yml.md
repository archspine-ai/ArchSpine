# ArchSpine Rust Extraction Rules

## Purpose
This document defines the core rules for extracting structural and usage information from Rust source code using tree‑sitter queries. It is the backbone of ArchSpine’s mirror system, enabling automated parsing of Rust files, identification of key code elements (public functions, structs, traits, implementations, variables), and tracking of cross‑file references and dependencies. By providing a machine‑readable specification of how Rust code is indexed, the rule file anchors maintenance boundaries, dependency maps, and the contextual snapshots delivered to both human reviewers and AI agents.

## Audience
- **Developers extending or fixing ArchSpine’s Rust language support** – they need to understand and modify the extraction patterns.
- **AI agents consuming the indexed structure** – they rely on the consistent semantics (e.g., `Function`, `Class`, `Interface`) produced by these rules.
- **Maintainers of the ArchSpine indexing engine** – they use this file to build a structured representation of any Rust project.

## Key Decisions & Workflows Anchored by This Document
- **Pattern‑based extraction**: The document formalizes exactly which tree‑sitter AST node kinds correspond to which semantic types (`Function` → `function_item`, `Class` → `struct_item`, etc.). Any change to these mappings directly alters how Rust code is reflected in the mirror.
- **Scope limitations**: Extraction explicitly excludes items nested inside `impl` blocks (e.g., methods are not exported as standalone functions) and only targets public‑facing elements that are relevant for dependency tracing.
- **Usage tracking**: Two patterns—`call` and `path`—capture how exported symbols are invoked or referenced across the codebase, enabling dependency and impact analysis.
- **Consistency across projects**: By encoding all rules in a single, version‑controlled file, the system guarantees that all Rust codebases are analyzed with the same criteria, preventing drift between repositories.

## Concrete Patterns (from the Supporting Context)
- **Exports**  
  - `function` (kind `Function`) – extracts top‑level function items with name and parameters.  
  - `struct` (kind `Class`) – matches `struct_item` nodes.  
  - `trait` (kind `Interface`) – matches `trait_item` nodes.  
  - `impl` (kind `Type`) – matches `impl_item`, linking to the type being implemented.  
  - `variable` (kind `Variable`) – extracts `let` bindings with name and initializer.  
- **Usages**  
  - `call` – captures function/method calls: `$NAME($$$ARGS)`.  
  - `path` – captures qualified path references: `$OBJ::$NAME`.  

## Key Takeaways
1. All Rust code analysis flows from these tree‑sitter pattern definitions; they are the single source of truth for the mirror system’s Rust support.  
2. Semantic types are deliberately mapped to familiar OOP concepts (Function, Class, Interface, Type, Variable) to simplify downstream consumption.  
3. Usage patterns complement exports, enabling full provenance tracking from definition to invocation.  
4. The rule file is part of ArchSpine’s broader “spine” framework, which applies the same extraction philosophy to multiple programming languages.