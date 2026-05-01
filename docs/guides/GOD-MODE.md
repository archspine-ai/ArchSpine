# God Mode

God mode is a deliberate overkill mode for ArchSpine.

It is human-only, intentionally non-production, and openly a joke mode.

If vibe coding gets to have absurdly large god files, then ArchSpine, as a semantic map of the codebase, naturally gets to ship a mirror-image god file of its own.

## What it writes

Run:

```bash
spine god
```

God mode does not extend `sync`.

It reads the current `.spine/index/` state and writes exactly one file:

- `.spine/<repo-name>-god.md`

## When to use it

Use god mode when you want:

- a single markdown artifact for the whole repository
- a giant one-file repo readout for demos or experiments
- a quick way to inspect the current project shape without opening many per-file docs

Do not treat it as the default indexing path. The normal structure-first mapping is still the main workflow.

## Notes

- God mode is a separate one-shot command.
- The CLI warns that it is not a production mode before running.
- Re-running it overwrites the previous `.spine/<repo-name>-god.md`.
- The generated dossier is deterministic and derived from the current `.spine/index` state.
