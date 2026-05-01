<!-- spine-content-hash:c6248d699a7f3fe2b89203d82d765b7eeb66392f4f0d93085b74895781b0e03f -->
# ArchSpine Pre-commit Hook Block Generator

## Role
Infrastructure utility module for generating and managing the ArchSpine pre-commit Git hook shell script block.

## Key Responsibilities
- Defines the `InstallGitHookResult` discriminated union type to represent outcomes of Git hook installation operations.
- Implements `getManagedHookBlock()` to generate the standardized shell script block for the ArchSpine pre-commit hook, including logic to locate the `spine` CLI command.

## Notable Invariants
- The generated hook block must always include the ArchSpine marker comments (`# >>> ArchSpine pre-commit >>>` and `# <<< ArchSpine pre-commit <<<`).
- The hook block must attempt to use `./node_modules/.bin/spine` first, then fall back to a globally installed `spine`, then to `dist/cli/index.js`.

## Negative Scope (Out of Scope)
- Actual installation, update, or removal of the hook file in the `.git/hooks` directory.
- Validation of the Git repository root or file system operations beyond generating the hook script content.

## Most Important Exported Behavior
- **`InstallGitHookResult`** (type export): A discriminated union representing possible outcomes of hook installation.
- **`getManagedHookBlock`** (function export): Generates the complete shell script block for the ArchSpine pre-commit hook, with fallback logic for locating the `spine` CLI.