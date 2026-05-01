<!-- spine-content-hash:fc4f6b2a5a035c49d21d95acdac83aafb028abf747d83f1b65b77a216b4fdaf6 -->
# AggregationTask – Hierarchical Content Aggregation

## Role
Core pipeline task for hierarchical content aggregation across directories and projects.

## Key Responsibilities
- Collects directories requiring aggregation from tracked files via scanner state.
- Determines which directories need aggregation based on scanner state and aggregator engine.
- Identifies projects requiring aggregation via the aggregator engine.
- Organizes directories by depth for ordered hierarchical processing.

## Notable Invariants & Negative Scope
- Must operate within the SpineTask contract and use core task infrastructure.
- Must not take over CLI command parsing or unrelated service orchestration.
- Does **not** handle CLI command parsing or argument handling.
- Does **not** perform unrelated service orchestration beyond content aggregation.
- Does **not** perform direct file system writes or output formatting.

## Most Important Exported / Externally Visible Behavior
- **`AggregationTask`** class extending `SpineTask<CommitStageOutput, void>`
- **`name`** = `'Hierarchical Content Aggregation'`
- **`checkpointId`** = `'aggregation'`
- **`collectRecoverableDirs(ctx: TaskContext): string[]`** – public method for collecting directories that can be recovered during aggregation.