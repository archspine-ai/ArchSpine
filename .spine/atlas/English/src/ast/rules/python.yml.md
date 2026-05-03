# ArchSpine Python AST Extraction Rules

## Purpose

This document defines the syntactic patterns that the ArchSpine scanner uses to extract **imports**, **exports**, and **usage relationships** from Python source files. It is the language‑specific rule set that powers ArchSpine’s ability to build a semantic index of Python projects. Without these rules, the scanner would not know how to recognise the building blocks of Python code – from `import` statements to `def` and `class` definitions.

## Who Should Read This

- **Developers contributing to ArchSpine’s AST extraction module** – this document is the source of truth for how Python is analysed.  
- **Project leads who want to customise or extend Python language support** – the rules are written in a YAML pattern DSL that can be added to or modified without touching core scanner logic.  

The rules align with typical Python coding conventions (PEP 8 style imports, function definitions, etc.).

## Key Decisions Anchored by This Document

- The scanner handles both **standard imports** (`import X`) and **from‑imports** (`from A import B`).  
- All common Python export constructs are covered: **functions**, **classes**, **async functions**, and **module‑level variables**. The special `__all__` list pattern is also included.  
- Usage detection is limited to **direct calls** and **attribute access**; dynamic or reflected uses (e.g., `getattr`) are explicitly out of scope.  
- The set of patterns is open for extension – new pattern entries can be added to support additional syntactic forms.

## Workflows Anchored

- **Code analysis pipeline** – the extraction rules are the first step in ArchSpine’s Python analysis workflow, producing a semantic index of imports, exports, and usages.  
- **Dependency graph generation** – the extracted relationships feed into ArchSpine’s mirror‑system visualisation and query tools.  
- **Rule maintenance** – any change to Python syntax support (e.g., adding pattern for decorators) starts with updating this document.

## Pattern Overview

The rules are organised into three categories:

- **Imports** – `from_import` (`from $SOURCE import $$$SYMBOLS`) and `simple_import` (`import $$$SYMBOLS`).  
- **Exports** – `function`, `class`, `async_function`, `variable`, and the `__all__` list.  
- **Usages** – `call` (`$NAME($$$ARGS)`) and `property` (`$OBJ.$NAME`).

These patterns are expressed in a small DSL that uses `$`‑prefixed placeholders and `$$$` for multi‑part captures. No other programming languages (TypeScript, Go, Rust, etc.) are covered; runtime behaviour or documentation generation are also outside the scope of this document.