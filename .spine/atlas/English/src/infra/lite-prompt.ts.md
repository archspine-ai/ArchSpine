<!-- spine-content-hash:d7cd4aa65cdf6260b475fd286a98a6fbd8c01139ea55c0b2f76f6240bea3efd3 -->
# LitePromptBuilder — Lightweight Prompt Construction for Lite Mode

**Role:**  
Utility class for constructing lightweight LLM prompts optimized for token-constrained APIs in low-precision "Lite Mode" structural indexing.

**Key Responsibilities:**
- Builds concise prompt strings for high-level file summarization in low-precision structural indexing mode.
- Supports configurable response modes: JSON-only or JSON-and-markdown.
- Generates localized markdown instructions for specified languages.
- Provides a fluent builder API for assembling prompt parts.

**Notable Invariants & Negative Scope:**
- Exports a single public class `LitePromptBuilder` with a fluent interface.
- Exports a type `LitePromptResponseMode` defining allowed response modes.
- Maintains internal state as a private array of string parts.
- Generates prompts focused on structural indexing with minimal context overhead.
- Does **not** orchestrate LLM API calls or manage token counting.
- Does **not** handle high-precision or full-context analysis prompts.
- Does **not** address infrastructure-level concerns like network, logging, or configuration management.

**Most Important Exported / Externally Visible Behavior:**
- `LitePromptBuilder` — the primary class for building prompts via a fluent API.
- `LitePromptResponseMode` — a type that restricts response format to either JSON-only or JSON-and-markdown.