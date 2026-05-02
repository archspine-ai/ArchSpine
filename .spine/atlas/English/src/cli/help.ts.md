<!-- spine-content-hash:c97b27853eab4b15ce184147a7365ae6fad63047d151b90dcc7f70025b281e57 -->
# ArchSpine CLI Help Text Renderer

## Role
This file serves as the **help text renderer** for the ArchSpine command-line interface. Its sole purpose is to produce user-facing help output — it contains no command execution logic.

## Key Responsibilities
- Print a **general help overview** listing all commands organized by category (e.g., Setup & Config, Core Workflows).
- Print **detailed help for a specific command** (e.g., `init`, `try`, `sync`, `view`) using a `switch`-based helper.
- Keep command descriptions current, including experimental features such as the `view` command runtime.

## Important Invariants & Negative Scope
- **Must not** import or invoke any pipeline, persistence, or core domain logic — this is a pure presentation layer, enforced by the `cli-entrypoint-separation` rule.
- **Out of scope**: command execution, business logic, configuration read/write, Git hook management, and all orchestration or persistence concerns.
- The only side effect is console output; no other dependencies are touched.

## Public API (Most Important Exported Behaviors)
- `printGeneralHelp()`: renders the full command list.
- `printCommandHelp(cmd: string)`: renders help for a single command by name.

---