<!-- spine-content-hash:41a669693d805c0df730adf6a730009250e749ec5eaf05b9702c239630a6511b -->
# ArchSpine CLI UI Presentation Utility

## Role
This module is a CLI UI presentation utility responsible for formatting language discovery results, conditionally rendering banners, and parsing configuration values.

## Key Responsibilities
- Formats a list of language names into a comma-separated string for display.
- Determines whether to show the full ArchSpine banner based on the command (help, init, build) or a mini banner for the sync command.
- Parses raw string configuration values into typed JavaScript primitives (booleans, numbers, null, undefined, JSON objects/arrays).
- Provides conditional banner display logic to suppress output during internal hooks.

## Notable Invariants & Negative Scope
- CLI modules must remain thin entrypoints and command adapters, avoiding absorption of pipeline or persistence logic.
- This module does **not** handle pipeline or persistence logic (e.g., database access, file I/O, build orchestration).
- It does **not** perform command routing or argument parsing beyond banner display decisions.
- Core error handling or error code definitions are out of scope.

## Most Important Exported Behavior
- `formatLanguageList(languages: string[]): string` — Converts an array of language names into a human-readable comma-separated string.
- `shouldShowFullBanner(cmd?: string, _argsArr?: string[]): boolean` — Returns `true` if the full ArchSpine banner should be displayed (for help, init, build commands).
- `shouldShowMiniBanner(cmd?: string): boolean` — Returns `true` if the mini banner should be displayed (for sync command).
- `parseConfigValue(raw: string): unknown` — Parses a raw string into a typed JavaScript primitive, supporting booleans, numbers, null, undefined, and JSON objects/arrays.