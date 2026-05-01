<!-- spine-content-hash:4b58f9f22a604e283f3de3f302bee00289cdd0bf32a4be8c4fba78ad20b82aa8 -->
# ArchSpine – `runWithFoldableOutput`

## Role
CLI utility function for interactive foldable console output management during asynchronous operations.

## Key Responsibilities
- Wraps asynchronous actions with a foldable UI that displays a blinking orange status indicator and allows SPACE key to unfold detailed output.
- Detects CI or non-TTY environments and falls back to native console behavior for safety and compatibility.
- Intercepts and buffers `console.log`, `console.warn`, and `console.error` output while folded, displaying it upon unfold.
- Manages raw terminal input mode and event listeners for interactive key handling.

## Notable Invariants & Negative Scope
- Must not absorb service/task/engine orchestration concerns (per rule `infra-facade-imports`).
- Must fall back to native console behavior in CI or non-TTY environments.
- Must restore terminal state (raw mode, listeners) after completion.
- Does **not** handle persistent logging, file I/O, network/IPC communication, configuration management, or domain-specific business logic.

## Most Important Exported Behavior
- **`runWithFoldableOutput`** – the sole public surface. It accepts an async function, wraps it with the foldable UI, and returns the result of that function. In CI/non-TTY environments, it transparently delegates to the native console.