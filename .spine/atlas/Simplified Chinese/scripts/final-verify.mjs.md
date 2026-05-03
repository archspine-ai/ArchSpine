# File: scripts/final-verify.mjs

## 角色
Multi-language AST extractor verification script

## 职责
- End-to-end validation of ASTExtractor against Java, C++, Rust, C, Python, and Go code snippets
- Ensures that exported symbols (classes, functions, interfaces, traits, structs, etc.) are correctly identified
- Acts as a regression test suite for the extractor's multi-language support
- Provides a clear pass/fail report for each language fixture

## 负面范围
- Does not test extraction of imports, dependencies, or internal symbols
- Does not validate type resolution, generics bounds, or inheritance semantics beyond name extraction
- Does not cover languages beyond the six fixtures included
- Does not test error handling or malformed code

本地兜底版本，确保文档输出完整。