# ArchSpine Mirror System Pattern Configuration

## Purpose

This document serves as the pattern configuration for ArchSpine's mirror system, enabling automated extraction of structural and relational information from Go source files. It defines the rules and patterns used to parse Go code and identify semantic elements such as imports, exports, and usages.

## Intended Audience

This document is intended for developers maintaining ArchSpine or integrating its parsing capabilities. It is a technical specification that maps Go syntax constructs to a universal model, driving code analysis and documentation generation workflows.

## Key Takeaways

- The configuration uses a pattern-based DSL to describe Go code constructs.
- **Imports**, **exports**, and **usages** are the three core categories of extracted elements.
- Each pattern defines an identifier, a regex-like template, and an optional kind classification.
- The system supports both single and grouped import declarations.
- Export patterns cover all major Go declaration types: functions, structs, interfaces, type aliases, variables, and constants.

## Decisions and Workflows Anchored by This Document

- **Pattern Definitions**: The exact templates for matching import statements (`import $SOURCE`), grouped imports, function declarations, struct types, interfaces, type aliases, variables, constants, function calls, and selector expressions are specified in the supporting context. These patterns are the basis for all extraction logic.
- **Classification**: Each export pattern includes a `kind` field (e.g., Function, Class, Interface, Type, Variable) that determines how extracted elements are categorized in the universal model.
- **Out-of-Scope Boundaries**: This document explicitly excludes language grammar beyond Go, runtime behavior, project-specific logic, and documentation presentation/styling, ensuring focus on parsing rules only.

## Pattern Overview

The supporting context defines the following pattern groups:

- **Imports**: Two patterns — single import (`import $SOURCE`) and grouped import (`import ( $$$SYMBOLS )`).
- **Exports**: Six patterns — functions, structs, interfaces, type aliases, variables, and constants, each with a distinct identifier and template.
- **Usages**: Two patterns — function calls (`$NAME($$$ARGS)`) and selector expressions (`$OBJ.$NAME`).

These patterns are the foundation for automated code analysis and documentation generation within the ArchSpine ecosystem.