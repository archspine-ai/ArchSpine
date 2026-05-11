# Git-Native Distribution

## Why Git Is the Only Distribution Channel

ArchSpine has no sync server, no cloud database, no distribution API. The `.spine/` control plane is a directory of files tracked in git. When you `git push`, the control plane travels with your code. When a teammate `git pull`, they get the architecture description for the exact commit they are on. There is nothing to provision, nothing to sign up for, and nothing to keep running.

This design flows from a simple constraint: the architecture description must be **commit-accurate**. If Alice checks out commit `abc123`, the `.spine/` at that commit must describe the code at `abc123` — not the code from five minutes ago, not the code on a different branch. Git guarantees this. An external service cannot.

## `.spine/` as a Distribution Artifact

`.spine/` is tracked in git and pushed to remotes. It is not build output that gets `.gitignore`-d — it is a **distribution artifact**, like a compiled binary in a release. Consumers (other developers, CI systems, AI agents) read `.spine/` directly from the working tree. They do not run `spine sync` themselves unless they are making changes that affect the architecture.

## Commit Discipline

Because `.spine/` is tracked in git, changes to the control plane must be committed separately from source changes. The rule is:

1. **Modify source** (code, rules, config) → build → commit source changes
2. **Run `spine sync`** → commit `.spine/` refresh

These are two separate commits. Never mix `.spine/` updates into a source commit. This keeps git history clean and makes it obvious whether `.spine/` drift is intentional (a sync after a real change) or accidental (stale index entries).

The exception: `.spine/config.json` and `.spine/rules/**` are human-reviewed control plane files. They can be committed alongside source changes because they ARE the source of architectural truth.

## CI Integration

Because `.spine/` is files in git, CI needs no special integration:

- **GitHub Actions / GitLab CI** runs `spine check` on every PR — the control plane is already in the working tree
- **Pre-commit hooks** can validate that `.spine/` is not stale before allowing a push
- **Branch protection rules** can require that `.spine/` passes compliance checks before merging

No API keys, no service accounts, no network calls to an external architecture service. The CI runner has everything it needs in the checkout.

## Why No External Sync Service

An external sync service would solve one problem — ensuring `.spine/` is always up to date without anyone running `spine sync` locally — but at the cost of:

- **Coupling**: every repo would depend on a service outside the git ecosystem
- **Latency**: the control plane could lag behind the code by seconds or minutes
- **Security**: the service would need read access to private repositories
- **Complexity**: the service itself would need to be built, operated, and paid for

By making `spine sync` a local command whose output is committed to git, ArchSpine avoids all of this. The control plane is as current as the last person who ran sync and pushed. For most teams, running sync before pushing a feature branch is a natural fit for existing workflows.
