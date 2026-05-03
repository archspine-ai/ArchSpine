# Documentation Inventory

`docs/` is the English-primary documentation tree.

Chinese mirrors live under `docs/zh-CN/` using the same domain structure where a counterpart exists.

## Public docs mapping

| Area                  | English path                                | Chinese path                                      | Status |
| --------------------- | ------------------------------------------- | ------------------------------------------------- | ------ |
| Home                  | `docs/index.md`                             | `docs/zh-CN/index.md`                             | mapped |
| Tutorials Index       | `docs/tutorials/index.md`                   | `docs/zh-CN/tutorials/index.md`                   | mapped |
| Quick Start           | `docs/tutorials/quick-start.md`             | `docs/zh-CN/tutorials/quick-start.md`             | mapped |
| Demo                  | `docs/tutorials/DEMO.md`                    | `docs/zh-CN/tutorials/DEMO.md`                    | mapped |
| Showcase              | `docs/tutorials/showcase.md`                | `docs/zh-CN/tutorials/showcase.md`                | mapped |
| How-to Index          | `docs/how-to/index.md`                      | `docs/zh-CN/how-to/index.md`                      | mapped |
| Runbook               | `docs/how-to/RUNBOOK.md`                    | `docs/zh-CN/how-to/RUNBOOK.md`                    | mapped |
| MCP Integration       | `docs/how-to/MCP.md`                        | `docs/zh-CN/how-to/MCP.md`                        | mapped |
| Local LLM             | `docs/how-to/LOCAL-LLM.md`                  | `docs/zh-CN/how-to/LOCAL-LLM.md`                  | mapped |
| FAQ                   | `docs/how-to/FAQ.md`                        | `docs/zh-CN/how-to/FAQ.md`                        | mapped |
| Reference Index       | `docs/reference/index.md`                   | `docs/zh-CN/reference/index.md`                   | mapped |
| Current Capabilities  | `docs/reference/CURRENT-CAPABILITIES.md`    | `docs/zh-CN/reference/CURRENT-CAPABILITIES.md`    | mapped |
| Protocol              | `docs/reference/PROTOCOL.md`                | `docs/zh-CN/reference/PROTOCOL.md`                | mapped |
| Ignore Policy         | `docs/reference/IGNORE-POLICY.md`           | `docs/zh-CN/reference/IGNORE-POLICY.md`           | mapped |
| LLM Benchmarks        | `docs/reference/LLM-BENCHMARKS.md`          | `docs/zh-CN/reference/LLM-BENCHMARKS.md`          | mapped |
| Explanation Index     | `docs/explanation/index.md`                 | `docs/zh-CN/explanation/index.md`                 | mapped |
| Architecture Overview | `docs/explanation/ARCHITECTURE-OVERVIEW.md` | `docs/zh-CN/explanation/ARCHITECTURE-OVERVIEW.md` | mapped |
| View Layer            | `docs/explanation/VIEW-LAYER.md`            | `docs/zh-CN/explanation/VIEW-LAYER.md`            | mapped |
| Cost & Usage          | `docs/explanation/COST-USAGE.md`            | `docs/zh-CN/explanation/COST-USAGE.md`            | mapped |
| God Mode Guide        | `docs/explanation/GOD-MODE.md`              | `docs/zh-CN/explanation/GOD-MODE.md`              | mapped |
| Powered by            | `docs/explanation/POWERED-BY.md`            | `docs/zh-CN/explanation/POWERED-BY.md`            | mapped |
| Prompt Engine         | `docs/design/PROMPT-ENGINE.md`              | `docs/zh-CN/design/PROMPT-ENGINE.md`              | mapped |
| Task Execution Model  | `docs/design/TASK-EXECUTION-MODEL.md`       | `docs/zh-CN/design/TASK-EXECUTION-MODEL.md`       | mapped |

## Internal but mirrored docs

These stay out of the main public navigation, but they now also follow the English-primary plus `zh-CN` mirror pattern:

- `docs/design/**` <-> `docs/zh-CN/design/**`
- `docs/planning/**` <-> `docs/zh-CN/planning/**`

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
