<!-- spine-content-hash:e7a1b864c9d2a40de2af30ed514891c4cad4025f920c4c9fef689bad9fc5d567 -->
# ArchSpine Syntax Patterns

## Purpose
This document establishes the pattern definitions used by ArchSpine to recognize and categorize Java code elements such as imports, classes, interfaces, and method calls. It serves as the grammar layer for structural code analysis.

## Context and Audience
Intended for developers and AI agents configuring or extending ArchSpine's code parsing capabilities. It is relevant for anyone who needs to define how source code constructs are identified and mapped to semantic roles within the mirror system.

## Key Responsibilities
- Specifying import, class, interface, and method call patterns
- Mapping code structures to semantic kinds (Class, Interface)
- Providing the grammar for code usage detection

## Out of Scope
- Language-specific runtime behavior or execution semantics
- Non-Java language support or generic pattern matching

## Key Takeaways
- Patterns are defined for imports, classes (public and default), interfaces (public and default), and method calls.
- Each pattern maps to a semantic kind (e.g., Class, Interface) for structured analysis.
- Usage patterns detect method invocations and object instantiation.