# ArchSpine File Extension and Language Support Configuration

This configuration file controls which file extensions the ArchSpine system recognizes during scanning and indexing, and defines available programming languages for AST extraction and rule enforcement. The settings directly impact the scope of file processing and the accuracy of analysis.

## Key Parameters

- **`schemaVersion`**: Must be set to `1` for compatibility with the current processing pipeline. Changing this value may break reading of the configuration file.
- **`detectedExtensions`**: A list of file extensions that the system will scan and analyze. Currently includes `.gif`, `.json`, `.md`, `.ts`, `.yml`. Any file with an extension not in this list will be ignored. Adding or removing extensions alters the processing scope; missing expected extensions (e.g., `.tsx` for TypeScript React files) can lead to incomplete indexing.
- **`languages.typescript.extensions`**: The file extensions mapped to TypeScript language analysis. Currently only `.ts` is defined. If your project uses `.tsx` files, you must add that extension here to ensure they are processed under TypeScript rules.
- **`languages.typescript.status`**: Must be set to `"available"` for TypeScript analysis to be active. Any other value (e.g., `"disabled"`) will skip AST extraction and rule enforcement for TypeScript files.

## Stability and Operational Risks

- **Incomplete scanning**: If `detectedExtensions` does not include every file extension present in your repository, those files will be silently ignored. This can cause gaps in analysis and rule violations to go undetected.
- **Performance impact**: Adding many extensions (especially large binary files) can slow down scanning and indexing. Stick to well-known source code extensions.
- **Language analysis disabled**: Accidentally changing a language's `status` to anything other than `"available"` will disable its analysis entirely, potentially breaking architectural enforcement.
- **Runtime crashes**: Adding unsupported or malformed extensions may trigger errors in the scanner. Always verify that extensions correspond to valid file types in your project.

To maintain system stability, keep this configuration tightly aligned with your project's actual file types and language support requirements. Review changes carefully before deployment.