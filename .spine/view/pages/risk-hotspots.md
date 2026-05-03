# Risk Hotspots Report

> Generated: 2026-05-03T12:20:51.705Z
> Top 12 risk hotspots ranked by a transparent additive score model.

## Top Risk Files

| Rank | File | Risk Factors | Impact | Score |
| ---- | ---- | ------------ | ------ | ----- |

| 1 | `src/infra/mcp/tools.ts` | `fan-out`, `surface-exposure`, `large-file`, `missing-adjacent-tests` | Likely localized impact with a few downstream touch points. | 61 |
| 2 | `src/services/repository-admin-service.ts` | `semantic-change`, `fan-out`, `surface-exposure`, `large-file` | Likely localized impact with a few downstream touch points. | 56 |
| 3 | `src/engines/info.ts` | `fan-out`, `semantic-change`, `rule-violations`, `missing-adjacent-tests` | Likely localized impact with a few downstream touch points. | 53 |
| 4 | `src/ast/lang-registry.ts` | `semantic-change`, `surface-exposure`, `large-file`, `fan-out` | Likely localized impact with a few downstream touch points. | 52 |
| 5 | `src/infra/credentials/backend.ts` | `semantic-change`, `surface-exposure`, `fan-out`, `large-file` | Likely localized impact with a few downstream touch points. | 52 |
| 6 | `src/infra/llm/providers/openai.ts` | `semantic-change`, `fan-out`, `large-file`, `missing-adjacent-tests` | Likely localized impact with a few downstream touch points. | 52 |
| 7 | `src/infra/prompt-context.ts` | `semantic-change`, `surface-exposure`, `fan-out`, `missing-adjacent-tests` | Likely localized impact with a few downstream touch points. | 50 |
| 8 | `src/types/protocol/languages.ts` | `semantic-change`, `rule-violations`, `surface-exposure`, `missing-adjacent-tests` | Likely localized impact with a few downstream touch points. | 49 |
| 9 | `src/engines/context-relevance.ts` | `semantic-change`, `surface-exposure`, `large-file`, `fan-out` | Likely localized impact with a few downstream touch points. | 48 |
| 10 | `src/engines/scanner.ts` | `fan-out`, `surface-exposure`, `large-file`, `missing-adjacent-tests` | Likely localized impact with a few downstream touch points. | 48 |
| 11 | `src/infra/mcp/server.ts` | `fan-out`, `cross-boundary-density`, `surface-exposure`, `missing-adjacent-tests` | Likely medium impact beyond the local directory. | 48 |
| 12 | `src/utils/agent-instructions.sync.ts` | `semantic-change`, `surface-exposure`, `large-file`, `fan-out` | Likely localized impact with a few downstream touch points. | 48 |

## Detailed Analysis

### 1. `src/infra/mcp/tools.ts`
MCP (Model Context Protocol) tool facade that wraps core ArchSpine system components (Scanner, RuleEngine, Manifest, Config) into a unified interface for external AI agents; ranked due to fan-out, surface-exposure.
Impact Radius: Likely localized impact with a few downstream touch points.
Confidence: 0.73
Score: 61

- `fan-in` (4): File is depended on by 1 indexed file(s).
- `fan-out` (18): File depends on 10 indexed file(s).
- `cross-boundary-density` (4): File crosses 1 directory-boundary edge(s).
- `surface-exposure` (12): File exposes 11 public-surface item(s) and 1 export(s).
- `rule-violations` (5): File carries 1 active rule violation(s).
- `large-file` (12): File has 756 line(s), increasing change surface area.
- `missing-adjacent-tests` (6): No adjacent test file was detected near a shared or exposed module.

### 2. `src/services/repository-admin-service.ts`
Service orchestration module for managing repository artifact strategies, synchronization of managed configuration files, agent instructions, and package scripts within the ArchSpine project; ranked due to semantic-change, fan-out.
Impact Radius: Likely localized impact with a few downstream touch points.
Confidence: 0.71
Score: 56

- `fan-out` (14): File depends on 7 indexed file(s).
- `surface-exposure` (12): File exposes 12 public-surface item(s) and 12 export(s).
- `semantic-change` (16): Module was previously categorized as infrastructure but now resides under src/services/, indicating a reclassification to service orchestration.
- `large-file` (8): File has 273 line(s), increasing change surface area.
- `missing-adjacent-tests` (6): No adjacent test file was detected near a shared or exposed module.

