# ArchSpine Pattern Definitions: Structural Code Analysis Grammar

## Purpose
This document specifies the pattern syntax used by the ArchSpine mirror system to identify structural code elements. It defines three categories of patterns—imports, exports, and usages—that together form a configuration grammar for the tool's reflection engine. The patterns enable automated code analysis, architecture validation, and mirror construction without relying on runtime execution.

## Audience
This document is intended for developers and architects integrating or extending ArchSpine. Readers should be familiar with the system's mirroring and reflection concepts. Implementation details of the pattern matching engine, runtime semantics, and language-specific syntax beyond Java-like patterns are out of scope.

## Why This Document Exists
ArchSpine’s mirror system needs a declarative way to recognize structural code patterns. The definitions anchor the following workflows:
- Configuration of the reflection engine for scanning source code.
- Consistent identification of imports, class/interface declarations, and method calls or instantiations.
- Extensibility: new patterns can be added following the established grammar.

## Pattern Categories

### Imports
- **id**: `import`
- **pattern**: `import $SOURCE;`  
  Matches import statements.

### Exports
Patterns for class and interface declarations, with optional visibility modifiers.
- **id**: `class`, pattern: `class $NAME $$$ { $$$BODY }` (default visibility)
- **id**: `public_class`, pattern: `public class $NAME $$$ { $$$BODY }`
- **id**: `interface`, pattern: `interface $NAME $$$ { $$$BODY }`
- **id**: `public_interface`, pattern: `public interface $NAME $$$ { $$$BODY }`

### Usages
Patterns for method calls and object instantiation.
- **id**: `call`, pattern: `$OBJ.$NAME($$$ARGS)` — method invocation.
- **id**: `new`, pattern: `new $NAME($$$ARGS)` — constructor instantiation.

## Key Takeaways
- The grammar covers three domains: imports, exports (classes/interfaces), and usages (calls/instantiations).
- Export patterns distinguish between public and default visibility, and between class and interface kinds.
- Each pattern definition includes a unique `id` and a `pattern` string with placeholders (`$SOURCE`, `$NAME`, `$$$BODY`, `$$$ARGS`, etc.).
- These patterns are the foundation for ArchSpine’s static code analysis and architecture enforcement.