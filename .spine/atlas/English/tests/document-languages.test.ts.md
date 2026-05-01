<!-- spine-content-hash:60095dccf247065916678d51c8c670c838b4fc1da1147a43ba30425374ea994a -->
# ArchSpine – Document Language Selection Test Suite

This Vitest unit test suite validates the core logic for document language selection and ordering within the ArchSpine mirror system. It ensures that language choices are presented in a consistent, well-defined order and that the high-capacity language separator behaves as expected.

## Key Responsibilities

- **Language Ordering Validation:** Confirms that `getDocumentLanguageChoices` returns stable languages first, followed by a disabled separator, and then high-capacity languages.
- **Separator Integrity:** Asserts the correct index and properties of the high-capacity language separator.
- **Default Values:** Verifies that default selected language values match the expected defaults.
- **Constant Verification:** Ensures the `HIGH_CAPACITY_LANGUAGE_SEPARATOR` constant contains the expected descriptive note.

## Notable Invariants & Negative Scope

- **Invariant:** Test file suffix must be `.test.ts` or `.spec.ts` (compliant).
- **Out of Scope:** This suite does **not** cover:
  - Non-language selection CLI functions
  - Integration testing with external services
  - UI rendering or user interaction

## Exported Behavior

The test suite exports no public surface; it is purely an internal validation harness. Its primary externally visible behavior is the assertion of correct language ordering and separator placement, which directly impacts the user-facing language selection interface.