### 3. `src/engines/info.ts`
Engine module for generating a comprehensive system info and health report for ArchSpine projects; ranked due to fan-out, semantic-change.
Impact Radius: Likely localized impact with a few downstream touch points.
Confidence: 0.69
Score: 53

- `fan-out` (18): File depends on 10 indexed file(s).
- `surface-exposure` (5): File exposes 1 public-surface item(s) and 1 export(s).
- `semantic-change` (16): Previous semantic described this module as a CLI command module, but the code resides in src/engines/ and exports an async function without any CLI argument parsing, confirming it is an engine module, not a CLI command.
- `rule-violations` (8): File carries 1 active rule violation(s).
- `missing-adjacent-tests` (6): No adjacent test file was detected near a shared or exposed module.

### 4. `src/ast/lang-registry.ts`
Stateful language configuration registry and dynamic language loader for the ArchSpine code analysis pipeline, managing AST-grep language bindings and file-to-language resolution; ranked due to semantic-change, surface-exposure.
Impact Radius: Likely localized impact with a few downstream touch points.
Confidence: 0.69
Score: 52

- `fan-out` (6): File depends on 3 indexed file(s).
- `cross-boundary-density` (4): File crosses 1 directory-boundary edge(s).
- `surface-exposure` (12): File exposes 3 public-surface item(s) and 3 export(s).
- `semantic-change` (16): Previous semantic contract described a simpler interface/loader pattern (LangConfig, InternalLangConfig, createLoader, dynamicImport), but the actual implementation is a full class (LangRegistry) with state management, caching, and dynamic registration logic. The previous contract did not capture the class's responsibilities or internal state.
- `large-file` (8): File has 257 line(s), increasing change surface area.
- `missing-adjacent-tests` (6): No adjacent test file was detected near a shared or exposed module.

### 5. `src/infra/credentials/backend.ts`
Infrastructure facade providing platform-specific credential storage backends for secure secret persistence across macOS, Linux, and Windows, with an in-memory fallback; ranked due to semantic-change, surface-exposure.
Impact Radius: Likely localized impact with a few downstream touch points.
Confidence: 0.69
Score: 52

- `fan-out` (10): File depends on 5 indexed file(s).
- `surface-exposure` (12): File exposes 6 public-surface item(s) and 6 export(s).
- `semantic-change` (16): Previous semantic limited to macOS Keychain backend; the code now includes Linux, Windows DPAPI, and in-memory backends, significantly expanding platform coverage.
- `large-file` (8): File has 290 line(s), increasing change surface area.
- `missing-adjacent-tests` (6): No adjacent test file was detected near a shared or exposed module.

### 6. `src/infra/llm/providers/openai.ts`
OpenAI-compatible LLM provider client with embedded prompt generation and response parsing orchestration, contrary to the Infra Facade design rule; ranked due to semantic-change, fan-out.
Impact Radius: Likely localized impact with a few downstream touch points.
Confidence: 0.69
Score: 52

- `fan-out` (12): File depends on 6 indexed file(s).
- `surface-exposure` (5): File exposes 1 public-surface item(s) and 1 export(s).
- `semantic-change` (16): The file header explicitly states it has drifted beyond a pure LLM client interface by absorbing prompt generation, strategy orchestration, and response parsing. The previous semantic contract also identified this pattern.
- `rule-violations` (5): File carries 1 active rule violation(s).
- `large-file` (8): File has 281 line(s), increasing change surface area.
- `missing-adjacent-tests` (6): No adjacent test file was detected near a shared or exposed module.

### 7. `src/infra/prompt-context.ts`
Public facade module for the prompt-context subsystem, providing a stable import surface for policy constants, budget profiles, artifact building, and resolution functions; ranked due to semantic-change, surface-exposure.
Impact Radius: Likely localized impact with a few downstream touch points.
Confidence: 0.68
Score: 50

- `fan-in` (4): File is depended on by 1 indexed file(s).
- `fan-out` (8): File depends on 4 indexed file(s).
- `cross-boundary-density` (4): File crosses 1 directory-boundary edge(s).
- `surface-exposure` (12): File exposes 15 public-surface item(s) and 0 export(s).
- `semantic-change` (16): The previous semantic contract did not include exports for calculateSourcePromptBudgets, parseLLMMode, parsePromptPolicyTier, parseRelevanceDiagnosticsMode, parseValidatePolicy, defaultPromptTierForTask, defaultValidatePolicyForTask, resolvePromptPolicyTier, and resolveValidatePolicy. The facade has expanded to include budget calculation, parsing, and resolution functions.
- `missing-adjacent-tests` (6): No adjacent test file was detected near a shared or exposed module.

