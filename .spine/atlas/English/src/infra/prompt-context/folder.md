This directory is the prompt policy and assembly core of the ArchSpine mirror system. It contains the full pipeline for constructing source prompt artifacts: resolving policy tiers, calculating token/line budgets, trimming context and rule blocks, generating diagnostics, and defining typed constants and interfaces.

The notable children are organized around four areas:

- **Policy resolution & budget calculation** – `policy.ts` resolves default and overridable prompt tiers and validation policies per task mode; `budgets.ts` selects strict or standard profiles and computes final budget allocations using multipliers and clamps; `constants.ts` stores the typed constants and budget profiles that serve as the single source of truth.
- **Trimming & compaction** – `trim.ts` provides core formatting and trimming utilities (line-limit, character-limit, rule‑block splitting, sectioned context trimming, FileSkeleton compaction, and previous‑context trimming).
- **Diagnostics** – `diagnostics.ts` builds structured diagnostic objects for rule block retention and dependency selection, enabling debugging of context trimming and relevance filtering.
- **Type definitions & parsing** – `types.ts` defines the central TypeScript type schema for prompt task modes, policy tiers, LLM modes, budget profiles, and diagnostic structures; `parsers.ts` offers type‑safe parsing of raw strings into these enums.

The main orchestration is in `artifacts.ts`, which coordinates policy resolution, budget calculation, structural skeleton compaction, content trimming, and diagnostic generation to produce the complete `SourcePromptArtifacts` object. Together, these modules provide a consistent, configurable pipeline for generating prompts across different task modes.