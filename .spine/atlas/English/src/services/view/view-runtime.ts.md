<!-- spine-content-hash:ba17f44b7a553811de7714023e42b5e74f04e0eda993a4cff8fa1c0265ddb957 -->
# ArchSpine – View Layer Configuration Resolution

This module provides a pure, typed configuration resolution layer for the experimental view system and enabled views within ArchSpine. It is responsible for reading, normalizing, and validating view-related settings from project configuration, environment variables, or defaults, without any runtime orchestration or UI interaction.

## Role

Configuration resolution module for the experimental view layer and enabled views.

## Key Responsibilities

- Defines TypeScript interfaces `ResolvedExperimentalViewLayer` and `ResolvedEnabledViews` to represent the resolved configuration shape.
- Resolves the experimental view layer flag by checking project config, environment variable, or falling back to a default.
- Resolves the list of enabled view IDs from project config or default, normalizing each ID and filtering out any unknown entries.

## Notable Invariants

- This module is **pure configuration resolution** with no side effects.
- It depends on `infra/config` for project configuration and `view-registry` for view ID normalization.
- It does **not** perform runtime orchestration, rendering, or persistence.

## Negative Scope (Out of Scope)

- Runtime orchestration of view services or engines.
- Direct interaction with view rendering or UI components.
- Persistence or storage of configuration data.

## Public Surface

- `ResolvedExperimentalViewLayer`
- `ResolvedEnabledViews`

These are the primary exported interfaces that consumers use to access resolved view configuration.