# ArchSpine Git Strategy Migration

This document defines how repository artifact strategy should evolve after initial `spine init`.

It exists because `local` and `distributable` are no longer just onboarding presets. They are now repository-level declarations that affect Git behavior, publish semantics, and future team workflows.

## Context

Current behavior already provides part of the surface:

- `spine init --artifact-strategy <local|distributable>` sets the declared strategy
- managed `.gitignore` blocks are updated to match that strategy
- managed `.gitattributes` blocks are added or removed accordingly
- `spine publish` warns when run under `local`
- `spine repo check` can detect basic drift between config and managed Git files

What is still missing is a first-class lifecycle model for strategy changes after initialization.

## Problem

Today, users can technically change strategy by re-running `spine init`.

That is not a sufficient long-term product story because:

1. `init` is an onboarding command, not a repository lifecycle command
2. strategy changes may need targeted warnings and migration guidance
3. teams need an explicit contract for how Git state should change
4. future commercial team workflows need a stable repository-level policy surface

## Product goal

Turn artifact strategy into a durable repository contract with three properties:

1. explicit
2. recoverable
3. governable

This means strategy changes must become intentional repository migrations rather than side effects of re-running onboarding.

## Core decision

ArchSpine should distinguish between:

1. bootstrap selection
2. lifecycle migration

Bootstrap selection:

- happens during `spine init`
- chooses the first repository strategy

Lifecycle migration:

- happens after initialization
- changes an existing repository from one declared strategy to another
- must be able to explain consequences and repair managed files safely

## Strategy definitions

### `local`

Intent:

- keep generated snapshot artifacts out of Git by default
- optimize for private or early-stage repository usage

Expected Git state:

- `.gitignore` managed block includes snapshot outputs
- `.gitattributes` should not carry ArchSpine generated markers

Expected publish semantics:

- `spine publish` may still refresh snapshot outputs locally
- commit-oriented distribution is not the declared repository intent

### `distributable`

Intent:

- treat snapshot outputs as repository distribution assets
- keep review noise low with generated markers

Expected Git state:

- `.gitignore` managed block excludes only local runtime state
- `.gitattributes` contains generated markers for snapshot outputs

Expected publish semantics:

- `spine publish` is aligned with repository intent
- maintainers can refresh snapshot outputs as part of review or release workflows

## Source of truth

The intended precedence should be:

1. repository config declares strategy intent
2. managed `.gitignore` and `.gitattributes` implement that intent
3. `repo check` and future repair flows report or fix drift

This is important because tracked files may temporarily contradict intent during migration windows, but config still needs to remain the policy anchor.

## Migration model

### Supported direction: `local -> distributable`

This is the primary migration path and should be treated as the normative upgrade flow.

Effects:

1. update declared config strategy to `distributable`
2. update managed `.gitignore` block to stop ignoring snapshot outputs
3. create or update managed `.gitattributes` block
4. warn if snapshot outputs are currently absent, because the repository may need `spine build` or `spine publish`
5. optionally surface a reminder that newly unignored files may appear in `git status`

User-facing guidance should make the transition explicit:

- the repository is moving from local-only snapshot handling to commit-capable snapshot handling
- no user-owned Git file content outside managed blocks will be overwritten

### Supported direction: `distributable -> local`

This path is allowed, but should be presented as a downgrade with consequences.

Effects:

1. update declared config strategy to `local`
2. update managed `.gitignore` block to ignore snapshot outputs
3. remove ArchSpine-managed `.gitattributes` block
4. warn if snapshot outputs are already tracked in Git, because changing ignore rules does not untrack existing files
5. provide explicit next-step guidance for maintainers who intend to stop distributing snapshots

Important rule:

ArchSpine should not automatically remove tracked files from Git history or index during strategy downgrade.

That action is too destructive to perform implicitly.

Instead, the CLI should explain the state clearly, for example:

- the repository now declares `local`
- tracked snapshot files may still exist
- maintainers must decide whether to keep them, untrack them, or migrate history separately

## What migration must not do

Migration should not:

1. rewrite user-owned sections of `.gitignore` or `.gitattributes`
2. automatically delete snapshot files
3. automatically run `git rm --cached`
4. silently flip strategy as a side effect of `publish`
5. overload `remove` with strategy-switch behavior

## Command shape

Recommended lifecycle command:

```bash
spine repo strategy set <local|distributable>
```

This command should eventually become the canonical post-init strategy path.

Why this shape is preferable:

- it makes lifecycle intent explicit
- it avoids overloading `init`
- it leaves room for future repository policy subcommands

### Transitional allowance

Until the lifecycle command exists, re-running:

```bash
spine init --artifact-strategy <mode>
```

remains an acceptable repair and migration path.

But docs should describe it as transitional, not the ideal long-term contract.

## Validation and repair relationship

Strategy migration should connect cleanly to the existing and planned validation surface.

Expected command roles:

- `spine init`: bootstrap
- `spine repo strategy set`: intentional migration
- `spine repo check`: detect drift
- future repair command: reconcile managed files back to declared strategy

This separation prevents one command from becoming another god entrypoint.

## Publish relationship

`spine publish` must remain strategy-aware, but it should not become the migration command.

Required behavior:

1. in `distributable`, publish proceeds normally
2. in `local`, publish warns that repository intent and distribution behavior are misaligned
3. publish should point to the migration path when team distribution becomes the actual goal

Recommended user guidance:

- short warning in CLI output
- next step points to `spine repo strategy set distributable`
- transitional fallback may mention `spine init --artifact-strategy distributable`

## Phased execution plan

### Phase 1: contract hardening

Deliverables:

- this migration design
- docs language aligned around bootstrap vs migration
- current `init` migration behavior treated as supported but transitional

### Phase 2: lifecycle command

Deliverables:

- add `spine repo strategy set <mode>`
- centralize strategy update logic outside `init`
- preserve managed block behavior

### Phase 3: drift and repair

Deliverables:

- strengthen `spine repo check`
- add a repair path that reconciles managed files to config
- improve downgrade warnings for already tracked snapshot files

### Phase 4: team/commercial enablement

Deliverables:

- CI-safe validation surface
- stronger publish summaries
- future team preset integration

## Acceptance criteria

This design is successful when:

1. strategy changes are modeled as repository lifecycle operations, not just re-init side effects
2. users can understand the difference between `local` and `distributable` after initialization
3. downgrade flows warn clearly without destructive Git actions
4. future team/commercial features can build on a stable repository strategy contract

## Summary

The key product move is simple:

`init` should choose the first strategy, but it should not remain the long-term home for strategy lifecycle management.

Artifact strategy is now important enough to deserve its own repository-level command path.
