This directory, located at `examples/demo-project/.spine/runtime/checkpoints`, stores execution records of synchronization runs for the ArchSpine mirror system. Each checkpoint captures the full lifecycle and outcome of a sync command, including:

- Pipeline stage status and timing
- Processed file lists for traceability
- Metadata for resumption and hook behavior

The records are grouped by individual sync runs, enabling both human review of sync history and agent-based analysis of pipeline performance. Key implementation areas include checkpoint creation, stage monitoring, and resume-logic metadata. No subdirectories are defined; all records reside at this level as independent checkpoint files.