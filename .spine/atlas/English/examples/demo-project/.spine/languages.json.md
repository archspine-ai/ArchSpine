# ArchSpine Mirror Configuration Summary

## Overview
This configuration declares the file extensions recognized by the ArchSpine mirror system along with the programming languages it supports. It determines how files are indexed, processed, and which language-specific features are enabled.

## Parameter Definitions

- **`schemaVersion`** (integer, currently `1`): Defines the version of the configuration schema. Version 1 is the only valid version; any other value will cause parsing failures.
- **`detectedExtensions`** (array of strings): The list of file extensions the system actively monitors and indexes. Currently: `.gif`, `.json`, `.md`, `.ts`, `.yml`. Extensions not in this list will be ignored.
- **`languages`** (object): A map of programming languages with their associated extensions and availability status. This controls which language tooling and analysis features are activated.
  - **`languages.typescript`**:
    - **`extensions`** (array): File extensions registered for TypeScript — only `.ts`. This setting controls detection of TypeScript source files.
    - **`status`** (string): Set to `"available"` meaning TypeScript support is enabled. Changing it to `"unavailable"` would disable all TypeScript‑related features.

## Stability & Operational Risks

- **Extension accuracy**: An incomplete or incorrect `detectedExtensions` list may lead to files being missed during indexing or misclassified, causing downstream processing errors.
- **Language status mismatch**: If `status` is set incorrectly (e.g., `"available"` when no support is actually implemented), the system might attempt to use non‑existent tooling, leading to runtime failures. Conversely, setting it to `"unavailable"` when support is required will disable essential functionality.
- **Schema version lock**: The schema version is fixed at `1`. Do not change this value; any deviation will prevent the configuration from being parsed.

---