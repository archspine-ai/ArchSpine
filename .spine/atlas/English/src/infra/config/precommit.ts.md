<!-- spine-content-hash:8bc02a17858bd9e9c6f1997c4f5523987503a520f1f8c8aacede07388a0f7eec -->
# ArchSpine – `resolvePreCommitSetting` Configuration Resolution Utility

## Role
This module is a focused configuration resolution utility for the pre-commit setting. It determines the boolean value of the pre-commit flag by checking environment variables or accepting an explicit parameter.

## Key Responsibilities
- Resolves the pre-commit boolean setting by reading the environment variable specified by `PRE_COMMIT_ENV_VAR` using the `parseBooleanEnv` helper.
- Returns a structured `BooleanSettingResolution` object that contains the resolved value, the source (`'env'`), and the name of the environment variable used.
- Provides a fallback pattern: an explicit `preCommit` parameter can be supplied (the function signature implies this, even if the full fallback logic is not shown in the snippet).

## Notable Invariants & Negative Scope
- **Pure function**: This module has no side effects and depends only on environment utilities and type definitions.
- **Out of scope**: It does not orchestrate services, tasks, or engines; it does not provide infrastructure facades or low-level capabilities; and it does not handle runtime business logic beyond configuration resolution.

## Most Important Exported Behavior
- **`resolvePreCommitSetting`**: The single exported function that performs the resolution. It is the primary (and only) public surface of this module.