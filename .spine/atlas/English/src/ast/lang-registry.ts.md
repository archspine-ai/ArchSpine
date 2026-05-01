<!-- spine-content-hash:f9f344f04a61dfd6bf73b396473ed3f18321063f2928eacb2f3fae84d4855efc -->
# ArchSpine Language Registry (`LangRegistry`)

## Role
Stateful language configuration registry and dynamic language loader for the ArchSpine code analysis pipeline, managing AST-grep language bindings and file-to-language resolution.

## Key Responsibilities
- Manages a registry of language configurations (`LangConfig`) mapping AST-grep language keys to ArchSpine's internal `SourceLanguage` type.
- Provides dynamic language registration via `registerDynamicLanguage`, with deduplication and promise-based caching to avoid redundant registrations.
- Resolves file paths to language configurations using file extension matching, with support for unavailable package tracking and user notification.
- Exposes `getSourceExtensions` to retrieve all registered source file extensions for a given language.
- Maintains internal state for dynamic registration status, unavailable packages, and announced warnings to prevent duplicate notifications.

## Notable Invariants & Negative Scope
- **Invariants:**
  - Dynamic languages are registered at most once per process lifecycle.
  - Each file extension maps to exactly one language configuration.
  - Unavailable packages are tracked and only announced once to the user.
- **Out of Scope:**
  - Direct AST-grep query execution or pattern matching.
  - File system traversal or project scanning.
  - Configuration file parsing or validation beyond language mapping.

## Public Surface
- `LangRegistry` class
- `LangConfig` interface
- `InternalLangConfig` type

## Most Important Exported Behavior
The `LangRegistry` class is the central entry point for all language-related operations in the ArchSpine pipeline. It provides a stateful, caching-aware mechanism to register, resolve, and query language configurations, ensuring that dynamic languages are loaded efficiently and without duplication. The class also handles graceful degradation when language packages are unavailable, notifying users only once per missing package.