---
outline: deep
---

# Configuration Reference

Complete schema for `.spine/config.json` and the configuration loading pipeline.

**Source:** `src/types/protocol/config.ts` (types), `src/infra/config/loader.ts` (loading), `src/infra/config/defaults.ts` (defaults), `src/core/config-schema.ts` (validation), `src/infra/llm/runtime.ts` (LLM resolution).

## File Location

| Scope          | Path                              |
| -------------- | --------------------------------- |
| Project config | `<repo-root>/.spine/config.json`  |
| Global config  | `~/.config/archspine/config.json` |

## Loading Pipeline

The config loading pipeline runs in this order:

1. **Read file** from `.spine/config.json` via `loadConfigData()` in `src/infra/config/loader.ts`
2. **Size check**: File must not exceed 1 MB (`MAX_CONFIG_SIZE_BYTES = 1048576`). If exceeded, the default config is returned with a warning.
3. **JSON parse**: Invalid JSON causes a fallback to defaults with a warning.
4. **Validate** against schema via `validateConfigPayload()` in `src/core/config-schema.ts`. Validation errors cause a fallback to defaults.
5. **Deep merge** with defaults via `mergeConfigWithDefaults()` in `src/infra/config/loader.ts`. Objects are merged recursively; arrays are replaced entirely by the override.

## Complete Schema

```typescript
interface SpineConfig {
  schemaVersion: '1.0.0';
  project: {
    name: string;
  };
  llm: {
    provider?: string;
    model?: string;
    baseURL?: string;
  };
  mcp?: {
    contextMode?: 'off' | 'project-first' | 'search-first';
  };
  hooks?: {
    preCommit?: boolean;
    syncMode?: 'hook';
  };
  artifacts?: {
    strategy?: 'local' | 'distributable';
    viewLayer?: boolean;
    enabledViews?: string[];
  };
  initState?: {
    artifactStrategy?: 'local' | 'distributable';
    agentInstructionsFile?: string;
    agentInstructionsCreatedByArchSpine?: boolean;
    gitIgnoreManaged?: boolean;
    gitIgnoreCreatedByArchSpine?: boolean;
    gitAttributesManaged?: boolean;
    gitAttributesCreatedByArchSpine?: boolean;
    spineIgnoreManaged?: boolean;
    spineIgnoreCreatedByArchSpine?: boolean;
    searchIgnoreManaged?: boolean;
    searchIgnoreCreatedByArchSpine?: boolean;
    injectedPackageScripts?: string[];
  };
  scanPolicy?: PartialScanPolicy;
}
```

Source: `src/types/protocol/config.ts`.

---

## Field Reference

### `schemaVersion`

| Property       | Value                                      |
| -------------- | ------------------------------------------ |
| **Type**       | `"1.0.0"` (string literal)                 |
| **Required**   | Yes                                        |
| **Default**    | `"1.0.0"`                                  |
| **Validation** | Must equal `CURRENT_CONFIG_SCHEMA_VERSION` |

### `project`

| Property     | Value  |
| ------------ | ------ |
| **Type**     | object |
| **Required** | Yes    |

#### `project.name`

| Property       | Value                      |
| -------------- | -------------------------- |
| **Type**       | `string`                   |
| **Required**   | Yes                        |
| **Default**    | `"unnamed-project"`        |
| **Validation** | Must be a non-empty string |

### `llm`

| Property     | Value  |
| ------------ | ------ |
| **Type**     | object |
| **Required** | Yes    |

#### `llm.provider`

| Property        | Value                                                         |
| --------------- | ------------------------------------------------------------- |
| **Type**        | `string` (optional)                                           |
| **Required**    | No                                                            |
| **Default**     | unset                                                         |
| **Validation**  | Must be a string if present                                   |
| **Description** | LLM provider identifier (e.g., `openai`, `anthropic`, `mock`) |

#### `llm.model`

| Property        | Value                                                         |
| --------------- | ------------------------------------------------------------- |
| **Type**        | `string` (optional)                                           |
| **Required**    | No                                                            |
| **Default**     | unset                                                         |
| **Validation**  | Must be a string if present                                   |
| **Description** | Model identifier (e.g., `gpt-4o`, `claude-sonnet-4-20250514`) |

