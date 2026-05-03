## ArchSpine AST Module Overview

The `src/ast` directory is the core module responsible for AST-based code extraction, language discovery, and language configuration within the ArchSpine mirror system. It provides the foundational layer for parsing source code into structured symbols, identifying programming languages from file extensions, and managing language-specific extraction rules.

### Key Submodules and Groupings

- **`extractor.ts`** – The primary AST parsing service. It loads language-specific rules (YAML files from the `rules/` subdirectory), resolves the correct language grammar via the language registry, and uses `ast-grep` to parse source code. It extracts exported symbols (classes, functions, variables, interfaces, types) along with their signatures, and also gathers import statements. The result is a `FileSkeleton` object containing all extracted metadata.

- **`lang-discovery.ts`** – The language discovery and lifecycle module. It scans collections of file paths to identify extensions, resolves them to programming languages using `LangRegistry`, computes delta snapshots (current vs. previous language sets), and validates that detected extensions are supported. Exposed functions include `resolveLanguage` for single-file resolution and delta computation for tracking added/removed/changed languages.

- **`lang-registry.ts`** – A stateful registry and dynamic loader for language configurations. It manages a mapping from AST-grep language keys to the internal `SourceLanguage` type, supports dynamic registration with deduplication and promise caching, resolves file paths to configurations via extension matching, and tracks unavailable packages and user notifications. It also provides `getSourceExtensions` to list all registered source extensions for a given language.

- **`rules/` (subdirectory)** – Contains language-specific AST extraction rule definitions as YAML files. These rules define how to recognize imports, exports, and usages for each supported programming language, enabling code analysis and dependency tracking. This subdirectory is a collection of per-language rule sets that `extractor.ts` loads at runtime.

### Implementation Areas That Matter Most

- **Language rule loading and caching** – Efficiency in loading YAML rules from disk and caching them per language is critical for performance.
- **Grammar resolution and dynamic registration** – Correct mapping of file extensions to AST-grep grammars, including handling of unavailable packages with user-friendly notifications.
- **Delta computation for language snapshots** – Used to track changes in the codebase over time, important for incremental analysis.
- **Symbol extraction precision** – The quality of extracted exports, imports, and signatures determines the accuracy of downstream dependency graphs and architecture models.

Together, these components form the bridge between raw source files and the structured representation needed for architectural mirroring and analysis.