# Document Summary: Go AST Extraction Rules for ArchSpine

## Purpose

This document defines the Go language pattern definitions used by the ArchSpine AST extractor to identify imports, exports, and usages in Go source code. It is part of a multi-language rule set that enables the mirror system to build structural awareness of projects.

## Audience

This file is intended for developers maintaining the ArchSpine AST engine and contributors adding or updating language extraction rules. It should be reviewed whenever new Go syntax or idioms need to be supported.

## Key Decisions & Workflows Anchored

- **Import Detection**: Single imports (`import $SOURCE`) and grouped imports (using parentheses) are captured via two distinct patterns (`import` and `import_group`).
- **Export Extraction**: Exports are extracted from:
  - Functions (`func $NAME...`)
  - Structs (`type $NAME struct...`) – mapped to kind `Class`
  - Interfaces (`type $NAME interface...`) – kind `Interface`
  - Type aliases (`type $NAME = $VAL`) – kind `Type`
  - Variables (`var $NAME = $VAL`) – kind `Variable`
  - Constants (`const $NAME = $VAL`) – kind `Variable`
- **Usage Capture**: Two patterns cover call expressions (`$NAME(...)`) and selector expressions (`$OBJ.$NAME`), enabling detection of function calls and method/field access.
- **Pattern Syntax**: All rules use a YAML-based template matching syntax with named capture groups (e.g., `$NAME`, `$$$SYMBOLS`), consistent across the multi-language framework.

## Out of Scope

- Other programming languages (TypeScript, Python, Java, etc.)
- Higher-level architecture or naming convention rules
- Runtime behavior or execution semantics
- Code transformation or repair logic