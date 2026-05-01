<!-- spine-content-hash:29cf9dd98b74605a16434d839299491e1beeb495dd1db768c63a4a66cd715956 -->
# ASTExtractor

**Role:** AST parsing service that extracts structural symbols and imports from source code using language-specific rule sets loaded from YAML configuration files.

## Key Responsibilities

- Loads and caches language-specific AST extraction rules from YAML configuration files located in a rules directory.
- Resolves the appropriate language grammar for a given file path using LangRegistry.
- Parses source code content using ast-grep with the resolved language grammar.
- Extracts exported symbols (classes, functions, variables, interfaces, types) and their signatures from the AST.
- Extracts import statements and their symbols from the AST.
- Constructs a FileSkeleton object containing the extracted symbols, imports, and structural metadata.

## Notable Invariants

- Each language must have a corresponding YAML rule file in the rules directory.
- The LangRegistry must be initialized before ASTExtractor can resolve languages.
- AST extraction rules must follow the expected RuleSet schema.

## Negative Scope (Out of Scope)

- Does not perform semantic analysis or type checking of the extracted symbols.
- Does not handle non-source code files (e.g., binary, images).
- Does not manage the lifecycle or persistence of extracted skeletons.

## Public Surface

- `ASTExtractor` class
- `ExtractedSymbol` interface
- `ExtractedImport` interface
- `FileSkeleton` interface

## Architectural Intent

Provide a reusable, language-agnostic AST extraction layer for the ArchSpine mirror system to enable structural analysis of source code.

## Recent Changes

Fix lint warnings and type errors, and add CI workflow for code quality assurance.