#### `llm.baseURL`

| Property        | Value                                                 |
| --------------- | ----------------------------------------------------- |
| **Type**        | `string` (optional)                                   |
| **Required**    | No                                                    |
| **Default**     | unset                                                 |
| **Validation**  | Must be a string if present                           |
| **Description** | Custom API base URL for provider-compatible endpoints |

---

### `mcp`

| Property     | Value             |
| ------------ | ----------------- |
| **Type**     | object (optional) |
| **Required** | No                |

#### `mcp.contextMode`

| Property        | Value                                                                                                               |
| --------------- | ------------------------------------------------------------------------------------------------------------------- |
| **Type**        | `"off"` \| `"project-first"` \| `"search-first"`                                                                    |
| **Required**    | No                                                                                                                  |
| **Default**     | `"off"`                                                                                                             |
| **Validation**  | Must be one of the three allowed values                                                                             |
| **Description** | Controls whether MCP resources require priming before access. See [MCP Context Gate](./mcp-tools#mcp-context-gate). |

---

### `hooks`

| Property     | Value             |
| ------------ | ----------------- |
| **Type**     | object (optional) |
| **Required** | No                |

#### `hooks.preCommit`

| Property        | Value                                      |
| --------------- | ------------------------------------------ |
| **Type**        | `boolean` (optional)                       |
| **Required**    | No                                         |
| **Default**     | `false`                                    |
| **Validation**  | Must be a boolean if present               |
| **Description** | Enable pre-commit Git hook synchronization |

#### `hooks.syncMode`

| Property        | Value                                            |
| --------------- | ------------------------------------------------ |
| **Type**        | `"hook"` (optional)                              |
| **Required**    | No                                               |
| **Default**     | `"hook"`                                         |
| **Validation**  | Must be `"hook"` if present (only allowed value) |
| **Description** | Controls hook sync behavior                      |

---

### `artifacts`

| Property     | Value             |
| ------------ | ----------------- |
| **Type**     | object (optional) |
| **Required** | No                |

#### `artifacts.strategy`

| Property        | Value                                                                    |
| --------------- | ------------------------------------------------------------------------ |
| **Type**        | `"local"` \| `"distributable"` (optional)                                |
| **Required**    | No                                                                       |
| **Default**     | unset                                                                    |
| **Validation**  | Must be one of the two allowed values if present                         |
| **Description** | Controls whether `.spine/` artifacts are tracked in Git for distribution |

#### `artifacts.viewLayer`

| Property        | Value                                                              |
| --------------- | ------------------------------------------------------------------ |
| **Type**        | `boolean` (optional)                                               |
| **Required**    | No                                                                 |
| **Default**     | unset                                                              |
| **Validation**  | Must be a boolean if present                                       |
| **Description** | Enable/disable the view layer (`.spine/view/` artifact generation) |

#### `artifacts.enabledViews`

| Property        | Value                                                                                                                                                                                              |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Type**        | `string[]` (optional)                                                                                                                                                                              |
| **Required**    | No                                                                                                                                                                                                 |
| **Default**     | unset (all defaults enabled)                                                                                                                                                                       |
| **Validation**  | Must be an array of strings if present                                                                                                                                                             |
| **Description** | Explicit list of view IDs to enable. Valid values: `public-surface`, `risk-hotspots`, `architecture-diagram`, `project-health`, `agent-briefing`, `change-impact`, `module-contract`, `code-wiki`. |

---

### `initState`

| Property        | Value                                                                     |
| --------------- | ------------------------------------------------------------------------- |
| **Type**        | object (optional)                                                         |
| **Required**    | No                                                                        |
| **Description** | Tracks init-time decisions. Written by `spine init`, not edited manually. |

#### `initState` fields

| Field                                 | Type                           | Description                                        |
| ------------------------------------- | ------------------------------ | -------------------------------------------------- |
| `artifactStrategy`                    | `"local"` \| `"distributable"` | Artifact strategy chosen at init                   |
| `agentInstructionsFile`               | `string`                       | Agent file chosen (e.g., `CLAUDE.md`, `AGENTS.md`) |
| `agentInstructionsCreatedByArchSpine` | `boolean`                      | Whether ArchSpine created the agent file           |
| `gitIgnoreManaged`                    | `boolean`                      | Whether `.gitignore` entries are managed           |
| `gitIgnoreCreatedByArchSpine`         | `boolean`                      | Whether ArchSpine created `.gitignore`             |
| `gitAttributesManaged`                | `boolean`                      | Whether `.gitattributes` entries are managed       |
| `gitAttributesCreatedByArchSpine`     | `boolean`                      | Whether ArchSpine created `.gitattributes`         |
| `spineIgnoreManaged`                  | `boolean`                      | Whether `.spineignore` is managed                  |
| `spineIgnoreCreatedByArchSpine`       | `boolean`                      | Whether ArchSpine created `.spineignore`           |
| `searchIgnoreManaged`                 | `boolean`                      | Whether search ignore is managed                   |
| `searchIgnoreCreatedByArchSpine`      | `boolean`                      | Whether ArchSpine created search ignore            |
| `injectedPackageScripts`              | `string[]`                     | Package scripts injected by init                   |

---

### `scanPolicy`

| Property     | Value                          |
| ------------ | ------------------------------ |
| **Type**     | `PartialScanPolicy` (optional) |
| **Required** | No                             |

**TypeScript interface** (source: `src/core/scan-policy.ts`):

```typescript
interface ScanPolicy {
  fileSource: 'git-tracked' | 'git-tracked-plus-untracked' | 'filesystem';
  ignoreChain: {
    inheritGitIgnore: boolean;
    projectIgnore: string;
    localIgnore: string;
  };
  protocolExclusions: string[]; // readonly
  protocolInclusions: string[]; // readonly
}

interface PartialScanPolicy {
  fileSource?: FileSource;
  ignoreChain?: Partial<ScanPolicy['ignoreChain']>;
  protocolExclusions?: string[];
  protocolInclusions?: string[];
}
```

#### `scanPolicy.fileSource`

| Property        | Value                                                               |
| --------------- | ------------------------------------------------------------------- |
| **Type**        | `"git-tracked"` \| `"git-tracked-plus-untracked"` \| `"filesystem"` |
| **Required**    | No                                                                  |
| **Default**     | `"git-tracked"`                                                     |
| **Validation**  | Must be one of the three allowed values if present                  |
| **Description** | Controls which files are eligible for scanning                      |

#### `scanPolicy.ignoreChain`

| Property     | Value             |
| ------------ | ----------------- |
| **Type**     | object (optional) |
| **Required** | No                |

| Field              | Type      | Default                | Description                           |
| ------------------ | --------- | ---------------------- | ------------------------------------- |
| `inheritGitIgnore` | `boolean` | `true`                 | Whether to inherit `.gitignore` rules |
| `projectIgnore`    | `string`  | `".spineignore"`       | Path to project-level ignore file     |
| `localIgnore`      | `string`  | `".spineignore.local"` | Path to local ignore file             |

#### `scanPolicy.protocolExclusions`

| Property        | Value                                                                                         |
| --------------- | --------------------------------------------------------------------------------------------- |
| **Type**        | `string[]` (optional)                                                                         |
| **Required**    | No                                                                                            |
| **Default**     | `[".spine/", "**/.spine/", "package-lock.json", "pnpm-lock.yaml", "yarn.lock", "bun.lockb"]`  |
| **Description** | Glob patterns for files excluded from scanning. `.spine/` is a protocol-level hard exclusion. |

#### `scanPolicy.protocolInclusions`

| Property        | Value                                                                                                                                                                               |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Type**        | `string[]` (optional)                                                                                                                                                               |
| **Required**    | No                                                                                                                                                                                  |
| **Default**     | `[".spine/rules/", ".spine/config.json"]`                                                                                                                                           |
| **Description** | Glob patterns for files always included in scanning, even within excluded directories. RuleEngine and config readers access these directly via `fs`, not through the scan pipeline. |

---

## LLM Settings Resolution

LLM settings are resolved with the following priority order (source: `src/infra/llm/runtime.ts`, `resolveLLMSettings()`):

### Provider, Model, Base URL

| Priority    | Source         | Description                                                                      |
| ----------- | -------------- | -------------------------------------------------------------------------------- |
| 1 (highest) | Project config | `.spine/config.json` → `llm.provider` / `llm.model` / `llm.baseURL`              |
| 2           | Global config  | `~/.config/archspine/config.json` → `llm.provider` / `llm.model` / `llm.baseURL` |
| 3 (lowest)  | Environment    | `SPINE_PROVIDER` / `SPINE_MODEL` / `SPINE_BASE_URL`                              |

If no value is found at any level, the setting is `unset`.

### API Key

| Priority    | Source                   | Description                                                       |
| ----------- | ------------------------ | ----------------------------------------------------------------- |
| 1 (highest) | Project keychain/secrets | macOS Keychain / Linux secret-tool / Windows DPAPI encrypted file |
| 2           | Global keychain/secrets  | Global credential store                                           |
| 3 (lowest)  | Environment              | `SPINE_API_KEY`                                                   |

### Generation Strategy

| Priority    | Source           | Description                      |
| ----------- | ---------------- | -------------------------------- |
| 1 (highest) | Runtime override | Passed via `LLMRuntimeOverrides` |
| 2 (lowest)  | Default          | `"together"`                     |

If a runtime override is not provided, the default generation strategy is `"together"`. For incremental sync (non-publish, non-full), the strategy is overridden to `"json-only"`.

---

## Credential Storage Backends

API keys are stored using platform-native secure storage when available (source: `src/infra/credentials/backend.ts`).

| Platform | Backend                  | Mechanism                                                                                           |
| -------- | ------------------------ | --------------------------------------------------------------------------------------------------- |
| macOS    | `MacOSKeychainBackend`   | `security` CLI + Swift `SecItemAdd` via Security framework                                          |
| Linux    | `LinuxSecretToolBackend` | `secret-tool` from libsecret                                                                        |
| Windows  | `WindowsDPAPIBackend`    | PowerShell + DPAPI (Data Protection API), encrypted file in `%LOCALAPPDATA%/ArchSpine/Credentials/` |

### Credential Store Identifiers

| Scope   | `secretName`                                          |
| ------- | ----------------------------------------------------- |
| Project | `io.archspine.llm.project` (account = repo root path) |
| Global  | `io.archspine.llm.global` (account = hashed base dir) |

### Fallback

If no platform backend is available, the `CredentialBackend` is `undefined` and API keys cannot be stored persistently. A warning is printed to the console.

---

## Environment Variables

| Variable            | Purpose                                            | Used In                                        |
| ------------------- | -------------------------------------------------- | ---------------------------------------------- |
| `SPINE_PROVIDER`    | Fallback LLM provider                              | `src/infra/llm/runtime.ts`                     |
| `SPINE_MODEL`       | Fallback LLM model                                 | `src/infra/llm/runtime.ts`                     |
| `SPINE_BASE_URL`    | Fallback LLM base URL                              | `src/infra/llm/runtime.ts`                     |
| `SPINE_API_KEY`     | LLM API key                                        | `src/infra/llm/runtime.ts`                     |
| `SPINE_PRECOMMIT`   | Override pre-commit sync toggle (`true` / `false`) | CLI help text                                  |
| `SPINE_LLM_TIMEOUT` | LLM request timeout in milliseconds                | `src/infra/llm/runtime.ts` (parsed as integer) |

---

## Supported `config get/set` Keys

These dotted-path keys can be used with `spine config get <key>` and `spine config set <key> <value>` (source: `src/cli/commands/config.ts`):

| Key                      | Type     | Set Example                                                                        |
| ------------------------ | -------- | ---------------------------------------------------------------------------------- |
| `llm.provider`           | string   | `spine config set llm.provider openai`                                             |
| `llm.model`              | string   | `spine config set llm.model gpt-4o`                                                |
| `llm.baseURL`            | string   | `spine config set llm.baseURL https://api.example.com`                             |
| `hooks.preCommit`        | boolean  | `spine config set hooks.preCommit true`                                            |
| `hooks.syncMode`         | string   | `spine config set hooks.syncMode hook`                                             |
| `artifacts.strategy`     | string   | `spine config set artifacts.strategy distributable`                                |
| `artifacts.viewLayer`    | boolean  | `spine config set artifacts.viewLayer true`                                        |
| `artifacts.enabledViews` | string[] | `spine config set artifacts.enabledViews "[\"public-surface\",\"risk-hotspots\"]"` |

---

## Default Config (Fully Resolved)

When no `.spine/config.json` exists, the effective configuration is (source: `src/infra/config/defaults.ts`):

```json
{
  "schemaVersion": "1.0.0",
  "project": {
    "name": "unnamed-project"
  },
  "llm": {},
  "mcp": {
    "contextMode": "off"
  },
  "hooks": {
    "preCommit": false,
    "syncMode": "hook"
  },
  "artifacts": {},
  "scanPolicy": {
    "fileSource": "git-tracked",
    "ignoreChain": {
      "inheritGitIgnore": true,
      "projectIgnore": ".spineignore",
      "localIgnore": ".spineignore.local"
    },
    "protocolExclusions": [
      ".spine/",
      "**/.spine/",
      "package-lock.json",
      "pnpm-lock.yaml",
      "yarn.lock",
      "bun.lockb"
    ],
    "protocolInclusions": [".spine/rules/", ".spine/config.json"]
  }
}
```

---

## Validation Rules

Config validation is performed by `validateSpineConfig()` in `src/core/config-schema.ts`:

| Field Path                                | Validation                                                                |
| ----------------------------------------- | ------------------------------------------------------------------------- |
| Root                                      | Must be a JSON object                                                     |
| `schemaVersion`                           | Must equal `CURRENT_CONFIG_SCHEMA_VERSION`                                |
| `project`                                 | Must be an object                                                         |
| `project.name`                            | Must be a non-empty string                                                |
| `llm`                                     | Must be an object                                                         |
| `llm.provider`                            | Must be a string                                                          |
| `llm.model`                               | Must be a string                                                          |
| `llm.baseURL`                             | Must be a string                                                          |
| `mcp`                                     | Must be an object                                                         |
| `mcp.contextMode`                         | Must be one of: `off`, `project-first`, `search-first`                    |
| `hooks`                                   | Must be an object                                                         |
| `hooks.preCommit`                         | Must be a boolean                                                         |
| `hooks.syncMode`                          | Must be one of: `hook`                                                    |
| `artifacts`                               | Must be an object                                                         |
| `artifacts.strategy`                      | Must be one of: `local`, `distributable`                                  |
| `artifacts.viewLayer`                     | Must be a boolean                                                         |
| `artifacts.enabledViews`                  | Must be an array of strings                                               |
| `initState`                               | Must be an object                                                         |
| `initState.artifactStrategy`              | Must be one of: `local`, `distributable`                                  |
| `initState.agentInstructionsFile`         | Must be a string                                                          |
| `initState.*CreatedByArchSpine`           | Must be a boolean                                                         |
| `initState.*Managed`                      | Must be a boolean                                                         |
| `initState.injectedPackageScripts`        | Must be an array of strings                                               |
| `scanPolicy`                              | Must be an object                                                         |
| `scanPolicy.fileSource`                   | Must be one of: `git-tracked`, `git-tracked-plus-untracked`, `filesystem` |
| `scanPolicy.ignoreChain`                  | Must be an object                                                         |
| `scanPolicy.ignoreChain.inheritGitIgnore` | Must be a boolean                                                         |
| `scanPolicy.ignoreChain.projectIgnore`    | Must be a string                                                          |
| `scanPolicy.ignoreChain.localIgnore`      | Must be a string                                                          |
| `scanPolicy.protocolExclusions`           | Must be an array of strings                                               |
| `scanPolicy.protocolInclusions`           | Must be an array of strings                                               |
