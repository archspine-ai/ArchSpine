The `src/ast/` directory implements the core AST parsing and language discovery infrastructure for ArchSpine. It is responsible for parsing source code into abstract syntax trees, extracting structural symbols and imports, discovering and resolving programming languages from file extensions, and managing language configurations and rule sets.

The module is organized into four key components:

- **`extractor.ts`**: The AST extraction engine that loads language-specific YAML rule sets, resolves the appropriate grammar via `LangRegistry`, parses code with `ast-grep`, and produces `FileSkeleton` objects containing exported symbols, imports, and structural metadata.
- **`lang-discovery.ts`**: The language discovery and lifecycle manager that scans file collections, resolves extensions to languages, computes deltas between snapshots (tracking added, removed, and changed languages), and validates support for detected languages.
- **`lang-registry.ts`**: A stateful registry that maps AST-grep language keys to ArchSpine's `SourceLanguage` type, supports dynamic registration with deduplication, resolves file paths to language configurations by extension, and manages unavailable package tracking and user notifications.
- **`src/ast/rules/`**: A directory containing language-specific YAML configuration files that define pattern-based extraction rules for imports, exports, and usages, enabling the system to analyze code across multiple languages.

The most critical implementation areas are the rule-driven extraction pipeline in `extractor.ts` and the dynamic language registration and resolution in `lang-registry.ts`, as they directly enable multi-language code analysis and support for new languages without core changes.