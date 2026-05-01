<!-- spine-content-hash:0732860fb39181958aee031003d49985f7539dcb219587945a0b2b9434064efa -->
# ArchSpine – CLI Confirmation Utility

**Role:**  
CLI utility module for interactive user confirmation prompts and terminal input handling.

**Key Responsibilities:**
- Parses user confirmation input from various formats (string, boolean) into a boolean result.
- Prompts for explicit confirmation with a customizable message and handles raw terminal mode for single-key input.
- Manages terminal state (raw mode, event listeners) to ensure proper cleanup after confirmation.
- Provides colored output (green/red) for confirmation prompts using kleur.

**Notable Invariants & Negative Scope:**
- Must handle both programmatic boolean input and interactive string input.
- Must restore terminal to a clean state after interactive prompts.
- Does **not** handle general command-line argument parsing, file system operations, network communication, or data persistence.

**Most Important Exported Behavior:**
- `parseConfirmation` – Converts user input (string or boolean) into a boolean confirmation result.
- `promptForExplicitConfirmation` – Displays a confirmation prompt, waits for single-key input in raw terminal mode, and returns the user's decision.