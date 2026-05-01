<!-- spine-content-hash:f19dabf5a8daf22fb88ee6f2aca010e7b885fb697dccbd27c07bf3e24fdf3128 -->
# ArchSpine – Prompt Types Module

## Role
TypeScript type definition module for ArchSpine's prompt generation and response formatting protocol.

## Key Responsibilities
- Defines the `PromptResponseMode` type, which specifies allowed output formats for prompt responses: either JSON-only or JSON-and-markdown.
- Defines the `MarkdownPromptInput` interface, which structures the input required for generating markdown documentation prompts. This includes an identifier, file kind, semantic JSON, languages, and optional supporting context.
- Encodes the contract for prompt generation by linking file kinds from the protocol and specifying required localization languages.

## Notable Invariants
- The `MarkdownPromptInput.fileKind` field must be a valid `FileKind` from the protocol or the literal `'project'`.
- The `PromptResponseMode` type is a union of two string literals and must not be extended without updating all consumers.

## Out of Scope
- Prompt generation logic or implementation.
- Markdown rendering or formatting.
- Any runtime behavior or side effects.

## Public Surface
- `PromptResponseMode`
- `MarkdownPromptInput`