# Documentation Inventory

`docs/` is the English-primary documentation tree.

Chinese mirrors live under `docs/zh-CN/` using the same domain structure where a counterpart exists.

## Public docs mapping

| Area                  | English path                           | Chinese path                                 | Status |
| --------------------- | -------------------------------------- | -------------------------------------------- | ------ |
| Home                  | `docs/index.md`                        | `docs/zh-CN/index.md`                        | mapped |
| Quick Start           | `docs/quick-start.md`                  | `docs/zh-CN/quick-start.md`                  | mapped |
| Current Capabilities  | `docs/guides/CURRENT-CAPABILITIES.md`  | `docs/zh-CN/guides/CURRENT-CAPABILITIES.md`  | mapped |
| Demo                  | `docs/examples/demo.md`                | `docs/zh-CN/examples/demo.md`                | mapped |
| MCP Integration       | `docs/integrations/mcp.md`             | `docs/zh-CN/integrations/mcp.md`             | mapped |
| Powered by            | `docs/community/powered-by.md`         | `docs/zh-CN/community/powered-by.md`         | mapped |
| Showcase              | `docs/showcase.md`                     | `docs/zh-CN/showcase.md`                     | mapped |
| Runbook               | `docs/guides/RUNBOOK.md`               | `docs/zh-CN/guides/RUNBOOK.md`               | mapped |
| Local LLM             | `docs/guides/LOCAL-LLM.md`             | `docs/zh-CN/guides/LOCAL-LLM.md`             | mapped |
| Protocol              | `docs/specs/PROTOCOL.md`               | `docs/zh-CN/specs/PROTOCOL.md`               | mapped |
| Ignore Policy         | `docs/specs/IGNORE-POLICY.md`          | `docs/zh-CN/specs/IGNORE-POLICY.md`          | mapped |
| LLM Benchmarks        | `docs/specs/LLM-BENCHMARKS.md`         | `docs/zh-CN/specs/LLM-BENCHMARKS.md`         | mapped |
| Prompt Engine         | `docs/design/PROMPT-ENGINE.md`         | `docs/zh-CN/design/PROMPT-ENGINE.md`         | mapped |
| Architecture Overview | `docs/design/ARCHITECTURE-OVERVIEW.md` | `docs/zh-CN/design/ARCHITECTURE-OVERVIEW.md` | mapped |
| Task Execution Model  | `docs/design/TASK-EXECUTION-MODEL.md`  | `docs/zh-CN/design/TASK-EXECUTION-MODEL.md`  | mapped |
| God Mode Guide        | `docs/guides/GOD-MODE.md`              | `docs/zh-CN/guides/GOD-MODE.md`              | mapped |

## Internal but mirrored docs

These stay out of the main public navigation, but they now also follow the English-primary plus `zh-CN` mirror pattern:

- `docs/design/**` <-> `docs/zh-CN/design/**`
- `docs/planning/**` <-> `docs/zh-CN/planning/**`
- `docs/validation_plan.md` <-> `docs/zh-CN/validation_plan.md`

## Maintenance rules

1. Add or update the English source under `docs/` first.
2. Put the Chinese mirror under the same relative path below `docs/zh-CN/`.
3. Keep `.spine/atlas/` as the single current name for the derived docs directory.
4. Keep internal docs out of the main public nav unless there is an explicit reason to expose them.
5. If a public path changes, update VitePress config and both READMEs.
6. Treat `mode` (`standard` / `heavy`) as the primary user-facing runtime term in public docs.
7. Mention `prompt-tier`, `validate-policy`, and `validate-split-stage` only as advanced or legacy controls unless a design doc explicitly needs them.
8. Treat `.spine/protected-output-baseline.json` as local runtime state, not as a portable project contract.
9. Describe direct-edit detection as a warning layer for generated outputs, not as a full proposal or approval gate.
10. Keep `sync` = local runtime writer path and `publish` = maintainer distribution refresh path aligned across docs.
11. Keep MCP read-only and ArchSpine CLI/runtime as the authoritative writer in all entry-point docs.
