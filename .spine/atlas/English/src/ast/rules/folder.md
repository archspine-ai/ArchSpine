<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"src/ast/rules","role":"Language-specific grammar definitions for parsing source code into structured symbols.","responsibility":"Provides pattern-based extraction rules for imports, exports, and usages across multiple programming languages (C, C++, Go, Java, Python, Rust, TypeScript/JavaScript), enabling the ArchSpine mirror system to analyze and index code structures uniformly.","children":[{"filePath":"src/ast/rules/c.yml","role":"Defines the structural grammar and pattern-matching rules for parsing C/C++ source code within the ArchSpine mirror system.","fileKind":"document"},{"filePath":"src/ast/rules/cpp.yml","role":"Defines the syntax and rules for extracting structural metadata from C/C++ source code within the ArchSpine mirror system.","fileKind":"document"},{"filePath":"src/ast/rules/go.yml","role":"Define the syntax patterns for parsing Go source code into a structured symbol index","fileKind":"document"},{"filePath":"src/ast/rules/java.yml","role":"Defines the syntax patterns for parsing Java-like source code within the ArchSpine mirror system.","fileKind":"document"},{"filePath":"src/ast/rules/python.yml","role":"Defines the pattern-based extraction rules for parsing Python source code symbols (imports, exports, and usages) within the ArchSpine mirror system.","fileKind":"document"},{"filePath":"src/ast/rules/rust.yml","role":"Defines the syntax and pattern-matching rules for extracting code structures from Rust source files within the ArchSpine mirror system.","fileKind":"document"},{"filePath":"src/ast/rules/typescript.yml","role":"Defines the pattern-based extraction rules for parsing TypeScript/JavaScript source code into structured symbols (imports, exports, usages).","fileKind":"document"}],"provenance":{"indexedAt":"2026-05-01T03:58:48.079Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# `src/ast/rules` — Language Grammar Definitions

This directory contains the language-specific grammar and pattern-matching rules that drive ArchSpine's AST-based code analysis. Each YAML file defines how a particular programming language's source code is parsed into structured symbols — imports, exports, and usages — enabling the mirror system to index and analyze code uniformly across languages.

## Notable Children

The directory is organized by language, with one YAML file per supported language:

- **`c.yml`** — Structural grammar for C/C++ source code parsing.
- **`cpp.yml`** — Syntax rules for extracting structural metadata from C/C++.
- **`go.yml`** — Syntax patterns for parsing Go into a structured symbol index.
- **`java.yml`** — Patterns for parsing Java-like source code.
- **`python.yml`** — Extraction rules for Python symbols (imports, exports, usages).
- **`rust.yml`** — Syntax and pattern-matching for Rust code structures.
- **`typescript.yml`** — Patterns for TypeScript/JavaScript imports, exports, and usages.

## Implementation Areas

The most critical implementation areas are:

- **Cross-language uniformity** — Ensuring that all language grammars produce a consistent symbol model (imports, exports, usages) so the mirror system can treat code from any language identically.
- **Pattern accuracy** — Each YAML file must correctly capture the idiomatic constructs of its language (e.g., `use` statements in Rust, `import` in Python, `require` in JavaScript).
- **Extensibility** — The rule system is designed to be easily extended with new languages by adding a new YAML file following the established pattern.