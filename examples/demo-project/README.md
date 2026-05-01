# ArchSpine Demo Project

This sample repository is the canonical governance demo for ArchSpine.

## Scenario

The source tree intentionally contains a static architecture violation:

- `src/api/handler.ts` imports `src/infra/database.ts`
- `.spine/rules/arch.yml` declares that the API layer must not depend directly on Infra

That gives the demo a real, repeatable `build -> check -> fix` first-run path (then incremental `sync`) instead of a project-state-only walkthrough.

## Demo state

Keep these files in version control:

- `.gitignore`
- `.spine/rules/arch.yml`
- `src/api/handler.ts`
- `src/domain/user-service.ts`
- `src/infra/database.ts`

Treat these as rebuild-only runtime state and never commit them:

- `.spine/cache.db`
- `.spine/.lock`
- `.spine/manifest.json`
- `.spine/languages.json`
- `.spine/index/`
- `.spine/atlas/`

The local `.gitignore` in this demo project enforces that boundary by ignoring every `.spine` runtime asset except `.spine/rules/**`.

## Run the governance demo

Offline and stable:

```bash
npm run build
cd examples/demo-project
rm -rf .spine/index .spine/atlas
rm -f .spine/cache.db .spine/cache.db-shm .spine/cache.db-wal .spine/manifest.json .spine/languages.json .spine/.lock
node ../../dist/cli/index.js llm --project set provider mock
node ../../dist/cli/index.js build
node ../../dist/cli/index.js check
node ../../dist/cli/index.js fix
```

With a real model instead of the offline mock:

```bash
node ../../dist/cli/index.js llm setup
node ../../dist/cli/index.js build
node ../../dist/cli/index.js check
node ../../dist/cli/index.js fix
```

If your provider requires outbound access, configure proxy variables in the shell before recording.

## What to expect

- `build` establishes the first local `.spine/` baseline for the demo repository
- `check` reports at least one `layer-isolation` violation for `src/api/handler.ts`
- `fix` reads the recorded active violation and enters the interactive repair flow

## Real-model recording checklist

Configure a real provider before recording:

```bash
node ../../dist/cli/index.js llm setup
```

Required persisted settings:

- `provider`
- `apiKey`

Optional provider tuning:

- `model`
- `baseURL`

Proxy variables if outbound access is restricted:

- `HTTPS_PROXY`
- `HTTP_PROXY`
- `ALL_PROXY`

Known sources of output drift:

- model latency and rate limits can change the pacing of `check` and `fix`
- model wording may vary even when the same violation is detected
- `fix` output can differ by provider or model version

To keep recordings stable:

- rebuild with `npm run build` immediately before capture
- clear `.spine` runtime state before every take
- prefer the `mock` flow for docs and deterministic regression checks
- use a real provider only when you specifically want to showcase live-model behavior

## Recording

Use [`scripts/demo.tape`](../../scripts/demo.tape) for the governance demo.
Use [`scripts/project-demo.tape`](../../scripts/project-demo.tape) for the separate project-capability demo.
