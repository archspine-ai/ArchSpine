<!-- spine-content-hash:f83341f245071223bf897a5e3c45b96e0947b425f9d2a428c2e9320a8cd50358 -->
# ArchSpine C/C++ Extraction Grammar

## Purpose
This document defines the extraction grammar used by ArchSpine to parse C/C++ source files and identify structural elements such as includes, functions, classes, structs, namespaces, and usage patterns. It serves as the bridge between raw source code and the mirror system's semantic model.

## Context and Audience
Intended for developers and AI agents who need to understand how ArchSpine maps C/C++ code constructs into its internal representation. This is essential for maintaining the accuracy of the code mirror and for extending the system to support additional patterns or languages.

## Key Responsibilities
- Specifying import patterns for include directives
- Defining export patterns for functions, classes, structs, namespaces, and template classes
- Defining usage patterns for function calls, scoped references, and method invocations
- Mapping source code constructs to ArchSpine entity kinds (Function, Class, Type)

## Out of Scope
- Language-specific semantics beyond C/C++
- Runtime behavior or execution logic
- Build system configuration or compilation rules
- Documentation generation or rendering

## Key Takeaways
- The document specifies both export patterns (what to extract) and usage patterns (how elements are referenced).
- Each pattern uses a rule-based syntax to match specific AST nodes (e.g., `function_definition`, `class_specifier`).
- Exports are categorized into kinds: Function, Class, and Type, which map to ArchSpine's entity model.
- Usage patterns cover three common reference styles: direct calls, scoped access (`::`), and method calls (`.`).
- The import pattern handles `#include` directives, which are critical for dependency tracking.