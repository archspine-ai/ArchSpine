<!-- spine-content-hash:ce2a624f89a580296de0a86a672046186ba0b6486fb21e193a6d5c1a70e9f6c1 -->
# ArchSpine – Rule Loader Utility

## Role
Infrastructure utility for loading and parsing Spine rule documents from the filesystem.

## Key Responsibilities
- Reads rule files from disk using synchronous file system operations.
- Parses rule file content using gray-matter frontmatter parsing.
- Normalizes rule severity values to a standard lowercase format.
- Generates URL-friendly slugs from rule identifiers for consistent referencing.

## Out of Scope
- Rule validation or enforcement logic.
- Rule execution or application logic.
- Asynchronous file system operations.
- Writing or modifying rule files on disk.

## Invariants
- Must only expose stable low-level file reading and parsing capabilities.
- Must not absorb service/task/engine orchestration concerns.
- Callers should prefer this public facade over reaching into deep private implementation paths.

## Public Surface
- `slugifyRuleId` – Converts a rule identifier into a URL-friendly slug.
- `normalizeSeverity` – Normalizes severity strings to lowercase.
- `LoadedRuleFile` – Interface representing a parsed rule document.

## Architectural Intent
Provide a stable, low-level infrastructure facade for loading and parsing Spine rule documents from the filesystem, ensuring consistent rule document structure and severity normalization. No recent changes detected beyond general pipeline fixes; the file remains a stable infrastructure utility.