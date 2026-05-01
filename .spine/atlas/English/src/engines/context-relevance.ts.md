<!-- spine-content-hash:6ea99dc98e44c48f923d807588b2a84c1789d42a31324e3631722c4ade4202df -->
# `extractRuleKeywords` — Keyword Extraction Utility

## Role
Engine utility function for extracting and filtering keywords from architectural rule text.

## Key Responsibilities
- Tokenizes rule content into search tokens using an external `extractSearchTokens` function.
- Filters out predefined rule-related stopwords to isolate meaningful keywords.
- Limits the keyword list to a maximum of 16 unique tokens for efficiency.

## Notable Invariants & Negative Scope
- Must not depend on CLI entrypoints or service orchestration modules.
- Must be a pure function focused on text tokenization and filtering.
- Does **not** parse or validate rule structure.
- Does **not** score or rank rule relevance.
- Does **not** interact directly with CLI or service orchestration.

## Most Important Exported Behavior
- **`extractRuleKeywords`** — the sole public surface; callers pass rule text and receive a deduplicated, stopword-filtered list of up to 16 keywords.