<!-- spine-content-hash:09fd95cf959caf347b149d76693e9c4afd2bd8ad9869a71f297079f100852392 -->
# ArchSpine ASTExtractor Verification Script

## Purpose
This document is an automated test script that verifies the ASTExtractor component can correctly extract exported symbols from source code written in six different programming languages. It ensures the extractor handles inheritance, interfaces, generics, bounds, and other language-specific constructs accurately.

## Context and Audience
Intended for developers maintaining or extending the ArchSpine AST extraction pipeline. The test serves as a regression suite to confirm that changes to the extractor do not break multi-language support.

## Key Responsibilities
- Tests ASTExtractor against Java, C++, Rust, C, Python, and Go fixtures
- Validates correct extraction of classes, interfaces, functions, structs, traits, and generics
- Checks for missing or extra exports against expected lists
- Reports per-language pass/fail status and detailed export signatures

## Out of Scope
- Does not test ASTExtractor error handling or edge cases beyond basic fixtures
- Does not cover non-exported symbols or internal implementation details
- Does not include performance or memory profiling

## Key Takeaways
- Covers Java, C++, Rust, C, Python, and Go with representative fixtures
- Validates exports including classes, functions, interfaces, structs, traits, and generics
- Reports missing or extra exports per language for quick debugging
- Exits with non-zero code on any failure for CI integration