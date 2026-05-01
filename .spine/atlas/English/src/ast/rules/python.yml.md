<!-- spine-content-hash:a42746ecb518eb1bfce2c6a98bb878edff7650b2e13fdaa3ae3234a56cfda574 -->
# ArchSpine Symbol Extraction Patterns

## Purpose
This document provides the formal grammar for how the ArchSpine mirror system recognizes and extracts Python code symbols. It defines the pattern templates used to parse imports, exports, and usages from source files, enabling automated dependency tracking and symbol mapping.

## Context and Audience
Intended for developers and AI agents maintaining the ArchSpine code analysis pipeline. Readers should understand Python syntax and the concept of pattern-based code extraction. This document serves as the configuration schema for the symbol parser component.

## Key Takeaways
- Three core pattern categories: imports, exports, and usages
- Exports cover functions, classes, async functions, variables, and `__all__` lists
- Patterns use `$$$SYMBOLS`, `$NAME`, `$VAL`, `$OBJ`, and `$$$ARGS` as placeholders
- This is a configuration document, not a runtime specification

## Responsibilities
- Specifying import patterns (from-import and simple import) for symbol resolution
- Defining export patterns for functions, classes, async functions, variables, and `__all__` lists
- Describing usage patterns for call expressions and property access

## Out of Scope
- Language-specific syntax beyond Python
- Runtime behavior or execution semantics
- Project-specific business logic or domain rules