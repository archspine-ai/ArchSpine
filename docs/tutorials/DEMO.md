# Official Demo

The repository includes a demo project that intentionally violates a simple layer rule so you can show the full ArchSpine workflow in minutes.

## Scenario

`src/api/handler.ts` imports directly from `src/infra/database.ts`, which violates the rule declared under `.spine/rules/arch.yml`.

## Governance fix demo

```bash
npm run build
cd examples/demo-project
rm -rf .spine/index .spine/atlas
rm -f .spine/cache.db .spine/cache.db-shm .spine/cache.db-wal .spine/manifest.json .spine/languages.json .spine/.lock
node ../../dist/cli/index.js llm --project set provider mock
node ../../dist/cli/index.js build
node ../../dist/cli/index.js sync
node ../../dist/cli/index.js check
node ../../dist/cli/index.js fix
```

## Expected outcome

- `build` initializes the trusted demo `.spine/` baseline from a clean state
- `sync` performs incremental runtime refresh on top of the existing baseline
- `check` reports the API -> Infra violation in `src/api/handler.ts`
- `fix` reads the recorded active violation and enters the fix flow

The governance acceptance test in `tests/demo-governance.test.ts` exercises that exact offline path so regressions break CI before they break the public demo.

## Project capability demo

If you want the non-governance walkthrough instead:

```bash
npm run build
node dist/cli/index.js sync --hook
node dist/cli/index.js info
node dist/cli/index.js scan --dry-run
```

## Recording assets

- Governance VHS script: [`scripts/demo.tape`](https://github.com/iZoy/archSpine/blob/main/scripts/demo.tape)
- Project VHS script: [`scripts/project-demo.tape`](https://github.com/iZoy/archSpine/blob/main/scripts/project-demo.tape)
- Demo project guide: [examples/demo-project/README.md](https://github.com/iZoy/archSpine/blob/main/examples/demo-project/README.md)

The VHS scripts are the canonical recording sources for the demo workflows.

If you need a real provider instead of the offline mock, configure it with `spine llm setup` first and make sure any required proxy variables are set.

> Note: view-layer outputs (`.spine/view/**`) remain **experimental** and are not required for the governance demo release contract.

Real-provider recording checklist:

- required: `spine llm set provider`, `spine llm set api-key`
- optional: `spine llm set model`, `spine llm set base-url`
- proxies when needed: `HTTPS_PROXY`, `HTTP_PROXY`, `ALL_PROXY`
- expect drift in latency, wording, and patch shape across providers and model versions
