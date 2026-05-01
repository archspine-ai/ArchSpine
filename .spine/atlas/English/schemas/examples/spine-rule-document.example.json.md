<!-- spine-content-hash:0091b0a51af342ef54f9e690cbfd5389df755cf4a7e5d74cf048ed33b24b2d3b -->
# ArchSpine: `no-direct-db-import` Architectural Rule

## Role
This rule enforces architectural layer isolation by prohibiting direct imports from the database layer (`src/db/`) in service and middleware layers. It ensures clean domain boundaries between business logic and storage implementation.

## Key Responsibilities
- Prevent service and middleware code from directly importing database adapters.
- Enforce separation of concerns between business logic and data access.
- Treat any violation as a compilation/deployment error.

## Invariants
- Any file matching `src/**/*.ts` **except** those under `src/db/` must not import from `src/db/*`.
- Violations are treated as errors (severity: `error`).
- The rule is enforceable by tooling and cannot be bypassed.

## Negative Scope (Out of Scope)
- This rule does not restrict imports within the database layer itself.
- It does not define how database adapters should be structured or exposed.
- It does not enforce any specific abstraction pattern (e.g., repository pattern) — only the prohibition of direct imports.

## Exported / Externally Visible Behavior
- The rule is identified by `ruleId: "no-direct-db-import"`.
- It applies to all TypeScript files outside `src/db/`, as defined by the `appliesTo` glob pattern.
- The `severity` is `error`, meaning violations block compilation or deployment.
- The `enforceable` flag is `true`, allowing automated enforcement in CI/CD pipelines.
- The `rationale` (in Chinese) explains the purpose: maintaining clear domain boundaries and avoiding coupling business logic to storage implementation.

## Stability and Risks
This rule enhances system stability by enforcing a strict layered architecture, preventing accidental coupling between business logic and database specifics. It reduces the risk of cascading changes when storage implementations are modified. However, overly strict enforcement may require additional abstraction layers, increasing initial development complexity. Violations are treated as errors, ensuring early detection in CI/CD pipelines.