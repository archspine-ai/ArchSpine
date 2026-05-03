# ArchSpine ASTExtractor End-to-End Verification Test

## Purpose
This document is the definitive end-to-end test script for the ASTExtractor component of the ArchSpine mirror system. It verifies that the extractor correctly identifies exported symbols from source code written in Java, C++, Rust, C, Python, and Go. The test validates language-specific constructs including inheritance, interfaces, generics, bounds, structs, traits, async functions, modules, and export lists. It exists to guarantee that any changes to the extraction logic do not break the detection of public API surfaces across the supported languages.

## Audience
This document is written for developers who maintain or extend the ArchSpine mirror system. Specifically, it targets:
- Contributors working on the static analysis layer
- Language support engineers adding or updating extraction rules for new or existing languages
- Quality assurance engineers responsible for multi-language extraction correctness

## Decisions and Workflows Anchored
- **Pass/fail criteria**: A language fixture passes only if the extracted export names exactly match the expected exports (as listed in `expectedExports`). Any missing or extra symbols cause a failure, ensuring precise alignment between extraction and intended exported surface.
- **Diagnostic output**: On failure, the test prints both the `missing` and `extra` symbol lists, along with full extracted and expected export details. This allows rapid debugging of changes that alter the extraction behavior.
- **Workflow trigger**: This test is intended to run as part of a continuous integration pipeline. A failing test blocks deployment and signals that the ASTExtractor no longer produces the correct export set for at least one language.
- **Coverage boundaries**: The test explicitly excludes non-exported symbols, template instantiations, and runtime semantics, reinforcing the scope of the ASTExtractor’s responsibility.