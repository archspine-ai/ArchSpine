<!-- spine-content-hash:be70097ede9d3a94955696ccc1211eaf63ba4db7cc7fd12458933a79ffb02541 -->
# Output Contract Renderer

## Role
Utility function generating formatted output contract strings for the ArchSpine prompt response system.

## Key Responsibilities
- Renders the OUTPUT CONTRACT section text based on the specified `PromptResponseMode` and target languages.
- Conditionally includes markdown block instructions when response mode is not `'json-only'`.
- Validates language list to ensure `'English'` is included as a required base language.

## Notable Invariants & Negative Scope
- The function must always return a string that starts with `'OUTPUT CONTRACT:'`.
- The function must always include the first two numbered contract points.
- When `responseMode` is `'json-only'`, the function must return only the JSON contract without markdown instructions.
- The function must validate that `'English'` is present in the languages array, case-insensitively.
- Does **not** handle actual JSON schema generation or validation.
- Does **not** manage prompt construction beyond the output contract section.
- Does **not** interact with file I/O, network, or external services.

## Most Important Exported Behavior
- **`renderOutputContract(responseMode: PromptResponseMode, languages: string[]): string`** — The sole public function that produces the formatted output contract string.