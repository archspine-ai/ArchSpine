<!-- spine-content-hash:f1b368aac5194f664a11a39a71dd620f7318238dae974d8da46e76190638e341 -->
# ArchSpine – Repair Policy Test Suite

## Role
This file is a **Vitest unit test suite** for the `evaluateRepairPolicy` function, which governs how file-level violations are repaired in the ArchSpine mirror system.

## Key Responsibilities
- Validates that `evaluateRepairPolicy` correctly decides when to apply **targeted repair** for small file-level violations that include specific path mappings.
- Ensures that **aggregate-level paths** are properly identified and handled by the policy.
- Verifies that **safe non-interactive downgrade** behavior is triggered in appropriate scenarios.

## Notable Invariants & Negative Scope
- **Must** be a test file (suffix `.test.ts` or `.spec.ts`).
- **Must** import the function under test (`evaluateRepairPolicy`).
- **Must** use the Vitest testing framework.
- This file does **not** implement the repair policy logic itself.
- It does **not** handle non-test runtime execution.
- It does **not** provide user-facing CLI commands.

## Exported / Externally Visible Behavior
This file exports no public surface; it is purely a test suite that exercises the `evaluateRepairPolicy` function to ensure correctness and stability of the repair policy.