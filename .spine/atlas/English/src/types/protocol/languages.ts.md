<!-- spine-content-hash:6688209dcf26fbc80000f3eb5249f615fcd1cba45c9faca5a71f5a4abe6257cf -->
# ArchSpine Language Support Type Definitions

## Role
This module defines the TypeScript type contracts for language support metadata within the ArchSpine mirror system. It provides the data structures that enable type-safe communication between subsystems regarding detected programming languages and their extensions.

## Key Responsibilities
- **LanguageSnapshot** – Represents the complete state of all detected languages and their associated file extensions.
- **LanguageSupport** – Describes the availability status and metadata for a single programming language.
- **LanguageDelta** – Captures the differences between two language states, enabling change tracking.

## Notable Invariants
- All exported interfaces must follow the `I` prefix naming convention (e.g., `ILanguageSnapshot`). Currently, all three interfaces violate this rule.

## Negative Scope (Out of Scope)
- Does **not** implement any logic for detecting or processing language data.
- Does **not** define runtime behavior or validation logic.

## Public Surface
- `LanguageSnapshot`
- `LanguageSupport`
- `LanguageDelta`

## Drift Detected
A drift from the previous semantic contract has been detected: all three interfaces violate the interface-prefix rule, which was not previously reported.