<!-- spine-content-hash:0b29a82af58e08dce738047947abb37345f3b6612b135a84b9798a6387d5098c -->
# ArchSpine Mirror System Configuration

## Role
This configuration file defines the core operational parameters for the ArchSpine mirror system project. It controls localization, the LLM provider, MCP context mode, hooks, artifacts, and file scanning policy.

## Key Responsibilities
- **Localization settings** for multi-language support
- **LLM provider** selection and configuration
- **MCP context mode** control
- **Pre-commit hook** and sync mode management
- **Artifact storage** configuration
- **File scanning policy** and ignore chain management

## Parameter Definitions
- **schemaVersion**: Defines the version of the configuration schema. Must be a valid semver string.
- **project.name**: The name of the project. Used for identification and logging.
- **project.locales**: List of supported locales for the project. At least one locale must be specified.
- **llm.provider**: Specifies the LLM provider to use. Currently set to 'mock' for testing.
- **mcp.contextMode**: Controls the MCP context mode. 'off' disables context injection.
- **hooks.preCommit**: Enables or disables the pre-commit hook. Currently set to false.
- **hooks.syncMode**: Defines the synchronization mode. 'hook' means sync is triggered by hooks.
- **artifacts**: Configuration for artifact storage. Currently empty.
- **scanPolicy.fileSource**: Defines the source of files to scan. 'git-tracked' means only files tracked by Git.
- **scanPolicy.ignoreChain.inheritGitIgnore**: Whether to inherit Git ignore rules. Set to true.
- **scanPolicy.ignoreChain.projectIgnore**: Path to the project-level ignore file.
- **scanPolicy.ignoreChain.localIgnore**: Path to the local ignore file.
- **scanPolicy.protocolExclusions**: List of path patterns to exclude from scanning.
- **scanPolicy.protocolInclusions**: List of path patterns to include in scanning.

## Notable Invariants
- `schemaVersion` must be a valid semver string
- `project.locales` must contain at least one locale
- `llm.provider` must be a supported provider identifier
- `scanPolicy.fileSource` must be one of the allowed sources
- `scanPolicy.ignoreChain.inheritGitIgnore` must be a boolean
- `protocolExclusions` and `protocolInclusions` must be arrays of path patterns

## Stability and Risks
This configuration is critical for system stability. Incorrect locale settings may cause localization failures. Disabling hooks may lead to inconsistent state. The mock LLM provider is for testing only and should not be used in production. The scan policy controls which files are processed; misconfiguration may cause security issues or data loss.

## Negative Scope
This configuration does not define runtime behavior, business logic, or data processing rules. It is purely a static configuration file that sets operational parameters for the mirror system.