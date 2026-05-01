<!-- spine-content-hash:4de69744d263b70566c54463d86ae93cbdf8a4f9e4fbf78c4d8d29b70fd3e4df -->
# ArchSpine – Rule Block Diagnostics

## Role
Core diagnostic utility for analyzing rule block retention and filtering in prompt relevance processing.

## Key Responsibilities
- Extracts rule IDs from raw rule block text using regex pattern matching.
- Builds diagnostics comparing raw and final rule data to identify retained and dropped rule blocks.
- Integrates with dependency diagnostics to filter retained candidates based on context inclusion.

## Notable Invariants & Negative Scope
- Operates purely on string data representing rule blocks.
- Depends on local utility functions for rule block splitting.
- Does **not** orchestrate service or engine workflows.
- Does **not** provide low-level infrastructure capabilities.
- Does **not** handle HTTP requests or external API calls.

## Most Important Exported Behavior
- Exports a single diagnostic builder function: `buildRuleBlockDiagnostics`.