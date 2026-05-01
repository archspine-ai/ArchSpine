<!-- spine-content-hash:e91992edd56819659c6a888ddc610d4b89e2b4107b9eaaaebce435e97260d721 -->
# ViewIndexLoader — Infrastructure Module

## Role
Loads and caches indexed Spine units from the `.spine/index` directory for consumption by the view layer, particularly for architecture diagram generation.

## Key Responsibilities
- Recursively traverses the `.spine/index` directory to load and cache `SpineFolderUnit` and `SpineProjectUnit` JSON files.
- Validates each loaded JSON against SpineUnit type schemas using `isCompatibleIndexDocument` from `infra/index-reader`.
- Supplies indexed units to architecture diagram generation, capping folder count at `MAX_ARCH_DIAGRAM_FOLDERS` to maintain diagram clarity.
- Reports malformed or incompatible JSON files via `RuntimeIO` using `reportIndexReadIssueOnce`.

## Notable Invariants & Negative Scope
- **Depends on** `infra/index-reader.js` for document reading and schema validation.
- **Uses** `RuntimeIO` for optional warning output.
- **Caches** loaded units to avoid repeated filesystem reads.
- **Does not** render architecture diagrams or other visualizations.
- **Does not** write or update index files.
- **Does not** orchestrate view-specific business logic beyond data loading.

## Public Surface
- **Class `ViewIndexLoader`** with constructor and `getIndexedUnits` method.

## Rule Violation
- **Warning:** Module is view-specific (loads units for architecture diagrams) but resides under `src/infra/` instead of `src/services/view/` as required by the `service-runtime-boundary` rule.