### 8. `src/types/protocol/languages.ts`
TypeScript type definition module defining the data contracts for language support metadata within the ArchSpine mirror system; ranked due to semantic-change, rule-violations.
Impact Radius: Likely localized impact with a few downstream touch points.
Confidence: 0.67
Score: 49

- `surface-exposure` (12): File exposes 3 public-surface item(s) and 0 export(s).
- `semantic-change` (16): Previous semantic contract did not report violations of the interface-prefix rule, but all three interfaces violate it.
- `rule-violations` (15): File carries 3 active rule violation(s).
- `missing-adjacent-tests` (6): No adjacent test file was detected near a shared or exposed module.

### 9. `src/engines/context-relevance.ts`
Engine module for scoring the relevance of dependency candidates and target paths using rule-derived keywords, symbol evidence, and path distance heuristics; ranked due to semantic-change, surface-exposure.
Impact Radius: Likely localized impact with a few downstream touch points.
Confidence: 0.67
Score: 48

- `fan-out` (6): File depends on 3 indexed file(s).
- `surface-exposure` (12): File exposes 3 public-surface item(s) and 3 export(s).
- `semantic-change` (16): Previous semantic contract described only a utility for extracting keywords from rule text. This file now includes two additional scoring functions (scoreDependencyCandidate, scoreTargetPath) that compute composite relevance scores using symbol evidence, path distance, and keyword match, significantly expanding its architectural role.
- `large-file` (8): File has 370 line(s), increasing change surface area.
- `missing-adjacent-tests` (6): No adjacent test file was detected near a shared or exposed module.

### 10. `src/engines/scanner.ts`
Core file system scanner engine that discovers, filters, and reports repository files using layered ignore rules, git diff integration, and configurable scan policies; ranked due to fan-out, surface-exposure.
Impact Radius: Likely localized impact with a few downstream touch points.
Confidence: 0.67
Score: 48

- `fan-in` (4): File is depended on by 1 indexed file(s).
- `fan-out` (14): File depends on 7 indexed file(s).
- `cross-boundary-density` (4): File crosses 1 directory-boundary edge(s).
- `surface-exposure` (12): File exposes 3 public-surface item(s) and 3 export(s).
- `large-file` (8): File has 379 line(s), increasing change surface area.
- `missing-adjacent-tests` (6): No adjacent test file was detected near a shared or exposed module.

### 11. `src/infra/mcp/server.ts`
Infrastructure facade implementing the Model Context Protocol (MCP) server to expose ArchSpine's internal resources and tools to external AI agents via stdio transport; ranked due to fan-out, cross-boundary-density.
Impact Radius: Likely medium impact beyond the local directory.
Confidence: 0.67
Score: 48

- `fan-out` (18): File depends on 10 indexed file(s).
- `cross-boundary-density` (12): File crosses 3 directory-boundary edge(s).
- `surface-exposure` (12): File exposes 3 public-surface item(s) and 0 export(s).
- `missing-adjacent-tests` (6): No adjacent test file was detected near a shared or exposed module.

### 12. `src/utils/agent-instructions.sync.ts`
Centralized file I/O module for synchronizing and removing ArchSpine-managed configuration blocks in repository files (gitignore, gitattributes, agent instructions, search ignore, spine ignore, package.json scripts); ranked due to semantic-change, surface-exposure.
Impact Radius: Likely localized impact with a few downstream touch points.
Confidence: 0.67
Score: 48

- `fan-out` (6): File depends on 3 indexed file(s).
- `surface-exposure` (12): File exposes 26 public-surface item(s) and 26 export(s).
- `semantic-change` (16): Previous semantic contract omitted synchronization and removal of agent instructions files and package.json scripts. The current module now handles these artifact types, increasing its scope beyond the originally described set of configuration files.
- `large-file` (8): File has 438 line(s), increasing change surface area.
- `missing-adjacent-tests` (6): No adjacent test file was detected near a shared or exposed module.

---

_Experimental view. Refresh via `spine sync`._